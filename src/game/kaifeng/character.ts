/**
 * 3D Open-World Tactical Character Controller — Free Fire & PUBG Battle Royale Operative
 * Features:
 *  - Authentic military operative model: Level 3 Spetsnaz combat helmet, tactical plate carrier vest,
 *    military assault backpack, drop-leg thigh holster with sidearm, cargo camo trousers, combat boots,
 *    detailed M416 assault rifle, melee blade/pan, and tactical comms headset.
 *  - Full Battle Royale movement states: Stand / Sprint, Tactical Crouch, Commando Prone Crawl.
 *  - Aim Down Sights (ADS) tactical stance with over-the-shoulder scope alignment.
 *  - Dynamic melee punch / attack combo with tactical audio.
 *  - Weapon switching: Primary Assault Rifle, Melee Katana/Pan, Tactical Fists.
 *  - Free-look (eyeball camera) decoupling.
 *  - Health & Armor tracking with quick heal.
 *  - Multi-surface collision detection and water swimming physics.
 */

import * as THREE from 'three';
import { TerrainManager } from './terrain';
import { ExpandedDockManager } from './dock';
import { AncientBridgeManager } from './bridge';
import { CityEntranceManager } from './cityEntrance';
import { AncientCityManager } from './ancientCity';
import { ChineseHeritageExpansionManager } from './chineseHeritageExpansion';
import { KaifengDynastyManager } from './kaifengGrandDynasty';
import { KaifengArchitectureManager } from './kaifengArchitecture';
import { soundEngine } from './audio';

export interface CharacterInput {
  forward: number; // -1 to 1
  right: number;   // -1 to 1
  sprint: boolean;
  jump: boolean;
  crouch?: boolean;
  prone?: boolean;
  aim?: boolean;
  attack?: boolean;
  freeLook?: boolean;
  weapon?: 'rifle' | 'melee' | 'fists';
}

export type MovementStance = 'stand' | 'crouch' | 'prone';

export class CharacterController {
  public group: THREE.Group = new THREE.Group();
  public position: THREE.Vector3 = new THREE.Vector3(5, 1.2, -8); // Spawns on dock approach
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded: boolean = true;
  public inWater: boolean = false;
  public currentSurface: 'wood' | 'stone' | 'grass' | 'earth' | 'water' = 'wood';

  // Tactical Battle Royale Stance & Combat States
  public stance: MovementStance = 'stand';
  public isAiming: boolean = false;
  public activeWeapon: 'rifle' | 'melee' | 'fists' = 'rifle';
  public hp: number = 100;
  public armor: number = 100;
  public isAttacking: boolean = false;
  private attackTimer: number = 0;

  // Hierarchical Body Groups for Free Fire / PUBG animations
  private bodyRoot: THREE.Group = new THREE.Group();
  private torsoGroup: THREE.Group = new THREE.Group();
  private headGroup: THREE.Group = new THREE.Group();
  private leftLegGroup: THREE.Group = new THREE.Group();
  private rightLegGroup: THREE.Group = new THREE.Group();
  private leftArmGroup: THREE.Group = new THREE.Group();
  private rightArmGroup: THREE.Group = new THREE.Group();

  // Weapon meshes
  private handRifle!: THREE.Group;
  private handKatana!: THREE.Group;
  private backRifle!: THREE.Group;
  private backPan!: THREE.Group;

  // Kinematic parameters
  private walkCycleTime: number = 0;
  private footstepTimer: number = 0;
  public yawAngle: number = 0;
  private verticalVelocity: number = 0;

  constructor(
    private terrain: TerrainManager,
    private dock: ExpandedDockManager,
    public bridge?: AncientBridgeManager,
    public cityEntrance?: CityEntranceManager,
    public ancientCity?: AncientCityManager,
    public chineseHeritage?: ChineseHeritageExpansionManager,
    public kaifengDynasty?: KaifengDynastyManager,
    public kaifengArch?: KaifengArchitectureManager
  ) {
    this.buildTacticalCharacter();
    this.group.add(this.bodyRoot);
    this.group.position.copy(this.position);
  }

  public setBridge(bridge: AncientBridgeManager) {
    this.bridge = bridge;
  }

  public setCityEntrance(city: CityEntranceManager) {
    this.cityEntrance = city;
  }

  public setAncientCity(city: AncientCityManager) {
    this.ancientCity = city;
  }

  public setChineseHeritage(heritage: ChineseHeritageExpansionManager) {
    this.chineseHeritage = heritage;
  }

  public setKaifengDynasty(dynasty: KaifengDynastyManager) {
    this.kaifengDynasty = dynasty;
  }

  public setKaifengArchitecture(arch: KaifengArchitectureManager) {
    this.kaifengArch = arch;
  }

  /**
   * Builds high-fidelity realistic Free Fire & PUBG operative
   */
  private buildTacticalCharacter() {
    // Materials
    const camoVestMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C382A'), // Dark tactical olive camo
      roughness: 0.65,
      metalness: 0.15,
    });

    const blackArmorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1E2224'), // Matte black ballistic armor
      roughness: 0.45,
      metalness: 0.35,
    });

    const combatShirtMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#384236'), // Camo combat shirt
      roughness: 0.75,
    });

    const cargoPantsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2B3029'), // Tactical cargo trousers
      roughness: 0.8,
    });

    const leatherBootsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#181A1B'), // Black combat boots
      roughness: 0.5,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D8A276'), // Realistic skin tone
      roughness: 0.6,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#101518'), // Dark ballistic visor glass
      roughness: 0.1,
      metalness: 0.9,
    });

    const gunMetalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#202326'), // Matte blued gunmetal
      roughness: 0.35,
      metalness: 0.8,
    });

    const gunPolyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#161819'), // Polymer grip & stock
      roughness: 0.6,
      metalness: 0.1,
    });

    // 1. Torso & Ballistic Plate Carrier Vest (Level 3 Vest)
    this.torsoGroup.position.set(0, 1.15, 0);
    this.bodyRoot.add(this.torsoGroup);

    // Combat shirt base
    const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.28), combatShirtMat);
    shirt.castShadow = true;
    this.torsoGroup.add(shirt);

    // Ballistic Plate Carrier front
    const vestFront = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.12), camoVestMat);
    vestFront.position.set(0, 0.02, 0.11);
    vestFront.castShadow = true;
    this.torsoGroup.add(vestFront);

    // Ballistic Plate Carrier back
    const vestBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.1), camoVestMat);
    vestBack.position.set(0, 0.02, -0.11);
    vestBack.castShadow = true;
    this.torsoGroup.add(vestBack);

    // MOLLE Mag Pouches (triple rifle mag pouch on chest)
    for (let i = -1; i <= 1; i++) {
      const magPouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.07), blackArmorMat);
      magPouch.position.set(i * 0.14, -0.08, 0.18);
      this.torsoGroup.add(magPouch);
    }

    // Tactical Radio Comms on left shoulder strap
    const radio = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.06), blackArmorMat);
    radio.position.set(-0.2, 0.18, 0.15);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.18), blackArmorMat);
    antenna.position.set(-0.2, 0.32, 0.15);
    this.torsoGroup.add(radio, antenna);

    // Tactical Duty Belt with cobra buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.12, 0.32), blackArmorMat);
    belt.position.set(0, -0.28, 0);
    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.1, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.85, roughness: 0.25 })
    );
    buckle.position.set(0, -0.28, 0.16);
    this.torsoGroup.add(belt, buckle);

    // Level 3 Military Tactical Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.22), camoVestMat);
    backpack.position.set(0, 0.05, -0.24);
    backpack.castShadow = true;
    // Rolled sleeping mat on top of backpack
    const bedroll = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.46, 12), camoVestMat);
    bedroll.rotation.z = Math.PI / 2;
    bedroll.position.set(0, 0.32, -0.24);
    this.torsoGroup.add(backpack, bedroll);

    // 2. Head & Level 3 Spetsnaz Helmet
    this.headGroup.position.set(0, 0.42, 0);
    this.torsoGroup.add(this.headGroup);

    // Neck & Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), skinMat);
    head.position.set(0, 0.12, 0.02);
    head.castShadow = true;
    this.headGroup.add(head);

    // Tactical Shemagh / Balaclava neck wrap
    const shemagh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.15, 12), blackArmorMat);
    shemagh.position.set(0, 0.02, 0.02);
    this.headGroup.add(shemagh);

    // Level 3 Spetsnaz Combat Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.7), camoVestMat);
    helmet.position.set(0, 0.16, 0.02);
    helmet.castShadow = true;
    this.headGroup.add(helmet);

    // Helmet dark ballistic visor
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.1, 0.14), visorMat);
    visor.position.set(0, 0.13, 0.14);
    this.headGroup.add(visor);

    // Tactical Headset with boom microphone
    const earLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), blackArmorMat);
    earLeft.rotation.z = Math.PI / 2;
    earLeft.position.set(-0.21, 0.12, 0.02);

    const earRight = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), blackArmorMat);
    earRight.rotation.z = Math.PI / 2;
    earRight.position.set(0.21, 0.12, 0.02);

    const micArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14), blackArmorMat);
    micArm.rotation.x = Math.PI / 3;
    micArm.position.set(-0.2, 0.06, 0.1);
    this.headGroup.add(earLeft, earRight, micArm);

    // 3. Legs & Combat Boots
    this.leftLegGroup.position.set(-0.16, 0.85, 0);
    this.rightLegGroup.position.set(0.16, 0.85, 0);
    this.bodyRoot.add(this.leftLegGroup, this.rightLegGroup);

    const legGeom = new THREE.BoxGeometry(0.18, 0.72, 0.2);
    const leftPants = new THREE.Mesh(legGeom, cargoPantsMat);
    leftPants.position.set(0, -0.36, 0);
    leftPants.castShadow = true;
    this.leftLegGroup.add(leftPants);

    const rightPants = new THREE.Mesh(legGeom, cargoPantsMat);
    rightPants.position.set(0, -0.36, 0);
    rightPants.castShadow = true;
    this.rightLegGroup.add(rightPants);

    // Knee Pads (PUBG tactical knee armor)
    const kneeGeom = new THREE.BoxGeometry(0.19, 0.16, 0.08);
    const leftKnee = new THREE.Mesh(kneeGeom, blackArmorMat);
    leftKnee.position.set(0, -0.35, 0.11);
    this.leftLegGroup.add(leftKnee);

    const rightKnee = new THREE.Mesh(kneeGeom, blackArmorMat);
    rightKnee.position.set(0, -0.35, 0.11);
    this.rightLegGroup.add(rightKnee);

    // Drop-leg Tactical Thigh Holster on right leg
    const thighHolster = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.14), blackArmorMat);
    thighHolster.position.set(0.11, -0.22, 0.02);
    const sidearmGrip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.06), gunPolyMat);
    sidearmGrip.position.set(0.11, -0.12, 0.02);
    this.rightLegGroup.add(thighHolster, sidearmGrip);

    // Tactical High-cut Combat Boots
    const bootGeom = new THREE.BoxGeometry(0.19, 0.22, 0.3);
    const leftBoot = new THREE.Mesh(bootGeom, leatherBootsMat);
    leftBoot.position.set(0, -0.68, 0.04);
    leftBoot.castShadow = true;
    this.leftLegGroup.add(leftBoot);

    const rightBoot = new THREE.Mesh(bootGeom, leatherBootsMat);
    rightBoot.position.set(0, -0.68, 0.04);
    rightBoot.castShadow = true;
    this.rightLegGroup.add(rightBoot);

    // 4. Arms & Tactical Combat Gloves
    this.leftArmGroup.position.set(-0.35, 0.25, 0);
    this.rightArmGroup.position.set(0.35, 0.25, 0);
    this.torsoGroup.add(this.leftArmGroup, this.rightArmGroup);

    const bicepGeom = new THREE.BoxGeometry(0.14, 0.34, 0.16);
    const leftBicep = new THREE.Mesh(bicepGeom, combatShirtMat);
    leftBicep.position.set(0, -0.16, 0);
    leftBicep.castShadow = true;
    this.leftArmGroup.add(leftBicep);

    const rightBicep = new THREE.Mesh(bicepGeom, combatShirtMat);
    rightBicep.position.set(0, -0.16, 0);
    rightBicep.castShadow = true;
    this.rightArmGroup.add(rightBicep);

    // Forearms with Tactical Watch & Gloves
    const forearmGeom = new THREE.BoxGeometry(0.13, 0.32, 0.14);
    const leftForearm = new THREE.Mesh(forearmGeom, skinMat);
    leftForearm.position.set(0, -0.46, 0);
    leftForearm.castShadow = true;
    this.leftArmGroup.add(leftForearm);

    const rightForearm = new THREE.Mesh(forearmGeom, skinMat);
    rightForearm.position.set(0, -0.46, 0);
    rightForearm.castShadow = true;
    this.rightArmGroup.add(rightForearm);

    // Tactical Watch on left wrist
    const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 10), blackArmorMat);
    watch.position.set(0, -0.42, 0.08);
    this.leftArmGroup.add(watch);

    // Tactical Gloves
    const gloveGeom = new THREE.BoxGeometry(0.14, 0.16, 0.15);
    const leftGlove = new THREE.Mesh(gloveGeom, blackArmorMat);
    leftGlove.position.set(0, -0.58, 0);
    this.leftArmGroup.add(leftGlove);

    const rightGlove = new THREE.Mesh(gloveGeom, blackArmorMat);
    rightGlove.position.set(0, -0.58, 0);
    this.rightArmGroup.add(rightGlove);

    // 5. Build Weapons
    this.buildWeapons(gunMetalMat, gunPolyMat);
  }

  /**
   * Modeled weapons: M416 Assault Rifle, Tactical Melee Katana, Level 3 Pan
   */
  private buildWeapons(metalMat: THREE.Material, polyMat: THREE.Material) {
    // A. M416 Assault Rifle
    const rifle = new THREE.Group();
    // Receiver
    const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.36), metalMat);
    rifle.add(receiver);
    // Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.38, 8), metalMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.36);
    rifle.add(barrel);
    // Optical Scope (ACOG 4x style)
    const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.16, 10), polyMat);
    scope.rotation.x = Math.PI / 2;
    scope.position.set(0, 0.08, 0.04);
    rifle.add(scope);
    // Magazine (Curved 30-round mag)
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.2, 0.1), polyMat);
    mag.position.set(0, -0.12, 0.12);
    mag.rotation.x = 0.25;
    rifle.add(mag);
    // Tactical Stock
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.22), polyMat);
    stock.position.set(0, -0.01, -0.26);
    rifle.add(stock);

    this.handRifle = rifle.clone();
    this.handRifle.position.set(0.12, -0.56, 0.32);
    this.handRifle.rotation.set(-0.2, -0.1, 0);
    this.rightArmGroup.add(this.handRifle);

    // Back mounted rifle (when unequipped or on back)
    this.backRifle = rifle.clone();
    this.backRifle.position.set(0.18, 0.06, -0.36);
    this.backRifle.rotation.set(0.35, 0, 0.7);
    this.torsoGroup.add(this.backRifle);

    // B. Melee Katana / Blade
    this.handKatana = new THREE.Group();
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.75, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.9, roughness: 0.2 })
    );
    blade.position.set(0, 0.35, 0);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08), metalMat);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.22, 8), polyMat);
    hilt.position.set(0, -0.11, 0);
    this.handKatana.add(blade, guard, hilt);
    this.handKatana.position.set(0, -0.58, 0.15);
    this.handKatana.rotation.x = Math.PI / 2;
    this.handKatana.visible = false;
    this.rightArmGroup.add(this.handKatana);

    // C. Back Melee Pan / Holster
    this.backPan = new THREE.Group();
    const panBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16), metalMat);
    panBody.rotation.x = Math.PI / 2;
    const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), polyMat);
    panHandle.position.set(0, -0.18, 0);
    this.backPan.add(panBody, panHandle);
    this.backPan.position.set(-0.16, -0.22, -0.28);
    this.backPan.rotation.set(0, 0, -0.4);
    this.torsoGroup.add(this.backPan);

    this.updateWeaponVisibility();
  }

  public setWeapon(weapon: 'rifle' | 'melee' | 'fists') {
    if (this.activeWeapon === weapon) return;
    this.activeWeapon = weapon;
    soundEngine.playWeaponSwitch();
    this.updateWeaponVisibility();
  }

  private updateWeaponVisibility() {
    if (this.activeWeapon === 'rifle') {
      this.handRifle.visible = true;
      this.handKatana.visible = false;
      this.backRifle.visible = false;
      this.backPan.visible = true;
    } else if (this.activeWeapon === 'melee') {
      this.handRifle.visible = false;
      this.handKatana.visible = true;
      this.backRifle.visible = true;
      this.backPan.visible = false;
    } else {
      this.handRifle.visible = false;
      this.handKatana.visible = false;
      this.backRifle.visible = true;
      this.backPan.visible = true;
    }
  }

  public setStance(newStance: MovementStance) {
    if (this.stance === newStance) return;
    this.stance = newStance;
    soundEngine.playCrouch();
  }

  public toggleCrouch() {
    this.setStance(this.stance === 'crouch' ? 'stand' : 'crouch');
  }

  public toggleProne() {
    this.setStance(this.stance === 'prone' ? 'stand' : 'prone');
  }

  public toggleAim(forceAim?: boolean) {
    const next = forceAim !== undefined ? forceAim : !this.isAiming;
    if (this.isAiming !== next) {
      this.isAiming = next;
      soundEngine.playScope();
    }
  }

  public triggerAttack() {
    if (this.attackTimer <= 0) {
      this.attackTimer = 0.35;
      this.isAttacking = true;
      soundEngine.playPunch();
    }
  }

  public heal() {
    if (this.hp < 100 || this.armor < 100) {
      this.hp = Math.min(100, this.hp + 40);
      this.armor = Math.min(100, this.armor + 30);
      soundEngine.playHeal();
    }
  }

  public takeDamage(amount: number) {
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount * 0.7);
      this.armor -= absorbed;
      amount -= absorbed;
    }
    this.hp = Math.max(1, this.hp - amount);
  }

  public restoreStats(hp: number, armor: number) {
    this.hp = Math.min(100, this.hp + hp);
    this.armor = Math.min(100, this.armor + armor);
  }

  public update(delta: number, input: CharacterInput, cameraForwardAngle: number) {
    const moveX = input.right;
    const moveZ = input.forward;
    const isMoving = Math.abs(moveX) > 0.1 || Math.abs(moveZ) > 0.1;

    // Handle weapon switch input
    if (input.weapon && input.weapon !== this.activeWeapon) {
      this.setWeapon(input.weapon);
    }

    // Handle Crouch / Prone toggles
    if (input.crouch) {
      this.toggleCrouch();
    }
    if (input.prone) {
      this.toggleProne();
    }

    // Handle ADS Aiming
    if (input.aim !== undefined && input.aim !== this.isAiming) {
      this.toggleAim(input.aim);
    }

    // Handle Attack punch / swing
    if (input.attack) {
      this.triggerAttack();
    }

    if (this.attackTimer > 0) {
      this.attackTimer -= delta;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Battle royale speed scaling by stance
    let baseSpeed = 8.5;
    if (this.stance === 'prone') {
      baseSpeed = 2.6;
    } else if (this.stance === 'crouch') {
      baseSpeed = input.sprint ? 7.0 : 4.8;
    } else {
      baseSpeed = input.sprint ? 20.0 : 8.5;
    }

    const effectiveSpeed = this.inWater ? baseSpeed * 0.6 : baseSpeed;

    // Tactical Free-look & movement angle
    if (isMoving) {
      const inputAngle = Math.atan2(moveX, moveZ);
      const targetYaw = cameraForwardAngle + inputAngle;

      const diff = Math.atan2(Math.sin(targetYaw - this.yawAngle), Math.cos(targetYaw - this.yawAngle));
      this.yawAngle += diff * Math.min(1.0, delta * 18);
      this.group.rotation.y = this.yawAngle;

      const speed = effectiveSpeed * Math.min(1.0, Math.sqrt(moveX * moveX + moveZ * moveZ));
      const forwardVec = new THREE.Vector3(Math.sin(this.yawAngle), 0, Math.cos(this.yawAngle));
      this.position.x += forwardVec.x * speed * delta;
      this.position.z += forwardVec.z * speed * delta;

      // Animation cycle
      const cycleSpeed = this.stance === 'prone' ? 8 : input.sprint ? 20 : 12;
      this.walkCycleTime += delta * cycleSpeed;

      // Footstep sound
      this.footstepTimer += delta;
      const footstepInterval = input.sprint ? 0.16 : this.stance === 'crouch' ? 0.38 : 0.28;
      if (this.footstepTimer > footstepInterval && this.stance !== 'prone') {
        this.footstepTimer = 0;
        soundEngine.playFootstep(this.currentSurface === 'earth' ? 'grass' : this.currentSurface);
      }
    } else {
      this.walkCycleTime += delta * 2;
    }

    // Procedural Stance & Locomotion Animation
    this.animateStance(delta, isMoving, input.sprint);

    // Jump Physics (Vault jump available in stand/crouch)
    const GRAVITY = -24.0;
    if (input.jump && this.isGrounded && this.stance !== 'prone') {
      this.verticalVelocity = this.inWater ? 6.5 : 9.5;
      this.isGrounded = false;
      soundEngine.playJump();
    }

    this.verticalVelocity += GRAVITY * delta;
    this.position.y += this.verticalVelocity * delta;

    // Ground and Collision Resolution
    const groundInfo = this.resolveGroundHeight(this.position.x, this.position.z);
    if (this.position.y <= groundInfo.height) {
      this.position.y = groundInfo.height;
      this.verticalVelocity = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.currentSurface = groundInfo.surface;
    this.inWater = groundInfo.inWater;

    this.group.position.copy(this.position);
  }

  /**
   * Procedural Free Fire & PUBG battle royale skeletal posing
   */
  private animateStance(delta: number, isMoving: boolean, isSprinting: boolean) {
    if (this.stance === 'prone') {
      // 1. Commando Prone Stance: body lies flat on the ground
      this.bodyRoot.rotation.x = THREE.MathUtils.damp(this.bodyRoot.rotation.x, -Math.PI / 2, 12, delta);
      this.bodyRoot.position.y = THREE.MathUtils.damp(this.bodyRoot.position.y, 0.22, 12, delta);
      this.torsoGroup.position.y = 1.0;

      if (isMoving) {
        // Commando belly crawl
        const crawl = Math.sin(this.walkCycleTime) * 0.4;
        this.leftLegGroup.rotation.x = crawl;
        this.rightLegGroup.rotation.x = -crawl;
        this.leftArmGroup.rotation.x = -crawl * 0.9;
        this.rightArmGroup.rotation.x = crawl * 0.9;
      } else {
        this.leftLegGroup.rotation.x = 0;
        this.rightLegGroup.rotation.x = 0;
      }
      return;
    }

    // Stand or Crouch
    this.bodyRoot.rotation.x = THREE.MathUtils.damp(this.bodyRoot.rotation.x, 0, 14, delta);
    this.bodyRoot.position.y = THREE.MathUtils.damp(this.bodyRoot.position.y, 0, 14, delta);

    if (this.stance === 'crouch') {
      // 2. Tactical Crouch: Torso lowered, legs bent, silent stealth posture
      this.torsoGroup.position.y = THREE.MathUtils.damp(this.torsoGroup.position.y, 0.85, 14, delta);
      const legBend = 0.35;
      this.leftLegGroup.position.y = 0.65;
      this.rightLegGroup.position.y = 0.65;

      if (isMoving) {
        const swing = Math.sin(this.walkCycleTime) * 0.45;
        this.leftLegGroup.rotation.x = swing + legBend;
        this.rightLegGroup.rotation.x = -swing + legBend;
      } else {
        this.leftLegGroup.rotation.x = legBend;
        this.rightLegGroup.rotation.x = legBend;
      }
    } else {
      // 3. Tactical Stand
      this.torsoGroup.position.y = THREE.MathUtils.damp(this.torsoGroup.position.y, 1.15, 14, delta);
      this.leftLegGroup.position.y = 0.85;
      this.rightLegGroup.position.y = 0.85;

      if (isMoving) {
        const legSwing = Math.sin(this.walkCycleTime) * (isSprinting ? 0.85 : 0.5);
        this.leftLegGroup.rotation.x = legSwing;
        this.rightLegGroup.rotation.x = -legSwing;
        this.torsoGroup.position.y = 1.15 + Math.abs(Math.sin(this.walkCycleTime * 2)) * 0.05;
      } else {
        this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0, 10, delta);
        this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, 0, 10, delta);
        this.torsoGroup.position.y = 1.15 + Math.sin(this.walkCycleTime) * 0.015;
      }
    }

    // Arm Posing: Aiming (ADS), Attack punch, or standard run/idle
    if (this.isAttacking) {
      // Tactical punch / melee thrust
      this.rightArmGroup.rotation.x = -1.45;
      this.rightArmGroup.position.z = 0.22;
      this.leftArmGroup.rotation.x = -0.5;
    } else if (this.isAiming && this.activeWeapon === 'rifle') {
      // ADS Tactical 2-Handed Rifle Shoulder Aim
      this.rightArmGroup.rotation.x = -1.35;
      this.rightArmGroup.rotation.y = -0.3;
      this.rightArmGroup.position.z = 0.08;
      this.leftArmGroup.rotation.x = -1.25;
      this.leftArmGroup.rotation.y = 0.55;
      this.leftArmGroup.position.z = 0.12;
    } else if (this.activeWeapon === 'rifle') {
      // Tactical Low-Ready Rifle carry
      this.rightArmGroup.rotation.x = -0.65;
      this.rightArmGroup.rotation.y = -0.15;
      this.rightArmGroup.position.z = 0.04;
      this.leftArmGroup.rotation.x = -0.55;
      this.leftArmGroup.rotation.y = 0.35;
      this.leftArmGroup.position.z = 0.06;
    } else if (isMoving) {
      const armSwing = Math.sin(this.walkCycleTime) * (isSprinting ? 0.8 : 0.45);
      this.leftArmGroup.rotation.x = -armSwing;
      this.rightArmGroup.rotation.x = armSwing;
      this.rightArmGroup.position.z = 0;
      this.leftArmGroup.position.z = 0;
    } else {
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 0, 10, delta);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0, 10, delta);
      this.rightArmGroup.position.z = 0;
      this.leftArmGroup.position.z = 0;
    }
  }

  /**
   * Resolves composite ground collision
   */
  private resolveGroundHeight(x: number, z: number): { height: number; surface: 'wood' | 'stone' | 'grass' | 'earth' | 'water'; inWater: boolean } {
    // -2. Check Kaifeng Grand Dynasty Architecture (Landmarks, Palaces, Bridges, Market Shops, Siheyuan, Pagoda, Barge)
    if (this.kaifengArch) {
      const archResult = this.kaifengArch.queryArchitectureCollision(x, z);
      if (archResult.onSurface) {
        return { height: archResult.height, surface: archResult.surface, inWater: archResult.surface === 'water' };
      }
    }

    // -1. Check Kaifeng Grand Dynasty (Farmlands, Royal Gardens, Mountain Village, Great Wall Ridge, Heavenly Lake, Xuande Gate)
    if (this.kaifengDynasty) {
      const kdResult = this.kaifengDynasty.queryDynastyCollision(x, z);
      if (kdResult.onSurface) {
        return { height: kdResult.height, surface: kdResult.surface, inWater: kdResult.surface === 'water' };
      }
    }

    // 0. Check Chinese Heritage Expansion (Mountains, Tianyun Temple, Zhandao, Siheyuan, Great Wall, Water-Town)
    if (this.chineseHeritage) {
      for (const c of this.chineseHeritage.colliders) {
        if (c.isSolidWall && x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
          return { height: c.height, surface: c.surface, inWater: false };
        }
      }
      for (const c of this.chineseHeritage.colliders) {
        if (!c.isSolidWall && x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
          return { height: c.height, surface: c.surface, inWater: false };
        }
      }
    }

    // 1. Check Ancient Chinese City
    if (this.ancientCity) {
      const cityResult = this.ancientCity.queryCityCollision(x, z);
      if (cityResult.onSurface) {
        return { height: cityResult.height, surface: cityResult.surface, inWater: false };
      }
    }

    // 2. Check Grand Ancient City Entrance District
    if (this.cityEntrance) {
      const cityResult = this.cityEntrance.queryCityCollision(x, z);
      if (cityResult.onSurface) {
        return { height: cityResult.height, surface: cityResult.surface, inWater: false };
      }
    }

    // 3. Check Grand Ancient Wooden Bridge
    if (this.bridge) {
      const bridgeResult = this.bridge.queryBridgeCollision(x, z);
      if (bridgeResult.onBridge) {
        return { height: bridgeResult.height, surface: bridgeResult.surface, inWater: false };
      }
    }

    // 4. Dhaka bridge deck
    if (x >= -58.5 && x <= -51.5 && z >= -27 && z <= 27) {
      return { height: 5.5, surface: 'stone', inWater: false };
    }

    // 5. Wooden dock collision
    const dockResult = this.dock.queryDockCollision(x, z);
    if (dockResult.onDock) {
      return { height: dockResult.height, surface: 'wood', inWater: false };
    }

    // 6. Terrain collision
    const terrainResult = this.terrain.queryPoint(x, z);
    if (terrainResult.height < -0.4) {
      return { height: -0.35, surface: 'water', inWater: true };
    }

    return {
      height: terrainResult.height,
      surface: terrainResult.surface,
      inWater: terrainResult.inWater,
    };
  }

  public teleport(x: number, z: number) {
    this.position.x = x;
    this.position.z = z;
    const ground = this.resolveGroundHeight(x, z);
    this.position.y = ground.height;
    this.group.position.copy(this.position);
  }
}
