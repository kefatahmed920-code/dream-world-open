/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

/**
 * Procedural Red-Brick Paver Plaza Texture
 * Authentic outdoor reddish-brown clay paving blocks with individual brick variations and mortar lines
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

  // Grout mortar
  ctx.strokeStyle = '#d4c5b3';
  ctx.lineWidth = mortar;
  ctx.strokeRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Procedural Realistic Tree Bark Texture (Weathered Banyan / Teak)
 */
function createOrganicTreeBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3a271d'; // Deep timber
  ctx.fillRect(0, 0, 256, 512);

  // Vertical bark furrows and ridges
  for (let x = 0; x < 256; x += 6) {
    const luma = Math.sin(x * 0.15) * 20 + (Math.random() - 0.5) * 15;
    ctx.strokeStyle = `rgba(${50 + luma}, ${35 + luma * 0.7}, ${25 + luma * 0.5}, 0.75)`;
    ctx.lineWidth = 3 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y < 512; y += 16) {
      ctx.lineTo(x + Math.sin(y * 0.05 + x) * 3, y);
    }
    ctx.stroke();
  }

  // Moss and lichen patches
  for (let i = 0; i < 40; i++) {
    const mx = Math.random() * 256;
    const my = Math.random() * 512;
    ctx.fillStyle = 'rgba(74, 110, 50, 0.35)';
    ctx.beginPath();
    ctx.arc(mx, my, 4 + Math.random() * 12, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Coconut Palm Bark Texture (Segmented Rings)
 */
function createPalmTrunkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e513e';
  ctx.fillRect(0, 0, 128, 512);

  // Horizontal ring notches
  for (let y = 0; y < 512; y += 14) {
    ctx.fillStyle = '#423023';
    ctx.fillRect(0, y, 128, 3.5);
    ctx.fillStyle = '#8f6c53';
    ctx.fillRect(0, y + 3.5, 128, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
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

  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 0, 256, 256);

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
 * Procedural Weathered Tin Roof Texture (ঢেউখেলানো টিনের ছাদ)
 */
function createTinRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#64748b'; // Weathered zinc galvanized steel
  ctx.fillRect(0, 0, 256, 256);

  // Corrugation ridges
  for (let x = 0; x < 256; x += 12) {
    const grad = ctx.createLinearGradient(x, 0, x + 12, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.3)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
    grad.addColorStop(1, 'rgba(255,255,255,0.15)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, 12, 256);
  }

  // Rust stains
  for (let i = 0; i < 25; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rad = 4 + Math.random() * 14;
    const rustGrad = ctx.createRadialGradient(rx, ry, 1, rx, ry, rad);
    rustGrad.addColorStop(0, 'rgba(180, 83, 9, 0.55)');
    rustGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');
    ctx.fillStyle = rustGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Sports Turf Lawn Texture with Crisp White Lines
 */
function createSportsTurfTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  for (let y = 0; y < 512; y += 32) {
    const isLight = Math.floor(y / 32) % 2 === 0;
    ctx.fillStyle = isLight ? '#22c55e' : '#16a34a';
    ctx.fillRect(0, y, 512, 32);
  }

  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(74, 222, 128, 0.35)' : 'rgba(21, 128, 61, 0.35)';
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

  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 0, 256, 256);

  const plankH = 16;
  for (let y = 0; y < 256; y += plankH) {
    const grad = ctx.createLinearGradient(0, y, 0, y + plankH);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 256, plankH);

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
 * Procedural School Name Signboard Texture: "DREAM WORLD HIGH SCHOOL"
 */
function createSchoolSignboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Royal Blue background with gold bevel
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#facc15';
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

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

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
 * Master Countryside Village Environment
 * Replaces the old village with high-fidelity, photo-realistic architecture matching the reference image:
 *
 * 1. EXPANDED Central Circular Red-Brick Plaza (radius: 26m at [188, 0.05, 40])
 * 2. Majestic Ancient Banyan Shade Tree with gnarled bark, aerial roots, and circular stone bench
 * 3. Large Outdoor Concert Speaker System with dual woofers, mesh, VU meter, and sound controls
 * 4. EXPANDED Natural Lake / Pond (width: 86m, depth: 56m at [188, -0.3, -28]) with reflective water and stilt boathouse
 * 5. Wooden Pier & Fishing Platform extending over the pond with red-roofed pagoda gazebo
 * 6. High-Visibility "Dream World High School" placed right on the front road corner with large signboard and regulation football field
 * 7. Authentic Farmer's Homestead (কৃষকের বাড়ি) with tiled two-story house, tin cottage, haystacks, and vegetable garden
 * 8. Elevated Rocky Hill (Y = 7.5m) with walking trail and hilltop oriental viewing gazebo
 * 9. Traditional Village Residential Houses with verandas, courtyards, and gardens
 * 10. REALISTIC HIGH-FIDELITY TREES (Coconut palms with fronds & coconuts, organic leafy banyan, mango trees, banana plants)
 * 11. Complete connected asphalt road network with white stripes, crosswalks, and bridge approach
 */
export class CountrysideVillage {
  public group: THREE.Group;
  public obstacles: WorldObstacle[];

  // Interactive Target Positions for engine interaction checks
  public speakerPos = new THREE.Vector3(194.0, 0.2, 40);
  public pondPierPos = new THREE.Vector3(188, 0.45, -22);
  public schoolGatePos = new THREE.Vector3(158, 0.1, 56);
  public gardenShedPos = new THREE.Vector3(148, 0.1, 14);
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
    this.buildDreamWorldHighSchoolAndSportsField();
    this.buildFarmerHomesteadAndGarden();
    this.buildElevatedRockyHillAndGazebo();
    this.buildVillageResidentialQuarter();
    this.buildRealisticTreesAndVegetation();
  }

  /**
   * 1. COMPLETE ROAD NETWORK
   * Seamlessly connects from the Kaifeng Bridge exit (X: 125, Z: 3) into the village
   */
  private buildRoadNetwork() {
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1a1f26, // Dark charcoal asphalt
      roughness: 0.82,
      metalness: 0.12,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.9,
    });
    const markingMat = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.88,
    });

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

    // B. Outer Village Ring Road (Continuous perimeter loop)
    addRoad(136, 45, 8, 170); // West Segment: X = 136, Z from -40 to 130
    addRoad(195, 130, 8, 126, Math.PI / 2); // South Segment: Z = 130, X from 136 to 254
    addRoad(254, 45, 8, 170); // East Segment: X = 254, Z from -40 to 130
    addRoad(195, -40, 8, 126, Math.PI / 2); // North Segment: Z = -40, X from 136 to 254

    // C. Central Plaza Orbit Ring (Circulating around the enlarged red-brick plaza, radius 27m to 34m)
    const ringGeo = new THREE.RingGeometry(26.8, 33.5, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, roadMat);
    ringMesh.position.set(188, 0.045, 40);
    ringMesh.receiveShadow = true;
    this.group.add(ringMesh);

    // Outer curb for circular ring
    const outerCurbGeo = new THREE.RingGeometry(33.3, 33.7, 64);
    outerCurbGeo.rotateX(-Math.PI / 2);
    const outerCurb = new THREE.Mesh(outerCurbGeo, curbMat);
    outerCurb.position.set(188, 0.08, 40);
    this.group.add(outerCurb);

    // D. Radial Connecting Roads
    // West approach from Bridge Avenue into Plaza Orbit
    addRoad(154, 21, 7.5, 38, -Math.PI / 3.5);
    // North approach to Pond Pier
    addRoad(188, 3.0, 7.5, 22);
    // South approach to School & Football Field
    addRoad(188, 77.0, 7.5, 24);
    // East approach to Hill
    addRoad(224, 40, 7.5, 18, Math.PI / 2);

    // E. White Pedestrian Crosswalks (Zebra stripes)
    const addCrosswalk = (cx: number, cz: number, width: number, rotY = 0) => {
      const stripeCount = 7;
      for (let i = -stripeCount / 2; i <= stripeCount / 2; i++) {
        const stripeGeo = new THREE.PlaneGeometry(0.75, 4.0);
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
    addCrosswalk(188, 11, 7.0, 0);
    addCrosswalk(188, 69, 7.0, 0);
    addCrosswalk(158, 48, 7.0, Math.PI / 2);
    addCrosswalk(218, 40, 7.0, Math.PI / 2);
  }

  /**
   * 2. EXPANDED CENTRAL CIRCULAR RED-BRICK GATHERING PLAZA
   * Enormous spacious public gathering plaza (radius 26m, diameter 52m!)
   * Textured with detailed clay brick paver herringbone texture, concentric terracotta border
   */
  private buildCentralCircularPlaza() {
    const plazaRadius = 26.0;
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

    // Outer decorative terracotta accent border ring
    const borderGeo = new THREE.RingGeometry(plazaRadius - 1.5, plazaRadius, 64);
    borderGeo.rotateX(-Math.PI / 2);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 });
    const borderRing = new THREE.Mesh(borderGeo, borderMat);
    borderRing.position.y = 0.005;
    borderRing.receiveShadow = true;
    plazaGroup.add(borderRing);

    // Polished stone curb ring
    const curbGeo = new THREE.RingGeometry(plazaRadius, plazaRadius + 0.45, 64);
    curbGeo.rotateX(-Math.PI / 2);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = 0.01;
    plazaGroup.add(curb);

    // 12 Ornate Victorian Streetlamps spaced symmetrically around the plaza (R = 21m)
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const lx = Math.cos(angle) * 21.0;
      const lz = Math.sin(angle) * 21.0;
      this.buildPlazaLamp(plazaGroup, lx, lz);

      // Teak Wood Park Benches between streetlamps
      if (i % 2 === 0) {
        const bx = Math.cos(angle + Math.PI / 12) * 19.5;
        const bz = Math.sin(angle + Math.PI / 12) * 19.5;
        this.buildPlazaBench(plazaGroup, bx, bz, angle + Math.PI / 12 + Math.PI / 2);
      }
    }

    // Plaza Flower Planter Urns
    const planterAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
    planterAngles.forEach((a) => {
      const px = Math.cos(a) * 12.0;
      const pz = Math.sin(a) * 12.0;
      this.buildFlowerPlanter(plazaGroup, px, pz);
    });

    this.group.add(plazaGroup);
  }

  /**
   * 3. REALISTIC GIANT SHADE BANYAN TREE & CIRCULAR BENCH
   * Centered at [188, 0.06, 40]
   * Highly realistic organic construction:
   * - Thick gnarled trunk (diameter 4.2m) with natural bark texture
   * - 8 Hanging aerial root columns (ঝুরি) reaching down to the ground
   * - Spreading secondary branches
   * - Multi-lobed lush foliage canopy with organic leaf variation (reaching 30m diameter)
   * - Circular carved stone bench with wooden seating ring surrounding the trunk
   */
  private buildGiantCenterTreeAndBench() {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(188, 0.06, 40);

    const barkTex = createOrganicTreeBarkTexture();
    const barkMat = new THREE.MeshStandardMaterial({
      map: barkTex,
      roughness: 0.92,
      metalness: 0.05,
    });

    // A. Circular Stone / Brick Seating Bench wrapping the trunk
    // Inner radius 2.6m, outer radius 4.2m, height 0.65m
    const benchInnerR = 2.6;
    const benchOuterR = 4.2;
    const benchHeight = 0.65;
    const benchGeo = new THREE.CylinderGeometry(benchOuterR, benchOuterR, benchHeight, 32, 1, false);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Warm terracotta brick & polished granite
      roughness: 0.75,
      metalness: 0.1,
    });
    const benchMesh = new THREE.Mesh(benchGeo, benchMat);
    benchMesh.position.y = benchHeight / 2;
    benchMesh.castShadow = true;
    benchMesh.receiveShadow = true;
    treeGroup.add(benchMesh);

    // Bench Top Polished Teak Coping
    const topCapGeo = new THREE.CylinderGeometry(benchOuterR + 0.12, benchOuterR + 0.12, 0.12, 32);
    const topCapMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
    const topCap = new THREE.Mesh(topCapGeo, topCapMat);
    topCap.position.y = benchHeight + 0.06;
    topCap.castShadow = true;
    treeGroup.add(topCap);

    // Rich Dark Soil Planter Bed inside bench around tree trunk
    const soilGeo = new THREE.CylinderGeometry(benchInnerR + 0.2, benchInnerR + 0.2, benchHeight + 0.02, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x271c14, roughness: 0.98 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = benchHeight / 2;
    treeGroup.add(soil);

    // B. Giant Gnarled Main Trunk
    const trunkGeo = new THREE.CylinderGeometry(1.6, 2.3, 9.5, 16);
    const trunk = new THREE.Mesh(trunkGeo, barkMat);
    trunk.position.y = 4.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // C. 8 Hanging Aerial Roots (ঝুরি) reaching down to soil bed
    for (let r = 0; r < 8; r++) {
      const angle = (r / 8) * Math.PI * 2;
      const rootGeo = new THREE.CylinderGeometry(0.18, 0.28, 5.5, 8);
      const root = new THREE.Mesh(rootGeo, barkMat);
      root.position.set(Math.cos(angle) * 1.8, 2.75, Math.sin(angle) * 1.8);
      root.rotation.z = (Math.random() - 0.5) * 0.15;
      root.castShadow = true;
      treeGroup.add(root);
    }

    // D. 10 Spreading Giant Branches
    for (let b = 0; b < 10; b++) {
      const bAngle = (b / 10) * Math.PI * 2;
      const bLen = 8.5 + (b % 3) * 1.8;
      const branchGeo = new THREE.CylinderGeometry(0.35, 0.65, bLen, 8);
      const branch = new THREE.Mesh(branchGeo, barkMat);
      const elev = 6.8 + (b % 2) * 1.5;
      branch.position.set(Math.cos(bAngle) * 3.8, elev, Math.sin(bAngle) * 3.8);
      branch.rotation.z = Math.PI / 3.2;
      branch.rotation.y = bAngle;
      branch.castShadow = true;
      treeGroup.add(branch);
    }

    // E. Vast Dense Natural Canopy (Rich organic foliage lobes)
    const leavesDark = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 }); // Forest green
    const leavesMid = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 }); // Emerald
    const leavesLight = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.72 }); // Sunlit lime

    // Central high canopy dome
    const mainDome = new THREE.Mesh(new THREE.DodecahedronGeometry(8.2, 2), leavesDark);
    mainDome.position.set(0, 13.5, 0);
    mainDome.castShadow = true;
    treeGroup.add(mainDome);

    // Multi-lobed sprawling foliage clusters (reaching 30m diameter!)
    const canopyLobes = [
      { x: 7.5, y: 11.5, z: 3.5, r: 6.2, mat: leavesMid },
      { x: -7.0, y: 12.0, z: 4.5, r: 5.8, mat: leavesLight },
      { x: 4.5, y: 11.8, z: -7.5, r: 6.5, mat: leavesDark },
      { x: -6.5, y: 11.2, z: -6.0, r: 6.0, mat: leavesMid },
      { x: 10.0, y: 9.8, z: -1.5, r: 5.2, mat: leavesLight },
      { x: -9.5, y: 9.5, z: 1.0, r: 5.4, mat: leavesDark },
      { x: 1.5, y: 10.5, z: 9.5, r: 5.6, mat: leavesMid },
      { x: -2.0, y: 10.2, z: -9.8, r: 5.8, mat: leavesLight },
      { x: 0, y: 15.5, z: 0, r: 5.5, mat: leavesMid },
    ];

    canopyLobes.forEach((l) => {
      const lobe = new THREE.Mesh(new THREE.DodecahedronGeometry(l.r, 2), l.mat);
      lobe.position.set(l.x, l.y, l.z);
      lobe.castShadow = true;
      treeGroup.add(lobe);
    });

    this.group.add(treeGroup);

    // Tree collision obstacle
    this.obstacles.push({
      minX: 188 - benchOuterR - 0.3,
      maxX: 188 + benchOuterR + 0.3,
      minZ: 40 - benchOuterR - 0.3,
      maxZ: 40 + benchOuterR + 0.3,
      height: 14.0,
    });
  }

  /**
   * 4. LARGE OUTDOOR CONCERT SPEAKER SYSTEM
   * Positioned beside the giant tree at [194.0, 0.05, 40]
   * Dual 18-inch visible bass woofers with animated cones that physically pulse with music
   */
  private buildMusicSpeakerSystem() {
    const speakerGroup = new THREE.Group();
    speakerGroup.position.copy(this.speakerPos);

    // Plinth base
    const plinthGeo = new THREE.BoxGeometry(2.0, 0.22, 1.6);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.11;
    plinth.receiveShadow = true;
    speakerGroup.add(plinth);

    // Main Speaker Cabinet (Dual stack tower)
    const cabGeo = new THREE.BoxGeometry(1.45, 3.4, 1.15);
    const cabMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Matte black acoustic vinyl
      roughness: 0.55,
      metalness: 0.35,
    });
    const cab = new THREE.Mesh(cabGeo, cabMat);
    cab.position.y = 1.8;
    cab.castShadow = true;
    speakerGroup.add(cab);

    // Steel Edge Corner Protectors
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    [-0.72, 0.72].forEach((cx) => {
      [-0.57, 0.57].forEach((cz) => {
        const edgeGuard = new THREE.Mesh(new THREE.BoxGeometry(0.09, 3.42, 0.09), cornerMat);
        edgeGuard.position.set(cx, 1.8, cz);
        speakerGroup.add(edgeGuard);
      });
    });

    // Front Speaker Mesh Grill
    const meshTex = createSpeakerMeshTexture();
    const meshGeo = new THREE.PlaneGeometry(1.32, 3.2);
    const meshMat = new THREE.MeshStandardMaterial({
      map: meshTex,
      roughness: 0.35,
      metalness: 0.65,
    });
    const frontMesh = new THREE.Mesh(meshGeo, meshMat);
    frontMesh.position.set(0, 1.8, 0.58);
    speakerGroup.add(frontMesh);

    // Two Large 18-inch Bass Woofers with Animated Pulsing Cones
    const wooferMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.4 });
    const dustCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.6 });

    [0.95, 2.05].forEach((wy) => {
      const surroundGeo = new THREE.TorusGeometry(0.42, 0.05, 16, 32);
      const surround = new THREE.Mesh(surroundGeo, wooferMat);
      surround.position.set(0, wy, 0.59);
      speakerGroup.add(surround);

      const coneGeo = new THREE.ConeGeometry(0.4, 0.15, 24);
      coneGeo.rotateX(Math.PI / 2);
      const cone = new THREE.Mesh(coneGeo, wooferMat);
      cone.position.set(0, wy, 0.56);
      speakerGroup.add(cone);
      this.wooferMeshes.push(cone);

      const capGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const cap = new THREE.Mesh(capGeo, dustCapMat);
      cap.position.set(0, wy, 0.6);
      speakerGroup.add(cap);
    });

    // Horn Tweeter at top
    const horn = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.5, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 }),
    );
    horn.position.set(0, 2.9, 0.58);
    speakerGroup.add(horn);

    // Glowing Neon Floor Ring
    const ringGeo = new THREE.RingGeometry(1.8, 2.1, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const activeRing = new THREE.Mesh(ringGeo, ringMat);
    activeRing.position.y = 0.07;
    speakerGroup.add(activeRing);

    this.group.add(speakerGroup);

    this.obstacles.push({
      minX: this.speakerPos.x - 1.0,
      maxX: this.speakerPos.x + 1.0,
      minZ: this.speakerPos.z - 0.9,
      maxZ: this.speakerPos.z + 0.9,
      height: 3.8,
    });
  }

  /**
   * 5. EXPANDED LARGE NATURAL LAKE / POND & STILT BOATHOUSE
   * Located at [188, -0.3, -28]
   * Dimensions: Width 86m (along X from 145 to 231), Depth 56m (along Z from -56 to 0)
   */
  private buildNaturalPondAndBoathouse() {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(188, -0.3, -28);

    const waterW = 84;
    const waterD = 54;
    const waterGeo = new THREE.PlaneGeometry(waterW, waterD, 48, 36);
    waterGeo.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0891b2'; // Deep vivid turquoise/emerald water
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2.0;
    for (let y = 0; y < 512; y += 18) {
      ctx.beginPath();
      for (let x = 0; x < 512; x += 24) {
        const cy = y + Math.sin(x * 0.04 + y * 0.03) * 6;
        if (x === 0) ctx.moveTo(x, cy);
        else ctx.lineTo(x, cy);
      }
      ctx.stroke();
    }
    this.pondWaterTex = new THREE.CanvasTexture(canvas);
    this.pondWaterTex.wrapS = THREE.RepeatWrapping;
    this.pondWaterTex.wrapT = THREE.RepeatWrapping;
    this.pondWaterTex.repeat.set(6, 4);

    const waterMat = new THREE.MeshStandardMaterial({
      map: this.pondWaterTex,
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.45,
      transparent: true,
      opacity: 0.9,
    });
    this.pondWaterMesh = new THREE.Mesh(waterGeo, waterMat);
    pondGroup.add(this.pondWaterMesh);

    // Natural Stone Shoreline Embankment (Large granite river stones around perimeter)
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.92 });
    for (let a = 0; a < Math.PI * 2; a += 0.16) {
      const rx = Math.cos(a) * (waterW / 2 + 1.2) + Math.sin(a * 4) * 2.0;
      const rz = Math.sin(a) * (waterD / 2 + 1.2) + Math.cos(a * 3) * 1.8;
      const rScale = 1.0 + Math.sin(a * 6) * 0.5;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rScale, 1), rockMat);
      rock.position.set(rx, 0.25, rz);
      rock.castShadow = true;
      rock.receiveShadow = true;
      pondGroup.add(rock);
    }

    // Lotus Water Lilies (Shapla & Lotus pads with pink and white blooms)
    const padMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const pinkFlowerMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const whiteFlowerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    const lilyCoords = [
      { x: -28, z: -12, type: 'pink' }, { x: -24, z: -18, type: 'white' },
      { x: -32, z: -8, type: 'pink' }, { x: 26, z: 14, type: 'white' },
      { x: 32, z: 10, type: 'pink' }, { x: 22, z: 18, type: 'pink' },
      { x: -14, z: 18, type: 'white' }, { x: 8, z: -20, type: 'pink' },
    ];
    lilyCoords.forEach((lp) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(1.1, 14), padMat);
      pad.rotateX(-Math.PI / 2);
      pad.position.set(lp.x, 0.02, lp.z);
      pondGroup.add(pad);

      const flower = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.42, 6),
        lp.type === 'pink' ? pinkFlowerMat : whiteFlowerMat,
      );
      flower.position.set(lp.x, 0.22, lp.z);
      pondGroup.add(flower);
    });

    // Rustic Stilt Boathouse on North-East Shore (at [36, 0.8, -10])
    const boathouse = new THREE.Group();
    boathouse.position.set(34, 0.8, -12);

    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.95 });
    [-2.6, 2.6].forEach((sx) => {
      [-2.6, 2.6].forEach((sz) => {
        const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.6, 8), stiltMat);
        stilt.position.set(sx, -0.4, sz);
        boathouse.add(stilt);
      });
    });

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(5.6, 3.0, 5.6),
      new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 }),
    );
    cabin.position.y = 1.8;
    cabin.castShadow = true;
    boathouse.add(cabin);

    const roofGeo = new THREE.ConeGeometry(4.4, 2.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }));
    roof.position.y = 4.4;
    roof.castShadow = true;
    boathouse.add(roof);

    pondGroup.add(boathouse);
    this.group.add(pondGroup);
  }

  /**
   * 6. WOODEN FISHING PLATFORM EXTENDING OVER THE POND
   * Real accessible structure:
   * - Walkway from south bank [188, 0, 0] North into the pond [188, 0.45, -24]
   * - Wide T-dock fishing deck (32m long, 7.5m wide) over the water
   * - Red-roofed pagoda gazebo at the walkway head with fishermen NPCs
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
    pierGroup.position.set(188, 0.45, -24);

    // Walkway from South Bank (length 24m, width 4.0m)
    const walkwayGeo = new THREE.BoxGeometry(4.0, 0.28, 24);
    const walkway = new THREE.Mesh(walkwayGeo, deckMat);
    walkway.position.set(0, 0, 12);
    walkway.receiveShadow = true;
    walkway.castShadow = true;
    pierGroup.add(walkway);

    // Walkway Pilings
    for (let z = 3; z <= 21; z += 5) {
      [-1.8, 1.8].forEach((x) => {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 2.4, 8), pilingMat);
        piling.position.set(x, -1.0, z);
        piling.castShadow = true;
        pierGroup.add(piling);
      });
    }

    // Wide T-Shaped Fishing Deck (32m long, 7.5m wide)
    const deckGeo = new THREE.BoxGeometry(32, 0.3, 7.5);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0, 0);
    deck.receiveShadow = true;
    deck.castShadow = true;
    pierGroup.add(deck);

    // Deck Pilings
    for (let x = -14; x <= 14; x += 5.6) {
      [-3.2, 3.2].forEach((z) => {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.5, 8), pilingMat);
        piling.position.set(x, -1.05, z);
        piling.castShadow = true;
        pierGroup.add(piling);
      });
    }

    // Railings around the deck perimeter
    const addRail = (x1: number, z1: number, x2: number, z2: number) => {
      const len = Math.hypot(x2 - x1, z2 - z1);
      const angle = Math.atan2(z2 - z1, x2 - x1);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.08), railingMat);
      topRail.position.set((x1 + x2) / 2, 0.9, (z1 + z2) / 2);
      topRail.rotation.y = -angle;
      topRail.castShadow = true;
      pierGroup.add(topRail);

      const postCount = Math.max(2, Math.floor(len / 2.5));
      for (let p = 0; p <= postCount; p++) {
        const t = p / postCount;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), railingMat);
        post.position.set(x1 + (x2 - x1) * t, 0.45, z1 + (z2 - z1) * t);
        post.castShadow = true;
        pierGroup.add(post);
      }
    };

    addRail(-16, -3.75, 16, -3.75);
    addRail(16, -3.75, 16, 3.75);
    addRail(-16, -3.75, -16, 3.75);
    addRail(-16, 3.75, -2.0, 3.75);
    addRail(2.0, 3.75, 16, 3.75);

    // Red-Roofed Pagoda Shelter at the Pier
    const shelter = new THREE.Group();
    shelter.position.set(0, 0.15, 0);

    [-2.2, 2.2].forEach((gx) => {
      [-2.2, 2.2].forEach((gz) => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), railingMat);
        pillar.position.set(gx, 1.6, gz);
        pillar.castShadow = true;
        shelter.add(pillar);
      });
    });

    const gRoofGeo = new THREE.ConeGeometry(3.8, 1.8, 4);
    gRoofGeo.rotateY(Math.PI / 4);
    const gRoof = new THREE.Mesh(gRoofGeo, new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 }));
    gRoof.position.y = 4.0;
    gRoof.castShadow = true;
    shelter.add(gRoof);

    pierGroup.add(shelter);
    this.group.add(pierGroup);
  }

  /**
   * 7. HIGH-VISIBILITY "DREAM WORLD HIGH SCHOOL" & FOOTBALL SPORTS FIELD
   * Positioned prominently on the front road corner at [158, 0.05, 56]
   * Directly visible as soon as the player arrives from the bridge!
   */
  private buildDreamWorldHighSchoolAndSportsField() {
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(158, 0.05, 56);

    const bldgLength = 36;
    const bldgWidth = 10;
    const bldgHeight = 7.8;

    // Building Wall & Glass Materials
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 }); // Warm rural school cream
    const frameBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.55 }); // Royal blue pillars & trim
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.85,
      transparent: true,
      opacity: 0.8,
    });

    // 1st Floor
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(bldgLength, 3.8, bldgWidth), wallMat);
    f1.position.y = 1.9;
    f1.castShadow = true;
    f1.receiveShadow = true;
    schoolGroup.add(f1);

    // Intermediate Concrete Slab
    const midSlab = new THREE.Mesh(new THREE.BoxGeometry(bldgLength + 0.6, 0.38, bldgWidth + 0.6), frameBlueMat);
    midSlab.position.y = 3.95;
    schoolGroup.add(midSlab);

    // 2nd Floor
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(bldgLength, 3.6, bldgWidth), wallMat);
    f2.position.y = 5.9;
    f2.castShadow = true;
    f2.receiveShadow = true;
    schoolGroup.add(f2);

    // Roof Parapet Cornice
    const roofCornice = new THREE.Mesh(new THREE.BoxGeometry(bldgLength + 0.8, 0.45, bldgWidth + 0.8), frameBlueMat);
    roofCornice.position.y = 7.9;
    roofCornice.castShadow = true;
    schoolGroup.add(roofCornice);

    // Royal Blue Architectural Structural Columns along facade
    for (let x = -bldgLength / 2 + 2; x <= bldgLength / 2 - 2; x += 4.5) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, bldgHeight, 0.38), frameBlueMat);
      col.position.set(x, bldgHeight / 2, bldgWidth / 2 + 0.18);
      col.castShadow = true;
      schoolGroup.add(col);
    }

    // Classroom Windows along both floors
    for (let x = -bldgLength / 2 + 4.25; x <= bldgLength / 2 - 4.25; x += 4.5) {
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, 0.1), glassMat);
      win1.position.set(x, 2.1, bldgWidth / 2 + 0.06);
      schoolGroup.add(win1);

      const win2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, 0.1), glassMat);
      win2.position.set(x, 5.8, bldgWidth / 2 + 0.06);
      schoolGroup.add(win2);
    }

    // Main Entrance Portico & Huge Illuminated Signboard: "DREAM WORLD HIGH SCHOOL"
    const portico = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.35, 3.5), frameBlueMat);
    portico.position.set(0, 4.0, bldgWidth / 2 + 1.75);
    portico.castShadow = true;
    schoolGroup.add(portico);

    const signTex = createSchoolSignboardTexture();
    const signGeo = new THREE.PlaneGeometry(8.5, 2.1);
    const schoolSign = new THREE.Mesh(signGeo, new THREE.MeshBasicMaterial({ map: signTex }));
    schoolSign.position.set(0, 5.2, bldgWidth / 2 + 0.25);
    schoolGroup.add(schoolSign);

    // Large Green Sports Football Field in front (36m x 24m)
    const fieldTex = createSportsTurfTexture();
    const fieldGeo = new THREE.PlaneGeometry(36, 24);
    fieldGeo.rotateX(-Math.PI / 2);
    const footballField = new THREE.Mesh(
      fieldGeo,
      new THREE.MeshStandardMaterial({ map: fieldTex, roughness: 0.88 }),
    );
    footballField.position.set(0, 0.045, 22);
    footballField.receiveShadow = true;
    schoolGroup.add(footballField);

    // Regulation White Football Goalposts
    const addGoalpost = (gx: number) => {
      const gpMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 });
      const postH = 2.4;
      const postW = 5.4;
      [-postW / 2, postW / 2].forEach((gz) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, postH, 12), gpMat);
        post.position.set(gx, postH / 2, 22 + gz);
        post.castShadow = true;
        schoolGroup.add(post);
      });
      const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, postW, 12), gpMat);
      crossbar.rotation.x = Math.PI / 2;
      crossbar.position.set(gx, postH, 22);
      crossbar.castShadow = true;
      schoolGroup.add(crossbar);
    };

    addGoalpost(-17.5);
    addGoalpost(17.5);

    // Front boundary wall with white balusters
    const wallPillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.85 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    for (let x = -21; x <= 21; x += 4.0) {
      if (Math.abs(x) < 4.5) continue; // Entrance gap
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.25, 0.38), wallPillarMat);
      p.position.set(x, 0.62, 7.5);
      schoolGroup.add(p);

      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.85, 0.08), railingMat);
      rail.position.set(x + 1.9, 0.62, 7.5);
      schoolGroup.add(rail);
    }

    this.group.add(schoolGroup);

    // School building collision obstacle
    this.obstacles.push({
      minX: 158 - bldgLength / 2 - 0.5,
      maxX: 158 + bldgLength / 2 + 0.5,
      minZ: 56 - bldgWidth / 2 - 0.5,
      maxZ: 56 + bldgWidth / 2 + 0.5,
      height: bldgHeight + 1.0,
    });
  }

  /**
   * 8. AUTHENTIC FARMER'S HOMESTEAD & VEGETABLE GARDEN (কৃষকের বাড়ি)
   * Located at [154, 0.05, 14] (Left side of central plaza)
   * Features:
   * - Two-story country farmhouse with terracotta tiled roof, veranda porch, and shutters
   * - Secondary rustic tin cottage (টিনের ঘর)
   * - Farmyard with golden haystacks (খড়ের গাদা), hand pump tube-well (টিউবওয়েল), clay water jars
   * - Neat rectangular raised crop beds: cabbage, tomatoes on bamboo stakes, eggplants, corn
   */
  private buildFarmerHomesteadAndGarden() {
    const farmGroup = new THREE.Group();
    farmGroup.position.set(154, 0.05, 14);

    const tileTex = createRoofTileTexture();
    const tinTex = createTinRoofTexture();

    // A. Main Farmer's House (Two-story / raised cottage with veranda)
    const mainHouse = new THREE.Group();
    mainHouse.position.set(-6, 0, -16);

    const houseWalls = new THREE.Mesh(
      new THREE.BoxGeometry(11, 4.8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.85 }), // Warm farmhouse cream
    );
    houseWalls.position.y = 2.4;
    houseWalls.castShadow = true;
    houseWalls.receiveShadow = true;
    mainHouse.add(houseWalls);

    // Terracotta Tiled Hip Roof
    const roofGeo = new THREE.ConeGeometry(Math.hypot(11, 8) * 0.58, 2.8, 4);
    roofGeo.rotateY(Math.PI / 4);
    const houseRoof = new THREE.Mesh(
      roofGeo,
      new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.75 }),
    );
    houseRoof.position.y = 4.8 + 1.4;
    houseRoof.castShadow = true;
    mainHouse.add(houseRoof);

    // Shaded Veranda Porch with Wooden Pillars & Railings
    const vFloor = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.25, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }),
    );
    vFloor.position.set(0, 0.12, 5.2);
    mainHouse.add(vFloor);

    [-4.5, -1.5, 1.5, 4.5].forEach((px) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.1, 3.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 }),
      );
      pillar.position.set(px, 1.6, 6.2);
      pillar.castShadow = true;
      mainHouse.add(pillar);
    });

    // Windows with wooden shutters
    const winMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    [-3.2, 3.2].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.1), winMat);
      win.position.set(wx, 2.2, 4.05);
      mainHouse.add(win);
    });

    farmGroup.add(mainHouse);

    this.obstacles.push({
      minX: 154 - 6 - 5.8,
      maxX: 154 - 6 + 5.8,
      minZ: 14 - 16 - 4.5,
      maxZ: 14 - 16 + 6.5,
      height: 7.5,
    });

    // B. Secondary Tin Homestead (টিনের ঘর) with Corrugated Roof
    const tinHouse = new THREE.Group();
    tinHouse.position.set(8, 0, -14);

    const tinWalls = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 3.2, 6.0),
      new THREE.MeshStandardMaterial({ color: 0x9c7a5b, roughness: 0.95 }), // Earthen clay
    );
    tinWalls.position.y = 1.6;
    tinWalls.castShadow = true;
    tinHouse.add(tinWalls);

    const tinRoofGeo = new THREE.ConeGeometry(5.8, 2.2, 4);
    tinRoofGeo.rotateY(Math.PI / 4);
    const tinRoof = new THREE.Mesh(
      tinRoofGeo,
      new THREE.MeshStandardMaterial({ map: tinTex, roughness: 0.6, metalness: 0.4 }),
    );
    tinRoof.position.y = 4.3;
    tinRoof.castShadow = true;
    tinHouse.add(tinRoof);

    farmGroup.add(tinHouse);

    // C. Golden Haystacks (খড়ের গাদা - iconic rural detail)
    const hayMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 });
    [-1, 3].forEach((hx, i) => {
      const hay = new THREE.Mesh(new THREE.ConeGeometry(1.8 + i * 0.4, 3.2 + i * 0.6, 16), hayMat);
      hay.position.set(hx, (3.2 + i * 0.6) / 2, -6);
      hay.castShadow = true;
      farmGroup.add(hay);
    });

    // D. Hand Pump Tube-Well (টিউবওয়েল) on Concrete Plinth
    const twPlinth = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.18, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }),
    );
    twPlinth.position.set(-6, 0.09, -2);
    farmGroup.add(twPlinth);

    const pump = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 1.25, 8),
      new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.8, roughness: 0.3 }),
    );
    pump.position.set(-6, 0.72, -2);
    farmGroup.add(pump);

    // E. Rectangular Crop Beds (Cabbage, Tomato, Eggplant, Corn)
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.95 });
    const vegGreenMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });
    const tomatoRedMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const eggplantPurpleMat = new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.3 });

    const cropBeds = [
      { x: -5, z: 8, type: 'cabbage' },
      { x: 5, z: 8, type: 'tomato' },
      { x: -5, z: 18, type: 'eggplant' },
      { x: 5, z: 18, type: 'corn' },
    ];

    cropBeds.forEach((bed) => {
      const bedMesh = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.22, 8.5), bedMat);
      bedMesh.position.set(bed.x, 0.11, bed.z);
      bedMesh.receiveShadow = true;
      farmGroup.add(bedMesh);

      for (let rz = -3.2; rz <= 3.2; rz += 1.6) {
        for (let rx = -3.0; rx <= 3.0; rx += 1.5) {
          const px = bed.x + rx;
          const pz = bed.z + rz;

          if (bed.type === 'cabbage') {
            const cab = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), vegGreenMat);
            cab.position.set(px, 0.35, pz);
            cab.castShadow = true;
            farmGroup.add(cab);
          } else if (bed.type === 'tomato') {
            const stake = new THREE.Mesh(
              new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
              new THREE.MeshStandardMaterial({ color: 0x78350f }),
            );
            stake.position.set(px, 0.6, pz);
            farmGroup.add(stake);

            const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 1), vegGreenMat);
            foliage.position.set(px, 0.7, pz);
            farmGroup.add(foliage);

            const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), tomatoRedMat);
            tomato.position.set(px + 0.15, 0.6, pz);
            farmGroup.add(tomato);
          } else if (bed.type === 'eggplant') {
            const fol = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 1), vegGreenMat);
            fol.position.set(px, 0.4, pz);
            farmGroup.add(fol);

            const fruit = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.18, 6, 8), eggplantPurpleMat);
            fruit.position.set(px + 0.12, 0.35, pz);
            farmGroup.add(fruit);
          } else if (bed.type === 'corn') {
            const stalk = new THREE.Mesh(
              new THREE.CylinderGeometry(0.04, 0.05, 2.2, 6),
              new THREE.MeshStandardMaterial({ color: 0x65a30d }),
            );
            stalk.position.set(px, 1.1, pz);
            stalk.castShadow = true;
            farmGroup.add(stalk);
          }
        }
      }
    });

    this.group.add(farmGroup);
  }

  /**
   * 9. ELEVATED ROCKY HILL & HILLTOP PAGODA GAZEBO
   * Located at [236, 0, 26] (Peaking at Y = 7.5m)
   */
  private buildElevatedRockyHillAndGazebo() {
    const hillGroup = new THREE.Group();
    hillGroup.position.set(236, 0, 26);

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.92, metalness: 0.08 });
    const grassSlopeMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });

    // Terraced Hill Base Masses
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

    // Natural large boulders
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
    });

    // Hexagonal Viewing Gazebo at the Peak (Y = 7.5m)
    const peakGazebo = new THREE.Group();
    peakGazebo.position.set(0, 7.5, 0);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.6, 0.4, 6),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 }),
    );
    base.position.y = 0.2;
    peakGazebo.add(base);

    const gPillarMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    for (let i = 0; i < 6; i++) {
      const pAngle = (i / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), gPillarMat);
      pillar.position.set(Math.cos(pAngle) * 2.8, 1.8, Math.sin(pAngle) * 2.8);
      pillar.castShadow = true;
      peakGazebo.add(pillar);
    }

    const hRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.2, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.65 }),
    );
    hRoof.position.y = 4.4;
    hRoof.castShadow = true;
    peakGazebo.add(hRoof);

    const finial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.16, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 }),
    );
    finial.position.y = 5.7;
    peakGazebo.add(finial);

    hillGroup.add(peakGazebo);
    this.group.add(hillGroup);
  }

  /**
   * 10. VILLAGE RESIDENTIAL HOMESTEADS
   * Located at [220, 0.05, 96]
   */
  private buildVillageResidentialQuarter() {
    const resGroup = new THREE.Group();
    resGroup.position.set(220, 0.05, 96);

    const tileRoofTex = createRoofTileTexture();
    const tinTex = createTinRoofTexture();

    // House 1 (Terracotta Tiled Homestead)
    this.buildResidentialHouse(resGroup, -8, -8, 10.5, 7.5, 3.8, 0xf1f5f9, tileRoofTex, 0.2, true);

    // House 2 (Corrugated Tin Rural Home)
    this.buildResidentialHouse(resGroup, 10, -5, 9.0, 6.8, 3.5, 0x9c7a5b, tinTex, -0.15, false);

    // House 3 (Warm Terracotta Cottage)
    this.buildResidentialHouse(resGroup, 2, 16, 11.0, 8.0, 4.0, 0xd97706, tileRoofTex, 0.1, true);

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

    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 }),
    );
    walls.position.y = h / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    house.add(walls);

    const roofH = 2.4;
    const roofMat = roofTex
      ? new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.75 })
      : new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6, metalness: 0.4 });
    const roofGeo = new THREE.ConeGeometry(Math.hypot(w, d) * 0.58, roofH, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + roofH / 2;
    roof.castShadow = true;
    house.add(roof);

    if (hasVeranda) {
      const vPlinth = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.4, 0.2, 2.2),
        new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 }),
      );
      vPlinth.position.set(0, 0.1, d / 2 + 1.1);
      house.add(vPlinth);

      [-w / 2 + 0.5, w / 2 - 0.5].forEach((px) => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, h - 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }),
        );
        pillar.position.set(px, (h - 0.6) / 2 + 0.2, d / 2 + 1.8);
        pillar.castShadow = true;
        house.add(pillar);
      });
    }

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 }),
    );
    door.position.set(0, 1.1, d / 2 + 0.06);
    house.add(door);

    parent.add(house);

    this.obstacles.push({
      minX: 220 + x - w / 2 - 0.5,
      maxX: 220 + x + w / 2 + 0.5,
      minZ: 96 + z - d / 2 - 0.5,
      maxZ: 96 + z + d / 2 + 1.5,
      height: h + roofH,
    });
  }

  /**
   * 11. REALISTIC PROCEDURAL TREES & TROPICAL VEGETATION
   * High-fidelity, multi-layered realistic trees:
   * - Coconut Palms with segmented bark, arched feathered fronds, and coconuts!
   * - Mango and Jackfruit Trees with textured bark, branching forks, and dense leafy crowns!
   * - Banana Trees with broad curved green leaves!
   */
  private buildRealisticTreesAndVegetation() {
    // A. Coconut Palm Trees along pond banks and roads
    const palmPositions = [
      { x: 148, z: -15 }, { x: 156, z: -35 }, { x: 222, z: -8 },
      { x: 232, z: -25 }, { x: 140, z: 25 }, { x: 140, z: 75 },
      { x: 202, z: 70 }, { x: 242, z: 75 }, { x: 212, z: 120 },
      { x: 240, z: 122 }, { x: 172, z: 126 },
    ];
    palmPositions.forEach((pos) => {
      this.buildRealisticCoconutPalm(pos.x, pos.z);
    });

    // B. Bangladeshi Countryside Mango & Jackfruit Shade Trees
    const shadeTreePositions = [
      { x: 144, z: 2 }, { x: 138, z: 105 }, { x: 178, z: 72 },
      { x: 202, z: 14 }, { x: 224, z: 58 }, { x: 246, z: 6 },
    ];
    shadeTreePositions.forEach((pos) => {
      this.buildRealisticMangoTree(pos.x, pos.z);
    });

    // C. Banana Trees (কলা গাছ) near homesteads and gardens
    const bananaPositions = [
      { x: 146, z: -4 }, { x: 148, z: -2 }, { x: 162, z: 2 },
      { x: 210, z: 72 }, { x: 214, z: 74 },
    ];
    bananaPositions.forEach((pos) => {
      this.buildRealisticBananaTree(pos.x, pos.z);
    });
  }

  /**
   * High-Fidelity Coconut Palm Tree (নারকেল গাছ)
   * Features:
   * - Ringed segmented bark texture
   * - Natural curvature
   * - 8 Realistic arched, drooping feathered fronds
   * - Clusters of green/brown coconuts (সবুজ ডাব)
   */
  private buildRealisticCoconutPalm(x: number, z: number) {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0.05, z);

    const trunkTex = createPalmTrunkTexture();
    const trunkH = 9.0 + Math.random() * 2.5;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, trunkH, 12);
    const trunkMat = new THREE.MeshStandardMaterial({
      map: trunkTex,
      roughness: 0.9,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkH / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.22;
    trunk.castShadow = true;
    palmGroup.add(trunk);

    // 8 Drooping Realistic Palm Fronds
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a, // Vibrant palm green
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    for (let f = 0; f < 8; f++) {
      const angle = (f / 8) * Math.PI * 2;
      const frondGroup = new THREE.Group();
      frondGroup.position.set(0, trunkH, 0);
      frondGroup.rotation.y = angle;

      // Arched spine
      const spine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.06, 5.0, 6),
        new THREE.MeshStandardMaterial({ color: 0x84cc16 }),
      );
      spine.position.set(0, 1.2, 2.2);
      spine.rotation.x = Math.PI / 3.2;
      frondGroup.add(spine);

      // Feathered leaves
      const leafGeo = new THREE.ConeGeometry(0.85, 4.8, 4);
      leafGeo.rotateX(Math.PI / 3.2);
      const leaf = new THREE.Mesh(leafGeo, frondMat);
      leaf.position.set(0, 1.2, 2.2);
      leaf.castShadow = true;
      frondGroup.add(leaf);

      palmGroup.add(frondGroup);
    }

    // Coconut cluster (সবুজ ডাব / নারকেল)
    const coconutMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.7 });
    for (let c = 0; c < 5; c++) {
      const cAngle = (c / 5) * Math.PI * 2;
      const nut = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), coconutMat);
      nut.position.set(Math.cos(cAngle) * 0.45, trunkH - 0.2, Math.sin(cAngle) * 0.45);
      nut.castShadow = true;
      palmGroup.add(nut);
    }

    this.group.add(palmGroup);
  }

  /**
   * Realistic Mango / Jackfruit Shade Tree (আম / কাঁঠাল গাছ)
   */
  private buildRealisticMangoTree(x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.05, z);

    const barkTex = createOrganicTreeBarkTexture();
    const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.92 });

    // Main Trunk with fork
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 4.5, 10), barkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // 3 Forked Primary Branches
    for (let b = 0; b < 3; b++) {
      const bAngle = (b / 3) * Math.PI * 2;
      const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.2, 8), barkMat);
      fork.position.set(Math.cos(bAngle) * 1.2, 4.2, Math.sin(bAngle) * 1.2);
      fork.rotation.z = Math.PI / 4;
      fork.rotation.y = bAngle;
      fork.castShadow = true;
      treeGroup.add(fork);
    }

    // Dense Organic Foliage Crown
    const leafDark = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
    const leafMid = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
    const leafLight = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.72 });

    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.6, 2), leafDark);
    crown1.position.set(0, 6.2, 0);
    crown1.castShadow = true;
    treeGroup.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 2), leafMid);
    crown2.position.set(1.5, 6.8, -1.2);
    crown2.castShadow = true;
    treeGroup.add(crown2);

    const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.6, 2), leafLight);
    crown3.position.set(-1.4, 6.5, 1.4);
    crown3.castShadow = true;
    treeGroup.add(crown3);

    this.group.add(treeGroup);
  }

  /**
   * Realistic Banana Tree (কলা গাছ)
   * Broad curved green leaves
   */
  private buildRealisticBananaTree(x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.05, z);

    // Stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.8 }),
    );
    stem.position.y = 1.6;
    stem.castShadow = true;
    treeGroup.add(stem);

    // 5 Broad Arched Banana Leaves
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    for (let l = 0; l < 5; l++) {
      const angle = (l / 5) * Math.PI * 2;
      const leafGeo = new THREE.BoxGeometry(0.7, 0.04, 2.6);
      leafGeo.rotateX(0.4);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(Math.cos(angle) * 0.8, 3.2, Math.sin(angle) * 0.8);
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      treeGroup.add(leaf);
    }

    this.group.add(treeGroup);
  }

  // --- PLAZA DECOR HELPERS ---
  private buildPlazaLamp(parent: THREE.Group, x: number, z: number) {
    const lamp = new THREE.Group();
    lamp.position.set(x, 0, z);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.0, 8), postMat);
    post.position.y = 2.0;
    post.castShadow = true;
    lamp.add(post);

    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xf59e0b, emissiveIntensity: 0.65 }),
    );
    lantern.position.y = 4.15;
    lamp.add(lantern);

    parent.add(lamp);
  }

  private buildPlazaBench(parent: THREE.Group, x: number, z: number, rotY: number) {
    const bench = new THREE.Group();
    bench.position.set(x, 0, z);
    bench.rotation.y = rotY;

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.7), woodMat);
    seat.position.y = 0.48;
    seat.castShadow = true;
    bench.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 0.09), woodMat);
    back.position.set(0, 0.76, -0.3);
    back.castShadow = true;
    bench.add(back);

    parent.add(bench);
  }

  private buildFlowerPlanter(parent: THREE.Group, x: number, z: number) {
    const planter = new THREE.Group();
    planter.position.set(x, 0, z);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.6, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }),
    );
    box.position.y = 0.3;
    box.castShadow = true;
    planter.add(box);

    const flowers = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.1, 1),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.7 }),
    );
    flowers.position.y = 0.95;
    planter.add(flowers);

    parent.add(planter);
  }

  /**
   * Continuous Analytical Height Function for Countryside Village
   */
  public getVillageElevation(x: number, z: number, currentY?: number): number | null {
    // 1. Wooden Fishing Pier & Walkway over Pond
    // Walkway: X in [185.8, 190.2], Z in [0, -24.2]
    if (x >= 185.8 && x <= 190.2 && z <= 0 && z >= -24.2) {
      return 0.45;
    }
    // Wide Fishing Platform Deck: X in [171, 205], Z in [-28, -20]
    if (x >= 171.0 && x <= 205.0 && z >= -28.0 && z <= -20.0) {
      return 0.45;
    }

    // 2. Elevated Rocky Hill (Center: [236, 26], Radius ~18m)
    const hillDist = Math.hypot(x - 236, z - 26);
    if (hillDist < 18.0) {
      const norm = hillDist / 18.0;
      const factor = Math.max(0, 1 - norm * norm);
      return 0.05 + 7.45 * Math.pow(factor, 1.4);
    }

    // 3. Central Red-Brick Plaza & Village Roads
    if (x >= 134 && x <= 256 && z >= -45 && z <= 135) {
      return 0.05;
    }

    return null;
  }

  /**
   * Per-Frame Update (Animate Speaker Woofers and Pond Water)
   */
  public update(delta: number, isMusicPlaying: boolean) {
    if (this.wooferMeshes.length > 0) {
      const time = performance.now() * 0.008;
      const pulse = isMusicPlaying ? 1.0 + Math.sin(time * 3.5) * 0.12 : 1.0;
      this.wooferMeshes.forEach((cone) => {
        cone.scale.set(pulse, pulse, pulse);
      });
    }

    if (this.pondWaterTex) {
      this.pondWaterTex.offset.x += delta * 0.02;
      this.pondWaterTex.offset.y += delta * 0.015;
    }
  }
}
