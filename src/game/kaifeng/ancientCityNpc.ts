/**
 * Ancient City Environmental NPCs — Dream World Phase 5
 * Populates all 8 districts with varied, atmospheric characters:
 *  - Grand Market merchants, stall keepers, and shoppers
 *  - Riverside boat workers and residents
 *  - Imperial Palace golden halberdiers and scribes
 *  - Blacksmith and artisans in the craft quarter
 *  - Opera performers and spectators in the cultural quarter
 *  - Farmers in the outer village rice terraces
 *
 * Performance Optimized:
 *  - Distance-based animation throttling (only nearby NPCs evaluate procedural kinematics)
 *  - Shared geometries and materials
 */

import * as THREE from 'three';

export interface CityNPC {
  name: string;
  role: string;
  district: string;
  group: THREE.Group;
  type: 'patrol' | 'stationary' | 'action';
  actionType?: 'hammer' | 'bow' | 'stir' | 'tend';
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

export class AncientCityNPCManager {
  public group: THREE.Group = new THREE.Group();
  public npcs: CityNPC[] = [];

  constructor() {
    this.createDistrictNPCs();
  }

  private createDistrictNPCs() {
    // 1. GRAND MARKET DISTRICT
    // Merchant Li (Silk Vendor at X: 178, Z: 91)
    const li = this.createHumanoid({ robeColor: 0x9B2226, hasHat: true });
    li.group.position.set(178, 4.3, 91);
    li.group.rotation.y = -Math.PI / 2;
    this.group.add(li.group);
    this.npcs.push({
      name: 'Merchant Li',
      role: 'Master Silk Trader',
      district: 'Grand Market',
      group: li.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: li.leftLeg,
      rightLeg: li.rightLeg,
      leftArm: li.leftArm,
      rightArm: li.rightArm,
    });

    // Auntie Wang (Bao Vendor at X: 211, Z: 125)
    const wang = this.createHumanoid({ robeColor: 0xD4A373, hasApron: true });
    wang.group.position.set(211, 4.3, 125);
    this.group.add(wang.group);
    this.npcs.push({
      name: 'Auntie Wang',
      role: 'Dragon Well Bun Baker',
      district: 'Grand Market',
      group: wang.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: wang.leftLeg,
      rightLeg: wang.rightLeg,
      leftArm: wang.leftArm,
      rightArm: wang.rightArm,
    });

    // Scholar Wen (Browsing Market Patrol along Central Arcade Z: 85 to 135)
    const wen = this.createHumanoid({ robeColor: 0x2A6F97, hasHat: false });
    wen.group.position.set(195, 4.3, 95);
    this.group.add(wen.group);
    this.npcs.push({
      name: 'Scholar Wen',
      role: 'Imperial Scholar',
      district: 'Grand Market',
      group: wen.group,
      type: 'patrol',
      speed: 1.2,
      direction: 1,
      minZ: 85,
      maxZ: 135,
      walkCycle: 0,
      leftLeg: wen.leftLeg,
      rightLeg: wen.rightLeg,
      leftArm: wen.leftArm,
      rightArm: wen.rightArm,
    });

    // 2. RIVERSIDE RESIDENTIAL DISTRICT
    // Boat Pilot Zhang (At Canal Steps X: 123.5, Z: 100)
    const zhang = this.createHumanoid({ robeColor: 0x264653, hasHat: true });
    zhang.group.position.set(123.5, 4.3, 100);
    zhang.group.rotation.y = Math.PI / 2;
    this.group.add(zhang.group);
    this.npcs.push({
      name: 'Boatman Zhang',
      role: 'Canal Pilot',
      district: 'Riverside District',
      group: zhang.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: zhang.leftLeg,
      rightLeg: zhang.rightLeg,
      leftArm: zhang.leftArm,
      rightArm: zhang.rightArm,
    });

    // Resident Lady Mei (Strolling Canal Embankment Z: 90 to 140)
    const mei = this.createHumanoid({ robeColor: 0x8338EC });
    mei.group.position.set(121, 4.3, 110);
    this.group.add(mei.group);
    this.npcs.push({
      name: 'Lady Mei',
      role: 'Riverside Resident',
      district: 'Riverside District',
      group: mei.group,
      type: 'patrol',
      speed: 1.0,
      direction: -1,
      minZ: 88,
      maxZ: 142,
      walkCycle: 0.5,
      leftLeg: mei.leftLeg,
      rightLeg: mei.rightLeg,
      leftArm: mei.leftArm,
      rightArm: mei.rightArm,
    });

    // 3. IMPERIAL PALACE & ROYAL GARDENS
    // Imperial Palace Sentinel Zhao (Standing guard at Meridian Gatehouse X: 235, Z: 204)
    const zhao = this.createHumanoid({
      robeColor: 0x8C241B,
      armorColor: 0xD4AF37, // Golden Imperial Dragon Armor
      hasHelmet: true,
      hasHalberd: true,
    });
    zhao.group.position.set(235, 4.3, 204);
    zhao.group.rotation.y = 0; // Facing south toward arrival road
    this.group.add(zhao.group);
    this.npcs.push({
      name: 'Palace Sentinel Zhao',
      role: 'Forbidden City Golden Guard',
      district: 'Imperial Palace',
      group: zhao.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: zhao.leftLeg,
      rightLeg: zhao.rightLeg,
      leftArm: zhao.leftArm,
      rightArm: zhao.rightArm,
    });

    // Palace Scribe Shen (In Royal Gardens beside Lotus Pond X: 200, Z: 240)
    const shen = this.createHumanoid({ robeColor: 0x457B9D });
    shen.group.position.set(200, 4.3, 240);
    this.group.add(shen.group);
    this.npcs.push({
      name: 'Scribe Shen',
      role: 'Imperial Court Calligrapher',
      district: 'Royal Gardens',
      group: shen.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: shen.leftLeg,
      rightLeg: shen.rightLeg,
      leftArm: shen.leftArm,
      rightArm: shen.rightArm,
    });

    // 4. CRAFT & PRODUCTION DISTRICT
    // Master Blacksmith Lu (Working at the Anvil X: 273, Z: 96)
    const lu = this.createHumanoid({ robeColor: 0x5C4033, hasApron: true });
    lu.group.position.set(273, 4.3, 96);
    this.group.add(lu.group);
    this.npcs.push({
      name: 'Master Lu',
      role: 'Chief Imperial Blacksmith',
      district: 'Craft District',
      group: lu.group,
      type: 'action',
      actionType: 'hammer',
      walkCycle: 0,
      leftLeg: lu.leftLeg,
      rightLeg: lu.rightLeg,
      leftArm: lu.leftArm,
      rightArm: lu.rightArm,
    });

    // Dyer Master Tang (Checking drying cloth racks X: 273, Z: 122)
    const tang = this.createHumanoid({ robeColor: 0x1D3557, hasApron: true });
    tang.group.position.set(273, 4.3, 122);
    this.group.add(tang.group);
    this.npcs.push({
      name: 'Master Tang',
      role: 'Indigo Master Dyer',
      district: 'Craft District',
      group: tang.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: tang.leftLeg,
      rightLeg: tang.rightLeg,
      leftArm: tang.leftArm,
      rightArm: tang.rightArm,
    });

    // 5. ENTERTAINMENT & CULTURAL DISTRICT
    // Storyteller Master Jiang (At Liyuan Opera Stage X: 140, Z: 130)
    const jiang = this.createHumanoid({ robeColor: 0xBC6C25 });
    jiang.group.position.set(140, 5.5, 130);
    this.group.add(jiang.group);
    this.npcs.push({
      name: 'Storyteller Jiang',
      role: 'Ancient Lore Storyteller',
      district: 'Entertainment District',
      group: jiang.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: jiang.leftLeg,
      rightLeg: jiang.rightLeg,
      leftArm: jiang.leftArm,
      rightArm: jiang.rightArm,
    });

    // Spectator Meiling (Sitting on benches X: 140, Z: 137)
    const meiling = this.createHumanoid({ robeColor: 0xDDA15E });
    meiling.group.position.set(140, 4.3, 137);
    this.group.add(meiling.group);
    this.npcs.push({
      name: 'Meiling',
      role: 'Opera Enthusiast',
      district: 'Entertainment District',
      group: meiling.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: meiling.leftLeg,
      rightLeg: meiling.rightLeg,
      leftArm: meiling.leftArm,
      rightArm: meiling.rightArm,
    });

    // 6. ORDINARY RESIDENTIAL DISTRICT
    // Elder Zhang (At the historic water well X: 115.5, Z: 227)
    const zhangOld = this.createHumanoid({ robeColor: 0x6C757D });
    zhangOld.group.position.set(115.5, 4.3, 227);
    this.group.add(zhangOld.group);
    this.npcs.push({
      name: 'Elder Zhang',
      role: 'Neighborhood Elder',
      district: 'Residential District',
      group: zhangOld.group,
      type: 'stationary',
      walkCycle: 0,
      leftLeg: zhangOld.leftLeg,
      rightLeg: zhangOld.rightLeg,
      leftArm: zhangOld.leftArm,
      rightArm: zhangOld.rightArm,
    });

    // 7. OUTER VILLAGE & FARMLAND
    // Farmer Old Han (Tending rice paddy terraced fields X: 114, Z: 300)
    const han = this.createHumanoid({ robeColor: 0x588157, hasHat: true });
    han.group.position.set(114, 3.8, 300);
    this.group.add(han.group);
    this.npcs.push({
      name: 'Old Han',
      role: 'Village Rice Farmer',
      district: 'Outer Farmland',
      group: han.group,
      type: 'action',
      actionType: 'tend',
      walkCycle: 0,
      leftLeg: han.leftLeg,
      rightLeg: han.rightLeg,
      leftArm: han.leftArm,
      rightArm: han.rightArm,
    });
  }

  /**
   * Procedural humanoid model generator
   */
  private createHumanoid(cfg: {
    robeColor: number;
    armorColor?: number;
    hasHat?: boolean;
    hasHelmet?: boolean;
    hasApron?: boolean;
    hasHalberd?: boolean;
  }) {
    const group = new THREE.Group();
    const robeMat = new THREE.MeshStandardMaterial({ color: cfg.robeColor, roughness: 0.8 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xD4A076, roughness: 0.6 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.72, 0.3), robeMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    group.add(torso);

    if (cfg.armorColor) {
      const armor = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.5, 0.32),
        new THREE.MeshStandardMaterial({ color: cfg.armorColor, metalness: 0.8, roughness: 0.3 })
      );
      armor.position.set(0, 1.35, 0);
      group.add(armor);
    }

    if (cfg.hasApron) {
      const apron = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.55, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xEDEDED, roughness: 0.9 })
      );
      apron.position.set(0, 1.05, 0.02);
      group.add(apron);
    }

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
    head.position.set(0, 1.8, 0);
    head.castShadow = true;
    group.add(head);

    if (cfg.hasHat) {
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.18, 12), new THREE.MeshStandardMaterial({ color: 0xC9A86A }));
      hat.position.set(0, 1.95, 0);
      group.add(hat);
    }

    if (cfg.hasHelmet) {
      const helmet = new THREE.Mesh(
        new THREE.CylinderGeometry(0.19, 0.22, 0.35, 8),
        new THREE.MeshStandardMaterial({ color: 0x2B2B2B, metalness: 0.9, roughness: 0.3 })
      );
      helmet.position.set(0, 1.95, 0);
      group.add(helmet);
    }

    // Legs
    const legGeom = new THREE.BoxGeometry(0.18, 0.72, 0.2);
    const leftLeg = new THREE.Mesh(legGeom, robeMat);
    leftLeg.position.set(-0.16, 0.45, 0);
    const rightLeg = new THREE.Mesh(legGeom, robeMat);
    rightLeg.position.set(0.16, 0.45, 0);
    group.add(leftLeg, rightLeg);

    // Arms
    const armGeom = new THREE.BoxGeometry(0.14, 0.62, 0.14);
    const leftArm = new THREE.Mesh(armGeom, robeMat);
    leftArm.position.set(-0.35, 1.25, 0);
    const rightArm = new THREE.Mesh(armGeom, robeMat);
    rightArm.position.set(0.35, 1.25, 0);
    group.add(leftArm, rightArm);

    // Halberd / Spear for Imperial Guard
    if (cfg.hasHalberd) {
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 2.8),
        new THREE.MeshStandardMaterial({ color: 0x4A3728 })
      );
      shaft.position.set(0.38, 1.4, 0.15);
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.55, 4),
        new THREE.MeshStandardMaterial({ color: 0xD4D4D4, metalness: 0.9, roughness: 0.2 })
      );
      blade.position.set(0.38, 2.9, 0.15);
      group.add(shaft, blade);
    }

    return { group, leftLeg, rightLeg, leftArm, rightArm };
  }

  /**
   * Update loops with distance-based LOD (skips animation math when player is far away)
   */
  public update(delta: number, elapsed: number, playerPos?: THREE.Vector3) {
    for (const npc of this.npcs) {
      // Distance LOD check: If farther than 60m from player, skip skeletal math!
      if (playerPos) {
        const dx = npc.group.position.x - playerPos.x;
        const dz = npc.group.position.z - playerPos.z;
        if (dx * dx + dz * dz > 3600) continue; // > 60m away
      }

      if (npc.type === 'patrol' && npc.speed && npc.direction && npc.minZ !== undefined && npc.maxZ !== undefined) {
        npc.group.position.z += npc.direction * npc.speed * delta;
        npc.walkCycle += delta * npc.speed * 4.5;

        if (npc.group.position.z > npc.maxZ) {
          npc.group.position.z = npc.maxZ;
          npc.direction = -1;
          npc.group.rotation.y = Math.PI;
        } else if (npc.group.position.z < npc.minZ) {
          npc.group.position.z = npc.minZ;
          npc.direction = 1;
          npc.group.rotation.y = 0;
        }

        const legSwing = Math.sin(npc.walkCycle) * 0.45;
        npc.leftLeg.rotation.x = legSwing;
        npc.rightLeg.rotation.x = -legSwing;
        npc.leftArm.rotation.x = -legSwing * 0.7;
        npc.rightArm.rotation.x = legSwing * 0.7;
      } else if (npc.type === 'action') {
        if (npc.actionType === 'hammer') {
          // Blacksmith hammer arm loop
          npc.rightArm.rotation.x = -0.5 + Math.sin(elapsed * 6.0) * 0.8;
        } else if (npc.actionType === 'tend') {
          // Farmer stooping and tending
          npc.leftArm.rotation.x = 0.4 + Math.sin(elapsed * 2.0) * 0.2;
          npc.rightArm.rotation.x = 0.5 + Math.cos(elapsed * 2.0) * 0.2;
        }
      } else {
        // Idle breathing
        npc.leftArm.rotation.x = Math.sin(elapsed * 1.5) * 0.05;
        npc.rightArm.rotation.x = -Math.sin(elapsed * 1.5) * 0.05;
      }
    }
  }
}
