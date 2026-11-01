/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export type PetType = 'cyber_fox' | 'tiger_cub' | 'aero_drone';

export interface PetConfig {
  id: PetType;
  name: string;
  nameBn: string;
  rarity: 'Legendary' | 'Epic' | 'Rare';
  description: string;
  descriptionBn: string;
  passiveBonus: string;
}

export const PET_CONFIGS: Record<PetType, PetConfig> = {
  cyber_fox: {
    id: 'cyber_fox',
    name: 'Cyber Fox',
    nameBn: 'সাইবার ফক্স',
    rarity: 'Legendary',
    description: 'Futuristic robotic cyber hound equipped with tactical sensors and speed boosters.',
    descriptionBn: 'উন্নত সেন্সর এবং স্পিড বুস্টার যুক্ত আধুনিক সাইবার রোবট সঙ্গী।',
    passiveBonus: '+15% Sprint Stamina Recovery',
  },
  tiger_cub: {
    id: 'tiger_cub',
    name: 'Bengal Tiger Cub',
    nameBn: 'রয়েল বেঙ্গল শাবক',
    rarity: 'Legendary',
    description: 'Majestic Royal Bengal cub known for courage, loyal companionship and good luck.',
    descriptionBn: 'সাহসী ও বিশ্বস্ত সুন্দরবনের ঐতিহ্যবাহী রয়েল বেঙ্গল বাঘের শাবক।',
    passiveBonus: '+10% Bonus Taka from Quests',
  },
  aero_drone: {
    id: 'aero_drone',
    name: 'Aero Droid',
    nameBn: 'অ্যারো ড্রোন',
    rarity: 'Epic',
    description: 'Autonomous companion hover drone with scanning LiDAR and aerial beacon.',
    descriptionBn: 'হভার প্রযুক্তি এবং স্ক্যানার সম্পন্ন স্বয়ংক্রিয় উড়ন্ত কম্প্যানিয়ন ড্রোন।',
    passiveBonus: '+20m Mini-map Radar Range',
  },
};

export class PetCompanionModel {
  public group: THREE.Group;
  public type: PetType;
  private animTimer = 0;

  // Animatable parts
  private bodyMesh: THREE.Mesh | null = null;
  private headGroup: THREE.Group | null = null;
  private tailMesh: THREE.Mesh | null = null;
  private ears: THREE.Mesh[] = [];
  private rotorGroup: THREE.Group | null = null;
  private beaconLight: THREE.PointLight | null = null;

  constructor(type: PetType = 'cyber_fox') {
    this.type = type;
    this.group = new THREE.Group();
    this.buildModel();
  }

  public setType(type: PetType) {
    if (this.type === type) return;
    this.type = type;
    // Clear existing children
    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      this.group.remove(child);
    }
    this.ears = [];
    this.headGroup = null;
    this.tailMesh = null;
    this.rotorGroup = null;
    this.beaconLight = null;
    this.buildModel();
  }

  private buildModel() {
    if (this.type === 'cyber_fox') {
      this.buildCyberFox();
    } else if (this.type === 'tiger_cub') {
      this.buildTigerCub();
    } else {
      this.buildAeroDrone();
    }
  }

  private buildCyberFox() {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const darkPlateMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    });

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.32, 0.24, 0.52);
    this.bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    this.bodyMesh.position.y = 0.32;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Armor Spine Plate
    const spinePlate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.44), darkPlateMat);
    spinePlate.position.set(0, 0.14, 0);
    this.bodyMesh.add(spinePlate);

    // Head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.46, 0.32);

    const headGeo = new THREE.BoxGeometry(0.24, 0.22, 0.28);
    const head = new THREE.Mesh(headGeo, goldMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.18), darkPlateMat);
    snout.position.set(0, -0.04, 0.18);
    this.headGroup.add(snout);

    // Glowing Visor / Eyes
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), cyanGlowMat);
    visor.position.set(0, 0.03, 0.145);
    this.headGroup.add(visor);

    // Cyber Ears
    [-0.08, 0.08].forEach((ex) => {
      const earGeo = new THREE.ConeGeometry(0.06, 0.18, 4);
      const ear = new THREE.Mesh(earGeo, goldMat);
      ear.position.set(ex, 0.18, -0.04);
      ear.rotation.x = -0.15;
      ear.rotation.z = ex > 0 ? -0.15 : 0.15;
      this.headGroup!.add(ear);
      this.ears.push(ear);
    });

    this.group.add(this.headGroup);

    // 4 Articulated Legs
    const legMat = darkPlateMat;
    const legPositions = [
      { x: -0.14, z: 0.18 },
      { x: 0.14, z: 0.18 },
      { x: -0.14, z: -0.18 },
      { x: 0.14, z: -0.18 },
    ];
    legPositions.forEach((lp) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.26, 8), legMat);
      leg.position.set(lp.x, 0.13, lp.z);
      leg.castShadow = true;
      this.group.add(leg);

      const paw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.1), cyanGlowMat);
      paw.position.set(lp.x, 0.02, lp.z + 0.02);
      this.group.add(paw);
    });

    // Sleek Segmented Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.35, -0.26);

    const tailGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.36, 6);
    tailGeo.rotateX(Math.PI / 3);
    this.tailMesh = new THREE.Mesh(tailGeo, goldMat);
    this.tailMesh.position.set(0, 0.1, -0.12);
    tailGroup.add(this.tailMesh);

    const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 6), cyanGlowMat);
    tailTip.position.set(0, 0.22, -0.26);
    tailTip.rotation.x = Math.PI / 3;
    tailGroup.add(tailTip);

    this.group.add(tailGroup);
  }

  private buildTigerCub() {
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.85,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xca8a04,
      emissiveIntensity: 0.3,
    });

    // Chubby tiger body
    const bodyGeo = new THREE.SphereGeometry(0.24, 16, 12);
    bodyGeo.scale(1, 0.9, 1.4);
    this.bodyMesh = new THREE.Mesh(bodyGeo, orangeMat);
    this.bodyMesh.position.y = 0.28;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // Stripes on back
    [-0.14, 0, 0.14].forEach((sz) => {
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.02, 4, 12, Math.PI), stripeMat);
      stripe.position.set(0, 0.28, sz);
      stripe.rotation.y = Math.PI / 2;
      this.group.add(stripe);
    });

    // White belly
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), whiteMat);
    belly.scale.set(0.9, 0.6, 1.2);
    belly.position.set(0, 0.2, 0);
    this.group.add(belly);

    // Cute round head
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.44, 0.26);

    const headGeo = new THREE.SphereGeometry(0.19, 16, 14);
    const head = new THREE.Mesh(headGeo, orangeMat);
    head.castShadow = true;
    this.headGroup.add(head);

    // White Muzzle
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.1), whiteMat);
    muzzle.position.set(0, -0.06, 0.14);
    this.headGroup.add(muzzle);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.02), stripeMat);
    nose.position.set(0, -0.03, 0.195);
    this.headGroup.add(nose);

    // Yellow sparkling eyes
    [-0.07, 0.07].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeMat);
      eye.position.set(ex, 0.02, 0.16);
      this.headGroup!.add(eye);
    });

    // Round Cute Ears
    [-0.12, 0.12].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), orangeMat);
      ear.position.set(ex, 0.14, -0.02);
      this.headGroup!.add(ear);
      this.ears.push(ear);
    });

    this.group.add(this.headGroup);

    // 4 Paws
    const pawPositions = [
      { x: -0.13, z: 0.16 },
      { x: 0.13, z: 0.16 },
      { x: -0.13, z: -0.16 },
      { x: 0.13, z: -0.16 },
    ];
    pawPositions.forEach((lp) => {
      const paw = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 8), whiteMat);
      paw.position.set(lp.x, 0.1, lp.z);
      paw.castShadow = true;
      this.group.add(paw);
    });

    // Tiger Tail with black tip
    const tailGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.34, 6);
    tailGeo.rotateX(Math.PI / 3);
    this.tailMesh = new THREE.Mesh(tailGeo, orangeMat);
    this.tailMesh.position.set(0, 0.35, -0.32);
    this.group.add(this.tailMesh);
  }

  private buildAeroDrone() {
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.2,
    });
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.8,
    });

    // Hover body lifted off ground (Y = 0.55m)
    this.group.position.y = 0.25;

    // Core Orb
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), whiteMat);
    core.position.y = 0.48;
    core.castShadow = true;
    this.group.add(core);

    // Glowing Cyclops Eye Lens
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), emeraldMat);
    eye.position.set(0, 0.48, 0.16);
    this.group.add(eye);

    // Rotor Ring / Stabilizer
    this.rotorGroup = new THREE.Group();
    this.rotorGroup.position.set(0, 0.48, 0);

    const ringGeo = new THREE.TorusGeometry(0.36, 0.035, 8, 24);
    const ring = new THREE.Mesh(ringGeo, chassisMat);
    ring.rotation.x = Math.PI / 2;
    this.rotorGroup.add(ring);

    // 4 Thruster Pods
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), chassisMat);
      thruster.position.set(Math.cos(a) * 0.36, 0, Math.sin(a) * 0.36);
      this.rotorGroup.add(thruster);

      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), emeraldMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.set(Math.cos(a) * 0.36, -0.065, Math.sin(a) * 0.36);
      this.rotorGroup.add(glow);
    }

    this.group.add(this.rotorGroup);

    // Antenna & Beacon
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.18, 6), chassisMat);
    ant.position.set(0, 0.76, -0.06);
    this.group.add(ant);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), emeraldMat);
    beacon.position.set(0, 0.86, -0.06);
    this.group.add(beacon);

    this.beaconLight = new THREE.PointLight(0x10b981, 0.6, 2.5);
    this.beaconLight.position.set(0, 0.86, -0.06);
    this.group.add(this.beaconLight);
  }

  public update(delta: number) {
    this.animTimer += delta;

    if (this.type === 'aero_drone') {
      // Gentle floating bob
      this.group.position.y = 0.25 + Math.sin(this.animTimer * 2.2) * 0.06;
      // Slight tilt roll
      this.group.rotation.z = Math.sin(this.animTimer * 1.5) * 0.05;
      if (this.rotorGroup) {
        this.rotorGroup.rotation.y += delta * 4.0;
      }
      if (this.beaconLight) {
        this.beaconLight.intensity = 0.4 + Math.sin(this.animTimer * 6.0) * 0.3;
      }
      return;
    }

    // Quadruped pets (Fox / Tiger)
    // Breathing idle: body subtle scale & head bob
    const breath = Math.sin(this.animTimer * 2.5) * 0.025;
    if (this.bodyMesh) {
      this.bodyMesh.scale.y = 1 + breath;
      this.bodyMesh.scale.x = 1 + breath * 0.5;
    }

    // Head subtle look-around / tilt
    if (this.headGroup) {
      this.headGroup.position.y = 0.45 + breath * 0.6;
      this.headGroup.rotation.y = Math.sin(this.animTimer * 0.8) * 0.12;
      this.headGroup.rotation.x = Math.sin(this.animTimer * 1.4) * 0.06;
    }

    // Tail wagging
    if (this.tailMesh) {
      this.tailMesh.rotation.y = Math.sin(this.animTimer * 4.5) * 0.35;
      this.tailMesh.rotation.z = Math.cos(this.animTimer * 2.2) * 0.15;
    }

    // Ear twitching occasionally
    if (this.ears.length >= 2) {
      const twitch = Math.sin(this.animTimer * 8.0) > 0.92 ? 0.2 : 0;
      this.ears[0].rotation.z = -0.15 - twitch;
      this.ears[1].rotation.z = 0.15 + twitch;
    }
  }
}
