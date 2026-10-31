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
import { GameDoorMetadata } from '../game-house/gameRegistry';
import { RiverEcosystem } from './world/riverEcosystem';

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
  public playerLocation: 'PRIVATE_HOME' | 'SHARED_CITY' = 'SHARED_CITY';

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
        if (input.sprint && stats.stamina > 5) {
          baseSpeed = 5.0;
          animSpeed = 1.0;
          stats.stamina = Math.max(0, stats.stamina - delta * 8);
        } else {
          baseSpeed = 3.0;
          animSpeed = 0.65;
          stats.stamina = Math.min(stats.maxStamina, stats.stamina + delta * 3.5);
        }
      } else if (this.playerStance === 'prone') {
        baseSpeed = 1.35; // Authentic army crawl pace
        animSpeed = 0.45;
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

    // 4. Update Living NPCs
    this.npcManager.update(delta, playerPos, heightFunc);

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

    if (this.terrain.countrysideVillage) {
      const speakerDist = playerPos.distanceTo(this.terrain.countrysideVillage.speakerPos);
      soundManager.updateVillageMusicSpatial(speakerDist);
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

    // 4. Check Kashem Majhi Fishing Challenge on Wooden River Pier ([66.5, 0.5, 14.2])
    const pierMajhiPos = new THREE.Vector3(66.5, 0.5, 14.2);
    if (playerPos.distanceTo(pierMajhiPos) < 3.5) {
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

    // 6. Check Village Outdoor Music Speaker System beside Giant Tree
    if (this.terrain.countrysideVillage) {
      const spk = this.terrain.countrysideVillage.speakerPos;
      if (playerPos.distanceTo(spk) < 3.8) {
        this.callbacks.onInteractionPrompt?.('[E] সাউন্ড সিস্টেম / Village Music Speaker System');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.callbacks.onOpenVillageSpeaker?.();
        }
        return;
      }

      // 7. Check Village Pond Wooden Fishing Platform
      const pondPier = this.terrain.countrysideVillage.pondPierPos;
      if (playerPos.distanceTo(pondPier) < 4.2) {
        this.callbacks.onInteractionPrompt?.('[E] পুকুরে মাছ ধরুন / Fish in Village Pond');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.callbacks.onStartFishingChallenge?.();
        }
        return;
      }

      // 8. Check Dream World High School Gate
      const schGate = this.terrain.countrysideVillage.schoolGatePos;
      if (playerPos.distanceTo(schGate) < 4.0) {
        this.callbacks.onInteractionPrompt?.('[E] ড্রিম ওয়ার্ল্ড হাই স্কুল / Dream World High School');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.callbacks.onNotification?.('ড্রিম ওয়ার্ল্ড হাই স্কুল ক্যাম্পাসে স্বাগতম! সুন্দর ফুটবল মাঠ ও খেলার জায়গা।', 'HIGH SCHOOL');
        }
        return;
      }

      // 9. Check Vegetable Garden & Tube-Well Shed
      const shedPos = this.terrain.countrysideVillage.gardenShedPos;
      if (playerPos.distanceTo(shedPos) < 3.8) {
        this.callbacks.onInteractionPrompt?.('[E] সবজি বাগান ও টিউবওয়েল / Countryside Garden Harvest');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.callbacks.onNotification?.('তাজা মিষ্টি বেগুন, লালশাক ও ভুট্টা সংগ্রহ করা হয়েছে!', 'FARM FRESH');
        }
        return;
      }

      // 10. Check Hilltop Scenic Viewpoint Gazebo
      const gazeboPos = this.terrain.countrysideVillage.hillGazeboPos;
      if (playerPos.distanceTo(gazeboPos) < 4.5) {
        this.callbacks.onInteractionPrompt?.('[E] পাহাড়চূড়ার ভিউপয়েন্ট গেজেবো / Scenic Overlook Gazebo');
        if (input.interact) {
          soundManager.playCollectCoin();
          this.callbacks.onNotification?.('পাহাড়ের চূড়া থেকে পুকুর, প্লাজা ও পুরো গ্রামের মনোরম দৃশ্য উপভোগ করছেন!', 'SCENIC VIEW');
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
    // City bounds: X from -120 to 45, Z from -30 to 30
    for (let attempt = 0; attempt < 30; attempt++) {
      const x = -110 + Math.random() * 145; // between -110 and +35
      const z = -25 + Math.random() * 50;  // between -25 and +25
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
