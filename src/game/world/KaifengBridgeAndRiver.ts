/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

/**
 * Authentic Chinese Kaifeng Rainbow Moon Arch Bridge (汴京虹桥)
 * Spans wide Padma River from West City Avenue (X = 46) to East Countryside Road (X = 139) along Z = 3.
 *
 * Features:
 * - Parabolic arched deck rising smoothly from road level (0.05m) to 6.2m at mid-river crown (X = 92.5),
 *   allowing wide river clearance (~5.6m) for boats and swimmers underneath.
 * - Traditional woven timber arch ribs, vermilion red balustrades, gold finials, and red lanterns.
 * - Flanked by traditional Chinese gate pavilions with upturned glazed tile eaves.
 * - Natural Riverbanks (নদীর প্রাকৃতিক পাড়): Beautiful sandy-silt riverbanks, traditional river ghats
 *   with bathing and boat mooring steps, wild riverside catkin reeds (কাশফুল), smooth river stones,
 *   and bamboo mooring stakes instead of artificial concrete blocks.
 * - Wooden Fishing Pier & Boat Dock at riverbank (X = 53, Z = 14) with Kashem Majhi Fisherman.
 * - Animated wooden boats with fishermen on the wide river.
 */
export class KaifengBridgeAndRiver {
  public group: THREE.Group;
  public obstacles: WorldObstacle[] = [];
  public pierZone = new THREE.Vector3(53, 0.4, 14);
  public boatDockPos = new THREE.Vector3(56, -0.4, 14);
  public fishermanPos = new THREE.Vector3(54.2, 0.5, 14.2);

  // Animated boats, reeds, and water foam
  private animatedBoats: { group: THREE.Group; baseZ: number; speed: number; phase: number }[] = [];
  private foamParticles: THREE.Points | null = null;
  private reedMeshes: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'KaifengBridgeAndRiver';

    this.buildKaifengRainbowBridge();
    this.buildNaturalRiverbanks();
    this.buildWoodenFishingPier();
    this.buildRiverFishermenBoats();
  }

  /**
   * Continuous Analytical Parabolic Arch Elevation
   * Returns exact bridge deck height if (x, z) is on the bridge deck, else null.
   */
  public getBridgeElevation(x: number, z: number): number | null {
    // Bridge spans X from 46 to 139, width: Z from -6.0 to 12.0 (width = 18m)
    if (x >= 46 && x <= 139 && z >= -6.0 && z <= 12.0) {
      const xMid = 92.5;
      const halfL = 46.5;
      const normalizedDist = (x - xMid) / halfL; // -1 to +1
      // Parabolic arch: y = yBase + (hArch - yBase) * (1 - norm^2)
      const archCrownY = 6.2;
      const roadBaseY = 0.05;
      const deckY = roadBaseY + (archCrownY - roadBaseY) * Math.max(0, 1 - normalizedDist * normalizedDist);
      return deckY;
    }
    return null;
  }

  /**
   * Check if coordinate is on the wooden fishing pier
   */
  public getPierElevation(x: number, z: number): number | null {
    // Pier spans X from 50 to 57.5, Z from 11.5 to 16.5
    if (x >= 50 && x <= 57.5 && z >= 11.5 && z <= 16.5) {
      return 0.45; // Wooden pier deck elevation
    }
    return null;
  }

  /**
   * Update animated river boats, water foam, and waving reeds
   */
  public update(delta: number, timeMs: number) {
    // Animate drifting & rowing wooden boats
    for (const b of this.animatedBoats) {
      b.phase += delta * b.speed;
      b.group.position.z = b.baseZ + Math.sin(b.phase * 0.35) * 26;
      b.group.position.y = -0.42 + Math.sin(timeMs * 0.003 + b.phase) * 0.04;
      b.group.rotation.z = Math.sin(timeMs * 0.002 + b.phase) * 0.03;
      b.group.rotation.x = Math.cos(timeMs * 0.002 + b.phase) * 0.02;
    }

    // Swaying riverside catkin reeds in wind
    const sway = Math.sin(timeMs * 0.002) * 0.12;
    for (let i = 0; i < this.reedMeshes.length; i++) {
      this.reedMeshes[i].rotation.z = sway * (0.8 + (i % 5) * 0.1);
    }

    if (this.foamParticles) {
      const pos = this.foamParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i);
        y += Math.sin(timeMs * 0.004 + i) * 0.003;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }
  }

  /**
   * Build the Grand Chinese Kaifeng Rainbow Moon Arch Bridge across the widened river
   */
  private buildKaifengRainbowBridge() {
    const bridgeGroup = new THREE.Group();

    // Authentic Materials
    const vermilionMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Imperial Chinese Vermilion Red
      roughness: 0.45,
      metalness: 0.1,
    });
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Weathered timber beams
      roughness: 0.7,
      metalness: 0.15,
    });
    const deckPlankMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Heavy oak/teak deck planks
      roughness: 0.6,
      metalness: 0.05,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Imperial Gold leaf
      roughness: 0.25,
      metalness: 0.85,
    });
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Chinese charcoal ceramic roof tiles
      roughness: 0.5,
    });
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Glowing Red Silk
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
    });

    const segments = 44;
    const xStart = 46;
    const xEnd = 139;
    const length = xEnd - xStart; // 93m wide river span
    const width = 18; // 18m matching avenue width
    const midX = 92.5;
    const halfL = length / 2;

    const calcY = (x: number) => {
      const norm = (x - midX) / halfL;
      return 0.05 + 6.15 * Math.max(0, 1 - norm * norm);
    };

    // 1. Parabolic Segmented Arched Deck Planks
    for (let i = 0; i < segments; i++) {
      const x1 = xStart + (i / segments) * length;
      const x2 = xStart + ((i + 1) / segments) * length;
      const xMidSeg = (x1 + x2) / 2;
      const y1 = calcY(x1);
      const y2 = calcY(x2);
      const yMidSeg = (y1 + y2) / 2;

      const segLen = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
      const angleZ = Math.atan2(y2 - y1, x2 - x1);

      // Deck Slab
      const deckGeo = new THREE.BoxGeometry(segLen * 1.02, 0.45, width);
      const deckMesh = new THREE.Mesh(deckGeo, deckPlankMat);
      deckMesh.position.set(xMidSeg, yMidSeg - 0.22, 3);
      deckMesh.rotation.z = angleZ;
      deckMesh.receiveShadow = true;
      deckMesh.castShadow = true;
      bridgeGroup.add(deckMesh);

      // Under-Arch Woven Timber Rib Beams (Authentic Kaifeng Rainbow Bridge woven rib system)
      [-width / 2 + 1, -width / 4, 0, width / 4, width / 2 - 1].forEach((beamZ) => {
        const beamGeo = new THREE.BoxGeometry(segLen * 1.05, 0.55, 0.48);
        const beamMesh = new THREE.Mesh(beamGeo, darkWoodMat);
        beamMesh.position.set(xMidSeg, yMidSeg - 0.7, 3 + beamZ);
        beamMesh.rotation.z = angleZ;
        beamMesh.castShadow = true;
        bridgeGroup.add(beamMesh);
      });

      // Vermilion Balustrades & Railings on both edges
      [-width / 2 + 0.3, width / 2 - 0.3].forEach((railZ) => {
        // Lower curb
        const curbMesh = new THREE.Mesh(new THREE.BoxGeometry(segLen * 1.02, 0.25, 0.3), vermilionMat);
        curbMesh.position.set(xMidSeg, yMidSeg + 0.12, 3 + railZ);
        curbMesh.rotation.z = angleZ;
        bridgeGroup.add(curbMesh);

        // Top handrail
        const topRail = new THREE.Mesh(new THREE.BoxGeometry(segLen * 1.02, 0.15, 0.18), vermilionMat);
        topRail.position.set(xMidSeg, yMidSeg + 1.15, 3 + railZ);
        topRail.rotation.z = angleZ;
        bridgeGroup.add(topRail);

        // Lattice infill panel
        const latticePanel = new THREE.Mesh(new THREE.BoxGeometry(segLen * 1.02, 0.65, 0.08), darkWoodMat);
        latticePanel.position.set(xMidSeg, yMidSeg + 0.65, 3 + railZ);
        latticePanel.rotation.z = angleZ;
        bridgeGroup.add(latticePanel);
      });

      // Lotus-Bud Baluster Posts every 3 segments
      if (i % 3 === 0) {
        [-width / 2 + 0.3, width / 2 - 0.3].forEach((railZ) => {
          const postGeo = new THREE.BoxGeometry(0.25, 1.35, 0.25);
          const post = new THREE.Mesh(postGeo, vermilionMat);
          post.position.set(x1, y1 + 0.65, 3 + railZ);
          post.castShadow = true;
          bridgeGroup.add(post);

          // Golden Lotus Finial
          const finialGeo = new THREE.SphereGeometry(0.12, 8, 8);
          const finial = new THREE.Mesh(finialGeo, goldMat);
          finial.position.set(x1, y1 + 1.4, 3 + railZ);
          bridgeGroup.add(finial);

          // Traditional Chinese Lanterns every 6 segments
          if (i % 6 === 0 && i > 3 && i < segments - 3) {
            const lanternGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.45, 10);
            const lantern = new THREE.Mesh(lanternGeo, lanternMat);
            lantern.position.set(x1, y1 + 2.1, 3 + railZ);
            bridgeGroup.add(lantern);

            const lanternLight = new THREE.PointLight(0xf59e0b, 0.8, 6.0);
            lanternLight.position.set(x1, y1 + 2.1, 3 + railZ);
            bridgeGroup.add(lanternLight);
          }
        });
      }
    }

    // 2. Chinese Gate Pavilions at Both Bridge Approaches
    [xStart - 1, xEnd + 1].forEach((pavX, idx) => {
      const pavGroup = new THREE.Group();
      pavGroup.position.set(pavX, 0.05, 3);
      if (idx === 1) pavGroup.rotation.y = Math.PI;

      // Pillars on both sides of road
      [-width / 2 + 0.5, width / 2 - 0.5].forEach((pz) => {
        const pillarGeo = new THREE.CylinderGeometry(0.35, 0.38, 5.5, 12);
        const pillar = new THREE.Mesh(pillarGeo, vermilionMat);
        pillar.position.set(0, 2.75, pz);
        pillar.castShadow = true;
        pavGroup.add(pillar);

        // Golden Column Base
        const pBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.4, 12), goldMat);
        pBase.position.set(0, 0.2, pz);
        pavGroup.add(pBase);
      });

      // Curved Chinese Pagoda Eaves Roof
      const roofGeo = new THREE.BoxGeometry(4.5, 0.6, width + 2.5);
      const roofMesh = new THREE.Mesh(roofGeo, tileMat);
      roofMesh.position.set(0, 5.8, 0);
      roofMesh.castShadow = true;
      pavGroup.add(roofMesh);

      // Gold Ridge Beam
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.3, width + 2.7), goldMat);
      ridge.position.set(0, 6.15, 0);
      pavGroup.add(ridge);

      bridgeGroup.add(pavGroup);
    });

    this.group.add(bridgeGroup);

    // Obstacle collisions along bridge side guardrails so vehicles/players cannot drive off the edges
    this.obstacles.push({
      minX: 46,
      maxX: 139,
      minZ: 3 - width / 2 - 0.4,
      maxZ: 3 - width / 2 + 0.4,
      height: 8.0,
      minY: 0.0,
      maxY: 9.0,
    });
    this.obstacles.push({
      minX: 46,
      maxX: 139,
      minZ: 3 + width / 2 - 0.4,
      maxZ: 3 + width / 2 + 0.4,
      height: 8.0,
      minY: 0.0,
      maxY: 9.0,
    });
  }

  /**
   * Natural Riverbanks & Authentic River Ghats (নদীর প্রাকৃতিক পাড় ও ঘাট)
   * Replaces artificial concrete blocks with:
   * - Sloping sandy-silty natural banks (নদীর ঢালু পাড়)
   * - Traditional terracotta brick & stone stepped river ghats (পাকা ঘাট ও স্নানঘাট)
   * - Wild riverside white catkin reeds (কাশফুল ও কাশবন)
   * - Smooth river stones and boulders resting along the shoreline
   * - Bamboo mooring poles (বাঁশের খোঁটা) with mooring ropes
   */
  private buildNaturalRiverbanks() {
    const bankGroup = new THREE.Group();

    // Natural Soil & Sand Materials
    const bankSiltMat = new THREE.MeshStandardMaterial({
      color: 0x8a7352, // Fertile river silt & sand mixture
      roughness: 0.95,
      metalness: 0.02,
    });
    const riverGhatBrickMat = new THREE.MeshStandardMaterial({
      color: 0xa8432a, // Traditional Bengali terracotta ghat bricks
      roughness: 0.85,
    });
    const riverGhatStoneMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Grey stone edging steps
      roughness: 0.8,
    });
    const bambooMooringMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Bamboo poles
      roughness: 0.7,
    });
    const reedStemMat = new THREE.MeshStandardMaterial({
      color: 0x65a30d, // Green river reed stems
      roughness: 0.8,
    });
    const catkinPlumeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Pure white fluffy Kashful plume
      roughness: 0.9,
    });
    const boulderMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Smooth wet river boulders
      roughness: 0.85,
      metalness: 0.1,
    });

    const zSpan = 700;

    // 1. Natural Sloped Riverbank Berm (West at X ≈ 48.5, East at X ≈ 136.5)
    // Continuous gently sloping earthen bank connecting urban & rural ground (Y = 0.03) down into the water (Y = -0.45)
    [-1, 1].forEach((side) => {
      const isWest = side < 0;
      const shoreX = isWest ? 49.0 : 136.0;

      // Soft natural sand-silt bank strip
      const bankGeo = new THREE.PlaneGeometry(8, zSpan, 2, 60);
      bankGeo.rotateX(-Math.PI / 2);
      const bankMesh = new THREE.Mesh(bankGeo, bankSiltMat);
      bankMesh.position.set(shoreX + (isWest ? 2.5 : -2.5), -0.22, 0);
      bankMesh.rotation.z = isWest ? -0.1 : 0.1;
      bankMesh.receiveShadow = true;
      bankGroup.add(bankMesh);

      // Sandy waterline beach berm
      const beachGeo = new THREE.PlaneGeometry(4, zSpan, 1, 40);
      beachGeo.rotateX(-Math.PI / 2);
      const beachMesh = new THREE.Mesh(beachGeo, bankSiltMat);
      beachMesh.position.set(shoreX + (isWest ? 4.5 : -4.5), -0.42, 0);
      beachMesh.receiveShadow = true;
      bankGroup.add(beachMesh);
    });

    // 2. Traditional River Ghats (নদীর বাঁধানো ঘাট ও সিঁড়ি)
    // Ghat A: West River Ghat (পশ্চিম পাড়ের প্রধান ঘাট) at Z = 24 to 36
    const buildRiverGhat = (startX: number, centerZ: number, isWest: boolean) => {
      const ghatGroup = new THREE.Group();
      ghatGroup.position.set(startX, 0, centerZ);

      // 6 Wide Stepped Terracotta Steps descending into the river water
      const stepWidth = 14;
      const stepTreads = 6;
      for (let s = 0; s < stepTreads; s++) {
        const stepX = isWest ? s * 0.9 : -s * 0.9;
        const stepY = 0.05 - s * 0.11; // Descends from 0.05 to -0.6
        const stepMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.16, stepWidth),
          s % 2 === 0 ? riverGhatBrickMat : riverGhatStoneMat
        );
        stepMesh.position.set(stepX, stepY, 0);
        stepMesh.receiveShadow = true;
        stepMesh.castShadow = true;
        ghatGroup.add(stepMesh);
      }

      // Upper Ghat Landing Platform (বাঁধানো চাতাল)
      const platformX = isWest ? -1.5 : 1.5;
      const platform = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.22, stepWidth + 2), riverGhatBrickMat);
      platform.position.set(platformX, 0.1, 0);
      platform.receiveShadow = true;
      platform.castShadow = true;
      ghatGroup.add(platform);

      // Ghat Retaining Side Walls
      [-stepWidth / 2 - 0.4, stepWidth / 2 + 0.4].forEach((wz) => {
        const wallGeo = new THREE.BoxGeometry(stepTreads * 1.05 + 3.0, 0.55, 0.5);
        const wall = new THREE.Mesh(wallGeo, riverGhatBrickMat);
        wall.position.set(isWest ? 1.5 : -1.5, 0.15, wz);
        wall.castShadow = true;
        ghatGroup.add(wall);
      });

      // Bamboo Mooring Stakes (বাঁশের খোঁটা) driven into shallow water for tying boats
      for (let bz = -stepWidth / 2 + 1; bz <= stepWidth / 2 - 1; bz += 3.5) {
        const stakeX = isWest ? (stepTreads + 0.8) * 0.9 : -(stepTreads + 0.8) * 0.9;
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.6, 8), bambooMooringMat);
        stake.position.set(stakeX, -0.4, bz);
        stake.castShadow = true;
        ghatGroup.add(stake);

        // Coir rope loop around stake
        const rope = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.03, 6, 12),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
        );
        rope.rotation.x = Math.PI / 2;
        rope.position.set(stakeX, 0.2, bz);
        ghatGroup.add(rope);
      }

      bankGroup.add(ghatGroup);
    };

    // West Ghat (near city, south of bridge)
    buildRiverGhat(49.5, 28, true);
    // East Village Ghat (north of bridge, where villagers board dinghies)
    buildRiverGhat(135.5, -24, false);

    // 3. Natural Scattered River Boulders and Smooth Stones (নদীর নুড়িপাথর)
    // Instanced smooth river stones naturally distributed along the waterline
    const boulderCount = 56;
    const boulderGeo = new THREE.DodecahedronGeometry(0.55, 1);
    const instancedBoulders = new THREE.InstancedMesh(boulderGeo, boulderMat, boulderCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < boulderCount; i++) {
      const isWest = i % 2 === 0;
      const baseShoreX = isWest ? 51.5 : 133.5;
      const bX = baseShoreX + (Math.random() - 0.5) * 3.5;
      const bZ = -zSpan / 2 + (i / boulderCount) * zSpan + (Math.random() - 0.5) * 8;
      // Skip bridge road crossing (Z: -8 to 14) and ghat (Z: 20 to 36)
      if ((bZ >= -8 && bZ <= 14) || (bZ >= 20 && bZ <= 36)) continue;

      const scale = 0.5 + Math.random() * 0.8;
      dummy.position.set(bX, -0.32 + Math.random() * 0.1, bZ);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.set(scale * 1.4, scale * 0.65, scale);
      dummy.updateMatrix();
      instancedBoulders.setMatrixAt(i, dummy.matrix);
    }
    instancedBoulders.instanceMatrix.needsUpdate = true;
    instancedBoulders.receiveShadow = true;
    bankGroup.add(instancedBoulders);

    // 4. Wild Riverside White Catkin Reeds (নদীর কাশবন ও কাশফুল clumping reeds)
    const reedGroup = new THREE.Group();
    const clusterPositions = [
      { x: 50.2, z: -45 },
      { x: 49.5, z: -85 },
      { x: 51.0, z: -140 },
      { x: 50.5, z: 65 },
      { x: 49.8, z: 110 },
      { x: 51.2, z: 165 },
      { x: 135.0, z: -60 },
      { x: 134.5, z: -110 },
      { x: 135.5, z: 45 },
      { x: 134.8, z: 85 },
      { x: 135.2, z: 140 },
    ];

    clusterPositions.forEach((cl) => {
      for (let r = 0; r < 7; r++) {
        const stalk = new THREE.Group();
        const rx = cl.x + (Math.random() - 0.5) * 3.5;
        const rz = cl.z + (Math.random() - 0.5) * 3.5;
        stalk.position.set(rx, -0.2, rz);

        // Slender reed stem
        const stemHeight = 1.8 + Math.random() * 0.8;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, stemHeight, 5), reedStemMat);
        stem.position.y = stemHeight / 2;
        stalk.add(stem);

        // Fluffy white Kashful catkin plume at top
        const plume = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 6), catkinPlumeMat);
        plume.position.y = stemHeight + 0.22;
        plume.rotation.z = (Math.random() - 0.5) * 0.2;
        stalk.add(plume);

        this.reedMeshes.push(stem);
        reedGroup.add(stalk);
      }
    });
    bankGroup.add(reedGroup);

    // 5. Continuous Water Shoreline Foam & Wave Splash Particles
    const foamCount = 200;
    const foamGeo = new THREE.BufferGeometry();
    const foamPositions = new Float32Array(foamCount * 3);

    for (let i = 0; i < foamCount; i++) {
      const isWest = i % 2 === 0;
      const sideX = isWest ? 52.5 : 132.5;
      const z = -280 + (i / foamCount) * 560;
      foamPositions[i * 3] = sideX + (Math.random() - 0.5) * 0.6;
      foamPositions[i * 3 + 1] = -0.34 + Math.random() * 0.08;
      foamPositions[i * 3 + 2] = z;
    }

    foamGeo.setAttribute('position', new THREE.BufferAttribute(foamPositions, 3));
    const foamMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.65,
      transparent: true,
      opacity: 0.6,
    });
    this.foamParticles = new THREE.Points(foamGeo, foamMat);
    bankGroup.add(this.foamParticles);

    this.group.add(bankGroup);
  }

  /**
   * Wooden Fishing Pier & Boat Dock (কাঠের তৈরি নৌকা ঘাট)
   * Located at natural riverbank (X = 53, Z = 14) beside the Chinese Bridge.
   */
  private buildWoodenFishingPier() {
    const pierGroup = new THREE.Group();

    const woodPlankMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Weathered timber pier boards
      roughness: 0.75,
    });
    const pileMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Creosote wooden pilings
      roughness: 0.9,
    });
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8,
    });

    // 1. Main Pier Deck (extends from natural riverbank X = 50.0 out over the water to X = 57.5, Z: 12 to 16)
    const pierLen = 7.5;
    const pierWid = 4.2;
    const pierDeckGeo = new THREE.BoxGeometry(pierLen, 0.25, pierWid);
    const pierDeck = new THREE.Mesh(pierDeckGeo, woodPlankMat);
    pierDeck.position.set(53.75, 0.4, 14);
    pierDeck.receiveShadow = true;
    pierDeck.castShadow = true;
    pierGroup.add(pierDeck);

    // 2. Heavy Timber Support Piles driven into riverbed
    [51.0, 54.0, 57.0].forEach((px) => {
      [12.2, 15.8].forEach((pz) => {
        const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 4.5, 8), pileMat);
        pile.position.set(px, -1.2, pz);
        pile.castShadow = true;
        pierGroup.add(pile);

        // Mooring Cleats / Posts on deck
        const cleat = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), pileMat);
        cleat.position.set(px, 0.7, pz);
        pierGroup.add(cleat);
      });
    });

    // 3. Pier End Mooring Bollards & Coiled Ropes
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 6, 12), ropeMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.set(56.8, 0.55, 13.2);
    pierGroup.add(coil);

    // 4. Wooden Pier Handrails on North & South edges
    [-1, 1].forEach((dir) => {
      const railZ = 14 + dir * 1.95;
      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(pierLen, 0.12, 0.12), woodPlankMat);
      railMesh.position.set(53.75, 1.25, railZ);
      pierGroup.add(railMesh);

      // Stanchions
      for (let rx = 51.0; rx <= 57.0; rx += 2.0) {
        const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), pileMat);
        stanchion.position.set(rx, 0.85, railZ);
        pierGroup.add(stanchion);
      }
    });

    // 5. Pier Water Boarding Ladder down to boat
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.8 });
    const ladderRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), ladderMat);
    ladderRail1.position.set(57.4, -0.1, 13.6);
    pierGroup.add(ladderRail1);

    const ladderRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), ladderMat);
    ladderRail2.position.set(57.4, -0.1, 14.4);
    pierGroup.add(ladderRail2);

    for (let y = -0.7; y <= 0.4; y += 0.28) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), ladderMat);
      rung.rotation.x = Math.PI / 2;
      rung.position.set(57.4, y, 14.0);
      pierGroup.add(rung);
    }

    // 6. Warm Hurricane Lamp hanging on Pier Post
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 8), pileMat);
    lampPost.position.set(57.0, 1.5, 15.6);
    pierGroup.add(lampPost);

    const pierLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    pierLamp.position.set(57.0, 2.4, 15.6);
    pierGroup.add(pierLamp);

    const pierLight = new THREE.PointLight(0xf59e0b, 1.5, 8.0);
    pierLight.position.set(57.0, 2.4, 15.6);
    pierGroup.add(pierLight);

    // 7. Fisherman Kashem Majhi (কাশেম মাঝি) 3D Model with Fishing Rod (ছিপ)
    this.buildFishermanNPC(pierGroup, 54.5, 0.525, 14.8);

    this.group.add(pierGroup);
  }

  /**
   * 3D Fisherman Kashem Majhi (কাশেম মাঝি) with Bamboo Fishing Rod (ছিপ)
   */
  private buildFishermanNPC(parent: THREE.Group, x: number, y: number, z: number) {
    const npcGroup = new THREE.Group();
    npcGroup.name = 'FishermanKashemNPC';
    npcGroup.position.set(x, y, z);
    npcGroup.rotation.y = Math.PI * 0.15; // Facing wide river

    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });
    const lungiMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 }); // Blue checked lungi
    const vestMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }); // White vest
    const gamchaMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Orange/red gamcha
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }); // Bamboo fishing rod
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });

    // Lower body (seated on wooden pier bench or standing leaning forward)
    const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.85, 10), lungiMat);
    legs.position.y = 0.425;
    npcGroup.add(legs);

    // Torso (Bengali cotton vest)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.28), vestMat);
    torso.position.y = 1.15;
    npcGroup.add(torso);

    // Red/Orange Gamcha around neck/shoulders
    const gamcha = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 12), gamchaMat);
    gamcha.rotation.x = Math.PI / 2;
    gamcha.position.set(0, 1.45, 0);
    npcGroup.add(gamcha);

    // Head with conical straw sun hat (মাথাল / Mathal)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), skinMat);
    head.position.y = 1.62;
    npcGroup.add(head);

    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.25, 12), bambooMat);
    hat.position.y = 1.76;
    npcGroup.add(hat);

    // Arms holding the fishing rod extended toward the water
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6), skinMat);
    armR.rotation.x = Math.PI * 0.4;
    armR.position.set(0.24, 1.25, 0.25);
    npcGroup.add(armR);

    // Long Slender Bamboo Fishing Rod (ছিপ) pointing out over the river
    const rodLen = 4.8;
    const rodGeo = new THREE.CylinderGeometry(0.02, 0.05, rodLen, 8);
    const rod = new THREE.Mesh(rodGeo, bambooMat);
    rod.rotation.x = Math.PI * 0.35;
    rod.rotation.z = -0.15;
    rod.position.set(0.3, 1.5, 1.8);
    npcGroup.add(rod);

    // Fishing Line hanging down into water
    const lineGeo = new THREE.CylinderGeometry(0.005, 0.005, 2.8, 4);
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(0.55, 0.2, 3.6);
    npcGroup.add(line);

    // Red & White Fishing Bobber (ফাৎনা) floating on water
    const bobber = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    bobber.position.set(0.55, -0.4, 3.6);
    npcGroup.add(bobber);

    // Woven Fish Basket (খালই / Khaloi) on pier beside him
    const basketGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.45, 8);
    const basket = new THREE.Mesh(basketGeo, bambooMat);
    basket.position.set(-0.4, 0.22, 0.2);
    npcGroup.add(basket);

    parent.add(npcGroup);
  }

  /**
   * Traditional Wooden Boats with Fishermen across the widened river
   */
  private buildRiverFishermenBoats() {
    const boatConfigs = [
      { x: 74, z: -45, speed: 0.8, phase: 0.5 },
      { x: 108, z: 65, speed: 0.6, phase: 1.8 },
      { x: 86, z: -110, speed: 0.7, phase: 3.2 },
      { x: 102, z: 120, speed: 0.5, phase: 4.5 },
      { x: 92, z: -170, speed: 0.65, phase: 2.1 },
    ];

    const woodHullMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const woodTrimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.8 });
    const whiteClothMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 });
    const netMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8, wireframe: true, transparent: true, opacity: 0.6 });

    for (const cfg of boatConfigs) {
      const boatGroup = new THREE.Group();
      boatGroup.position.set(cfg.x, -0.42, cfg.z);

      // Traditional Bangladeshi Dinghy / Sampan Wooden Hull
      const hullGeo = new THREE.BoxGeometry(1.6, 0.65, 5.2);
      const hull = new THREE.Mesh(hullGeo, woodHullMat);
      hull.position.y = 0.2;
      hull.castShadow = true;
      boatGroup.add(hull);

      // Pointed Bow & Stern
      [-2.6, 2.6].forEach((dirZ) => {
        const point = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.4, 4), woodTrimMat);
        point.rotation.x = dirZ > 0 ? -Math.PI / 2 : Math.PI / 2;
        point.position.set(0, 0.2, dirZ);
        boatGroup.add(point);
      });

      // Bamboo Canopy (ছৈ / Chhoi) over middle of boat
      const chhoiGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 8, 1, true, 0, Math.PI);
      chhoiGeo.rotateZ(Math.PI / 2);
      const chhoi = new THREE.Mesh(chhoiGeo, woodTrimMat);
      chhoi.position.set(0, 0.65, -0.2);
      boatGroup.add(chhoi);

      // 3D Fisherman rowing / holding fishing net
      const fisherman = new THREE.Group();
      fisherman.position.set(0, 0.45, 1.5);

      const fTorso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.24), whiteClothMat);
      fTorso.position.y = 0.4;
      fisherman.add(fTorso);

      const fHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), skinMat);
      fHead.position.y = 0.8;
      fisherman.add(fHead);

      // Mathal Straw Hat
      const fHat = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.18, 10), woodTrimMat);
      fHat.position.y = 0.92;
      fisherman.add(fHat);

      // Oar (বৈঠা) or Cast Net (জাল)
      const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6), woodTrimMat);
      oar.rotation.x = Math.PI * 0.4;
      oar.rotation.z = Math.PI * 0.25;
      oar.position.set(0.6, 0.2, 0.2);
      fisherman.add(oar);

      // Cast fishing net spread into water
      const net = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 8, 4, true), netMat);
      net.rotation.x = Math.PI;
      net.position.set(0.8, -0.2, 1.2);
      fisherman.add(net);

      boatGroup.add(fisherman);
      this.group.add(boatGroup);

      this.animatedBoats.push({
        group: boatGroup,
        baseZ: cfg.z,
        speed: cfg.speed,
        phase: cfg.phase,
      });
    }
  }
}
