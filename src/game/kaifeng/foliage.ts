/**
 * Premium Natural Tree & Foliage System — Dream World Phase 1
 * Inspired by Where Winds Meet environmental design:
 *  - Riverside Willow Trees with drooping hanging boughs
 *  - Hilltop Pine Trees with rugged tiered branches
 *  - Dense Bamboo Groves with segmented nodes and delicate leaves
 *  - Spreading Broadleaf & Seasonal Autumn Accent Trees
 *  - Lush River Reeds, Ferns, Wildflowers, and Floating Willow Fluff Particles
 */

import * as THREE from 'three';
import { textureFactory } from './textures';
import { TerrainManager } from './terrain';

export class FoliageManager {
  public group: THREE.Group = new THREE.Group();
  private animatedTrees: THREE.Group[] = [];
  private animatedReeds: THREE.InstancedMesh | null = null;
  private particleGroup: THREE.Points | null = null;

  constructor(private terrain: TerrainManager) {
    this.createRiversideWillows();
    this.createHilltopPines();
    this.createBambooGroves();
    this.createBroadleafAndSeasonalTrees();
    this.createRiverReedsAndFerns();
    this.createWildflowers();
    this.createFloatingWillowFluffParticles();
  }

  /**
   * A. Riverside Willow Trees (Salix babylonica)
   * Curved weathered trunk, long weeping branches cascading toward the river surface
   */
  private createRiversideWillows() {
    const willowLocations: [number, number, number][] = [
      // Along North bank near dock & opened riverbend
      [24, -9.5, 1.1],
      [36, -8.5, 1.25],
      [54, -9.0, 1.2],
      [76, -11.0, 1.3],
      [-14, -10.5, 1.0],
      [-32, -11.5, 1.15],
      // Along South bank riverside
      [-20, 13.5, 1.1],
      [2, 12.5, 1.2],
      [22, 13.0, 1.3],
      [42, 12.0, 1.15],
      [68, 11.5, 1.25],
      [96, 12.5, 1.35],
    ];

    const barkTex = textureFactory.getBarkTexture('willow');
    const trunkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.9,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#749258'),
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    willowLocations.forEach(([x, z, scale], idx) => {
      const tree = new THREE.Group();

      // 1. Curved weathered trunk (3-part segmented curve)
      const trunkParts = 3;
      let curY = 0;
      let curX = 0;
      let curZ = 0;
      for (let p = 0; p < trunkParts; p++) {
        const segH = 1.4 * scale;
        const topR = (0.28 - p * 0.06) * scale;
        const botR = (0.36 - p * 0.06) * scale;
        const segGeom = new THREE.CylinderGeometry(topR, botR, segH, 8);
        const seg = new THREE.Mesh(segGeom, trunkMat);
        const pitch = (idx % 2 === 0 ? 0.12 : -0.1) * (p + 1);
        seg.rotation.z = pitch;
        seg.position.set(curX, curY + segH * 0.5, curZ);
        seg.castShadow = true;
        tree.add(seg);

        curY += segH * 0.92;
        curX += pitch * segH * 0.4;
      }

      // Exposed buttress roots grounded in soil
      for (let r = 0; r < 3; r++) {
        const rootGeom = new THREE.CylinderGeometry(0.08 * scale, 0.16 * scale, 1.0 * scale, 6);
        rootGeom.rotateZ(0.65);
        rootGeom.rotateY(r * (Math.PI * 2 / 3));
        const root = new THREE.Mesh(rootGeom, trunkMat);
        root.position.set(0, 0.3 * scale, 0);
        tree.add(root);
      }

      // 2. Weeping drooping branch canopy
      const branchCount = 6;
      for (let b = 0; b < branchCount; b++) {
        const bAngle = (b / branchCount) * Math.PI * 2 + (idx * 0.4);
        const branchArmGeom = new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 2.2 * scale, 6);
        branchArmGeom.rotateZ(1.1); // Arching outward and down
        branchArmGeom.rotateY(bAngle);
        const bArm = new THREE.Mesh(branchArmGeom, trunkMat);
        bArm.position.set(curX, curY, curZ);
        bArm.castShadow = true;
        tree.add(bArm);

        // Hanging weeping foliage trails (slender cones & teardrops brushing down)
        const drapeCount = 3;
        for (let d = 0; d < drapeCount; d++) {
          const drapeGeom = new THREE.ConeGeometry((0.45 + d * 0.15) * scale, (2.6 + d * 0.4) * scale, 5);
          drapeGeom.rotateX(Math.PI); // Pointing downward
          const drape = new THREE.Mesh(drapeGeom, leafMat);
          const dist = (1.2 + d * 0.7) * scale;
          drape.position.set(
            curX + Math.cos(bAngle) * dist,
            curY - (1.0 + d * 0.5) * scale,
            curZ + Math.sin(bAngle) * dist
          );
          drape.castShadow = true;
          drape.userData = { initialY: drape.position.y, phase: b + d };
          tree.add(drape);
        }
      }

      const groundY = this.terrain.getElevationAt(x, z);
      tree.position.set(x, groundY, z);
      tree.rotation.y = idx * 1.5;
      this.group.add(tree);
      this.animatedTrees.push(tree);
    });
  }

  /**
   * B. Hilltop Pine Trees
   * Rugged, tall, tiered horizontal foliage shelves on distant high terrain
   */
  private createHilltopPines() {
    const pineLocations: [number, number, number][] = [
      // South bluffs
      [-35, 30, 1.4],
      [-15, 32, 1.5],
      [10, 34, 1.6],
      [35, 36, 1.5],
      [65, 32, 1.7],
      [90, 30, 1.8],
      [125, 28, 1.6],
      // Far eastern gorge bluffs
      [140, 22, 1.5],
      [155, -20, 1.8],
      [120, -25, 1.6],
      [80, -28, 1.5],
    ];

    const barkTex = textureFactory.getBarkTexture('pine');
    const trunkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.95,
    });

    const needleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#38563A'),
      roughness: 0.8,
      flatShading: true,
    });

    pineLocations.forEach(([x, z, scale], idx) => {
      const tree = new THREE.Group();

      // Tall irregular trunk
      const trunkH = 7.5 * scale;
      const trunkGeom = new THREE.CylinderGeometry(0.18 * scale, 0.42 * scale, trunkH, 8);
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.set(0, trunkH * 0.5, 0);
      trunk.rotation.z = (Math.sin(idx) * 0.06);
      trunk.castShadow = true;
      tree.add(trunk);

      // Tiered horizontal needle clusters (4-5 tiers)
      const tiers = 5;
      for (let t = 0; t < tiers; t++) {
        const tierY = (3.2 + t * 0.9) * scale;
        const tierRadius = (2.2 - t * 0.35) * scale;
        const tierGeom = new THREE.ConeGeometry(tierRadius, 1.2 * scale, 7);
        const tierMesh = new THREE.Mesh(tierGeom, needleMat);
        tierMesh.position.set((Math.sin(t + idx) * 0.2) * scale, tierY, (Math.cos(t) * 0.2) * scale);
        tierMesh.rotation.y = (t * 0.8 + idx);
        tierMesh.castShadow = true;
        tree.add(tierMesh);
      }

      const groundY = this.terrain.getElevationAt(x, z);
      tree.position.set(x, groundY, z);
      this.group.add(tree);
    });
  }

  /**
   * C. Dense Bamboo Groves
   * Clustered slender jointed stalks with delicate flutter leaves
   */
  private createBambooGroves() {
    const groveCenters: [number, number][] = [
      [-10, 22],
      [15, 25],
      [48, 22],
      [82, 20],
      [115, 18],
    ];

    const stalkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6E9946'),
      roughness: 0.5,
      metalness: 0.05,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8ABF54'),
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    groveCenters.forEach(([gx, gz], gIdx) => {
      const stalkCount = 14;
      for (let s = 0; s < stalkCount; s++) {
        const bx = gx + (Math.random() - 0.5) * 6;
        const bz = gz + (Math.random() - 0.5) * 6;
        const groundY = this.terrain.getElevationAt(bx, bz);

        const bamboo = new THREE.Group();
        const stalkH = 5.0 + Math.random() * 2.5;

        // Segmented stalk with nodal rings
        const nodes = 6;
        const segH = stalkH / nodes;
        for (let n = 0; n < nodes; n++) {
          const segGeom = new THREE.CylinderGeometry(0.045, 0.05, segH, 6);
          const seg = new THREE.Mesh(segGeom, stalkMat);
          seg.position.set(0, (n + 0.5) * segH, 0);
          bamboo.add(seg);

          // Node ring
          const ringGeom = new THREE.TorusGeometry(0.06, 0.015, 4, 8);
          ringGeom.rotateX(Math.PI / 2);
          const ring = new THREE.Mesh(ringGeom, stalkMat);
          ring.position.set(0, (n + 1) * segH, 0);
          bamboo.add(ring);

          // Bamboo leaf fan at upper nodes
          if (n >= 3) {
            const fanGeom = new THREE.ConeGeometry(0.65, 0.1, 4);
            fanGeom.rotateZ(Math.PI / 3);
            const fan = new THREE.Mesh(fanGeom, leafMat);
            fan.position.set(0.2, (n + 1) * segH, 0);
            fan.rotation.y = n * 1.5;
            bamboo.add(fan);
          }
        }

        bamboo.position.set(bx, groundY, bz);
        bamboo.rotation.z = (Math.random() - 0.5) * 0.08;
        this.group.add(bamboo);
      }
    });
  }

  /**
   * D. Spreading Broadleaf Trees & Seasonal Golden Ginkgo/Maple Accents
   */
  private createBroadleafAndSeasonalTrees() {
    const treeLocations: [number, number, number, boolean][] = [
      // North promenade verge
      [-40, -18, 1.2, false],
      [-5, -17, 1.15, true], // Golden ginkgo near dock entrance
      [18, -17, 1.1, false],
      [48, -16, 1.3, true], // Autumn maple accent
      [88, -16, 1.4, false],
      // South bank gentle slopes
      [-28, 18, 1.25, false],
      [0, 19, 1.2, true],
      [30, 18, 1.3, false],
      [58, 19, 1.35, true],
      [100, 18, 1.4, false],
    ];

    const barkTex = textureFactory.getBarkTexture('willow');
    const trunkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.9,
    });

    const summerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#587A38'),
      roughness: 0.8,
      flatShading: true,
    });

    const ginkgoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D99B26'), // Warm golden autumn
      roughness: 0.75,
      flatShading: true,
    });

    treeLocations.forEach(([x, z, scale, isSeasonal], idx) => {
      const tree = new THREE.Group();
      const h = 4.5 * scale;

      // Branched trunk
      const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.35 * scale, h, 8);
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.set(0, h * 0.5, 0);
      trunk.castShadow = true;
      tree.add(trunk);

      // Branch boughs
      for (let b = 0; b < 3; b++) {
        const bAngle = (b / 3) * Math.PI * 2 + idx;
        const bArm = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 1.8 * scale, 6),
          trunkMat
        );
        bArm.rotateZ(0.7);
        bArm.rotateY(bAngle);
        bArm.position.set(0, h * 0.8, 0);
        tree.add(bArm);
      }

      // Organic cloud-like canopy clusters (not single sphere!)
      const mat = isSeasonal ? ginkgoMat : summerMat;
      const canopyClusters: [number, number, number, number][] = [
        [0, h * 1.15, 0, 1.8 * scale],
        [1.1 * scale, h * 0.95, 0.8 * scale, 1.3 * scale],
        [-1.0 * scale, h * 1.0, -0.7 * scale, 1.4 * scale],
        [0.4 * scale, h * 1.25, -1.0 * scale, 1.2 * scale],
      ];

      canopyClusters.forEach(([cx, cy, cz, cr]) => {
        const geom = new THREE.DodecahedronGeometry(cr, 1);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(cx, cy, cz);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        tree.add(mesh);
      });

      const groundY = this.terrain.getElevationAt(x, z);
      tree.position.set(x, groundY, z);
      this.group.add(tree);
    });
  }

  /**
   * E. River Reeds and Ferns along the damp water margin
   */
  private createRiverReedsAndFerns() {
    const reedGeom = new THREE.CylinderGeometry(0.02, 0.04, 1.8, 4);
    const reedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#789C46'),
      roughness: 0.7,
      flatShading: true,
    });

    const count = 120;
    this.animatedReeds = new THREE.InstancedMesh(reedGeom, reedMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Cluster in shallow shoreline water (Y between -0.3 and 0.4)
      const x = -50 + Math.random() * 180;
      const isNorth = Math.random() > 0.5;
      const z = isNorth ? -7 - Math.random() * 4 : 7 + Math.random() * 4;
      const groundY = this.terrain.getElevationAt(x, z);

      dummy.position.set(x, groundY + 0.9, z);
      dummy.rotation.set((Math.random() - 0.5) * 0.15, Math.random() * Math.PI, (Math.random() - 0.5) * 0.15);
      const s = 0.7 + Math.random() * 0.6;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      this.animatedReeds.setMatrixAt(i, dummy.matrix);
    }

    this.animatedReeds.instanceMatrix.needsUpdate = true;
    this.group.add(this.animatedReeds);
  }

  /**
   * F. Wildflower Patches (subtle white and yellow blossoms)
   */
  private createWildflowers() {
    const flowerGeom = new THREE.DodecahedronGeometry(0.12, 0);
    const flowerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F2E8C4'),
      roughness: 0.6,
    });

    const count = 70;
    const flowerMesh = new THREE.InstancedMesh(flowerGeom, flowerMat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const x = -30 + Math.random() * 140;
      const z = Math.random() > 0.5 ? -15 - Math.random() * 8 : 15 + Math.random() * 8;
      const groundY = this.terrain.getElevationAt(x, z);

      dummy.position.set(x, groundY + 0.35, z);
      dummy.updateMatrix();
      flowerMesh.setMatrixAt(i, dummy.matrix);
    }

    flowerMesh.instanceMatrix.needsUpdate = true;
    this.group.add(flowerMesh);
  }

  /**
   * G. Floating Willow Fluff / Pollen Particles drifting lazily in the river breeze
   * Signature Where Winds Meet environmental atmosphere!
   */
  private createFloatingWillowFluffParticles() {
    const particleCount = 200;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = -50 + Math.random() * 180;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8.0;
      positions[i * 3 + 2] = -25 + Math.random() * 50;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color('#FAF7EB'),
      size: 0.12,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    this.particleGroup = new THREE.Points(geom, pMat);
    this.group.add(this.particleGroup);
  }

  /**
   * Update foliage sway and particle drift
   */
  public update(delta: number, elapsed: number) {
    // Gentle wind sway on willows
    this.animatedTrees.forEach((tree, idx) => {
      const windSway = Math.sin(elapsed * 1.2 + idx * 0.7) * 0.03;
      tree.rotation.z = windSway;
    });

    // Particle breeze drift
    if (this.particleGroup) {
      const pos = this.particleGroup.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + delta * 0.8; // Drifting downriver
        let y = pos.getY(i) + Math.sin(elapsed + i) * delta * 0.2;
        let z = pos.getZ(i) + Math.cos(elapsed * 0.5 + i) * delta * 0.15;

        // Wrap around bounds
        if (x > 140) x = -60;
        if (y < 0.5) y = 7.0;
        if (y > 9.0) y = 1.0;

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }
  }
}
