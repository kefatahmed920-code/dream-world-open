/**
 * Chinese Heritage Environmental & Lore NPCs
 * Brings to life the rich cultural history and traditions of China:
 *  - Taoist Hermit Yun (云道长): Daoism, Yin-Yang, Feng Shui, Mountain Legends
 *  - Scholar Master Chen (陈夫子): 5,000 Years History, Dynasties, Four Inventions, Imperial Exams
 *  - Apothecary Master Lin (林神医): Traditional Chinese Medicine, Qi, Five Elements, Herbs
 *  - Calligrapher Lady Wen (文大家): Calligraphy, Four Treasures of Study, Ink Painting
 *  - General Meng (蒙将军): Great Wall Beacon Watch, Silk Road, Frontier Heritage
 */

import * as THREE from 'three';

export interface HeritageNPC {
  id: 'daoist' | 'scholar' | 'apothecary' | 'calligrapher' | 'general';
  name: string;
  title: string;
  locationName: string;
  group: THREE.Group;
  position: THREE.Vector3;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  head: THREE.Mesh;
}

export class ChineseHeritageNPCManager {
  public group: THREE.Group = new THREE.Group();
  public npcs: HeritageNPC[] = [];

  constructor() {
    this.createHeritageNPCs();
  }

  private createHeritageNPCs() {
    // 1. Taoist Hermit Yun at Tianyun Daoist Sanctuary
    const daoist = this.createHumanoid({
      robeColor: 0x1D3557,
      trimColor: 0x457B9D,
      hasDaoistCap: true,
    });
    daoist.group.position.set(395, 15.7, 421);
    daoist.group.rotation.y = Math.PI;
    this.group.add(daoist.group);
    this.npcs.push({
      id: 'daoist',
      name: 'Daochang Yun (云道长)',
      title: 'Taoist Master of Tianyun Mountain',
      locationName: 'Tianyun Cloud Hermitage (天云仙观)',
      group: daoist.group,
      position: new THREE.Vector3(395, 15.7, 421),
      leftArm: daoist.leftArm,
      rightArm: daoist.rightArm,
      head: daoist.head,
    });

    // 2. Scholar Master Chen at Hanlin Scholars' Academy
    const scholar = this.createHumanoid({
      robeColor: 0x2A6F97,
      trimColor: 0x013A63,
      hasScholarHat: true,
    });
    scholar.group.position.set(245, 4.35, 348);
    scholar.group.rotation.y = Math.PI;
    this.group.add(scholar.group);
    this.npcs.push({
      id: 'scholar',
      name: 'Master Chen (陈夫子)',
      title: 'Imperial Academy Dean & Historian',
      locationName: "Hanlin Scholars' Academy (翰林书院)",
      group: scholar.group,
      position: new THREE.Vector3(245, 4.35, 348),
      leftArm: scholar.leftArm,
      rightArm: scholar.rightArm,
      head: scholar.head,
    });

    // 3. Apothecary Master Lin at Renxin Medicine Hall
    const apo = this.createHumanoid({
      robeColor: 0x588157,
      trimColor: 0x344E41,
      hasApron: true,
    });
    apo.group.position.set(285, 4.35, 264);
    apo.group.rotation.y = Math.PI;
    this.group.add(apo.group);
    this.npcs.push({
      id: 'apothecary',
      name: 'Master Lin (林神医)',
      title: 'Grand Master of Chinese Medicine',
      locationName: 'Renxin Herbal Apothecary (仁心堂中药)',
      group: apo.group,
      position: new THREE.Vector3(285, 4.35, 264),
      leftArm: apo.leftArm,
      rightArm: apo.rightArm,
      head: apo.head,
    });

    // 4. Calligrapher Lady Wen in Siheyuan Courtyard
    const lady = this.createHumanoid({
      robeColor: 0x9B2226,
      trimColor: 0xD4AF37,
      hasSilkSash: true,
    });
    lady.group.position.set(185, 4.35, 363);
    lady.group.rotation.y = 0;
    this.group.add(lady.group);
    this.npcs.push({
      id: 'calligrapher',
      name: 'Lady Wen (文大家)',
      title: 'Calligraphy & Painting Virtuoso',
      locationName: 'Siheyuan Courtyard Mansion (四合院名宅)',
      group: lady.group,
      position: new THREE.Vector3(185, 4.35, 363),
      leftArm: lady.leftArm,
      rightArm: lady.rightArm,
      head: lady.head,
    });

    // 5. General Meng at Great Wall Beacon Tower Parapet
    const general = this.createHumanoid({
      robeColor: 0x333333,
      trimColor: 0xDC2626,
      hasArmor: true,
    });
    general.group.position.set(435, 25.2, 315);
    general.group.rotation.y = Math.PI / 2;
    this.group.add(general.group);
    this.npcs.push({
      id: 'general',
      name: 'General Meng (蒙将军)',
      title: 'Commander of the Great Wall Beacon Watch',
      locationName: 'Great Wall Beacon Tower (长城烽燧)',
      group: general.group,
      position: new THREE.Vector3(435, 25.2, 315),
      leftArm: general.leftArm,
      rightArm: general.rightArm,
      head: general.head,
    });
  }

  private createHumanoid(options: {
    robeColor: number;
    trimColor: number;
    hasDaoistCap?: boolean;
    hasScholarHat?: boolean;
    hasApron?: boolean;
    hasSilkSash?: boolean;
    hasArmor?: boolean;
  }) {
    const group = new THREE.Group();

    const robeMat = new THREE.MeshStandardMaterial({ color: options.robeColor, roughness: 0.7 });
    const trimMat = new THREE.MeshStandardMaterial({ color: options.trimColor, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xD8A679, roughness: 0.5 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1B1B1B, roughness: 0.9 });

    // 1. Torso Robe
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.35), robeMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    group.add(torso);

    // Sash / Belt
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.38), trimMat);
    sash.position.set(0, 0.95, 0);
    group.add(sash);

    // Long Robe Skirt (traditional Changpao / Hanfu flowing skirt)
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.75, 0.36), robeMat);
    skirt.position.set(0, 0.52, 0);
    group.add(skirt);

    // 2. Head & Facial Features
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), skinMat);
    head.position.set(0, 1.82, 0);
    head.castShadow = true;
    group.add(head);

    // Hair Topknot
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), hairMat);
    hair.position.set(0, 1.86, 0);
    const topknot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.12, 8), hairMat);
    topknot.position.set(0, 2.05, -0.02);
    group.add(hair, topknot);

    // Headwear variations
    if (options.hasDaoistCap) {
      // Daoist Ziye Guan with golden hairpin
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.12, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: 0x0F172A })
      );
      cap.position.set(0, 2.06, 0);
      const pin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xD4AF37, metalness: 0.9 })
      );
      pin.rotation.z = Math.PI / 2;
      pin.position.set(0, 2.06, 0);
      group.add(cap, pin);
    } else if (options.hasScholarHat) {
      // Imperial Scholar Jinzi Cap
      const hat = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.22, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x002855 })
      );
      hat.position.set(0, 2.06, 0);
      group.add(hat);
    } else if (options.hasArmor) {
      // General Bronze Helmet with Red Plume
      const helm = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x5C442A, metalness: 0.85, roughness: 0.3 })
      );
      helm.position.set(0, 1.9, 0);
      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xDC2626 })
      );
      plume.position.set(0, 2.15, 0);
      group.add(helm, plume);
    }

    // 3. Wide Flowing Hanfu Sleeves & Arms
    const armGeom = new THREE.BoxGeometry(0.2, 0.7, 0.22);
    const leftArm = new THREE.Mesh(armGeom, robeMat);
    leftArm.position.set(-0.38, 1.25, 0);
    leftArm.castShadow = true;

    const rightArm = new THREE.Mesh(armGeom, robeMat);
    rightArm.position.set(0.38, 1.25, 0);
    rightArm.castShadow = true;
    group.add(leftArm, rightArm);

    return { group, leftArm, rightArm, head };
  }

  public update(delta: number, elapsed: number, playerPos: THREE.Vector3) {
    this.npcs.forEach((npc, i) => {
      const dist = npc.position.distanceTo(playerPos);
      // Only animate nearby NPCs for high performance
      if (dist < 40) {
        // Subtle breathing & arm gesturing
        npc.head.position.y = 1.82 + Math.sin(elapsed * 1.5 + i) * 0.012;
        npc.leftArm.rotation.x = Math.sin(elapsed * 1.2 + i) * 0.08;
        npc.rightArm.rotation.x = -Math.sin(elapsed * 1.2 + i) * 0.08;

        // Turn head slightly toward player when close
        if (dist < 6.0) {
          const dx = playerPos.x - npc.position.x;
          const dz = playerPos.z - npc.position.z;
          const targetAng = Math.atan2(dx, dz);
          npc.group.rotation.y = THREE.MathUtils.lerp(npc.group.rotation.y, targetAng, delta * 3.0);
        }
      }
    });
  }

  /**
   * Find closest heritage NPC for interaction
   */
  public getClosestInteractableNPC(playerPos: THREE.Vector3, threshold: number = 4.2): HeritageNPC | null {
    let closest: HeritageNPC | null = null;
    let minDist = threshold;

    for (const npc of this.npcs) {
      const dist = npc.position.distanceTo(playerPos);
      if (dist < minDist) {
        minDist = dist;
        closest = npc;
      }
    }
    return closest;
  }
}
