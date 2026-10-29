/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GAME_HOUSE_CONFIG } from './gameHouseConfig';
import { MagicDoorManager } from './MagicDoorManager';
import { WorldObstacle } from '../game/world/terrain';

/**
 * Creates high-resolution signboard texture for Game House Entrance
 */
function createGameHouseSignboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep obsidian gloss background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1024, 256);

  // Holographic border
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 1004, 236);

  // Inner gold trim
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 984, 216);

  // English Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DREAM WORLD GAME HOUSE', 512, 70);

  // Bengali Subtitle
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
  ctx.fillText('ড্রিম ওয়ার্ল্ড গেম হাউস · MODULE 02', 512, 135);

  // Tagline
  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('★ 12 MAGICAL GATEWAYS · MULTI-STOREY GAMING ARENA ★', 512, 195);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class GameHouseBuilding {
  public group = new THREE.Group();
  public doorManager: MagicDoorManager;
  public obstacles: WorldObstacle[] = [];

  constructor() {
    this.doorManager = new MagicDoorManager();
    this.group.add(this.doorManager.group);

    this.buildPlaza();
    this.buildExteriorStructure();
    this.buildInteriorAtrium();
    this.buildStaircases();
    this.buildRooftopCrown();
  }

  /**
   * Grand Western Entrance Plaza connecting directly to East River Road sidewalk
   */
  private buildPlaza() {
    const pos = GAME_HOUSE_CONFIG.position;

    // Plaza paving (West of building: X from 38 to 44, Z from -60 to -30)
    const plazaGeo = new THREE.BoxGeometry(8, 0.2, 30);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(pos.x - 11, 0.1, pos.z);
    plaza.receiveShadow = true;
    this.group.add(plaza);

    // Decorative entrance stairs into the grand lobby
    for (let step = 0; step < 3; step++) {
      const stepGeo = new THREE.BoxGeometry(1.2, 0.16, 12);
      const stepMesh = new THREE.Mesh(stepGeo, plazaMat);
      stepMesh.position.set(pos.x - 7.5 + step * 1.2, 0.08 + step * 0.16, pos.z);
      stepMesh.receiveShadow = true;
      this.group.add(stepMesh);
    }

    // Grand Entrance Arch Pillars (Flanking the wide main portal at X = -5 relative to center)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Terracotta Gold
      roughness: 0.35,
      metalness: 0.6,
    });

    [-6.5, 6.5].forEach((pz) => {
      const pGeo = new THREE.CylinderGeometry(0.8, 0.9, 10, 16);
      const pillar = new THREE.Mesh(pGeo, pillarMat);
      pillar.position.set(pos.x - 6.5, 5.0, pos.z + pz);
      pillar.castShadow = true;
      this.group.add(pillar);

      // Light on top of plaza pillars
      const light = new THREE.PointLight(0x06b6d4, 1.2, 14, 1.5);
      light.position.set(pos.x - 6.5, 9.5, pos.z + pz);
      this.group.add(light);
    });

    // Grand Illuminated Signboard above Main Portal
    const signTex = createGameHouseSignboardTexture();
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
    const signGeo = new THREE.PlaneGeometry(10.5, 2.6);
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.rotation.y = -Math.PI / 2;
    signMesh.position.set(pos.x - 6.6, 9.2, pos.z);
    this.group.add(signMesh);
  }

  /**
   * Exterior monumental architecture with glass, stone, terraces, and arches
   */
  private buildExteriorStructure() {
    const pos = GAME_HOUSE_CONFIG.position;
    const { width: W, depth: D, height: H } = GAME_HOUSE_CONFIG.dimensions;

    // Materials
    const darkStoneMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const terracottaAccentMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.5,
      metalness: 0.4,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.55,
    });
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });

    // 1. Back Wall (East: X = pos.x + W/2)
    const eastWallGeo = new THREE.BoxGeometry(1.2, H, D);
    const eastWall = new THREE.Mesh(eastWallGeo, darkStoneMat);
    eastWall.position.set(pos.x + W / 2, H / 2, pos.z);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    this.group.add(eastWall);

    this.obstacles.push({
      minX: pos.x + W / 2 - 1.0,
      maxX: pos.x + W / 2 + 1.0,
      minZ: pos.z - D / 2,
      maxZ: pos.z + D / 2,
      height: H,
    });

    // 2. North Wall (Z = pos.z - D/2) with Large Glass Windows
    const northWallGeo = new THREE.BoxGeometry(W, H, 1.2);
    const northWall = new THREE.Mesh(northWallGeo, darkStoneMat);
    northWall.position.set(pos.x, H / 2, pos.z - D / 2);
    northWall.castShadow = true;
    northWall.receiveShadow = true;
    this.group.add(northWall);

    this.obstacles.push({
      minX: pos.x - W / 2,
      maxX: pos.x + W / 2,
      minZ: pos.z - D / 2 - 1.0,
      maxZ: pos.z - D / 2 + 1.0,
      height: H,
    });

    // 3. South Wall (Z = pos.z + D/2)
    const southWallGeo = new THREE.BoxGeometry(W, H, 1.2);
    const southWall = new THREE.Mesh(southWallGeo, darkStoneMat);
    southWall.position.set(pos.x, H / 2, pos.z + D / 2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    this.group.add(southWall);

    this.obstacles.push({
      minX: pos.x - W / 2,
      maxX: pos.x + W / 2,
      minZ: pos.z + D / 2 - 1.0,
      maxZ: pos.z + D / 2 + 1.0,
      height: H,
    });

    // 4. Front Wall (West: X = pos.x - W/2) with Wide Open Grand Entrance in Center
    // North side of entrance
    const westNorthWallGeo = new THREE.BoxGeometry(1.2, H, (D - 12) / 2);
    const westNorthWall = new THREE.Mesh(westNorthWallGeo, darkStoneMat);
    westNorthWall.position.set(pos.x - W / 2, H / 2, pos.z - D / 4 - 3);
    westNorthWall.castShadow = true;
    this.group.add(westNorthWall);

    this.obstacles.push({
      minX: pos.x - W / 2 - 1.0,
      maxX: pos.x - W / 2 + 1.0,
      minZ: pos.z - D / 2,
      maxZ: pos.z - 6.0,
      height: H,
    });

    // South side of entrance
    const westSouthWallGeo = new THREE.BoxGeometry(1.2, H, (D - 12) / 2);
    const westSouthWall = new THREE.Mesh(westSouthWallGeo, darkStoneMat);
    westSouthWall.position.set(pos.x - W / 2, H / 2, pos.z + D / 4 + 3);
    westSouthWall.castShadow = true;
    this.group.add(westSouthWall);

    this.obstacles.push({
      minX: pos.x - W / 2 - 1.0,
      maxX: pos.x - W / 2 + 1.0,
      minZ: pos.z + 6.0,
      maxZ: pos.z + D / 2,
      height: H,
    });

    // Overhead lintel beam across entrance at height Y = 8.5
    const entranceLintelGeo = new THREE.BoxGeometry(1.5, H - 8.5, 12);
    const entranceLintel = new THREE.Mesh(entranceLintelGeo, terracottaAccentMat);
    entranceLintel.position.set(pos.x - W / 2, 8.5 + (H - 8.5) / 2, pos.z);
    this.group.add(entranceLintel);

    // Large glass curtain facades on outer corners
    [-1, 1].forEach((dirZ) => {
      const glassGeo = new THREE.PlaneGeometry(16, 12);
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(pos.x + 2, 14, pos.z + dirZ * (D / 2 + 0.1));
      if (dirZ < 0) glassMesh.rotation.y = Math.PI;
      this.group.add(glassMesh);
    });

    // Decorative Glowing Neon Ribbons along vertical building edges
    [-1, 1].forEach((dirX) => {
      [-1, 1].forEach((dirZ) => {
        const ribbonGeo = new THREE.BoxGeometry(0.3, H, 0.3);
        const ribbon = new THREE.Mesh(ribbonGeo, cyanGlowMat);
        ribbon.position.set(pos.x + dirX * (W / 2 + 0.1), H / 2, pos.z + dirZ * (D / 2 + 0.1));
        this.group.add(ribbon);
      });
    });
  }

  /**
   * Accessible Interior with Floor 1 (Ground), Floor 2 (Mezzanine), and Floor 3 (Observatory)
   */
  private buildInteriorAtrium() {
    const pos = GAME_HOUSE_CONFIG.position;
    const { width: W, depth: D } = GAME_HOUSE_CONFIG.dimensions;

    // Floor 1 (Ground Floor Tile at Y = 0.05)
    const f1Geo = new THREE.BoxGeometry(W - 2, 0.2, D - 2);
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.6,
    });
    const f1 = new THREE.Mesh(f1Geo, marbleMat);
    f1.position.set(pos.x, 0.1, pos.z);
    f1.receiveShadow = true;
    this.group.add(f1);

    // Central Reception / Hologram Information Point (at X = pos.x - 2, Z = pos.z)
    const deskGeo = new THREE.CylinderGeometry(2.5, 2.8, 1.1, 16);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.7 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(pos.x - 1, 0.55, pos.z);
    desk.castShadow = true;
    this.group.add(desk);

    // Glowing Central Hologram Orb
    const orbGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(pos.x - 1, 1.9, pos.z);
    this.group.add(orb);

    const orbLight = new THREE.PointLight(0x06b6d4, 1.8, 18, 1.2);
    orbLight.position.set(pos.x - 1, 2.2, pos.z);
    this.group.add(orbLight);

    // Floor 2 Mezzanine Deck at Y = 8.0 (U-shaped opening in center so players look down onto atrium)
    // North Mezzanine Gallery (Z < pos.z - 4)
    const mezNorthGeo = new THREE.BoxGeometry(W - 4, 0.4, 9);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.5 });
    const mezNorth = new THREE.Mesh(mezNorthGeo, deckMat);
    mezNorth.position.set(pos.x, 8.0, pos.z - 8.5);
    mezNorth.receiveShadow = true;
    this.group.add(mezNorth);

    // South Mezzanine Gallery (Z > pos.z + 4)
    const mezSouthGeo = new THREE.BoxGeometry(W - 4, 0.4, 9);
    const mezSouth = new THREE.Mesh(mezSouthGeo, deckMat);
    mezSouth.position.set(pos.x, 8.0, pos.z + 8.5);
    mezSouth.receiveShadow = true;
    this.group.add(mezSouth);

    // East Walkway connecting North and South Mezzanines
    const mezEastGeo = new THREE.BoxGeometry(7, 0.4, 8);
    const mezEast = new THREE.Mesh(mezEastGeo, deckMat);
    mezEast.position.set(pos.x + 8.5, 8.0, pos.z);
    mezEast.receiveShadow = true;
    this.group.add(mezEast);

    // Glass Balustrade railings overlooking the atrium
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.8,
    });
    const railGeoNorth = new THREE.BoxGeometry(W - 8, 1.1, 0.15);
    const railNorth = new THREE.Mesh(railGeoNorth, railMat);
    railNorth.position.set(pos.x - 1, 8.75, pos.z - 4.0);
    this.group.add(railNorth);

    const railSouth = new THREE.Mesh(railGeoNorth, railMat);
    railSouth.position.set(pos.x - 1, 8.75, pos.z + 4.0);
    this.group.add(railSouth);

    const railEastGeo = new THREE.BoxGeometry(0.15, 1.1, 8);
    const railEast = new THREE.Mesh(railEastGeo, railMat);
    railEast.position.set(pos.x + 5.0, 8.75, pos.z);
    this.group.add(railEast);

    // Warm atmospheric interior chandeliers / chandeliers
    [-6, 6].forEach((cx) => {
      const chandelierLight = new THREE.PointLight(0xf59e0b, 1.5, 20, 1.4);
      chandelierLight.position.set(pos.x + cx, 7.2, pos.z);
      this.group.add(chandelierLight);
    });
  }

  /**
   * Functional Central Twin Staircases connecting Ground Floor (Y = 0) to Floor 2 (Y = 8)
   */
  private buildStaircases() {
    const pos = GAME_HOUSE_CONFIG.position;
    const stairMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    });

    const stepCount = 20;
    const stepHeight = 8.0 / stepCount; // 0.4m per step
    const stepDepth = 0.55;
    const stairWidth = 2.8;

    // Twin Staircases: One going North from X = pos.x + 2, one going South
    // 1. North Staircase (ascending towards Z = -8.5)
    for (let i = 0; i < stepCount; i++) {
      const stepGeo = new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth);
      const stepMesh = new THREE.Mesh(stepGeo, stairMat);
      stepMesh.position.set(
        pos.x + 5.5,
        i * stepHeight + stepHeight / 2,
        pos.z - 1.0 - i * stepDepth,
      );
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      this.group.add(stepMesh);
    }

    // 2. South Staircase (ascending towards Z = +8.5)
    for (let i = 0; i < stepCount; i++) {
      const stepGeo = new THREE.BoxGeometry(stairWidth, stepHeight, stepDepth);
      const stepMesh = new THREE.Mesh(stepGeo, stairMat);
      stepMesh.position.set(
        pos.x + 5.5,
        i * stepHeight + stepHeight / 2,
        pos.z + 1.0 + i * stepDepth,
      );
      stepMesh.castShadow = true;
      stepMesh.receiveShadow = true;
      this.group.add(stepMesh);
    }
  }

  /**
   * Iconic Rooftop Crown with Luminous Spire recognized from far across the world
   */
  private buildRooftopCrown() {
    const pos = GAME_HOUSE_CONFIG.position;
    const { width: W, depth: D, height: H } = GAME_HOUSE_CONFIG.dimensions;

    // Layered rooftop terraces
    const roofBaseGeo = new THREE.BoxGeometry(W - 2, 1.2, D - 2);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const roofBase = new THREE.Mesh(roofBaseGeo, roofMat);
    roofBase.position.set(pos.x, H + 0.6, pos.z);
    roofBase.castShadow = true;
    this.group.add(roofBase);

    // Glowing Central Glass Dome (Floor 3 Sky Observatory)
    const domeGeo = new THREE.SphereGeometry(7.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(pos.x, H + 1.2, pos.z);
    this.group.add(dome);

    // Tall Luminous Beacon Spire (reaches Y = 38)
    const spireGeo = new THREE.ConeGeometry(1.2, 10, 8);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xfacc15,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.set(pos.x, H + 8.7, pos.z);
    this.group.add(spire);

    // Pulsing Beacon Light visible from anywhere on the map
    const beaconLight = new THREE.PointLight(0x06b6d4, 2.5, 75, 1.2);
    beaconLight.position.set(pos.x, H + 12, pos.z);
    this.group.add(beaconLight);
  }

  /**
   * Update doors and interactions
   */
  public update(playerPos: THREE.Vector3, delta: number) {
    this.doorManager.update(playerPos, delta);
  }
}
