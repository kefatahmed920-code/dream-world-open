/**
 * City Entrance Environmental NPCs — Dream World Phase 4
 * Populates the Grand Gate Plaza and Entrance District:
 *  - Imperial Gate Guard Captain Song stationed at the entrance with spear
 *  - Tea Master Xiao on the riverside tea terrace
 *  - Traveling Merchant Zhou walking along the Imperial Way
 *  - Strolling Resident Lady Hu in the Stele Plaza
 *  - Riverside Boatman Deng on the boardwalk steps
 */

import * as THREE from 'three';
import { CityEntranceManager } from './cityEntrance';

export interface CityNPCData {
  name: string;
  role: string;
  group: THREE.Group;
  type: 'patrol' | 'stationary';
  speed?: number;
  minZ?: number;
  maxZ?: number;
  direction?: 1 | -1;
  walkCycle: number;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
}

export class CityNPCManager {
  public group: THREE.Group = new THREE.Group();
  public npcs: CityNPCData[] = [];
  public guardPosition: THREE.Vector3 = new THREE.Vector3(149.2, 4.05, 26.5);

  constructor(private city: CityEntranceManager) {
    this.createCityNPCs();
  }

  private createCityNPCs() {
    // 1. Imperial Gate Guard Captain Song (Armed with Spear at Second Gate)
    const guard = this.createCharacterModel({
      robeColor: '#8C241B', // Vermilion imperial guard coat
      armorColor: '#3A3A36', // Iron lamellar armor
      hasHelmet: true,
      hasSpear: true,
    });
    guard.group.position.copy(this.guardPosition);
    guard.group.rotation.y = 0; // Facing arriving travelers from the bridge
    this.group.add(guard.group);

    this.npcs.push({
      name: 'Guard Captain Song',
      role: 'Imperial Gate Sentinel',
      group: guard.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: guard.leftLeg,
      rightLeg: guard.rightLeg,
      leftArm: guard.leftArm,
      rightArm: guard.rightArm,
    });

    // 2. Tea Master Xiao (At Jinli Tea House Terrace)
    const teaMaster = this.createCharacterModel({
      robeColor: '#455A64', // Slate blue artisan tunic
      hasApron: true,
    });
    teaMaster.group.position.set(138.8, 4.05, 36.5);
    teaMaster.group.rotation.y = Math.PI / 4;
    this.group.add(teaMaster.group);

    this.npcs.push({
      name: 'Tea Master Xiao',
      role: 'Golden Carp Tea Artisan',
      group: teaMaster.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: teaMaster.leftLeg,
      rightLeg: teaMaster.rightLeg,
      leftArm: teaMaster.leftArm,
      rightArm: teaMaster.rightArm,
    });

    // 3. Traveling Merchant Zhou (Patrolling Imperial Way Z: 32 to 68)
    const merchant = this.createCharacterModel({
      robeColor: '#795548', // Brown traveling tunic
      hasHat: true,
    });
    merchant.group.position.set(153.5, 4.15, 34);
    this.group.add(merchant.group);

    this.npcs.push({
      name: 'Merchant Zhou',
      role: 'Silk & Spice Trader',
      group: merchant.group,
      type: 'patrol',
      speed: 1.3,
      direction: 1,
      minZ: 30,
      maxZ: 68,
      walkCycle: Math.random() * Math.PI,
      leftLeg: merchant.leftLeg,
      rightLeg: merchant.rightLeg,
      leftArm: merchant.leftArm,
      rightArm: merchant.rightArm,
    });

    // 4. Strolling Resident Lady Hu (In Gate Plaza Z: 28 to 40)
    const lady = this.createCharacterModel({
      robeColor: '#9C27B0', // Royal Plum Silk Hanfu
      hasHairpin: true,
    });
    lady.group.position.set(147.5, 4.05, 38);
    this.group.add(lady.group);

    this.npcs.push({
      name: 'Lady Hu',
      role: 'Plaza Resident',
      group: lady.group,
      type: 'patrol',
      speed: 1.1,
      direction: -1,
      minZ: 28,
      maxZ: 42,
      walkCycle: Math.random() * Math.PI,
      leftLeg: lady.leftLeg,
      rightLeg: lady.rightLeg,
      leftArm: lady.leftArm,
      rightArm: lady.rightArm,
    });

    // 5. Riverside Boatman Deng (Watching river from the boardwalk)
    const boatman = this.createCharacterModel({
      robeColor: '#00796B', // River teal linen
      hasHat: true,
    });
    boatman.group.position.set(135.2, 3.8, 48);
    boatman.group.rotation.y = -Math.PI / 2; // Facing the open river
    this.group.add(boatman.group);

    this.npcs.push({
      name: 'Boatman Deng',
      role: 'River Pilot',
      group: boatman.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: boatman.leftLeg,
      rightLeg: boatman.rightLeg,
      leftArm: boatman.leftArm,
      rightArm: boatman.rightArm,
    });
  }

  public update(delta: number, elapsed: number) {
    this.npcs.forEach((npc) => {
      if (npc.type === 'patrol' && npc.speed && npc.direction && npc.minZ !== undefined && npc.maxZ !== undefined) {
        // Patrol locomotion along the street
        npc.group.position.z += npc.direction * npc.speed * delta;
        npc.walkCycle += delta * npc.speed * 4.5;

        // Turn around at ends
        if (npc.direction === 1 && npc.group.position.z >= npc.maxZ) {
          npc.direction = -1;
          npc.group.rotation.y = Math.PI;
        } else if (npc.direction === -1 && npc.group.position.z <= npc.minZ) {
          npc.direction = 1;
          npc.group.rotation.y = 0;
        }

        // Leg and arm swing animation
        const swing = Math.sin(npc.walkCycle) * 0.42;
        npc.leftLeg.rotation.x = swing;
        npc.rightLeg.rotation.x = -swing;
        npc.leftArm.rotation.x = -swing * 0.7;
        npc.rightArm.rotation.x = swing * 0.7;
      } else {
        // Stationary idle breathing / subtle glance
        npc.walkCycle += delta * 1.5;
        npc.leftLeg.rotation.x = THREE.MathUtils.damp(npc.leftLeg.rotation.x, 0, 8, delta);
        npc.rightLeg.rotation.x = THREE.MathUtils.damp(npc.rightLeg.rotation.x, 0, 8, delta);
        npc.leftArm.rotation.x = THREE.MathUtils.damp(npc.leftArm.rotation.x, 0, 8, delta);
        npc.rightArm.rotation.x = THREE.MathUtils.damp(npc.rightArm.rotation.x, 0, 8, delta);
      }
    });
  }

  private createCharacterModel(cfg: {
    robeColor: string;
    armorColor?: string;
    hasHelmet?: boolean;
    hasSpear?: boolean;
    hasApron?: boolean;
    hasHat?: boolean;
    hasHairpin?: boolean;
  }): {
    group: THREE.Group;
    leftLeg: THREE.Mesh;
    rightLeg: THREE.Mesh;
    leftArm: THREE.Mesh;
    rightArm: THREE.Mesh;
  } {
    const group = new THREE.Group();

    const robeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cfg.robeColor),
      roughness: 0.8,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#DDB892'),
      roughness: 0.6,
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#222222'),
      roughness: 0.8,
    });

    // 1. Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.3), robeMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    group.add(torso);

    // Armor Cuirass (if guard)
    if (cfg.armorColor) {
      const armor = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 0.55, 0.34),
        new THREE.MeshStandardMaterial({ color: cfg.armorColor, roughness: 0.5, metalness: 0.6 })
      );
      armor.position.set(0, 1.35, 0);
      group.add(armor);
    }

    // 2. Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), skinMat);
    head.position.set(0, 1.8, 0);
    head.castShadow = true;
    group.add(head);

    // Headwear
    if (cfg.hasHelmet) {
      // Imperial Guard crested helmet
      const helmMat = new THREE.MeshStandardMaterial({ color: 0x42423E, roughness: 0.4, metalness: 0.7 });
      const helm = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.35, 8), helmMat);
      helm.position.set(0, 1.98, 0);
      group.add(helm);
    } else if (cfg.hasHat) {
      // Conical Douli hat
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0xC9A86A }));
      hat.position.set(0, 1.95, 0);
      hat.rotation.x = -0.1;
      group.add(hat);
    }

    // 3. Legs
    const legGeom = new THREE.BoxGeometry(0.18, 0.72, 0.2);
    const leftLeg = new THREE.Mesh(legGeom, robeMat);
    leftLeg.position.set(-0.16, 0.45, 0);
    leftLeg.castShadow = true;

    const rightLeg = new THREE.Mesh(legGeom, robeMat);
    rightLeg.position.set(0.16, 0.45, 0);
    rightLeg.castShadow = true;

    group.add(leftLeg, rightLeg);

    // 4. Arms
    const armGeom = new THREE.BoxGeometry(0.14, 0.62, 0.14);
    const leftArm = new THREE.Mesh(armGeom, robeMat);
    leftArm.position.set(-0.35, 1.25, 0);
    leftArm.castShadow = true;

    const rightArm = new THREE.Mesh(armGeom, robeMat);
    rightArm.position.set(0.35, 1.25, 0);
    rightArm.castShadow = true;

    group.add(leftArm, rightArm);

    // 5. Weapon (if guard has spear)
    if (cfg.hasSpear) {
      const spear = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.6),
        new THREE.MeshStandardMaterial({ color: 0x5C4430 })
      );
      shaft.position.set(0, 1.3, 0);
      spear.add(shaft);

      const spearHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.45, 4),
        new THREE.MeshStandardMaterial({ color: 0xD4D4D4, metalness: 0.9, roughness: 0.2 })
      );
      spearHead.position.set(0, 2.7, 0);
      spear.add(spearHead);

      spear.position.set(0.4, 0, 0.2);
      group.add(spear);
    }

    return { group, leftLeg, rightLeg, leftArm, rightArm };
  }
}
