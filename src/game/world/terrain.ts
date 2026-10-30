/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { KaifengBridgeAndRiver } from './KaifengBridgeAndRiver';

export interface WorldObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
  minY?: number;
  maxY?: number;
}

/**
 * Procedural Bengali Shopfront Texture Generator
 */
function createShopfrontTexture(
  shopNameBn: string,
  subText: string,
  themeColor: string,
  accentColor: string,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Signboard background
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, 0, 512, 100);

  // Border accent
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 88);

  // Bengali Shop Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(shopNameBn, 256, 42);

  // English Subtitle / Tagline
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText(subText, 256, 75);

  // Lower shop window & roller shutter / display
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 100, 512, 156);

  // Glass display showcase
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(20, 115, 230, 125);
  ctx.fillRect(262, 115, 230, 125);

  // Shelves & items inside
  ctx.fillStyle = accentColor;
  ctx.fillRect(35, 150, 200, 6);
  ctx.fillRect(35, 190, 200, 6);
  ctx.fillRect(277, 150, 200, 6);
  ctx.fillRect(277, 190, 200, 6);

  // Glass reflection gloss
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(20, 240);
  ctx.lineTo(120, 115);
  ctx.lineTo(160, 115);
  ctx.lineTo(60, 240);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Brick-Pattern Sidewalk Texture
 * Bangladeshi urban sidewalk running-bond terracotta pavers with beveled stone curbs
 */
function createBrickSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base mortar grout bed
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 512, 512);

  // Red & Terracotta Paver Bricks in Stretcher Bond
  const brickH = 32;
  const brickW = 64;
  const colors = ['#b91c1c', '#991b1b', '#c2410c', '#a16207', '#b45309', '#78350f', '#a855f7', '#854d0e'];

  let row = 0;
  for (let y = 0; y < 512; y += brickH) {
    const offset = (row % 2) * (brickW / 2);
    for (let x = -brickW; x < 512 + brickW; x += brickW) {
      const colIdx = Math.floor(Math.abs(Math.sin(x * 12.3 + y * 7.7)) * colors.length) % colors.length;
      ctx.fillStyle = colors[colIdx];
      ctx.fillRect(x + offset + 2, y + 2, brickW - 4, brickH - 4);

      // Micro surface aggregate & weathered beveling
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + offset + 3, y + 3, brickW - 6, 4);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(x + offset + 3, y + brickH - 6, brickW - 6, 4);
    }
    row++;
  }

  // Atmospheric surface dust & grain
  for (let i = 0; i < 3000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Procedural Black-and-Yellow Road Curb Texture
 */
function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const stripeW = 64;
  for (let x = 0; x < 512; x += stripeW * 2) {
    // Dhaka Safety Yellow
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x, 0, stripeW, 128);
    // Subtle bevel & road dust on yellow
    ctx.fillStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.fillRect(x, 0, stripeW, 8);

    // Road Jet Black
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + stripeW, 0, stripeW, 128);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.fillRect(x + stripeW, 0, stripeW, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Canvas Striped Awning Texture
 */
function createAwningTexture(c1 = '#b91c1c', c2 = '#f8fafc'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const stripeW = 16;
  for (let x = 0; x < 128; x += stripeW * 2) {
    ctx.fillStyle = c1;
    ctx.fillRect(x, 0, stripeW, 128);
    ctx.fillStyle = c2;
    ctx.fillRect(x + stripeW, 0, stripeW, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Realistic Charcoal Asphalt Texture
 * Features fine mineral grain, organic bitumen repair patches, crisp lane lines, and edge markings
 */
function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep charcoal/dark-grey asphalt base
  ctx.fillStyle = '#15181c';
  ctx.fillRect(0, 0, 512, 512);

  // 2. Micro-aggregate mineral grain noise (quartzite, basalt, crushed limestone)
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const luma = 15 + Math.floor(Math.random() * 35);
    ctx.fillStyle = `rgba(${luma}, ${luma + 2}, ${luma + 4}, 0.28)`;
    ctx.fillRect(x, y, 2, 2);
  }

  // 3. Realistic organic road repair patches (dark bituminous mastic asphalt)
  const patches = [
    { x: 100, y: 80, rx: 34, ry: 22, rot: 0.2 },
    { x: 380, y: 220, rx: 42, ry: 26, rot: -0.35 },
    { x: 170, y: 390, rx: 38, ry: 28, rot: 0.15 },
    { x: 340, y: 440, rx: 28, ry: 18, rot: -0.1 },
  ];

  patches.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // Dark tar sealant rim outline
    ctx.strokeStyle = '#090b0d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Fresh dark asphalt patch infill
    ctx.fillStyle = '#101214';
    ctx.fill();

    // Subtle fine aggregate inside patch
    for (let j = 0; j < 350; j++) {
      const gX = (Math.random() - 0.5) * p.rx * 1.6;
      const gY = (Math.random() - 0.5) * p.ry * 1.6;
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(gX, gY, 1.5, 1.5);
    }

    ctx.restore();
  });

  // 4. Center Double Yellow Lines (for two-way traffic separated by median)
  ctx.fillStyle = '#facc15'; // Dhaka Safety Golden Yellow
  // Two distinct continuous yellow lines separated by 8px median center
  ctx.fillRect(250, 0, 4, 512);
  ctx.fillRect(258, 0, 4, 512);

  // 5. Directional White Dashed Lane Dividers
  // Westbound lane divider at X = 130
  ctx.fillStyle = '#f8fafc';
  for (let y = 15; y < 512; y += 80) {
    ctx.fillRect(128, y, 5, 48);
  }
  // Eastbound lane divider at X = 380
  for (let y = 15; y < 512; y += 80) {
    ctx.fillRect(380, y, 5, 48);
  }

  // 6. Solid Crisp White Edge Fog Lines along Curbs
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(14, 0, 8, 512);
  ctx.fillRect(490, 0, 8, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Procedural Village Corrugated Tin Roof Texture
 */
function createTinRoofTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Weathered galvanized steel base
  ctx.fillStyle = '#718096';
  ctx.fillRect(0, 0, 256, 256);

  // Corrugation ridges
  for (let x = 0; x < 256; x += 12) {
    const ridgeGrad = ctx.createLinearGradient(x, 0, x + 12, 0);
    ridgeGrad.addColorStop(0, 'rgba(255,255,255,0.25)');
    ridgeGrad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    ridgeGrad.addColorStop(1, 'rgba(255,255,255,0.15)');
    ctx.fillStyle = ridgeGrad;
    ctx.fillRect(x, 0, 12, 256);
  }

  // Rust patches
  for (let i = 0; i < 20; i++) {
    const rx = Math.random() * 256;
    const ry = Math.random() * 256;
    const rad = 5 + Math.random() * 15;
    const rustGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rad);
    rustGrad.addColorStop(0, 'rgba(160, 60, 20, 0.45)');
    rustGrad.addColorStop(1, 'rgba(160, 60, 20, 0)');
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
 * Procedural Padma River Water & Wave Texture
 * Dynamic gentle sinusoidal ripples and sparkling surface flow
 */
function createRiverWaterTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep Padma emerald-cerulean water base
  ctx.fillStyle = '#164e63';
  ctx.fillRect(0, 0, 512, 512);

  // Soft river flow lines and gentle sinusoidal ripples
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.22)';
  ctx.lineWidth = 2.5;
  for (let y = 0; y < 512; y += 12) {
    ctx.beginPath();
    for (let x = 0; x < 512; x += 16) {
      const cy = y + Math.sin(x * 0.05 + y * 0.02) * 5;
      if (x === 0) ctx.moveTo(x, cy);
      else ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }

  // Sparkling wave highlights & gentle foam specks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 220; i++) {
    const rx = Math.random() * 500;
    const ry = Math.random() * 500;
    const len = 15 + Math.random() * 35;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + len, ry + Math.sin(rx * 0.1) * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class WorldTerrain {
  public group: THREE.Group;
  public obstacles: WorldObstacle[] = [];
  public waterfallMesh: THREE.Mesh | null = null;
  public riverMesh: THREE.Mesh | null = null;
  public riverWaterTex: THREE.CanvasTexture | null = null;
  public kaifengBridge!: KaifengBridgeAndRiver;

  private waterfallTexOffset = 0;
  private riverTexOffset = 0;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'WorldTerrain';
    scene.add(this.group);

    this.buildGroundMesh();
    this.buildRiverAndBridge();
    this.buildCityRegion();
    this.buildVillageRegion();
    this.buildHillsAndWaterfall();
    this.buildHorizonDistantMountains();
  }

  /**
   * Continuous Analytical Height Function
   * Provides rock-solid y-elevation for player, vehicles, NPCs, and camera collision.
   */
  public getTerrainHeight(x: number, z: number, currentY?: number): number {
    // 1. Authentic Chinese Kaifeng Rainbow Moon Arch Bridge (汴京虹桥)
    const bridgeH = this.kaifengBridge.getBridgeElevation(x, z);
    if (bridgeH !== null) {
      return bridgeH;
    }

    // 2. Wooden Fishing Pier & Boat Dock
    const pierH = this.kaifengBridge.getPierElevation(x, z);
    if (pierH !== null) {
      return pierH;
    }

    // 3. Small Modern Pedestrian Foot-Overbridge across Dhanmondi City Avenue (at X = 0, deck Y = 5.2)
    // Multi-level height: lower roadway passes underneath freely at 0.03; pedestrians on stairs/deck climb to 5.2
    if (currentY !== undefined && currentY > 1.2) {
      // Overbridge Main Walkway Deck (X: -1.8 to 1.8, Z: -8.8 to 14.8)
      if (x >= -1.8 && x <= 1.8 && z >= -8.8 && z <= 14.8) {
        return 5.2;
      }
      // South Stairs (Z: 13.2 to 16.4, X: 0.0 to 8.5): descends Eastward from 5.2 to sidewalk 0.16
      if (z >= 13.2 && z <= 16.4 && x >= 0.0 && x <= 8.5) {
        return THREE.MathUtils.lerp(5.2, 0.16, x / 8.5);
      }
      // North Stairs (Z: -10.4 to -7.2, X: 0.0 to 8.5): descends Eastward from 5.2 to sidewalk 0.16
      if (z >= -10.4 && z <= -7.2 && x >= 0.0 && x <= 8.5) {
        return THREE.MathUtils.lerp(5.2, 0.16, x / 8.5);
      }
    }

    // 3. Wide River Channel (outside the bridge deck)
    const riverDist = Math.abs(x - 87.5);
    if (riverDist < 25) {
      // Sloping riverbed ground elevation beneath water
      const bedY = this.getGroundElevation(x, z);
      // If entity is floating/swimming (currentY near surface >= -0.7), return swimming float level (-0.45)
      // Otherwise return actual solid riverbed ground so players enter and exit water naturally!
      if (currentY !== undefined && currentY >= -0.7) {
        return -0.45;
      }
      return bedY;
    }

    // 4. Mountain & Waterfall Range (X > 180, Z < 25)
    if (x > 180 && z < 25) {
      const hillDistX = (x - 180) / 120; // 0 to 1+
      const hillDistZ = (25 - z) / 120; // 0 to 1+
      const hillFactor = Math.min(1.8, Math.max(0, hillDistX * 0.7 + hillDistZ * 0.6));

      // Mountain peaks and trail
      const peakHeight = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 8;
      const baseMountain = Math.pow(hillFactor, 1.6) * 26 + peakHeight;

      // Mountain Trail carve-out (leads to waterfall at [270, -100])
      const trailDist = Math.abs((x - 240) * 0.6 + (z + 40) * 0.8);
      if (trailDist < 7) {
        return Math.max(0.5, baseMountain * 0.45);
      }

      return Math.max(0.5, baseMountain);
    }

    // 5. Bengali Countryside & Village (X: 112.5 to 220, Z: 25 to 180)
    if (x >= 112.5 && z >= 25) {
      const ridge = Math.sin(x * 0.08) * 0.4 + Math.cos(z * 0.08) * 0.4;
      return 0.5 + ridge;
    }

    // 6. City Region (Flat paved surface at Y = 0.03 for roads, 0.0 for ground)
    return 0.03;
  }

  /**
   * Natural Ground Mesh Elevation
   * Pure terrain, riverbed, hills, and plains.
   * Completely uncovers the riverbed under the bridge so water flows uninterrupted from one side to the other.
   * Keeps city ground level at 0.0 under the overpass.
   */
  public getGroundElevation(x: number, z: number): number {
    // 1. Wide River Channel (X between 62.5 and 112.5)
    // Continuous sunken riverbed along the ENTIRE map from north to south, including under the bridge!
    const riverDist = Math.abs(x - 87.5);
    if (riverDist < 25) {
      return -3.2 * (1 - riverDist / 25);
    }

    // 2. Mountain & Waterfall Range (X > 180, Z < 25)
    if (x > 180 && z < 25) {
      const hillDistX = (x - 180) / 120;
      const hillDistZ = (25 - z) / 120;
      const hillFactor = Math.min(1.8, Math.max(0, hillDistX * 0.7 + hillDistZ * 0.6));
      const peakHeight = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 8;
      const baseMountain = Math.pow(hillFactor, 1.6) * 26 + peakHeight;

      const trailDist = Math.abs((x - 240) * 0.6 + (z + 40) * 0.8);
      if (trailDist < 7) {
        return Math.max(0.5, baseMountain * 0.45);
      }
      return Math.max(0.5, baseMountain);
    }

    // 3. Bengali Countryside & Village (X: 112.5 to 220, Z: 25 to 180)
    if (x >= 112.5 && z >= 25) {
      const ridge = Math.sin(x * 0.08) * 0.4 + Math.cos(z * 0.08) * 0.4;
      return 0.5 + ridge;
    }

    // 4. City Region (Flat paved ground at Y = 0.0)
    return 0.0;
  }

  /**
   * Check if coordinate is inside Padma River water body
   * Excludes upper bridge deck so vehicles and pedestrians crossing bridge are not in water.
   */
  public isWater(x: number, z: number, y?: number): boolean {
    const riverDist = Math.abs(x - 87.5);
    if (riverDist < 25) {
      // If entity is on bridge span (X: 50 to 125, Z: -6.5 to 12.5) with elevation >= 2.0, they are on bridge deck
      if (x >= 50 && x <= 125 && z >= -6.5 && z <= 12.5) {
        if (y !== undefined && y >= 2.0) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Depth of water at coordinate (depth between water surface -0.4 and ground bed)
   */
  public getWaterDepth(x: number, z: number, y?: number): number {
    if (!this.isWater(x, z, y)) return 0;
    const bed = this.getGroundElevation(x, z);
    return Math.max(0, -0.4 - bed);
  }

  /**
   * Ground Mesh with Vertex Displacements
   */
  private buildGroundMesh() {
    const size = 650;
    const segments = 120;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = this.getGroundElevation(x, z);
      pos.setY(i, y);

      // Vertex color blending based on region & altitude
      let r = 0.22, g = 0.42, b = 0.18; // Default lush green

      if (x < 62.5) {
        // City paved zone
        r = 0.28; g = 0.3; b = 0.32;
      } else if (Math.abs(x - 87.5) < 26) {
        // Riverbed silt / sand under the water
        r = 0.38; g = 0.34; b = 0.24;
      } else if (y > 12) {
        // Mountain rocky slopes
        r = 0.42; g = 0.44; b = 0.38;
      } else if (x > 112.5 && z > 30) {
        // Golden green paddy fields
        r = 0.35; g = 0.55; b = 0.15;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.05,
    });

    const groundMesh = new THREE.Mesh(geo, mat);
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);
  }

  /**
   * Classical Chinese-Inspired Bridge Architecture across River Padma
   * Preserves exact location (X: 50 to 125, Z: 3), road connections, supports, collision, and vehicle clearance.
   * Riverbed is carved out beneath, making water visible flowing from north to south.
   */
  private buildRiverAndBridge() {
    // 1. Animated River Water with Procedural Waves & Ripples
    this.riverWaterTex = createRiverWaterTexture();
    const riverGeo = new THREE.PlaneGeometry(65, 650, 4, 80);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      map: this.riverWaterTex,
      color: 0x22d3ee,
      roughness: 0.18,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.position.set(87.5, -0.4, 0);
    this.group.add(this.riverMesh);

    // Natural gently sloped riverbank shores and foam edge transitions (X: 62.5 and X: 112.5)
    // West sandy shoreline transition (connecting city to river)
    const westShoreGeo = new THREE.PlaneGeometry(6, 650, 1, 40);
    westShoreGeo.rotateX(-Math.PI / 2);
    const shoreSandMat = new THREE.MeshStandardMaterial({
      color: 0xb59b73, // Natural sandy silt riverbank
      roughness: 0.92,
      metalness: 0.05,
    });
    const westShore = new THREE.Mesh(westShoreGeo, shoreSandMat);
    westShore.position.set(62.5, -0.15, 0);
    westShore.rotation.z = -0.06; // gentle slope toward water
    westShore.receiveShadow = true;
    this.group.add(westShore);

    // East village shoreline transition
    const eastShoreGeo = new THREE.PlaneGeometry(6, 650, 1, 40);
    eastShoreGeo.rotateX(-Math.PI / 2);
    const eastShore = new THREE.Mesh(eastShoreGeo, shoreSandMat);
    eastShore.position.set(112.5, -0.15, 0);
    eastShore.rotation.z = 0.06;
    eastShore.receiveShadow = true;
    this.group.add(eastShore);

    // Riverbank water foam ribbons along both shores
    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
    });
    const westFoamGeo = new THREE.PlaneGeometry(1.4, 650);
    westFoamGeo.rotateX(-Math.PI / 2);
    const westFoam = new THREE.Mesh(westFoamGeo, foamMat);
    westFoam.position.set(63.2, -0.36, 0);
    this.group.add(westFoam);

    const eastFoamGeo = new THREE.PlaneGeometry(1.4, 650);
    eastFoamGeo.rotateX(-Math.PI / 2);
    const eastFoam = new THREE.Mesh(eastFoamGeo, foamMat);
    eastFoam.position.set(111.8, -0.36, 0);
    this.group.add(eastFoam);

    // 2. Authentic Chinese Kaifeng Rainbow Moon Arch Bridge & River System
    this.kaifengBridge = new KaifengBridgeAndRiver();
    this.group.add(this.kaifengBridge.group);
    this.obstacles.push(...this.kaifengBridge.obstacles);






  }

  /**
   * Region A: Modern Bangladeshi City (Dhanmondi / Gulshan Hub)
   */
  private buildCityRegion() {
    const roadTex = createRoadTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTex,
      roughness: 0.7,
      metalness: 0.1,
    });

    // 1. Main East-West Avenue (Widened to 18m: Z from -6 to +12, X from -140 to Bridge West Ramp at X = 50)
    // Provides 2 spacious directional roadways (Eastbound and Westbound)
    const mainAvenueGeo = new THREE.PlaneGeometry(190, 18);
    mainAvenueGeo.rotateX(-Math.PI / 2);
    const mainAvenue = new THREE.Mesh(mainAvenueGeo, roadMat);
    mainAvenue.position.set(-45, 0.03, 3);
    mainAvenue.receiveShadow = true;
    this.group.add(mainAvenue);

    // 1B. Straight, Continuous Central Divider with Vertical Posts (along Z = 3.0)
    // Follows elevation, divides eastbound/westbound traffic, with clean openings at intersections & crosswalks
    const dividerCurbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 });
    const dividerPostMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Dhaka Safety Reflective Yellow
      roughness: 0.4,
      metalness: 0.6,
    });
    const postStripeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // White reflective band
      roughness: 0.3,
    });

    const dividerSegments = [
      { startX: -135, endX: -72.0 },  // Far west stretch
      { startX: -68.0, endX: -18.0 }, // West stretch to Cross Blvd
      { startX: -2.0, endX: 6.5 },    // Between Cross Blvd & Overbridge/Crosswalk
      { startX: 9.5, endX: 23.5 },    // Between Crosswalk & East River Road
      { startX: 36.5, endX: 50.0 },   // East stretch to Chinese Bridge Approach
    ];

    dividerSegments.forEach((seg) => {
      const segLen = seg.endX - seg.startX;
      const midX = (seg.startX + seg.endX) / 2;

      // Continuous concrete median curb
      const medianCurbGeo = new THREE.BoxGeometry(segLen, 0.24, 0.75);
      const medianCurb = new THREE.Mesh(medianCurbGeo, dividerCurbMat);
      medianCurb.position.set(midX, 0.12, 3.0);
      medianCurb.castShadow = true;
      medianCurb.receiveShadow = true;
      this.group.add(medianCurb);

      // Register collision obstacle for the central median
      this.obstacles.push({
        minX: seg.startX,
        maxX: seg.endX,
        minZ: 2.6,
        maxZ: 3.4,
        height: 1.0,
      });

      // Small, evenly-spaced vertical posts/pillars (bollards) mounted on the divider
      const postSpacing = 3.5;
      for (let px = seg.startX + 1.5; px <= seg.endX - 1.5; px += postSpacing) {
        const postGroup = new THREE.Group();
        postGroup.position.set(px, 0.24, 3.0);

        // Vertical post shaft
        const postShaftGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.75, 10);
        const postShaft = new THREE.Mesh(postShaftGeo, dividerPostMat);
        postShaft.position.y = 0.375;
        postShaft.castShadow = true;
        postGroup.add(postShaft);

        // High-visibility reflective white collar rings
        const ringGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.14, 10);
        const ring = new THREE.Mesh(ringGeo, postStripeMat);
        ring.position.y = 0.55;
        postGroup.add(ring);

        this.group.add(postGroup);
      }
    });

    // Intersection Yellow Box Junction Markings at Cross Boulevard (X = -10, Z = 3)
    const junctionBoxGeo = new THREE.PlaneGeometry(14, 18);
    junctionBoxGeo.rotateX(-Math.PI / 2);
    const junctionMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
      roughness: 0.6,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const junctionBox = new THREE.Mesh(junctionBoxGeo, junctionMat);
    junctionBox.position.set(-10, 0.032, 3);
    junctionBox.receiveShadow = true;
    this.group.add(junctionBox);

    // 1C. Matching Brick-Pattern Sidewalks with Curbs on BOTH SIDES of Main Avenue
    // Continuous sidewalks along North (Z: -11.5 to -6) and South (Z: 12 to 17.5) sides
    const brickTex = createBrickSidewalkTexture();
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const curbTex = createCurbTexture();
    const curbMat = new THREE.MeshStandardMaterial({
      map: curbTex,
      roughness: 0.6,
      metalness: 0.1,
    });

    const sidewalkSegments = [
      { startX: -140, endX: -17.5 }, // West of Cross Blvd
      { startX: -2.5, endX: 23.5 },  // Between Cross Blvd & East River Rd
      { startX: 36.5, endX: 50.0 },  // East of East River Rd to Bridge Approach
    ];

    sidewalkSegments.forEach((seg) => {
      const segLen = seg.endX - seg.startX;
      const midX = (seg.startX + seg.endX) / 2;

      // South Sidewalk (Z = 14.75, width 5.5m)
      const southWalkGeo = new THREE.BoxGeometry(segLen, 0.16, 5.5);
      const southWalk = new THREE.Mesh(southWalkGeo, sidewalkMat);
      southWalk.position.set(midX, 0.08, 14.75);
      southWalk.receiveShadow = true;
      this.group.add(southWalk);

      // North Sidewalk (Z = -8.75, width 5.5m)
      const northWalkGeo = new THREE.BoxGeometry(segLen, 0.16, 5.5);
      const northWalk = new THREE.Mesh(northWalkGeo, sidewalkMat);
      northWalk.position.set(midX, 0.08, -8.75);
      northWalk.receiveShadow = true;
      this.group.add(northWalk);

      // South Curb (at Z = 12.15, height 0.22m)
      const southCurbGeo = new THREE.BoxGeometry(segLen, 0.22, 0.35);
      const southCurb = new THREE.Mesh(southCurbGeo, curbMat);
      southCurb.position.set(midX, 0.11, 12.15);
      southCurb.receiveShadow = true;
      southCurb.castShadow = true;
      this.group.add(southCurb);

      // North Curb (at Z = -6.15, height 0.22m)
      const northCurbGeo = new THREE.BoxGeometry(segLen, 0.22, 0.35);
      const northCurb = new THREE.Mesh(northCurbGeo, curbMat);
      northCurb.position.set(midX, 0.11, -6.15);
      northCurb.receiveShadow = true;
      northCurb.castShadow = true;
      this.group.add(northCurb);
    });

    // Rounded Curb Corner Returns turning into Cross Streets at Intersections
    const cornerPositions = [
      { x: -17.5, z: 12.15, rotY: Math.PI / 2 },
      { x: -17.5, z: -6.15, rotY: -Math.PI / 2 },
      { x: -2.5, z: 12.15, rotY: Math.PI / 2 },
      { x: -2.5, z: -6.15, rotY: -Math.PI / 2 },
      { x: 23.5, z: 12.15, rotY: Math.PI / 2 },
      { x: 23.5, z: -6.15, rotY: -Math.PI / 2 },
      { x: 36.5, z: 12.15, rotY: Math.PI / 2 },
      { x: 36.5, z: -6.15, rotY: -Math.PI / 2 },
    ];
    cornerPositions.forEach((cp) => {
      const cornerGeo = new THREE.BoxGeometry(0.35, 0.22, 2.0);
      const corner = new THREE.Mesh(cornerGeo, curbMat);
      corner.position.set(cp.x, 0.11, cp.z + (cp.z > 0 ? 1.0 : -1.0));
      corner.receiveShadow = true;
      this.group.add(corner);
    });

    // 2. North-South Cross Boulevard (at X = -10, width 14m: X from -17 to -3)
    // Non-overlapping segments that cleanly meet the widened 18m Main Avenue without z-fighting!
    // North Segment: Z from -130 to -6.0 (length 124m)
    const crossBlvdNorthGeo = new THREE.PlaneGeometry(14, 124);
    crossBlvdNorthGeo.rotateX(-Math.PI / 2);
    const crossBlvdNorth = new THREE.Mesh(crossBlvdNorthGeo, roadMat);
    crossBlvdNorth.position.set(-10, 0.03, -68);
    crossBlvdNorth.receiveShadow = true;
    this.group.add(crossBlvdNorth);

    // South Segment: Z from 12.0 to 50.0 (length 38m)
    const crossBlvdSouthGeo = new THREE.PlaneGeometry(14, 38);
    crossBlvdSouthGeo.rotateX(-Math.PI / 2);
    const crossBlvdSouth = new THREE.Mesh(crossBlvdSouthGeo, roadMat);
    crossBlvdSouth.position.set(-10, 0.03, 31);
    crossBlvdSouth.receiveShadow = true;
    this.group.add(crossBlvdSouth);

    // Matching Brick Sidewalks along Cross Boulevard (West side at X = -19.25, East side at X = -0.75)
    // North section (Z: -130 to -8.75)
    [-19.25, -0.75].forEach((swX) => {
      const walkGeo = new THREE.BoxGeometry(4.5, 0.16, 121.25);
      const walk = new THREE.Mesh(walkGeo, sidewalkMat);
      walk.position.set(swX, 0.08, -69.375);
      walk.receiveShadow = true;
      this.group.add(walk);
    });
    // South section (Z: 14.75 to 50)
    [-19.25, -0.75].forEach((swX) => {
      const walkGeo = new THREE.BoxGeometry(4.5, 0.16, 35.25);
      const walk = new THREE.Mesh(walkGeo, sidewalkMat);
      walk.position.set(swX, 0.08, 32.375);
      walk.receiveShadow = true;
      this.group.add(walk);
    });
    // 3. (Elevated flyover expressway removed per user instructions; avenue is wide open and clear)

    // 4. Pedestrian Foot-Overbridge across Main Avenue with Staircases at Both Ends
    this.buildPedestrianOverbridge();

    // 5. Commercial & Apartment Buildings with Bengali Shopfronts
    // All obstructing buildings relocated sideways to dedicated vacant parcels beside roads.
    // Orientations configured so front facades face directly toward their respective street.
    const buildingsData = [
      // South Shopping Row (Facing North toward Main East-West Avenue at Z = 3)
      {
        x: 11,
        z: 25,
        w: 14,
        d: 11,
        h: 22,
        color: 0xd97706,
        shopTitle: 'ঢাকা চা স্টল ও স্নাক্স',
        sub: 'DHAKA TEA STALL & FOODS',
        theme: '#9a3412',
        accent: '#fef08a',
        awningC1: '#b91c1c',
        awningC2: '#fef08a',
      },
      {
        // Relocated away from Cross Boulevard (was X = -14, now X = -27)
        x: -27,
        z: 25,
        w: 13,
        d: 11,
        h: 28,
        color: 0x0284c7,
        shopTitle: 'স্মার্ট ইলেকট্রনিক্স',
        sub: 'SMART GADGETS & PHONES',
        theme: '#0369a1',
        accent: '#38bdf8',
        awningC1: '#0284c7',
        awningC2: '#ffffff',
      },
      {
        // Relocated away from Flyover corridor (was X = -42, now X = -65)
        x: -65,
        z: 26,
        w: 18,
        d: 13,
        h: 34,
        color: 0x475569,
        shopTitle: 'সোনার বাংলা সুপারমার্কেট',
        sub: 'SHONAR BANGLA BAZAAR',
        theme: '#15803d',
        accent: '#fbbf24',
        awningC1: '#15803d',
        awningC2: '#fbbf24',
      },
      {
        x: -105,
        z: 26,
        w: 20,
        d: 13,
        h: 36,
        color: 0x1e293b,
        shopTitle: 'রূপসী বাংলা ফ্যাশন হাউস',
        sub: 'RUPOSHI BANGLA FASHION & BOUTIQUE',
        theme: '#9333ea',
        accent: '#f3e8ff',
        awningC1: '#9333ea',
        awningC2: '#fef08a',
      },

      // North Commercial Row (Facing South toward Main East-West Avenue at Z = 3)
      {
        x: 11,
        z: -21,
        w: 14,
        d: 11,
        h: 36,
        color: 0x334155,
        shopTitle: 'ফার্মেসি ও ডায়াগনস্টিক',
        sub: 'CENTRAL HEALTHCARE',
        theme: '#b91c1c',
        accent: '#ffffff',
        awningC1: '#dc2626',
        awningC2: '#ffffff',
      },
      {
        // Relocated away from Cross Boulevard (was X = -14, now X = -27)
        x: -27,
        z: -21,
        w: 13,
        d: 11,
        h: 38,
        color: 0x1e293b,
        shopTitle: 'বাংলা ক্রাফট ও বস্ত্রমেলা',
        sub: 'TRADITIONAL SILK & TEXTILES',
        theme: '#7e22ce',
        accent: '#f3e8ff',
        awningC1: '#7e22ce',
        awningC2: '#fef08a',
      },
      {
        x: -65,
        z: -21,
        w: 18,
        d: 13,
        h: 48,
        color: 0x1e293b,
        shopTitle: 'প্রাইম ব্যাংক টাওয়ার',
        sub: 'COMMERCIAL FINANCIAL PLAZA',
        theme: '#0f766e',
        accent: '#5eead4',
        awningC1: '#0f766e',
        awningC2: '#ffffff',
      },
      {
        x: -105,
        z: -21,
        w: 20,
        d: 13,
        h: 40,
        color: 0x0f766e,
        shopTitle: 'মেঘনা সুপারস্টোর',
        sub: 'MEGHNA SUPERSTORE & BAZAAR',
        theme: '#047857',
        accent: '#a7f3d0',
        awningC1: '#047857',
        awningC2: '#ffffff',
      },

      // North Commercial Plaza (Facing South toward North Avenue at Z = -50)
      {
        // Relocated away from Flyover (was X = -42, now X = -65)
        x: -65,
        z: -72,
        w: 20,
        d: 15,
        h: 44,
        color: 0x0f172a,
        shopTitle: 'গুলশান গ্র্যান্ড হোটেল ও রেস্তোরাঁ',
        sub: 'GULSHAN GRAND HOTEL & LUXURY SUITES',
        theme: '#b45309',
        accent: '#fde047',
        awningC1: '#b45309',
        awningC2: '#fde047',
      },
      {
        x: 11,
        z: -72,
        w: 16,
        d: 14,
        h: 38,
        color: 0x1e1e24,
        shopTitle: 'ধানমন্ডি বুক ক্যাফে ও লাইব্রেরি',
        sub: 'DHANMONDI BOOK CAFE & ROASTERY',
        theme: '#065f46',
        accent: '#6ee7b7',
        awningC1: '#065f46',
        awningC2: '#ffffff',
      },

      // South Waterfront Avenue (Facing North toward South Avenue at Z = 35)
      {
        x: -65,
        z: 62,
        w: 20,
        d: 14,
        h: 32,
        color: 0x334155,
        shopTitle: 'পদ্মা টেলিকম ও আইটি হাব',
        sub: 'PADMA TELECOM & DIGITAL TECH',
        theme: '#0284c7',
        accent: '#bae6fd',
        awningC1: '#0284c7',
        awningC2: '#ffffff',
      },
      {
        x: 11,
        z: 62,
        w: 15,
        d: 13,
        h: 30,
        color: 0xd97706,
        shopTitle: 'সুরমা মিষ্টি ভাণ্ডার',
        sub: 'SURMA TRADITIONAL SWEETS & BAKERY',
        theme: '#c2410c',
        accent: '#fef08a',
        awningC1: '#ea580c',
        awningC2: '#fef08a',
      },
    ];

    for (const b of buildingsData) {
      this.buildSkyscraper(
        b.x,
        b.z,
        b.w,
        b.d,
        b.h,
        b.color,
        b.shopTitle,
        b.sub,
        b.theme,
        b.accent,
        b.awningC1,
        b.awningC2,
      );
    }

    // 6. Intersecting Secondary Grid Roads (North Ave, South Ave, East River Road)
    // North Avenue (at Z = -50, width 11m) - segmented at Cross Blvd (X: -17.5 to -2.5)
    const northAveWestGeo = new THREE.PlaneGeometry(108, 11);
    northAveWestGeo.rotateX(-Math.PI / 2);
    const northAveWest = new THREE.Mesh(northAveWestGeo, roadMat);
    northAveWest.position.set(-71.5, 0.03, -50);
    northAveWest.receiveShadow = true;
    this.group.add(northAveWest);

    const northAveEastGeo = new THREE.PlaneGeometry(38, 11);
    northAveEastGeo.rotateX(-Math.PI / 2);
    const northAveEast = new THREE.Mesh(northAveEastGeo, roadMat);
    northAveEast.position.set(16.5, 0.03, -50);
    northAveEast.receiveShadow = true;
    this.group.add(northAveEast);

    // South Avenue (at Z = 35, width 11m) - segmented at Cross Blvd (X: -17.5 to -2.5)
    const southAveWestGeo = new THREE.PlaneGeometry(108, 11);
    southAveWestGeo.rotateX(-Math.PI / 2);
    const southAveWest = new THREE.Mesh(southAveWestGeo, roadMat);
    southAveWest.position.set(-71.5, 0.03, 35);
    southAveWest.receiveShadow = true;
    this.group.add(southAveWest);

    const southAveEastGeo = new THREE.PlaneGeometry(38, 11);
    southAveEastGeo.rotateX(-Math.PI / 2);
    const southAveEast = new THREE.Mesh(southAveEastGeo, roadMat);
    southAveEast.position.set(16.5, 0.03, 35);
    southAveEast.receiveShadow = true;
    this.group.add(southAveEast);

    // East River Road (at X = 30, width 12m) - segmented at Main Avenue (Z: -6 to 12)
    // North Segment: Z from -63 to -6.0 (length 57m)
    const eastRiverNorthGeo = new THREE.PlaneGeometry(12, 57);
    eastRiverNorthGeo.rotateX(-Math.PI / 2);
    const eastRiverNorth = new THREE.Mesh(eastRiverNorthGeo, roadMat);
    eastRiverNorth.position.set(30, 0.03, -34.5);
    eastRiverNorth.receiveShadow = true;
    this.group.add(eastRiverNorth);

    // South Segment: Z from 12.0 to 47.0 (length 35m)
    const eastRiverSouthGeo = new THREE.PlaneGeometry(12, 35);
    eastRiverSouthGeo.rotateX(-Math.PI / 2);
    const eastRiverSouth = new THREE.Mesh(eastRiverSouthGeo, roadMat);
    eastRiverSouth.position.set(30, 0.03, 29.5);
    eastRiverSouth.receiveShadow = true;
    this.group.add(eastRiverSouth);

    // Matching Brick Sidewalks along East River Road (West side at X = 21.75, East side at X = 38.25)
    [-1, 1].forEach((dir) => {
      const swX = 30 + dir * 8.25;
      // North sidewalk
      const nWalkGeo = new THREE.BoxGeometry(4.5, 0.16, 54.25);
      const nWalk = new THREE.Mesh(nWalkGeo, sidewalkMat);
      nWalk.position.set(swX, 0.08, -35.875);
      nWalk.receiveShadow = true;
      this.group.add(nWalk);

      // South sidewalk
      const sWalkGeo = new THREE.BoxGeometry(4.5, 0.16, 32.25);
      const sWalk = new THREE.Mesh(sWalkGeo, sidewalkMat);
      sWalk.position.set(swX, 0.08, 30.875);
      sWalk.receiveShadow = true;
      this.group.add(sWalk);
    });

    // Street Lamps along Main Avenue Sidewalks
    const lampPositionsX = [-130, -105, -80, -55, -30, 18, 42];
    lampPositionsX.forEach((lx) => {
      this.buildStreetLamp(lx, 12.5);
      this.buildStreetLamp(lx, -6.5);
    });

    // Roadside Planter Trees along sidewalks
    const treePositionsX = [-120, -95, -70, -45, 24, 45];
    treePositionsX.forEach((tx) => {
      this.buildRoadsideTree(tx, 15.8);
      this.buildRoadsideTree(tx, -9.8);
    });

    // Stationed Colorful Bangladeshi City Bus ("ঢাকা চাকা মেট্রো স্পেশাল")
    this.buildCityBus(-60, 5.5);
  }

  /**
   * Roadside Urban Tree with Concrete Planter Curb
   */
  private buildRoadsideTree(x: number, z: number) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0.16, z);

    // Concrete curb ring
    const curbGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.25, 12);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.position.y = 0.125;
    treeGroup.add(curb);

    // Soil
    const soilGeo = new THREE.CylinderGeometry(1.05, 1.05, 0.26, 12);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.95 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.13;
    treeGroup.add(soil);

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 4.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage Canopy
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
    const c1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), foliageMat);
    c1.position.y = 4.8;
    c1.castShadow = true;
    treeGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), foliageMat);
    c2.position.set(0.5, 5.8, -0.4);
    c2.castShadow = true;
    treeGroup.add(c2);

    this.group.add(treeGroup);
  }

  /**
   * Traditional Colorful Bangladeshi City Bus ("ঢাকা চাকা মেট্রো")
   */
  private buildCityBus(x: number, z: number) {
    const busGroup = new THREE.Group();
    busGroup.position.set(x, 0, z);

    // Materials
    const busBodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35, metalness: 0.3 });
    const busStripeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
    const busGlassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.75 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });

    // Lower Bus Body
    const bodyLower = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.4, 8.5), busBodyMat);
    bodyLower.position.y = 1.1;
    bodyLower.castShadow = true;
    busGroup.add(bodyLower);

    // Side colorful orange stripe
    const sideStripe = new THREE.Mesh(new THREE.BoxGeometry(2.52, 0.25, 8.52), busStripeMat);
    sideStripe.position.y = 1.0;
    busGroup.add(sideStripe);

    // Upper Cabin & Windows
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 7.8), busGlassMat);
    cabin.position.set(0, 2.3, -0.2);
    cabin.castShadow = true;
    busGroup.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.48, 0.15, 8.4), busBodyMat);
    roof.position.set(0, 2.95, -0.05);
    busGroup.add(roof);

    // Front Destination Board
    const destGeo = new THREE.BoxGeometry(1.6, 0.35, 0.1);
    const destMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xb45309, emissiveIntensity: 0.5 });
    const destBoard = new THREE.Mesh(destGeo, destMat);
    destBoard.position.set(0, 2.7, 4.22);
    busGroup.add(destBoard);

    // 6 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.32, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-1.25, 2.8],
      [1.25, 2.8],
      [-1.25, -2.4],
      [1.25, -2.4],
      [-1.25, -3.2],
      [1.25, -3.2],
    ].forEach(([wx, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, tireMat);
      wheel.position.set(wx, 0.48, wz);
      wheel.castShadow = true;
      busGroup.add(wheel);
    });

    this.group.add(busGroup);

    this.obstacles.push({
      minX: x - 1.5,
      maxX: x + 1.5,
      minZ: z - 4.5,
      maxZ: z + 4.5,
      height: 3.2,
    });
  }

  /**
   * Modern Urban Pedestrian Foot-Overbridge across Dhanmondi City Avenue
   * Spans across the widened 18m avenue at X = 0, connecting North Sidewalk (Z = -8.8) to South Sidewalk (Z = 14.8)
   * Deck elevation Y = 5.2 (Clearance = 5.0m above lower avenue roadway).
   * Features individual-step connected staircases at BOTH ends down to the sidewalk with visible stairs,
   * tubular stringers, stainless steel handrails, translucent protective canopy roof, and clearance hazard striping.
   */
  private buildPedestrianOverbridge() {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.name = 'PedestrianOverbridge';

    // Materials
    const steelGirderMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Charcoal/Slate structural steel
      roughness: 0.4,
      metalness: 0.8,
    });
    const antiSlipFloorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      metalness: 0.3,
    });
    const stairTreadMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Anti-slip ribbed steel tread
      roughness: 0.6,
      metalness: 0.5,
    });
    const handrailMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Brushed stainless steel
      roughness: 0.2,
      metalness: 0.9,
    });
    const glassCanopyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.65,
    });
    const hazardMat = createCurbTexture(); // Yellow and black hazard clearance markings

    const spanLength = 23.6; // from Z = -8.8 to 14.8
    const deckWidth = 3.2;   // from X = -1.6 to +1.6
    const deckY = 5.2;

    // 1. Main Walkway Box Girder Deck
    const deckGeo = new THREE.BoxGeometry(deckWidth, 0.4, spanLength);
    const deck = new THREE.Mesh(deckGeo, antiSlipFloorMat);
    deck.position.set(0, deckY - 0.2, 3.0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Hazard clearance warning stripe on girder bottom soffit
    const hazardGeo = new THREE.PlaneGeometry(deckWidth, spanLength);
    hazardGeo.rotateX(Math.PI / 2);
    const hazardStrip = new THREE.Mesh(
      hazardGeo,
      new THREE.MeshStandardMaterial({ map: hazardMat, roughness: 0.5 }),
    );
    hazardStrip.position.set(0, deckY - 0.41, 3.0);
    bridgeGroup.add(hazardStrip);

    // Steel Edge Fascia Trusses
    [-1, 1].forEach((sideX) => {
      const trussGeo = new THREE.BoxGeometry(0.2, 0.7, spanLength);
      const truss = new THREE.Mesh(trussGeo, steelGirderMat);
      truss.position.set(sideX * 1.6, deckY - 0.15, 3.0);
      truss.castShadow = true;
      bridgeGroup.add(truss);
    });

    // 2. Tubular Support Columns grounded in sidewalk curb line
    // North column at Z = -6.2, South column at Z = 12.2 (Height = 5.2m, clears road lanes completely)
    [-6.2, 12.2].forEach((colZ) => {
      const colGroup = new THREE.Group();
      colGroup.position.set(0, 0, colZ);

      // Concrete plinth foundation base
      const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.4, 12);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.2;
      colGroup.add(base);

      // Heavy steel portal column
      const colGeo = new THREE.CylinderGeometry(0.35, 0.35, deckY - 0.4, 16);
      const col = new THREE.Mesh(colGeo, steelGirderMat);
      col.position.y = (deckY - 0.4) / 2 + 0.2;
      col.castShadow = true;
      colGroup.add(col);

      bridgeGroup.add(colGroup);

      // Collider for column base
      this.obstacles.push({
        minX: -0.6,
        maxX: 0.6,
        minZ: colZ - 0.6,
        maxZ: colZ + 0.6,
        height: 6.0,
      });
    });

    // 3. Stainless Steel Deck Handrails & Safety Panels
    [-1, 1].forEach((sideX) => {
      const railX = sideX * 1.5;

      // Top handrail
      const handrailGeo = new THREE.BoxGeometry(0.08, 0.08, spanLength);
      const handrail = new THREE.Mesh(handrailGeo, handrailMat);
      handrail.position.set(railX, deckY + 1.1, 3.0);
      bridgeGroup.add(handrail);

      // Mid rail
      const midRail = new THREE.Mesh(handrailGeo, handrailMat);
      midRail.position.set(railX, deckY + 0.55, 3.0);
      bridgeGroup.add(midRail);

      // Vertical stanchions
      for (let z = -8.0; z <= 14.0; z += 2.0) {
        const stanchionGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
        const stanchion = new THREE.Mesh(stanchionGeo, steelGirderMat);
        stanchion.position.set(railX, deckY + 0.55, z);
        bridgeGroup.add(stanchion);
      }

      // Deck safety boundary collider
      this.obstacles.push({
        minX: railX - 0.2,
        maxX: railX + 0.2,
        minZ: -8.8,
        maxZ: 14.8,
        height: 7.0,
        minY: 4.5,
        maxY: 7.5,
      });
    });

    // 4. Modern Curved Canopy Roof with Polycarbonate Sky Panels
    const archCount = 12;
    for (let i = 0; i <= archCount; i++) {
      const az = -8.8 + (i / archCount) * spanLength;
      const archGeo = new THREE.TorusGeometry(1.8, 0.05, 8, 16, Math.PI);
      archGeo.rotateZ(Math.PI / 2);
      archGeo.rotateY(Math.PI / 2);
      const arch = new THREE.Mesh(archGeo, steelGirderMat);
      arch.position.set(0, deckY + 1.2, az);
      bridgeGroup.add(arch);
    }

    // Canopy translucent curved roof skin
    const roofGeo = new THREE.CylinderGeometry(1.82, 1.82, spanLength, 16, 1, true, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roof = new THREE.Mesh(roofGeo, glassCanopyMat);
    roof.position.set(0, deckY + 1.2, 3.0);
    bridgeGroup.add(roof);

    // 5. Individual-Step Connected Staircases at BOTH Ends Down to Sidewalk
    const buildStairs = (landingZ: number) => {
      const stepCount = 16;
      const stairLength = 8.5; // X from 0.0 to 8.5
      const totalRise = deckY - 0.16; // 5.04m
      const stepRise = totalRise / stepCount; // 0.315m
      const stepRun = stairLength / stepCount; // 0.53m
      const stairWidth = 2.4;

      // Landing Platform at top (at X = 0, Y = deckY)
      const topPlatformGeo = new THREE.BoxGeometry(3.2, 0.3, 3.2);
      const topPlatform = new THREE.Mesh(topPlatformGeo, antiSlipFloorMat);
      topPlatform.position.set(0, deckY - 0.15, landingZ);
      topPlatform.castShadow = true;
      topPlatform.receiveShadow = true;
      bridgeGroup.add(topPlatform);

      // Sloped Steel Stringers on both sides of staircase
      [-stairWidth / 2, stairWidth / 2].forEach((offsetZ) => {
        const stringerLen = Math.sqrt(stairLength * stairLength + totalRise * totalRise);
        const stringerGeo = new THREE.BoxGeometry(stringerLen, 0.25, 0.1);
        const stringer = new THREE.Mesh(stringerGeo, steelGirderMat);
        const angle = Math.atan2(totalRise, stairLength);
        stringer.rotation.z = angle;
        stringer.position.set(stairLength / 2, deckY - totalRise / 2 - 0.2, landingZ + offsetZ);
        stringer.castShadow = true;
        bridgeGroup.add(stringer);

        // Handrail above stringer
        const railGeo = new THREE.BoxGeometry(stringerLen, 0.06, 0.06);
        const rail = new THREE.Mesh(railGeo, handrailMat);
        rail.rotation.z = angle;
        rail.position.set(stairLength / 2, deckY - totalRise / 2 + 0.85, landingZ + offsetZ);
        bridgeGroup.add(rail);
      });

      // 16 Individual Visible Steps with treads and risers
      for (let s = 0; s < stepCount; s++) {
        const stepX = (s + 0.5) * stepRun;
        const stepY = deckY - (s + 1) * stepRise;

        // Individual Step Tread
        const treadGeo = new THREE.BoxGeometry(stepRun * 1.05, 0.08, stairWidth);
        const tread = new THREE.Mesh(treadGeo, stairTreadMat);
        tread.position.set(stepX, stepY + stepRise, landingZ);
        tread.castShadow = true;
        tread.receiveShadow = true;
        bridgeGroup.add(tread);

        // Individual Step Riser
        const riserGeo = new THREE.BoxGeometry(0.04, stepRise, stairWidth);
        const riser = new THREE.Mesh(riserGeo, steelGirderMat);
        riser.position.set(stepX - stepRun * 0.45, stepY + stepRise / 2, landingZ);
        bridgeGroup.add(riser);

        // Vertical handrail balusters every 2 steps
        if (s % 2 === 0) {
          [-stairWidth / 2, stairWidth / 2].forEach((offsetZ) => {
            const balusterGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.9, 6);
            const baluster = new THREE.Mesh(balusterGeo, steelGirderMat);
            baluster.position.set(stepX, stepY + stepRise + 0.45, landingZ + offsetZ);
            bridgeGroup.add(baluster);
          });
        }
      }

      // Bottom Entrance Gateway Post on Sidewalk
      [-stairWidth / 2, stairWidth / 2].forEach((offsetZ) => {
        const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.2, 8);
        const post = new THREE.Mesh(postGeo, steelGirderMat);
        post.position.set(stairLength, 0.7, landingZ + offsetZ);
        bridgeGroup.add(post);
      });

      // Obstacle collision for stair sides
      this.obstacles.push({
        minX: 0,
        maxX: stairLength,
        minZ: landingZ - stairWidth / 2 - 0.3,
        maxZ: landingZ - stairWidth / 2 + 0.1,
        height: deckY + 1.5,
      });
      this.obstacles.push({
        minX: 0,
        maxX: stairLength,
        minZ: landingZ + stairWidth / 2 - 0.1,
        maxZ: landingZ + stairWidth / 2 + 0.3,
        height: deckY + 1.5,
      });
    };

    // South End Staircase (on South sidewalk Z = 14.8)
    buildStairs(14.8);

    // North End Staircase (on North sidewalk Z = -8.8)
    buildStairs(-8.8);

    this.group.add(bridgeGroup);
  }

  private buildSkyscraper(
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    color: number,
    shopTitle: string,
    sub: string,
    theme: string,
    accent: string,
    awningC1 = '#b91c1c',
    awningC2 = '#fef08a',
  ) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(x, 0, z);

    // Main Tower with realistic concrete/plaster material
    const towerGeo = new THREE.BoxGeometry(w, h, d);
    const towerMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.65,
      metalness: 0.25,
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = h / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    buildingGroup.add(tower);

    // Architectural Facade Orientation: front faces the street
    const frontFacing = z > 0 ? -1 : 1;
    const facadeZ = (frontFacing * d) / 2;

    // 1. Decorative Parapet Roof Cornice Trim
    const corniceGeo = new THREE.BoxGeometry(w + 0.6, 0.5, d + 0.6);
    const corniceMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const cornice = new THREE.Mesh(corniceGeo, corniceMat);
    cornice.position.y = h + 0.25;
    cornice.castShadow = true;
    buildingGroup.add(cornice);

    // 2. Balconies on Upper Floors with Extruded Concrete Slabs & Metal Railings
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.4 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const balconyZ = facadeZ + frontFacing * 0.7;

    for (let floor = 8; floor < h - 4; floor += 4.5) {
      [-w * 0.25, w * 0.25].forEach((bx) => {
        // Balcony slab
        const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.28, 1.4), balconyMat);
        slab.position.set(bx, floor, balconyZ);
        slab.castShadow = true;
        buildingGroup.add(slab);

        // Railing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.85, 0.1), railingMat);
        rail.position.set(bx, floor + 0.45, balconyZ + frontFacing * 0.65);
        buildingGroup.add(rail);

        // AC Outdoor Unit mounted below balcony (Iconic Bangladeshi urban detail)
        const acGeo = new THREE.BoxGeometry(0.85, 0.55, 0.45);
        const acMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
        const acUnit = new THREE.Mesh(acGeo, acMat);
        acUnit.position.set(bx - 1.2, floor - 0.7, facadeZ + frontFacing * 0.3);
        acUnit.castShadow = true;
        buildingGroup.add(acUnit);
      });

      // Recessed Windows with Concrete Sills
      [-w * 0.25, w * 0.25].forEach((wx) => {
        const windowGeo = new THREE.BoxGeometry(2.4, 1.8, 0.1);
        const windowMat = new THREE.MeshStandardMaterial({
          color: 0x0f172a,
          roughness: 0.1,
          metalness: 0.9,
        });
        const win = new THREE.Mesh(windowGeo, windowMat);
        win.position.set(wx, floor + 1.6, facadeZ + frontFacing * 0.05);
        buildingGroup.add(win);

        // Concrete Sill
        const sillGeo = new THREE.BoxGeometry(2.6, 0.12, 0.3);
        const sill = new THREE.Mesh(sillGeo, corniceMat);
        sill.position.set(wx, floor + 0.65, facadeZ + frontFacing * 0.15);
        buildingGroup.add(sill);
      });
    }

    // 3. 3D Entrance Portal Door Recess (Walk-in shop entrance)
    const doorFrameGeo = new THREE.BoxGeometry(3.6, 3.8, 0.6);
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
    const doorFrame = new THREE.Mesh(doorFrameGeo, doorFrameMat);
    doorFrame.position.set(0, 1.9, facadeZ + frontFacing * 0.2);
    doorFrame.castShadow = true;
    buildingGroup.add(doorFrame);

    // Double Glass Doors
    const doorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7,
    });
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 3.2, 0.08), doorGlassMat);
    doorMesh.position.set(0, 1.8, facadeZ + frontFacing * 0.22);
    buildingGroup.add(doorMesh);

    // Granite Entrance Doorstep Slab connecting to sidewalk
    const stepGeo = new THREE.BoxGeometry(4.2, 0.16, 1.2);
    const stepMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
    const step = new THREE.Mesh(stepGeo, stepMat);
    step.position.set(0, 0.08, facadeZ + frontFacing * 0.7);
    step.receiveShadow = true;
    buildingGroup.add(step);

    // 4. Rooftop Water Tank (Iconic Bangladeshi urban roof detail)
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(w * 0.25, h + 1.4, d * 0.25);
    buildingGroup.add(tank);

    // 5. Rooftop Communication Antenna
    const antGeo = new THREE.CylinderGeometry(0.06, 0.1, 5.5, 6);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.set(-w * 0.25, h + 2.75, -d * 0.25);
    buildingGroup.add(antenna);

    // 6. Ground Floor Bengali Shopfront Signboard
    const shopTex = createShopfrontTexture(shopTitle, sub, theme, accent);
    const shopGeo = new THREE.PlaneGeometry(w * 0.9, 4.5);
    const shopMat = new THREE.MeshStandardMaterial({
      map: shopTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const shopSign = new THREE.Mesh(shopGeo, shopMat);

    // Sloped Fabric Shop Awning with Scalloped Edge
    const awningTex = createAwningTexture(awningC1, awningC2);
    const awningGeo = new THREE.PlaneGeometry(w * 0.85, 2.4);
    const awningMat = new THREE.MeshStandardMaterial({
      map: awningTex,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);

    // Orient toward street (+Z or -Z depending on location)
    if (z > 0) {
      shopSign.position.set(0, 2.6, -d / 2 - 0.05);
      shopSign.rotation.y = Math.PI;

      awning.position.set(0, 2.2, -d / 2 - 1.1);
      awning.rotation.x = Math.PI * 0.35;
    } else {
      shopSign.position.set(0, 2.6, d / 2 + 0.05);

      awning.position.set(0, 2.2, d / 2 + 1.1);
      awning.rotation.x = -Math.PI * 0.35;
    }
    buildingGroup.add(shopSign);
    buildingGroup.add(awning);

    this.group.add(buildingGroup);

    // Register obstacle collider
    this.obstacles.push({
      minX: x - w / 2 - 0.5,
      maxX: x + w / 2 + 0.5,
      minZ: z - d / 2 - 0.5,
      maxZ: z + d / 2 + 0.5,
      height: h,
    });
  }

  private buildStreetLamp(x: number, z: number) {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(x, 0, z);

    const poleGeo = new THREE.CylinderGeometry(0.12, 0.15, 6.5, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.25;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Lantern Head
    const headGeo = new THREE.BoxGeometry(0.6, 0.3, 0.6);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 0.6,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 6.4, 0);
    lampGroup.add(head);

    this.group.add(lampGroup);
  }

  /**
   * Region B: Bengali Countryside & Shonar Village
   */
  private buildVillageRegion() {
    const villageHuts = [
      { x: 150, z: 75, rot: 0.3 },
      { x: 175, z: 85, rot: -0.2 },
      { x: 145, z: 110, rot: 0.8 },
      { x: 180, z: 130, rot: -0.5 },
      { x: 165, z: 155, rot: 0.1 },
    ];

    for (const hut of villageHuts) {
      this.buildVillageHut(hut.x, hut.z, hut.rot);
    }

    // Banana & Coconut Palm Trees in village
    for (let i = 0; i < 35; i++) {
      const tx = 130 + Math.random() * 80;
      const tz = 50 + Math.random() * 120;
      this.buildPalmTree(tx, tz);
    }

    // Village Tea Tong (small roadside tea stall with wooden benches)
    this.buildVillageTeaTong(160, 95);
  }

  private buildVillageHut(x: number, z: number, rotY: number) {
    const groundY = this.getTerrainHeight(x, z);
    const hutGroup = new THREE.Group();
    hutGroup.position.set(x, groundY, z);
    hutGroup.rotation.y = rotY;

    // Clay / Brick Base Walls
    const wallGeo = new THREE.BoxGeometry(7, 3.2, 5.5);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x9c7a5b, // Warm earthen clay
      roughness: 0.95,
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = 1.6;
    walls.castShadow = true;
    walls.receiveShadow = true;
    hutGroup.add(walls);

    // Weathered Corrugated Tin Roof (Slanted Gable)
    const tinTex = createTinRoofTexture();
    const roofGeo = new THREE.ConeGeometry(5.2, 2.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({
      map: tinTex,
      roughness: 0.7,
      metalness: 0.3,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.3;
    roof.castShadow = true;
    hutGroup.add(roof);

    // Veranda Wooden Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.09, 0.09, 2.8, 8);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    [-2.8, 2.8].forEach((px) => {
      const p = new THREE.Mesh(pillarGeo, woodMat);
      p.position.set(px, 1.4, 3.2);
      p.castShadow = true;
      hutGroup.add(p);
    });

    this.group.add(hutGroup);

    this.obstacles.push({
      minX: x - 4.2,
      maxX: x + 4.2,
      minZ: z - 3.5,
      maxZ: z + 3.5,
      height: 5.5,
    });
  }

  private buildPalmTree(x: number, z: number) {
    const y = this.getTerrainHeight(x, z);
    if (y < 0.2) return; // don't grow in deep water

    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);

    // Curved Trunk
    const trunkHeight = 6.5 + Math.random() * 2.5;
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.32, trunkHeight, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4f3b, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.rotation.z = (Math.random() - 0.5) * 0.15;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Palm Fronds
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });

    for (let f = 0; f < 7; f++) {
      const angle = (f / 7) * Math.PI * 2;
      const frondGeo = new THREE.ConeGeometry(0.65, 3.8, 4);
      frondGeo.rotateX(Math.PI / 3);
      frondGeo.rotateY(angle);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0, trunkHeight, 0);
      frond.castShadow = true;
      treeGroup.add(frond);
    }

    this.group.add(treeGroup);
  }

  private buildVillageTeaTong(x: number, z: number) {
    const y = this.getTerrainHeight(x, z);
    const tongGroup = new THREE.Group();
    tongGroup.position.set(x, y, z);

    // Wooden stall counter
    const counterGeo = new THREE.BoxGeometry(4.5, 1.2, 2.2);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const counter = new THREE.Mesh(counterGeo, woodMat);
    counter.position.y = 0.6;
    counter.castShadow = true;
    tongGroup.add(counter);

    // Steaming Tea Kettle (Aluminum / Steel)
    const kettleGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.6, 12);
    const kettleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const kettle = new THREE.Mesh(kettleGeo, kettleMat);
    kettle.position.set(-0.8, 1.5, 0);
    tongGroup.add(kettle);

    // Canopy Roof
    const canopyGeo = new THREE.BoxGeometry(5.2, 0.15, 3.2);
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 2.8;
    tongGroup.add(canopy);

    this.group.add(tongGroup);

    this.obstacles.push({
      minX: x - 2.5,
      maxX: x + 2.5,
      minZ: z - 1.5,
      maxZ: z + 1.5,
      height: 3.0,
    });
  }

  /**
   * Region C: Mountain Range, Scenic Trail, and Cascading Waterfall
   */
  private buildHillsAndWaterfall() {
    const wfX = 270;
    const wfZ = -95;
    const wfHeight = 32;

    // 1. Cascading Animated Waterfall Mesh
    const wfGeo = new THREE.PlaneGeometry(16, wfHeight, 8, 24);
    const wfMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
    });
    this.waterfallMesh = new THREE.Mesh(wfGeo, wfMat);
    this.waterfallMesh.position.set(wfX, wfHeight / 2 + 1, wfZ);
    this.waterfallMesh.rotation.y = Math.PI * 0.15;
    this.group.add(this.waterfallMesh);

    // Plunge pool at bottom of waterfall
    const poolGeo = new THREE.CylinderGeometry(18, 18, 1.2, 24);
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9,
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(wfX - 6, 1.5, wfZ + 10);
    this.group.add(pool);

    // 2. Scenic Mountain Viewpoint Suspension Bridge
    const mtnBridgeGeo = new THREE.BoxGeometry(28, 0.5, 3.5);
    const mtnBridgeMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    const mtnBridge = new THREE.Mesh(mtnBridgeGeo, mtnBridgeMat);
    mtnBridge.position.set(245, 22, -80);
    mtnBridge.rotation.y = -0.3;
    mtnBridge.castShadow = true;
    this.group.add(mtnBridge);

    // Glowing Ancient Waterfall Relic on the Scenic Mountain Suspension Bridge Overlook (For Quest 3)
    const relicGeo = new THREE.OctahedronGeometry(0.65, 0);
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const relic = new THREE.Mesh(relicGeo, relicMat);
    relic.position.set(245, 23.2, -80);
    relic.name = 'QuestRelic';
    this.group.add(relic);

    // 3. Sprawling Winding Mountain Highway with Switchbacks & Steel Guardrails
    const mtnRoadMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3,
    });

    const switchbacks = [
      { x: 195, y: 3.5, z: -35, len: 45, rotY: -0.25 },
      { x: 220, y: 9.0, z: -60, len: 42, rotY: 0.45 },
      { x: 235, y: 15.5, z: -75, len: 38, rotY: -0.15 },
      { x: 248, y: 21.8, z: -80, len: 32, rotY: -0.3 },
    ];

    switchbacks.forEach((sb) => {
      const segGeo = new THREE.BoxGeometry(sb.len, 0.3, 7.5);
      const seg = new THREE.Mesh(segGeo, mtnRoadMat);
      seg.position.set(sb.x, sb.y, sb.z);
      seg.rotation.y = sb.rotY;
      seg.receiveShadow = true;
      this.group.add(seg);

      // Outer Safety Guardrail
      const guardGeo = new THREE.BoxGeometry(sb.len, 0.75, 0.25);
      const guard = new THREE.Mesh(guardGeo, railMat);
      guard.position.set(sb.x, sb.y + 0.5, sb.z + 3.8);
      guard.rotation.y = sb.rotY;
      this.group.add(guard);
    });
  }

  /**
   * Boundless Horizon: Distant Atmospheric Mountains
   * Prevents outdoor scene from ever looking like a floating box in empty void!
   */
  private buildHorizonDistantMountains() {
    const horizonGroup = new THREE.Group();
    const radius = 380;
    const mtnCount = 20;

    const mtnGeo = new THREE.ConeGeometry(55, 75, 5);
    const mtnMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Distant hazy blue/slate
      roughness: 0.95,
      metalness: 0.05,
    });

    for (let i = 0; i < mtnCount; i++) {
      const angle = (i / mtnCount) * Math.PI * 2;
      const x = Math.sin(angle) * (radius + (Math.random() - 0.5) * 60);
      const z = Math.cos(angle) * (radius + (Math.random() - 0.5) * 60);
      const mtn = new THREE.Mesh(mtnGeo, mtnMat);
      mtn.position.set(x, 25 + Math.random() * 20, z);
      const scaleH = 0.8 + Math.random() * 0.6;
      mtn.scale.set(1 + Math.random() * 0.5, scaleH, 1 + Math.random() * 0.5);
      horizonGroup.add(mtn);
    }

    this.group.add(horizonGroup);
  }

  /**
   * Per-frame animation for water shader waves and waterfall flow
   */
  public update(delta: number) {
    this.waterfallTexOffset += delta * 1.8;
    this.riverTexOffset += delta * 0.35;

    if (this.waterfallMesh) {
      // Bobbing waterfall plane ripple
      this.waterfallMesh.position.y += Math.sin(this.waterfallTexOffset * 4) * 0.003;
    }

    if (this.riverMesh) {
      this.riverMesh.position.y = -0.4 + Math.sin(this.riverTexOffset * 2.5) * 0.035;
    }

    if (this.riverWaterTex) {
      this.riverWaterTex.offset.y -= delta * 0.08;
      this.riverWaterTex.offset.x = Math.sin(this.riverTexOffset * 1.5) * 0.02;
    }

    if (this.kaifengBridge) {
      this.kaifengBridge.update(delta, performance.now());
    }
  }

  /**
   * Collision check against all registered solid obstacles
   * Supports vertical elevation bounds (minY, maxY) so elevated structures don't block ground traffic
   */
  public checkObstacleCollision(x: number, z: number, radius = 0.5, y?: number): boolean {
    for (const obs of this.obstacles) {
      if (
        x + radius >= obs.minX &&
        x - radius <= obs.maxX &&
        z + radius >= obs.minZ &&
        z - radius <= obs.maxZ
      ) {
        // Vertical height check if obstacle has elevation bounds
        if (y !== undefined && obs.minY !== undefined && obs.maxY !== undefined) {
          if (y + 1.8 < obs.minY || y > obs.maxY) {
            continue; // Entity is underneath or above the obstacle!
          }
        }
        return true;
      }
    }
    return false;
  }
}
