/**
 * DREAM WORLD — KAIFENG: THE GRAND DYNASTY
 * PART 3 OF 3 — BATTLE ROYALE & OPEN WORLD MANAGER
 *
 * Implements:
 *  - 1. Open World Mode: Unrestricted exploration across all 8 districts, no storm circles, saved player position.
 *  - 2. Battle Royale Mode:
 *       - Shrinking Safe Zone & Electric Blue Zone storm barrier (cylindrical 3D energy wall).
 *       - Storm damage over time when caught in the blue zone.
 *       - Tactical Supply Loot Crates spawned across Kaifeng landmarks with HP/Armor recovery.
 *       - Operative survival tracking & match timer.
 *       - Audio alerts (storm siren, loot pickup).
 *  - 3. Mobile optimization: Single instanced storm barrier, spatial supply queries, zero performance overhead.
 */

import * as THREE from 'three';
import { soundEngine } from './audio';

export type GameMode = 'open_world' | 'battle_royale';

export interface SupplyCrate {
  id: string;
  name: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  isLooted: boolean;
  beaconLight: THREE.PointLight;
}

export class BattleRoyaleManager {
  public group: THREE.Group = new THREE.Group();
  public mode: GameMode = 'open_world';

  // Zone Coordinates & Phasing
  public zoneCenter: THREE.Vector2 = new THREE.Vector2(180, 240);
  public safeZoneRadius: number = 320;
  public blueZoneRadius: number = 340;
  public targetRadius: number = 320;

  public phase: number = 1;
  public phaseTimer: number = 90; // seconds per phase
  public isShrinking: boolean = false;
  public aliveCount: number = 50;

  // 3D Storm Barrier
  private stormMesh!: THREE.Mesh;
  private stormMaterial!: THREE.MeshStandardMaterial;

  // Supply Loot Crates
  public supplyCrates: SupplyCrate[] = [];

  // Match stats
  private lastDamageTime: number = 0;
  private stormAlertPlayed: boolean = false;

  constructor() {
    this.createStormBarrier();
    this.spawnSupplyCrates();
    this.loadSavedPosition();
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
    this.stormMesh.visible = (mode === 'battle_royale');
    this.supplyCrates.forEach((c) => {
      c.mesh.visible = (mode === 'battle_royale' || !c.isLooted);
    });

    if (mode === 'battle_royale') {
      this.resetMatch();
    }
  }

  public toggleMode(): GameMode {
    const next: GameMode = this.mode === 'open_world' ? 'battle_royale' : 'open_world';
    this.setMode(next);
    return next;
  }

  private resetMatch() {
    this.phase = 1;
    this.safeZoneRadius = 300;
    this.blueZoneRadius = 330;
    this.targetRadius = 200;
    this.phaseTimer = 75;
    this.isShrinking = false;
    this.aliveCount = 50;
    this.stormAlertPlayed = false;

    // Reset crates
    this.supplyCrates.forEach((c) => {
      c.isLooted = false;
      c.beaconLight.visible = true;
      c.beaconLight.color.setHex(0x00FF88);
    });
  }

  private createStormBarrier() {
    // 3D Translucent Blue Energy Barrier Cylinder
    const geo = new THREE.CylinderGeometry(1, 1, 120, 64, 1, true);
    this.stormMaterial = new THREE.MeshStandardMaterial({
      color: 0x00B4D8,
      emissive: 0x0077B6,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.4,
    });

    this.stormMesh = new THREE.Mesh(geo, this.stormMaterial);
    this.stormMesh.position.set(this.zoneCenter.x, 30, this.zoneCenter.y);
    this.stormMesh.scale.set(this.blueZoneRadius, 1, this.blueZoneRadius);
    this.stormMesh.visible = false;
    this.group.add(this.stormMesh);
  }

  private spawnSupplyCrates() {
    const crateLocations = [
      { id: 'crate_bell_tower', name: 'Bell Tower Airdrop', x: 225, y: 6.2, z: 140 },
      { id: 'crate_grand_bridge', name: 'Grand Bridge Airdrop', x: 65, y: 5.2, z: 5 },
      { id: 'crate_palace_court', name: 'Imperial Palace Airdrop', x: 200, y: 6.2, z: 310 },
      { id: 'crate_market_wharf', name: 'River Market Airdrop', x: 115, y: 4.2, z: 85 },
      { id: 'crate_dragon_barge', name: 'Dragon Barge Airdrop', x: 105, y: 2.3, z: 26 },
      { id: 'crate_cloud_temple', name: 'Cloud Temple Airdrop', x: 110, y: 15.0, z: 495 },
      { id: 'crate_eagle_bastion', name: 'Eagle Bastion Airdrop', x: 475, y: 25.0, z: 575 },
      { id: 'crate_heavenly_lake', name: 'Moon Pavilion Airdrop', x: 25, y: 9.2, z: 560 },
      { id: 'crate_siheyuan_court', name: 'Siheyuan Airdrop', x: 130, y: 4.6, z: 200 },
      { id: 'crate_citadel_pass', name: 'Yanmen Pass Airdrop', x: 420, y: 22.0, z: 510 },
    ];

    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x2A3439,
      roughness: 0.6,
      metalness: 0.7,
    });

    crateLocations.forEach((loc) => {
      const crateGroup = new THREE.Group();
      crateGroup.position.set(loc.x, loc.y, loc.z);

      // Military Crate Body (1.4m x 0.9m x 1.4m)
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.4), crateMat);
      body.position.y = 0.45;
      body.castShadow = true;
      crateGroup.add(body);

      // Yellow Military Identification Stripes
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xF3C623, roughness: 0.4 });
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.15, 1.42), stripeMat);
      stripe.position.y = 0.45;
      crateGroup.add(stripe);

      // Green Airdrop Smoke Flare / Beacon Light
      const beaconLight = new THREE.PointLight(0x00FF88, 2.5, 12);
      beaconLight.position.set(0, 1.2, 0);
      crateGroup.add(beaconLight);

      this.group.add(crateGroup);

      this.supplyCrates.push({
        id: loc.id,
        name: loc.name,
        position: new THREE.Vector3(loc.x, loc.y, loc.z),
        mesh: crateGroup,
        isLooted: false,
        beaconLight,
      });
    });
  }

  /**
   * Find nearest supply crate within interaction distance
   */
  public getNearestSupplyCrate(playerPos: THREE.Vector3, maxDist: number = 3.6): SupplyCrate | null {
    let nearest: SupplyCrate | null = null;
    let minDist = maxDist;

    for (let i = 0; i < this.supplyCrates.length; i++) {
      const c = this.supplyCrates[i];
      if (c.isLooted) continue;
      const dist = playerPos.distanceTo(c.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = c;
      }
    }
    return nearest;
  }

  /**
   * Loot supply crate, restoring HP & Armor and playing audio
   */
  public lootCrate(playerPos: THREE.Vector3): { looted: boolean; hpRestored: number; armorRestored: number } {
    const crate = this.getNearestSupplyCrate(playerPos);
    if (!crate || crate.isLooted) {
      return { looted: false, hpRestored: 0, armorRestored: 0 };
    }

    crate.isLooted = true;
    crate.beaconLight.color.setHex(0x555555);
    crate.beaconLight.intensity = 0.4;
    soundEngine.playLootPickup();

    return { looted: true, hpRestored: 50, armorRestored: 50 };
  }

  /**
   * Update match loop, storm movement, safe zone shrinkage, and player damage
   */
  public update(delta: number, elapsed: number, playerPos: THREE.Vector3, onDamage?: (dmg: number) => void) {
    // 1. In Open World Mode, auto-save location every 5 seconds
    if (this.mode === 'open_world') {
      if (Math.floor(elapsed) % 5 === 0 && Math.floor(elapsed - delta) % 5 !== 0) {
        this.savePosition(playerPos);
      }
      return;
    }

    // 2. Battle Royale Match Logic
    this.phaseTimer -= delta;

    if (this.phaseTimer <= 0) {
      if (!this.isShrinking) {
        // Start shrinking phase
        this.isShrinking = true;
        this.phaseTimer = 35; // 35s shrink duration
        if (!this.stormAlertPlayed) {
          soundEngine.playStormAlert();
          this.stormAlertPlayed = true;
        }
      } else {
        // Advance to next phase
        this.isShrinking = false;
        this.phase++;
        this.stormAlertPlayed = false;

        if (this.phase === 2) {
          this.targetRadius = 130;
          this.phaseTimer = 60;
        } else if (this.phase === 3) {
          this.targetRadius = 60;
          this.phaseTimer = 45;
        } else if (this.phase >= 4) {
          this.targetRadius = 25;
          this.phaseTimer = 30;
        }

        // Decrement alive count as safe zones collapse
        this.aliveCount = Math.max(1, this.aliveCount - Math.floor(8 + Math.random() * 6));
      }
    }

    // Shrink blue zone toward target radius
    if (this.isShrinking) {
      this.blueZoneRadius = THREE.MathUtils.damp(this.blueZoneRadius, this.targetRadius, 0.4, delta);
      this.safeZoneRadius = this.targetRadius;
    }

    // Update 3D Storm Mesh position and scale
    this.stormMesh.scale.set(this.blueZoneRadius, 1, this.blueZoneRadius);
    this.stormMaterial.opacity = 0.35 + Math.sin(elapsed * 4.0) * 0.08;

    // Check if player is outside Blue Zone
    const playerDist = Math.hypot(playerPos.x - this.zoneCenter.x, playerPos.z - this.zoneCenter.y);
    if (playerDist > this.blueZoneRadius) {
      // Outside storm: take damage over time
      if (elapsed - this.lastDamageTime >= 1.0) {
        this.lastDamageTime = elapsed;
        const damageRate = this.phase === 1 ? 2.5 : this.phase === 2 ? 5.0 : 9.0;
        onDamage?.(damageRate);
      }
    }

    // Subtle beacon light pulsing on crates
    this.supplyCrates.forEach((c, i) => {
      if (!c.isLooted) {
        c.beaconLight.intensity = 2.0 + Math.sin(elapsed * 5.0 + i) * 0.8;
      }
    });
  }

  private savePosition(pos: THREE.Vector3) {
    try {
      localStorage.setItem(
        'kaifeng_dreamworld_player_pos',
        JSON.stringify({ x: pos.x, y: pos.y, z: pos.z })
      );
    } catch {
      // Storage unavailable or disabled
    }
  }

  private loadSavedPosition(): THREE.Vector3 | null {
    try {
      const data = localStorage.getItem('kaifeng_dreamworld_player_pos');
      if (data) {
        const parsed = JSON.parse(data);
        return new THREE.Vector3(parsed.x, parsed.y, parsed.z);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  public getSavedPosition(): THREE.Vector3 | null {
    return this.loadSavedPosition();
  }
}
