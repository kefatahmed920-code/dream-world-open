/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

/**
 * Natural Riverside Landscape (Rebuilt East Bank)
 * 
 * SPECIFIC VILLAGE REMOVAL COMPLETED:
 *  - Removed all old village buildings, village tin/mud houses, high school campus,
 *    farmer homesteads, sheds, haystacks, and village gazebo structures.
 *  - Rebuilt terrain naturally with lush green riverbank meadows, gentle organic slopes,
 *    natural coconut palms, shady banyan trees, and riverbank rock formations.
 *  - Established the Grand World Gateway Portal to MAP 01 (Kaifeng World) at the eastern bridgehead.
 */
export class CountrysideVillage {
  public group: THREE.Group;
  public obstacles: WorldObstacle[];

  // World Gateway Portal at the eastern bridgehead (X: 125, Y: 0.1, Z: 3)
  public kaifengPortalPos = new THREE.Vector3(125.0, 0.1, 3.0);
  public portalMesh!: THREE.Group;

  // Preserved position hooks for backward safety
  public speakerPos = new THREE.Vector3(125.0, 0.1, 3.0);
  public pondPierPos = new THREE.Vector3(125.0, 0.1, 3.0);
  public schoolGatePos = new THREE.Vector3(125.0, 0.1, 3.0);
  public gardenShedPos = new THREE.Vector3(125.0, 0.1, 3.0);
  public hillGazeboPos = new THREE.Vector3(125.0, 0.1, 3.0);

  constructor(parentGroup: THREE.Group, obstacles: WorldObstacle[]) {
    this.group = new THREE.Group();
    this.group.name = 'RiversideCleanLandscape';
    parentGroup.add(this.group);
    this.obstacles = obstacles;

    this.buildCleanAvenue();
    this.buildNaturalRebuiltLandscape();
    this.buildKaifengWorldGateway();
  }

  /**
   * Clean asphalt avenue connecting from bridgehead into the scenic river meadow
   */
  private buildCleanAvenue() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
    });

    // Straight clean roadway approach from bridge
    const roadGeo = new THREE.PlaneGeometry(12, 45);
    roadGeo.rotateX(-Math.PI / 2);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(135, 0.05, 3.0);
    road.receiveShadow = true;
    this.group.add(road);

    // Stone curbs
    [-6, 6].forEach((offset) => {
      const curbGeo = new THREE.BoxGeometry(0.3, 0.18, 45);
      const curb = new THREE.Mesh(curbGeo, curbMat);
      curb.position.set(135 + offset, 0.09, 3.0);
      curb.receiveShadow = true;
      this.group.add(curb);
    });

    // Circular Gateway Arrival Plaza at road terminus
    const plazaGeo = new THREE.CircleGeometry(16, 32);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(125, 0.055, 3.0);
    plaza.receiveShadow = true;
    this.group.add(plaza);
  }

  /**
   * Naturally rebuilt riverside meadow, palm groves, banyan shade, and clean riverbank terrain
   */
  private buildNaturalRebuiltLandscape() {
    // Lush green meadow terrain overlay
    const meadowGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    meadowGeo.rotateX(-Math.PI / 2);
    const meadowMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a4f, // Rich natural Bengali green grass
      roughness: 0.95,
      metalness: 0.05,
    });
    const meadow = new THREE.Mesh(meadowGeo, meadowMat);
    meadow.position.set(190, 0.02, 40);
    meadow.receiveShadow = true;
    this.group.add(meadow);

    // Natural Coconut Palms & Banyan Groves across the cleaned riverbank
    const palmPositions = [
      [145, 25], [152, -18], [168, 12], [175, 48], [160, -35],
      [185, -20], [195, 15], [210, 35], [225, -10], [240, 50],
      [215, -30], [230, 20], [170, 75], [190, 85], [220, 95]
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const frondMat = new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.7 });

    palmPositions.forEach(([px, pz]) => {
      const palmGroup = new THREE.Group();
      palmGroup.position.set(px, 0.05, pz);

      // Slender curving trunk
      const trunkH = 8.5 + Math.random() * 2.5;
      const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, trunkH, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = trunkH / 2;
      trunk.rotation.z = (Math.random() - 0.5) * 0.12;
      trunk.castShadow = true;
      palmGroup.add(trunk);

      // Crown of palm fronds
      for (let i = 0; i < 9; i++) {
        const angle = (i / 9) * Math.PI * 2;
        const frondGeo = new THREE.ConeGeometry(1.6, 4.2, 5);
        const frond = new THREE.Mesh(frondGeo, frondMat);
        frond.position.set(Math.cos(angle) * 1.8, trunkH - 0.2, Math.sin(angle) * 1.8);
        frond.rotation.x = Math.PI * 0.42;
        frond.rotation.y = angle;
        frond.castShadow = true;
        palmGroup.add(frond);
      }

      this.group.add(palmGroup);
    });

    // Shady Banyan Trees
    const banyanPositions = [
      [165, 30], [200, 60], [220, 5], [180, -45]
    ];
    const banyanMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.85 });

    banyanPositions.forEach(([bx, bz]) => {
      const banyan = new THREE.Group();
      banyan.position.set(bx, 0.05, bz);

      const bTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 5.5, 12), trunkMat);
      bTrunk.position.y = 2.75;
      bTrunk.castShadow = true;
      banyan.add(bTrunk);

      // Wide leafy canopy
      const canopy = new THREE.Mesh(new THREE.SphereGeometry(4.8, 12, 10), banyanMat);
      canopy.position.y = 6.8;
      canopy.scale.set(1.4, 0.7, 1.3);
      canopy.castShadow = true;
      banyan.add(canopy);

      this.group.add(banyan);
    });

    // Natural Riverbank Slate Boulders
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    for (let r = 0; r < 14; r++) {
      const rx = 135 + Math.random() * 110;
      const rz = -40 + Math.random() * 140;
      const rockGeo = new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.5);
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(rx, 0.6, rz);
      rock.scale.set(1.2, 0.6, 1.0);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      this.group.add(rock);
    }
  }

  /**
   * Grand World Gateway Portal to MAP 01 (Kaifeng World / Battle Royale Arena)
   */
  private buildKaifengWorldGateway() {
    this.portalMesh = new THREE.Group();
    this.portalMesh.position.copy(this.kaifengPortalPos);

    // Ornate stone pedestal base
    const baseGeo = new THREE.CylinderGeometry(3.6, 4.2, 0.5, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.25;
    this.portalMesh.add(base);

    // Monumental Gateway Columns
    const colMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Ancient imperial gold/bronze
      roughness: 0.35,
      metalness: 0.6,
    });
    [-2.2, 2.2].forEach((xOff) => {
      const colGeo = new THREE.CylinderGeometry(0.28, 0.32, 5.2, 16);
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(xOff, 2.8, 0);
      col.castShadow = true;
      this.portalMesh.add(col);

      // Column Lanterns
      const lanternGeo = new THREE.OctahedronGeometry(0.35);
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(xOff, 5.2, 0);
      this.portalMesh.add(lantern);
    });

    // Archway Roof Header with Traditional Upturned Eaves
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Chinese cinnabar red
      roughness: 0.4,
      metalness: 0.3,
    });
    const archRoof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.6, 0.8), archMat);
    archRoof.position.set(0, 5.3, 0);
    this.portalMesh.add(archRoof);

    // Dimensional Swirling Portal Ring
    const portalRingGeo = new THREE.RingGeometry(0.3, 1.85, 32);
    const portalRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Brilliant cyan/sky dimensional rift
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.82,
    });
    const portalRing = new THREE.Mesh(portalRingGeo, portalRingMat);
    portalRing.position.set(0, 2.8, 0);
    this.portalMesh.add(portalRing);

    // Gateway Beacon Point Light
    const beacon = new THREE.PointLight(0x38bdf8, 3.2, 14);
    beacon.position.set(0, 2.8, 0);
    this.portalMesh.add(beacon);

    this.group.add(this.portalMesh);
  }

  /**
   * Continuous analytical terrain height for the cleanly rebuilt natural riverside meadow
   */
  public getVillageElevation(x: number, z: number, _currentY?: number): number | null {
    // Clean, flat natural meadow and roadway (0.05m elevation)
    if (x >= 120 && x <= 270 && z >= -50 && z <= 140) {
      return 0.05;
    }
    return null;
  }

  /**
   * Per-Frame Update
   */
  public update(_delta: number, _isMusicPlaying: boolean) {
    if (this.portalMesh) {
      const time = performance.now() * 0.0015;
      this.portalMesh.rotation.y = Math.sin(time * 0.4) * 0.04;
    }
  }
}
