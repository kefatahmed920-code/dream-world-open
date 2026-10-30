/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

/**
 * Authentic Chinese Kaifeng Rainbow Moon Arch Bridge (汴京虹桥)
 * Spans Padma River from West City Avenue (X = 50) to East Road (X = 125) along Z = 3.
 *
 * Features:
 * - Parabolic arched deck rising smoothly from road level (0.03m) to 5.2m at mid-river crown,
 *   and descending smoothly to the opposite road.
 * - Free waterway clearance beneath (clearance ~4.8m) allowing boats to pass under freely.
 * - Traditional woven timber arch ribs, vermilion red balustrades, gold finials, and red lanterns.
 * - Flanked by traditional Chinese pavilions with upturned glazed tile eaves.
 * - Wooden Fishing Pier & Boat Dock at riverbank (X = 65, Z = 14) with Kashem Majhi Fisherman.
 * - Riverbank embankment revetment protection blocks along both shores.
 * - Animated wooden boats with fishermen on the river.
 */
export class KaifengBridgeAndRiver {
  public group: THREE.Group;
  public obstacles: WorldObstacle[] = [];
  public pierZone = new THREE.Vector3(65, 0.4, 14);
  public boatDockPos = new THREE.Vector3(68, -0.4, 14);
  public fishermanPos = new THREE.Vector3(66.5, 0.5, 14.2);

  // Animated boats and water foam
  private animatedBoats: { group: THREE.Group; baseZ: number; speed: number; phase: number }[] = [];
  private foamParticles: THREE.Points | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'KaifengBridgeAndRiver';

    this.buildKaifengRainbowBridge();
    this.buildRiverbankEmbankmentBlocks();
    this.buildWoodenFishingPier();
    this.buildRiverFishermenBoats();
  }

  /**
   * Continuous Analytical Parabolic Arch Elevation
   * Returns exact bridge deck height if (x, z) is on the bridge deck, else null.
   */
  public getBridgeElevation(x: number, z: number): number | null {
    // Bridge spans X from 50 to 125, width: Z from -5.5 to 11.5 (width = 17m)
    if (x >= 50 && x <= 125 && z >= -5.5 && z <= 11.5) {
      const xMid = 87.5;
      const halfL = 37.5;
      const normalizedDist = (x - xMid) / halfL; // -1 to +1
      // Parabolic arch: y = yBase + (hArch - yBase) * (1 - norm^2)
      const archCrownY = 5.2;
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
    // Pier spans X from 62.5 to 70, Z from 11.5 to 16.5
    if (x >= 62.5 && x <= 70 && z >= 11.5 && z <= 16.5) {
      return 0.45; // Wooden pier deck elevation
    }
    return null;
  }

  /**
   * Update animated river boats and water foam
   */
  public update(delta: number, timeMs: number) {
    // Animate drifting & rowing wooden boats
    for (const b of this.animatedBoats) {
      b.phase += delta * b.speed;
      b.group.position.z = b.baseZ + Math.sin(b.phase * 0.4) * 22;
      b.group.position.y = -0.42 + Math.sin(timeMs * 0.003 + b.phase) * 0.04;
      b.group.rotation.z = Math.sin(timeMs * 0.002 + b.phase) * 0.03;
      b.group.rotation.x = Math.cos(timeMs * 0.002 + b.phase) * 0.02;
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
   * Build the Grand Chinese Kaifeng Rainbow Moon Arch Bridge
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

    const segments = 36;
    const xStart = 50;
    const xEnd = 125;
    const length = xEnd - xStart;
    const width = 17;
    const midX = 87.5;
    const halfL = length / 2;

    const calcY = (x: number) => {
      const norm = (x - midX) / halfL;
      return 0.05 + 5.15 * Math.max(0, 1 - norm * norm);
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
        const beamGeo = new THREE.BoxGeometry(segLen * 1.05, 0.5, 0.45);
        const beamMesh = new THREE.Mesh(beamGeo, darkWoodMat);
        beamMesh.position.set(xMidSeg, yMidSeg - 0.65, 3 + beamZ);
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
      minX: 50,
      maxX: 125,
      minZ: 3 - width / 2 - 0.4,
      maxZ: 3 - width / 2 + 0.4,
      height: 7.0,
      minY: 0.0,
      maxY: 8.0,
    });
    this.obstacles.push({
      minX: 50,
      maxX: 125,
      minZ: 3 + width / 2 - 0.4,
      maxZ: 3 + width / 2 + 0.4,
      height: 7.0,
      minY: 0.0,
      maxY: 8.0,
    });
  }

  /**
   * Concrete Embankment Protection Blocks (নদীর পাড় ব্লক দিয়ে বাঁধানো)
   * Interlocking protection blocks along West (X ≈ 63) and East (X ≈ 112) riverbanks.
   */
  private buildRiverbankEmbankmentBlocks() {
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Weathered engineered river granite blocks
      roughness: 0.85,
      metalness: 0.15,
    });

    const blockGroup = new THREE.Group();

    // West Shoreline Revetment Blocks (X = 63.2)
    const zSpan = 650;
    const blockStep = 4.0;

    for (let z = -zSpan / 2; z <= zSpan / 2; z += blockStep) {
      // Leave gap for wooden fishing pier at Z = 11 to 17
      if (z >= 10 && z <= 18) continue;

      // Two tiers of concrete riprap revetment blocks
      // Upper tier
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 3.6), blockMat);
      b1.position.set(63.2, 0.15, z);
      b1.rotation.z = -0.22;
      b1.receiveShadow = true;
      blockGroup.add(b1);

      // Lower tier touching water
      const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 3.6), blockMat);
      b2.position.set(64.5, -0.35, z + 1.8);
      b2.rotation.z = -0.35;
      b2.receiveShadow = true;
      blockGroup.add(b2);
    }

    // East Shoreline Revetment Blocks (X = 111.8)
    for (let z = -zSpan / 2; z <= zSpan / 2; z += blockStep) {
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 3.6), blockMat);
      b1.position.set(111.8, 0.15, z);
      b1.rotation.z = 0.22;
      b1.receiveShadow = true;
      blockGroup.add(b1);

      const b2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 3.6), blockMat);
      b2.position.set(110.5, -0.35, z + 1.8);
      b2.rotation.z = 0.35;
      b2.receiveShadow = true;
      blockGroup.add(b2);
    }

    this.group.add(blockGroup);

    // Continuous Water Embankment Foam & Wave Splash Particles
    const foamCount = 180;
    const foamGeo = new THREE.BufferGeometry();
    const foamPositions = new Float32Array(foamCount * 3);

    for (let i = 0; i < foamCount; i++) {
      const sideX = i % 2 === 0 ? 64.8 : 110.2;
      const z = -250 + (i / foamCount) * 500;
      foamPositions[i * 3] = sideX + (Math.random() - 0.5) * 0.4;
      foamPositions[i * 3 + 1] = -0.32 + Math.random() * 0.08;
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
    this.group.add(this.foamParticles);
  }

  /**
   * Wooden Fishing Pier & Boat Dock (কাঠের তৈরি নৌকা ঘাট)
   * Located at riverbank (X = 65, Z = 14) beside the Chinese Bridge.
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

    // 1. Main Pier Deck (extends from riverbank X = 62.5 out over the water to X = 70.0, Z: 12 to 16)
    const pierLen = 7.5;
    const pierWid = 4.2;
    const pierDeckGeo = new THREE.BoxGeometry(pierLen, 0.25, pierWid);
    const pierDeck = new THREE.Mesh(pierDeckGeo, woodPlankMat);
    pierDeck.position.set(66.25, 0.4, 14);
    pierDeck.receiveShadow = true;
    pierDeck.castShadow = true;
    pierGroup.add(pierDeck);

    // 2. Heavy Timber Support Piles driven into riverbed
    [63.5, 66.5, 69.5].forEach((px) => {
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
    coil.position.set(69.2, 0.55, 13.2);
    pierGroup.add(coil);

    // 4. Wooden Pier Handrails on North & South edges
    [-1, 1].forEach((dir) => {
      const railZ = 14 + dir * 1.95;
      const railMesh = new THREE.Mesh(new THREE.BoxGeometry(pierLen, 0.12, 0.12), woodPlankMat);
      railMesh.position.set(66.25, 1.25, railZ);
      pierGroup.add(railMesh);

      // Stanchions
      for (let rx = 63.5; rx <= 69.5; rx += 2.0) {
        const stanchion = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), pileMat);
        stanchion.position.set(rx, 0.85, railZ);
        pierGroup.add(stanchion);
      }
    });

    // 5. Pier Water Boarding Ladder down to boat
    const ladderMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.8 });
    const ladderRail1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), ladderMat);
    ladderRail1.position.set(69.9, -0.1, 13.6);
    pierGroup.add(ladderRail1);

    const ladderRail2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.6, 0.06), ladderMat);
    ladderRail2.position.set(69.9, -0.1, 14.4);
    pierGroup.add(ladderRail2);

    for (let y = -0.7; y <= 0.4; y += 0.28) {
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), ladderMat);
      rung.rotation.x = Math.PI / 2;
      rung.position.set(69.9, y, 14.0);
      pierGroup.add(rung);
    }

    // 6. Warm Hurricane Lamp hanging on Pier Post
    const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.2, 8), pileMat);
    lampPost.position.set(69.5, 1.5, 15.6);
    pierGroup.add(lampPost);

    const pierLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    pierLamp.position.set(69.5, 2.4, 15.6);
    pierGroup.add(pierLamp);

    const pierLight = new THREE.PointLight(0xf59e0b, 1.5, 8.0);
    pierLight.position.set(69.5, 2.4, 15.6);
    pierGroup.add(pierLight);

    // 7. Fisherman Kashem Majhi (কাশেম মাঝি) 3D Model with Fishing Rod (ছিপ)
    this.buildFishermanNPC(pierGroup, 67.5, 0.525, 14.8);

    this.group.add(pierGroup);
  }

  /**
   * 3D Fisherman Kashem Majhi (কাশেম মাঝি) with Bamboo Fishing Rod (ছিপ)
   */
  private buildFishermanNPC(parent: THREE.Group, x: number, y: number, z: number) {
    const npcGroup = new THREE.Group();
    npcGroup.name = 'FishermanKashemNPC';
    npcGroup.position.set(x, y, z);
    npcGroup.rotation.y = Math.PI * 0.15; // Facing river

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
   * Traditional Wooden Boats with Fishermen (মাঝিরা নৌকা নিয়ে মাছ ধরছে)
   */
  private buildRiverFishermenBoats() {
    const boatConfigs = [
      { x: 78, z: -45, speed: 0.8, phase: 0.5 },
      { x: 96, z: 65, speed: 0.6, phase: 1.8 },
      { x: 84, z: -110, speed: 0.7, phase: 3.2 },
      { x: 92, z: 120, speed: 0.5, phase: 4.5 },
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
