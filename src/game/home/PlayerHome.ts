/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from '../world/terrain';

/**
 * Realistic Enterable Dhanmondi Home & Private Room
 * Situated at the Dhaka city entry parcel (X = 6, Z = 12).
 *
 * Includes:
 * - Solid architectural exterior & interior walls matching Dhaka residential style
 * - Weatherproof roof with parapet trim and skylight/transom windows
 * - Cosy hardwood floor with decorative carpet runner
 * - Master bed with plush mattress, headboard, duvet, and pillows
 * - Bedside area with warm nightstand lamp (Initial Player Spawn Point at [5.2, 0.05, 13.8])
 * - Character Customization Wardrobe with louvered closet doors & full-length dressing mirror
 * - Modern wooden loft staircase and bookshelf
 * - Interactive entrance door on North wall (Z = 8.0) with smooth opening hinge animation
 * - Wall obstacle collisions that leave the doorway clearance completely free for traversal
 */
export class PlayerHome {
  public group: THREE.Group;
  public obstacles: WorldObstacle[] = [];

  // Door animation state
  public isDoorOpen = false;
  private doorPivot: THREE.Group;
  private currentDoorAngle = 0;
  private targetDoorAngle = 0;

  // Proximity zones
  public readonly spawnPoint = new THREE.Vector3(5.2, 0.05, 13.8);
  public readonly exitPoint = new THREE.Vector3(6.0, 0.05, 6.8);
  public readonly doorInteriorZone = new THREE.Vector3(6.0, 0.05, 8.8);
  public readonly doorExteriorZone = new THREE.Vector3(6.0, 0.05, 7.3);
  public readonly wardrobeZone = new THREE.Vector3(8.2, 0.05, 12.5);

  // Interior bounds for visibility isolation check
  public readonly bounds = {
    minX: 1.5,
    maxX: 10.5,
    minZ: 7.9,
    maxZ: 16.1,
    minY: -0.2,
    maxY: 4.5,
  };

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PlayerHome';

    this.doorPivot = new THREE.Group();
    this.buildHomeArchitecture();
  }

  /**
   * Check whether a world coordinate is inside the home interior
   */
  public isInsideHome(x: number, z: number, y = 0.5): boolean {
    return (
      x >= this.bounds.minX &&
      x <= this.bounds.maxX &&
      z >= this.bounds.minZ &&
      z <= this.bounds.maxZ &&
      y >= this.bounds.minY &&
      y <= this.bounds.maxY
    );
  }

  /**
   * Update door animation and lighting
   */
  public update(delta: number, playerPos: THREE.Vector3) {
    // Smooth door pivot rotation
    this.targetDoorAngle = this.isDoorOpen ? Math.PI * 0.48 : 0;
    this.currentDoorAngle = THREE.MathUtils.damp(
      this.currentDoorAngle,
      this.targetDoorAngle,
      8.0,
      delta
    );
    this.doorPivot.rotation.y = this.currentDoorAngle;

    // Auto-open door slightly when player approaches within 1.5m of doorway
    const distToDoorInner = playerPos.distanceTo(this.doorInteriorZone);
    const distToDoorOuter = playerPos.distanceTo(this.doorExteriorZone);
    if (distToDoorInner < 1.4 || distToDoorOuter < 1.4) {
      this.isDoorOpen = true;
    } else if (distToDoorInner > 2.8 && distToDoorOuter > 2.8 && this.isDoorOpen) {
      // Auto close when moving away
      this.isDoorOpen = false;
    }
  }

  public toggleDoor(): boolean {
    this.isDoorOpen = !this.isDoorOpen;
    return this.isDoorOpen;
  }

  private buildHomeArchitecture() {
    // Materials
    const wallExteriorMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Modern ivory/slate painted plaster
      roughness: 0.75,
      metalness: 0.1,
    });

    const wallInteriorMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean off-white interior emulsion
      roughness: 0.85,
    });

    const woodTrimMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Rich teak wood
      roughness: 0.45,
      metalness: 0.15,
    });

    const floorWoodMat = new THREE.MeshStandardMaterial({
      color: 0x92400e, // Warm mahogany wood flooring
      roughness: 0.35,
      metalness: 0.1,
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Charcoal slate concrete roof
      roughness: 0.8,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Brushed gold/brass
      roughness: 0.3,
      metalness: 0.8,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.45,
    });

    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.05,
      metalness: 0.95,
    });

    const wallHeight = 3.6;

    // ----------------------------------------------------
    // 1. FLOOR & PORCH
    // ----------------------------------------------------
    // Interior parquet floor (X: 1.5 to 10.5, Z: 8.0 to 16.0) -> center (6.0, 0.04, 12.0), w=9, d=8
    const floorGeo = new THREE.BoxGeometry(9.0, 0.08, 8.0);
    const floor = new THREE.Mesh(floorGeo, floorWoodMat);
    floor.position.set(6.0, 0.04, 12.0);
    floor.receiveShadow = true;
    this.group.add(floor);

    // Front Porch steps outside North entrance (X: 5.0 to 7.0, Z: 6.8 to 8.0)
    const porchGeo = new THREE.BoxGeometry(2.4, 0.06, 1.2);
    const porchMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
    const porch = new THREE.Mesh(porchGeo, porchMat);
    porch.position.set(6.0, 0.03, 7.4);
    porch.receiveShadow = true;
    this.group.add(porch);

    // Coir Welcome Mat
    const matGeo = new THREE.BoxGeometry(1.2, 0.02, 0.6);
    const matMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
    const welcomeMat = new THREE.Mesh(matGeo, matMat);
    welcomeMat.position.set(6.0, 0.07, 7.4);
    this.group.add(welcomeMat);

    // Decorative Plush Persian Rug inside bedroom
    const rugGeo = new THREE.BoxGeometry(4.2, 0.015, 3.2);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.85 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.set(6.2, 0.09, 12.8);
    this.group.add(rug);

    // ----------------------------------------------------
    // 2. WALLS & DOOR CLEARANCE
    // ----------------------------------------------------
    // South Wall (Back wall at Z = 16.0) w=9.0, h=3.6
    const southWall = new THREE.Mesh(new THREE.BoxGeometry(9.0, wallHeight, 0.3), wallInteriorMat);
    southWall.position.set(6.0, wallHeight / 2, 16.0);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    this.group.add(southWall);

    this.obstacles.push({
      minX: 1.5,
      maxX: 10.5,
      minZ: 15.85,
      maxZ: 16.15,
      height: wallHeight,
    });

    // West Wall (Left wall at X = 1.5) d=8.0, h=3.6
    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, 8.0), wallInteriorMat);
    westWall.position.set(1.5, wallHeight / 2, 12.0);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    this.group.add(westWall);

    this.obstacles.push({
      minX: 1.35,
      maxX: 1.65,
      minZ: 8.0,
      maxZ: 16.0,
      height: wallHeight,
    });

    // East Wall (Right wall at X = 10.5) d=8.0, h=3.6
    const eastWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, 8.0), wallInteriorMat);
    eastWall.position.set(10.5, wallHeight / 2, 12.0);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    this.group.add(eastWall);

    this.obstacles.push({
      minX: 10.35,
      maxX: 10.65,
      minZ: 8.0,
      maxZ: 16.0,
      height: wallHeight,
    });

    // North Entrance Wall with Doorway Opening
    // Total width = 9.0 (X: 1.5 to 10.5). Doorway opening is at X: 5.3 to 6.7 (width = 1.4m)
    // Left North Wall segment: X: 1.5 to 5.3 (width = 3.8m, center = 3.4)
    const northWallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.8, wallHeight, 0.3), wallExteriorMat);
    northWallLeft.position.set(3.4, wallHeight / 2, 8.0);
    northWallLeft.castShadow = true;
    northWallLeft.receiveShadow = true;
    this.group.add(northWallLeft);

    this.obstacles.push({
      minX: 1.5,
      maxX: 5.3,
      minZ: 7.85,
      maxZ: 8.15,
      height: wallHeight,
    });

    // Right North Wall segment: X: 6.7 to 10.5 (width = 3.8m, center = 8.6)
    const northWallRight = new THREE.Mesh(new THREE.BoxGeometry(3.8, wallHeight, 0.3), wallExteriorMat);
    northWallRight.position.set(8.6, wallHeight / 2, 8.0);
    northWallRight.castShadow = true;
    northWallRight.receiveShadow = true;
    this.group.add(northWallRight);

    this.obstacles.push({
      minX: 6.7,
      maxX: 10.5,
      minZ: 7.85,
      maxZ: 8.15,
      height: wallHeight,
    });

    // Doorway Header Beam (above door, Y: 2.3 to 3.6)
    const doorLintel = new THREE.Mesh(new THREE.BoxGeometry(1.4, wallHeight - 2.3, 0.3), wallExteriorMat);
    doorLintel.position.set(6.0, 2.3 + (wallHeight - 2.3) / 2, 8.0);
    doorLintel.castShadow = true;
    this.group.add(doorLintel);

    // Doorway Teak Frame
    const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.34), woodTrimMat);
    frameLeft.position.set(5.34, 1.15, 8.0);
    this.group.add(frameLeft);

    const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 0.34), woodTrimMat);
    frameRight.position.set(6.66, 1.15, 8.0);
    this.group.add(frameRight);

    const frameTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.34), woodTrimMat);
    frameTop.position.set(6.0, 2.3, 8.0);
    this.group.add(frameTop);

    // ----------------------------------------------------
    // 3. INTERACTIVE PIVOTING ENTRANCE DOOR
    // ----------------------------------------------------
    // Door Hinge Pivot positioned at left jamb (X = 5.38, Z = 8.0)
    this.doorPivot.position.set(5.38, 0, 8.0);
    this.group.add(this.doorPivot);

    // Door Leaf panel (width = 1.24m, height = 2.22m, thickness = 0.06m)
    // Offset from pivot by half width (0.62m) so it swings on hinges
    const doorLeafGeo = new THREE.BoxGeometry(1.24, 2.22, 0.06);
    const doorLeafMat = new THREE.MeshStandardMaterial({
      color: 0x451a03, // Dark carved teak
      roughness: 0.4,
      metalness: 0.1,
    });
    const doorLeaf = new THREE.Mesh(doorLeafGeo, doorLeafMat);
    doorLeaf.position.set(0.62, 1.11, 0);
    doorLeaf.castShadow = true;
    this.doorPivot.add(doorLeaf);

    // Door Brass Handle
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.16, 8);
    const handle = new THREE.Mesh(handleGeo, brassMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(1.12, 1.05, 0.06);
    this.doorPivot.add(handle);

    // Bengali & English House Nameplate above doorway
    this.buildHouseNameplate(6.0, 2.65, 7.82);

    // ----------------------------------------------------
    // 4. ROOF & DECORATIVE PARAPET
    // ----------------------------------------------------
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.25, 8.6), roofMat);
    roofSlab.position.set(6.0, wallHeight + 0.125, 12.0);
    roofSlab.castShadow = true;
    roofSlab.receiveShadow = true;
    this.group.add(roofSlab);

    // Decorative Roof Parapet
    const parapetGeo = new THREE.BoxGeometry(9.6, 0.6, 0.2);
    const parapetFront = new THREE.Mesh(parapetGeo, wallExteriorMat);
    parapetFront.position.set(6.0, wallHeight + 0.55, 7.7);
    this.group.add(parapetFront);

    // ----------------------------------------------------
    // 5. MASTER BED & BEDSIDE AREA (Player Spawn Location)
    // ----------------------------------------------------
    // Positioned along West wall (X: 2.2 to 4.6, Z: 12.6 to 15.6)
    const bedGroup = new THREE.Group();
    bedGroup.position.set(3.4, 0, 14.1);

    // Bed Wooden Base & Headboard
    const bedBase = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 2.2), woodTrimMat);
    bedBase.position.y = 0.175;
    bedBase.castShadow = true;
    bedGroup.add(bedBase);

    // Headboard against South wall
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.1, 0.15), woodTrimMat);
    headboard.position.set(0, 0.75, 1.05);
    headboard.castShadow = true;
    bedGroup.add(headboard);

    // Mattress with soft white bedding
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.28, 2.05), mattressMat);
    mattress.position.set(0, 0.44, 0);
    mattress.castShadow = true;
    bedGroup.add(mattress);

    // Bengali Quilt / Blanket (Cyan-Teal Silk)
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6 });
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.4), blanketMat);
    blanket.position.set(0, 0.52, -0.3);
    bedGroup.add(blanket);

    // Two Fluffy Pillows
    [-0.5, 0.5].forEach((px) => {
      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.45), mattressMat);
      pillow.position.set(px, 0.54, 0.7);
      pillow.rotation.x = 0.15;
      bedGroup.add(pillow);
    });

    this.group.add(bedGroup);

    // Bed Collision Obstacle
    this.obstacles.push({
      minX: 2.3,
      maxX: 4.5,
      minZ: 12.9,
      maxZ: 15.3,
      height: 1.2,
    });

    // Bedside Nightstand at (X = 4.8, Z = 14.8)
    const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), woodTrimMat);
    nightstand.position.set(4.8, 0.3, 14.8);
    nightstand.castShadow = true;
    this.group.add(nightstand);

    // Bedside Lamp with Warm Glowing Light
    const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.35, 8), brassMat);
    lampStem.position.set(4.8, 0.77, 14.8);
    this.group.add(lampStem);

    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.26, 0.24, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5, emissive: 0xfef08a, emissiveIntensity: 0.6 })
    );
    lampShade.position.set(4.8, 0.95, 14.8);
    this.group.add(lampShade);

    // Warm Interior Point Light
    const bedsideLight = new THREE.PointLight(0xffedd5, 1.8, 8);
    bedsideLight.position.set(4.8, 1.2, 14.8);
    bedsideLight.castShadow = true;
    this.group.add(bedsideLight);

    // ----------------------------------------------------
    // 6. CHARACTER CUSTOMIZATION AREA (Wardrobe & Dressing Mirror)
    // ----------------------------------------------------
    // Large Teak Louvered Wardrobe at (X = 8.8, Z = 14.2)
    const wardrobeGroup = new THREE.Group();
    wardrobeGroup.position.set(8.8, 0, 14.2);

    const wardrobeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 0.75), woodTrimMat);
    wardrobeBody.position.y = 1.25;
    wardrobeBody.castShadow = true;
    wardrobeGroup.add(wardrobeBody);

    // Brass handles
    [-0.15, 0.15].forEach((hx) => {
      const wHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), brassMat);
      wHandle.position.set(hx, 1.25, -0.4);
      wardrobeGroup.add(wHandle);
    });

    this.group.add(wardrobeGroup);

    this.obstacles.push({
      minX: 7.9,
      maxX: 9.7,
      minZ: 13.7,
      maxZ: 14.7,
      height: 2.5,
    });

    // Full-Length Dressing Mirror beside wardrobe at (X = 9.2, Z = 11.5)
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(9.2, 0, 11.5);

    // Wooden Frame
    const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, 1.1), woodTrimMat);
    mirrorFrame.position.y = 1.1;
    mirrorGroup.add(mirrorFrame);

    // Reflective Mirror Glass Plane (Facing into room toward X-)
    const mirrorGlass = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.9), mirrorMat);
    mirrorGlass.rotation.y = -Math.PI / 2;
    mirrorGlass.position.set(-0.08, 1.1, 0);
    mirrorGroup.add(mirrorGlass);

    // Overhead Vanity Light for mirror
    const vanityLight = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.7), brassMat);
    vanityLight.position.set(-0.12, 2.15, 0);
    mirrorGroup.add(vanityLight);

    const mirrorPointLight = new THREE.PointLight(0xe0f2fe, 1.2, 5);
    mirrorPointLight.position.set(8.6, 2.1, 11.5);
    this.group.add(mirrorPointLight);

    this.group.add(mirrorGroup);

    this.obstacles.push({
      minX: 9.0,
      maxX: 9.6,
      minZ: 10.9,
      maxZ: 12.1,
      height: 2.2,
    });

    // Wardrobe Interactive Glow Indicator on floor
    const glowRingGeo = new THREE.RingGeometry(0.65, 0.75, 24);
    const glowRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const wardrobeFloorRing = new THREE.Mesh(glowRingGeo, glowRingMat);
    wardrobeFloorRing.rotation.x = -Math.PI / 2;
    wardrobeFloorRing.position.set(8.2, 0.085, 12.5);
    this.group.add(wardrobeFloorRing);

    // ----------------------------------------------------
    // 7. DHAKA LIVING DETAILS (Bookshelf, Staircase, Potted Plant)
    // ----------------------------------------------------
    // Modern Bookshelf along East wall at (X = 9.2, Z = 9.3)
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.1, 1.4), woodTrimMat);
    shelf.position.set(9.2, 1.05, 9.3);
    this.group.add(shelf);

    this.obstacles.push({
      minX: 8.8,
      maxX: 9.6,
      minZ: 8.5,
      maxZ: 10.1,
      height: 2.1,
    });

    // Potted Indoor Palm Plant near corner
    this.buildIndoorPlant(2.2, 8.8);

    // Overhead Ceiling Fan with warm chandelier
    this.buildCeilingFan(6.0, wallHeight - 0.25, 12.0);

    // Panoramic Window overlooking Dhaka City on West wall (at X = 1.5, Z = 10.2)
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.4), glassMat);
    windowGlass.rotation.y = Math.PI / 2;
    windowGlass.position.set(1.66, 1.8, 10.2);
    this.group.add(windowGlass);

    const windowFrame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.48, 2.48), woodTrimMat);
    windowFrame.position.set(1.66, 1.8, 10.2);
    this.group.add(windowFrame);
  }

  /**
   * Potted indoor plant
   */
  private buildIndoorPlant(x: number, z: number) {
    const potMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.6 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 12), potMat);
    pot.position.set(x, 0.225, z);
    this.group.add(pot);

    // Leaves
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.75, 5), leafMat);
      leaf.position.set(x + Math.cos(angle) * 0.1, 0.65, z + Math.sin(angle) * 0.1);
      leaf.rotation.z = Math.cos(angle) * 0.45;
      leaf.rotation.x = Math.sin(angle) * 0.45;
      this.group.add(leaf);
    }
  }

  /**
   * Ceiling Fan with central light
   */
  private buildCeilingFan(x: number, y: number, z: number) {
    const fanGroup = new THREE.Group();
    fanGroup.position.set(x, y, z);

    const motorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });

    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 12), motorMat);
    fanGroup.add(motor);

    // 3 Blades
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.14), bladeMat);
      blade.position.set(Math.cos(angle) * 0.45, -0.05, Math.sin(angle) * 0.45);
      blade.rotation.y = angle;
      fanGroup.add(blade);
    }

    // Ceiling Light
    const mainLight = new THREE.PointLight(0xfffaed, 2.0, 10);
    mainLight.position.set(0, -0.2, 0);
    fanGroup.add(mainLight);

    this.group.add(fanGroup);
  }

  /**
   * Wooden house nameplate above entrance
   */
  private buildHouseNameplate(x: number, y: number, z: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Plaque background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 500, 116);

    // Bengali Title
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('স্বপ্ন নিবাস — ধানমন্ডি', 256, 44);

    // English Subtitle
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.fillText('MY PRIVATE HOME • DHANMONDI', 256, 88);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const plaqueGeo = new THREE.BoxGeometry(1.6, 0.42, 0.05);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.4,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(x, y, z);
    this.group.add(plaque);
  }
}
