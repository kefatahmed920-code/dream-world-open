/**
 * DREAM WORLD — KAIFENG: THE GRAND DYNASTY
 * PART 2 OF 3 — COMPLETE ARCHITECTURE, COLORS, RIVERS, MOUNTAINS AND VISUAL REFERENCES
 *
 * Implements:
 *  - 1. Complete Chinese Architecture (1-story, 2-story, courtyard houses, commercial shops, imperial halls, temples)
 *  - 2. Real 3D Accessible House Construction (Double walls with thickness, interior rooms, stairs, furniture, lighting, balconies)
 *  - 3. Traditional Chinese Roofs (Dark grey glazed tiles, imperial yellow tiles, curved eaves, Chiwen dragon ridges, dougong brackets)
 *  - 4. Grand Riverfront & Plaza (Wide paved plaza, willow trees, stone seating, wharfs, Grand Imperial Dragon Pleasure Barge & sampans)
 *  - 5. Ancient Water Town Canals (Arched stone bridges, water gates with iron grates, water stairs, covered corridor bridges)
 *  - 6. Mountain Environment & High Cloud Summit Temple (Wuyun Temple, incense burner tripod, shrine hall, bell pavilion, cliff overlook)
 *  - 7. Heavenly Waterfall Valley (Cascading spray pools, misty foam basin, gorge suspension bridge, Lakeside Moon Pavilion)
 *  - 8. Major Landmarks:
 *       1. The Thousand Bell Tower (4-tier pagoda, Great Peace Bronze Bell, 16 corner bells, 2nd-floor viewing balcony)
 *       2. The Imperial Grand Bridge (120m 3-arch stone bridge, 32 carved stone lions, bridgehead pavilions)
 *       3. The Royal Palace (Taihe Hall, Danbi marble terrace, Dragon Throne dais, dragon screen, incense burners, red carpet)
 *       4. Heavenly Waterfall (20m alpine waterfall tumbling into Tianchi lake)
 *       5. The Golden River Market (Songhe Tea House, Drunken Immortal Tavern, Yunjin Silk Shop, dumpling steamer stalls)
 *  - 9. Northern Fortress Bastion Interior (Eagle Summit guardroom, weapons rack, soldier bunks, glowing fire brazier)
 *  - 10. Complete Color Bible integration (#E6E0D2, #494943, #80583D, #A64D38, #533B2D, #9A704D, #77756D, etc.)
 *
 * 100% procedural Three.js PBR materials, instanced geometries, and zero external 404 dependencies.
 */

import * as THREE from 'three';
import { textureFactory } from './textures';
import { KaifengCollider } from './kaifengGrandDynasty';
import { soundEngine } from './audio';

export interface InteractiveDoor {
  id: string;
  name: string;
  position: THREE.Vector3;
  pivot: THREE.Group;
  doorLeaf: THREE.Mesh;
  isOpen: boolean;
  currentAngle: number;
  openAngle: number;
  closedAngle: number;
  triggerRadius: number;
  doorCollider?: KaifengCollider;
}

// Song Dynasty Visual Color Bible Constants
const COLOR_BIBLE = {
  // Architecture
  WALL_WHITE: 0xE6E0D2,
  ROOF_CHARCOAL: 0x494943,
  AGED_WOOD: 0x80583D,
  VERMILION: 0xA64D38,
  DARK_WOOD: 0x533B2D,
  WARM_INTERIOR_WOOD: 0x9A704D,
  ROOF_HIGHLIGHT: 0x77756D,
  IMPERIAL_YELLOW: 0xD4A017,

  // Roads
  MAIN_STONE: 0x77766D,
  SIDEWALK: 0xA29C8D,
  OLD_STONE_LANE: 0x756C5C,
  NATURAL_SOIL: 0x806B51,
  PAVING_HIGHLIGHT: 0xB2A995,

  // Water
  DEEP_RIVER: 0x245C62,
  SHALLOW_WATER: 0x559C98,
  LAKE_WATER: 0x315F68,

  // Nature
  FOREST: 0x315C40,
  GRASS: 0x66804E,
  BAMBOO: 0x739C83,
  MOSS: 0x566F4A,
  LOTUS: 0x477A4A,
  FLOWERS: 0xD88B9A,

  // Stone
  NATURAL_STONE: 0x85847B,
  SANDSTONE: 0xB7A98E,
  DARK_CLIFF: 0x69665E,
  OLD_BRIDGE_STONE: 0x898579,
  FORTRESS_MASONRY: 0x827D70,
  HAN_WHITE_MARBLE: 0xEAE7DF,
};

export class KaifengArchitectureManager {
  public group: THREE.Group = new THREE.Group();
  public colliders: KaifengCollider[] = [];
  public doors: InteractiveDoor[] = [];

  // Spatial Grid Partitioning for mobile O(1) collision queries
  private spatialGrid: Map<string, KaifengCollider[]> = new Map();
  private readonly GRID_CELL_SIZE = 40;

  // Animated elements
  private cornerBells: THREE.Mesh[] = [];
  private animatedLanterns: THREE.Group[] = [];
  private steamingPuffs: THREE.Mesh[] = [];
  private dragonBargeGroup: THREE.Group | null = null;
  private brazierLights: THREE.PointLight[] = [];

  // Materials Cache
  private matPlaster!: THREE.MeshStandardMaterial;
  private matCharcoalRoof!: THREE.MeshStandardMaterial;
  private matYellowRoof!: THREE.MeshStandardMaterial;
  private matAgedWood!: THREE.MeshStandardMaterial;
  private matDarkWood!: THREE.MeshStandardMaterial;
  private matWarmInteriorWood!: THREE.MeshStandardMaterial;
  private matVermilionPillar!: THREE.MeshStandardMaterial;
  private matLattice!: THREE.MeshStandardMaterial;
  private matMarbleRelief!: THREE.MeshStandardMaterial;
  private matBridgeStone!: THREE.MeshStandardMaterial;
  private matFortressStone!: THREE.MeshStandardMaterial;
  private matGoldFoil!: THREE.MeshStandardMaterial;
  private matBronze!: THREE.MeshStandardMaterial;
  private matSilkDamask!: THREE.MeshStandardMaterial;

  constructor() {
    this.initMaterials();

    // 1. Five Major Landmarks
    this.buildLandmark1_ThousandBellTower();
    this.buildLandmark2_ImperialGrandBridge();
    this.buildLandmark3_RoyalPalaceComplex();
    this.buildLandmark4_HeavenlyWaterfallEnhancements();
    this.buildLandmark5_GoldenRiverMarket();

    // 2. Real 3D Accessible Residential Houses
    this.buildAccessibleSiheyuanResidence();
    this.buildAccessibleCanalWaterTownHouse();

    // 3. Grand Riverfront Plaza & Traditional Boats
    this.buildGrandRiverfrontPlaza();
    this.buildImperialDragonPleasureBarge();

    // 4. Ancient Water Town Canals & Bridges
    this.buildWaterTownCanalsAndCoveredBridge();

    // 5. Mountain Environment & High Cloud Summit Temple
    this.buildCloudSummitTemple();

    // 6. Northern Fortress Bastion Interior
    this.buildEagleSummitBastionInterior();

    // 7. Interactive 3D Doors & Spatial Partitioning (Part 3)
    this.buildInteractiveDoors();
    this.buildSpatialGrid();
  }

  private initMaterials() {
    this.matPlaster = new THREE.MeshStandardMaterial({
      map: textureFactory.getWhitePlasterWallTexture(),
      color: COLOR_BIBLE.WALL_WHITE,
      roughness: 0.85,
    });

    this.matCharcoalRoof = new THREE.MeshStandardMaterial({
      map: textureFactory.getDarkGreyGlazedTileTexture(),
      color: COLOR_BIBLE.ROOF_CHARCOAL,
      roughness: 0.6,
      metalness: 0.1,
    });

    this.matYellowRoof = new THREE.MeshStandardMaterial({
      map: textureFactory.getImperialYellowRoofTileTexture(),
      color: COLOR_BIBLE.IMPERIAL_YELLOW,
      roughness: 0.45,
      metalness: 0.25,
    });

    this.matAgedWood = new THREE.MeshStandardMaterial({
      map: textureFactory.getAgedWoodTexture(),
      color: COLOR_BIBLE.AGED_WOOD,
      roughness: 0.8,
    });

    this.matDarkWood = new THREE.MeshStandardMaterial({
      map: textureFactory.getAgedWoodTexture(),
      color: COLOR_BIBLE.DARK_WOOD,
      roughness: 0.85,
    });

    this.matWarmInteriorWood = new THREE.MeshStandardMaterial({
      map: textureFactory.getAgedWoodTexture(),
      color: COLOR_BIBLE.WARM_INTERIOR_WOOD,
      roughness: 0.75,
    });

    this.matVermilionPillar = new THREE.MeshStandardMaterial({
      map: textureFactory.getChineseLacqueredRedTexture(),
      color: COLOR_BIBLE.VERMILION,
      roughness: 0.5,
      metalness: 0.15,
    });

    this.matLattice = new THREE.MeshStandardMaterial({
      map: textureFactory.getCarvedLatticeTexture(),
      color: COLOR_BIBLE.DARK_WOOD,
      roughness: 0.7,
      transparent: true,
      opacity: 0.95,
    });

    this.matMarbleRelief = new THREE.MeshStandardMaterial({
      map: textureFactory.getCarvedStoneReliefTexture(),
      color: COLOR_BIBLE.HAN_WHITE_MARBLE,
      roughness: 0.7,
    });

    this.matBridgeStone = new THREE.MeshStandardMaterial({
      map: textureFactory.getGreatWallStoneTexture(),
      color: COLOR_BIBLE.OLD_BRIDGE_STONE,
      roughness: 0.88,
    });

    this.matFortressStone = new THREE.MeshStandardMaterial({
      map: textureFactory.getGreatWallStoneTexture(),
      color: COLOR_BIBLE.FORTRESS_MASONRY,
      roughness: 0.9,
    });

    this.matGoldFoil = new THREE.MeshStandardMaterial({
      color: 0xE8B84B,
      roughness: 0.35,
      metalness: 0.85,
    });

    this.matBronze = new THREE.MeshStandardMaterial({
      color: 0x6E583C,
      roughness: 0.55,
      metalness: 0.7,
    });

    this.matSilkDamask = new THREE.MeshStandardMaterial({
      map: textureFactory.getChineseSilkBannerTexture(),
      roughness: 0.65,
    });
  }

  // =========================================================================
  // 1. LANDMARK 1 — THE THOUSAND BELL TOWER (千铃楼)
  // X: 225, Z: 140 (Elevated terrace overlooking river & city)
  // 4-tier grand pagoda, Great Peace Bronze Bell, 16 corner bells, 2nd floor balcony
  // =========================================================================
  private buildLandmark1_ThousandBellTower() {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(225, 4.35, 140);

    // Stone base platform (22m x 22m, height 1.8m)
    const basePlat = new THREE.Mesh(new THREE.BoxGeometry(22, 1.8, 22), this.matBridgeStone);
    basePlat.position.y = 0.9;
    basePlat.castShadow = true;
    basePlat.receiveShadow = true;
    towerGroup.add(basePlat);

    // 4 Access Staircases to platform
    for (const rot of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const stair = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.45, 3.5), this.matBridgeStone);
      const dist = 12.2;
      stair.position.set(Math.sin(rot) * dist, 0.45, Math.cos(rot) * dist);
      stair.rotation.y = rot;
      towerGroup.add(stair);
    }

    // Platform balustrades
    const railMat = this.matMarbleRelief;
    const railPerimeter = [
      { x: 0, z: 10.7, w: 21.4, h: 0.9, d: 0.3 },
      { x: 0, z: -10.7, w: 21.4, h: 0.9, d: 0.3 },
      { x: 10.7, z: 0, w: 0.3, h: 0.9, d: 21.4 },
      { x: -10.7, z: 0, w: 0.3, h: 0.9, d: 21.4 },
    ];
    railPerimeter.forEach((r) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(r.w, r.h, r.d), railMat);
      rail.position.set(r.x, 2.25, r.z);
      towerGroup.add(rail);
    });

    // LEVEL 1: Main Bell Chamber (15m x 15m, height 6.0m)
    // 4 Corner vermilion columns
    const colGeo = new THREE.CylinderGeometry(0.45, 0.48, 6.0, 16);
    for (const cx of [-6.5, 6.5]) {
      for (const cz of [-6.5, 6.5]) {
        const col = new THREE.Mesh(colGeo, this.matVermilionPillar);
        col.position.set(cx, 4.8, cz);
        col.castShadow = true;
        towerGroup.add(col);
      }
    }

    // Outer lattice screen walls with 4 wide open portals
    const wallThick = 0.35;
    // South Wall with central doorway opening
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(4.8, 5.8, wallThick), this.matPlaster);
    wallL.position.set(-4.5, 4.7, 7.0);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(4.8, 5.8, wallThick), this.matPlaster);
    wallR.position.set(4.5, 4.7, 7.0);
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.4, wallThick), this.matPlaster);
    lintel.position.set(0, 6.9, 7.0);
    towerGroup.add(wallL, wallR, lintel);

    // North, East, West Walls
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(14, 5.8, wallThick), this.matPlaster);
    wallN.position.set(0, 4.7, -7.0);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, 5.8, 14), this.matPlaster);
    wallE.position.set(7.0, 4.7, 0);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, 5.8, 14), this.matPlaster);
    wallW.position.set(-7.0, 4.7, 0);
    towerGroup.add(wallN, wallE, wallW);

    // Interior Level 1 Floor
    const floorL1 = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 14), this.matWarmInteriorWood);
    floorL1.position.y = 1.85;
    towerGroup.add(floorL1);

    // THE GREAT PEACE BRONZE BELL (太和巨钟)
    const bellTrestle = new THREE.Group();
    bellTrestle.position.set(0, 1.8, 0);
    // Heavy timber trestle posts
    for (const tx of [-2.4, 2.4]) {
      const tPost = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.8, 0.5), this.matDarkWood);
      tPost.position.set(tx, 2.4, 0);
      bellTrestle.add(tPost);
    }
    const tCrossbeam = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.6, 0.6), this.matDarkWood);
    tCrossbeam.position.set(0, 4.6, 0);
    bellTrestle.add(tCrossbeam);

    // Hanging Bronze Bell
    const bellMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.6, 2.8, 20, 1, true),
      this.matBronze
    );
    bellMesh.position.set(0, 2.6, 0);
    bellMesh.castShadow = true;
    const bellTop = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.matBronze);
    bellTop.position.set(0, 4.0, 0);
    bellTrestle.add(bellMesh, bellTop);

    // Wooden Bell Striking Ram (suspended horizontally by ropes)
    const ram = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.8, 12), this.matAgedWood);
    ram.rotation.z = Math.PI / 2;
    ram.position.set(1.4, 2.4, 0.8);
    bellTrestle.add(ram);
    towerGroup.add(bellTrestle);

    // Interior Wooden Staircase leading to Level 2
    const stairSteps = 14;
    for (let s = 0; s < stairSteps; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.42, 0.45), this.matWarmInteriorWood);
      step.position.set(5.2, 1.9 + s * 0.42, -5.5 + s * 0.45);
      towerGroup.add(step);
    }

    // LEVEL 2: Walkable Observation Balcony at Y = 7.8m (12m x 12m)
    const floorL2 = new THREE.Mesh(new THREE.BoxGeometry(12, 0.35, 12), this.matWarmInteriorWood);
    floorL2.position.y = 7.8;
    floorL2.receiveShadow = true;
    towerGroup.add(floorL2);

    // Level 2 Wooden Balcony Railing
    const balGeo = new THREE.BoxGeometry(11.8, 0.95, 0.18);
    for (const bz of [-5.9, 5.9]) {
      const r = new THREE.Mesh(balGeo, this.matLattice);
      r.position.set(0, 8.4, bz);
      towerGroup.add(r);
    }
    const balGeoSide = new THREE.BoxGeometry(0.18, 0.95, 11.8);
    for (const bx of [-5.9, 5.9]) {
      const r = new THREE.Mesh(balGeoSide, this.matLattice);
      r.position.set(bx, 8.4, 0);
      towerGroup.add(r);
    }

    // Level 2 Wall Core (8m x 8m, height 5.0m)
    const coreL2 = new THREE.Mesh(new THREE.BoxGeometry(8, 5.0, 8), this.matPlaster);
    coreL2.position.y = 10.3;
    towerGroup.add(coreL2);

    // Tier 1 Roof Eaves (flared hip roof at Y = 7.8m)
    const roof1 = new THREE.Mesh(new THREE.ConeGeometry(12.5, 2.8, 4), this.matCharcoalRoof);
    roof1.position.y = 8.8;
    roof1.rotation.y = Math.PI / 4;
    roof1.castShadow = true;
    towerGroup.add(roof1);

    // Tier 2 Roof Eaves (flared hip roof at Y = 13.0m)
    const roof2 = new THREE.Mesh(new THREE.ConeGeometry(9.8, 2.5, 4), this.matCharcoalRoof);
    roof2.position.y = 13.8;
    roof2.rotation.y = Math.PI / 4;
    roof2.castShadow = true;
    towerGroup.add(roof2);

    // Level 3 Tower Body (6m x 6m, height 4.5m)
    const coreL3 = new THREE.Mesh(new THREE.BoxGeometry(6, 4.5, 6), this.matPlaster);
    coreL3.position.y = 16.5;
    towerGroup.add(coreL3);

    // Tier 3 Roof Eaves (Y = 19.0m)
    const roof3 = new THREE.Mesh(new THREE.ConeGeometry(7.6, 2.2, 4), this.matCharcoalRoof);
    roof3.position.y = 19.8;
    roof3.rotation.y = Math.PI / 4;
    roof3.castShadow = true;
    towerGroup.add(roof3);

    // Level 4 Crown Spire & Pavilion (Y = 22m..28m)
    const crownPavilion = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 4.2), this.matPlaster);
    crownPavilion.position.y = 22.8;
    const roof4 = new THREE.Mesh(new THREE.ConeGeometry(5.4, 3.2, 4), this.matCharcoalRoof);
    roof4.position.y = 25.8;
    roof4.rotation.y = Math.PI / 4;
    roof4.castShadow = true;
    towerGroup.add(crownPavilion, roof4);

    // Golden Spire Finial (Baoding / 宝顶)
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.35, 3.2, 8), this.matGoldFoil);
    spire.position.y = 28.5;
    const spireBall = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 12), this.matGoldFoil);
    spireBall.position.y = 27.8;
    towerGroup.add(spire, spireBall);

    // 16 Cast Bronze Corner Bells (Fengling / 风铃) hanging from the 4 tiers of flared eaves
    const bellTiers = [
      { y: 8.4, radius: 8.8 },
      { y: 13.4, radius: 6.8 },
      { y: 19.4, radius: 5.2 },
      { y: 25.2, radius: 3.8 },
    ];
    bellTiers.forEach((tier) => {
      for (const ang of [Math.PI / 4, 3 * Math.PI / 4, 5 * Math.PI / 4, 7 * Math.PI / 4]) {
        const bx = Math.cos(ang) * tier.radius;
        const bz = Math.sin(ang) * tier.radius;
        const cornerBell = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.35, 8), this.matBronze);
        cornerBell.position.set(bx, tier.y, bz);
        towerGroup.add(cornerBell);
        this.cornerBells.push(cornerBell);
      }
    });

    // Warm Interior Lantern Lighting
    const lanternLight = new THREE.PointLight(0xFFA540, 1.8, 18);
    lanternLight.position.set(0, 5.2, 0);
    towerGroup.add(lanternLight);

    // Colliders
    this.colliders.push(
      // Stone base platform (Walkable)
      { minX: 225 - 11, maxX: 225 + 11, minZ: 140 - 11, maxZ: 140 + 11, height: 4.35 + 1.8, surface: 'stone' },
      // Level 2 Walkable observation balcony
      { minX: 225 - 6, maxX: 225 + 6, minZ: 140 - 6, maxZ: 140 + 6, height: 4.35 + 7.8, surface: 'wood' },
      // Solid outer walls Level 1 (with south door gap at X: 223..227)
      { minX: 225 - 7.2, maxX: 225 - 2.5, minZ: 140 + 6.8, maxZ: 140 + 7.3, height: 4.35 + 6.5, surface: 'stone', isSolidWall: true },
      { minX: 225 + 2.5, maxX: 225 + 7.2, minZ: 140 + 6.8, maxZ: 140 + 7.3, height: 4.35 + 6.5, surface: 'stone', isSolidWall: true },
      { minX: 225 - 7.2, maxX: 225 + 7.2, minZ: 140 - 7.3, maxZ: 140 - 6.8, height: 4.35 + 6.5, surface: 'stone', isSolidWall: true },
      { minX: 225 + 6.8, maxX: 225 + 7.3, minZ: 140 - 7.2, maxZ: 140 + 7.2, height: 4.35 + 6.5, surface: 'stone', isSolidWall: true },
      { minX: 225 - 7.3, maxX: 225 - 6.8, minZ: 140 - 7.2, maxZ: 140 + 7.2, height: 4.35 + 6.5, surface: 'stone', isSolidWall: true }
    );

    this.group.add(towerGroup);
  }

  // =========================================================================
  // 2. LANDMARK 2 — THE IMPERIAL GRAND BRIDGE (皇河大桥)
  // Spanning across Grand River: X: 65, Z: -45 to +55 (100m span, 3 stone arches)
  // 32 carved Han white marble stone lions, bridgehead imperial pavilions
  // =========================================================================
  private buildLandmark2_ImperialGrandBridge() {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(65, 0, 5);

    const length = 100;
    const width = 9.5;

    // 3 Monumental Segmental Stone Arches & Piers
    const pierZPositions = [-25, 0, 25];
    pierZPositions.forEach((pz) => {
      // Masonry Pier with pointed waterbreaker cutwaters (Fenshuijiao)
      const pier = new THREE.Mesh(new THREE.BoxGeometry(width + 1.8, 4.2, 5.5), this.matBridgeStone);
      pier.position.set(0, 1.8, pz);
      pier.castShadow = true;
      bridgeGroup.add(pier);

      // Upstream / Downstream triangular cutwaters
      for (const side of [-1, 1]) {
        const cutwater = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.2, 3), this.matBridgeStone);
        cutwater.position.set(side * (width * 0.5 + 1.2), 1.8, pz);
        cutwater.rotation.z = side * Math.PI / 2;
        cutwater.castShadow = true;
        bridgeGroup.add(cutwater);
      }
    });

    // Curved Stone Arch Barrel vaults (underneath deck)
    const archSpans = [-37.5, -12.5, 12.5, 37.5];
    archSpans.forEach((az) => {
      const arch = new THREE.Mesh(
        new THREE.CylinderGeometry(8.5, 8.5, width + 0.6, 24, 1, false, 0, Math.PI),
        this.matBridgeStone
      );
      arch.position.set(0, -3.8, az);
      arch.rotation.z = Math.PI / 2;
      bridgeGroup.add(arch);
    });

    // Walkable Granite Road Deck (slight crown rise at center Z: 0, Y: 4.8m)
    const segCount = 20;
    for (let i = 0; i < segCount; i++) {
      const t = i / (segCount - 1); // 0 to 1
      const z = -50 + t * 100;
      // Parabolic crown arch curve: center is higher by 1.6m
      const curveY = 3.4 + Math.sin(t * Math.PI) * 1.5;

      const seg = new THREE.Mesh(new THREE.BoxGeometry(width, 0.45, 5.2), this.matBridgeStone);
      seg.position.set(0, curveY, z);
      seg.receiveShadow = true;
      bridgeGroup.add(seg);
    }

    // Carved Han White Marble Balustrades & 32 Sculpted Stone Lions
    const lionGeo = new THREE.BoxGeometry(0.38, 0.55, 0.38);
    const postGeo = new THREE.BoxGeometry(0.35, 1.05, 0.35);

    for (const side of [-1, 1]) {
      const x = side * (width * 0.5 - 0.25);
      // Continuous stone handrail
      for (let i = 0; i < segCount; i++) {
        const t = i / (segCount - 1);
        const z = -50 + t * 100;
        const curveY = 3.4 + Math.sin(t * Math.PI) * 1.5;

        // Balustrade slab
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.9, 5.0), this.matMarbleRelief);
        rail.position.set(x, curveY + 0.55, z);
        bridgeGroup.add(rail);

        // Stone post with carved lion finial every 6 meters
        if (i % 2 === 0) {
          const post = new THREE.Mesh(postGeo, this.matMarbleRelief);
          post.position.set(x, curveY + 0.6, z);
          const lion = new THREE.Mesh(lionGeo, this.matMarbleRelief);
          lion.position.set(x, curveY + 1.35, z);
          lion.castShadow = true;
          bridgeGroup.add(post, lion);
        }
      }
    }

    // Two Bridgehead Ceremonial Pavilions (North and South Riverbanks)
    for (const bz of [-52, 52]) {
      const pav = new THREE.Group();
      pav.position.set(0, 3.4, bz);

      // 4 Vermilion corner pillars
      for (const px of [-3.8, 3.8]) {
        for (const pz2 of [-2.4, 2.4]) {
          const p = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 3.8), this.matVermilionPillar);
          p.position.set(px, 1.9, pz2);
          pav.add(p);
        }
      }

      // Yellow glazed flared hip roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 2.2, 4), this.matYellowRoof);
      roof.position.y = 4.6;
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.4, 1.0, 0.9);
      roof.castShadow = true;
      pav.add(roof);

      // Stone Stele of Imperial Decree inside pavilion
      const stele = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.35), this.matMarbleRelief);
      stele.position.set(0, 1.2, 0);
      pav.add(stele);

      bridgeGroup.add(pav);
    }

    // Bridge Walkable Colliders
    for (let i = 0; i < segCount; i++) {
      const t = i / (segCount - 1);
      const z = -50 + t * 100;
      const curveY = 3.4 + Math.sin(t * Math.PI) * 1.5;
      this.colliders.push({
        minX: 65 - width * 0.5,
        maxX: 65 + width * 0.5,
        minZ: 5 + z - 2.6,
        maxZ: 5 + z + 2.6,
        height: curveY,
        surface: 'stone',
      });
    }

    this.group.add(bridgeGroup);
  }

  // =========================================================================
  // 3. LANDMARK 3 — THE ROYAL PALACE COMPLEX (大内皇宫 / 泰和殿)
  // X: 200, Z: 310
  // Double-tier Danbi marble terrace, 18 vermilion columns, Imperial Yellow roof,
  // COMPLETE 3D INTERIOR: Dragon throne dais, 9-panel screen, bronze crane incense burners, red carpet
  // =========================================================================
  private buildLandmark3_RoyalPalaceComplex() {
    const palaceGroup = new THREE.Group();
    palaceGroup.position.set(200, 4.35, 310);

    // A. Outer Imperial Courtyard Stone Plaza (55m x 45m)
    const courtPlaza = new THREE.Mesh(new THREE.BoxGeometry(55, 0.3, 45), this.matBridgeStone);
    courtPlaza.position.set(0, 0.15, 5);
    courtPlaza.receiveShadow = true;
    palaceGroup.add(courtPlaza);

    // Courtyard Enclosure Walls with vermilion wash and grey tile coping
    const wallHeight = 4.2;
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallHeight, 45), this.matPlaster);
    eastWall.position.set(27.5, wallHeight * 0.5, 5);
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, wallHeight, 45), this.matPlaster);
    westWall.position.set(-27.5, wallHeight * 0.5, 5);
    palaceGroup.add(eastWall, westWall);

    // B. Elevated Han White Marble Double Terrace (Danbi / 丹陛)
    // Tier 1 Terrace (38m x 28m, height 1.6m)
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(38, 1.6, 28), this.matMarbleRelief);
    tier1.position.set(0, 0.8, -4);
    tier1.receiveShadow = true;
    tier1.castShadow = true;
    palaceGroup.add(tier1);

    // Tier 2 Upper Terrace (34m x 24m, height 1.6m) - Palace hall sits on top at Y = 2.8m
    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(34, 1.2, 24), this.matMarbleRelief);
    tier2.position.set(0, 2.2, -4);
    tier2.receiveShadow = true;
    palaceGroup.add(tier2);

    // Central Imperial Dragon Stone Ramp (Jiulong Danbi / 九龙丹陛)
    const dragonRamp = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 8.5), this.matMarbleRelief);
    dragonRamp.position.set(0, 1.4, 12.5);
    dragonRamp.rotation.x = -0.28;
    palaceGroup.add(dragonRamp);

    // Twin Imperial Flanking Stairs
    for (const sx of [-3.8, 3.8]) {
      const stair = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.28, 8.5), this.matMarbleRelief);
      stair.position.set(sx, 1.4, 12.5);
      stair.rotation.x = -0.28;
      palaceGroup.add(stair);
    }

    // Terrace Marble Balustrades with Dragon Cloud Posts
    const balPlat = [
      { x: 0, z: 9.8, w: 33.6, d: 0.3 },
      { x: 0, z: -17.8, w: 33.6, d: 0.3 },
      { x: 16.8, z: -4, w: 0.3, d: 27.6 },
      { x: -16.8, z: -4, w: 0.3, d: 27.6 },
    ];
    balPlat.forEach((bp) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bp.w, 0.95, bp.d), this.matMarbleRelief);
      b.position.set(bp.x, 3.25, bp.z);
      palaceGroup.add(b);
    });

    // C. TAIHE PALACE HALL (Main Palace Hall) - Sits on upper terrace at Y = 2.8m
    // Exterior dimensions: 28m wide x 18m deep x 12m high
    const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(28, 0.25, 18), this.matWarmInteriorWood);
    hallFloor.position.set(0, 2.9, -4);
    palaceGroup.add(hallFloor);

    // 18 Massive Vermilion Columns (arranged in 3 rows of 6)
    const pillarGeo = new THREE.CylinderGeometry(0.48, 0.52, 7.5, 18);
    for (const px of [-12, -7.2, -2.4, 2.4, 7.2, 12]) {
      for (const pz of [-11, -4, 3]) {
        const pillar = new THREE.Mesh(pillarGeo, this.matVermilionPillar);
        pillar.position.set(px, 6.6, pz);
        pillar.castShadow = true;
        palaceGroup.add(pillar);

        // Dougong wooden bracket set atop each column
        const dougong = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), this.matDarkWood);
        dougong.position.set(px, 10.4, pz);
        palaceGroup.add(dougong);
      }
    }

    // Double Walls (Exterior & Interior plaster with thickness)
    // Front South Wall with wide central throne entrance portal (open 5.5m wide)
    const wallSW = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.0, 0.45), this.matPlaster);
    wallSW.position.set(-8.2, 6.4, 4.0);
    const wallSE = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.0, 0.45), this.matPlaster);
    wallSE.position.set(8.2, 6.4, 4.0);
    const lintelS = new THREE.Mesh(new THREE.BoxGeometry(6.0, 1.8, 0.45), this.matPlaster);
    lintelS.position.set(0, 9.0, 4.0);
    palaceGroup.add(wallSW, wallSE, lintelS);

    // North, East, West Walls (Complete 3D enclosure)
    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(27.5, 7.0, 0.45), this.matPlaster);
    wallNorth.position.set(0, 6.4, -12.5);
    const wallEast = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.0, 17), this.matPlaster);
    wallEast.position.set(13.6, 6.4, -4.2);
    const wallWest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 7.0, 17), this.matPlaster);
    wallWest.position.set(-13.6, 6.4, -4.2);
    palaceGroup.add(wallNorth, wallEast, wallWest);

    // Monumental Double-Eaved Imperial Yellow Glazed Roof
    // Lower Eave (hip-and-gable)
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(22, 3.8, 4), this.matYellowRoof);
    lowerRoof.position.set(0, 11.5, -4);
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.scale.set(1.4, 0.9, 1.0);
    lowerRoof.castShadow = true;
    palaceGroup.add(lowerRoof);

    // Upper Grand Imperial Roof with Soaring Chiwen Dragon Ridge Ends
    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(17, 4.8, 4), this.matYellowRoof);
    upperRoof.position.set(0, 14.8, -4);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.scale.set(1.35, 1.0, 0.95);
    upperRoof.castShadow = true;
    palaceGroup.add(upperRoof);

    // Chiwen Dragon Ridge Beasts on main ridge
    for (const rx of [-9.5, 9.5]) {
      const chiwen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), this.matGoldFoil);
      chiwen.position.set(rx, 17.6, -4);
      palaceGroup.add(chiwen);
    }

    // =======================================================================
    // REAL 3D ACCESSIBLE INTERIOR FURNISHINGS:
    // =======================================================================
    // 1. Imperial Crimson Silk Carpet Runner
    const redCarpet = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.04, 15), this.matSilkDamask);
    redCarpet.position.set(0, 2.92, -4);
    palaceGroup.add(redCarpet);

    // 2. Raised Carved Gilded Dragon Throne Dais (at back of hall)
    const throneDais = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.85, 4.8), this.matWarmInteriorWood);
    throneDais.position.set(0, 3.4, -9.5);
    throneDais.castShadow = true;
    palaceGroup.add(throneDais);

    // 3. Nine-Panel Carved Gold Leaf Dragon Screen (Jiulong Pingfeng)
    const screenGeo = new THREE.BoxGeometry(7.8, 3.6, 0.25);
    const screenMesh = new THREE.Mesh(screenGeo, this.matGoldFoil);
    screenMesh.position.set(0, 5.6, -11.4);
    screenMesh.castShadow = true;
    palaceGroup.add(screenMesh);

    // 4. Imperial Golden Dragon Throne (Longyi / 龙椅)
    const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.65, 1.2), this.matGoldFoil);
    throneSeat.position.set(0, 4.15, -9.2);
    const throneBack = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.25), this.matGoldFoil);
    throneBack.position.set(0, 5.2, -9.8);
    palaceGroup.add(throneSeat, throneBack);

    // 5. Imperial Dragon Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 1.4), this.matDarkWood);
    desk.position.set(0, 4.25, -7.5);
    palaceGroup.add(desk);

    // 6. Twin Bronze Crane Incense Burners (emitting golden imperial fragrance)
    for (const cx of [-3.2, 3.2]) {
      const crane = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 2.2, 8), this.matBronze);
      crane.position.set(cx, 4.8, -9.0);
      const burnerPot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10), this.matGoldFoil);
      burnerPot.position.set(cx, 5.8, -9.0);
      palaceGroup.add(crane, burnerPot);
    }

    // 7. Warm Palace Chandelier Lantern Illumination
    const palaceLight = new THREE.PointLight(0xFFB84D, 2.2, 22);
    palaceLight.position.set(0, 7.8, -4);
    palaceGroup.add(palaceLight);

    // Colliders for Royal Palace
    this.colliders.push(
      // Marble lower terrace
      { minX: 200 - 19, maxX: 200 + 19, minZ: 310 - 18, maxZ: 310 + 10, height: 4.35 + 1.6, surface: 'stone' },
      // Marble upper terrace & interior hall floor
      { minX: 200 - 14, maxX: 200 + 14, minZ: 310 - 13, maxZ: 310 + 5, height: 4.35 + 2.8, surface: 'wood' },
      // Throne dais
      { minX: 200 - 4.5, maxX: 200 + 4.5, minZ: 310 - 12, maxZ: 310 - 7, height: 4.35 + 3.8, surface: 'wood' },
      // Central dragon ramp
      { minX: 200 - 4, maxX: 200 + 4, minZ: 310 + 8, maxZ: 310 + 17, height: 4.35 + 1.4, surface: 'stone' },
      // Solid outer walls (with 5.5m central entrance gap at X: 197..203)
      { minX: 200 - 14, maxX: 200 - 3, minZ: 310 + 3.8, maxZ: 310 + 4.5, height: 4.35 + 9.5, surface: 'stone', isSolidWall: true },
      { minX: 200 + 3, maxX: 200 + 14, minZ: 310 + 3.8, maxZ: 310 + 4.5, height: 4.35 + 9.5, surface: 'stone', isSolidWall: true },
      { minX: 200 - 14, maxX: 200 + 14, minZ: 310 - 13, maxZ: 310 - 12.2, height: 4.35 + 9.5, surface: 'stone', isSolidWall: true },
      { minX: 200 + 13.2, maxX: 200 + 14, minZ: 310 - 13, maxZ: 310 + 4.5, height: 4.35 + 9.5, surface: 'stone', isSolidWall: true },
      { minX: 200 - 14, maxX: 200 - 13.2, minZ: 310 - 13, maxZ: 310 + 4.5, height: 4.35 + 9.5, surface: 'stone', isSolidWall: true }
    );

    this.group.add(palaceGroup);
  }

  // =========================================================================
  // 4. LANDMARK 4 — HEAVENLY WATERFALL ENHANCEMENTS (天池雷神大瀑布)
  // X: 35, Z: 625 (District 8)
  // Multi-tier cascading spray pools, misty foam basin, Lakeside Moon Pavilion, gorge suspension footbridge
  // =========================================================================
  private buildLandmark4_HeavenlyWaterfallEnhancements() {
    const wfGroup = new THREE.Group();
    wfGroup.position.set(35, 8.5, 625);

    // Cascading Rock Shelves & Splash Boulders
    const boulderMat = new THREE.MeshStandardMaterial({
      map: textureFactory.getSlateRockTexture(),
      color: COLOR_BIBLE.DARK_CLIFF,
      roughness: 0.7,
    });

    const foamMat = new THREE.MeshStandardMaterial({
      map: textureFactory.getWaterFoamTexture(),
      color: 0xEEF8FA,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
    });

    // 4 Stepped Spray Boulders under the waterfall
    const rockPositions = [
      { x: -5, y: 1.2, z: -2, scale: 3.2 },
      { x: 4, y: 2.4, z: -3, scale: 2.8 },
      { x: -2, y: 4.5, z: -5, scale: 3.5 },
      { x: 3, y: 7.0, z: -7, scale: 3.0 },
    ];
    rockPositions.forEach((r) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r.scale, 1), boulderMat);
      rock.position.set(r.x, r.y, r.z);
      rock.castShadow = true;
      wfGroup.add(rock);
    });

    // Swirling Foam Mist Sheets at waterfall base
    for (let f = 0; f < 3; f++) {
      const foamRing = new THREE.Mesh(new THREE.RingGeometry(2.5 + f * 3, 4.5 + f * 3, 24), foamMat);
      foamRing.position.set(0, 0.15 + f * 0.05, 0);
      foamRing.rotation.x = -Math.PI / 2;
      wfGroup.add(foamRing);
    }

    // High Mountain Gorge Suspension Footbridge (spanning across canyon at Y = 14.5m)
    const bridgeY = 14.5;
    const gorgeBridge = new THREE.Group();
    gorgeBridge.position.set(0, bridgeY, -15);

    // Timber plank walkway (22m long x 2.4m wide)
    const bridgePlank = new THREE.Mesh(new THREE.BoxGeometry(22, 0.25, 2.4), this.matAgedWood);
    bridgePlank.receiveShadow = true;
    gorgeBridge.add(bridgePlank);

    // Heavy hemp suspension cables and timber handrails
    for (const bz of [-1.2, 1.2]) {
      const handrail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 22), this.matDarkWood);
      handrail.rotation.z = Math.PI / 2;
      handrail.position.set(0, 1.1, bz);
      gorgeBridge.add(handrail);

      for (let x = -10; x <= 10; x += 2.5) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1), this.matAgedWood);
        post.position.set(x, 0.55, bz);
        gorgeBridge.add(post);
      }
    }
    wfGroup.add(gorgeBridge);

    // Colliders for waterfall gorge footbridge
    this.colliders.push({
      minX: 35 - 11,
      maxX: 35 + 11,
      minZ: 625 - 16.5,
      maxZ: 625 - 13.5,
      height: 8.5 + bridgeY,
      surface: 'wood',
    });

    this.group.add(wfGroup);
  }

  // =========================================================================
  // 5. LANDMARK 5 — THE GOLDEN RIVER MARKET (金河水岸大市)
  // Waterfront commercial promenade along X: 95..185, Z: 65..115
  // Songhe Tea House, Drunken Immortal Tavern, Yunjin Silk Shop, dumpling steamer stalls
  // =========================================================================
  private buildLandmark5_GoldenRiverMarket() {
    const marketGroup = new THREE.Group();
    marketGroup.position.set(95, 3.8, 85);

    // Main Waterfront Flagstone Commercial Street (90m long x 8m wide)
    const street = new THREE.Mesh(new THREE.BoxGeometry(90, 0.25, 8.5), this.matBridgeStone);
    street.position.set(45, 0.12, 0);
    street.receiveShadow = true;
    marketGroup.add(street);

    // A. "SONGHE TEA HOUSE" (松鹤茶楼) - 2-story building with riverside balcony at (115, 80) -> relative (20, 0, -8)
    const teaHouse = new THREE.Group();
    teaHouse.position.set(20, 0, -8);

    // Ground Floor (10m x 8m x 4.0m)
    const teaFloor1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 8), this.matWarmInteriorWood);
    teaFloor1.position.y = 0.1;
    teaHouse.add(teaFloor1);

    // Double walls with front open shopfront
    const teaWallBack = new THREE.Mesh(new THREE.BoxGeometry(10, 4.0, 0.35), this.matPlaster);
    teaWallBack.position.set(0, 2.0, -4.0);
    const teaWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 8), this.matPlaster);
    teaWallLeft.position.set(-5.0, 2.0, 0);
    const teaWallRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 8), this.matPlaster);
    teaWallRight.position.set(5.0, 2.0, 0);
    teaHouse.add(teaWallBack, teaWallLeft, teaWallRight);

    // Open Shopfront Lintel and Vermilion Posts
    for (const px of [-4.8, 4.8]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.0), this.matVermilionPillar);
      p.position.set(px, 2.0, 4.0);
      teaHouse.add(p);
    }
    const teaLintel = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.6, 0.4), this.matDarkWood);
    teaLintel.position.set(0, 3.7, 4.0);
    teaHouse.add(teaLintel);

    // Tea Shop Tea-Bar Counter
    const teaCounter = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.0, 1.2), this.matWarmInteriorWood);
    teaCounter.position.set(-2.2, 0.5, 0);
    teaHouse.add(teaCounter);

    // Steaming Copper Tea Kettle on Brick Hearth
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.6), this.matBronze);
    kettle.position.set(-3.5, 1.3, 0);
    teaHouse.add(kettle);

    // Ground Floor Tea Tables & Stools
    for (const tz of [-1.5, 1.8]) {
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.85, 12), this.matWarmInteriorWood);
      table.position.set(2.2, 0.42, tz);
      teaHouse.add(table);

      // Stools
      for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.5, 8), this.matDarkWood);
        stool.position.set(2.2 + Math.cos(ang) * 1.3, 0.25, tz + Math.sin(ang) * 1.3);
        teaHouse.add(stool);
      }
    }

    // Interior Staircase leading to 2nd Floor
    for (let s = 0; s < 10; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.38, 0.38), this.matWarmInteriorWood);
      step.position.set(3.8, 0.2 + s * 0.38, -3.2 + s * 0.38);
      teaHouse.add(step);
    }

    // 2nd Floor Walkable Tea Balcony at Y = 3.8m
    const teaFloor2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.25, 8), this.matWarmInteriorWood);
    teaFloor2.position.y = 3.8;
    teaFloor2.receiveShadow = true;
    teaHouse.add(teaFloor2);

    // 2nd Floor Balcony Railing over Riverfront Street
    const teaRail = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.95, 0.2), this.matLattice);
    teaRail.position.set(0, 4.35, 4.0);
    teaHouse.add(teaRail);

    // 2nd Floor Riverfront Tea Seats
    const table2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.0), this.matWarmInteriorWood);
    table2.position.set(0, 4.2, 2.5);
    teaHouse.add(table2);

    // Charcoal Tiled Roof with curved eaves
    const teaRoof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 2.8, 4), this.matCharcoalRoof);
    teaRoof.position.y = 7.8;
    teaRoof.rotation.y = Math.PI / 4;
    teaRoof.scale.set(1.4, 0.85, 1.1);
    teaRoof.castShadow = true;
    teaHouse.add(teaRoof);

    marketGroup.add(teaHouse);

    // B. "DRUNKEN IMMORTAL TAVERN" (醉仙楼) - at relative (45, 0, -8)
    const tavern = new THREE.Group();
    tavern.position.set(45, 0, -8);

    // Tavern building body (11m x 8m x 4.2m)
    const tavFloor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 8), this.matWarmInteriorWood);
    tavFloor.position.y = 0.1;
    const tavWallBack = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 0.35), this.matPlaster);
    tavWallBack.position.set(0, 2.1, -4.0);
    const tavWallL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.2, 8), this.matPlaster);
    tavWallL.position.set(-5.5, 2.1, 0);
    const tavWallR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.2, 8), this.matPlaster);
    tavWallR.position.set(5.5, 2.1, 0);
    tavern.add(tavFloor, tavWallBack, tavWallL, tavWallR);

    // Front Open Tavern Entrance with Wine Banners
    for (const px of [-5.2, 5.2]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.2), this.matAgedWood);
      p.position.set(px, 2.1, 4.0);
      tavern.add(p);
    }
    const tavRoof = new THREE.Mesh(new THREE.ConeGeometry(9.0, 2.6, 4), this.matCharcoalRoof);
    tavRoof.position.y = 5.5;
    tavRoof.rotation.y = Math.PI / 4;
    tavRoof.scale.set(1.4, 0.9, 1.05);
    tavRoof.castShadow = true;
    tavern.add(tavRoof);

    // Rows of Ceramic Wine Jars with Red Cloth Covers (Jiutan / 酒坛)
    const jarMat = new THREE.MeshStandardMaterial({ color: 0x4A3225, roughness: 0.6 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xB82C1E, roughness: 0.8 });
    for (let j = 0; j < 6; j++) {
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.85, 10), jarMat);
      jar.position.set(-3.8 + j * 0.7, 0.42, -3.2);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.2, 8), clothMat);
      cap.position.set(-3.8 + j * 0.7, 0.95, -3.2);
      tavern.add(jar, cap);
    }

    // Tavern Dining Booths
    for (const tx of [1.5, -1.5]) {
      const diningTable = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.85, 1.4), this.matWarmInteriorWood);
      diningTable.position.set(tx, 0.42, 0.5);
      tavern.add(diningTable);
    }

    marketGroup.add(tavern);

    // C. "YUNJIN SILK SHOP" (云锦绸庄) - at relative (70, 0, -8)
    const silkShop = new THREE.Group();
    silkShop.position.set(70, 0, -8);

    const silkFloor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 8), this.matWarmInteriorWood);
    silkFloor.position.y = 0.1;
    const silkWallB = new THREE.Mesh(new THREE.BoxGeometry(10, 4.0, 0.35), this.matPlaster);
    silkWallB.position.set(0, 2.0, -4.0);
    const silkWallL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 8), this.matPlaster);
    silkWallL.position.set(-5.0, 2.0, 0);
    const silkWallR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 4.0, 8), this.matPlaster);
    silkWallR.position.set(5.0, 2.0, 0);
    silkShop.add(silkFloor, silkWallB, silkWallL, silkWallR);

    // Silk bolts display table (rolls of azure, scarlet, jade, and gold damask)
    const silkColors = [0x2B5B84, 0xA62B2B, 0x3E7D58, 0xD4A017];
    silkColors.forEach((col, i) => {
      const sMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55 });
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8, 12), sMat);
      roll.rotation.z = Math.PI / 2;
      roll.position.set(-2.0 + i * 1.3, 1.2, 0);
      silkShop.add(roll);
    });

    const silkRoof = new THREE.Mesh(new THREE.ConeGeometry(8.2, 2.6, 4), this.matCharcoalRoof);
    silkRoof.position.y = 5.3;
    silkRoof.rotation.y = Math.PI / 4;
    silkRoof.scale.set(1.4, 0.85, 1.1);
    silkRoof.castShadow = true;
    silkShop.add(silkRoof);

    marketGroup.add(silkShop);

    // D. RIVERSIDE STREET FOOD STEAMER STALLS (包子摊) along street front (Z: 4.8)
    const stallXPositions = [15, 32, 58, 78];
    stallXPositions.forEach((sx) => {
      const stall = new THREE.Group();
      stall.position.set(sx, 0, 4.8);

      // Wooden stall table
      const tbl = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.9, 1.4), this.matAgedWood);
      tbl.position.y = 0.45;
      stall.add(tbl);

      // Multi-tier Bamboo Dumpling Steamers (Zhenglong / 蒸笼)
      const bambooMat = new THREE.MeshStandardMaterial({ color: 0xC4A36B, roughness: 0.8 });
      for (let tier = 0; tier < 3; tier++) {
        const steamer = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 12), bambooMat);
        steamer.position.set(0.6, 0.95 + tier * 0.22, 0);
        stall.add(steamer);
      }

      // Rising steam puff (animated)
      const steamPuff = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.45, roughness: 1.0 })
      );
      steamPuff.position.set(0.6, 1.8, 0);
      stall.add(steamPuff);
      this.steamingPuffs.push(steamPuff);

      // Cloth Awning canopy over stall
      const awning = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 2.2), this.matSilkDamask);
      awning.position.set(0, 2.4, 0);
      awning.rotation.x = 0.15;
      stall.add(awning);

      marketGroup.add(stall);
    });

    // Market Street Colliders
    this.colliders.push(
      // Street paving
      { minX: 95, maxX: 185, minZ: 85 - 4.25, maxZ: 85 + 4.25, height: 3.8 + 0.25, surface: 'stone' },
      // Songhe Tea House Ground Floor
      { minX: 95 + 15, maxX: 95 + 25, minZ: 85 - 12, maxZ: 85 - 4, height: 3.8 + 0.2, surface: 'wood' },
      // Songhe Tea House 2nd Floor Balcony
      { minX: 95 + 15, maxX: 95 + 25, minZ: 85 - 12, maxZ: 85 - 4, height: 3.8 + 3.8, surface: 'wood' },
      // Drunken Immortal Tavern
      { minX: 95 + 39.5, maxX: 95 + 50.5, minZ: 85 - 12, maxZ: 85 - 4, height: 3.8 + 0.2, surface: 'wood' },
      // Yunjin Silk Shop
      { minX: 95 + 65, maxX: 95 + 75, minZ: 85 - 12, maxZ: 85 - 4, height: 3.8 + 0.2, surface: 'wood' }
    );

    this.group.add(marketGroup);
  }

  // =========================================================================
  // 6. REAL 3D ACCESSIBLE HOUSES (Siheyuan Courtyard Residence)
  // X: 130, Z: 200 (Residential district)
  // Double walls with thickness, gatehouse, shadow wall, main living hall, bedroom with Luohan bed, wardrobe
  // =========================================================================
  private buildAccessibleSiheyuanResidence() {
    const siheyuan = new THREE.Group();
    siheyuan.position.set(130, 4.35, 200);

    // Stone Courtyard Floor (24m x 20m)
    const courtFloor = new THREE.Mesh(new THREE.BoxGeometry(24, 0.2, 20), this.matBridgeStone);
    courtFloor.position.y = 0.1;
    courtFloor.receiveShadow = true;
    siheyuan.add(courtFloor);

    // Perimeter Enclosure Wall
    const wallH = 3.6;
    const wallThick = 0.4;
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(24, wallH, wallThick), this.matPlaster);
    wallN.position.set(0, wallH * 0.5, -10);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, 20), this.matPlaster);
    wallE.position.set(12, wallH * 0.5, 0);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, 20), this.matPlaster);
    wallW.position.set(-12, wallH * 0.5, 0);
    siheyuan.add(wallN, wallE, wallW);

    // South Entrance Gatehouse with Door Drums (Baogushi)
    const gateW_L = new THREE.Mesh(new THREE.BoxGeometry(9.5, wallH, wallThick), this.matPlaster);
    gateW_L.position.set(-6.5, wallH * 0.5, 10);
    const gateW_R = new THREE.Mesh(new THREE.BoxGeometry(9.5, wallH, wallThick), this.matPlaster);
    gateW_R.position.set(6.5, wallH * 0.5, 10);
    siheyuan.add(gateW_L, gateW_R);

    // Gatehouse Vermilion Double Door (Open passageway 3.0m wide)
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.5), this.matDarkWood);
    lintel.position.set(0, 3.2, 10);
    siheyuan.add(lintel);

    // Shadow Spirit Screen Wall (Yingbi / 影壁) inside gate to deflect negative qi
    const yingbi = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.8, 0.45), this.matMarbleRelief);
    yingbi.position.set(0, 1.4, 6.5);
    yingbi.castShadow = true;
    siheyuan.add(yingbi);

    // MAIN LIVING HALL (North Hall) - Complete 3D Accessible Building
    // Dimensions: 14m wide x 7.5m deep x 5.2m high
    const mainHall = new THREE.Group();
    mainHall.position.set(0, 0, -5.5);

    // Interior Wood Floor
    const hallFloor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 7.5), this.matWarmInteriorWood);
    hallFloor.position.y = 0.22;
    mainHall.add(hallFloor);

    // Double Exterior Walls with 3D Thickness
    const mWallN = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 0.4), this.matPlaster);
    mWallN.position.set(0, 2.25, -3.75);
    const mWallE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 7.5), this.matPlaster);
    mWallE.position.set(7.0, 2.25, 0);
    const mWallW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 7.5), this.matPlaster);
    mWallW.position.set(-7.0, 2.25, 0);

    // South Front Wall with open central double door (3m wide)
    const mWallSL = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.5, 0.4), this.matPlaster);
    mWallSL.position.set(-4.5, 2.25, 3.75);
    const mWallSR = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.5, 0.4), this.matPlaster);
    mWallSR.position.set(4.5, 2.25, 3.75);
    const mWallSLintel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.2, 0.4), this.matPlaster);
    mWallSLintel.position.set(0, 3.9, 3.75);
    mainHall.add(mWallN, mWallE, mWallW, mWallSL, mWallSR, mWallSLintel);

    // Traditional Tiled Hip-and-Gable Roof
    const mainRoof = new THREE.Mesh(new THREE.ConeGeometry(11.5, 3.0, 4), this.matCharcoalRoof);
    mainRoof.position.y = 5.8;
    mainRoof.rotation.y = Math.PI / 4;
    mainRoof.scale.set(1.4, 0.9, 0.9);
    mainRoof.castShadow = true;
    mainHall.add(mainRoof);

    // INTERIOR FURNITURE:
    // 1. Central Eight Immortals Dining/Reception Table (Baxian Zhuo) & Official's Hat Chairs
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 1.8), this.matWarmInteriorWood);
    table.position.set(0, 0.65, 0);
    mainHall.add(table);

    for (const ang of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.95, 0.65), this.matDarkWood);
      chair.position.set(Math.cos(ang) * 1.5, 0.7, Math.sin(ang) * 1.5);
      mainHall.add(chair);
    }

    // 2. Bedroom Chamber (West Room partition)
    const partWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.2, 5.0), this.matWarmInteriorWood);
    partWall.position.set(-2.8, 2.1, -1.0);
    mainHall.add(partWall);

    // Traditional Chinese Platform Canopy Bed (Luohan Chuang / 罗汉床)
    const luohanBed = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 2.2), this.matWarmInteriorWood);
    luohanBed.position.set(-5.0, 0.52, -2.2);
    mainHall.add(luohanBed);

    // Antique Wardrobe Cabinet
    const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.8), this.matDarkWood);
    wardrobe.position.set(-5.8, 1.42, 1.5);
    mainHall.add(wardrobe);

    // Warm Interior Paper Lantern
    const houseLight = new THREE.PointLight(0xFFAA44, 1.5, 12);
    houseLight.position.set(0, 3.2, 0);
    mainHall.add(houseLight);

    siheyuan.add(mainHall);

    // Colliders
    this.colliders.push(
      // Courtyard ground
      { minX: 130 - 12, maxX: 130 + 12, minZ: 200 - 10, maxZ: 200 + 10, height: 4.35 + 0.2, surface: 'stone' },
      // Main hall floor
      { minX: 130 - 7, maxX: 130 + 7, minZ: 200 - 9.25, maxZ: 200 - 1.75, height: 4.35 + 0.25, surface: 'wood' },
      // Outer perimeter wall colliders (with gate opening at Z: 10, X: -1.5..1.5)
      { minX: 130 - 12, maxX: 130 - 1.5, minZ: 200 + 9.7, maxZ: 200 + 10.3, height: 4.35 + 3.6, surface: 'stone', isSolidWall: true },
      { minX: 130 + 1.5, maxX: 130 + 12, minZ: 200 + 9.7, maxZ: 200 + 10.3, height: 4.35 + 3.6, surface: 'stone', isSolidWall: true },
      { minX: 130 - 12, maxX: 130 + 12, minZ: 200 - 10.3, maxZ: 200 - 9.7, height: 4.35 + 3.6, surface: 'stone', isSolidWall: true },
      { minX: 130 + 11.7, maxX: 130 + 12.3, minZ: 200 - 10, maxZ: 200 + 10, height: 4.35 + 3.6, surface: 'stone', isSolidWall: true },
      { minX: 130 - 12.3, maxX: 130 - 11.7, minZ: 200 - 10, maxZ: 200 + 10, height: 4.35 + 3.6, surface: 'stone', isSolidWall: true }
    );

    this.group.add(siheyuan);
  }

  // =========================================================================
  // 7. REAL 3D ACCESSIBLE CANAL WATER TOWN HOUSE
  // X: 125, Z: 395 (Water Town canal district)
  // Two-story house, cantilevered timber balcony over canal, staircase to 2nd floor, water steps
  // =========================================================================
  private buildAccessibleCanalWaterTownHouse() {
    const canalHouse = new THREE.Group();
    canalHouse.position.set(125, 4.35, 395);

    // Ground Floor (9m wide x 7m deep x 3.6m high)
    const gFloor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.25, 7), this.matWarmInteriorWood);
    gFloor.position.y = 0.12;
    canalHouse.add(gFloor);

    // Walls
    const cWallN = new THREE.Mesh(new THREE.BoxGeometry(9, 3.6, 0.35), this.matPlaster);
    cWallN.position.set(0, 1.8, -3.5);
    const cWallL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 7), this.matPlaster);
    cWallL.position.set(-4.5, 1.8, 0);
    const cWallR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 7), this.matPlaster);
    cWallR.position.set(4.5, 1.8, 0);
    // South wall with open street doorway
    const cWallSL = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.6, 0.35), this.matPlaster);
    cWallSL.position.set(-3.0, 1.8, 3.5);
    const cWallSR = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.6, 0.35), this.matPlaster);
    cWallSR.position.set(3.0, 1.8, 3.5);
    canalHouse.add(cWallN, cWallL, cWallR, cWallSL, cWallSR);

    // Staircase to 2nd Floor
    for (let s = 0; s < 9; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.38, 0.38), this.matWarmInteriorWood);
      step.position.set(3.6, 0.15 + s * 0.38, -2.5 + s * 0.38);
      canalHouse.add(step);
    }

    // 2nd Floor Floor with Cantilevered Balcony over North Canal
    // 9m wide x 9.5m deep (extends 2.5m over canal on north side)
    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(9, 0.3, 9.5), this.matWarmInteriorWood);
    floor2.position.set(0, 3.6, -1.25);
    floor2.receiveShadow = true;
    canalHouse.add(floor2);

    // 2nd Floor Balcony Railings
    const bRail = new THREE.Mesh(new THREE.BoxGeometry(8.8, 0.95, 0.15), this.matLattice);
    bRail.position.set(0, 4.2, -5.9);
    canalHouse.add(bRail);

    // Cantilever Timber Under-Support Brackets
    for (const bx of [-3.5, 0, 3.5]) {
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.8, 2.2), this.matDarkWood);
      bracket.position.set(bx, 2.5, -4.6);
      bracket.rotation.x = -0.35;
      canalHouse.add(bracket);
    }

    // Traditional Dark Charcoal Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 2.5, 4), this.matCharcoalRoof);
    roof.position.set(0, 6.8, -1.25);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.35, 0.9, 1.35);
    roof.castShadow = true;
    canalHouse.add(roof);

    // Water Steps (Shuibutou / 水埠头) descending from house directly into canal
    for (let st = 0; st < 6; st++) {
      const wStep = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.25, 0.45), this.matBridgeStone);
      wStep.position.set(-2.5, -st * 0.25, -3.8 - st * 0.45);
      canalHouse.add(wStep);
    }

    // Colliders
    this.colliders.push(
      // Ground floor
      { minX: 125 - 4.5, maxX: 125 + 4.5, minZ: 395 - 3.5, maxZ: 395 + 3.5, height: 4.35 + 0.25, surface: 'wood' },
      // 2nd floor & balcony
      { minX: 125 - 4.5, maxX: 125 + 4.5, minZ: 395 - 6.0, maxZ: 395 + 3.5, height: 4.35 + 3.6, surface: 'wood' }
    );

    this.group.add(canalHouse);
  }

  // =========================================================================
  // 8. GRAND RIVERFRONT PLAZA & RIVERSIDE WHARFS
  // X: 85..155, Z: 35..65
  // Wide paved granite plaza, stone seating benches, willow trees, lanterns, broad steps down to water
  // =========================================================================
  private buildGrandRiverfrontPlaza() {
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(120, 3.8, 50);

    // Expansive Granite Paved Plaza (70m x 30m)
    const plazaPaving = new THREE.Mesh(new THREE.BoxGeometry(70, 0.25, 30), this.matBridgeStone);
    plazaPaving.position.y = 0.12;
    plazaPaving.receiveShadow = true;
    plazaGroup.add(plazaPaving);

    // Carved Riverfront Stone Balustrade along southern edge (facing the Grand River)
    const balGeo = new THREE.BoxGeometry(68, 0.95, 0.35);
    const riverBal = new THREE.Mesh(balGeo, this.matMarbleRelief);
    riverBal.position.set(0, 0.72, -14.8);
    plazaGroup.add(riverBal);

    // Broad Stone Steps descending from Plaza down to Water Level
    for (let st = 0; st < 8; st++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(28, 0.35, 0.7), this.matBridgeStone);
      step.position.set(0, -st * 0.35, -15.2 - st * 0.7);
      step.receiveShadow = true;
      plazaGroup.add(step);
    }

    // Carved Stone Seating Benches
    for (const bx of [-22, -11, 11, 22]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.55, 0.8), this.matMarbleRelief);
      bench.position.set(bx, 0.4, 0);
      plazaGroup.add(bench);
    }

    // Elegant Weeping Willow Trees along plaza edge
    const willowMat = new THREE.MeshStandardMaterial({
      color: COLOR_BIBLE.GRASS,
      roughness: 0.8,
    });
    for (const wx of [-26, -13, 0, 13, 26]) {
      const tree = new THREE.Group();
      tree.position.set(wx, 0.2, 8.5);

      // Gnarled trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 4.2, 8), this.matAgedWood);
      trunk.position.y = 2.1;
      trunk.castShadow = true;
      tree.add(trunk);

      // Drooping willow foliage dome
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 10), willowMat);
      foliage.position.y = 4.5;
      foliage.scale.set(1.2, 0.8, 1.2);
      foliage.castShadow = true;
      tree.add(foliage);

      // Hanging weeping willow fronds
      for (let f = 0; f < 6; f++) {
        const frond = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.05, 2.2, 6), willowMat);
        frond.position.set(Math.cos(f) * 2.0, 3.2, Math.sin(f) * 2.0);
        tree.add(frond);
      }

      plazaGroup.add(tree);
    }

    // Traditional Standing Lantern Posts
    for (const lx of [-28, -14, 0, 14, 28]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.2), this.matDarkWood);
      post.position.set(lx, 1.6, -14.2);
      const lanternBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), this.matLattice);
      lanternBox.position.set(lx, 3.2, -14.2);
      plazaGroup.add(post, lanternBox);
    }

    // Plaza Colliders
    this.colliders.push(
      // Paved plaza
      { minX: 120 - 35, maxX: 120 + 35, minZ: 50 - 15, maxZ: 50 + 15, height: 3.8 + 0.25, surface: 'stone' },
      // Water steps landing
      { minX: 120 - 14, maxX: 120 + 14, minZ: 50 - 21, maxZ: 50 - 15, height: 1.2, surface: 'stone' }
    );

    this.group.add(plazaGroup);
  }

  // =========================================================================
  // 9. GRAND IMPERIAL DRAGON PLEASURE BARGE (Longzhou / 龙舟)
  // Moored alongside riverfront wharf at (105, 0.4, 48)
  // 18m long luxury barge, carved gilded dragon figurehead, royal cabin, silk canopies, walkable deck
  // =========================================================================
  private buildImperialDragonPleasureBarge() {
    const barge = new THREE.Group();
    barge.position.set(105, 0.45, 26);

    // Ship Hull (18m long x 5.2m wide, curved bow and stern)
    const hullMat = new THREE.MeshStandardMaterial({
      map: textureFactory.getAgedWoodTexture(),
      color: 0x4A2E1C,
      roughness: 0.65,
    });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(18, 1.8, 5.2), hullMat);
    hull.position.y = 0.9;
    hull.castShadow = true;
    barge.add(hull);

    // Walkable Teak Timber Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(17.6, 0.2, 4.8), this.matWarmInteriorWood);
    deck.position.y = 1.8;
    deck.receiveShadow = true;
    barge.add(deck);

    // Carved Gilded Dragon Figurehead on Bow (Front at X: +9.5m)
    const dragonHead = new THREE.Group();
    dragonHead.position.set(9.6, 2.4, 0);

    const headBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.0), this.matGoldFoil);
    headBase.castShadow = true;
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.2, 6), this.matGoldFoil);
    snout.rotation.z = -Math.PI / 2;
    snout.position.x = 1.0;
    const horns = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.2), this.matGoldFoil);
    horns.rotation.z = 0.4;
    horns.position.set(-0.3, 0.9, 0);
    dragonHead.add(headBase, snout, horns);
    barge.add(dragonHead);

    // Dragon Tail Fin on Stern (Rear at X: -9.5m)
    const dragonTail = new THREE.Mesh(new THREE.ConeGeometry(0.65, 2.4, 4), this.matGoldFoil);
    dragonTail.position.set(-9.4, 2.6, 0);
    dragonTail.rotation.z = -0.6;
    barge.add(dragonTail);

    // Royal Deck Pavilion Cabin (Central luxury VIP lounge, 9m x 3.6m)
    const pavCabin = new THREE.Group();
    pavCabin.position.set(0, 1.9, 0);

    // Vermilion deck columns
    for (const px of [-3.8, -1.2, 1.2, 3.8]) {
      for (const pz of [-1.6, 1.6]) {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5), this.matVermilionPillar);
        col.position.set(px, 1.25, pz);
        pavCabin.add(col);
      }
    }

    // Imperial Yellow Curved Eave Roof
    const bRoof = new THREE.Mesh(new THREE.ConeGeometry(5.8, 1.6, 4), this.matYellowRoof);
    bRoof.position.y = 3.2;
    bRoof.rotation.y = Math.PI / 4;
    bRoof.scale.set(1.9, 0.8, 0.8);
    bRoof.castShadow = true;
    pavCabin.add(bRoof);

    // Silk Curtains & Interior Tea Table on Barge Deck
    const bTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 1.0), this.matWarmInteriorWood);
    bTable.position.set(0, 0.35, 0);
    pavCabin.add(bTable);

    barge.add(pavCabin);

    // Perimeter Carved Railing
    for (const side of [-2.4, 2.4]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.75, 0.12), this.matLattice);
      rail.position.set(0, 2.25, side);
      barge.add(rail);
    }

    // 3 Moored Traditional Wooden Sampans near Barge
    const sampanOffsets = [-14, 14, 28];
    sampanOffsets.forEach((ox) => {
      const sampan = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.8, 2.2), this.matAgedWood);
      sampan.position.set(ox, 0.4, 0);
      barge.add(sampan);
    });

    this.dragonBargeGroup = barge;

    // Barge Walkable Deck Collider
    this.colliders.push({
      minX: 105 - 8.8,
      maxX: 105 + 8.8,
      minZ: 26 - 2.4,
      maxZ: 26 + 2.4,
      height: 0.45 + 1.8,
      surface: 'wood',
    });

    this.group.add(barge);
  }

  // =========================================================================
  // 10. ANCIENT WATER TOWN CANALS & COVERED CORRIDOR BRIDGE (Langqiao)
  // X: 100, Z: 430
  // Interconnecting canal walls, Arched Moon Bridge (Yueya Qiao), Covered Corridor Bridge with seating benches, Water Gate (Shuiguan)
  // =========================================================================
  private buildWaterTownCanalsAndCoveredBridge() {
    const townGroup = new THREE.Group();
    townGroup.position.set(100, 4.35, 430);

    // A. Covered Corridor Bridge (Langqiao / 廊桥) spanning across canal
    const bridgeW = 4.2;
    const bridgeL = 16.0;

    const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 0.35, bridgeL), this.matAgedWood);
    bridgeDeck.position.set(0, 1.4, 0);
    bridgeDeck.receiveShadow = true;
    townGroup.add(bridgeDeck);

    // Timber posts supporting covered roof
    for (const bx of [-1.9, 1.9]) {
      for (const bz of [-7, -3.5, 0, 3.5, 7]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.8), this.matDarkWood);
        post.position.set(bx, 2.8, bz);
        townGroup.add(post);
      }
    }

    // Covered corridor dark grey tile roof
    const roofCorridor = new THREE.Mesh(new THREE.BoxGeometry(bridgeW + 1.2, 0.6, bridgeL + 1.4), this.matCharcoalRoof);
    roofCorridor.position.set(0, 4.4, 0);
    roofCorridor.castShadow = true;
    townGroup.add(roofCorridor);

    // Built-in wooden viewing benches along bridge railings
    for (const side of [-1.7, 1.7]) {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, bridgeL - 1), this.matWarmInteriorWood);
      bench.position.set(side, 1.8, 0);
      townGroup.add(bench);
    }

    // B. Canal Water Gate (Shuiguan / 水关) with heavy iron grates
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-18, 0, 0);

    // Stone gate arch piers
    const gatePierL = new THREE.Mesh(new THREE.BoxGeometry(2.4, 5.5, 3.2), this.matBridgeStone);
    gatePierL.position.set(-3.2, 2.75, 0);
    const gatePierR = new THREE.Mesh(new THREE.BoxGeometry(2.4, 5.5, 3.2), this.matBridgeStone);
    gatePierR.position.set(3.2, 2.75, 0);
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(8.8, 1.2, 3.2), this.matBridgeStone);
    gateArch.position.set(0, 5.5, 0);
    gateGroup.add(gatePierL, gatePierR, gateArch);

    // Iron drop-grate portcullis (raised half-way)
    const ironGrate = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 0.18), this.matBronze);
    ironGrate.position.set(0, 4.2, 0);
    gateGroup.add(ironGrate);

    townGroup.add(gateGroup);

    // Covered Bridge Walkable Collider
    this.colliders.push({
      minX: 100 - bridgeW * 0.5,
      maxX: 100 + bridgeW * 0.5,
      minZ: 430 - bridgeL * 0.5,
      maxZ: 430 + bridgeL * 0.5,
      height: 4.35 + 1.4,
      surface: 'wood',
    });

    this.group.add(townGroup);
  }

  // =========================================================================
  // 11. MOUNTAIN ENVIRONMENT & HIGH CLOUD SUMMIT TEMPLE (Wuyun Temple / 乌云禅寺)
  // Perched on mountain crest above Yunling village at X: 110, Y: 14.5, Z: 495
  // Red courtyard gate, incense burner tripod, shrine hall with Buddha statue, bell pavilion, cliff overlook
  // =========================================================================
  private buildCloudSummitTemple() {
    const templeGroup = new THREE.Group();
    templeGroup.position.set(110, 14.5, 495);

    // Courtyard Terrace (26m x 22m, paved in old mountain slate)
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(26, 0.35, 22), this.matBridgeStone);
    terrace.position.y = 0.18;
    terrace.receiveShadow = true;
    templeGroup.add(terrace);

    // Red Courtyard Enclosure Walls
    const tWallH = 3.2;
    const tWallMat = this.matVermilionPillar;
    const wallN = new THREE.Mesh(new THREE.BoxGeometry(26, tWallH, 0.35), tWallMat);
    wallN.position.set(0, tWallH * 0.5, -11);
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.35, tWallH, 22), tWallMat);
    wallE.position.set(13, tWallH * 0.5, 0);
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.35, tWallH, 22), tWallMat);
    wallW.position.set(-13, tWallH * 0.5, 0);
    templeGroup.add(wallN, wallE, wallW);

    // Temple Mountain Gate (Shanmen / 山门) at South
    const gateL = new THREE.Mesh(new THREE.BoxGeometry(10.5, tWallH, 0.35), tWallMat);
    gateL.position.set(-7.5, tWallH * 0.5, 11);
    const gateR = new THREE.Mesh(new THREE.BoxGeometry(10.5, tWallH, 0.35), tWallMat);
    gateR.position.set(7.5, tWallH * 0.5, 11);
    const gateRoof = new THREE.Mesh(new THREE.ConeGeometry(4.5, 1.8, 4), this.matCharcoalRoof);
    gateRoof.position.set(0, 4.2, 11);
    gateRoof.rotation.y = Math.PI / 4;
    gateRoof.castShadow = true;
    templeGroup.add(gateL, gateR, gateRoof);

    // Cast Bronze Incense Burner Tripod (Xianglu / 香炉) in center courtyard
    const xianglu = new THREE.Group();
    xianglu.position.set(0, 0.35, 3.5);
    // 3 Tripod legs
    for (let l = 0; l < 3; l++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.8), this.matBronze);
      leg.position.set(Math.cos(l * 2.1) * 0.45, 0.4, Math.sin(l * 2.1) * 0.45);
      xianglu.add(leg);
    }
    const caldron = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 0.8, 12), this.matBronze);
    caldron.position.y = 1.0;
    caldron.castShadow = true;
    xianglu.add(caldron);
    templeGroup.add(xianglu);

    // MAIN SHRINE HALL (Daxiong Baodian / 大雄宝殿)
    // 16m wide x 10m deep x 6.5m high
    const shrine = new THREE.Group();
    shrine.position.set(0, 0, -5.5);

    const sFloor = new THREE.Mesh(new THREE.BoxGeometry(16, 0.25, 10), this.matWarmInteriorWood);
    sFloor.position.y = 0.15;
    shrine.add(sFloor);

    // Vermilion pillars
    for (const px of [-7, -2.5, 2.5, 7]) {
      for (const pz of [-4.5, 4.5]) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 5.5), this.matVermilionPillar);
        p.position.set(px, 2.8, pz);
        p.castShadow = true;
        shrine.add(p);
      }
    }

    // Walls with central open prayer portal
    const sWallN = new THREE.Mesh(new THREE.BoxGeometry(16, 5.0, 0.4), this.matPlaster);
    sWallN.position.set(0, 2.6, -4.8);
    const sWallE = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.0, 10), this.matPlaster);
    sWallE.position.set(7.8, 2.6, 0);
    const sWallW = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.0, 10), this.matPlaster);
    sWallW.position.set(-7.8, 2.6, 0);
    shrine.add(sWallN, sWallE, sWallW);

    // Upturned Flared Temple Roof
    const sRoof = new THREE.Mesh(new THREE.ConeGeometry(13.5, 3.8, 4), this.matCharcoalRoof);
    sRoof.position.y = 6.8;
    sRoof.rotation.y = Math.PI / 4;
    sRoof.scale.set(1.4, 0.85, 1.0);
    sRoof.castShadow = true;
    shrine.add(sRoof);

    // Golden Buddha Statue on Altar
    const altar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.0, 1.8), this.matDarkWood);
    altar.position.set(0, 0.55, -3.2);
    const buddha = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.8, 8), this.matGoldFoil);
    buddha.position.set(0, 1.9, -3.2);
    shrine.add(altar, buddha);

    // Prayer Kneeling Cushions (Putuan / 蒲团)
    for (const cx of [-1.2, 0, 1.2]) {
      const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 10), this.matSilkDamask);
      cushion.position.set(cx, 0.2, -1.0);
      shrine.add(cushion);
    }

    templeGroup.add(shrine);

    // Dramatic Panoramic Cliff Overlook with Wooden Railing
    const overlook = new THREE.Mesh(new THREE.BoxGeometry(12, 0.95, 0.2), this.matLattice);
    overlook.position.set(0, 0.65, 11);
    templeGroup.add(overlook);

    // Temple Colliders
    this.colliders.push(
      // Temple terrace
      { minX: 110 - 13, maxX: 110 + 13, minZ: 495 - 11, maxZ: 495 + 11, height: 14.5 + 0.35, surface: 'stone' },
      // Shrine hall interior floor
      { minX: 110 - 8, maxX: 110 + 8, minZ: 495 - 10.5, maxZ: 495 - 0.5, height: 14.5 + 0.25, surface: 'wood' }
    );

    this.group.add(templeGroup);
  }

  // =========================================================================
  // 12. NORTHERN FORTRESS BASTION INTERIOR
  // Eagle Summit Bastion at X: 475, Y: 24.5, Z: 575
  // Real accessible interior guardroom, weapon rack (halberds & spears), glowing fire brazier, soldier bunks
  // =========================================================================
  private buildEagleSummitBastionInterior() {
    const bastionGroup = new THREE.Group();
    bastionGroup.position.set(475, 24.5, 575);

    // Guardroom Interior Floor (10m x 8m)
    const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 8), this.matFortressStone);
    floor.position.y = 0.15;
    floor.receiveShadow = true;
    bastionGroup.add(floor);

    // Heavy Stone Masonry Walls (height 4.2m)
    const wallThick = 0.6;
    const bWallN = new THREE.Mesh(new THREE.BoxGeometry(10, 4.2, wallThick), this.matFortressStone);
    bWallN.position.set(0, 2.1, -4.0);
    const bWallE = new THREE.Mesh(new THREE.BoxGeometry(wallThick, 4.2, 8), this.matFortressStone);
    bWallE.position.set(5.0, 2.1, 0);
    const bWallW = new THREE.Mesh(new THREE.BoxGeometry(wallThick, 4.2, 8), this.matFortressStone);
    bWallW.position.set(-5.0, 2.1, 0);

    // South Entrance Wall with open doorway (2.4m wide)
    const bWallSL = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.2, wallThick), this.matFortressStone);
    bWallSL.position.set(-3.1, 2.1, 4.0);
    const bWallSR = new THREE.Mesh(new THREE.BoxGeometry(3.8, 4.2, wallThick), this.matFortressStone);
    bWallSR.position.set(3.1, 2.1, 4.0);
    const bLintel = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, wallThick), this.matFortressStone);
    bLintel.position.set(0, 3.6, 4.0);
    bastionGroup.add(bWallN, bWallE, bWallW, bWallSL, bWallSR, bLintel);

    // Weapons Rack with Halberds (Ji) and Spears (Qiang)
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.6, 0.45), this.matDarkWood);
    rack.position.set(-3.2, 0.8, -3.2);
    bastionGroup.add(rack);

    for (let w = 0; w < 4; w++) {
      const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8), this.matAgedWood);
      spearShaft.position.set(-4.2 + w * 0.7, 1.4, -3.2);
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 6), this.matBronze);
      spearTip.position.set(-4.2 + w * 0.7, 2.9, -3.2);
      bastionGroup.add(spearShaft, spearTip);
    }

    // Soldier Bunk Beds
    for (const bz of [-1.5, 1.5]) {
      const bunk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.65, 1.2), this.matAgedWood);
      bunk.position.set(3.4, 0.35, bz);
      bastionGroup.add(bunk);
    }

    // Glowing Iron Fire Brazier in Guardroom
    const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.35, 0.75, 10), this.matBronze);
    brazier.position.set(0, 0.4, 0);
    const coal = new THREE.Mesh(
      new THREE.SphereGeometry(0.45, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xFF4500, emissive: 0xFF2200, emissiveIntensity: 1.8, roughness: 0.9 })
    );
    coal.position.set(0, 0.8, 0);
    bastionGroup.add(brazier, coal);

    const fireLight = new THREE.PointLight(0xFF6600, 2.4, 14);
    fireLight.position.set(0, 1.2, 0);
    bastionGroup.add(fireLight);
    this.brazierLights.push(fireLight);

    // Bastion Interior Collider
    this.colliders.push({
      minX: 475 - 5.0,
      maxX: 475 + 5.0,
      minZ: 575 - 4.0,
      maxZ: 575 + 4.0,
      height: 24.5 + 0.3,
      surface: 'stone',
    });

    this.group.add(bastionGroup);
  }

  // =========================================================================
  // 13. INTERACTIVE 3D DOORS SYSTEM (Part 3)
  // Functional doors with animated pivots, open/close audio, collision toggles
  // =========================================================================
  private buildInteractiveDoors() {
    const doorSpecs = [
      { id: 'door_siheyuan_gate', name: 'Siheyuan Courtyard Gate', x: 130, y: 4.35, z: 210, width: 2.8, height: 3.2, rotY: 0 },
      { id: 'door_siheyuan_hall', name: 'Siheyuan Main Hall', x: 130, y: 4.35, z: 194.5, width: 2.6, height: 3.0, rotY: 0 },
      { id: 'door_tea_house', name: 'Songhe Tea House Entrance', x: 115, y: 3.8, z: 81, width: 2.4, height: 2.8, rotY: 0 },
      { id: 'door_tavern', name: 'Drunken Immortal Tavern', x: 140, y: 3.8, z: 81, width: 2.4, height: 2.8, rotY: 0 },
      { id: 'door_silk_shop', name: 'Yunjin Silk Shop', x: 165, y: 3.8, z: 81, width: 2.4, height: 2.8, rotY: 0 },
      { id: 'door_eagle_bastion', name: 'Eagle Summit Bastion Door', x: 475, y: 24.5, z: 579, width: 2.2, height: 3.2, rotY: 0 },
      { id: 'door_canal_house', name: 'Canal Townhouse Front Door', x: 125, y: 4.35, z: 398.5, width: 2.0, height: 2.6, rotY: 0 },
      { id: 'door_temple_gate', name: 'Wuyun Mountain Temple Gate', x: 110, y: 14.5, z: 506, width: 3.0, height: 3.4, rotY: 0 },
      { id: 'door_bell_tower', name: 'Thousand Bell Tower Portal', x: 225, y: 4.35, z: 147, width: 3.2, height: 3.8, rotY: 0 },
      { id: 'door_palace_hall', name: 'Taihe Palace Grand Entrance', x: 200, y: 7.15, z: 314, width: 4.5, height: 4.8, rotY: 0 },
    ];

    doorSpecs.forEach((spec) => {
      // Pivot located at hinge edge
      const pivot = new THREE.Group();
      pivot.position.set(spec.x - spec.width * 0.5, spec.y, spec.z);
      pivot.rotation.y = spec.rotY;

      // Wooden door leaf mesh (starts closed at angle 0)
      const doorLeaf = new THREE.Mesh(
        new THREE.BoxGeometry(spec.width, spec.height, 0.15),
        this.matDarkWood
      );
      // Offset mesh so its hinge is at pivot origin
      doorLeaf.position.set(spec.width * 0.5, spec.height * 0.5, 0);
      doorLeaf.castShadow = true;

      // Brass door knocker / handle ring
      const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.03, 8, 16), this.matBronze);
      knocker.position.set(spec.width * 0.8, spec.height * 0.5, 0.1);
      doorLeaf.add(knocker);

      pivot.add(doorLeaf);
      this.group.add(pivot);

      // Door physical blocking collider when closed
      const doorCollider: KaifengCollider = {
        minX: spec.x - spec.width * 0.5,
        maxX: spec.x + spec.width * 0.5,
        minZ: spec.z - 0.25,
        maxZ: spec.z + 0.25,
        height: spec.y + spec.height,
        surface: 'wood',
        isSolidWall: true,
      };

      const doorObj: InteractiveDoor = {
        id: spec.id,
        name: spec.name,
        position: new THREE.Vector3(spec.x, spec.y, spec.z),
        pivot,
        doorLeaf,
        isOpen: false,
        currentAngle: 0,
        openAngle: -Math.PI * 0.55, // swings open inward by 100 degrees
        closedAngle: 0,
        triggerRadius: 3.8,
        doorCollider,
      };

      this.doors.push(doorObj);
    });
  }

  /**
   * Spatial Grid Partitioning (Part 3 Mobile Optimization)
   * Hashes colliders into 40m x 40m spatial cells for O(1) collision query
   */
  private buildSpatialGrid() {
    this.spatialGrid.clear();
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      const minGx = Math.floor(c.minX / this.GRID_CELL_SIZE);
      const maxGx = Math.floor(c.maxX / this.GRID_CELL_SIZE);
      const minGz = Math.floor(c.minZ / this.GRID_CELL_SIZE);
      const maxGz = Math.floor(c.maxZ / this.GRID_CELL_SIZE);

      for (let gx = minGx; gx <= maxGx; gx++) {
        for (let gz = minGz; gz <= maxGz; gz++) {
          const key = `${gx}_${gz}`;
          let cell = this.spatialGrid.get(key);
          if (!cell) {
            cell = [];
            this.spatialGrid.set(key, cell);
          }
          cell.push(c);
        }
      }
    }
  }

  /**
   * Finds nearest interactive door within interaction radius
   */
  public getNearestDoor(pos: THREE.Vector3, maxDist: number = 3.8): InteractiveDoor | null {
    let nearest: InteractiveDoor | null = null;
    let minDist = maxDist;

    for (let i = 0; i < this.doors.length; i++) {
      const d = this.doors[i];
      const dist = pos.distanceTo(d.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    }
    return nearest;
  }

  /**
   * Toggles the state of nearest door
   */
  public toggleNearestDoor(pos: THREE.Vector3): InteractiveDoor | null {
    const door = this.getNearestDoor(pos);
    if (!door) return null;

    door.isOpen = !door.isOpen;
    if (door.isOpen) {
      soundEngine.playDoorOpen();
      // Remove door obstacle collider while open
      if (door.doorCollider) {
        const idx = this.colliders.indexOf(door.doorCollider);
        if (idx !== -1) {
          this.colliders.splice(idx, 1);
          this.buildSpatialGrid();
        }
      }
    } else {
      soundEngine.playDoorClose();
      // Restore door obstacle collider when closed
      if (door.doorCollider && !this.colliders.includes(door.doorCollider)) {
        this.colliders.push(door.doorCollider);
        this.buildSpatialGrid();
      }
    }
    return door;
  }

  /**
   * Fast spatial collision query using spatial grid hash
   */
  public queryArchitectureCollision(x: number, z: number): { onSurface: boolean; height: number; surface: 'stone' | 'wood' | 'earth' | 'grass' | 'water' } {
    const gx = Math.floor(x / this.GRID_CELL_SIZE);
    const gz = Math.floor(z / this.GRID_CELL_SIZE);
    const key = `${gx}_${gz}`;
    const cellColliders = this.spatialGrid.get(key) || this.colliders;

    // 1. Solid walls
    for (let i = 0; i < cellColliders.length; i++) {
      const c = cellColliders[i];
      if (c.isSolidWall && x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
        return { onSurface: true, height: c.height, surface: c.surface };
      }
    }

    // 2. Walkable surfaces, decks, balconies, and stairs
    for (let i = 0; i < cellColliders.length; i++) {
      const c = cellColliders[i];
      if (!c.isSolidWall && x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
        return { onSurface: true, height: c.height, surface: c.surface };
      }
    }

    return { onSurface: false, height: 0, surface: 'stone' };
  }

  /**
   * Per-frame animation update for doors, bells, dragon barge roll, brazier flicker, and steam puffs
   */
  public update(delta: number, elapsed: number) {
    // 1. Smooth interactive door swinging animation
    for (let i = 0; i < this.doors.length; i++) {
      const d = this.doors[i];
      const targetAngle = d.isOpen ? d.openAngle : d.closedAngle;
      d.currentAngle = THREE.MathUtils.damp(d.currentAngle, targetAngle, 8.5, delta);
      d.pivot.rotation.y = d.currentAngle;
    }

    // 2. Thousand Bell Tower corner bells swaying in the breeze
    this.cornerBells.forEach((bell, i) => {
      bell.rotation.z = Math.sin(elapsed * 3.2 + i * 0.7) * 0.14;
      bell.rotation.x = Math.cos(elapsed * 2.8 + i * 0.5) * 0.08;
    });

    // 3. Imperial Dragon Pleasure Barge gentle river rocking
    if (this.dragonBargeGroup) {
      this.dragonBargeGroup.rotation.z = Math.sin(elapsed * 1.2) * 0.018;
      this.dragonBargeGroup.rotation.x = Math.cos(elapsed * 0.9) * 0.012;
      this.dragonBargeGroup.position.y = 0.45 + Math.sin(elapsed * 1.5) * 0.04;
    }

    // 4. Brazier firelight flicker
    this.brazierLights.forEach((light, i) => {
      light.intensity = 2.2 + Math.sin(elapsed * 12.0 + i) * 0.4;
    });

    // 5. Steaming dumpling steam puffs
    this.steamingPuffs.forEach((puff, i) => {
      puff.position.y = 1.8 + ((elapsed * 1.5 + i * 0.6) % 1.2);
      const scale = 0.28 + ((elapsed * 1.5 + i * 0.6) % 1.2) * 0.35;
      puff.scale.set(scale, scale, scale);
    });
  }
}
