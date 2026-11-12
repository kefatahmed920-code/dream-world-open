/**
 * Grand Ancient Chinese Wooden Bridge & Two Monumental Imperial Gates
 * Dream World — Phase 3
 * Inspired by traditional Chinese architectural heritage (Wind-and-Rain Bridges, Dougong brackets,
 * multi-tiered curved eave roofs, carved lattice balustrades, and imperial gatehouses).
 *
 * Timber Colors:
 *  - Main timber: #76563B
 *  - Weathered timber: #604A35
 *  - Sunlit timber: #A1845C
 *  - Dark structural wood: #40352B
 */

import * as THREE from 'three';
import { textureFactory } from './textures';

export interface BridgeCollisionResult {
  onBridge: boolean;
  height: number;
  surface: 'wood' | 'stone';
}

export class AncientBridgeManager {
  public group: THREE.Group = new THREE.Group();
  public foamPositions: THREE.Vector3[] = [];

  // Bridge centerline and dimensions
  public readonly BRIDGE_X = 152;
  public readonly BRIDGE_HALF_WIDTH = 3.6; // Width = 7.2m
  public readonly NORTH_GATE_Z = -22;
  public readonly SOUTH_GATE_Z = 24;

  constructor() {
    this.buildBridgeSubstructure();
    this.buildBridgeDeckAndWalkway();
    this.buildBridgePavilionsAndCorridors();
    this.buildFirstMonumentalGate();
    this.buildSecondMonumentalGate();
    this.buildEasternRiverLanding();
  }

  /**
   * Continuous mathematical elevation function across the arched bridge deck.
   * Parabolic arch reaching Y = 6.0m at the crown (Z = 1.0) and Y = 3.8m at the gate thresholds.
   */
  public getBridgeDeckHeight(z: number): number {
    const crownZ = 1.0;
    const maxZDist = 24.0;
    const dist = Math.abs(z - crownZ);
    const norm = Math.min(1.0, dist / maxZDist);
    // Smooth parabolic curve: 6.0m at crown down to 3.8m at ends
    return 6.0 - Math.pow(norm, 1.8) * 2.2;
  }

  /**
   * Collision query for the bridge, ramps, gates, and river landing
   */
  public queryBridgeCollision(x: number, z: number): BridgeCollisionResult {
    // 1. Eastern River Landing Steps & Approach Path (connects boat disembarkation to North Gate)
    // Landing platform at X: 138 to 154, Z: -26 to -14
    if (x >= 137 && x <= 156 && z >= -27 && z <= -14) {
      if (x < 148) {
        // Landing terrace ascending toward the North Gate plinth
        const t = (x - 138) / 10.0;
        const landingH = THREE.MathUtils.lerp(0.8, 3.8, Math.max(0, Math.min(1, t)));
        return { onBridge: true, height: landingH, surface: 'stone' };
      }
    }

    // 2. Main Bridge Corridor (between North Gate Z = -24 and South Gate Z = 26)
    const minX = this.BRIDGE_X - this.BRIDGE_HALF_WIDTH;
    const maxX = this.BRIDGE_X + this.BRIDGE_HALF_WIDTH;

    if (x >= minX - 0.3 && x <= maxX + 0.3 && z >= this.NORTH_GATE_Z - 3 && z <= this.SOUTH_GATE_Z + 5) {
      // Height along arched deck
      const deckH = this.getBridgeDeckHeight(z);
      const isStone = z <= this.NORTH_GATE_Z || z >= this.SOUTH_GATE_Z;
      return {
        onBridge: true,
        height: isStone ? (z <= this.NORTH_GATE_Z ? 3.8 : 4.0) : deckH,
        surface: isStone ? 'stone' : 'wood',
      };
    }

    // 3. South Gate Exit Terrace (leads toward the future city realm)
    if (x >= minX - 2 && x <= maxX + 2 && z >= this.SOUTH_GATE_Z && z <= this.SOUTH_GATE_Z + 12) {
      return { onBridge: true, height: 4.0, surface: 'stone' };
    }

    return { onBridge: false, height: 0, surface: 'wood' };
  }

  /**
   * 1. Substructure:
   * 4 monumental river pier assemblies with stone cutwaters (Yanjiao) parting the water,
   * bundled heavy timber pilings, and cantilever corbel bracket arms.
   */
  private buildBridgeSubstructure() {
    const bridgeWoodTex = textureFactory.getAncientBridgeWoodTexture();
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: bridgeWoodTex,
      color: new THREE.Color('#40352B'),
      roughness: 0.9,
      metalness: 0.05,
    });

    const weatheredWoodMat = new THREE.MeshStandardMaterial({
      map: bridgeWoodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.85,
    });

    const slateTex = textureFactory.getSlateRockTexture();
    const stoneProwMat = new THREE.MeshStandardMaterial({
      map: slateTex,
      color: new THREE.Color('#6E6E69'),
      roughness: 0.88,
    });

    const pierZPositions = [-14, -5, 5, 14];

    pierZPositions.forEach((pz) => {
      const pierGroup = new THREE.Group();
      pierGroup.position.set(this.BRIDGE_X, 0, pz);

      // A. Stone Cutwater Pier Foundation in the river (parts water current flowing West to East)
      // Triangular prow facing upstream (negative X) and rounded stern facing downstream (positive X)
      const prowGeom = new THREE.CylinderGeometry(2.2, 2.6, 5.0, 6);
      prowGeom.rotateY(Math.PI / 6);
      const stonePier = new THREE.Mesh(prowGeom, stoneProwMat);
      stonePier.position.set(0, -1.0, 0);
      stonePier.scale.set(1.6, 1.0, 1.1);
      stonePier.castShadow = true;
      stonePier.receiveShadow = true;
      pierGroup.add(stonePier);

      // Record water contact point for foam rings
      this.foamPositions.push(new THREE.Vector3(this.BRIDGE_X - 3.2, 0.02, pz));
      this.foamPositions.push(new THREE.Vector3(this.BRIDGE_X + 3.2, 0.02, pz));

      // B. Bundled heavy timber pillars extending up to the bridge deck
      const targetDeckY = this.getBridgeDeckHeight(pz);
      const pillarHeight = targetDeckY + 2.0;
      const pilingsGeom = new THREE.CylinderGeometry(0.35, 0.42, pillarHeight, 10);

      [-2.4, 0, 2.4].forEach((ox) => {
        const post = new THREE.Mesh(pilingsGeom, darkWoodMat);
        post.position.set(ox, targetDeckY - pillarHeight * 0.5, 0);
        post.castShadow = true;
        pierGroup.add(post);

        // Iron structural reinforcing bands
        for (let b = 1; b <= 3; b++) {
          const band = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.04, 6, 12),
            new THREE.MeshStandardMaterial({ color: 0x1A1A1A, roughness: 0.5, metalness: 0.8 })
          );
          band.rotateX(Math.PI / 2);
          band.position.set(ox, targetDeckY - b * 1.5, 0);
          pierGroup.add(band);
        }
      });

      // C. Cantilever corbel timber brackets (arch ribs expanding outward under the beams)
      for (let tier = 1; tier <= 3; tier++) {
        const armLen = 2.6 + tier * 1.2;
        const armGeom = new THREE.BoxGeometry(7.6, 0.35, armLen);
        const arm = new THREE.Mesh(armGeom, weatheredWoodMat);
        arm.position.set(0, targetDeckY - (4 - tier) * 0.35, 0);
        arm.castShadow = true;
        pierGroup.add(arm);
      }

      this.group.add(pierGroup);
    });

    // Longitudinal heavy support stringer beams (spanning from North to South along both flanks)
    const beamGeom = new THREE.BoxGeometry(0.5, 0.6, 50);
    [-this.BRIDGE_HALF_WIDTH + 0.3, this.BRIDGE_HALF_WIDTH - 0.3].forEach((bx) => {
      const beam = new THREE.Mesh(beamGeom, darkWoodMat);
      beam.position.set(this.BRIDGE_X + bx, 4.5, 1.0);
      beam.castShadow = true;
      this.group.add(beam);
    });
  }

  /**
   * 2. Bridge Deck Surface & Carved Balustrades:
   * Staggered aged timber planks following the arch, with carved lattice balustrades and lotus finials.
   */
  private buildBridgeDeckAndWalkway() {
    const bridgeWoodTex = textureFactory.getAncientBridgeWoodTexture();
    const latticeTex = textureFactory.getCarvedLatticeTexture();
    latticeTex.repeat.set(4, 1);

    const mainWoodMat = new THREE.MeshStandardMaterial({
      map: bridgeWoodTex,
      color: new THREE.Color('#76563B'),
      roughness: 0.82,
    });

    const sunlitWoodMat = new THREE.MeshStandardMaterial({
      map: bridgeWoodTex,
      color: new THREE.Color('#A1845C'),
      roughness: 0.78,
    });

    const weatheredWoodMat = new THREE.MeshStandardMaterial({
      map: bridgeWoodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.88,
    });

    const balustradeMat = new THREE.MeshStandardMaterial({
      map: latticeTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.75,
    });

    const deckGroup = new THREE.Group();

    // A. Transverse wooden deck planks (from Z = -22 to Z = +24)
    const plankDepth = 0.45;
    for (let z = this.NORTH_GATE_Z; z <= this.SOUTH_GATE_Z; z += plankDepth) {
      const plankY = this.getBridgeDeckHeight(z);
      const isSunlit = Math.random() > 0.6;
      const mat = isSunlit ? sunlitWoodMat : (Math.random() > 0.4 ? mainWoodMat : weatheredWoodMat);

      const plankGeom = new THREE.BoxGeometry(this.BRIDGE_HALF_WIDTH * 2 - 0.2, 0.14, plankDepth - 0.04);
      const plank = new THREE.Mesh(plankGeom, mat);
      plank.position.set(this.BRIDGE_X, plankY, z);
      plank.castShadow = true;
      plank.receiveShadow = true;
      deckGroup.add(plank);
    }

    // B. Carved Wooden Balustrades & Railing Posts
    const postInterval = 2.4;
    const postGeom = new THREE.BoxGeometry(0.18, 1.25, 0.18);
    const finialGeom = new THREE.SphereGeometry(0.12, 8, 8); // Lotus bud finial

    [-this.BRIDGE_HALF_WIDTH, this.BRIDGE_HALF_WIDTH].forEach((ox) => {
      for (let z = this.NORTH_GATE_Z; z <= this.SOUTH_GATE_Z; z += postInterval) {
        const postY = this.getBridgeDeckHeight(z) + 0.62;

        // Balustrade post
        const post = new THREE.Mesh(postGeom, weatheredWoodMat);
        post.position.set(this.BRIDGE_X + ox, postY, z);
        post.castShadow = true;
        deckGroup.add(post);

        // Lotus bud finial
        const finial = new THREE.Mesh(finialGeom, weatheredWoodMat);
        finial.position.set(this.BRIDGE_X + ox, postY + 0.68, z);
        deckGroup.add(finial);

        // Carved lattice panel between posts
        if (z + postInterval <= this.SOUTH_GATE_Z) {
          const midZ = z + postInterval * 0.5;
          const midY = this.getBridgeDeckHeight(midZ) + 0.55;
          const panelGeom = new THREE.BoxGeometry(0.08, 0.75, postInterval - 0.2);
          const panel = new THREE.Mesh(panelGeom, balustradeMat);
          panel.position.set(this.BRIDGE_X + ox, midY, midZ);
          panel.castShadow = true;
          deckGroup.add(panel);

          // Top railing bar
          const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, postInterval), weatheredWoodMat);
          topRail.position.set(this.BRIDGE_X + ox, midY + 0.42, midZ);
          deckGroup.add(topRail);
        }
      }
    });

    this.group.add(deckGroup);
  }

  /**
   * 3. Covered Pavilions & Wind-and-Rain Corridor:
   * Features a magnificent central imperial pavilion at the bridge apex with a 2-tier flared roof,
   * decorative Dougong brackets, resting benches, and hanging glowing lanterns.
   */
  private buildBridgePavilionsAndCorridors() {
    const pavilionGroup = new THREE.Group();
    const roofTex = textureFactory.getChineseRoofTileTexture();
    roofTex.repeat.set(6, 2);

    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
      metalness: 0.1,
    });

    const redLacquerTex = textureFactory.getChineseLacqueredRedTexture();
    const redMat = new THREE.MeshStandardMaterial({
      map: redLacquerTex,
      color: new THREE.Color('#9A241C'),
      roughness: 0.6,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.4,
      metalness: 0.6,
    });

    const woodTex = textureFactory.getAncientBridgeWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.85,
    });

    // Center Apex Pavilion (Z = 1.0)
    const apexZ = 1.0;
    const apexDeckY = this.getBridgeDeckHeight(apexZ);

    // 8 Grand Columns supporting the central pavilion
    const colGeom = new THREE.CylinderGeometry(0.2, 0.24, 3.8, 12);
    const colOffsets: [number, number][] = [
      [-3.2, -3.5], [3.2, -3.5],
      [-3.2, 3.5], [3.2, 3.5],
      [-3.2, -1.2], [3.2, -1.2],
      [-3.2, 1.2], [3.2, 1.2],
    ];

    colOffsets.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(colGeom, redMat);
      col.position.set(this.BRIDGE_X + cx, apexDeckY + 1.9, apexZ + cz);
      col.castShadow = true;
      pavilionGroup.add(col);

      // Lotus stone base (Zhuchu)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.25, 8), woodMat);
      base.position.set(this.BRIDGE_X + cx, apexDeckY + 0.12, apexZ + cz);
      pavilionGroup.add(base);
    });

    // Central Pavilion Tier 1 Flared Eaved Roof
    const roof1Geom = this.createChineseRoof(9.2, 9.8, 1.6);
    const roof1 = new THREE.Mesh(roof1Geom, roofMat);
    roof1.position.set(this.BRIDGE_X, apexDeckY + 4.2, apexZ);
    roof1.castShadow = true;
    pavilionGroup.add(roof1);

    // Central Pavilion Upper Lantern Drum / Pavilion Kiosk
    const drum = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.4, 5.2), redMat);
    drum.position.set(this.BRIDGE_X, apexDeckY + 5.2, apexZ);
    drum.castShadow = true;
    pavilionGroup.add(drum);

    // Central Pavilion Tier 2 Imperial Crown Roof (Xieshan style)
    const roof2Geom = this.createChineseRoof(6.6, 6.6, 1.5);
    const roof2 = new THREE.Mesh(roof2Geom, roofMat);
    roof2.position.set(this.BRIDGE_X, apexDeckY + 6.3, apexZ);
    roof2.castShadow = true;
    pavilionGroup.add(roof2);

    // Golden Ridge Ornaments & Dragon Finials (Chiwen)
    const ridgeSpire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.5, 8), goldTrimMat);
    ridgeSpire.position.set(this.BRIDGE_X, apexDeckY + 7.5, apexZ);
    pavilionGroup.add(ridgeSpire);

    // Viewing benches inside the central pavilion
    [-3.0, 3.0].forEach((bx) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 5.0), woodMat);
      bench.position.set(this.BRIDGE_X + bx, apexDeckY + 0.5, apexZ);
      bench.castShadow = true;
      pavilionGroup.add(bench);
    });

    // Hanging warm lanterns inside central pavilion
    const lantern1 = this.createChineseSilkLantern(true);
    lantern1.position.set(this.BRIDGE_X - 1.8, apexDeckY + 3.4, apexZ);
    const lantern2 = this.createChineseSilkLantern(true);
    lantern2.position.set(this.BRIDGE_X + 1.8, apexDeckY + 3.4, apexZ);
    pavilionGroup.add(lantern1, lantern2);

    // Side corridor roofs along the bridge (Wind-and-Rain covered walkway)
    [-11, 13].forEach((corridorZ) => {
      const cDeckY = this.getBridgeDeckHeight(corridorZ);
      const cRoofGeom = this.createChineseRoof(8.4, 11.0, 1.2);
      const cRoof = new THREE.Mesh(cRoofGeom, roofMat);
      cRoof.position.set(this.BRIDGE_X, cDeckY + 3.8, corridorZ);
      cRoof.castShadow = true;
      pavilionGroup.add(cRoof);

      // Support posts for side corridors
      [-3.2, 3.2].forEach((cx) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), redMat);
        post.position.set(this.BRIDGE_X + cx, cDeckY + 1.6, corridorZ);
        post.castShadow = true;
        pavilionGroup.add(post);
      });
    });

    this.group.add(pavilionGroup);
  }

  /**
   * 4. The First Monumental Chinese Gate (Northern Entrance Gate):
   * Located at X = 152, Z = -22.
   * Multi-tiered flared eaves, four massive red columns with stone bases,
   * intricate Dougong bracket sets, traditional calligraphy plaque, and hanging imperial lanterns.
   */
  private buildFirstMonumentalGate() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(this.BRIDGE_X, 0, this.NORTH_GATE_Z);

    const roofTex = textureFactory.getChineseRoofTileTexture();
    roofTex.repeat.set(8, 2);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
    });

    const redLacquerTex = textureFactory.getChineseLacqueredRedTexture();
    const redMat = new THREE.MeshStandardMaterial({
      map: redLacquerTex,
      color: new THREE.Color('#9A241C'),
      roughness: 0.58,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.35,
      metalness: 0.7,
    });

    const stoneTex = textureFactory.getSlateRockTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#787872'),
      roughness: 0.85,
    });

    const groundBaseY = 3.8;

    // A. Monumental Carved Stone Podium Plinth
    const plinthGeom = new THREE.BoxGeometry(13.5, 0.8, 5.5);
    const plinth = new THREE.Mesh(plinthGeom, stoneMat);
    plinth.position.set(0, groundBaseY - 0.4, 0);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    gateGroup.add(plinth);

    // Stepped entrance ramp from north landing
    const rampGeom = new THREE.BoxGeometry(8.5, 0.4, 2.5);
    const ramp = new THREE.Mesh(rampGeom, stoneMat);
    ramp.position.set(0, groundBaseY - 0.6, -3.2);
    gateGroup.add(ramp);

    // B. Four Colossal Vermilion Columns (San-jian 3-bay architecture)
    const colGeom = new THREE.CylinderGeometry(0.35, 0.42, 6.2, 16);
    const colPositions = [-4.6, -2.4, 2.4, 4.6];

    colPositions.forEach((cx, idx) => {
      // Stone column foundation pedestal (Zhuchu)
      const baseGeom = new THREE.CylinderGeometry(0.55, 0.65, 0.5, 8);
      const base = new THREE.Mesh(baseGeom, stoneMat);
      base.position.set(cx, groundBaseY + 0.25, 0);
      base.castShadow = true;
      gateGroup.add(base);

      // Colossal Column
      const col = new THREE.Mesh(colGeom, redMat);
      col.position.set(cx, groundBaseY + 3.1, 0);
      col.castShadow = true;
      gateGroup.add(col);

      // Bronze/Gold column banding
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 12), goldMat);
      band.rotateX(Math.PI / 2);
      band.position.set(cx, groundBaseY + 1.2, 0);
      gateGroup.add(band);
    });

    // C. Heavy Horizontal Lintels & Beams (Efang & Lan-e)
    const lintelGeom = new THREE.BoxGeometry(12.5, 0.6, 0.7);
    const lintel = new THREE.Mesh(lintelGeom, redMat);
    lintel.position.set(0, groundBaseY + 5.2, 0);
    lintel.castShadow = true;
    gateGroup.add(lintel);

    // D. Intricate Dougong Bracket Clusters (supporting the lower and upper roofs)
    for (let bx = -5.0; bx <= 5.0; bx += 1.2) {
      for (let l = 0; l < 3; l++) {
        const dougongArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, 0.15, 0.9 + l * 0.35),
          redMat
        );
        dougongArm.position.set(bx, groundBaseY + 5.5 + l * 0.18, 0);
        dougongArm.castShadow = true;
        gateGroup.add(dougongArm);

        // Golden bracket block (Dou)
        const douBlock = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.3), goldMat);
        douBlock.position.set(bx, groundBaseY + 5.6 + l * 0.18, 0.4 + l * 0.15);
        gateGroup.add(douBlock);
      }
    }

    // E. Traditional Chinese Calligraphy Plaque above the central passage
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1F2428'),
      roughness: 0.4,
    });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.1, 0.15), plaqueMat);
    plaque.position.set(0, groundBaseY + 4.4, -0.42);
    gateGroup.add(plaque);

    const plaqueBorder = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.3, 0.12), goldMat);
    plaqueBorder.position.set(0, groundBaseY + 4.4, -0.4);
    gateGroup.add(plaqueBorder);

    // F. Lower Tier Roof (Side Eaves)
    const lowerRoofGeom = this.createChineseRoof(14.5, 5.8, 1.6);
    const lowerRoof = new THREE.Mesh(lowerRoofGeom, roofMat);
    lowerRoof.position.set(0, groundBaseY + 6.3, 0);
    lowerRoof.castShadow = true;
    gateGroup.add(lowerRoof);

    // G. Upper Pavilion Chamber
    const upperChamber = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.6, 3.8), redMat);
    upperChamber.position.set(0, groundBaseY + 7.5, 0);
    upperChamber.castShadow = true;
    gateGroup.add(upperChamber);

    // H. Monumental Upper Tier Imperial Roof (Xieshan Hip-and-Gable)
    const upperRoofGeom = this.createChineseRoof(11.0, 5.2, 1.8);
    const upperRoof = new THREE.Mesh(upperRoofGeom, roofMat);
    upperRoof.position.set(0, groundBaseY + 8.8, 0);
    upperRoof.castShadow = true;
    gateGroup.add(upperRoof);

    // Golden Chiwen Dragon Ridge Ends & Spire
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.0, 8), goldMat);
    spire.position.set(0, groundBaseY + 10.2, 0);
    gateGroup.add(spire);

    // I. Four Large Hanging Imperial Silk Lanterns
    [-2.4, 2.4].forEach((lx) => {
      const lanternNorth = this.createChineseSilkLantern(true);
      lanternNorth.position.set(lx, groundBaseY + 4.5, -1.8);
      const lanternSouth = this.createChineseSilkLantern(true);
      lanternSouth.position.set(lx, groundBaseY + 4.5, 1.8);
      gateGroup.add(lanternNorth, lanternSouth);
    });

    this.group.add(gateGroup);
  }

  /**
   * 5. The Second Monumental Chinese Gate (Southern Realm Gate):
   * Located at X = 152, Z = +24.
   * Distinctive architecture: Fortress gatehouse with dual flanking watchtower bastions (Que towers),
   * stone ramparts, carved imperial guardian beasts (Shishi), and double-eaved crown.
   */
  private buildSecondMonumentalGate() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(this.BRIDGE_X, 0, this.SOUTH_GATE_Z);

    const roofTex = textureFactory.getChineseRoofTileTexture();
    roofTex.repeat.set(8, 2);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.65,
    });

    const redLacquerTex = textureFactory.getChineseLacqueredRedTexture();
    const redMat = new THREE.MeshStandardMaterial({
      map: redLacquerTex,
      color: new THREE.Color('#8E221A'),
      roughness: 0.6,
    });

    const stoneTex = textureFactory.getSlateRockTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#64645E'),
      roughness: 0.88,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.35,
      metalness: 0.7,
    });

    const baseY = 4.0;

    // A. Massive Stone Fortress Gate Base with Archway
    // Left & Right fortress bastions flanking the 5.4m central portal
    const bastionGeom = new THREE.BoxGeometry(4.2, 5.0, 6.0);
    const leftBastion = new THREE.Mesh(bastionGeom, stoneMat);
    leftBastion.position.set(-5.2, baseY + 2.5, 0);
    leftBastion.castShadow = true;
    leftBastion.receiveShadow = true;

    const rightBastion = new THREE.Mesh(bastionGeom, stoneMat);
    rightBastion.position.set(5.2, baseY + 2.5, 0);
    rightBastion.castShadow = true;
    rightBastion.receiveShadow = true;
    gateGroup.add(leftBastion, rightBastion);

    // Massive Stone Portal Arch Lintel
    const archLintel = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.2, 5.8), stoneMat);
    archLintel.position.set(0, baseY + 5.6, 0);
    archLintel.castShadow = true;
    gateGroup.add(archLintel);

    // Fortress rampart parapet & crenels
    for (let cx = -7.0; cx <= 7.0; cx += 1.8) {
      if (Math.abs(cx) > 2.8) {
        const crenel = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 0.6), stoneMat);
        crenel.position.set(cx, baseY + 6.6, -2.8);
        gateGroup.add(crenel);
      }
    }

    // B. Upper Gatehouse Grand Pavilion (2-story pavilion atop the fortress base)
    const pavilionDeckY = baseY + 6.2;
    const pavilionBase = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.4, 6.4), stoneMat);
    pavilionBase.position.set(0, pavilionDeckY, 0);
    gateGroup.add(pavilionBase);

    // Red lacquered gallery columns
    const colPositions: [number, number][] = [
      [-5.0, -2.6], [-2.5, -2.6], [2.5, -2.6], [5.0, -2.6],
      [-5.0, 2.6], [-2.5, 2.6], [2.5, 2.6], [5.0, 2.6],
    ];

    colPositions.forEach(([cx, cz]) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 3.4, 10), redMat);
      col.position.set(cx, pavilionDeckY + 1.7, cz);
      col.castShadow = true;
      gateGroup.add(col);
    });

    // Enclosed central upper sanctuary hall with carved lattice windows
    const hallMat = new THREE.MeshStandardMaterial({
      map: redLacquerTex,
      color: new THREE.Color('#781C15'),
      roughness: 0.65,
    });
    const hall = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.0, 4.4), hallMat);
    hall.position.set(0, pavilionDeckY + 1.6, 0);
    hall.castShadow = true;
    gateGroup.add(hall);

    // C. Dual Flanking Watchtower Kiosks (Que pavilions on left and right)
    [-5.2, 5.2].forEach((qx) => {
      const queRoofGeom = this.createChineseRoof(4.2, 4.2, 1.3);
      const queRoof = new THREE.Mesh(queRoofGeom, roofMat);
      queRoof.position.set(qx, pavilionDeckY + 3.8, 0);
      queRoof.castShadow = true;
      gateGroup.add(queRoof);
    });

    // D. Grand Upper Double-Eaved Hip-and-Gable Roof
    const mainRoofGeom = this.createChineseRoof(14.0, 7.8, 2.2);
    const mainRoof = new THREE.Mesh(mainRoofGeom, roofMat);
    mainRoof.position.set(0, pavilionDeckY + 4.2, 0);
    mainRoof.castShadow = true;
    gateGroup.add(mainRoof);

    // Golden Dragon Crest Spire
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.4, 8), goldMat);
    spire.position.set(0, pavilionDeckY + 6.0, 0);
    gateGroup.add(spire);

    // E. Sculpted Imperial Guardian Lion Statues (Shishi) flanking the bridge exit
    [-3.8, 3.8].forEach((lx) => {
      const lionGroup = this.createImperialGuardianLion();
      lionGroup.position.set(lx, baseY, 3.5);
      lionGroup.rotation.y = Math.PI; // Facing back across the bridge toward arriving travelers
      gateGroup.add(lionGroup);
    });

    // F. Hanging Silk Lanterns
    [-2.2, 2.2].forEach((lx) => {
      const lantern = this.createChineseSilkLantern(true);
      lantern.position.set(lx, baseY + 4.8, 3.2);
      gateGroup.add(lantern);
    });

    this.group.add(gateGroup);
  }

  /**
   * 6. Eastern River Landing Pier (Phase 2 Boat Arrival Destination):
   * Located at X = 142, Z = -16.
   * Where the boat docks smoothly. Features wooden mooring bollards, landing stairs,
   * stone path ascending to the First Monumental Gate.
   */
  private buildEasternRiverLanding() {
    const landingGroup = new THREE.Group();
    const woodTex = textureFactory.getAncientBridgeWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#76563B'),
      roughness: 0.85,
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#40352B'),
      roughness: 0.9,
    });

    const slateTex = textureFactory.getSlateRockTexture();
    const stonePathMat = new THREE.MeshStandardMaterial({
      map: slateTex,
      roughness: 0.88,
    });

    // A. Boat landing floating dock & deck (X: 138 to 146, Z: -18 to -12, Y: 0.55m)
    const landingDeck = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.45, 6.0), woodMat);
    landingDeck.position.set(142, 0.45, -15);
    landingDeck.castShadow = true;
    landingDeck.receiveShadow = true;
    landingGroup.add(landingDeck);

    // Landing Pilings
    const pillarGeom = new THREE.CylinderGeometry(0.25, 0.28, 4.5, 8);
    [139, 145].forEach((px) => {
      [-17, -13].forEach((pz) => {
        const p = new THREE.Mesh(pillarGeom, darkWoodMat);
        p.position.set(px, -1.2, pz);
        landingGroup.add(p);
        this.foamPositions.push(new THREE.Vector3(px, 0.02, pz));
      });
    });

    // Mooring bollards on the landing deck
    const bollardGeom = new THREE.CylinderGeometry(0.18, 0.2, 0.85, 10);
    [138.8, 145.2].forEach((bx) => {
      const bollard = new THREE.Mesh(bollardGeom, darkWoodMat);
      bollard.position.set(bx, 1.0, -12.5);
      landingGroup.add(bollard);
    });

    // B. Stone steps ascending from landing up to the First Gate plinth (from Y = 0.55 up to Y = 3.8)
    const stepCount = 8;
    for (let s = 0; s < stepCount; s++) {
      const stepX = 142 + s * 1.1;
      const stepZ = -18 - s * 0.45;
      const stepY = 0.6 + s * 0.4;
      const step = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.38, 2.2), stonePathMat);
      step.position.set(stepX, stepY, stepZ);
      step.castShadow = true;
      step.receiveShadow = true;
      landingGroup.add(step);
    }

    this.group.add(landingGroup);
  }

  /**
   * Helper to generate authentic Chinese curved roofs with upturned eaves (Feiyan)
   */
  private createChineseRoof(width: number, depth: number, height: number): THREE.BufferGeometry {
    const segX = 16;
    const segZ = 12;
    const geom = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Normalized distance from center
      const nx = (x / (width * 0.5));
      const nz = (z / (depth * 0.5));
      const r = Math.sqrt(nx * nx + nz * nz);

      // Central pitch sloping down
      let y = height * (1.0 - Math.min(1.0, r * 0.85));

      // Traditional upturned eave flare at edges and corners (Feiyan)
      const edgeDist = Math.max(Math.abs(nx), Math.abs(nz));
      if (edgeDist > 0.65) {
        const flare = Math.pow((edgeDist - 0.65) / 0.35, 2.0);
        y += flare * height * 0.65;
      }

      pos.setY(i, y);
    }

    geom.computeVertexNormals();
    return geom;
  }

  /**
   * Traditional Chinese Silk Lantern with warm golden glow
   */
  private createChineseSilkLantern(withLight: boolean): THREE.Group {
    const lantern = new THREE.Group();

    // Red silk octagonal lantern body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D62828'),
      emissive: new THREE.Color('#FF5722'),
      emissiveIntensity: 0.65,
      roughness: 0.4,
    });
    const bodyGeom = new THREE.CylinderGeometry(0.32, 0.28, 0.65, 8);
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    lantern.add(body);

    // Gold brass cap and base
    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      metalness: 0.8,
      roughness: 0.3,
    });
    const topCap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.15, 8), capMat);
    topCap.position.set(0, 0.38, 0);
    lantern.add(topCap);

    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.1, 8), capMat);
    botCap.position.set(0, -0.36, 0);
    lantern.add(botCap);

    // Hanging red silk tassel
    const tasselGeom = new THREE.CylinderGeometry(0.04, 0.08, 0.45, 6);
    const tassel = new THREE.Mesh(tasselGeom, new THREE.MeshStandardMaterial({ color: 0x9A1810 }));
    tassel.position.set(0, -0.62, 0);
    lantern.add(tassel);

    if (withLight) {
      const light = new THREE.PointLight('#FF8C38', 1.1, 7.0, 1.2);
      light.position.set(0, 0, 0);
      lantern.add(light);
    }

    return lantern;
  }

  /**
   * Sculpted Chinese Guardian Lion Statue (Shishi) on Stone Plinth
   */
  private createImperialGuardianLion(): THREE.Group {
    const lion = new THREE.Group();
    const stoneTex = textureFactory.getSlateRockTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#585854'),
      roughness: 0.9,
    });

    // Pedestal base
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 1.1), stoneMat);
    base.position.set(0, 0.32, 0);
    base.castShadow = true;
    lion.add(base);

    // Lion torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.75), stoneMat);
    torso.position.set(0, 0.95, 0);
    torso.castShadow = true;
    lion.add(torso);

    // Stylized mane & head
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 0), stoneMat);
    head.position.set(0, 1.45, 0.2);
    lion.add(head);

    return lion;
  }
}
