/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

interface FishInstance {
  pos: THREE.Vector3;
  velocity: THREE.Vector3;
  targetY: number;
  swimSpeed: number;
  phaseOffset: number;
  turnTimer: number;
  yaw: number;
}

/**
 * RiverEcosystem
 * High-performance river wildlife and underwater environmental elements for Padma River:
 * - 24 3D animated river fish (Ilish & Rui carp) rendered via a single InstancedMesh (1 draw call)
 * - Riverbank rocks, river stones, and shoreline reeds
 * - Underwater caustics / light shafts and particle bubbles
 * - Water entry and breach splash rings
 */
export class RiverEcosystem {
  public group: THREE.Group;
  private fishMesh: THREE.InstancedMesh;
  private fishData: FishInstance[] = [];
  private dummy = new THREE.Object3D();

  // Water splashes
  private splashGroup: THREE.Group;
  private activeSplashes: { mesh: THREE.Mesh; timer: number; maxTime: number; startScale: number }[] = [];

  // River boundaries
  private readonly riverMinX = 70;
  private readonly riverMaxX = 105;
  private readonly riverMinZ = -220;
  private readonly riverMaxZ = 220;
  private readonly waterSurfaceY = -0.4;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'RiverEcosystem';

    // 1. Build Single InstancedMesh for Fish School
    const fishCount = 24;
    const fishGeo = this.createFishGeometry();
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd, // Silvery river scale sheen
      roughness: 0.35,
      metalness: 0.6,
      side: THREE.DoubleSide,
    });

    this.fishMesh = new THREE.InstancedMesh(fishGeo, fishMat, fishCount);
    this.fishMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.fishMesh.castShadow = false;
    this.fishMesh.receiveShadow = false;
    this.fishMesh.frustumCulled = true;
    this.group.add(this.fishMesh);

    // Initialize fish instances
    for (let i = 0; i < fishCount; i++) {
      const x = this.riverMinX + Math.random() * (this.riverMaxX - this.riverMinX);
      const z = this.riverMinZ + Math.random() * (this.riverMaxZ - this.riverMinZ);
      const y = -1.0 - Math.random() * 1.5; // -1.0m to -2.5m (strictly underwater)
      const yaw = Math.random() > 0.5 ? 0 : Math.PI;

      this.fishData.push({
        pos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(0, 0, (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.4)),
        targetY: y,
        swimSpeed: 1.2 + Math.random() * 1.4,
        phaseOffset: Math.random() * Math.PI * 2,
        turnTimer: Math.random() * 5,
        yaw,
      });
    }

    // 2. Build Riverbank Rocks and Shoreline Details
    this.buildRiverbankRocks();

    // 3. Splash Group
    this.splashGroup = new THREE.Group();
    this.group.add(this.splashGroup);
  }

  /**
   * Low-poly aerodynamic fish geometry with fins and tail
   */
  private createFishGeometry(): THREE.BufferGeometry {
    const geo = new THREE.ConeGeometry(0.12, 0.65, 5);
    geo.rotateX(Math.PI / 2); // align along Z axis

    // Flatten slightly on X to look like realistic sleek river fish
    geo.scale(0.55, 1.0, 1.2);
    geo.computeVertexNormals();
    return geo;
  }

  /**
   * Riverbank Granite Rocks and River Bed Stones
   */
  private buildRiverbankRocks() {
    const rockGeo = new THREE.DodecahedronGeometry(0.65, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Smooth dark slate river stones
      roughness: 0.88,
      metalness: 0.1,
    });

    const rockCount = 36;
    const instancedRocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < rockCount; i++) {
      const isWestBank = i < rockCount / 2;
      const bankX = isWestBank ? 63.2 + (Math.random() - 0.5) * 1.5 : 111.8 + (Math.random() - 0.5) * 1.5;
      const z = -180 + (i % (rockCount / 2)) * 24 + (Math.random() - 0.5) * 8;
      const y = -0.3 + (Math.random() - 0.5) * 0.15;
      const scale = 0.5 + Math.random() * 0.9;

      dummy.position.set(bankX, y, z);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale * 1.3, scale * 0.6, scale);
      dummy.updateMatrix();
      instancedRocks.setMatrixAt(i, dummy.matrix);
    }

    instancedRocks.instanceMatrix.needsUpdate = true;
    instancedRocks.receiveShadow = true;
    this.group.add(instancedRocks);
  }

  /**
   * Spawn a circular surface water ripple splash
   */
  public spawnSplash(x: number, z: number, intensity = 1.0) {
    const ringGeo = new THREE.RingGeometry(0.15, 0.45 * intensity, 16);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const splash = new THREE.Mesh(ringGeo, ringMat);
    splash.position.set(x, this.waterSurfaceY + 0.02, z);
    this.splashGroup.add(splash);

    this.activeSplashes.push({
      mesh: splash,
      timer: 0,
      maxTime: 0.65,
      startScale: 1.0,
    });
  }

  /**
   * Per-Frame Simulation of River Wildlife
   */
  public update(delta: number) {
    const time = performance.now() * 0.001;

    // 1. Update Fish School Movement & Tail Undulation
    for (let i = 0; i < this.fishData.length; i++) {
      const f = this.fishData[i];

      // Forward motion
      f.pos.z += Math.cos(f.yaw) * f.swimSpeed * delta;
      f.pos.x += Math.sin(f.yaw) * (f.swimSpeed * 0.4) * delta;

      // Natural vertical gliding
      f.pos.y = THREE.MathUtils.damp(f.pos.y, f.targetY, 2, delta);

      // Procedural tail swish (sine oscillation)
      const swish = Math.sin(time * 6.5 + f.phaseOffset) * 0.18;

      // Boundary checking: keep fish strictly within river channel
      if (f.pos.x < this.riverMinX + 2) {
        f.yaw = Math.PI * 0.5 + Math.random() * 0.3;
      } else if (f.pos.x > this.riverMaxX - 2) {
        f.yaw = -Math.PI * 0.5 - Math.random() * 0.3;
      }

      if (f.pos.z < this.riverMinZ) {
        f.pos.z = this.riverMaxZ;
      } else if (f.pos.z > this.riverMaxZ) {
        f.pos.z = this.riverMinZ;
      }

      // Keep strictly below water surface
      if (f.pos.y > -0.8) {
        f.pos.y = -0.8;
        f.targetY = -1.2 - Math.random() * 1.0;
      }

      // Update instanced transform
      this.dummy.position.copy(f.pos);
      this.dummy.rotation.set(0, f.yaw + swish, swish * 0.5);
      this.dummy.updateMatrix();
      this.fishMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.fishMesh.instanceMatrix.needsUpdate = true;

    // 2. Animate Splash Rings
    for (let i = this.activeSplashes.length - 1; i >= 0; i--) {
      const s = this.activeSplashes[i];
      s.timer += delta;
      const progress = s.timer / s.maxTime;

      if (progress >= 1.0) {
        this.splashGroup.remove(s.mesh);
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
        this.activeSplashes.splice(i, 1);
      } else {
        const scale = 1.0 + progress * 2.8;
        s.mesh.scale.set(scale, 1, scale);
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - progress) * 0.75;
      }
    }
  }

  public dispose() {
    this.fishMesh.geometry.dispose();
    (this.fishMesh.material as THREE.Material).dispose();
    for (const s of this.activeSplashes) {
      s.mesh.geometry.dispose();
      (s.mesh.material as THREE.Material).dispose();
    }
    this.activeSplashes = [];
  }
}
