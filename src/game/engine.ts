/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterRig, CharacterAppearance, DEFAULT_PLAYER_APPEARANCE } from './character/characterModel';
import { NPCManager, ActiveNPC } from './character/npcManager';
import { WorldTerrain } from './world/terrain';
import { VehicleManager, ActiveVehicle } from './vehicles/vehicleManager';
import { WeatherManager } from './environment/weatherManager';
import { QuestManager } from './quests/questManager';
import { CameraController } from './camera/cameraController';
import { InputManager } from './controls/inputManager';
import { soundManager } from './audio/soundManager';
import { MultiplayerManager } from './multiplayer/multiplayerManager';
import { GameSettings, SavedGameState } from './types';

export interface GameEngineCallbacks {
  onInteractionPrompt?: (prompt: string | null) => void;
  onOpenDialogue?: (npc: ActiveNPC) => void;
  onNotification?: (msg: string, title?: string) => void;
  onStatsUpdated?: (stats: SavedGameState['stats']) => void;
  onVehicleStateChanged?: (vehicle: ActiveVehicle | null) => void;
  onTimeUpdated?: (timeOfDay: number) => void;
  onFPSUpdated?: (fps: number) => void;
  onMultiplayerConnectionChanged?: (connected: boolean, playerCount: number) => void;
  onMultiplayerChatReceived?: (sender: string, text: string) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Subsystems
  public terrain: WorldTerrain;
  public playerRig: CharacterRig;
  public npcManager: NPCManager;
  public vehicleManager: VehicleManager;
  public weatherManager: WeatherManager;
  public questManager: QuestManager;
  public cameraController: CameraController;
  public inputManager: InputManager;
  public multiplayerManager: MultiplayerManager;

  // Player Physics & Locomotion State
  public playerVelocity = new THREE.Vector3();
  public playerRotation = 0;
  public isAirborne = false;
  public verticalSpeed = 0;
  public isDriving = false;
  public playerStance: 'stand' | 'crouch' | 'prone' | 'swim' = 'stand';
  public isSwimming = false;

  // Settings & Loop
  public settings: GameSettings = {
    quality: 'high',
    masterVolume: 0.8,
    sfxVolume: 0.9,
    timeSpeed: 0.05,
    invertY: false,
    cameraSensitivity: 1.0,
    shadows: true,
    weather: 'clear',
  };

  public isSoftwareGl = false;
  public isRunning = false;
  public isPaused = false;
  private frameId = 0;
  private lastTime = 0;
  private fpsFrames = 0;
  private fpsTimer = 0;

  // Callbacks to React HUD
  public callbacks: GameEngineCallbacks = {};

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks = {}) {
    this.container = container;
    this.callbacks = callbacks;

    // Detect Software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1.0 : Math.min(window.devicePixelRatio, 2.0));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.settings.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 2. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.2,
      750,
    );

    // Procedural Studio Environment Reflection
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {}

    // 3. Subsystem Initialization
    this.terrain = new WorldTerrain(this.scene);
    this.weatherManager = new WeatherManager(this.scene);
    this.questManager = new QuestManager();

    // Hook quest notifications to React
    this.questManager.onNotification = (msg, title) => {
      this.callbacks.onNotification?.(msg, title);
    };

    // Player 3D Rig (Spawns in Dhanmondi City center at [6, 0, 12])
    let initialAppearance: CharacterAppearance = DEFAULT_PLAYER_APPEARANCE;
    try {
      const saved = localStorage.getItem('dream_player_appearance');
      if (saved) initialAppearance = JSON.parse(saved);
    } catch {}
    this.playerRig = new CharacterRig(initialAppearance);
    const spawnY = this.terrain.getTerrainHeight(6, 12);
    this.playerRig.group.position.set(6, spawnY, 12);
    this.scene.add(this.playerRig.group);

    // NPCs & Vehicles
    const heightFunc = (x: number, z: number, y?: number) => this.terrain.getTerrainHeight(x, z, y);
    this.npcManager = new NPCManager(this.scene, heightFunc);
    this.vehicleManager = new VehicleManager(this.scene, heightFunc);

    // Controllers
    this.cameraController = new CameraController(this.camera);
    this.inputManager = new InputManager(this.renderer.domElement);

    // Real-Time Online Multiplayer Manager
    this.multiplayerManager = new MultiplayerManager(this.scene);
    this.multiplayerManager.onConnectionChanged = (connected, count) => {
      this.callbacks.onMultiplayerConnectionChanged?.(connected, count);
    };
    this.multiplayerManager.onChatMessage = (sender, text) => {
      this.callbacks.onMultiplayerChatReceived?.(sender, text);
    };
    this.multiplayerManager.onPlayerJoined = (name) => {
      this.callbacks.onNotification?.(`${name} joined the online world!`, 'ONLINE PLAYER');
    };
    this.multiplayerManager.onPlayerLeft = (name) => {
      this.callbacks.onNotification?.(`${name} left the room`, 'ONLINE');
    };

    // Window Resize Handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Load saved game if exists
    this.loadSavedGame();
  }

  public handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.tick = this.tick.bind(this);
    this.frameId = requestAnimationFrame(this.tick);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush?.();
    const poll = () => {
      const state = sync && gl.getSyncParameter?.(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync?.(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick(now: number) {
    if (!this.isRunning) return;

    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const delta = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

    // Measure FPS
    this.fpsFrames++;
    this.fpsTimer += delta;
    if (this.fpsTimer >= 1.0) {
      this.callbacks.onFPSUpdated?.(Math.round(this.fpsFrames / this.fpsTimer));
      this.fpsFrames = 0;
      this.fpsTimer = 0;
    }

    if (!this.isPaused) {
      this.update(delta);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(() => this.tick(performance.now()));
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  /**
   * Main Simulation Step
   */
  public update(delta: number) {
    const input = this.inputManager.pollInput();
    const heightFunc = (x: number, z: number) => this.terrain.getTerrainHeight(x, z);

    // 1. Camera Orbit Rotation from Mouse/Touch
    if (input.cameraRotateX !== 0 || input.cameraRotateY !== 0) {
      this.cameraController.rotate(
        input.cameraRotateX * this.settings.cameraSensitivity,
        input.cameraRotateY * this.settings.cameraSensitivity * (this.settings.invertY ? -1 : 1),
      );
    }

    // 2. Player or Vehicle Locomotion
    const playerPos = this.playerRig.group.position;

    if (this.isDriving && this.vehicleManager.activePlayerVehicle) {
      // --- DRIVING MODE ---
      const activeVeh = this.vehicleManager.activePlayerVehicle;
      const throttle = input.moveForward;
      const steer = -input.moveRight;
      const handbrake = input.jump;

      this.vehicleManager.applyDriveInput(delta, throttle, steer, handbrake);

      // Keep player seated inside vehicle aligned with vehicle rotation
      const rotatedSeatOffset = activeVeh.driverSeatOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), activeVeh.group.rotation.y);
      playerPos.copy(activeVeh.group.position).add(rotatedSeatOffset);
      this.playerRig.group.rotation.y = activeVeh.group.rotation.y;
      this.playerRig.updateAnimation(delta, 0, false, true);

      // Camera chases vehicle
      this.cameraController.update(
        delta,
        activeVeh.group.position,
        true,
        activeVeh.group.rotation.y,
        heightFunc,
      );

      // Exit Vehicle Check [F]
      if (input.enterVehicle) {
        const exitPos = this.vehicleManager.exitVehicle();
        this.isDriving = false;
        playerPos.copy(exitPos);
        playerPos.y = this.terrain.getTerrainHeight(playerPos.x, playerPos.z, playerPos.y);
        this.callbacks.onVehicleStateChanged?.(null);
        this.callbacks.onNotification?.('Exited Vehicle', 'On Foot');
      }
    } else {
      // --- ON-FOOT MODE ---
      // Camera-relative movement vector
      const camYaw = this.cameraController.yaw;
      const fwdVector = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      const rtVector = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

      const moveDir = new THREE.Vector3()
        .addScaledVector(fwdVector, input.moveForward)
        .addScaledVector(rtVector, input.moveRight);

      const hasMoveInput = moveDir.lengthSq() > 0.01;
      if (hasMoveInput) {
        moveDir.normalize();
        // Turn player towards movement direction
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        this.playerRotation = THREE.MathUtils.damp(this.playerRotation, targetRot, 14, delta);
      }
      this.playerRig.group.rotation.y = this.playerRotation;

      // 1. Water & Swimming State Detection in River Padma
      const inWater = this.terrain.isWater(playerPos.x, playerPos.z, playerPos.y);
      const waterDepth = inWater ? this.terrain.getWaterDepth(playerPos.x, playerPos.z, playerPos.y) : 0;
      const bedY = this.terrain.getGroundElevation(playerPos.x, playerPos.z);

      if (inWater && (waterDepth > 0.65 || playerPos.y <= -0.4)) {
        if (!this.isSwimming) {
          this.isSwimming = true;
          this.playerStance = 'swim';
          this.isAirborne = false;
          this.verticalSpeed = 0;
          this.callbacks.onNotification?.('Swimming in Padma River', 'WATER');
        }
      } else if (this.isSwimming && (!inWater || bedY >= -0.48)) {
        // Transition from water onto riverbank shore
        this.isSwimming = false;
        this.playerStance = 'stand';
        playerPos.y = Math.max(bedY, 0.0);
        this.callbacks.onNotification?.('Exited River onto Shore', 'ON LAND');
      }

      // 2. Posture & Stance Transitions (Crouch, Prone, Stand)
      if (!this.isSwimming) {
        if (input.crouch) {
          this.playerStance = this.playerStance === 'crouch' ? 'stand' : 'crouch';
        } else if (input.prone) {
          this.playerStance = this.playerStance === 'prone' ? 'stand' : 'prone';
        }

        if (input.jump) {
          if (this.playerStance === 'crouch' || this.playerStance === 'prone') {
            this.playerStance = 'stand';
          } else if (!this.isAirborne) {
            this.verticalSpeed = 7.5;
            this.isAirborne = true;
            soundManager.playJump();
          }
        }
      }

      // 3. Stance-Specific Speed & Stamina Scaling
      let baseSpeed = 4.8;
      let animSpeed = 0.65;
      const stats = this.questManager.playerStats;

      if (this.isSwimming) {
        if (input.sprint && stats.stamina > 5) {
          baseSpeed = 5.2;
          animSpeed = 1.0;
          stats.stamina = Math.max(0, stats.stamina - delta * 8);
        } else {
          baseSpeed = 3.2;
          animSpeed = 0.65;
          stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 3.5);
        }
      } else if (this.playerStance === 'prone') {
        baseSpeed = 1.3;
        animSpeed = 0.4;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 5);
      } else if (this.playerStance === 'crouch') {
        baseSpeed = 2.4;
        animSpeed = 0.5;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 5);
      } else {
        // Standard Standing Walk / Run / Sprint
        if (input.sprint && stats.stamina > 5) {
          baseSpeed = 8.5;
          animSpeed = 1.0;
          stats.stamina = Math.max(0, stats.stamina - delta * 6);
        } else if (hasMoveInput) {
          baseSpeed = 4.8;
          animSpeed = 0.65;
          stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 4);
        } else {
          animSpeed = 0.0;
          stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 8);
        }
      }

      // Acceleration and friction
      if (hasMoveInput) {
        this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, moveDir.x * baseSpeed, 12, delta);
        this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, moveDir.z * baseSpeed, 12, delta);
      } else {
        this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, 16, delta);
        this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, 16, delta);
      }

      // 4. Gravity, Buoyancy & Vertical Placement
      if (this.isSwimming) {
        // Buoyancy keeps character floating at water line (-0.45)
        playerPos.y = THREE.MathUtils.damp(playerPos.y, -0.45, 10, delta);
        this.verticalSpeed = 0;
        this.isAirborne = false;
      } else {
        // Ground height (passes playerPos.y to distinguish flyover overpass from lower road)
        const groundY = this.terrain.getTerrainHeight(playerPos.x, playerPos.z, playerPos.y);

        if (this.isAirborne) {
          this.verticalSpeed -= 22 * delta; // Gravity
          playerPos.y += this.verticalSpeed * delta;

          if (playerPos.y <= groundY) {
            playerPos.y = groundY;
            this.isAirborne = false;
            this.verticalSpeed = 0;
            soundManager.playLand();
          }
        } else {
          playerPos.y = groundY;
        }
      }

      // 5. Obstacle collision checking before applying displacement (passes playerPos.y)
      const colRadius = this.playerStance === 'prone' ? 0.35 : this.playerStance === 'crouch' ? 0.40 : 0.45;
      const nextX = playerPos.x + this.playerVelocity.x * delta;
      const nextZ = playerPos.z + this.playerVelocity.z * delta;

      if (!this.terrain.checkObstacleCollision(nextX, playerPos.z, colRadius, playerPos.y)) {
        playerPos.x = nextX;
      }
      if (!this.terrain.checkObstacleCollision(playerPos.x, nextZ, colRadius, playerPos.y)) {
        playerPos.z = nextZ;
      }

      // Footstep sound triggers
      if (hasMoveInput && !this.isAirborne && !this.isSwimming) {
        let surface: 'asphalt' | 'dirt' | 'grass' | 'wood' = 'dirt';
        if (playerPos.x < 65) surface = 'asphalt';
        else if (playerPos.x >= 50 && playerPos.x <= 125 && Math.abs(playerPos.z - 3) < 8) surface = 'wood';
        else if (playerPos.x > 115 && playerPos.z > 30) surface = 'grass';

        soundManager.playFootstep(surface, input.sprint);
      }

      // 6. Update Character Animation with stance
      const speedNorm = hasMoveInput ? animSpeed : 0;
      this.playerRig.updateAnimation(delta, speedNorm, this.isAirborne, false, this.playerStance);

      // 7. Camera follows player with stance-aware height
      const camTargetHeight =
        this.playerStance === 'prone' ? 0.5 :
        this.playerStance === 'crouch' ? 1.15 :
        this.playerStance === 'swim' ? 0.85 : 1.55;
      this.cameraController.update(delta, playerPos, false, undefined, heightFunc, camTargetHeight);

      // Proximity checks for interactions
      this.checkWorldInteractions(input);
    }

    // 3. Update Vehicles Physics & Traffic
    this.vehicleManager.update(
      delta,
      (x, z, y) => this.terrain.getTerrainHeight(x, z, y),
      (x, z, r, y) => this.terrain.checkObstacleCollision(x, z, r, y),
    );

    // 4. Update Living NPCs
    this.npcManager.update(delta, playerPos, heightFunc);

    // 5. Update World Terrain (waterfall, river wave offsets)
    this.terrain.update(delta);

    // 6. Update Dynamic Weather & Lighting
    this.weatherManager.update(delta, playerPos);
    this.callbacks.onTimeUpdated?.(this.weatherManager.timeOfDay);

    // 7. Update Audio Ambience (distance to waterfall at [270, -95])
    const wfDist = playerPos.distanceTo(new THREE.Vector3(270, 15, -95));
    soundManager.updateAmbience(wfDist, this.weatherManager.weather === 'rain');

    // 8. Check Quest Distance Triggers
    this.questManager.checkProximityObjectives(
      { x: playerPos.x, y: playerPos.y, z: playerPos.z },
      this.isDriving,
    );

    // 9. Update Real-Time Multiplayer Sync
    const speedFactor = this.isDriving
      ? Math.min(1.0, Math.abs(this.vehicleManager.activePlayerVehicle?.velocity || 0) / 12)
      : Math.min(1.0, this.playerVelocity.length() / 8.5);

    this.multiplayerManager.update(
      delta,
      playerPos,
      this.playerRotation,
      speedFactor,
      this.isAirborne,
      this.isDriving,
      this.playerRig.appearance,
    );
  }

  /**
   * Handle Proximity Prompts & Interactions
   */
  private checkWorldInteractions(input: { interact: boolean; enterVehicle: boolean }) {
    const playerPos = this.playerRig.group.position;

    // 1. Check Nearby Vehicle
    const nearestVeh = this.vehicleManager.getNearestVehicle(playerPos, 3.2);
    if (nearestVeh && !this.isDriving) {
      this.callbacks.onInteractionPrompt?.(`[F] Drive ${nearestVeh.config.nameBn}`);
      if (input.enterVehicle) {
        this.vehicleManager.enterVehicle(nearestVeh);
        this.isDriving = true;
        this.callbacks.onVehicleStateChanged?.(nearestVeh);
        this.callbacks.onNotification?.(`Mounted ${nearestVeh.config.nameBn}`, 'Vehicle');
      }
      return;
    }

    // 2. Check Nearby NPC
    const nearestNPC = this.npcManager.getNearestNPC(playerPos, 2.8);
    if (nearestNPC) {
      this.callbacks.onInteractionPrompt?.(`[E] Talk to ${nearestNPC.config.nameBn} (${nearestNPC.config.role})`);
      if (input.interact) {
        soundManager.playDialogueChime();
        this.callbacks.onOpenDialogue?.(nearestNPC);
      }
      return;
    }

    // 3. Check Quest 3 Waterfall Relic Pickup (at [272, 3.4, -101])
    const activeQ = this.questManager.getActiveQuest();
    if (activeQ && activeQ.id === 'quest_3_waterfall' && activeQ.currentObjectiveIndex === 1) {
      const relicPos = new THREE.Vector3(272, 3.4, -101);
      if (playerPos.distanceTo(relicPos) < 3.2) {
        this.callbacks.onInteractionPrompt?.('[E] Take Ancient Waterfall Relic');
        if (input.interact) {
          // Hide 3D relic mesh in grotto
          const relicMesh = this.terrain.group.getObjectByName('QuestRelic');
          if (relicMesh) relicMesh.visible = false;
          this.questManager.completeCurrentObjective(activeQ);
        }
        return;
      }
    }

    // Clear prompt if no interactive target nearby
    this.callbacks.onInteractionPrompt?.(null);
  }

  /**
   * Persistent Save Game State to LocalStorage
   */
  public saveGame() {
    try {
      const state: SavedGameState = {
        version: 1,
        playerPosition: [
          this.playerRig.group.position.x,
          this.playerRig.group.position.y,
          this.playerRig.group.position.z,
        ],
        playerRotation: this.playerRotation,
        stats: this.questManager.playerStats,
        inventory: this.questManager.inventory,
        quests: this.questManager.quests,
        activeQuestId: this.questManager.activeQuestId,
        timeOfDay: this.weatherManager.timeOfDay,
        weather: this.weatherManager.weather,
        settings: this.settings,
      };
      localStorage.setItem('dream_world_save', JSON.stringify(state));
      this.callbacks.onNotification?.('Game Progress Saved Successfully!', 'SAVE COMPLETE');
    } catch {
      // Storage error
    }
  }

  public loadSavedGame(): boolean {
    try {
      const raw = localStorage.getItem('dream_world_save');
      if (!raw) return false;
      const state = JSON.parse(raw) as SavedGameState;
      if (state.version !== 1) return false;

      this.playerRig.group.position.set(
        state.playerPosition[0],
        state.playerPosition[1],
        state.playerPosition[2],
      );
      this.playerRotation = state.playerRotation;
      this.questManager.playerStats = state.stats;
      this.questManager.inventory = state.inventory;
      this.questManager.quests = state.quests;
      this.questManager.activeQuestId = state.activeQuestId;
      this.weatherManager.timeOfDay = state.timeOfDay;
      this.weatherManager.setWeather(state.weather);
      this.settings = state.settings;
      return true;
    } catch {
      return false;
    }
  }

  public teleport(x: number, z: number) {
    const y = this.terrain.getTerrainHeight(x, z);
    this.playerRig.group.position.set(x, y, z);
    this.playerVelocity.set(0, 0, 0);
    this.callbacks.onNotification?.(`Fast travelled to [${Math.round(x)}, ${Math.round(z)}]`, 'TELEPORT');
  }

  public setPlayerAppearance(appearance: CharacterAppearance) {
    const curPos = this.playerRig.group.position.clone();
    const curRot = this.playerRig.group.rotation.y;
    this.scene.remove(this.playerRig.group);

    this.playerRig = new CharacterRig(appearance);
    this.playerRig.group.position.copy(curPos);
    this.playerRig.group.rotation.y = curRot;
    this.scene.add(this.playerRig.group);

    localStorage.setItem('dream_player_appearance', JSON.stringify(appearance));
    this.callbacks.onNotification?.('Character appearance updated!', 'AVATAR EQUIPPED');
  }

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.multiplayerManager.dispose();
    try {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    } catch {}
  }
}
