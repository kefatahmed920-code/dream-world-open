/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { soundManager } from '../audio/soundManager';

export type TeddyBearType = 'cyber_neon' | 'classic_honey' | 'panda_bear' | 'golden_hero';
export type PetToyAccessory = 'none' | 'toy_blaster' | 'foam_dart_launcher' | 'sci_fi_blaster';

export interface TeddyBearConfig {
  id: TeddyBearType;
  name: string;
  nameBn: string;
  rarity: 'Mythic' | 'Legendary' | 'Epic';
  personality: string;
  description: string;
  descriptionBn: string;
  passiveBonus: string;
}

export const TEDDY_BEAR_CONFIGS: Record<TeddyBearType, TeddyBearConfig> = {
  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyber Winged Teddy',
    nameBn: 'সাইবার উইংড টেডি',
    rarity: 'Mythic',
    personality: 'Playful & Futuristic · Loves hovering with glowing cyan wings',
    description: 'Ultra-cute companion equipped with glowing cyan cyber wings, holographic visor, and energetic following AI.',
    descriptionBn: 'উজ্জ্বল নিয়ন ডানা এবং সাইবার কলার যুক্ত চমৎকার বুদ্ধিমত্তাসম্পন্ন বন্ধু।',
    passiveBonus: '+20% Sprint Stamina Recovery',
  },
  classic_honey: {
    id: 'classic_honey',
    name: 'Classic Honey Bear',
    nameBn: 'ক্লাসিক হানি টেডি',
    rarity: 'Legendary',
    personality: 'Energetic & Cheerful · Jumps happily and greets the owner',
    description: 'Beloved traditional honey-brown plush teddy bear with a crimson bow tie and warm heart.',
    descriptionBn: 'ঐতিহ্যবাহী মিষ্টি বাদামী টেডি বিয়ার, লাল বো-টাই পরা বিশ্বস্ত সঙ্গী।',
    passiveBonus: '+15% Bonus Taka from Quests',
  },
  panda_bear: {
    id: 'panda_bear',
    name: 'Bamboo Panda Bear',
    nameBn: 'ব্যাম্বু পান্ডা টেডি',
    rarity: 'Legendary',
    personality: 'Curious & Inquisitive · Constantly looks around and tilts head',
    description: 'Chubby black-and-white panda companion that loves exploring new villages and bridges.',
    descriptionBn: 'গোলগাল সাদা-কালো পান্ডা টেডি যা নতুন স্থান দেখতে ভালোবাসে।',
    passiveBonus: '+25m Mini-map Discovery Range',
  },
  golden_hero: {
    id: 'golden_hero',
    name: 'Royal Golden Bear',
    nameBn: 'রয়েল গোল্ডেন টেডি',
    rarity: 'Legendary',
    personality: 'Heroic & Celebratory · Celebrates victories with a hero cape',
    description: 'Radiant golden plush teddy bear wearing a miniature hero cape and royal badge.',
    descriptionBn: 'চকচকে সোনালী রঙের বীরত্বপূর্ণ টেডি বিয়ার, ছোট্ট ক্যাপ পরা।',
    passiveBonus: '+10% Driving Vehicle Speed Boost',
  },
};

export interface ToyAccessoryConfig {
  id: PetToyAccessory;
  name: string;
  nameBn: string;
  description: string;
}

export const TOY_ACCESSORY_CONFIGS: Record<PetToyAccessory, ToyAccessoryConfig> = {
  none: {
    id: 'none',
    name: 'No Accessory',
    nameBn: 'কোন এক্সেসরি নেই',
    description: 'Natural cute companion without cosmetic toys.',
  },
  toy_blaster: {
    id: 'toy_blaster',
    name: 'Color Splash Blaster',
    nameBn: 'কালার স্প্ল্যাশ খেলনা ব্লাস্টার',
    description: 'Harmless vibrant cosmetic toy blaster strapped to side holster.',
  },
  foam_dart_launcher: {
    id: 'foam_dart_launcher',
    name: 'Foam Dart Launcher',
    nameBn: 'ফোম ডার্ট লঞ্চার',
    description: 'Playful neon soft foam dart launcher toy for celebratory antics.',
  },
  sci_fi_blaster: {
    id: 'sci_fi_blaster',
    name: 'Cartoon Ray Gun',
    nameBn: 'কার্টুন সাই-ফাই রে গান',
    description: 'Chubby retro-futuristic toy ray gun with spinning coil.',
  },
};

export class TeddyBearCompanion {
  public group: THREE.Group;
  public type: TeddyBearType;
  public accessory: PetToyAccessory = 'none';

  // Animation Timers & State
  private animTimer = 0;
  private footstepTimer = 0;
  private soundChirpTimer = 5.0; // periodic happy chirps

  // 3D Nodes
  private headGroup: THREE.Group | null = null;
  private torsoMesh: THREE.Mesh | null = null;
  private leftArmGroup: THREE.Group | null = null;
  private rightArmGroup: THREE.Group | null = null;
  private leftLegGroup: THREE.Group | null = null;
  private rightLegGroup: THREE.Group | null = null;
  private leftEar: THREE.Mesh | null = null;
  private rightEar: THREE.Mesh | null = null;
  private wingsGroup: THREE.Group | null = null;
  private accessoryMesh: THREE.Group | null = null;
  private capeMesh: THREE.Mesh | null = null;

  constructor(type: TeddyBearType = 'cyber_neon', accessory: PetToyAccessory = 'none') {
    this.type = type;
    this.accessory = accessory;
    this.group = new THREE.Group();
    this.buildModel();
  }

  public setType(type: TeddyBearType) {
    if (this.type === type) return;
    this.type = type;
    this.rebuild();
  }

  public setAccessory(acc: PetToyAccessory) {
    if (this.accessory === acc) return;
    this.accessory = acc;
    this.rebuild();
  }

  public rebuild() {
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
    }
    this.headGroup = null;
    this.torsoMesh = null;
    this.leftArmGroup = null;
    this.rightArmGroup = null;
    this.leftLegGroup = null;
    this.rightLegGroup = null;
    this.leftEar = null;
    this.rightEar = null;
    this.wingsGroup = null;
    this.accessoryMesh = null;
    this.capeMesh = null;
    this.buildModel();
  }

  private buildModel() {
    let mainColor = 0xffffff;
    let secondaryColor = 0x38bdf8;
    let innerEarColor = 0xfbcfe8;
    let bellyColor = 0xf8fafc;
    let isCyber = false;
    let isPanda = false;
    let isGolden = false;

    if (this.type === 'cyber_neon') {
      mainColor = 0xf8fafc; // Clean white plush
      secondaryColor = 0x38bdf8; // Cyan neon
      bellyColor = 0xe0f2fe;
      isCyber = true;
    } else if (this.type === 'classic_honey') {
      mainColor = 0xb45309; // Warm golden brown
      secondaryColor = 0xef4444; // Red bow tie
      bellyColor = 0xfde68a;
      innerEarColor = 0xfde68a;
    } else if (this.type === 'panda_bear') {
      mainColor = 0xffffff;
      secondaryColor = 0x18181b;
      bellyColor = 0xffffff;
      isPanda = true;
    } else if (this.type === 'golden_hero') {
      mainColor = 0xf59e0b;
      secondaryColor = 0xb91c1c; // Hero cape
      bellyColor = 0xfef08a;
      isGolden = true;
    }

    const furMat = new THREE.MeshStandardMaterial({
      color: mainColor,
      roughness: 0.82,
      metalness: isGolden ? 0.4 : 0.05,
    });
    const patchMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.88 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    const earPatchMat = new THREE.MeshStandardMaterial({ color: innerEarColor, roughness: 0.9 });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    });

    // 1. CHUBBY TORSO
    const torsoGeo = new THREE.SphereGeometry(0.24, 18, 14);
    torsoGeo.scale(1.0, 1.15, 0.95);
    this.torsoMesh = new THREE.Mesh(torsoGeo, furMat);
    this.torsoMesh.position.y = 0.32;
    this.torsoMesh.castShadow = true;
    this.group.add(this.torsoMesh);

    // Belly patch
    const bellyGeo = new THREE.SphereGeometry(0.18, 14, 10);
    bellyGeo.scale(0.85, 1.0, 0.45);
    const belly = new THREE.Mesh(bellyGeo, patchMat);
    belly.position.set(0, 0.02, 0.15);
    this.torsoMesh.add(belly);

    // Collar / Bow Tie / Wings
    if (isCyber) {
      // Tech collar
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 24), cyanGlowMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 0.22;
      this.torsoMesh.add(collar);

      // Cyber Holographic Wings (Matching Reference Image!)
      this.wingsGroup = new THREE.Group();
      this.wingsGroup.position.set(0, 0.18, -0.16);

      [-1, 1].forEach((side) => {
        const wing = new THREE.Group();
        wing.position.x = side * 0.12;

        const feather1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.02), cyanGlowMat);
        feather1.position.set(side * 0.14, 0.08, 0);
        feather1.rotation.z = side * 0.45;
        wing.add(feather1);

        const feather2 = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.02), cyanGlowMat);
        feather2.position.set(side * 0.11, -0.02, 0);
        feather2.rotation.z = side * 0.25;
        wing.add(feather2);

        this.wingsGroup!.add(wing);
      });
      this.torsoMesh?.add(this.wingsGroup);
    } else if (this.type === 'classic_honey') {
      // Red Bow Tie
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      knot.position.set(0, 0.22, 0.22);
      this.torsoMesh?.add(knot);

      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 4), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        wing.rotation.z = side * Math.PI / 2;
        wing.position.set(side * 0.08, 0.22, 0.21);
        this.torsoMesh?.add(wing);
      });
    } else if (isGolden) {
      // Hero Cape on back
      const capeGeo = new THREE.PlaneGeometry(0.32, 0.45);
      const capeMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        side: THREE.DoubleSide,
        roughness: 0.6,
      });
      this.capeMesh = new THREE.Mesh(capeGeo, capeMat);
      this.capeMesh.position.set(0, 0.12, -0.22);
      this.capeMesh.rotation.x = -0.18;
      this.torsoMesh?.add(this.capeMesh);
    }

    // 2. CUTE ROUND HEAD
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.58, 0.02);

    const headGeo = new THREE.SphereGeometry(0.22, 18, 16);
    const head = new THREE.Mesh(headGeo, furMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Muzzle & Button Nose
    const muzzleGeo = new THREE.SphereGeometry(0.09, 12, 10);
    muzzleGeo.scale(1.2, 0.85, 1.0);
    const muzzle = new THREE.Mesh(muzzleGeo, patchMat);
    muzzle.position.set(0, -0.05, 0.18);
    this.headGroup.add(muzzle);

    const noseGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const nose = new THREE.Mesh(noseGeo, darkMat);
    nose.position.set(0, -0.02, 0.265);
    this.headGroup.add(nose);

    // Cute Big Eyes (Sparkling or Blue)
    const eyeColor = isCyber ? 0x0284c7 : 0x0f172a;
    const eyeMat = new THREE.MeshStandardMaterial({
      color: eyeColor,
      roughness: 0.1,
      metalness: 0.2,
      emissive: isCyber ? 0x0369a1 : 0x000000,
      emissiveIntensity: isCyber ? 0.4 : 0,
    });

    [-1, 1].forEach((side) => {
      // Panda eye patch
      if (isPanda) {
        const patch = new THREE.Mesh(new THREE.CircleGeometry(0.065, 10), darkMat);
        patch.position.set(side * 0.095, 0.03, 0.19);
        patch.rotation.y = side * 0.4;
        this.headGroup!.add(patch);
      }

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), eyeMat);
      eye.position.set(side * 0.095, 0.03, 0.198);
      this.headGroup!.add(eye);

      // Eye glint
      const glint = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
      );
      glint.position.set(side * 0.095 + 0.01, 0.045, 0.23);
      this.headGroup!.add(glint);
    });

    // 3. ROUND EARS
    const earGeo = new THREE.SphereGeometry(0.075, 12, 10);
    const earInnerGeo = new THREE.CircleGeometry(0.045, 8);

    this.leftEar = new THREE.Mesh(earGeo, isPanda ? darkMat : furMat);
    this.leftEar.position.set(-0.16, 0.17, 0.02);
    this.headGroup.add(this.leftEar);

    const leftInner = new THREE.Mesh(earInnerGeo, earPatchMat);
    leftInner.position.set(-0.16, 0.17, 0.08);
    this.headGroup.add(leftInner);

    this.rightEar = new THREE.Mesh(earGeo, isPanda ? darkMat : furMat);
    this.rightEar.position.set(0.16, 0.17, 0.02);
    this.headGroup.add(this.rightEar);

    const rightInner = new THREE.Mesh(earInnerGeo, earPatchMat);
    rightInner.position.set(0.16, 0.17, 0.08);
    this.headGroup.add(rightInner);

    this.group.add(this.headGroup);

    // 4. ARMS & PAWS
    const armMat = isPanda ? darkMat : furMat;

    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.24, 0.38, 0.04);
    const armGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.22, 10);
    armGeo.rotateZ(0.25);
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(0, -0.08, 0.05);
    leftArm.castShadow = true;
    this.leftArmGroup.add(leftArm);
    this.group.add(this.leftArmGroup);

    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.24, 0.38, 0.04);
    const rArmGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.22, 10);
    rArmGeo.rotateZ(-0.25);
    const rightArm = new THREE.Mesh(rArmGeo, armMat);
    rightArm.position.set(0, -0.08, 0.05);
    rightArm.castShadow = true;
    this.rightArmGroup.add(rightArm);
    this.group.add(this.rightArmGroup);

    // 5. LEGS & FEET
    const legMat = isPanda ? darkMat : furMat;

    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.12, 0.16, 0);
    const legGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.18, 10);
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.y = -0.06;
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    const footGeo = new THREE.SphereGeometry(0.075, 10, 8);
    footGeo.scale(1, 0.6, 1.4);
    const leftFoot = new THREE.Mesh(footGeo, legMat);
    leftFoot.position.set(0, -0.12, 0.04);
    this.leftLegGroup.add(leftFoot);
    this.group.add(this.leftLegGroup);

    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.12, 0.16, 0);
    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.y = -0.06;
    rightLeg.castShadow = true;
    this.rightLegGroup.add(rightLeg);

    const rightFoot = new THREE.Mesh(footGeo, legMat);
    rightFoot.position.set(0, -0.12, 0.04);
    this.rightLegGroup.add(rightFoot);
    this.group.add(this.rightLegGroup);

    // 6. OPTIONAL TOY ACCESSORY
    if (this.accessory !== 'none') {
      this.attachAccessory();
    }
  }

  private attachAccessory() {
    this.accessoryMesh = new THREE.Group();

    if (this.accessory === 'toy_blaster') {
      // Colorful toy water/foam blaster strapped on back
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.1, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 }),
      );
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b }),
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = 0.16;
      this.accessoryMesh.add(body);
      this.accessoryMesh.add(barrel);
      this.accessoryMesh.position.set(0.18, 0.38, -0.15);
      this.accessoryMesh.rotation.set(0.4, 0.2, 0.5);
    } else if (this.accessory === 'foam_dart_launcher') {
      const launcher = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x10b981 }),
      );
      launcher.rotation.x = Math.PI / 2;
      const dart = new THREE.Mesh(
        new THREE.ConeGeometry(0.04, 0.08, 8),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e }),
      );
      dart.rotation.x = Math.PI / 2;
      dart.position.z = 0.14;
      this.accessoryMesh.add(launcher);
      this.accessoryMesh.add(dart);
      this.accessoryMesh.position.set(-0.18, 0.38, -0.15);
      this.accessoryMesh.rotation.set(0.4, -0.2, -0.5);
    } else if (this.accessory === 'sci_fi_blaster') {
      const ray = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.08, 0.22),
        new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x6b21a8, emissiveIntensity: 0.4 }),
      );
      this.accessoryMesh.add(ray);
      this.accessoryMesh.position.set(0.2, 0.32, 0.08);
    }

    if (this.accessoryMesh) {
      this.group.add(this.accessoryMesh);
    }
  }

  /**
   * Main Animation Loop (Lobby turntable or Open-World locomotion)
   */
  public update(delta: number, speed = 0) {
    this.animTimer += delta;

    const isMoving = speed > 0.1;
    const isRunning = speed > 3.5;

    // Movement sound feedback
    if (isMoving) {
      this.footstepTimer += delta;
      const stepInterval = isRunning ? 0.18 : 0.28;
      if (this.footstepTimer >= stepInterval) {
        this.footstepTimer = 0;
        soundManager.playPetFootstep();
      }
    }

    // Periodic happy sound chirps when owner is near
    this.soundChirpTimer -= delta;
    if (this.soundChirpTimer <= 0) {
      this.soundChirpTimer = 12.0 + Math.random() * 10.0;
      soundManager.playPetChirp();
    }

    // 1. WING FLUTTERING (Cyber Neon type)
    if (this.wingsGroup) {
      const wingFlap = Math.sin(this.animTimer * (isMoving ? 14 : 4)) * 0.35;
      this.wingsGroup.children.forEach((wing, idx) => {
        wing.rotation.y = (idx === 0 ? -1 : 1) * wingFlap;
      });
    }

    // 2. CAPE FLUTTERING
    if (this.capeMesh) {
      this.capeMesh.rotation.x = -0.18 - Math.sin(this.animTimer * (isMoving ? 10 : 3)) * (isMoving ? 0.35 : 0.08);
    }

    // 3. LOCOMOTION vs IDLE
    if (isMoving) {
      const gaitSpeed = isRunning ? 16 : 9;
      const gaitAngle = Math.sin(this.animTimer * gaitSpeed);

      // Waddling legs
      if (this.leftLegGroup) this.leftLegGroup.rotation.x = gaitAngle * 0.75;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = -gaitAngle * 0.75;

      // Arm swing
      if (this.leftArmGroup) this.leftArmGroup.rotation.x = -gaitAngle * 0.65;
      if (this.rightArmGroup) this.rightArmGroup.rotation.x = gaitAngle * 0.65;

      // Cheerful up-and-down body bob
      if (this.torsoMesh) {
        this.torsoMesh.position.y = 0.32 + Math.abs(Math.sin(this.animTimer * gaitSpeed)) * 0.04;
      }
      if (this.headGroup) {
        this.headGroup.position.y = 0.58 + Math.abs(Math.sin(this.animTimer * gaitSpeed)) * 0.04;
        this.headGroup.rotation.x = 0.08;
      }
    } else {
      // IDLE PLAYFUL PERSONALITY
      const breath = Math.sin(this.animTimer * 2.2) * 0.02;

      // Reset leg & arm angles
      if (this.leftLegGroup) this.leftLegGroup.rotation.x = 0;
      if (this.rightLegGroup) this.rightLegGroup.rotation.x = 0;
      if (this.leftArmGroup) this.leftArmGroup.rotation.x = Math.sin(this.animTimer * 1.5) * 0.08;
      if (this.rightArmGroup) this.rightArmGroup.rotation.x = -Math.sin(this.animTimer * 1.5) * 0.08;

      if (this.torsoMesh) {
        this.torsoMesh.scale.y = 1.0 + breath;
        this.torsoMesh.scale.x = 1.0 + breath * 0.5;
      }

      // Head look-around according to personality
      if (this.headGroup) {
        if (this.type === 'panda_bear') {
          // Curious panda: turns head frequently
          this.headGroup.rotation.y = Math.sin(this.animTimer * 0.9) * 0.35;
          this.headGroup.rotation.z = Math.sin(this.animTimer * 1.2) * 0.12;
        } else if (this.type === 'classic_honey') {
          // Honey bear: occasional happy hop
          const hop = Math.sin(this.animTimer * 3.5) > 0.88 ? 0.06 : 0;
          this.group.position.y = hop;
          this.headGroup.rotation.y = Math.sin(this.animTimer * 0.6) * 0.18;
        } else {
          // Cyber Neon: gentle floating hover
          this.headGroup.rotation.y = Math.sin(this.animTimer * 0.7) * 0.2;
          this.headGroup.rotation.x = Math.sin(this.animTimer * 1.4) * 0.08;
        }
      }

      // Playful ear twitches
      if (this.leftEar && this.rightEar) {
        const twitch = Math.sin(this.animTimer * 7.5) > 0.94 ? 0.25 : 0;
        this.leftEar.rotation.z = -twitch;
        this.rightEar.rotation.z = twitch;
      }
    }
  }

  /**
   * Real-time Open-World Locomotion & Following AI
   */
  public updateFollow(
    delta: number,
    playerPos: THREE.Vector3,
    playerYaw: number,
    heightFunc: (x: number, z: number, y?: number) => number,
  ) {
    // Target position: offset behind and slightly to the side of the player
    const sideOffset = 1.35;
    const rearOffset = 1.6;
    const targetX = playerPos.x - Math.sin(playerYaw + 0.6) * sideOffset - Math.sin(playerYaw) * rearOffset;
    const targetZ = playerPos.z - Math.cos(playerYaw + 0.6) * sideOffset - Math.cos(playerYaw) * rearOffset;

    const dx = targetX - this.group.position.x;
    const dz = targetZ - this.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    let speed = 0;
    if (dist > 8.0) {
      // Teleport if player moves too far (e.g. fast driving or respawn)
      this.group.position.x = targetX;
      this.group.position.z = targetZ;
    } else if (dist > 0.35) {
      speed = Math.min(dist * 3.8, 6.2);
      const moveX = (dx / dist) * speed * delta;
      const moveZ = (dz / dist) * speed * delta;
      this.group.position.x += moveX;
      this.group.position.z += moveZ;

      // Smoothly look towards movement vector
      const targetAngle = Math.atan2(dx, dz);
      this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, targetAngle, 10, delta);
    } else {
      // Near idle distance: align with player heading
      this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, playerYaw, 4, delta);
    }

    // Align with ground terrain elevation + hovering offset for cyber wings
    const groundY = heightFunc(this.group.position.x, this.group.position.z, this.group.position.y);
    const hoverOffset = this.type === 'cyber_neon' ? 0.22 + Math.sin(this.animTimer * 4) * 0.06 : 0;
    this.group.position.y = THREE.MathUtils.damp(this.group.position.y, groundY + hoverOffset, 12, delta);

    // Update animations with calculated movement speed
    this.update(delta, speed);
  }
}
