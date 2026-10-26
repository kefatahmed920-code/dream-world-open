/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export interface WorldObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
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
 */
function createBrickSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base mortar grout color
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(0, 0, 256, 256);

  // Red/Terracotta Paver Bricks in Stretcher Bond
  const brickH = 16;
  const brickW = 32;
  const colors = ['#b91c1c', '#991b1b', '#c2410c', '#a16207', '#b45309'];

  let row = 0;
  for (let y = 0; y < 256; y += brickH) {
    const offset = (row % 2) * (brickW / 2);
    for (let x = -brickW; x < 256 + brickW; x += brickW) {
      const colIdx = Math.floor(Math.abs(Math.sin(x * 12 + y * 7)) * colors.length);
      ctx.fillStyle = colors[colIdx];
      ctx.fillRect(x + offset + 1.5, y + 1.5, brickW - 3, brickH - 3);

      // Subtle surface grain
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(x + offset + 3, y + 3, brickW - 6, brickH - 6);
    }
    row++;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedural Black-and-Yellow Road Curb Texture
 */
function createCurbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const stripeW = 32;
  for (let x = 0; x < 256; x += stripeW * 2) {
    ctx.fillStyle = '#facc15'; // Dhaka Safety Yellow
    ctx.fillRect(x, 0, stripeW, 64);
    ctx.fillStyle = '#0f172a'; // Road Black
    ctx.fillRect(x + stripeW, 0, stripeW, 64);
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
 * Procedural Road Asphalt Texture with White Markings
 */
function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#1c1f24';
  ctx.fillRect(0, 0, 256, 256);

  // Asphalt grain noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const brightness = Math.random() * 40;
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, 0.2)`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Center dashed yellow/white line
  ctx.fillStyle = '#f6e05e';
  ctx.fillRect(124, 20, 8, 80);
  ctx.fillRect(124, 156, 8, 80);

  // Edge solid white curbs
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(6, 0, 8, 256);
  ctx.fillRect(242, 0, 8, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
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

export class WorldTerrain {
  public group: THREE.Group;
  public obstacles: WorldObstacle[] = [];
  public waterfallMesh: THREE.Mesh | null = null;
  public riverMesh: THREE.Mesh | null = null;

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
  public getTerrainHeight(x: number, z: number): number {
    // 1. Grand Bridge Deck (Crossing the Padma River at Z between -20 and +30, X between 50 and 120)
    if (x >= 50 && x <= 125 && z >= -18 && z <= 24) {
      // Smooth approach ramp on both sides
      if (x < 65) {
        return THREE.MathUtils.lerp(0.0, 4.2, (x - 50) / 15);
      } else if (x > 110) {
        return THREE.MathUtils.lerp(4.2, 0.5, (x - 110) / 15);
      }
      return 4.2; // Bridge deck height
    }

    // 2. Flyover Expressway in City (X between -80 and -20, Z between -120 and 40)
    if (x >= -45 && x <= -25 && z >= -100 && z <= 30) {
      if (z < -80) {
        return THREE.MathUtils.lerp(0.0, 7.5, (z - -100) / 20);
      } else if (z > 15) {
        return THREE.MathUtils.lerp(7.5, 0.0, (z - 15) / 15);
      }
      return 7.5; // Flyover elevation
    }

    // 3. Wide River Channel (X between 65 and 110, anywhere outside bridge)
    const riverDist = Math.abs(x - 87.5);
    if (riverDist < 25) {
      const riverDepth = -3.2 * (1 - riverDist / 25);
      return riverDepth;
    }

    // 4. Mountain & Waterfall Range (X > 190, Z < 10)
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
        // Flatten trail slope for smooth walking/driving
        return Math.max(0.5, baseMountain * 0.45);
      }

      return Math.max(0.5, baseMountain);
    }

    // 5. Bengali Countryside & Village (X: 115 to 220, Z: 30 to 180)
    if (x >= 115 && z >= 25) {
      // Gentle rolling agricultural mounds and paddy bunds
      const ridge = Math.sin(x * 0.08) * 0.4 + Math.cos(z * 0.08) * 0.4;
      return 0.5 + ridge;
    }

    // 6. City Region (Flat paved surface)
    return 0.0;
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
      const y = this.getTerrainHeight(x, z);
      pos.setY(i, y);

      // Vertex color blending based on region & altitude
      let r = 0.22, g = 0.42, b = 0.18; // Default lush green

      if (x < 65) {
        // City paved zone
        r = 0.28; g = 0.3; b = 0.32;
      } else if (Math.abs(x - 87.5) < 26) {
        // Riverbed silt / sand
        r = 0.45; g = 0.4; b = 0.28;
      } else if (y > 12) {
        // Mountain rocky slopes
        r = 0.42; g = 0.44; b = 0.38;
      } else if (x > 115 && z > 30) {
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
   * River Padma and the Grand Suspension Bridge
   */
  private buildRiverAndBridge() {
    // 1. Animated River Water
    const riverGeo = new THREE.PlaneGeometry(60, 650, 1, 60);
    riverGeo.rotateX(-Math.PI / 2);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x1a4855,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85,
    });
    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.position.set(87.5, -0.4, 0);
    this.group.add(this.riverMesh);

    // 2. Grand Bridge Deck
    const bridgeLength = 75;
    const bridgeWidth = 14;
    const bridgeGeo = new THREE.BoxGeometry(bridgeLength, 0.9, bridgeWidth);
    const bridgeRoadTex = createRoadTexture();
    const bridgeMat = new THREE.MeshStandardMaterial({
      map: bridgeRoadTex,
      roughness: 0.7,
      metalness: 0.2,
    });
    const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridgeMesh.position.set(87.5, 3.8, 3);
    bridgeMesh.castShadow = true;
    bridgeMesh.receiveShadow = true;
    this.group.add(bridgeMesh);

    // Bridge Concrete Pylons
    [-1, 1].forEach((side) => {
      const pylonGeo = new THREE.BoxGeometry(4.5, 24, 2.5);
      const pylonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
      const pylon = new THREE.Mesh(pylonGeo, pylonMat);
      pylon.position.set(87.5 + side * 22, 10, 3);
      pylon.castShadow = true;
      this.group.add(pylon);

      // Suspension Cables
      const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, 48, 8);
      cableGeo.rotateZ(side * 0.45);
      const cableMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.9, roughness: 0.2 });
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(87.5 + side * 11, 12, 3);
      this.group.add(cable);
    });

    // Bridge Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    [-1, 1].forEach((sideZ) => {
      const railGeo = new THREE.BoxGeometry(bridgeLength, 1.2, 0.4);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(87.5, 4.8, 3 + sideZ * (bridgeWidth / 2 - 0.3));
      rail.castShadow = true;
      this.group.add(rail);

      this.obstacles.push({
        minX: 50,
        maxX: 125,
        minZ: 3 + sideZ * (bridgeWidth / 2 - 0.3) - 0.3,
        maxZ: 3 + sideZ * (bridgeWidth / 2 - 0.3) + 0.3,
        height: 5.5,
      });
    });

    // 3. Wooden Country Boats ('Nouka') bobbing along the pier
    this.buildCountryBoats(118, 95);
  }

  /**
   * Country Boats ('Nouka') and Wooden Fishing Pier
   */
  private buildCountryBoats(pierX: number, pierZ: number) {
    // Wooden pier
    const pierGeo = new THREE.BoxGeometry(22, 0.4, 4);
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const pier = new THREE.Mesh(pierGeo, woodMat);
    pier.position.set(pierX - 8, 0.3, pierZ);
    pier.receiveShadow = true;
    this.group.add(pier);

    // Traditional Bengali Boat ('Nouka')
    const boatGroup = new THREE.Group();
    boatGroup.position.set(pierX - 18, -0.2, pierZ + 4);

    // Curved Hull
    const hullGeo = new THREE.CylinderGeometry(1.8, 1.2, 7.5, 12, 1, false, 0, Math.PI);
    hullGeo.rotateZ(Math.PI / 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.85 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    boatGroup.add(hull);

    // Bamboo Hood ('Chhoi')
    const hoodGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.2, 12, 1, false, 0, Math.PI);
    hoodGeo.rotateZ(Math.PI / 2);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xc4a46c, roughness: 0.95 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 0.5, 0);
    boatGroup.add(hood);

    this.group.add(boatGroup);
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

    // 1. Main East-West Avenue (from X = -140 to Bridge at X = 50)
    const mainAvenueGeo = new THREE.PlaneGeometry(190, 14);
    mainAvenueGeo.rotateX(-Math.PI / 2);
    const mainAvenue = new THREE.Mesh(mainAvenueGeo, roadMat);
    mainAvenue.position.set(-45, 0.03, 3);
    mainAvenue.receiveShadow = true;
    this.group.add(mainAvenue);

    // 1B. Brick-Pattern Sidewalks (North & South)
    const brickTex = createBrickSidewalkTexture();
    const sidewalkMat = new THREE.MeshStandardMaterial({
      map: brickTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    // South Sidewalk (Z = 12.5, width 5m)
    const southWalkGeo = new THREE.BoxGeometry(190, 0.16, 5);
    const southWalk = new THREE.Mesh(southWalkGeo, sidewalkMat);
    southWalk.position.set(-45, 0.08, 12.5);
    southWalk.receiveShadow = true;
    this.group.add(southWalk);

    // North Sidewalk (Z = -6.5, width 5m)
    const northWalkGeo = new THREE.BoxGeometry(190, 0.16, 5);
    const northWalk = new THREE.Mesh(northWalkGeo, sidewalkMat);
    northWalk.position.set(-45, 0.08, -6.5);
    northWalk.receiveShadow = true;
    this.group.add(northWalk);

    // 1C. Black-and-Yellow Road Curbs
    const curbTex = createCurbTexture();
    const curbMat = new THREE.MeshStandardMaterial({
      map: curbTex,
      roughness: 0.6,
      metalness: 0.1,
    });

    // South Curb (at Z = 10)
    const southCurbGeo = new THREE.BoxGeometry(190, 0.22, 0.35);
    const southCurb = new THREE.Mesh(southCurbGeo, curbMat);
    southCurb.position.set(-45, 0.11, 10.15);
    southCurb.receiveShadow = true;
    southCurb.castShadow = true;
    this.group.add(southCurb);

    // North Curb (at Z = -4)
    const northCurbGeo = new THREE.BoxGeometry(190, 0.22, 0.35);
    const northCurb = new THREE.Mesh(northCurbGeo, curbMat);
    northCurb.position.set(-45, 0.11, -4.15);
    northCurb.receiveShadow = true;
    northCurb.castShadow = true;
    this.group.add(northCurb);

    // 2. North-South Cross Boulevard (at X = -10, Z from -130 to 50)
    const crossBlvdGeo = new THREE.PlaneGeometry(14, 180);
    crossBlvdGeo.rotateX(-Math.PI / 2);
    const crossBlvd = new THREE.Mesh(crossBlvdGeo, roadMat);
    crossBlvd.position.set(-10, 0.03, -40);
    crossBlvd.receiveShadow = true;
    this.group.add(crossBlvd);

    // 3. Flyover Expressway (Elevated road along Z = -100 to 30 at X = -35)
    const flyoverGeo = new THREE.BoxGeometry(10, 0.8, 130);
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const flyover = new THREE.Mesh(flyoverGeo, concreteMat);
    flyover.position.set(-35, 7.5, -35);
    flyover.castShadow = true;
    flyover.receiveShadow = true;
    this.group.add(flyover);

    // Flyover Concrete Guardrails (with safety markers)
    [-1, 1].forEach((sideX) => {
      const railGeo = new THREE.BoxGeometry(0.35, 1.1, 130);
      const rail = new THREE.Mesh(railGeo, curbMat);
      rail.position.set(-35 + sideX * 4.8, 8.4, -35);
      rail.castShadow = true;
      this.group.add(rail);

      this.obstacles.push({
        minX: -35 + sideX * 4.8 - 0.3,
        maxX: -35 + sideX * 4.8 + 0.3,
        minZ: -100,
        maxZ: 30,
        height: 9.0,
      });
    });

    // Flyover Support Pillars
    for (let pz = -90; pz <= 20; pz += 25) {
      const pillarGeo = new THREE.CylinderGeometry(1.2, 1.2, 7.5, 12);
      const pillar = new THREE.Mesh(pillarGeo, concreteMat);
      pillar.position.set(-35, 3.75, pz);
      pillar.castShadow = true;
      this.group.add(pillar);

      this.obstacles.push({
        minX: -36.5,
        maxX: -33.5,
        minZ: pz - 1.5,
        maxZ: pz + 1.5,
        height: 7.5,
      });
    }

    // 4. Commercial & Apartment Buildings with Bengali Shopfronts
    const buildingsData = [
      // Dhanmondi Cha Stall & Shopping Row (Near Player Spawn)
      {
        x: 14,
        z: 22,
        w: 16,
        d: 12,
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
        x: -14,
        z: 22,
        w: 18,
        d: 12,
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
        x: -42,
        z: 22,
        w: 20,
        d: 14,
        h: 34,
        color: 0x475569,
        shopTitle: 'সোনার বাংলা সুপারমার্কেট',
        sub: 'SHONAR BANGLA BAZAAR',
        theme: '#15803d',
        accent: '#fbbf24',
        awningC1: '#15803d',
        awningC2: '#fbbf24',
      },
      // North Commercial Towers
      {
        x: 14,
        z: -18,
        w: 16,
        d: 14,
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
        x: -14,
        z: -18,
        w: 18,
        d: 14,
        h: 42,
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
        z: -18,
        w: 22,
        d: 16,
        h: 48,
        color: 0x1e293b,
        shopTitle: 'প্রাইম ব্যাংক টাওয়ার',
        sub: 'COMMERCIAL FINANCIAL PLAZA',
        theme: '#0f766e',
        accent: '#5eead4',
        awningC1: '#0f766e',
        awningC2: '#ffffff',
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

    // Street Lamps along the Avenue
    for (let lx = -90; lx <= 40; lx += 25) {
      this.buildStreetLamp(lx, 10.5);
      this.buildStreetLamp(lx, -4.5);
    }

    // Roadside Planter Trees along the sidewalk
    for (let tx = -85; tx <= 35; tx += 20) {
      this.buildRoadsideTree(tx, 14.5);
      this.buildRoadsideTree(tx, -8.5);
    }

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

    // Main Tower
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

    // Balconies on Upper Floors
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5, metalness: 0.4 });
    const railingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.8 });
    const frontFacing = z > 0 ? -1 : 1;
    const balconyZ = (frontFacing * d) / 2 + frontFacing * 0.7;

    for (let floor = 7; floor < h - 4; floor += 4.5) {
      [-w * 0.25, w * 0.25].forEach((bx) => {
        // Balcony slab
        const slab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.25, 1.4), balconyMat);
        slab.position.set(bx, floor, balconyZ);
        slab.castShadow = true;
        buildingGroup.add(slab);

        // Railing
        const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.1), railingMat);
        rail.position.set(bx, floor + 0.45, balconyZ + frontFacing * 0.65);
        buildingGroup.add(rail);
      });
    }

    // Rooftop Water Tank (Iconic Bangladeshi urban roof detail)
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(w * 0.25, h + 1.4, d * 0.25);
    buildingGroup.add(tank);

    // Rooftop Communication Antenna
    const antGeo = new THREE.CylinderGeometry(0.06, 0.1, 5.5, 6);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
    const antenna = new THREE.Mesh(antGeo, antMat);
    antenna.position.set(-w * 0.25, h + 2.75, -d * 0.25);
    buildingGroup.add(antenna);

    // Ground Floor Bengali Shopfront Billboard
    const shopTex = createShopfrontTexture(shopTitle, sub, theme, accent);
    const shopGeo = new THREE.PlaneGeometry(w * 0.9, 4.5);
    const shopMat = new THREE.MeshStandardMaterial({
      map: shopTex,
      roughness: 0.5,
      metalness: 0.1,
    });
    const shopSign = new THREE.Mesh(shopGeo, shopMat);

    // Sloped Fabric Shop Awning
    const awningTex = createAwningTexture(awningC1, awningC2);
    const awningGeo = new THREE.PlaneGeometry(w * 0.85, 2.2);
    const awningMat = new THREE.MeshStandardMaterial({
      map: awningTex,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const awning = new THREE.Mesh(awningGeo, awningMat);

    // Face the street (+z or -z based on location)
    if (z > 0) {
      shopSign.position.set(0, 2.6, -d / 2 - 0.05);
      shopSign.rotation.y = Math.PI;

      awning.position.set(0, 2.2, -d / 2 - 1.0);
      awning.rotation.x = Math.PI * 0.35;
    } else {
      shopSign.position.set(0, 2.6, d / 2 + 0.05);

      awning.position.set(0, 2.2, d / 2 + 1.0);
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

    // Relic Pedestal inside the Waterfall Grotto (For Quest 3)
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.5, 1.4, 12);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
    const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
    pedestal.position.set(wfX + 2, 2.2, wfZ - 6);
    pedestal.castShadow = true;
    this.group.add(pedestal);

    // Glowing Ancient Waterfall Relic / Crystal
    const relicGeo = new THREE.OctahedronGeometry(0.65, 0);
    const relicMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const relic = new THREE.Mesh(relicGeo, relicMat);
    relic.position.set(wfX + 2, 3.4, wfZ - 6);
    relic.name = 'QuestRelic';
    this.group.add(relic);
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
      this.riverMesh.position.y = -0.4 + Math.sin(this.riverTexOffset * 2) * 0.05;
    }
  }

  /**
   * Collision check against all registered solid obstacles
   */
  public checkObstacleCollision(x: number, z: number, radius = 0.5): boolean {
    for (const obs of this.obstacles) {
      if (
        x + radius >= obs.minX &&
        x - radius <= obs.maxX &&
        z + radius >= obs.minZ &&
        z - radius <= obs.maxZ
      ) {
        return true;
      }
    }
    return false;
  }
}
