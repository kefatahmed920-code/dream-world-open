/**
 * Grand Ancient City Entrance & Riverside Arrival District — Dream World Phase 4
 * Where Winds Meet / Historical Riverfront City Aesthetic
 *
 * Components:
 *  1. Grand City Gate Plaza with Bixi Stele Monument, stone planters, and notice kiosk.
 *  2. Grand City Entrance Road (Imperial Way) with authentic flagstone paving and alleyways.
 *  3. First City Entrance District:
 *     - Golden Carp Tea House & Tavern (Jinli Chaguan) with viewing veranda
 *     - Silk & Jade Merchant Guildhall (Cuiyu Hall)
 *     - Herbalist & Apothecary Shop (Bencao Tang)
 *     - Riverview Inn & Tower (Wanghe Lou)
 *  4. Beautiful Riverside City Edge with tiered stone embankments, boardwalk, and weeping willows.
 *  5. Distinctive Landmarks: Riverview Moon Pavilion, Drum Kiosk, Milestone Wayposts.
 *  6. Environmental storytelling props: market stalls, wooden carts, ceramic jars, lanterns.
 *  7. Full player and NPC collision geometry.
 */

import * as THREE from 'three';
import { textureFactory } from './textures';

export interface CityCollisionResult {
  onSurface: boolean;
  height: number;
  surface: 'stone' | 'wood';
}

export interface CityBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
  surface: 'stone' | 'wood';
  isSolidWall?: boolean;
}

export class CityEntranceManager {
  public group: THREE.Group = new THREE.Group();
  public foamPositions: THREE.Vector3[] = [];

  // Building and structure collision volumes
  private colliders: CityBounds[] = [];

  constructor() {
    this.buildGatePlaza();
    this.buildEntranceRoadAndPaving();
    this.buildRiversideCityEdge();
    this.buildCityDistrictBuildings();
    this.buildLandmarksAndPavilions();
    this.buildStreetMarketProps();
  }

  /**
   * Collision check for city roads, plaza, verandas, boardwalks, and solid walls
   */
  public queryCityCollision(x: number, z: number): CityCollisionResult {
    // 1. Check solid building walls (block horizontal movement)
    for (const c of this.colliders) {
      if (c.isSolidWall) {
        if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
          // Inside solid building wall -> bump height high or block
          return { onSurface: true, height: c.height, surface: c.surface };
        }
      }
    }

    // 2. Check walkable raised surfaces (verandas, boardwalks, pavilions, plaza plinths)
    for (const c of this.colliders) {
      if (!c.isSolidWall) {
        if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
          return { onSurface: true, height: c.height, surface: c.surface };
        }
      }
    }

    // 3. Main Plaza & Central Entrance Road ground surface (Y = 4.0 to 4.3)
    if (x >= 142 && x <= 162 && z >= 24 && z <= 78) {
      const roadT = (z - 24) / 54.0;
      const roadH = THREE.MathUtils.lerp(4.0, 4.3, roadT);
      return { onSurface: true, height: roadH, surface: 'stone' };
    }

    // 4. East Market Alley (X: 160 to 182, Z: 46 to 56)
    if (x >= 160 && x <= 182 && z >= 46 && z <= 56) {
      return { onSurface: true, height: 4.15, surface: 'stone' };
    }

    // 5. West Riverside Boardwalk & Alley (X: 132 to 146, Z: 24 to 68)
    if (x >= 132 && x <= 146 && z >= 24 && z <= 68) {
      const isBoardwalk = x <= 138;
      return { onSurface: true, height: isBoardwalk ? 3.8 : 4.05, surface: isBoardwalk ? 'wood' : 'stone' };
    }

    return { onSurface: false, height: 0, surface: 'stone' };
  }

  /**
   * 1. Grand City Gate Plaza:
   * Broad stone-paved open gathering area with Bixi Stele Monument, carved stone benches,
   * stone planters, and dragon-roof notice board.
   */
  private buildGatePlaza() {
    const plazaGroup = new THREE.Group();
    const stoneTex = textureFactory.getSlateRockTexture();
    stoneTex.repeat.set(4, 4);

    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#787870'),
      roughness: 0.85,
    });

    const darkStoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#55554F'),
      roughness: 0.9,
    });

    // Plaza paved platform (X: 142 to 162, Z: 24 to 42, Y: 4.0m)
    const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 20), stoneMat);
    plazaFloor.position.set(152, 3.85, 33);
    plazaFloor.receiveShadow = true;
    plazaGroup.add(plazaFloor);

    // Decorative geometric stone inlay ring in the plaza center (surrounding the stele)
    const inlayRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.8, 0.25, 4, 32),
      darkStoneMat
    );
    inlayRing.rotateX(Math.PI / 2);
    inlayRing.position.set(152, 4.07, 33);
    plazaGroup.add(inlayRing);

    // Centerpiece: Ancient Carved Stone Stele Monument (Bixi Dragon-Turtle)
    const steleGroup = this.createBixiSteleMonument();
    steleGroup.position.set(152, 4.05, 33);
    plazaGroup.add(steleGroup);

    // Octagonal stone balustrade around the central monument
    const postGeom = new THREE.BoxGeometry(0.18, 0.75, 0.18);
    const railGeom = new THREE.BoxGeometry(2.4, 0.1, 0.12);
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const px = 152 + Math.cos(angle) * 3.6;
      const pz = 33 + Math.sin(angle) * 3.6;
      const post = new THREE.Mesh(postGeom, darkStoneMat);
      post.position.set(px, 4.4, pz);
      post.castShadow = true;
      plazaGroup.add(post);

      const nextAngle = ((a + 1) / 8) * Math.PI * 2;
      const mx = 152 + Math.cos(angle + Math.PI / 8) * 3.6;
      const mz = 33 + Math.sin(angle + Math.PI / 8) * 3.6;
      const rail = new THREE.Mesh(railGeom, darkStoneMat);
      rail.position.set(mx, 4.55, mz);
      rail.rotation.y = -(angle + Math.PI / 8) + Math.PI / 2;
      plazaGroup.add(rail);
    }

    // Traditional Wooden Imperial Notice Board Kiosk (Banggou) on North-East plaza corner
    const noticeKiosk = this.createNoticeBoardKiosk();
    noticeKiosk.position.set(160, 4.05, 27);
    plazaGroup.add(noticeKiosk);

    // Carved Stone Planters with dwarf pines & flowering shrubs
    const planterLocations: [number, number][] = [
      [145, 26], [159, 26],
      [145, 40], [159, 40],
    ];

    planterLocations.forEach(([px, pz]) => {
      const planter = this.createStonePlanter();
      planter.position.set(px, 4.05, pz);
      plazaGroup.add(planter);
    });

    // Resting stone benches along plaza flanks
    [-7.5, 7.5].forEach((bx) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.7), darkStoneMat);
      bench.position.set(152 + bx, 4.25, 33);
      bench.castShadow = true;
      plazaGroup.add(bench);
    });

    this.group.add(plazaGroup);
  }

  /**
   * 2. Grand City Entrance Road (Imperial Way):
   * Wide stone-paved avenue stretching from Z = 40 to Z = 78,
   * with connecting lateral alleys leading east (Market) and west (River Boardwalk).
   */
  private buildEntranceRoadAndPaving() {
    const roadGroup = new THREE.Group();
    const stoneTex = textureFactory.getSlateRockTexture();
    stoneTex.repeat.set(3, 8);

    const roadMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#6E6E66'),
      roughness: 0.82,
    });

    const curbMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#4E4E4A'),
      roughness: 0.9,
    });

    // Main Avenue central pavement (X: 147.5 to 156.5, Z: 40 to 78, width = 9m)
    const roadLength = 38;
    const roadGeom = new THREE.BoxGeometry(9.0, 0.35, roadLength);
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.position.set(152, 4.0, 59);
    road.receiveShadow = true;
    roadGroup.add(road);

    // Granite curb stones lining both edges of the avenue
    [-4.6, 4.6].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, roadLength), curbMat);
      curb.position.set(152 + cx, 4.15, 59);
      curb.castShadow = true;
      roadGroup.add(curb);
    });

    // Tall lacquered wooden lantern posts along the Imperial Way
    for (let z = 44; z <= 74; z += 10) {
      [-4.8, 4.8].forEach((lx) => {
        const post = this.createStreetLanternPost();
        post.position.set(152 + lx, 4.15, z);
        roadGroup.add(post);
      });
    }

    // East Cross-Alley toward future Market District (X: 156 to 175, Z = 50)
    const eastAlley = new THREE.Mesh(new THREE.BoxGeometry(19, 0.32, 6.0), roadMat);
    eastAlley.position.set(166, 4.05, 50);
    eastAlley.receiveShadow = true;
    roadGroup.add(eastAlley);

    // West Cross-Alley toward Riverside Boardwalk (X: 135 to 148, Z = 50)
    const westAlley = new THREE.Mesh(new THREE.BoxGeometry(13, 0.32, 6.0), roadMat);
    westAlley.position.set(141.5, 4.05, 50);
    westAlley.receiveShadow = true;
    roadGroup.add(westAlley);

    // Traditional Directional Milestone Waypost Arches (marking future district routes)
    const eastArch = this.createDistrictMilestoneArch('東市 · MARKET QUARTER');
    eastArch.position.set(168, 4.15, 50);
    eastArch.rotation.y = Math.PI / 2;
    roadGroup.add(eastArch);

    const southArch = this.createDistrictMilestoneArch('皇城御道 · PALACE WAY');
    southArch.position.set(152, 4.3, 76);
    roadGroup.add(southArch);

    this.group.add(roadGroup);
  }

  /**
   * 3. Riverside City Edge & Boardwalk:
   * Tiered stone embankment, wooden boardwalk, waterside tea terrace, and weeping willows.
   */
  private buildRiversideCityEdge() {
    const riversideGroup = new THREE.Group();
    const woodTex = textureFactory.getAncientBridgeWoodTexture();
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#553E2C'),
      roughness: 0.85,
    });

    const slateTex = textureFactory.getSlateRockTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: slateTex,
      color: new THREE.Color('#686862'),
      roughness: 0.88,
    });

    // A. Wooden riverside boardwalk platform (X: 134 to 139, Z: 24 to 65, Y = 3.8m)
    const boardwalkLength = 41;
    const boardwalk = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.35, boardwalkLength), darkWoodMat);
    boardwalk.position.set(136.5, 3.8, 44.5);
    boardwalk.castShadow = true;
    boardwalk.receiveShadow = true;
    riversideGroup.add(boardwalk);

    // Wooden pilings supporting the boardwalk over the water edge
    const pillarGeom = new THREE.CylinderGeometry(0.2, 0.24, 4.5, 8);
    for (let z = 26; z <= 64; z += 6) {
      const p = new THREE.Mesh(pillarGeom, darkWoodMat);
      p.position.set(134.2, 1.6, z);
      riversideGroup.add(p);
      this.foamPositions.push(new THREE.Vector3(134.2, 0.02, z));
    }

    // Carved wooden safety railing along the water's edge
    const railPostGeom = new THREE.BoxGeometry(0.12, 1.1, 0.12);
    for (let z = 25; z <= 65; z += 3.2) {
      const rp = new THREE.Mesh(railPostGeom, darkWoodMat);
      rp.position.set(134.1, 4.4, z);
      rp.castShadow = true;
      riversideGroup.add(rp);

      if (z + 3.2 <= 65) {
        const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 3.2), darkWoodMat);
        topBar.position.set(134.1, 4.85, z + 1.6);
        riversideGroup.add(topBar);
      }
    }

    // B. Waterside Tea Terrace (outdoor seating overlooking the river gorge and bridge)
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x6E5038, roughness: 0.8 });
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x8C6848, roughness: 0.85 });
    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xEAEAEA, roughness: 0.3 });

    const teaTableZSpots = [34, 42, 54, 60];
    teaTableZSpots.forEach((tz) => {
      // Tea Table
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.7, 12), tableMat);
      table.position.set(136.5, 4.25, tz);
      table.castShadow = true;
      riversideGroup.add(table);

      // Ceramic teapot and cups on table
      const teapot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), porcelainMat);
      teapot.position.set(136.5, 4.7, tz);
      riversideGroup.add(teapot);

      // 2 Wooden stools per table
      [-0.8, 0.8].forEach((sox) => {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.45, 8), seatMat);
        stool.position.set(136.5, 4.12, tz + sox);
        stool.castShadow = true;
        riversideGroup.add(stool);
      });
    });

    // Register boardwalk collider
    this.colliders.push({
      minX: 133.5,
      maxX: 139.5,
      minZ: 24,
      maxZ: 66,
      height: 3.8,
      surface: 'wood',
    });

    this.group.add(riversideGroup);
  }

  /**
   * 4. First City Entrance District Buildings:
   * Authentic multi-story Chinese riverfront buildings with curved roofs,
   * carved balconies, shopfronts, and distinct character.
   */
  private buildCityDistrictBuildings() {
    const bldgGroup = new THREE.Group();

    // Building 1: Golden Carp Tea House & Tavern (Jinli Chaguan)
    // Located at X: 140, Z: 36. 2.5 stories with upper viewing veranda.
    const teaHouse = this.createTraditionalBuilding({
      width: 8.5,
      depth: 7.5,
      height: 7.5,
      stories: 2,
      wallColor: '#8C2B24', // Rich terracotta vermilion
      roofColor: '#282C2E',
      hasVeranda: true,
      shopBanner: '金鲤茶馆 · JINLI TEA HOUSE',
    });
    teaHouse.position.set(141.5, 4.05, 36);
    teaHouse.rotation.y = Math.PI / 2; // Facing the plaza
    bldgGroup.add(teaHouse);

    this.colliders.push({
      minX: 137.5,
      maxX: 145.5,
      minZ: 32.5,
      maxZ: 40.0,
      height: 4.05,
      surface: 'stone',
      isSolidWall: true,
    });

    // Building 2: Silk & Jade Merchant Guildhall (Cuiyu Silk Hall)
    // Located at X: 164, Z: 36. Elegant 2-story imperial guildhall.
    const silkGuild = this.createTraditionalBuilding({
      width: 9.0,
      depth: 7.5,
      height: 7.2,
      stories: 2,
      wallColor: '#2A4D3E', // Forest Jade & Dark Cedar
      roofColor: '#282C2E',
      hasVeranda: false,
      shopBanner: '翠玉绸缎 · CUIYU SILK & JADE',
    });
    silkGuild.position.set(163.5, 4.05, 36);
    silkGuild.rotation.y = -Math.PI / 2; // Facing the plaza
    bldgGroup.add(silkGuild);

    this.colliders.push({
      minX: 159.5,
      maxX: 167.5,
      minZ: 32.5,
      maxZ: 40.0,
      height: 4.05,
      surface: 'stone',
      isSolidWall: true,
    });

    // Building 3: Herbalist & Apothecary Hall (Bencao Tang)
    // Located along east road at X: 162.5, Z: 58.
    const apothecary = this.createTraditionalBuilding({
      width: 8.0,
      depth: 7.0,
      height: 6.8,
      stories: 2,
      wallColor: '#5C4430', // Aged cedar wood
      roofColor: '#282C2E',
      hasVeranda: false,
      shopBanner: '本草医馆 · BENCAO APOTHECARY',
    });
    apothecary.position.set(162.5, 4.2, 58);
    apothecary.rotation.y = -Math.PI / 2; // Facing the avenue
    bldgGroup.add(apothecary);

    this.colliders.push({
      minX: 158.5,
      maxX: 166.5,
      minZ: 54.5,
      maxZ: 62.0,
      height: 4.2,
      surface: 'stone',
      isSolidWall: true,
    });

    // Building 4: Riverview Inn & Tower (Wanghe Lou)
    // Located along west road at X: 141.5, Z: 58. 3-story tower with multi-tiered eaves.
    const riverInn = this.createTraditionalBuilding({
      width: 8.5,
      depth: 7.5,
      height: 9.5,
      stories: 3,
      wallColor: '#783A2E',
      roofColor: '#282C2E',
      hasVeranda: true,
      shopBanner: '望河客栈 · RIVERVIEW INN',
    });
    riverInn.position.set(141.5, 4.2, 58);
    riverInn.rotation.y = Math.PI / 2; // Facing the avenue
    bldgGroup.add(riverInn);

    this.colliders.push({
      minX: 137.5,
      maxX: 145.5,
      minZ: 54.5,
      maxZ: 62.0,
      height: 4.2,
      surface: 'stone',
      isSolidWall: true,
    });

    this.group.add(bldgGroup);
  }

  /**
   * 5. Distinctive Landmarks:
   * Riverview Moon Pavilion, Ancient Bixi Stele, Notice Kiosk.
   */
  private buildLandmarksAndPavilions() {
    const landmarkGroup = new THREE.Group();

    // Landmark 1: Riverview Moon Pavilion (Wanghe Ting)
    // Hexagonal pavilion perched at X: 135.5, Z: 28 overlooking the river and the Grand Bridge!
    const moonPavilion = this.createHexagonalMoonPavilion();
    moonPavilion.position.set(135.5, 3.8, 28);
    landmarkGroup.add(moonPavilion);

    this.colliders.push({
      minX: 133.0,
      maxX: 138.0,
      minZ: 25.5,
      maxZ: 30.5,
      height: 4.0,
      surface: 'wood',
    });

    this.group.add(landmarkGroup);
  }

  /**
   * 6. Environmental Storytelling & Street Market Props:
   * Wooden handcarts, market stalls, ceramic blue-and-white jars, spice baskets.
   */
  private buildStreetMarketProps() {
    const propsGroup = new THREE.Group();
    const woodTex = textureFactory.getAncientBridgeWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#6E5038'),
      roughness: 0.85,
    });

    // A. Two-wheeled Wooden Cargo Handcart parked by the alley
    const cart = new THREE.Group();
    cart.position.set(156.2, 4.15, 46);
    cart.rotation.y = 0.35;

    // Cart bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.4), woodMat);
    bed.position.set(0, 0.65, 0);
    cart.add(bed);

    // 2 Spoked Wooden Wheels
    const wheelGeom = new THREE.TorusGeometry(0.55, 0.05, 8, 16);
    [-0.9, 0.9].forEach((wx) => {
      const wheel = new THREE.Mesh(wheelGeom, woodMat);
      wheel.position.set(wx, 0.55, 0);
      cart.add(wheel);
    });

    // Ceramic blue-and-white vases loaded on the cart
    const vaseMat = new THREE.MeshStandardMaterial({ color: 0xF0F4F8, roughness: 0.25 });
    [-0.35, 0.35].forEach((vx) => {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.65, 10), vaseMat);
      vase.position.set(vx, 1.05, 0.2);
      cart.add(vase);
    });

    propsGroup.add(cart);

    // B. Market Vendor Stall with striped canvas awning
    const stall = new THREE.Group();
    stall.position.set(162, 4.15, 48);
    stall.rotation.y = -Math.PI / 2;

    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.8, 1.1), woodMat);
    counter.position.set(0, 0.4, 0);
    stall.add(counter);

    // Sloped awning
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xA3382E, roughness: 0.7 });
    const awning = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 1.6), awningMat);
    awning.position.set(0, 1.9, 0.2);
    awning.rotation.x = 0.25;
    stall.add(awning);

    // Stacks of woven spice and dried tea baskets
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xC9A86A, roughness: 0.9 });
    for (let i = -1.0; i <= 1.0; i += 0.5) {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.25, 8), basketMat);
      basket.position.set(i, 0.92, 0);
      stall.add(basket);
    }

    propsGroup.add(stall);

    this.group.add(propsGroup);
  }

  // --- PROCEDURAL HELPER GENERATORS ---

  /**
   * Traditional Multi-story Chinese Shopfront / Guildhall Building
   */
  private createTraditionalBuilding(cfg: {
    width: number;
    depth: number;
    height: number;
    stories: number;
    wallColor: string;
    roofColor: string;
    hasVeranda: boolean;
    shopBanner: string;
  }): THREE.Group {
    const bldg = new THREE.Group();

    const wallTex = textureFactory.getChineseLacqueredRedTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      color: new THREE.Color(cfg.wallColor),
      roughness: 0.7,
    });

    const roofTex = textureFactory.getChineseRoofTileTexture();
    roofTex.repeat.set(6, 2);
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      color: new THREE.Color(cfg.roofColor),
      roughness: 0.65,
    });

    const stoneTex = textureFactory.getSlateRockTexture();
    const stoneBaseMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#686860'),
      roughness: 0.9,
    });

    const latticeTex = textureFactory.getCarvedLatticeTexture();
    const latticeMat = new THREE.MeshStandardMaterial({
      map: latticeTex,
      roughness: 0.75,
    });

    // 1. Carved Stone Podium Plinth (Taizi)
    const baseH = 0.45;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(cfg.width + 0.6, baseH, cfg.depth + 0.6), stoneBaseMat);
    plinth.position.set(0, baseH * 0.5, 0);
    plinth.castShadow = true;
    bldg.add(plinth);

    // 2. Main Building Body
    const bodyH = cfg.height - 1.8;
    const body = new THREE.Mesh(new THREE.BoxGeometry(cfg.width, bodyH, cfg.depth), wallMat);
    body.position.set(0, baseH + bodyH * 0.5, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    bldg.add(body);

    // 3. Ground Floor Open Shop Entrance & Lattice Windows
    const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x1A1412 }));
    entrance.position.set(0, baseH + 1.25, cfg.depth * 0.5 + 0.05);
    bldg.add(entrance);

    // Lattice display windows on ground floor
    [-cfg.width * 0.32, cfg.width * 0.32].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.1), latticeMat);
      win.position.set(wx, baseH + 1.4, cfg.depth * 0.5 + 0.05);
      bldg.add(win);
    });

    // 4. Upper Story Balcony & Veranda (if configured)
    if (cfg.hasVeranda) {
      const verandaH = 0.12;
      const veranda = new THREE.Mesh(new THREE.BoxGeometry(cfg.width + 0.8, verandaH, 1.8), wallMat);
      veranda.position.set(0, baseH + 3.4, cfg.depth * 0.5 + 0.8);
      veranda.castShadow = true;
      bldg.add(veranda);

      // Veranda balustrade
      const balustrade = new THREE.Mesh(new THREE.BoxGeometry(cfg.width + 0.8, 0.85, 0.08), latticeMat);
      balustrade.position.set(0, baseH + 3.85, cfg.depth * 0.5 + 1.65);
      bldg.add(balustrade);

      // Hanging red lanterns along veranda
      [-cfg.width * 0.35, 0, cfg.width * 0.35].forEach((lx) => {
        const lantern = this.createHangingSilkLantern();
        lantern.position.set(lx, baseH + 3.1, cfg.depth * 0.5 + 1.2);
        bldg.add(lantern);
      });
    }

    // 5. Inter-Story Eaves (Yaozhan) for multi-story buildings
    if (cfg.stories >= 2) {
      const midEaveGeom = this.createChineseRoof(cfg.width + 1.6, cfg.depth + 1.6, 0.85);
      const midEave = new THREE.Mesh(midEaveGeom, roofMat);
      midEave.position.set(0, baseH + 3.4, 0);
      midEave.castShadow = true;
      bldg.add(midEave);
    }

    // 6. Grand Monumental Crown Roof with upturned eaves (Feiyan)
    const crownRoofGeom = this.createChineseRoof(cfg.width + 2.2, cfg.depth + 2.2, 1.8);
    const crownRoof = new THREE.Mesh(crownRoofGeom, roofMat);
    crownRoof.position.set(0, baseH + bodyH + 0.6, 0);
    crownRoof.castShadow = true;
    bldg.add(crownRoof);

    // Golden ridge finial
    const finial = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 1.4, 8),
      new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.35, metalness: 0.7 })
    );
    finial.position.set(0, baseH + bodyH + 1.8, 0);
    bldg.add(finial);

    // 7. Traditional Calligraphy Signboard Plaque
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1A1412, roughness: 0.5 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.75, 0.12), boardMat);
    board.position.set(0, baseH + 2.8, cfg.depth * 0.5 + 0.12);
    bldg.add(board);

    const goldBorder = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.9, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.4 })
    );
    goldBorder.position.set(0, baseH + 2.8, cfg.depth * 0.5 + 0.1);
    bldg.add(goldBorder);

    return bldg;
  }

  /**
   * Landmark: Ancient Bixi Stele Monument (Dragon-Turtle bearing Memorial Tablet)
   */
  private createBixiSteleMonument(): THREE.Group {
    const stele = new THREE.Group();
    const stoneTex = textureFactory.getSlateRockTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: new THREE.Color('#5E5E58'),
      roughness: 0.88,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D4AF37'),
      roughness: 0.4,
      metalness: 0.6,
    });

    // 1. Mythical Turtle Base (Bixi shell & body)
    const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), stoneMat);
    shell.scale.set(1.4, 0.6, 1.8);
    shell.position.set(0, 0.45, 0);
    shell.castShadow = true;
    stele.add(shell);

    // Turtle head extending forward
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.7), stoneMat);
    head.position.set(0, 0.55, 1.5);
    stele.add(head);

    // 2. Tall Inscribed Stone Stele Tablet
    const tablet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.4, 0.35), stoneMat);
    tablet.position.set(0, 2.2, 0);
    tablet.castShadow = true;
    stele.add(tablet);

    // Dragon Crown Head atop the tablet (Chiwen dragon cap)
    const dragonCap = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.75, 6), goldMat);
    dragonCap.position.set(0, 4.0, 0);
    stele.add(dragonCap);

    return stele;
  }

  /**
   * Landmark: Riverview Moon Pavilion (Wanghe Ting)
   * Hexagonal open pavilion with curved eaves and panoramic water view
   */
  private createHexagonalMoonPavilion(): THREE.Group {
    const pav = new THREE.Group();
    const woodTex = textureFactory.getAncientBridgeWoodTexture();
    const redMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#8C2B24'),
      roughness: 0.65,
    });

    const roofTex = textureFactory.getChineseRoofTileTexture();
    const roofMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      color: new THREE.Color('#282C2E'),
      roughness: 0.65,
    });

    // Hexagonal stone podium floor
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 6), redMat);
    floor.position.set(0, 0.2, 0);
    pav.add(floor);

    // 6 Wooden Columns
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.8, 8), redMat);
      col.position.set(Math.cos(angle) * 2.2, 1.6, Math.sin(angle) * 2.2);
      col.castShadow = true;
      pav.add(col);
    }

    // Hexagonal curved roof
    const roofGeom = new THREE.ConeGeometry(3.6, 1.8, 6);
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(0, 3.8, 0);
    roof.castShadow = true;
    pav.add(roof);

    // Center warm lantern
    const lantern = this.createHangingSilkLantern();
    lantern.position.set(0, 2.6, 0);
    pav.add(lantern);

    return pav;
  }

  /**
   * Traditional Wooden Imperial Notice Board Kiosk
   */
  private createNoticeBoardKiosk(): THREE.Group {
    const kiosk = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C4430, roughness: 0.8 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xEAE2CF, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x2A2E30, roughness: 0.7 });

    // 2 Support Posts
    [-1.2, 1.2].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 2.8), woodMat);
      p.position.set(px, 1.4, 0);
      kiosk.add(p);
    });

    // Board surface
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.5, 0.1), woodMat);
    board.position.set(0, 1.6, 0);
    kiosk.add(board);

    // White parchment decrees pinned to board
    const decree = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.0, 0.12), paperMat);
    decree.position.set(0, 1.6, 0.02);
    kiosk.add(decree);

    // Gabled roof cap over the notice board
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.6, 4), roofMat);
    roof.position.set(0, 2.9, 0);
    roof.scale.set(1.6, 0.8, 0.8);
    kiosk.add(roof);

    return kiosk;
  }

  /**
   * Milestone Waypost Arch (directing toward future city quarters)
   */
  private createDistrictMilestoneArch(title: string): THREE.Group {
    const arch = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x7A2E24, roughness: 0.65 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.4 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x282C2E, roughness: 0.7 });

    // 2 Pillars
    [-2.2, 2.2].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.8, 8), woodMat);
      p.position.set(px, 1.9, 0);
      p.castShadow = true;
      arch.add(p);
    });

    // Crossbeam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 0.4), woodMat);
    beam.position.set(0, 3.4, 0);
    arch.add(beam);

    // Calligraphy Banner
    const plaque = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.65, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x1A1412 })
    );
    plaque.position.set(0, 3.4, 0.22);
    arch.add(plaque);

    const border = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.8, 0.08), goldMat);
    border.position.set(0, 3.4, 0.2);
    arch.add(border);

    // Flared tiled roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 0.8, 4), roofMat);
    roof.position.set(0, 4.0, 0);
    roof.scale.set(1.6, 1.0, 0.8);
    arch.add(roof);

    return arch;
  }

  /**
   * Carved Stone Planter with miniature pine
   */
  private createStonePlanter(): THREE.Group {
    const planter = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64645E, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x3E5936, roughness: 0.8, flatShading: true });

    const box = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.65, 1.2), stoneMat);
    box.position.set(0, 0.32, 0);
    box.castShadow = true;
    planter.add(box);

    // Pine shrub
    const pine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), foliageMat);
    pine.position.set(0, 0.95, 0);
    planter.add(pine);

    return planter;
  }

  /**
   * Street Wooden Lantern Post
   */
  private createStreetLanternPost(): THREE.Group {
    const post = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5C4430, roughness: 0.7 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.4, 8), woodMat);
    pole.position.set(0, 1.7, 0);
    pole.castShadow = true;
    post.add(pole);

    const lantern = this.createHangingSilkLantern();
    lantern.position.set(0, 3.1, 0.35);
    post.add(lantern);

    return post;
  }

  /**
   * Hanging Red Silk Chinese Lantern with warm point light
   */
  private createHangingSilkLantern(): THREE.Group {
    const lantern = new THREE.Group();
    const silkMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#D62828'),
      emissive: new THREE.Color('#FF5722'),
      emissiveIntensity: 0.6,
      roughness: 0.4,
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.45, 8), silkMat);
    lantern.add(body);

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.4 });
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.12, 8), goldMat);
    cap.position.set(0, 0.26, 0);
    lantern.add(cap);

    const light = new THREE.PointLight('#FF8C38', 0.9, 6.5, 1.2);
    light.position.set(0, 0, 0);
    lantern.add(light);

    return lantern;
  }

  /**
   * Helper to generate authentic Chinese curved roofs with upturned eaves (Feiyan)
   */
  private createChineseRoof(width: number, depth: number, height: number): THREE.BufferGeometry {
    const segX = 14;
    const segZ = 10;
    const geom = new THREE.PlaneGeometry(width, depth, segX, segZ);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const nx = x / (width * 0.5);
      const nz = z / (depth * 0.5);
      const r = Math.sqrt(nx * nx + nz * nz);

      let y = height * (1.0 - Math.min(1.0, r * 0.85));

      const edgeDist = Math.max(Math.abs(nx), Math.abs(nz));
      if (edgeDist > 0.62) {
        const flare = Math.pow((edgeDist - 0.62) / 0.38, 2.0);
        y += flare * height * 0.65;
      }

      pos.setY(i, y);
    }

    geom.computeVertexNormals();
    return geom;
  }
}
