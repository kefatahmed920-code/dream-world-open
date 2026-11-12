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
import { VoiceChatManager } from './multiplayer/voiceChatManager';
import { GameSettings, SavedGameState, GraphicsQuality } from './types';
import { GameSignboardManager, GameSignboardConfig } from './world/GameSignboard';
import { RiverEcosystem } from './world/riverEcosystem';
import { GameDoorMetadata } from '../game-house/gameRegistry';
import { TeddyBearCompanion, TeddyBearType, PetToyAccessory } from './character/TeddyBearCompanion';
import { PetCompanionModel } from './lobby/PetCompanionModel';
import { KaifengWorld } from './kaifeng/KaifengWorld';

export interface GameEngineCallbacks {
  onInteractionPrompt?: (prompt: string | null) => void;
  onOpenDialogue?: (npc: ActiveNPC) => void;
  onNotification?: (msg: string, title?: string) => void;
  onStatsUpdated?: (stats: SavedGameState['stats']) => void;
  onVehicleStateChanged?: (vehicle: ActiveVehicle | null) => void;
  onTimeUpdated?: (timeOfDay: number) => void;
  onFPSUpdated?: (fps: number, frameTimeMs?: number) => void;
  onMultiplayerConnectionChanged?: (connected: boolean, playerCount: number) => void;
  onMultiplayerChatReceived?: (sender: string, text: string) => void;
  onEnterGameDoor?: (door: GameDoorMetadata) => void;
  onOpenCharacterCustomizer?: () => void;
  onOpenGameSignboard?: (signboard: GameSignboardConfig) => void;
  onPlayerLocationChanged?: (location: 'PRIVATE_HOME' | 'SHARED_CITY') => void;
  onStartFishingChallenge?: () => void;
  onOpenVillageSpeaker?: () => void;
  onCombatHit?: (hit: { isHeadshot: boolean; targetName: string }) => void;
}

// Static preallocated scratch objects to eliminate per-frame GC heap churn
const _fwdVector = new THREE.Vector3();
const _rtVector = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _seatOffsetScratch = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);
const _wfTarget = new THREE.Vector3(270, 15, -95);

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
  public voiceChatManager: VoiceChatManager;
  public gameSignboards: GameSignboardManager;
  public riverEcosystem: RiverEcosystem;
  public companionPet: TeddyBearCompanion | null = null;
  public companionDrone: PetCompanionModel | null = null;
  public playerLocation: 'PRIVATE_HOME' | 'SHARED_CITY' = 'SHARED_CITY';
  public activeMapId: 'bangladesh_open_world' | 'kaifeng_battle_royale' = 'bangladesh_open_world';
  public kaifengWorld: KaifengWorld | null = null;

  // Player Physics & Locomotion State
  public playerVelocity = new THREE.Vector3();
  public playerRotation = 0;
  public isAirborne = false;
  public verticalSpeed = 0;
  public isDriving = false;
  public playerStance: 'stand' | 'crouch' | 'prone' | 'swim' = 'stand';
  public isSwimming = false;
  public isDiving = false;
  public isCameraUnderwater = false;
  private swimStrokeTimer = 0;

  // Settings & Loop
  public settings: GameSettings = {
    quality: 'medium',
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

    // River Ecosystem: 24 Animated Fish (single instanced mesh), riverbank rocks, water splashes
    this.riverEcosystem = new RiverEcosystem();
    this.scene.add(this.riverEcosystem.group);

    // 1. 3D Game Signboard System (Beside Overbridge South Stairs Landing at [10.5, 0, 14.8])
    this.gameSignboards = new GameSignboardManager();
    this.scene.add(this.gameSignboards.group);
    this.terrain.obstacles.push(...this.gameSignboards.obstacles);

    this.weatherManager = new WeatherManager(this.scene);
    this.questManager = new QuestManager();

    // Hook quest notifications to React
    this.questManager.onNotification = (msg, title) => {
      this.callbacks.onNotification?.(msg, title);
    };

    // Player 3D Rig (Spawns directly on Dhanmondi Avenue city sidewalk at [6, 0.05, 12])
    let initialAppearance: CharacterAppearance = DEFAULT_PLAYER_APPEARANCE;
    try {
      const saved = localStorage.getItem('dream_player_appearance');
      if (saved) initialAppearance = JSON.parse(saved);
    } catch {}
    this.playerRig = new CharacterRig(initialAppearance);
    this.playerRig.group.position.set(6, 0.05, 12);
    this.playerRotation = 0;
    this.playerRig.group.rotation.y = this.playerRotation;
    this.playerLocation = 'SHARED_CITY';
    this.scene.add(this.playerRig.group);

    // Intelligent AI Companion (Aero Drone or Teddy Bear)
    let activePet = 'cyber_neon';
    try {
      const savedPet = localStorage.getItem('dream_active_pet_companion') || localStorage.getItem('dream_active_teddy');
      if (savedPet) activePet = savedPet;
    } catch {}

    if (activePet === 'aero_drone') {
      this.companionDrone = new PetCompanionModel('aero_drone');
      this.companionDrone.group.position.set(5.2, 0.6, 12.8);
      this.scene.add(this.companionDrone.group);
    } else {
      const validTeddy: TeddyBearType = [
        'cyber_neon',
        'classic_honey',
        'panda_bear',
        'golden_hero',
      ].includes(activePet as TeddyBearType)
        ? (activePet as TeddyBearType)
        : 'cyber_neon';

      this.companionPet = new TeddyBearCompanion(validTeddy, 'toy_blaster');
      this.companionPet.group.position.set(5.2, 0.05, 12.8);
      this.scene.add(this.companionPet.group);
    }

    // NPCs & Vehicles
    const heightFunc = (x: number, z: number, y?: number) => this.terrain.getTerrainHeight(x, z, y);
    this.npcManager = new NPCManager(this.scene, heightFunc);
    this.vehicleManager = new VehicleManager(this.scene, heightFunc);

    // Controllers
    this.cameraController = new CameraController(this.camera);
    this.inputManager = new InputManager(this.renderer.domElement);

    // Real-Time Online Multiplayer & WebRTC Voice Chat
    this.multiplayerManager = new MultiplayerManager(this.scene);
    this.voiceChatManager = new VoiceChatManager(this.multiplayerManager);
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
    this.multiplayerManager.onRoomJoined = () => {
      this.voiceChatManager.initRoomListening();
    };

    // Window Resize Handler
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Auto-select quality preset for mobile / low-spec devices
    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024);
    const defaultQuality: GraphicsQuality = (isMobile || this.isSoftwareGl) ? 'low' : 'medium';
    this.applyGraphicsQuality(defaultQuality);

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
    const heightFunc = (x: number, z: number) => this.getTerrainHeight(x, z);

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

      // Keep player seated inside vehicle aligned with vehicle rotation without allocations
      _seatOffsetScratch.copy(activeVeh.driverSeatOffset).applyAxisAngle(_upAxis, activeVeh.group.rotation.y);
      playerPos.copy(activeVeh.group.position).add(_seatOffsetScratch);
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
      // --- ON-FOOT & SWIMMING MODE ---
      // Camera-relative movement vector using static preallocated vectors
      const camYaw = this.cameraController.yaw;
      _fwdVector.set(-Math.sin(camYaw), 0, -Math.cos(camYaw));
      _rtVector.set(Math.cos(camYaw), 0, -Math.sin(camYaw));

      _moveDir.set(0, 0, 0)
        .addScaledVector(_fwdVector, input.moveForward)
        .addScaledVector(_rtVector, input.moveRight);

      const hasMoveInput = _moveDir.lengthSq() > 0.01;
      if (hasMoveInput) {
        _moveDir.normalize();
        // Turn player smoothly towards intended direction of travel
        const targetRot = Math.atan2(_moveDir.x, _moveDir.z);
        this.playerRotation = THREE.MathUtils.damp(this.playerRotation, targetRot, 14, delta);
      }
      this.playerRig.group.rotation.y = this.playerRotation;

      // 1. River Padma Water & Swimming State Detection
      const inWater = this.terrain.isWater(playerPos.x, playerPos.z, playerPos.y);
      const waterDepth = inWater ? this.terrain.getWaterDepth(playerPos.x, playerPos.z, playerPos.y) : 0;
      const bedY = this.terrain.getGroundElevation(playerPos.x, playerPos.z);

      if (inWater && (waterDepth > 0.55 || playerPos.y <= -0.4)) {
        if (!this.isSwimming) {
          this.isSwimming = true;
          this.playerStance = 'swim';
          this.isAirborne = false;
          this.verticalSpeed = 0;
          this.riverEcosystem.spawnSplash(playerPos.x, playerPos.z, 1.2);
          soundManager.playWaterSplash();
          this.callbacks.onNotification?.('Entered River Padma (Surface / Dive enabled)', 'SWIMMING');
        }
      } else if (this.isSwimming && (!inWater || bedY >= -0.48)) {
        // Smooth transition from water onto riverbank shore
        this.isSwimming = false;
        this.isDiving = false;
        this.playerStance = 'stand';
        playerPos.y = Math.max(bedY, 0.0);
        this.riverEcosystem.spawnSplash(playerPos.x, playerPos.z, 0.8);
        soundManager.playWaterSplash();
        this.callbacks.onNotification?.('Stepped onto Riverbank', 'ON SHORE');
      }

      // 2. Posture & Stance Transitions with Overhead Ceiling Clearance Check
      if (!this.isSwimming) {
        if (input.crouch) {
          if (this.playerStance === 'crouch') {
            if (this.checkCeilingObstacle(playerPos.x, playerPos.z, playerPos.y)) {
              this.callbacks.onNotification?.('Cannot stand up (low ceiling clearance)', 'OBSTACLE');
            } else {
              this.playerStance = 'stand';
            }
          } else {
            this.playerStance = 'crouch';
          }
        } else if (input.prone) {
          if (this.playerStance === 'prone') {
            if (this.checkCeilingObstacle(playerPos.x, playerPos.z, playerPos.y)) {
              this.callbacks.onNotification?.('Cannot stand up (low ceiling clearance)', 'OBSTACLE');
            } else {
              this.playerStance = 'stand';
            }
          } else {
            this.playerStance = 'prone';
          }
        }

        if (input.jump) {
          if (this.playerStance === 'crouch' || this.playerStance === 'prone') {
            if (this.checkCeilingObstacle(playerPos.x, playerPos.z, playerPos.y)) {
              this.callbacks.onNotification?.('Cannot stand up (low ceiling clearance)', 'OBSTACLE');
            } else {
              this.playerStance = 'stand';
            }
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
        if (input.sprint) {
          baseSpeed = 6.0;
          animSpeed = 1.0;
          stats.stamina = Math.max(0, stats.stamina - delta * 4);
        } else {
          baseSpeed = 3.2;
          animSpeed = 0.65;
          stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 3.5);
        }
      } else if (this.playerStance === 'prone') {
        baseSpeed = 1.5; // Tactical army crawl pace
        animSpeed = 0.5;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 5);
      } else if (this.playerStance === 'crouch') {
        baseSpeed = 2.8;
        animSpeed = 0.55;
        stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 5);
      } else {
        // Standard Standing Walk / Run / Sprint (Super responsive 10.8 m/s sprint)
        if (input.sprint) {
          baseSpeed = 10.8;
          animSpeed = 1.05;
          stats.stamina = Math.max(0, stats.stamina - delta * 3);
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
        this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, _moveDir.x * baseSpeed, 12, delta);
        this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, _moveDir.z * baseSpeed, 12, delta);
      } else {
        this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, 16, delta);
        this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, 16, delta);
      }

      // 4. Vertical Locomotion: Swimming, Diving, Buoyancy & Land Gravity
      if (this.isSwimming) {
        const minAllowedY = bedY + 0.35; // Cannot sink through riverbed
        const maxSurfaceY = -0.45; // River water surface line

        // Diving Down / Surfacing Up
        if (input.dive) {
          this.verticalSpeed = THREE.MathUtils.damp(this.verticalSpeed, -2.0, 8, delta);
          this.isDiving = true;
        } else if (input.surface || input.jump) {
          this.verticalSpeed = THREE.MathUtils.damp(this.verticalSpeed, 2.2, 8, delta);
          if (playerPos.y >= -0.55) {
            this.isDiving = false;
          }
        } else {
          // Stable buoyancy: gently float back up if submerged, or stay stabilized at surface
          if (playerPos.y < -0.52) {
            this.verticalSpeed = THREE.MathUtils.damp(this.verticalSpeed, 0.75, 4, delta);
          } else {
            this.verticalSpeed = THREE.MathUtils.damp(this.verticalSpeed, 0, 10, delta);
            playerPos.y = THREE.MathUtils.damp(playerPos.y, maxSurfaceY, 12, delta);
            this.isDiving = false;
          }
        }

        playerPos.y = THREE.MathUtils.clamp(playerPos.y + this.verticalSpeed * delta, minAllowedY, maxSurfaceY);
        this.isAirborne = false;

        // Periodic swim stroke acoustic feedback
        if (hasMoveInput) {
          this.swimStrokeTimer += delta;
          const strokeInterval = input.sprint ? 0.45 : 0.68;
          if (this.swimStrokeTimer >= strokeInterval) {
            this.swimStrokeTimer = 0;
            soundManager.playSwimStroke();
            if (playerPos.y >= -0.55) {
              this.riverEcosystem.spawnSplash(playerPos.x, playerPos.z, 0.45);
            }
          }
        }
      } else {
        // On Land: Terrain elevation & airborne gravity
        const groundY = this.getTerrainHeight(playerPos.x, playerPos.z, playerPos.y);

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

      // 5. Obstacle collision checking before applying horizontal displacement
      const colRadius = this.playerStance === 'prone' ? 0.35 : this.playerStance === 'crouch' ? 0.40 : 0.45;
      const nextX = playerPos.x + this.playerVelocity.x * delta;
      const nextZ = playerPos.z + this.playerVelocity.z * delta;

      if (!this.terrain.checkObstacleCollision(nextX, playerPos.z, colRadius, playerPos.y)) {
        playerPos.x = nextX;
      }
      if (!this.terrain.checkObstacleCollision(playerPos.x, nextZ, colRadius, playerPos.y)) {
        playerPos.z = nextZ;
      }

      // Footstep sound triggers on land
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
        this.playerStance === 'prone' ? 0.40 :
        this.playerStance === 'crouch' ? 1.15 :
        this.playerStance === 'swim' ? 0.70 : 1.55;
      this.cameraController.update(delta, playerPos, false, undefined, heightFunc, camTargetHeight, this.isSwimming);

      // 8. Underwater Camera Detection & Atmosphere Transition
      const cameraInWater = this.camera.position.y < -0.42;
      if (cameraInWater && !this.isCameraUnderwater) {
        this.isCameraUnderwater = true;
        this.scene.fog = new THREE.FogExp2(0x0a4048, 0.052);
        soundManager.setUnderwater(true);
      } else if (!cameraInWater && this.isCameraUnderwater) {
        this.isCameraUnderwater = false;
        this.scene.fog = new THREE.FogExp2(0x94a3b8, 0.0035);
        soundManager.setUnderwater(false);
        this.riverEcosystem.spawnSplash(playerPos.x, playerPos.z, 0.8);
        soundManager.playWaterSplash();
      }

      // Proximity checks for interactions
      this.checkWorldInteractions(input);
    }

    // 3. Update Vehicles Physics & Traffic
    this.vehicleManager.update(
      delta,
      (x, z, y) => this.terrain.getTerrainHeight(x, z, y),
      (x, z, r, y) => this.terrain.checkObstacleCollision(x, z, r, y),
    );

    // 4. Update Living NPCs & AI Companions (Teddy Bear or Aero Drone)
    this.npcManager.update(delta, playerPos, heightFunc);
    if (this.companionPet) {
      this.companionPet.updateFollow(delta, playerPos, this.playerRotation, heightFunc);
    }
    if (this.companionDrone) {
      const droneTargetX = playerPos.x - Math.sin(this.playerRotation + 0.8) * 1.4;
      const droneTargetZ = playerPos.z - Math.cos(this.playerRotation + 0.8) * 1.4;
      const groundY = heightFunc(this.companionDrone.group.position.x, this.companionDrone.group.position.z);
      this.companionDrone.group.position.x = THREE.MathUtils.damp(this.companionDrone.group.position.x, droneTargetX, 7, delta);
      this.companionDrone.group.position.z = THREE.MathUtils.damp(this.companionDrone.group.position.z, droneTargetZ, 7, delta);
      this.companionDrone.group.position.y = THREE.MathUtils.damp(this.companionDrone.group.position.y, groundY + 0.9, 5, delta);
      this.companionDrone.group.rotation.y = THREE.MathUtils.damp(this.companionDrone.group.rotation.y, this.playerRotation, 6, delta);
      this.companionDrone.update(delta);
    }

    // 5. Update World Terrain (waterfall, river wave offsets)
    this.terrain.update(delta);

    // 6. Update River Wildlife & Splash Effects
    this.riverEcosystem.update(delta);

    // 7. Update Dynamic Weather & Lighting
    this.weatherManager.update(delta, playerPos);
    this.callbacks.onTimeUpdated?.(this.weatherManager.timeOfDay);

    // 8. Update Audio Ambience using static scratch vector
    const wfDist = playerPos.distanceTo(_wfTarget);
    soundManager.updateAmbience(wfDist, this.weatherManager.weather === 'rain');

    if (this.activeMapId === 'kaifeng_battle_royale' && this.kaifengWorld) {
      this.kaifengWorld.update(delta, performance.now() * 0.001);
    } else {
      if (this.terrain.countrysideVillage) {
        this.terrain.countrysideVillage.update(delta, false);
      }
    }

    // 9. Check Quest Distance Triggers
    this.questManager.checkProximityObjectives(
      { x: playerPos.x, y: playerPos.y, z: playerPos.z },
      this.isDriving,
    );

    // 10. Update 3D Game Signboards (Floating rings and interaction pulses)
    this.gameSignboards.update(delta);

    // 11. Update Real-Time Multiplayer Sync
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
   * Check if an overhead obstacle blocks the player from standing up
   */
  public checkCeilingObstacle(x: number, z: number, y: number): boolean {
    // Check overpass lower roadway clearance
    if (x >= 18 && x <= 44 && z >= -150 && z <= 150) {
      if (y < 4.2 && y + 1.85 >= 5.0) return true;
    }
    // Check registered 3D world obstacle boundaries
    for (const obs of this.terrain.obstacles) {
      if (x >= obs.minX - 0.25 && x <= obs.maxX + 0.25 && z >= obs.minZ - 0.25 && z <= obs.maxZ + 0.25) {
        if (obs.minY !== undefined && obs.minY > y && obs.minY < y + 1.85) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Apply Graphics Quality Preset
   */
  public applyGraphicsQuality(quality: GraphicsQuality) {
    this.settings.quality = quality;
    if (quality === 'low') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
      this.renderer.shadowMap.enabled = false;
      this.settings.shadows = false;
    } else if (quality === 'medium') {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.settings.shadows = true;
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.settings.shadows = true;
    }
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
      const relicPos = new THREE.Vector3(245, 23.2, -80);
      if (playerPos.distanceTo(relicPos) < 3.2) {
        this.callbacks.onInteractionPrompt?.('[E] Take Ancient Mountain Overlook Relic');
        if (input.interact) {
          const relicMesh = this.terrain.group.getObjectByName('QuestRelic');
          if (relicMesh) relicMesh.visible = false;
          this.questManager.completeCurrentObjective(activeQ);
        }
        return;
      }
    }

    // 4. Check Kashem Majhi Fishing Challenge on Wooden River Pier
    const pierMajhiPos = this.terrain.kaifengBridge?.fishermanPos || new THREE.Vector3(54.2, 0.5, 14.2);
    if (playerPos.distanceTo(pierMajhiPos) < 3.8) {
      this.callbacks.onInteractionPrompt?.('[E] মাছ ধরার প্রতিযোগিতা শুরু করুন / 2-Min Fishing Challenge');
      if (input.interact) {
        soundManager.playCollectCoin();
        this.callbacks.onStartFishingChallenge?.();
      }
      return;
    }

    // 5. Check 3D Game Signboards (Beside Overbridge Stairs with Glowing Disc & Floating Rings)
    const nearbySign = this.gameSignboards.getNearbySignboard(playerPos, 3.5);
    if (nearbySign) {
      this.callbacks.onInteractionPrompt?.(nearbySign.promptText);
      if (input.interact) {
        soundManager.playCollectCoin();
        this.callbacks.onOpenGameSignboard?.(nearbySign);
      }
      return;
    }

    // 6. In Bangladesh World: Kaifeng World Gateway Portal at Eastern Bridgehead (X: 125, Z: 3)
    if (this.activeMapId === 'bangladesh_open_world' && this.terrain.countrysideVillage) {
      const portal = this.terrain.countrysideVillage.kaifengPortalPos;
      if (playerPos.distanceTo(portal) < 5.2) {
        this.callbacks.onInteractionPrompt?.('[E] কাইফেং সাম্রাজ্য পোর্টাল / Travel to Kaifeng World (Map 01)');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.switchMap('kaifeng_battle_royale');
        }
        return;
      }
    }

    // 7. In Kaifeng World: Return Portal (X: 120, Z: 35) & Tactical Supply Airdrop Crates
    if (this.activeMapId === 'kaifeng_battle_royale' && this.kaifengWorld) {
      const retPortal = this.kaifengWorld.returnPortalPos;
      if (playerPos.distanceTo(retPortal) < 5.2) {
        this.callbacks.onInteractionPrompt?.('[E] বাংলাদেশ ওয়ার্ল্ড পোর্টাল / Return to Bangladesh World (Map 02)');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.switchMap('bangladesh_open_world');
        }
        return;
      }

      // Check nearest Battle Royale Supply Crate (Exploration loot)
      const crate = this.kaifengWorld.battleRoyale.getNearestSupplyCrate(playerPos, 4.0);
      if (crate && !crate.isLooted) {
        this.callbacks.onInteractionPrompt?.(`[E] Open ${crate.name} (Supply Loot)`);
        if (input.interact) {
          crate.isLooted = true;
          crate.beaconLight.intensity = 0;
          soundManager.playCollectCoin();
          this.quickHeal();
          this.callbacks.onNotification?.(`Looted ${crate.name}! Medical supplies recovered.`, 'SUPPLY LOOT');
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

  public getTerrainHeight(x: number, z: number, y?: number): number {
    if (this.activeMapId === 'kaifeng_battle_royale' && this.kaifengWorld) {
      return this.kaifengWorld.getTerrainHeight(x, z);
    }
    return this.terrain.getTerrainHeight(x, z, y);
  }

  public switchMap(targetMapId: 'bangladesh_open_world' | 'kaifeng_battle_royale') {
    if (targetMapId === this.activeMapId && this.kaifengWorld) return;

    if (targetMapId === 'kaifeng_battle_royale') {
      // Lazy-load Kaifeng 3D World (progressive loading to avoid initial GPU memory pressure)
      if (!this.kaifengWorld) {
        this.kaifengWorld = new KaifengWorld();
        this.scene.add(this.kaifengWorld.group);
      }
      this.kaifengWorld.group.visible = true;

      // Hide Bangladesh World environments
      this.terrain.group.visible = false;
      this.riverEcosystem.group.visible = false;
      this.npcManager.group.visible = false;
      this.vehicleManager.group.visible = false;

      // Teleport player to Kaifeng Southern Arrival Courtyard (District 1: X=120, Z=35)
      const groundY = this.kaifengWorld.getTerrainHeight(120, 35) + 0.1;
      this.playerRig.group.position.set(120, groundY, 35);
      this.playerRig.group.rotation.y = 0;
      this.playerRotation = 0;
      this.playerVelocity.set(0, 0, 0);
      this.cameraController.targetPos.set(120, groundY + 1.2, 35);

      this.activeMapId = 'kaifeng_battle_royale';
      this.multiplayerManager.switchMap('kaifeng_battle_royale', this.playerRig.group.position);
      this.callbacks.onNotification?.('কাইফেং রাজবংশে স্বাগতম! (MAP 01: Kaifeng The Grand Dynasty)', 'MAP 01');
    } else {
      // Hide Kaifeng World
      if (this.kaifengWorld) {
        this.kaifengWorld.group.visible = false;
      }

      // Restore Bangladesh World
      this.terrain.group.visible = true;
      this.riverEcosystem.group.visible = true;
      this.npcManager.group.visible = true;
      this.vehicleManager.group.visible = true;

      // Teleport player to Bangladesh Bridgehead Gateway (X=115, Z=3)
      const groundY = this.terrain.getTerrainHeight(115, 3) + 0.1;
      this.playerRig.group.position.set(115, groundY, 3);
      this.playerRig.group.rotation.y = -Math.PI / 2;
      this.playerRotation = -Math.PI / 2;
      this.playerVelocity.set(0, 0, 0);
      this.cameraController.targetPos.set(115, groundY + 1.2, 3);

      this.activeMapId = 'bangladesh_open_world';
      this.multiplayerManager.switchMap('bangladesh_open_world', this.playerRig.group.position);
      this.callbacks.onNotification?.('বাংলাদেশ ওপেন ওয়ার্ল্ডে স্বাগতম! (MAP 02: Bangladesh World)', 'MAP 02');
    }
  }

  public teleport(x: number, z: number) {
    const y = this.getTerrainHeight(x, z);
    this.playerRig.group.position.set(x, y, z);
    this.playerVelocity.set(0, 0, 0);
    this.callbacks.onNotification?.(`Fast travelled to [${Math.round(x)}, ${Math.round(z)}]`, 'TELEPORT');
  }

  /**
   * Safely returns player to central city street spawn
   */
  public returnHome() {
    if (this.isDriving && this.vehicleManager.activePlayerVehicle) {
      this.vehicleManager.exitVehicle();
      this.isDriving = false;
      this.callbacks.onVehicleStateChanged?.(null);
    }
    this.playerRig.group.position.set(6, 0.05, 12);
    this.playerVelocity.set(0, 0, 0);
    this.playerRotation = 0;
    this.playerRig.group.rotation.y = this.playerRotation;
    this.callbacks.onNotification?.('ধানমন্ডি সেন্ট্রাল পয়েন্টে ফিরে এসেছেন', 'DHANMONDI');
  }

  public exitToCity() {
    this.playerRig.group.position.set(6, 0.05, 12);
    this.playerVelocity.set(0, 0, 0);
  }

  /**
   * Spawns requested vehicle on the road right next to player
   * Spawned vehicles stay permanently in the world.
   */
  public spawnVehicleNearPlayer(type: string): void {
    const playerPos = this.playerRig.group.position;
    const forwardX = Math.sin(this.playerRotation);
    const forwardZ = Math.cos(this.playerRotation);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    const spawnX = playerPos.x + rightX * 3.2;
    const spawnZ = playerPos.z + rightZ * 3.2;
    const spawnY = this.terrain.getTerrainHeight(spawnX, spawnZ);

    const spawnPos = new THREE.Vector3(spawnX, spawnY, spawnZ);
    const veh = this.vehicleManager.spawnVehicle(
      type,
      spawnPos,
      this.playerRotation,
      (x: number, z: number) => this.terrain.getTerrainHeight(x, z),
    );

    soundManager.playRadioBeep(true);
    this.callbacks.onNotification?.(`${veh.config.nameBn} রাস্তায় হাজির হয়েছে!`, 'GARAGE DELIVERY');
  }

  /**
   * Validates & generates a safe city spawn location strictly within urban pavement
   * Completely excludes the Padma river, rural village, mountain slopes, and obstacles.
   */
  public getRandomCitySpawn(): THREE.Vector3 {
    // Vast expanded city bounds: X from -250 to 38, Z from -60 to 50
    for (let attempt = 0; attempt < 30; attempt++) {
      const x = -240 + Math.random() * 275; // between -240 and +35
      const z = -45 + Math.random() * 85;  // between -45 and +40
      const y = this.terrain.getTerrainHeight(x, z);

      // Exclude water & river
      if (this.terrain.isWater(x, z, y)) continue;

      // Exclude obstacles
      if (this.terrain.checkObstacleCollision(x, z, 0.5, y)) continue;

      return new THREE.Vector3(x, y, z);
    }
    // Safe fallback to Dhanmondi sidewalk
    return new THREE.Vector3(6.0, 0.05, 6.8);
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

  public setCompanionPet(type: string, accessory: PetToyAccessory = 'toy_blaster') {
    if (this.companionPet) {
      this.scene.remove(this.companionPet.group);
      this.companionPet = null;
    }
    if (this.companionDrone) {
      this.scene.remove(this.companionDrone.group);
      this.companionDrone = null;
    }

    if (type === 'aero_drone') {
      this.companionDrone = new PetCompanionModel('aero_drone');
      this.companionDrone.group.position.set(this.playerRig.group.position.x + 1.0, 0.6, this.playerRig.group.position.z + 1.0);
      this.scene.add(this.companionDrone.group);
    } else {
      const validTeddy: TeddyBearType = [
        'cyber_neon',
        'classic_honey',
        'panda_bear',
        'golden_hero',
      ].includes(type as any)
        ? (type as TeddyBearType)
        : 'cyber_neon';

      this.companionPet = new TeddyBearCompanion(validTeddy, accessory);
      this.companionPet.group.position.set(this.playerRig.group.position.x + 0.8, 0.05, this.playerRig.group.position.z + 0.8);
      this.scene.add(this.companionPet.group);
    }
    localStorage.setItem('dream_active_pet_companion', type);
    localStorage.setItem('dream_active_teddy', type);
  }

  // --- 5-SLOT TACTICAL CAROUSEL WEAPON & ACTION SYSTEM ---
  public activeWeaponSlot = 0;
  public weaponSlots = [
    { id: 'primary', name: 'AKM-47 Pulse', category: 'Assault', ammo: 30, maxAmmo: 30, reserveAmmo: 120, icon: 'rifle' },
    { id: 'secondary', name: 'Desert Eagle SMG', category: 'Pistol', ammo: 15, maxAmmo: 15, reserveAmmo: 60, icon: 'pistol' },
    { id: 'melee', name: 'Padma Machete', category: 'Melee', ammo: 1, maxAmmo: 1, reserveAmmo: 0, icon: 'knife' },
    { id: 'medical', name: 'First Aid Medkit', category: 'Heal', count: 3, maxCount: 5, icon: 'medkit' },
    { id: 'utility', name: 'Tactical Smoke Grenade', category: 'Tactical', count: 2, maxCount: 4, icon: 'grenade' },
  ];
  private heldWeaponMesh: THREE.Group | null = null;

  public equipSlot(slotIndex: number) {
    if (slotIndex < 0 || slotIndex >= this.weaponSlots.length) return;
    this.activeWeaponSlot = slotIndex;
    soundManager.playCollectItem();
    this.updateHeldWeaponMesh();
  }

  private updateHeldWeaponMesh() {
    if (this.heldWeaponMesh) {
      this.playerRig.rightHand.remove(this.heldWeaponMesh);
      this.heldWeaponMesh = null;
    }

    const slot = this.weaponSlots[this.activeWeaponSlot];
    const group = new THREE.Group();

    if (slot.category === 'Assault') {
      // Sleek tactical rifle
      const bodyGeo = new THREE.BoxGeometry(0.06, 0.1, 0.42);
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.set(0, -0.05, 0.15);
      group.add(body);

      const barrelGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.9 });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, -0.03, 0.4);
      group.add(barrel);

      const magGeo = new THREE.BoxGeometry(0.04, 0.12, 0.08);
      const magMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 });
      const mag = new THREE.Mesh(magGeo, magMat);
      mag.position.set(0, -0.12, 0.12);
      mag.rotation.x = 0.2;
      group.add(mag);
    } else if (slot.category === 'Pistol') {
      const pGeo = new THREE.BoxGeometry(0.05, 0.09, 0.2);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(0, -0.04, 0.08);
      group.add(p);
    } else if (slot.category === 'Melee') {
      const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8);
      const handleMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const handle = new THREE.Mesh(handleGeo, handleMat);
      handle.position.set(0, -0.04, 0);
      group.add(handle);

      const bladeGeo = new THREE.BoxGeometry(0.02, 0.05, 0.35);
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.95 });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.set(0, -0.04, 0.22);
      group.add(blade);
    } else if (slot.category === 'Heal') {
      const kitGeo = new THREE.BoxGeometry(0.12, 0.12, 0.08);
      const kitMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });
      const kit = new THREE.Mesh(kitGeo, kitMat);
      kit.position.set(0, -0.06, 0.06);
      group.add(kit);
    }

    this.heldWeaponMesh = group;
    this.playerRig.rightHand.add(group);
  }

  public fireWeapon() {
    const slot = this.weaponSlots[this.activeWeaponSlot];
    if (slot.category === 'Heal') {
      this.quickHeal();
      return;
    }
    if (slot.category === 'Tactical') {
      if ('count' in slot && slot.count && slot.count > 0) {
        slot.count--;
        soundManager.playBlasterFire();
        this.callbacks.onNotification?.('স্মোক গ্রেনেড নিক্ষেপ করা হয়েছে!', 'TACTICAL');
      }
      return;
    }
    if (slot.category === 'Melee') {
      soundManager.playBlasterFire();
      return;
    }
    if ('ammo' in slot && slot.ammo !== undefined) {
      if (slot.ammo <= 0) {
        soundManager.playBlasterReload();
        this.callbacks.onNotification?.('রিলোড প্রয়োজন! (Reload Weapon)', 'AMMO EMPTY');
        return;
      }
      slot.ammo--;
      soundManager.playBlasterFire();

      // Recoil kick on camera
      this.cameraController.rotate(0, 0.015);

      // Muzzle flash particle / light pulse
      const flashLight = new THREE.PointLight(0xffaa44, 2.5, 9);
      const playerPos = this.playerRig.group.position;
      flashLight.position.set(playerPos.x, playerPos.y + 1.2, playerPos.z);
      this.scene.add(flashLight);
      setTimeout(() => this.scene.remove(flashLight), 60);

      // Center crosshair raycast against remote players & NPCs
      try {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const candidateTargets: THREE.Object3D[] = [];
        for (const [, actor] of this.multiplayerManager.remotePlayers) {
          candidateTargets.push(actor.rig.group);
        }
        for (const npc of this.npcManager.npcs) {
          candidateTargets.push(npc.rig.group);
        }
        const intersects = raycaster.intersectObjects(candidateTargets, true);
        if (intersects.length > 0) {
          const hit = intersects[0];
          const isHeadshot = hit.point.y > 1.45;
          const targetName = hit.object.name || 'Opponent';
          soundManager.playHitMarkerSound(isHeadshot);
          this.callbacks.onCombatHit?.({ isHeadshot, targetName });
        }
      } catch {}
    }
  }

  public reloadWeapon() {
    const slot = this.weaponSlots[this.activeWeaponSlot];
    if (
      'ammo' in slot &&
      slot.ammo !== undefined &&
      slot.maxAmmo !== undefined &&
      slot.reserveAmmo !== undefined
    ) {
      if (slot.ammo >= slot.maxAmmo || slot.reserveAmmo <= 0) {
        return;
      }
      const needed = slot.maxAmmo - slot.ammo;
      const taken = Math.min(needed, slot.reserveAmmo);
      slot.ammo += taken;
      slot.reserveAmmo -= taken;
      soundManager.playBlasterReload();
      this.callbacks.onNotification?.(`${slot.name} রিলোড সম্পন্ন (${slot.ammo}/${slot.reserveAmmo})`, 'RELOAD');
    }
  }

  public quickHeal() {
    const medSlot = this.weaponSlots[3];
    if ('count' in medSlot && medSlot.count && medSlot.count > 0) {
      medSlot.count--;
      const stats = this.questManager.playerStats;
      stats.health = Math.min(stats.maxHealth, stats.health + 35);
      stats.stamina = stats.maxStamina;
      soundManager.playHealSound();
      this.callbacks.onNotification?.('ফার্স্ট এইড ব্যবহার করা হয়েছে (+35 HP & Max Stamina)', 'HEAL');
    } else {
      const stats = this.questManager.playerStats;
      if (stats.health < stats.maxHealth) {
        stats.health = Math.min(stats.maxHealth, stats.health + 20);
        soundManager.playHealSound();
        this.callbacks.onNotification?.('ব্যান্ডেজ প্রয়োগ করা হয়েছে (+20 HP)', 'HEAL');
      }
    }
  }

  public setAim(aim: boolean) {
    this.cameraController.setAim(aim);
  }

  public cycleCameraPerspective(): 'tp' | 'fp' | 'free' {
    const next = this.cameraController.cyclePerspective();
    soundManager.playUiClick();
    this.callbacks.onNotification?.(
      next === 'tp' ? 'Third Person View (টিপিপি)' :
      next === 'fp' ? 'First Person View (এফপিপি)' : 'Free Orbit Look (ফ্রি লুক)',
      'CAMERA'
    );
    return next;
  }

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.riverEcosystem.dispose();
    this.voiceChatManager.disableVoiceChat();
    this.multiplayerManager.dispose();
    try {
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    } catch {}
  }
}
