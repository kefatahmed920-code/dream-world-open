/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

/**
 * Procedural Red-Brick Paver Plaza Texture
 * Authentic outdoor reddish-brown clay paving blocks arranged in radial/running bond with mortar joints
 */
function createBrickPlazaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta clay base
  ctx.fillStyle = '#8b2e1e';
  ctx.fillRect(0, 0, 512, 512);

  // Brick block rows
  const brickH = 16;
  const brickW = 32;
  const mortar = 2.5;

  for (let y = 0; y < 512; y += brickH + mortar) {
    const isShifted = Math.floor(y / (brickH + mortar)) % 2 === 1;
    const startX = isShifted ? -brickW / 2 : 0;

    for (let x = startX; x < 512 + brickW; x += brickW + mortar) {
      // Natural color variation between clay bricks
      const toneChoice = (x * 13 + y * 29) % 5;
      if (toneChoice === 0) ctx.fillStyle = '#993522';
      else if (toneChoice === 1) ctx.fillStyle = '#7a2517';
      else if (toneChoice === 2) ctx.fillStyle = '#a63e2a';
      else if (toneChoice === 3) ctx.fillStyle = '#8e2f1d';
      else ctx.fillStyle = '#b34732';

      ctx.fillRect(x, y, brickW, brickH);

      // Fine clay texture specks
      for (let p = 0; p < 8; p++) {
        const px = x + Math.random() * brickW;
        const py = y + Math.random() * brickH;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)';
        ctx.fillRect(px, py, 2, 2);
      }
    }
  }

  // Mortar lines (soft grey-buff sand grout)
  ctx.strokeStyle = '#d4c5b3';
  ctx.lineWidth = mortar;
  ctx.strokeRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Procedural Terracotta Roof Tile Texture
 */
function createRoofTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9a3412'; // Rich clay red
  ctx.fillRect(0, 0, 256, 256);

  // Curved barrel tile shadows
  for (let x = 0; x < 256; x += 16) {
    const grad = ctx.createLinearGradient(x, 0, x + 16, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0.4)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.2)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0.1)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 16, 256);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural School Sports Field Turf Texture with Crisp White Lines
 */
function createSportsTurfTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Vibrant manicured lawn with mowing stripes
  for (let y = 0; y < 512; y += 32) {
    const isLight = Math.floor(y / 32) % 2 === 0;
    ctx.fillStyle = isLight ? '#22c55e' : '#16a34a';
    ctx.fillRect(0, y, 512, 32);
  }

  // Grass noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(21, 128, 61, 0.3)';
    ctx.fillRect(x, y, 2, 3);
  }

  // White boundary line markings
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(20, 20, 472, 472);

  // Center line
  ctx.beginPath();
  ctx.moveTo(256, 20);
  ctx.lineTo(256, 492);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(256, 256, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(256, 256, 6, 0, Math.PI * 2);
  ctx.fill();

  // Goal areas
  ctx.strokeRect(20, 160, 70, 192);
  ctx.strokeRect(422, 160, 70, 192);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Wooden Deck Floorboards Texture
 */
function createWoodDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm cedar/teak timber
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 256, 256);

  // Planks
  const plankH = 16;
  for (let y = 0; y < 256; y += plankH) {
    const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 256, plankH);

    // Seam line
    ctx.fillStyle = '#3f1c07';
    ctx.fillRect(0, y + plankH - 1.5, 256, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural School Name Signboard Texture
 */
function createSchoolSignboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Royal Blue background with gold bevel
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#facc15'; // Gold border
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Dream World', 256, 42);
  ctx.fillText('High School', 256, 84);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Outdoor Speaker Mesh & Front Grill Texture
 */
function createSpeakerMeshTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark matte steel
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  // Honeycomb speaker grill holes
  ctx.fillStyle = '#020617';
  for (let y = 4; y < 256; y += 8) {
    const shift = Math.floor(y / 8) % 2 === 0 ? 0 : 4;
    for (let x = 4 + shift; x < 256; x += 8) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Complete Countryside Village Environment Module
 * Replaces the old placeholder village with the magnificent, authentic rural countryside from the reference image:
 *
 * 1. Central Circular Red-Brick Gathering Plaza (center: [188, 0.05, 40], radius: 19m)
 * 2. Giant Central Shade Banyan Tree with circular stone/brick seating bench
 * 3. Large Outdoor Music Speaker System beside the giant tree with real Web Audio music synthesis
 * 4. Large Natural Pond behind the plaza (center: [188, -0.3, -22]) with water lilies and boathouse
 * 5. Wooden Fishing Platform extending over the pond with fishing interaction
 * 6. Right-Side Elevated Rocky Hill (peaking at Y = 7.5m) with walking switchback trail and scenic peak gazebo
 * 7. Left-Side Vegetable Garden & Agricultural Area with raised furrow crop beds, tool shed, tube-well
 * 8. Two-Story "Dream World High School" building and large sports field with goalposts
 * 9. Traditional Village Houses with terracotta tile / tin roofs, courtyards, coconut palms
 * 10. Complete asphalt road network connecting seamlessly to the Kaifeng city bridge at X = 125, Z = 3.0
 */
export class CountrysideVillage {
  public group: THREE.Group;
  public obstacles: WorldObstacle[];

  // Interactive Target Positions for engine interaction checks
  public speakerPos = new THREE.Vector3(192.5, 0.2, 40);
  public pondPierPos = new THREE.Vector3(188, 0.45, -16);
  public schoolGatePos = new THREE.Vector3(158, 0.1, 68);
  public gardenShedPos = new THREE.Vector3(148, 0.1, 20);
  public hillGazeboPos = new THREE.Vector3(236, 7.5, 26);

  // Animated speaker woofers
  private wooferMeshes: THREE.Mesh[] = [];

  // Water mesh for pond animation
  private pondWaterMesh: THREE.Mesh | null = null;
  private pondWaterTex: THREE.CanvasTexture | null = null;

  constructor(parentGroup: THREE.Group, obstacles: WorldObstacle[]) {
    this.group = new THREE.Group();
    this.group.name = 'CountrysideVillage';
    parentGroup.add(this.group);
    this.obstacles = obstacles;

    this.buildRoadNetwork();
    this.buildCentralCircularPlaza();
    this.buildGiantCenterTreeAndBench();
    this.buildMusicSpeakerSystem();
    this.buildNaturalPondAndBoathouse();
    this.buildWoodenFishingPlatform();
    this.buildElevatedRockyHillAndGazebo();
    this.buildVegetableGardenAndShed();
    this.buildDreamWorldHighSchoolAndSportsField();
    this.buildVillageResidentialQuarter();
    this.buildLushVegetationAndPalms();
  }

  /**
   * 1. COMPLETE ROAD NETWORK
   * Seamlessly connects from the Kaifeng Bridge exit (X: 125, Z: 3) into the village
   * Features:
   * - Bridge approach avenue (X: 125 to 148, Z: 3)
   * - Central Plaza Orbit Ring (circular asphalt road orbiting the red-brick plaza)
   * - Outer Village Perimeter Loop road (wrapping around school, pond, hill, houses)
   * - Radial connecting roads and pedestrian zebra crosswalks
   */
  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1f242b, // Dark charcoal asphalt
      roughness: 0.82,
      metalness: 0.12,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // White concrete curbs
      roughness: 0.9,
    });
    const markingMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.85,
    });

    // Helper: Add straight road segment
    const addRoad = (x: number, z: number, w: number, l: number, rotY = 0) => {
      const roadGeo = new THREE.PlaneGeometry(w, l);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(x, 0.04, z);
      road.rotation.y = rotY;
      road.receiveShadow = true;
      this.group.add(road);

      // Curbs along edges
      [-w / 2, w / 2].forEach((offset) => {
        const curbGeo = new THREE.BoxGeometry(0.35, 0.16, l);
        const curb = new THREE.Mesh(curbGeo, curbMat);
        curb.position.set(x + Math.cos(rotY) * offset, 0.08, z - Math.sin(rotY) * offset);
        curb.rotation.y = rotY;
        curb.receiveShadow = true;
        this.group.add(curb);
      });
    };

    // A. Main Bridge Entry Avenue (Direct link from Kaifeng Bridge exit at X=125, Z=3 to X=148, Z=3)
    addRoad(136.5, 3.0, 14, 25, Math.PI / 2);

    // B. Outer Village Ring Road (Continuous encircling loop)
    // West Segment: X = 138, Z from -30 to 132 (length 162m, width 8m)
    addRoad(138, 51, 8, 162);

    // South Segment: Z = 132, X from 138 to 248 (length 110m, width 8m)
    addRoad(193, 132, 8, 110, Math.PI / 2);

    // East Segment: X = 248, Z from -30 to 132 (length 162m, width 8m)
    addRoad(248, 51, 8, 162);

    // North Segment: Z = -30, X from 138 to 248 (length 110m, width 8m)
    addRoad(193, -30, 8, 110, Math.PI / 2);

    // C. Central Plaza Orbit Ring (Asphalt ring wrapping around the red-brick plaza at [188, 40])
    // Inner radius 20.5m, outer radius 27m (width 6.5m)
    const ringGeo = new THREE.RingGeometry(20.5, 27, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, roadMat);
    ringMesh.position.set(188, 0.045, 40);
    ringMesh.receiveShadow = true;
    this.group.add(ringMesh);

    // Outer curb for circular ring
    const outerCurbGeo = new THREE.RingGeometry(26.8, 27.2, 48);
    outerCurbGeo.rotateX(-Math.PI / 2);
    const outerCurb = new THREE.Mesh(outerCurbGeo, curbMat);
    outerCurb.position.set(188, 0.08, 40);
    this.group.add(outerCurb);

    // D. Radial Connecting Roads linking Outer Ring to Central Plaza Orbit Ring
    // 1. West-Radial (from Bridge Avenue at [148, 3] curving to Plaza Ring at [168, 40])
    addRoad(158, 22, 7.5, 42, -Math.PI / 3);

    // 2. North-Radial (from Plaza Ring at [188, 13] to Pond & Fishing Platform at [188, -10])
    addRoad(188, 1.5, 7.5, 23);

    // 3. South-Radial (from Plaza Ring at [188, 67] down to High School & Football Field at [188, 110])
    addRoad(188, 88.5, 7.5, 43);

    // 4. East-Radial (from Plaza Ring at [215, 40] towards Rocky Hill & Residential Quarter at [238, 40])
    addRoad(226.5, 40, 7.5, 23, Math.PI / 2);

    // E. White Pedestrian Crosswalks (Zebra stripes at all major crossings)
    const addCrosswalk = (cx: number, cz: number, width: number, rotY = 0) => {
      const stripeCount = 6;
      for (let i = -stripeCount / 2; i <= stripeCount / 2; i++) {
        const stripeGeo = new THREE.PlaneGeometry(0.7, 3.8);
        stripeGeo.rotateX(-Math.PI / 2);
        const stripe = new THREE.Mesh(stripeGeo, markingMat);
        const offset = (i / stripeCount) * width;
        stripe.position.set(
          cx + Math.cos(rotY) * offset,
          0.05,
          cz - Math.sin(rotY) * offset,
        );
        stripe.rotation.y = rotY;
        this.group.add(stripe);
      }
    };

    addCrosswalk(148, 3, 7.0, Math.PI / 2);
    addCrosswalk(188, 14, 7.0, 0);
    addCrosswalk(188, 66, 7.0, 0);
    addCrosswalk(162, 70, 7.0, Math.PI / 2);
    addCrosswalk(214, 40, 7.0, Math.PI / 2);
  }

  /**
   * 2. CENTRAL CIRCULAR RED-BRICK GATHERING PLAZA
   * Located at [188, 0.05, 40], radius 19.5m
   * Rich reddish-brown clay brick paver pattern with decorative concentric border
   */
  private buildCentralCircularPlaza() {
    const plazaRadius = 19.5;
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(188, 0.05, 40);

    // Main circular brick floor
    const brickTex = createBrickPlazaTexture();
    const plazaGeo = new THREE.CircleGeometry(plazaRadius, 64);
    plazaGeo.rotateX(-Math.PI / 2);
    const plazaMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.85,
      metalness: 0.15,
    });
    const plazaFloor = new THREE.Mesh(plazaGeo, plazaMat);
    plazaFloor.receiveShadow = true;
    plazaGroup.add(plazaFloor);

    // Outer decorative terracotta ring border
    const borderGeo = new THREE.RingGeometry(plazaRadius - 1.2, plazaRadius, 64);
    borderGeo.rotateX(-Math.PI / 2);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Lighter terracotta accent border
      roughness: 0.8,
    });
    const borderRing = new THREE.Mesh(borderGeo, borderMat);
    borderRing.position.y = 0.005;
    borderRing.receiveShadow = true;
    plazaGroup.add(borderRing);

    // Decorative Curbs around plaza perimeter
    const curbGeo = new THREE.RingGeometry(plazaRadius, plazaRadius + 0.45, 64);
    curbGeo.rotateX(-Math.PI / 2);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = 0.01;
    plazaGroup.add(curb);

    // Plaza Streetlamps & Benches spaced around the perimeter (R = 15m)
    const decorRadius = 15.5;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dx = Math.cos(angle) * decorRadius;
      const dz = Math.sin(angle) * decorRadius;

      // Ornate Victorian-style rural park lamp post
      this.buildPlazaLamp(plazaGroup, dx, dz);

      // Benches between lamp posts
      if (i % 2 === 1) {
        const benchAngle = angle;
        const bx = Math.cos(benchAngle) * (decorRadius - 2.0);
        const bz = Math.sin(benchAngle) * (decorRadius - 2.0);
        this.buildPlazaBench(plazaGroup, bx, bz, benchAngle + Math.PI / 2);
      }
    }

    // Plaza Green Recycling Bins
    const binGeo = new THREE.CylinderGeometry(0.32, 0.28, 0.9, 12);
    const binMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    [-decorRadius + 3, decorRadius - 3].forEach((bx) => {
      const bin = new THREE.Mesh(binGeo, binMat);
      bin.position.set(bx, 0.45, 0);
      bin.castShadow = true;
      plazaGroup.add(bin);
    });

    // Flower Bed Planters in Plaza
    [-9, 9].forEach((px) => {
      [-9, 9].forEach((pz) => {
        this.buildFlowerPlanter(plazaGroup, px, pz);
      });
    });

    this.group.add(plazaGroup);
  }

  /**
   * 3. GIANT CENTRAL TREE AND CIRCULAR SEATING BENCH
   * Majestic ancient Banyan / shade tree with sprawling canopy (radius 13m),
   * thick gnarled trunk (diameter 3.6m), visible roots, and a circular stone bench
   */
  private buildGiantCenterTreeAndBench() {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(188, 0.06, 40);

    // A. Circular Stone / Brick Seating Bench wrapping the trunk
    // Inner radius 2.2m, outer radius 3.6m, height 0.65m
    const benchInnerR = 2.2;
    const benchOuterR = 3.6;
    const benchHeight = 0.65;
    const benchGeo = new THREE.CylinderGeometry(benchOuterR, benchOuterR, benchHeight, 32, 1, false);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm earthen brick / polished stone
      roughness: 0.75,
      metalness: 0.1,
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.y = benchHeight / 2;
    benchMesh.castShadow = true;
    benchMesh.receiveShadow = true;
    treeGroup.add(benchMesh);

    // Bench Top Coping / Cushion Ring
    const topCapGeo = new THREE.CylinderGeometry(benchOuterR + 0.1, benchOuterR + 0.1, 0.12, 32);
    const topCapMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const topCap = new THREE.Mesh(topCapGeo, topCapMat);
    topCap.position.y = benchHeight + 0.06;
    topCap.castShadow = true;
    treeGroup.add(topCap);

    // Soil planter bed inside the bench around tree trunk
    const soilGeo = new THREE.CylinderGeometry(benchInnerR + 0.2, benchInnerR + 0.2, benchHeight + 0.02, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.98 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = benchHeight / 2;
    treeGroup.add(soil);

    // B. Giant Gnarled Tree Trunk
    const trunkGeo = new THREE.CylinderGeometry(1.4, 2.0, 8.5, 16);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3525, // Deep weathered bark
      roughness: 0.92,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 4.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Visible roots sprawling out over the soil bed
    for (let r = 0; r < 6; r++) {
      const angle = (r / 6) * Math.PI * 2;
      const rootGeo = new THREE.CylinderGeometry(0.25, 0.45, 2.4, 8);
      const root = new THREE.Mesh(rootGeo, trunkMat);
      root.position.set(Math.cos(angle) * 1.5, 0.7, Math.sin(angle) * 1.5);
      root.rotation.z = Math.PI / 4;
      root.rotation.y = angle;
      root.castShadow = true;
      treeGroup.add(root);
    }

    // C. Large Spreading Branches
    const branchMat = trunkMat;
    const branchAngles = [0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6];
    branchAngles.forEach((bAngle, idx) => {
      const branchLength = 6.5 + (idx % 3) * 1.5;
      const branchGeo = new THREE.CylinderGeometry(0.35, 0.65, branchLength, 8);
      const branch = new THREE.Mesh(branchGeo, branchMat);
      const elev = 6.2 + (idx % 2) * 1.2;
      branch.position.set(
        Math.cos(bAngle) * 3.2,
        elev,
        Math.sin(bAngle) * 3.2,
      );
      branch.rotation.z = Math.PI / 3;
      branch.rotation.y = bAngle;
      branch.castShadow = true;
      treeGroup.add(branch);
    });

    // D. Vast Dense Natural Canopy (Rich green layered foliage clusters)
    const leavesMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush tropical emerald foliage
      roughness: 0.78,
      metalness: 0.05,
    });
    const leavesMatLight = new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Sunlit lime-green canopy tips
      roughness: 0.75,
    });

    // Central dome
    const mainDome = new THREE.Mesh(new THREE.DodecahedronGeometry(6.5, 2), leavesMat);
    mainDome.position.set(0, 11.5, 0);
    mainDome.castShadow = true;
    treeGroup.add(mainDome);

    // Secondary spreading foliage clusters (matching reference image's sprawling shade)
    const clusterOffsets = [
      { x: 5.5, y: 10.0, z: 2.5, r: 4.8 },
      { x: -5.0, y: 10.5, z: 3.5, r: 4.5 },
      { x: 3.5, y: 10.2, z: -5.5, r: 5.0 },
      { x: -4.5, y: 9.8, z: -4.2, r: 4.6 },
      { x: 0, y: 13.8, z: 0, r: 4.2 },
      { x: 7.2, y: 8.8, z: -1.0, r: 3.8 },
      { x: -7.0, y: 8.5, z: 0.5, r: 3.9 },
    ];

    clusterOffsets.forEach((cl, i) => {
      const cluster = new THREE.Mesh(
        new THREE.DodecahedronGeometry(cl.r, 1),
        i % 2 === 0 ? leavesMat : leavesMatLight,
      );
      cluster.position.set(cl.x, cl.y, cl.z);
      cluster.castShadow = true;
      treeGroup.add(cluster);
    });

    this.group.add(treeGroup);

    // Collision boundary for tree trunk & circular bench
    this.obstacles.push({
      minX: 188 - benchOuterR - 0.2,
      maxX: 188 + benchOuterR + 0.2,
      minZ: 40 - benchOuterR - 0.2,
      maxZ: 40 + benchOuterR + 0.2,
      height: 12.0,
    });
  }

  /**
   * 4. LARGE OUTDOOR MUSIC SPEAKER SYSTEM — ESSENTIAL FEATURE
   * Placed beside the giant central tree at [192.5, 0.06, 40]
   * Professional concert/event outdoor audio sound system:
   * - Rectangular heavy road-case cabinet tower (height 3.2m, width 1.4m, depth 1.1m)
   * - Dual 18-inch visible bass woofers with animated cones that physically pulse with music
   * - High-frequency horn tweeters and acoustic steel mesh grill
   * - Side amplifier rack with illuminated VU meters, volume dials, status LEDs
   * - Heavy rubberized wheels and corner steel protectors
   */
  private buildMusicSpeakerSystem() {
    const speakerGroup = new THREE.Group();
    speakerGroup.position.copy(this.speakerPos);

    // Sturdy concrete mounting plinth
    const plinthGeo = new THREE.BoxGeometry(1.8, 0.18, 1.5);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.09;
    plinth.receiveShadow = true;
    speakerGroup.add(plinth);

    // Main Speaker Cabinet (Dual stack tower)
    const cabGeo = new THREE.BoxGeometry(1.35, 3.1, 1.05);
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Matte black acoustic vinyl tour grade
      roughness: 0.55,
      metalness: 0.35,
    });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.y = 1.64;
    cab.castShadow = true;
    speakerGroup.add(cab);

    // Corner Aluminum Protectors
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    [-0.67, 0.67].forEach((cx) => {
      [-0.52, 0.52].forEach((cz) => {
        const edgeGuard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.12, 0.08), cornerMat);
        edgeGuard.position.set(cx, 1.64, cz);
        speakerGroup.add(edgeGuard);
      });
    });

    // Front Speaker Mesh Grill
    const meshTex = createSpeakerMeshTexture();
    const meshGeo = new THREE.PlaneGeometry(1.22, 2.95);
    const meshMat = new THREE.MeshStandardMaterial({
      map: meshTex,
      roughness: 0.35,
      metalness: 0.65,
    });
    const frontMesh = new THREE.Mesh(meshGeo, meshMat);
    frontMesh.position.set(0, 1.64, 0.53);
    speakerGroup.add(frontMesh);

    // Two Large 18-inch Bass Woofers (Lower and Mid)
    const wooferMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.4,
    });
    const dustCapMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.6,
    });

    [0.9, 1.85].forEach((wy) => {
      // Outer woofer rubber surround ring
      const surroundGeo = new THREE.TorusGeometry(0.38, 0.05, 16, 32);
      const surround = new THREE.Mesh(surroundGeo, wooferMat);
      surround.position.set(0, wy, 0.54);
      speakerGroup.add(surround);

      // Inner pulsating cone
      const coneGeo = new THREE.ConeGeometry(0.36, 0.14, 24);
      coneGeo.rotateX(Math.PI / 2);
      const cone = new THREE.Mesh(coneGeo, wooferMat);
      cone.position.set(0, wy, 0.51);
      speakerGroup.add(cone);
      this.wooferMeshes.push(cone);

      // Dust cap
      const capGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const cap = new THREE.Mesh(capGeo, dustCapMat);
      cap.position.set(0, wy, 0.55);
      speakerGroup.add(cap);
    });

    // Upper High-Frequency Compression Horn Tweeter
    const hornGeo = new THREE.BoxGeometry(0.85, 0.45, 0.15);
    const hornMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 });
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 2.65, 0.53);
    speakerGroup.add(horn);

    // Side Electronics & Amplifier Control Rack
    const ampPanelGeo = new THREE.BoxGeometry(0.08, 1.4, 0.7);
    const ampPanelMat = new THREE.MeshStandardMaterial({ color: 0x1e1e24, metalness: 0.8, roughness: 0.3 });
    const ampPanel = new THREE.Mesh(ampPanelGeo, ampPanelMat);
    ampPanel.position.set(0.68, 1.6, 0);
    speakerGroup.add(ampPanel);

    // Glowing Green & Amber Status LEDs on side
    const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const greenLedMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const amberLedMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    for (let l = 0; l < 4; l++) {
      const ledG = new THREE.Mesh(ledGeo, greenLedMat);
      ledG.position.set(0.73, 1.4 + l * 0.1, 0.15);
      speakerGroup.add(ledG);

      const ledA = new THREE.Mesh(ledGeo, amberLedMat);
      ledA.position.set(0.73, 1.4 + l * 0.1, -0.15);
      speakerGroup.add(ledA);
    }

    // Glowing Neon Floor Ring around speaker indicating interactivity
    const ringGeo = new THREE.RingGeometry(1.6, 1.85, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const activeRing = new THREE.Mesh(ringGeo, ringMat);
    activeRing.position.y = 0.07;
    speakerGroup.add(activeRing);

    this.group.add(speakerGroup);

    // Speaker obstacle collision
    this.obstacles.push({
      minX: this.speakerPos.x - 0.9,
      maxX: this.speakerPos.x + 0.9,
      minZ: this.speakerPos.z - 0.8,
      maxZ: this.speakerPos.z + 0.8,
      height: 3.5,
    });
  }

  /**
   * 5. LARGE NATURAL POND & SHORELINE BOATHOUSE
   * Located behind the central plaza at [188, -0.3, -22]
   * Large oval natural pond (64m wide, 44m deep) with reflective blue water,
   * sandy/rocky shoreline, floating water lilies, and a wooden stilt boathouse on the north-east shore
   */
  private buildNaturalPondAndBoathouse() {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(188, -0.3, -22);

    // A. Pond Water Basin (Oval shape)
    const waterW = 62;
    const waterD = 42;
    const waterGeo = new THREE.PlaneGeometry(waterW, waterD, 32, 24);
    waterGeo.rotateX(-Math.PI / 2);

    // Procedural ripple texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0e7490'; // Deep emerald-blue pond
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(128 + Math.sin(i) * 60, 128 + Math.cos(i) * 60, 20 + i * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    this.pondWaterTex = new THREE.CanvasTexture(canvas);
    this.pondWaterTex.wrapS = THREE.RepeatWrapping;
    this.pondWaterTex.wrapT = THREE.RepeatWrapping;
    this.pondWaterTex.repeat.set(4, 3);

    const waterMat = new THREE.MeshStandardMaterial({
      map: this.pondWaterTex,
      color: 0x38bdf8,
      roughness: 0.12,
      metalness: 0.45,
      transparent: true,
      opacity: 0.88,
    });
    this.pondWaterMesh = new THREE.Mesh(waterGeo, waterMat);
    pondGroup.add(this.pondWaterMesh);

    // B. Natural Stone Shoreline Embankment
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    for (let a = 0; a < Math.PI * 2; a += 0.22) {
      const rx = Math.cos(a) * (waterW / 2 + 0.8) + (Math.sin(a * 4) * 1.5);
      const rz = Math.sin(a) * (waterD / 2 + 0.8) + (Math.cos(a * 3) * 1.2);
      const rScale = 0.8 + Math.sin(a * 7) * 0.4;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rScale, 1), rockMat);
      rock.position.set(rx, 0.2, rz);
      rock.castShadow = true;
      rock.receiveShadow = true;
      pondGroup.add(rock);
    }

    // C. Water Lilies / Lotus Pads on pond water
    const padMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 }); // Pink lotus
    const lilyPositions = [
      { x: -18, z: -8 }, { x: -14, z: -12 }, { x: -20, z: -4 },
      { x: 16, z: 12 }, { x: 22, z: 8 }, { x: 12, z: 14 },
      { x: -8, z: 15 }, { x: 4, z: -15 },
    ];
    lilyPositions.forEach((lp) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.85, 12), padMat);
      pad.rotateX(-Math.PI / 2);
      pad.position.set(lp.x, 0.02, lp.z);
      pondGroup.add(pad);

      // Small lotus bloom
      const flower = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.35, 6), flowerMat);
      flower.position.set(lp.x, 0.18, lp.z);
      pondGroup.add(flower);
    });

    // D. Rustic Wooden Stilt Boathouse on North-East Shore (at [214, 0.5, -30])
    const boathouseGroup = new THREE.Group();
    boathouseGroup.position.set(24, 0.8, -8);

    // Stilts in water
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });
    [-2.2, 2.2].forEach((sx) => {
      [-2.2, 2.2].forEach((sz) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), stiltMat);
        stilt.position.set(sx, -0.3, sz);
        boathouseGroup.add(stilt);
      });
    });

    // Wooden Cabin
    const woodWallMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 });
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.6, 4.8), woodWallMat);
    cabin.position.y = 1.6;
    cabin.castShadow = true;
    boathouseGroup.add(cabin);

    // Gabled Roof
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
    const roofGeo = new THREE.ConeGeometry(3.8, 1.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 3.8;
    roof.castShadow = true;
    boathouseGroup.add(roof);

    pondGroup.add(boathouseGroup);
    this.group.add(pondGroup);
  }

  /**
   * 6. WOODEN FISHING PLATFORM & PIER EXTENDING OVER THE POND
   * Real accessible structure:
   * - Wooden walkway extending from South bank [188, 0, 0] North into the pond [188, 0.45, -18]
   * - Wide rectangular fishing deck (26m long, 6.5m wide) over the clear water
   * - Red-roofed covered resting gazebo pavilion at the walkway head
   * - Timber pilings driven into the pond bed, wooden railings, tackle crates, rod holders
   * - Interactive fishing prompt allowing player to fish directly in the village pond!
   */
  private buildWoodenFishingPlatform() {
    const deckMat = new THREE.MeshStandardMaterial({
      map: createWoodDeckTexture(),
      roughness: 0.82,
      metalness: 0.1,
    });
    const pilingMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });

    const pierGroup = new THREE.Group();
    pierGroup.position.set(188, 0.45, -18);

    // A. Connecting Walkway from South Bank (length 18m, width 3.6m)
    const walkwayGeo = new THREE.BoxGeometry(3.6, 0.25, 18);
    const walkway = new THREE.Mesh(walkwayGeo, deckMat);
    walkway.position.set(0, 0, 9);
    walkway.receiveShadow = true;
    walkway.castShadow = true;
    pierGroup.add(walkway);

    // Walkway Pilings into pond
    for (let z = 2; z <= 16; z += 4.5) {
      [-1.6, 1.6].forEach((x) => {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 2.0, 8), pilingMat);
        piling.position.set(x, -0.9, z);
        piling.castShadow = true;
        pierGroup.add(piling);
      });
    }

    // B. Wide T-Shaped Fishing Deck over the Water (length 26m along X, width 6.5m along Z)
    const deckGeo = new THREE.BoxGeometry(26, 0.28, 6.5);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    pierGroup.add(deck);

    // Deck Pilings
    for (let x = -11; x <= 11; x += 5.5) {
      [-2.8, 2.8].forEach((z) => {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.2, 8), pilingMat);
        piling.position.set(x, -0.95, z);
        piling.castShadow = true;
        pierGroup.add(piling);
      });
    }

    // C. Wooden Safety Handrails along the edges
    const addRailing = (x1: number, z1: number, x2: number, z2: number) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.08), railingMat);
      topRail.position.set((x1 + x2) / 2, 0.9, (z1 + z2) / 2);
      topRail.rotation.y = -angle;
      topRail.castShadow = true;
      pierGroup.add(topRail);

      // Posts
      const postCount = Math.max(2, Math.floor(len / 2.5));
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), railingMat);
        post.position.set(x1 + (x2 - x1) * t, 0.45, z1 + (z2 - z1) * t);
        post.castShadow = true;
        pierGroup.add(post);
      }
    };

    // North rail (towards open pond)
    addRailing(-13, -3.2, 13, -3.2);
    // East rail
    addRailing(13, -3.2, 13, 3.2);
    // West rail
    addRailing(-13, -3.2, -13, 3.2);
    // South rails on both sides of the walkway entrance
    addRailing(-13, 3.2, -1.8, 3.2);
    addRailing(1.8, 3.2, 13, 3.2);

    // D. Covered Red-Roofed Resting Gazebo at the Walkway Head
    const gazeboGroup = new THREE.Group();
    gazeboGroup.position.set(0, 0.14, 0);

    // 4 Corner Wooden Pillars
    [-1.8, 1.8].forEach((gx) => {
      [-1.8, 1.8].forEach((gz) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.0, 8), railingMat);
        pillar.position.set(gx, 1.5, gz);
        pillar.castShadow = true;
        gazeboGroup.add(pillar);
      });
    });

    // Pitched Red Tile Roof
    const gRoofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.7 });
    const gRoofGeo = new THREE.ConeGeometry(3.2, 1.6, 4);
    gRoofGeo.rotateY(Math.PI / 4);
    const gRoof = new THREE.Mesh(gRoofGeo, gRoofMat);
    gRoof.position.y = 3.8;
    gRoof.castShadow = true;
    gazeboGroup.add(gRoof);

    pierGroup.add(gazeboGroup);

    // E. Fishing Wooden Crates & Benches
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
    [-8, 8].forEach((cx) => {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.8), crateMat);
      crate.position.set(cx, 0.5, -2.2);
      crate.castShadow = true;
      pierGroup.add(crate);
    });

    this.group.add(pierGroup);
  }

  /**
   * 7. RIGHT-SIDE SMALL ROCKY HILL AND ELEVATED GARDEN
   * Located on the right side of the village at [236, 0, 26]
   * Features:
   * - Naturally elevated rolling ground surface peaking at Y = 7.5m
   * - Terraced granite rocks and boulders framing the slope
   * - Winding gravel switchback pedestrian trail climbing up to the peak
   * - Scenic hexagonal viewing gazebo at the peak with red tiered roof overlooking the entire village and pond
   * - Lower stepped garden terrace with pergola and flower beds
   */
  private buildElevatedRockyHillAndGazebo() {
    const hillGroup = new THREE.Group();
    hillGroup.position.set(236, 0, 26);

    // A. Terraced Granite Rock Formations & Hill Slopes
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Weathered granite stone
      roughness: 0.92,
      metalness: 0.08,
    });
    const grassSlopeMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush hillside grass
      roughness: 0.85,
    });

    // Tiered Hill Base Masses
    const tiers = [
      { r: 16, h: 2.5, y: 1.25 },
      { r: 12, h: 2.8, y: 3.5 },
      { r: 8.5, h: 2.6, y: 5.8 },
      { r: 5.5, h: 1.2, y: 7.0 },
    ];
    tiers.forEach((t) => {
      const tierMesh = new THREE.Mesh(new THREE.CylinderGeometry(t.r * 0.85, t.r, t.h, 24), grassSlopeMat);
      tierMesh.position.y = t.y;
      tierMesh.receiveShadow = true;
      hillGroup.add(tierMesh);
    });

    // Natural large boulders and rocks embedded into the hillside
    const rockCoords = [
      { x: -9, z: 6, s: 2.4, y: 2.2 },
      { x: -7, z: -8, s: 2.8, y: 3.2 },
      { x: 8, z: 7, s: 2.2, y: 2.6 },
      { x: 6, z: -7, s: 2.6, y: 3.8 },
      { x: -4, z: 9, s: 2.0, y: 4.5 },
      { x: 5, z: 4, s: 2.5, y: 5.8 },
      { x: -5, z: -3, s: 2.1, y: 6.2 },
    ];
    rockCoords.forEach((rc) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rc.s, 1), rockMat);
      rock.position.set(rc.x, rc.y, rc.z);
      rock.castShadow = true;
      rock.receiveShadow = true;
      hillGroup.add(rock);

      this.obstacles.push({
        minX: 236 + rc.x - rc.s * 0.8,
        maxX: 236 + rc.x + rc.s * 0.8,
        minZ: 26 + rc.z - rc.s * 0.8,
        maxZ: 26 + rc.z + rc.s * 0.8,
        height: rc.y + rc.s,
      });
    });

    // B. Hexagonal Oriental Viewing Gazebo at the Peak (Y = 7.5m)
    const peakGazebo = new THREE.Group();
    peakGazebo.position.set(0, 7.5, 0);

    // Stone base platform
    const baseGeo = new THREE.CylinderGeometry(3.4, 3.6, 0.4, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    peakGazebo.add(base);

    // 6 Wooden Pillars
    const gPillarMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    for (let i = 0; i < 6; i++) {
      const pAngle = (i / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), gPillarMat);
      pillar.position.set(Math.cos(pAngle) * 2.8, 1.8, Math.sin(pAngle) * 2.8);
      pillar.castShadow = true;
      peakGazebo.add(pillar);
    }

    // Hexagonal Vermilion Red Tiered Roof with Golden Finial
    const hRoofGeo = new THREE.ConeGeometry(4.2, 2.2, 6);
    const hRoofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 });
    const hRoof = new THREE.Mesh(hRoofGeo, hRoofMat);
    hRoof.position.y = 4.4;
    hRoof.castShadow = true;
    peakGazebo.add(hRoof);

    // Gold Finial Spire
    const finial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.16, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 }),
    );
    finial.position.y = 5.7;
    peakGazebo.add(finial);

    hillGroup.add(peakGazebo);

    // C. Lower Stepped Garden Terrace with Pergola (at [224, 2.0, 48])
    const pergolaGroup = new THREE.Group();
    pergolaGroup.position.set(-12, 2.0, 22);

    // Timber Pergola Beams
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.85 });
    [-2, 2].forEach((px) => {
      [-2, 2].forEach((pz) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.2), beamMat);
        col.position.set(px, 1.4, pz);
        col.castShadow = true;
        pergolaGroup.add(col);
      });
    });

    for (let b = -2.2; b <= 2.2; b += 0.8) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 0.18), beamMat);
      beam.position.set(0, 2.85, b);
      beam.castShadow = true;
      pergolaGroup.add(beam);
    }

    hillGroup.add(pergolaGroup);
    this.group.add(hillGroup);
  }

  /**
   * 8. LEFT-SIDE VEGETABLE GARDEN & AGRICULTURAL AREA
   * Located at [157, 0.05, 36] (West of Central Plaza)
   * Features:
   * - Neatly organized rectangular raised crop beds with rich soil furrows
   * - Cabbages, tomato stakes with red fruits, eggplant, chili rows, tall corn stalks
   * - Split bamboo perimeter fence with garden gate
   * - Agricultural tool shed with red-and-white striped awning
   * - Rural tube-well (টিউবওয়েল) on concrete platform with water trough
   */
  private buildVegetableGardenAndShed() {
    const gardenGroup = new THREE.Group();
    gardenGroup.position.set(157, 0.05, 36);

    // A. Rich Dark Loam Agricultural Soil Base
    const soilBaseGeo = new THREE.PlaneGeometry(24, 34);
    soilBaseGeo.rotateX(-Math.PI / 2);
    const soilBaseMat = new THREE.MeshStandardMaterial({ color: 0x271c14, roughness: 0.96 });
    const soilBase = new THREE.Mesh(soilBaseGeo, soilBaseMat);
    soilBase.receiveShadow = true;
    gardenGroup.add(soilBase);

    // B. Organized Rectangular Crop Beds with Furrows
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.95 });
    const vegGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const tomatoRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const eggplantPurpleMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.3 });

    // 4 Crop Bed Zones
    const cropBeds = [
      { x: -6, z: -8, type: 'cabbage' },
      { x: 6, z: -8, type: 'tomato' },
      { x: -6, z: 6, type: 'eggplant' },
      { x: 6, z: 6, type: 'corn' },
    ];

    cropBeds.forEach((bed) => {
      // Raised soil bed
      const bedMesh = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.22, 10), bedMat);
      bedMesh.position.set(bed.x, 0.11, bed.z);
      bedMesh.receiveShadow = true;
      gardenGroup.add(bedMesh);

      // Plants inside bed
      for (let rz = -3.8; rz <= 3.8; rz += 1.6) {
        for (let rx = -3.2; rx <= 3.2; rx += 1.6) {
          const px = bed.x + rx;
          const pz = bed.z + rz;

          if (bed.type === 'cabbage') {
            const cab = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), vegGreenMat);
            cab.position.set(px, 0.35, pz);
            cab.castShadow = true;
            gardenGroup.add(cab);
          } else if (bed.type === 'tomato') {
            // Stake with vine and red tomato
            const stake = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
              new THREE.MeshStandardMaterial({ color: 0x78350f }),
            );
            stake.position.set(px, 0.6, pz);
            gardenGroup.add(stake);

            const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 1), vegGreenMat);
            foliage.position.set(px, 0.7, pz);
            gardenGroup.add(foliage);

            const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), tomatoRedMat);
            tomato.position.set(px + 0.15, 0.6, pz);
            gardenGroup.add(tomato);
          } else if (bed.type === 'eggplant') {
            const eggPlantFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38, 1), vegGreenMat);
            eggPlantFoliage.position.set(px, 0.42, pz);
            gardenGroup.add(eggPlantFoliage);

            const fruit = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.18, 6, 8), eggplantPurpleMat);
            fruit.position.set(px + 0.12, 0.35, pz);
            gardenGroup.add(fruit);
          } else if (bed.type === 'corn') {
            const stalk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6),
              new THREE.MeshStandardMaterial({ color: 0x65a30d }),
            );
            stalk.position.set(px, 1.1, pz);
            stalk.castShadow = true;
            gardenGroup.add(stalk);
          }
        }
      }
    });

    // C. Agricultural Tool Shed with Red-and-White Striped Awning (at [-9, 0, -12])
    const shedGroup = new THREE.Group();
    shedGroup.position.set(-9, 0, -12);

    const shedWalls = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 2.8, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x9c7a5b, roughness: 0.9 }),
    );
    shedWalls.position.y = 1.4;
    shedWalls.castShadow = true;
    shedGroup.add(shedWalls);

    // Striped Awning
    const awningGeo = new THREE.BoxGeometry(4.8, 0.12, 2.2);
    awningGeo.rotateX(0.25);
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 2.6, 2.4);
    awning.castShadow = true;
    shedGroup.add(awning);

    // D. Village Hand Pump Tube-Well (টিউবওয়েল) on Concrete Platform
    const twPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.18, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }),
    );
    twPlinth.position.set(4, 0.09, -12);
    shedGroup.add(twPlinth);

    // Cast iron pump body (green)
    const pumpGeo = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 8);
    const pumpMat = new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.8, roughness: 0.3 });
    const pump = new THREE.Mesh(pumpGeo, pumpMat);
    pump.position.set(4, 0.69, -12);
    shedGroup.add(pump);

    // Pump handle
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x0f172a }),
    );
    handle.position.set(4, 1.15, -11.6);
    handle.rotation.x = -0.35;
    shedGroup.add(handle);

    gardenGroup.add(shedGroup);

    // E. Split Bamboo Perimeter Fence
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
    for (let z = -17; z <= 17; z += 2.8) {
      [-12, 12].forEach((x) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.1, 8), fenceMat);
        post.position.set(x, 0.55, z);
        gardenGroup.add(post);
      });
    }

    this.group.add(gardenGroup);

    this.obstacles.push({
      minX: 157 - 9 - 2.5,
      maxX: 157 - 9 + 2.5,
      minZ: 36 - 12 - 2.2,
      maxZ: 36 - 12 + 2.2,
      height: 3.2,
    });
  }

  /**
   * 9. DREAM WORLD HIGH SCHOOL & LARGE SPORTS FIELD
   * Located at [158, 0.05, 96] (Lower-Left Section)
   * Features:
   * - Two-story long rectangular school building (32m length, 9m width, 7.2m height)
   * - Modern rural school architecture: blue exterior pillars, cream facade, classroom windows
   * - Second-floor open corridor / veranda with decorative balustrades
   * - Prominent main entrance signboard: "DREAM WORLD HIGH SCHOOL"
   * - Perimeter boundary wall with entrance gate pillars
   * - Large manicured sports / football field (34m x 22m) with white field markings
   * - Regulation white tubular steel football goalposts at both ends
   */
  private buildDreamWorldHighSchoolAndSportsField() {
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(158, 0.05, 96);

    // A. Two-Story School Building (at [0, 0, -18])
    const bldgGroup = new THREE.Group();
    bldgGroup.position.set(0, 0, -18);

    const bldgLength = 32;
    const bldgWidth = 9.2;
    const bldgHeight = 7.4;

    // Main Building Plaster Structure (Cream / Warm Off-White)
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 });
    const frameBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 }); // Royal blue trim
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.8,
    });

    // 1st Floor
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(bldgLength, 3.6, bldgWidth), wallMat);
    f1.position.y = 1.8;
    f1.castShadow = true;
    f1.receiveShadow = true;
    bldgGroup.add(f1);

    // Intermediate Slab / Floor Beam
    const slabMat = frameBlueMat;
    const midSlab = new THREE.Mesh(new THREE.BoxGeometry(bldgLength + 0.4, 0.35, bldgWidth + 0.4), slabMat);
    midSlab.position.y = 3.75;
    bldgGroup.add(midSlab);

    // 2nd Floor
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(bldgLength, 3.4, bldgWidth), wallMat);
    f2.position.y = 5.6;
    f2.castShadow = true;
    f2.receiveShadow = true;
    bldgGroup.add(f2);

    // Roof Parapet / Cornice
    const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(bldgLength + 0.6, 0.4, bldgWidth + 0.6), frameBlueMat);
    roofCornice.position.y = 7.5;
    roofCornice.castShadow = true;
    bldgGroup.add(roofCornice);

    // Exterior Architectural Blue Structural Pillars across front facade
    for (let x = -bldgLength / 2 + 2; x <= bldgLength / 2 - 2; x += 4.5) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.55, bldgHeight, 0.35), frameBlueMat);
      col.position.set(x, bldgHeight / 2, bldgWidth / 2 + 0.15);
      col.castShadow = true;
      bldgGroup.add(col);
    }

    // Classroom Windows along front facade on both floors
    for (let x = -bldgLength / 2 + 4.25; x <= bldgLength / 2 - 4.25; x += 4.5) {
      // 1st floor window
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), glassMat);
      win1.position.set(x, 2.0, bldgWidth / 2 + 0.05);
      bldgGroup.add(win1);

      // 2nd floor window
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.1), glassMat);
      win2.position.set(x, 5.5, bldgWidth / 2 + 0.05);
      bldgGroup.add(win2);
    }

    // Main Entrance Portico & Signboard
    const porticoGeo = new THREE.BoxGeometry(8.5, 0.3, 3.2);
    const portico = new THREE.Mesh(porticoGeo, frameBlueMat);
    portico.position.set(0, 3.8, bldgWidth / 2 + 1.6);
    portico.castShadow = true;
    bldgGroup.add(portico);

    // Large Signboard: "Dream World High School"
    const signTex = createSchoolSignboardTexture();
    const signGeo = new THREE.PlaneGeometry(7.2, 1.8);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex });
    const schoolSign = new THREE.Mesh(signGeo, signMat);
    schoolSign.position.set(0, 4.8, bldgWidth / 2 + 0.22);
    bldgGroup.add(schoolSign);

    schoolGroup.add(bldgGroup);

    // B. Large Green Sports / Football Field (in front of school)
    // Dimensions: 34m x 22m
    const fieldTex = createSportsTurfTexture();
    const fieldGeo = new THREE.PlaneGeometry(34, 22);
    fieldGeo.rotateX(-Math.PI / 2);
    const fieldMat = new THREE.MeshStandardMaterial({
      map: fieldTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const footballField = new THREE.Mesh(fieldGeo, fieldMat);
    footballField.position.set(0, 0.045, 6);
    footballField.receiveShadow = true;
    schoolGroup.add(footballField);

    // Regulation Football Goalposts at East and West ends of the field
    const addGoalpost = (gx: number) => {
      const gpMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 });
      const postH = 2.4;
      const postW = 5.2;

      // Two vertical posts
      [-postW / 2, postW / 2].forEach((gz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, postH, 12), gpMat);
        post.position.set(gx, postH / 2, 6 + gz);
        post.castShadow = true;
        schoolGroup.add(post);
      });

      // Crossbar
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, postW, 12), gpMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(gx, postH, 6);
      crossbar.castShadow = true;
      schoolGroup.add(crossbar);
    };

    addGoalpost(-16.5);
    addGoalpost(16.5);

    // C. Campus Boundary Wall & Front Gate
    const wallPillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

    // Perimeter front fence along Z = -6 (between school portico and field)
    for (let x = -19; x <= 19; x += 3.8) {
      if (Math.abs(x) < 4) continue; // Entrance gap
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), wallPillarMat);
      p.position.set(x, 0.6, -10);
      schoolGroup.add(p);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.08), railingMat);
      rail.position.set(x + 1.8, 0.6, -10);
      schoolGroup.add(rail);
    }

    this.group.add(schoolGroup);

    // Obstacle collision for school building
    this.obstacles.push({
      minX: 158 - bldgLength / 2 - 0.5,
      maxX: 158 + bldgLength / 2 + 0.5,
      minZ: 96 - 18 - bldgWidth / 2 - 0.5,
      maxZ: 96 - 18 + bldgWidth / 2 + 0.5,
      height: bldgHeight + 1.0,
    });
  }

  /**
   * 10. TRADITIONAL VILLAGE HOUSES & RESIDENTIAL QUARTER
   * Located in the Lower-Right Section [216, 0.05, 96]
   * Diverse rural homesteads inspired by rural Bangladesh:
   * - House A: Red terracotta tiled hip roof, cream walls, shaded veranda
   * - House B: Corrugated galvanized tin roof (টিনের ঘর), earthen clay walls
   * - House C: Rural cottage with private courtyard, fruit trees, picket fence
   */
  private buildVillageResidentialQuarter() {
    const resGroup = new THREE.Group();
    resGroup.position.set(216, 0.05, 96);

    const tileRoofTex = createRoofTileTexture();

    // House A (North-East Homestead at [-8, 0, -10])
    this.buildResidentialHouse(
      resGroup,
      -8,
      -10,
      10.5,
      7.5,
      3.8,
      0xf1f5f9, // Clean whitewashed plaster
      tileRoofTex,
      0.2,
      true, // Front veranda
    );

    // House B (South-East Tin Homestead at [10, 0, -6])
    this.buildResidentialHouse(
      resGroup,
      10,
      -6,
      9.0,
      6.8,
      3.5,
      0x9c7a5b, // Warm earthen clay walls
      null, // Tin roof
      -0.15,
      false,
    );

    // House C (Far South Homestead at [0, 0, 16])
    this.buildResidentialHouse(
      resGroup,
      0,
      16,
      11.0,
      8.0,
      4.0,
      0xd97706, // Warm terracotta plaster
      tileRoofTex,
      0.1,
      true,
    );

    this.group.add(resGroup);
  }

  private buildResidentialHouse(
    parent: THREE.Group,
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    wallColor: number,
    roofTex: THREE.CanvasTexture | null,
    rotY = 0,
    hasVeranda = false,
  ) {
    const house = new THREE.Group();
    house.position.set(x, 0, z);
    house.rotation.y = rotY;

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    walls.position.y = h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    // Roof (Hip / Gable)
    const roofH = 2.4;
    const roofMat = roofTex
      ? new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.75 })
      : new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.4 }); // Tin
    const roofGeo = new THREE.ConeGeometry(Math.hypot(w, d) * 0.58, roofH, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + roofH / 2;
    roof.castShadow = true;
    house.add(roof);

    // Veranda & Wooden Pillars
    if (hasVeranda) {
      const vGeo = new THREE.BoxGeometry(w + 0.4, 0.2, 2.2);
      const vPlinth = new THREE.Mesh(vGeo, wallMat);
      vPlinth.position.set(0, 0.1, d / 2 + 1.1);
      house.add(vPlinth);

      const pMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      [-w / 2 + 0.5, w / 2 - 0.5].forEach((px) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, h - 0.6, 8), pMat);
        pillar.position.set(px, (h - 0.6) / 2 + 0.2, d / 2 + 1.8);
        pillar.castShadow = true;
        house.add(pillar);
      });
    }

    // Windows & Door
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.1), doorMat);
    door.position.set(0, 1.1, d / 2 + 0.06);
    house.add(door);

    parent.add(house);

    // Obstacle
    this.obstacles.push({
      minX: 216 + x - w / 2 - 0.5,
      maxX: 216 + x + w / 2 + 0.5,
      minZ: 96 + z - d / 2 - 0.5,
      maxZ: 96 + z + d / 2 + 1.5,
      height: h + roofH,
    });
  }

  /**
   * 11. DENSE LUSH TROPICAL VEGETATION & PALM TREES
   * Coconut palms, mango trees, banana trees, and flowering shrubs
   * strategically placed around roads, pond shores, courtyards, and gardens
   */
  private buildLushVegetationAndPalms() {
    // A. Coconut Palm Trees along pond banks and roads
    const palmPositions = [
      { x: 154, z: -10 }, { x: 162, z: -28 }, { x: 212, z: -4 },
      { x: 224, z: -18 }, { x: 142, z: 25 }, { x: 144, z: 75 },
      { x: 202, z: 72 }, { x: 236, z: 80 }, { x: 208, z: 122 },
      { x: 234, z: 124 }, { x: 172, z: 128 },
    ];
    palmPositions.forEach((pos) => {
      this.buildCoconutPalm(pos.x, pos.z);
    });

    // B. Fruit / Shade Trees around perimeter and school
    const shadeTreePositions = [
      { x: 148, z: 5 }, { x: 142, z: 110 }, { x: 176, z: 76 },
      { x: 198, z: 18 }, { x: 220, z: 62 }, { x: 242, z: 10 },
    ];
    shadeTreePositions.forEach((pos) => {
      this.buildShadeTree(pos.x, pos.z);
    });
  }

  private buildCoconutPalm(x: number, z: number) {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0.05, z);

    // Slender curved trunk
    const trunkH = 8.5 + Math.random() * 2.0;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, trunkH, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x785640, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.18;
    trunk.castShadow = true;
    palmGroup.add(trunk);

    // Palm Fronds
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.7, 4.2, 4), frondMat);
      frond.rotateX(Math.PI / 3.2);
      frond.rotateY(angle);
      frond.position.set(0, trunkH, 0);
      frond.castShadow = true;
      palmGroup.add(frond);
    }

    this.group.add(palmGroup);
  }

  private buildShadeTree(x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.05, z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.45, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 }),
    );
    trunk.position.y = 2.1;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const canopy = new THREE.Mesh(
      new THREE.DodecahedronGeometry(3.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 }),
    );
    canopy.position.y = 5.0;
    canopy.castShadow = true;
    treeGroup.add(canopy);

    this.group.add(treeGroup);
  }

  // --- PLAZA DECOR HELPERS ---
  private buildPlazaLamp(parent: THREE.Group, x: number, z: number) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.8, 8), postMat);
    post.position.y = 1.9;
    post.castShadow = true;
    lamp.add(post);

    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.6 }),
    );
    lantern.position.y = 3.9;
    lamp.add(lantern);

    parent.add(lamp);
  }

  private buildPlazaBench(parent: THREE.Group, x: number, z: number, rotY: number) {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.65), woodMat);
    seat.position.y = 0.45;
    seat.castShadow = true;
    bench.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.08), woodMat);
    back.position.set(0, 0.72, -0.28);
    back.castShadow = true;
    bench.add(back);

    parent.add(bench);
  }

  private buildFlowerPlanter(parent: THREE.Group, x: number, z: number) {
    const planter = new THREE.Group();
    planter.position.set(x, 0, z);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.55, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }),
    );
    box.position.y = 0.275;
    box.castShadow = true;
    planter.add(box);

    // Flowers
    const flowers = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.0, 1),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.7 }), // Bright pink blooms
    );
    flowers.position.y = 0.85;
    planter.add(flowers);

    parent.add(planter);
  }

  /**
   * Continuous Analytical Height Function for Countryside Village
   * Evaluates exact y-elevation for player, vehicles, NPCs:
   * - Wooden Fishing Pier & Walkway: Y = 0.45m
   * - Elevated Rocky Hill: smooth elevation up to Y = 7.5m
   * - Ground, Plaza, and Roads: Y = 0.05m
   */
  public getVillageElevation(x: number, z: number, currentY?: number): number | null {
    // 1. Wooden Fishing Pier & Walkway over Pond
    // Walkway: X in [186, 190], Z in [0, -18]
    if (x >= 186.2 && x <= 189.8 && z <= 0 && z >= -18.2) {
      return 0.45;
    }
    // Wide Fishing Platform Deck: X in [175, 201], Z in [-21.5, -14.8]
    if (x >= 175.0 && x <= 201.0 && z >= -21.5 && z <= -14.8) {
      return 0.45;
    }

    // 2. Elevated Rocky Hill (Center: [236, 26], Radius ~18m)
    const hillDist = Math.hypot(x - 236, z - 26);
    if (hillDist < 18.0) {
      // Smooth bell-shaped hill curve: Y = 0.05 + 7.45 * (1 - (dist / 18)^2)^1.5
      const norm = hillDist / 18.0;
      const factor = Math.max(0, 1 - norm * norm);
      const hillY = 0.05 + 7.45 * Math.pow(factor, 1.4);
      return hillY;
    }

    // 3. Central Red-Brick Plaza & Village Roads
    if (x >= 135 && x <= 252 && z >= -35 && z <= 135) {
      return 0.05;
    }

    return null;
  }

  /**
   * Per-Frame Update (Animate Speaker Woofers and Pond Water)
   */
  public update(delta: number, isMusicPlaying: boolean) {
    // Pulse speaker woofers when music is playing
    if (this.wooferMeshes.length > 0) {
      const time = performance.now() * 0.008;
      const pulse = isMusicPlaying ? 1.0 + Math.sin(time * 3.5) * 0.12 : 1.0;
      this.wooferMeshes.forEach((cone) => {
        cone.scale.set(pulse, pulse, pulse);
      });
    }

    // Gentle ripple offset on pond water
    if (this.pondWaterTex) {
      this.pondWaterTex.offset.x += delta * 0.02;
      this.pondWaterTex.offset.y += delta * 0.015;
    }
  }
}
