/**
 * Dream World Terrain System — Phase 1 Natural Riverbanks & Gorge
 * Replaces artificial straight vertical walls with organic sloping banks,
 * natural soil layers, layered slate shorelines, and opens the eastern river channel
 * while preserving the historic Dhaka city ghat and bridge foundation.
 */

import * as THREE from 'three';
import { textureFactory } from './textures';

export interface TerrainCollisionResult {
  height: number;
  normal: THREE.Vector3;
  surface: 'grass' | 'earth' | 'stone' | 'water' | 'wood';
  inWater: boolean;
  waterDepth: number;
}

export class TerrainManager {
  public group: THREE.Group = new THREE.Group();
  public readonly WATER_LEVEL = 0.0;
  private terrainMesh!: THREE.Mesh;
  private naturalEmbankmentGroup: THREE.Group = new THREE.Group();

  constructor() {
    this.createTerrainGeometry();
    this.createOrganicRiverbankBorders();
  }

  /**
   * Continuous mathematical elevation function of the Dream World terrain.
   * Guarantees seamless collision and realistic Where Winds Meet river geography.
   */
  public getElevationAt(x: number, z: number): number {
    // 1. River channel definition
    // River centerline flows from X = -150 to X = +180
    // Meander function: gentle S-curve extending to the eastern opened gorge
    let riverCenterZ = 0;
    if (x > 30) {
      // Eastward bend into the opened river continuation
      const eastFactor = (x - 30) / 130;
      riverCenterZ = Math.sin(eastFactor * Math.PI * 0.85) * 16;
    } else if (x < -30) {
      // Westward curve under Dhaka bridge
      riverCenterZ = Math.sin((x + 30) * 0.02) * 8;
    }

    const distFromRiver = Math.abs(z - riverCenterZ);
    // Broadened River Channel (Vastly wider riverbed spanning 52m to 76m across)
    const channelHalfWidth = x > 30 ? 30 + (x - 30) * 0.055 : 24;

    let baseElevation = 0;

    if (distFromRiver < channelHalfWidth) {
      // Inside river bed
      const bedDepth = -4.0 + Math.cos((distFromRiver / channelHalfWidth) * Math.PI * 0.5) * -1.4;
      // Gentle underwater undulations
      const ripples = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.35;
      baseElevation = bedDepth + ripples;
    } else {
      // Riverbank slope transition
      const bankDistance = distFromRiver - channelHalfWidth;
      const bankSlopeFactor = Math.min(1.0, bankDistance / 14.0);

      // Organic non-linear slope easing (natural soil embankment)
      const naturalSlope = Math.pow(bankSlopeFactor, 1.4) * 4.6;

      // North bank (Dhaka city side: Z < riverCenterZ)
      if (z < riverCenterZ) {
        // Preserved Dhaka city terrace
        if (x >= -70 && x <= 25 && z < -18) {
          // Dhaka city promenade plateau
          baseElevation = 3.6 + Math.sin(x * 0.05) * 0.2;
        } else if (x > 35) {
          // Eastward opened northern riverbank - gentle rolling willow meadows and low limestone bluffs
          const hillNoise = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 3.5 + Math.sin(x * 0.12) * 1.5;
          baseElevation = 1.2 + naturalSlope * 0.9 + Math.max(0, hillNoise);
        } else {
          // Westward upstream bluffs
          baseElevation = 1.0 + naturalSlope * 0.8 + Math.sin(x * 0.08) * 1.0;
        }
      } else {
        // South bank (Lush natural wilderness: Z > riverCenterZ)
        // Gentle sloping beaches near water, rising to scenic green hills in the background
        const wildernessNoise = Math.sin(x * 0.05 + 1.2) * Math.cos(z * 0.04) * 4.0 + Math.sin((x + z) * 0.1) * 1.2;
        // The old unnatural mountain wall around X=50..90, Z=15..40 has been sculpted down!
        baseElevation = 1.0 + naturalSlope + Math.max(0, wildernessNoise * 0.85);
      }

      // Add micro-topography for natural soil feel (Where Winds Meet organic ground)
      const microTerrain = Math.sin(x * 0.35) * Math.cos(z * 0.35) * 0.18 + Math.sin(x * 0.8) * 0.08;
      baseElevation += microTerrain;
    }

    // Specific dock footing adjustment (slight natural shelf where dock meets bank at X: -4 to +24, Z: -15 to -8)
    if (x >= -6 && x <= 26 && z >= -16 && z <= -8) {
      // Natural packed earth slope meeting the dock transition ramp
      const dockBankT = (z - (-16)) / 8;
      const dockTarget = THREE.MathUtils.lerp(3.2, 0.4, dockBankT);
      baseElevation = THREE.MathUtils.lerp(baseElevation, dockTarget, 0.65);
    }

    // Ancient City Entrance District & Phase 5 Complete Ancient City Plateau (X: 50 to 360, Z: 22 to 370)
    // Ensures a solid, beautifully terraced foundation for all 8 districts, roads, palace, and farmlands
    if (x >= 50 && x <= 360 && z >= 22 && z <= 370) {
      if (x >= 180 && x <= 290 && z >= 185 && z <= 300) {
        // District 3: Elevated Imperial Palace Terrace
        baseElevation = 5.6;
      } else if (x >= 124 && x <= 136 && z >= 65 && z <= 275) {
        // Inner Canal Waterway Trench
        baseElevation = 3.0;
      } else if (z >= 270 && x <= 270) {
        // District 7: Outer Village & Farmland
        baseElevation = 3.8 + Math.sin(x * 0.05) * 0.15;
      } else if (x < 310) {
        // City Main Paved Terrace
        const cityT = Math.min(1.0, (z - 22) / 60.0);
        baseElevation = 4.0 + cityT * 0.3;
      }
    }

    // EXPANDED CHINESE HERITAGE REALM & MAJESTIC KARST MOUNTAINS (X: 50..520, Z: 270..540)
    // 1. Expanded Jiangnan Water-Town & Canal (X: 60..140, Z: 310..440)
    if (x >= 60 && x <= 140 && z >= 310 && z <= 440) {
      if (x >= 92 && x <= 104) {
        // Extended Water-Town Canal
        baseElevation = 2.8;
      } else {
        baseElevation = 3.9 + Math.sin(z * 0.08) * 0.1;
      }
    }

    // 2. Siheyuan Courtyards, Hanlin Scholars Academy, and Guan Yu Temple Terrace (X: 145..310, Z: 300..440)
    if (x >= 145 && x <= 310 && z >= 300 && z <= 440) {
      baseElevation = 4.35;
    }

    // 3. Dragon Gate Waterfall & Mountain Spring Terrace (X: 310..350, Z: 320..365)
    if (x >= 310 && x <= 350 && z >= 320 && z <= 365) {
      const distFromDrop = (x - 310) / 40.0;
      baseElevation = THREE.MathUtils.lerp(4.35, 8.5, distFromDrop);
    }

    // 4. Mountain Winding Trail ascending to Tianyun Daoist Temple and Great Wall Ridge
    // Trail Path from (310, 370) -> (350, 395) -> (385, 415)
    const distToTrail1 = Math.hypot(x - THREE.MathUtils.lerp(300, 360, (z - 350) / 50), 0);
    if (z >= 340 && z <= 420 && x >= 290 && x <= 375 && distToTrail1 < 6.0) {
      const trailProgress = (z - 340) / 75.0;
      const trailHeight = THREE.MathUtils.lerp(4.35, 14.5, trailProgress);
      baseElevation = Math.max(baseElevation, trailHeight);
    }

    // 5. Tianyun Cloud Hermitage Daoist Temple Plateau (X: 365..430, Z: 385..450)
    if (x >= 365 && x <= 430 && z >= 385 && z <= 450) {
      baseElevation = 14.5;
    }

    // 6. Great Wall Beacon Tower Ridge & Fortified Crest (X: 410..470, Z: 280..355)
    if (x >= 410 && x <= 470 && z >= 280 && z <= 355) {
      baseElevation = 18.5;
    }

    // 7. Majestic Huangshan / Guilin Karst Peaks (Pinnacles rising dramatically behind the temples)
    // Peak A: Tianyun High Summit (X: 450, Z: 435, Peak height: ~29m)
    const distPeakA = Math.hypot(x - 450, z - 435);
    if (distPeakA < 55) {
      const peakHeight = Math.cos((distPeakA / 55) * Math.PI * 0.5) * 29.0;
      baseElevation = Math.max(baseElevation, 14.0 + peakHeight);
    }

    // Peak B: Dragon Spine Karst Spire (X: 480, Z: 345, Peak height: ~32m)
    const distPeakB = Math.hypot(x - 480, z - 345);
    if (distPeakB < 50) {
      const peakHeight = Math.cos((distPeakB / 50) * Math.PI * 0.5) * 32.0;
      baseElevation = Math.max(baseElevation, 18.0 + peakHeight);
    }

    // Peak C: Cloud Gate Karst Pillar (X: 390, Z: 510, Peak height: ~28m)
    const distPeakC = Math.hypot(x - 390, z - 510);
    if (distPeakC < 60) {
      const peakHeight = Math.cos((distPeakC / 60) * Math.PI * 0.5) * 28.0;
      baseElevation = Math.max(baseElevation, 12.0 + peakHeight);
    }

    // Peak D: Eastern Gorge High Bluff (X: 480, Z: 220, Peak height: ~26m)
    const distPeakD = Math.hypot(x - 480, z - 220);
    if (distPeakD < 45) {
      const peakHeight = Math.cos((distPeakD / 45) * Math.PI * 0.5) * 26.0;
      baseElevation = Math.max(baseElevation, 4.0 + peakHeight);
    }

    // =========================================================================
    // MASTER WORLD EXPANSION — KAIFENG: THE GRAND DYNASTY (8 INTERCONNECTED DISTRICTS)
    // =========================================================================

    // 8. DISTRICT 6 — COUNTRYSIDE AND FARMLAND (West Kaifeng Agricultural Basin: X: -140..45, Z: 40..260)
    // Natural terraced loam shelves, rice paddies, and irrigation sluices
    if (x >= -140 && x <= 45 && z >= 40 && z <= 260) {
      const tier = Math.floor((z - 40) / 45.0);
      const tierElevation = 2.4 + tier * 0.45;
      // Gentle field undulation
      const fieldRipple = Math.sin(x * 0.06) * 0.12 + Math.cos(z * 0.06) * 0.1;
      let farmHeight = tierElevation + fieldRipple;
      // Irrigation canals running through fields
      if (Math.abs(x - (-35)) < 1.6 || Math.abs(x - 5) < 1.6) {
        farmHeight = tierElevation - 0.7; // sunken water canal
      }
      baseElevation = Math.max(baseElevation, farmHeight);
    }

    // 9. DISTRICT 5 — ROYAL GARDEN DISTRICT (Genyue Imperial Pleasure Garden: X: 280..440, Z: 90..250)
    // Shimmering Lotus Pond, scholar rockery knolls, and paved imperial terraces
    if (x >= 280 && x <= 440 && z >= 90 && z <= 250) {
      // Shimmering Dragon Lake & Lotus Pond depression (X: 325..395, Z: 125..195)
      const distFromPondCenter = Math.hypot((x - 360) / 35.0, (z - 160) / 35.0);
      if (distFromPondCenter < 1.0) {
        // Sunken lotus pond basin (bottom Y = 1.6m, water level Y = 3.0m)
        const pondDepth = (1.0 - distFromPondCenter) * 2.6;
        baseElevation = 4.3 - pondDepth;
      } else {
        // Imperial garden terrace with gentle artificial hillocks (Taihu mounds)
        const gardenMound = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.6;
        baseElevation = 4.35 + Math.max(0, gardenMound);
      }
    }

    // 10. DISTRICT 4 — MOUNTAIN VILLAGE (Yunling Village: X: 50..180, Z: 440..530)
    // Terraced slopes ascending from water-town to the Heavenly Lake gorge
    if (x >= 50 && x <= 180 && z >= 440 && z <= 530) {
      const slopeProgress = (z - 440) / 90.0;
      const villageTier = Math.floor(slopeProgress * 4.0) / 4.0;
      const terracedHeight = THREE.MathUtils.lerp(4.2, 13.5, villageTier) + Math.sin(x * 0.07) * 0.2;
      baseElevation = Math.max(baseElevation, terracedHeight);
    }

    // 11. DISTRICT 8 — HEAVENLY LAKE & WATERFALL VALLEY (Tianchi Valley: X: -50..140, Z: 490..680)
    // Alpine mountain tarn, sheer gorge cliffs, and Thunder Waterfall (Leishen Falls)
    if (x >= -50 && x <= 140 && z >= 490 && z <= 680) {
      const distFromLakeCenter = Math.hypot((x - 35) / 45.0, (z - 570) / 50.0);
      if (distFromLakeCenter < 1.0) {
        // High mountain tarn basin (Lakebed Y = 6.8m, crystal alpine water Y = 8.5m)
        const tarnDepth = (1.0 - distFromLakeCenter) * 2.2;
        baseElevation = 8.8 - tarnDepth;
      } else if (z > 625) {
        // Sheer cliff face where Thunder Waterfall cascades down from Y = 28m
        const cliffProgress = Math.min(1.0, (z - 625) / 35.0);
        baseElevation = THREE.MathUtils.lerp(8.5, 28.0, cliffProgress);
      } else {
        // Valley walls and pine slopes
        const rimProgress = Math.min(1.0, (distFromLakeCenter - 1.0) / 0.8);
        baseElevation = THREE.MathUtils.lerp(8.5, 24.0, rimProgress);
      }
    }

    // 12. DISTRICT 7 — NORTHERN FORTRESS AND GREAT WALL MOUNTAIN CREST (X: 320..660, Z: 460..720)
    // Mountain ridges climbing up to Y = 18m..36m where the winding Great Wall ramparts follow crests
    if (x >= 320 && x <= 660 && z >= 460 && z <= 720) {
      // Ridge spine path from (360, 480) -> (450, 540) -> (530, 610) -> (620, 680)
      const ridgeT = THREE.MathUtils.clamp((z - 460) / 250.0, 0, 1);
      const ridgeCenterX = THREE.MathUtils.lerp(360, 620, ridgeT);
      const distToRidge = Math.abs(x - ridgeCenterX);

      if (distToRidge < 40.0) {
        const ridgeElevation = THREE.MathUtils.lerp(18.5, 34.0, ridgeT);
        const crestFalloff = Math.cos((distToRidge / 40.0) * Math.PI * 0.5);
        baseElevation = Math.max(baseElevation, 12.0 + (ridgeElevation - 12.0) * crestFalloff);
      }
    }

    return baseElevation;
  }

  /**
   * Collision and ground query
   */
  public queryPoint(x: number, z: number): TerrainCollisionResult {
    const height = this.getElevationAt(x, z);
    const inWater = height < this.WATER_LEVEL;
    const waterDepth = inWater ? this.WATER_LEVEL - height : 0;

    // Numerical gradient for surface normal
    const eps = 0.2;
    const hL = this.getElevationAt(x - eps, z);
    const hR = this.getElevationAt(x + eps, z);
    const hD = this.getElevationAt(x, z - eps);
    const hU = this.getElevationAt(x, z + eps);
    const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU).normalize();

    // Determine surface type based on slope, region, and district characteristics
    let surface: 'grass' | 'earth' | 'stone' | 'water' | 'wood' = 'grass';
    if (inWater && waterDepth > 0.4) {
      surface = 'water';
    } else if (
      (x >= 50 && x <= 360 && z >= 24 && z <= 270) ||
      (x >= 145 && x <= 310 && z >= 300 && z <= 440) || // Siheyuan & Academy stone court
      (x >= 365 && x <= 430 && z >= 385 && z <= 450) || // Tianyun Daoist temple terrace
      (x >= 410 && x <= 470 && z >= 280 && z <= 355) || // Great Wall beacon platform
      (x >= 280 && x <= 440 && z >= 90 && z <= 250) ||  // Genyue Royal Garden paved paths
      (x >= 320 && x <= 660 && z >= 460 && z <= 720)    // Northern Fortress & Great Wall crest
    ) {
      surface = 'stone';
    } else if (height > 10.0 || normal.y < 0.72) {
      // Steep karst mountain rock face
      surface = 'stone';
    } else if (x >= -140 && x <= 45 && z >= 40 && z <= 260) {
      // Farmland & Countryside fertile soil & paddy banks
      surface = 'earth';
    } else if (z >= 270 && x <= 140) {
      surface = 'grass';
    } else if (z < -18 && x >= -60 && x <= 20) {
      // Dhaka brick/stone embankment
      surface = 'stone';
    } else if (waterDepth > 0 || Math.abs(height - this.WATER_LEVEL) < 0.5) {
      surface = 'earth'; // shoreline damp earth
    }

    return {
      height,
      normal,
      surface,
      inWater,
      waterDepth,
      };
  }

  private createTerrainGeometry() {
    // 880m x 940m master expansive terrain grid covering all 8 interconnected districts
    const width = 880;
    const depth = 940;
    const segX = 240;
    const segZ = 240;
    const centerOffsetX = 220;
    const centerOffsetZ = 290;

    const geometry = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // Natural soil & vegetation palette colors
    const colorMainEarth = new THREE.Color('#786B50');
    const colorLightEarth = new THREE.Color('#A18B68');
    const colorDampEarth = new THREE.Color('#514B3C');
    const colorGrassLush = new THREE.Color('#556E42');
    const colorGrassMeadow = new THREE.Color('#6E8A4E');
    const colorSlateStone = new THREE.Color('#6E726F');
    const colorDarkKarst = new THREE.Color('#4D504E');
    const colorRiverSilt = new THREE.Color('#464032');

    const tempColor = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const worldX = pos.getX(i) + centerOffsetX;
      const worldZ = pos.getZ(i) + centerOffsetZ;
      const y = this.getElevationAt(worldX, worldZ);
      pos.setY(i, y);

      // Vertex color blending based on elevation, moisture, and slope
      const waterDist = y - this.WATER_LEVEL;

      if (
        (worldX >= 50 && worldX <= 360 && worldZ >= 24 && worldZ <= 270) ||
        (worldX >= 145 && worldX <= 310 && worldZ >= 300 && worldZ <= 440) ||
        (worldX >= 365 && worldX <= 430 && worldZ >= 385 && worldZ <= 450) ||
        (worldX >= 410 && worldX <= 470 && worldZ >= 280 && worldZ <= 355) ||
        (worldX >= 280 && worldX <= 440 && worldZ >= 90 && worldZ <= 250) ||
        (worldX >= 320 && worldX <= 660 && worldZ >= 460 && worldZ <= 720)
      ) {
        // Ancient city paved stone base & imperial garden pathways
        tempColor.copy(colorSlateStone);
      } else if (worldX >= -140 && worldX <= 45 && worldZ >= 40 && worldZ <= 260) {
        // District 6: Farmland agricultural loam & lush paddy meadow
        const farmNoise = (Math.sin(worldX * 0.15) + Math.cos(worldZ * 0.15)) * 0.5 + 0.5;
        tempColor.copy(colorMainEarth).lerp(colorGrassLush, farmNoise * 0.7);
      } else if (worldX >= -50 && worldX <= 140 && worldZ >= 490 && worldZ <= 680) {
        // District 8: Heavenly Lake alpine gorge & pine moss
        const gorgeNoise = Math.sin(worldX * 0.1) * Math.cos(worldZ * 0.1) * 0.5 + 0.5;
        tempColor.copy(colorSlateStone).lerp(colorGrassMeadow, gorgeNoise * 0.6);
      } else if (y > 16.0) {
        // High Karst Peaks & Great Wall Ridges: weathered dark karst limestone with mist alpine moss
        const rockNoise = Math.sin(worldX * 0.15) * Math.cos(worldZ * 0.15);
        tempColor.copy(colorDarkKarst).lerp(colorSlateStone, rockNoise * 0.5 + 0.5);
      } else if (y > 7.0 && worldX >= 310) {
        // Mountain terrace and lower cliffs
        tempColor.copy(colorSlateStone).lerp(colorGrassLush, 0.35);
      } else if (waterDist < -1.0) {
        // Deep river bed silt
        tempColor.copy(colorRiverSilt);
      } else if (waterDist < 0.3) {
        // Damp shoreline earth (#514B3C)
        tempColor.copy(colorDampEarth).lerp(colorMainEarth, (waterDist + 1.0) / 1.3);
      } else if (waterDist < 1.8) {
        // Natural earth bank (#786B50 & #A18B68) with sparse moss
        const earthMix = (waterDist - 0.3) / 1.5;
        tempColor.copy(colorMainEarth).lerp(colorLightEarth, earthMix);
      } else {
        // High banks & valleys: verdant grass with meadow variation
        const meadowNoise = (Math.sin(worldX * 0.2) + Math.cos(worldZ * 0.2)) * 0.5 + 0.5;
        tempColor.copy(colorGrassLush).lerp(colorGrassMeadow, meadowNoise);
      }

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const earthTexture = textureFactory.getNaturalEarthTexture();
    earthTexture.repeat.set(48, 44);

    const terrainMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.05,
      flatShading: false,
    });

    this.terrainMesh = new THREE.Mesh(geometry, terrainMat);
    this.terrainMesh.position.set(centerOffsetX, 0, centerOffsetZ);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = false;
    this.group.add(this.terrainMesh);
  }

  /**
   * Adds organic riverbank features:
   * Retains select historic stone ghats near the city while replacing artificial walls
   * with natural stone clusters, soil bluffs, and terraced grass shelves.
   */
  private createOrganicRiverbankBorders() {
    // 1. Preserved Traditional Dhaka Stone Ghat steps (X: -25 to -10, Z: -15 to -11)
    const ghatGroup = new THREE.Group();
    const brickTex = textureFactory.getDhakaTerracottaBrickTexture();
    brickTex.repeat.set(4, 1);
    const ghatMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.75,
      metalness: 0.1,
    });

    // Tiered heritage steps descending gracefully into the river
    const stepWidth = 14;
    const stepCount = 5;
    for (let s = 0; s < stepCount; s++) {
      const stepGeom = new THREE.BoxGeometry(stepWidth, 0.45, 1.2);
      const stepMesh = new THREE.Mesh(stepGeom, ghatMat);
      stepMesh.position.set(-18, 2.2 - s * 0.45, -13.5 + s * 0.9);
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      ghatGroup.add(stepMesh);
    }

    // Ghat side balustrade pillars
    const pillarGeom = new THREE.BoxGeometry(0.8, 1.6, 0.8);
    [-25.2, -10.8].forEach((px) => {
      const pillar = new THREE.Mesh(pillarGeom, ghatMat);
      pillar.position.set(px, 2.8, -13.5);
      pillar.castShadow = true;
      ghatGroup.add(pillar);
    });

    this.group.add(ghatGroup);

    // 2. Natural rock slope reinforcements along the new eastern riverbend (Where Winds Meet style)
    const slateTex = textureFactory.getSlateRockTexture();
    slateTex.repeat.set(2, 2);
    const rockMat = new THREE.MeshStandardMaterial({
      map: slateTex,
      roughness: 0.82,
      metalness: 0.08,
    });

    // Procedural layered slate stone steps along the natural shoreline
    for (let r = 0; r < 28; r++) {
      const rx = 15 + r * 4.5 + (Math.sin(r * 2) * 2.5);
      const rz = -14 + Math.sin(r * 0.4) * 3.5;
      const ry = this.getElevationAt(rx, rz);

      const slateGeom = new THREE.BoxGeometry(
        2.5 + Math.random() * 2.0,
        0.5 + Math.random() * 0.6,
        1.8 + Math.random() * 1.5
      );
      slateGeom.rotateY(Math.random() * Math.PI);
      slateGeom.rotateZ((Math.random() - 0.5) * 0.15);

      const slateMesh = new THREE.Mesh(slateGeom, rockMat);
      slateMesh.position.set(rx, ry + 0.1, rz);
      slateMesh.castShadow = true;
      slateMesh.receiveShadow = true;
      this.naturalEmbankmentGroup.add(slateMesh);
    }

    this.group.add(this.naturalEmbankmentGroup);
  }
}
