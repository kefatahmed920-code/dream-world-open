/**
 * Dream World Expanded Wooden Fishing Dock & Boat Landing
 * Where Winds Meet / Traditional Riverside aesthetic.
 * Colors:
 *  - Main aged wood: #92734F
 *  - Dark weathered wood: #604A35
 *  - Sunlit wood: #B2966C
 */

import * as THREE from 'three';
import { textureFactory } from './textures';

export interface DockBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  height: number;
}

export class ExpandedDockManager {
  public group: THREE.Group = new THREE.Group();
  public foamPositions: THREE.Vector3[] = [];

  // Collision rectangles for the stepped/organic multi-section dock
  private dockColliders: DockBounds[] = [
    // 1. Bank connector ramp
    { minX: 1, maxX: 15, minZ: -14, maxZ: -10, height: 1.1 },
    // 2. Main fishing deck & walkway
    { minX: -2, maxX: 22, minZ: -10, maxZ: -4, height: 0.85 },
    // 3. Lower boat boarding platform extension
    { minX: 12, maxX: 24, minZ: -4, maxZ: 1.5, height: 0.55 },
    // 4. Fisherman's casting pier
    { minX: -4, maxX: 4, minZ: -4, maxZ: 1.0, height: 0.85 },
    // 5. Boatman shelter floor
    { minX: 5, maxX: 12, minZ: -9.5, maxZ: -4.5, height: 0.95 },
  ];

  constructor() {
    this.buildDock();
    this.buildBoatmanShelter();
    this.buildDockProps();
    // Moored boat is now actively managed by BoatJourneyManager
  }

  /**
   * Check if position (x, z) is over the dock and return its surface height
   */
  public queryDockCollision(x: number, z: number): { onDock: boolean; height: number } {
    for (const c of this.dockColliders) {
      if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
        // Special ramp gradient for bank connector
        if (c.minZ === -14) {
          const t = (z - (-14)) / 4.0;
          const rampH = THREE.MathUtils.lerp(1.8, 0.85, t);
          return { onDock: true, height: rampH };
        }
        return { onDock: true, height: c.height };
      }
    }
    return { onDock: false, height: 0 };
  }

  private buildDock() {
    const woodTex = textureFactory.getAgedWoodTexture();
    woodTex.repeat.set(3, 1);

    const mainWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#92734F'),
      roughness: 0.82,
      metalness: 0.04,
    });

    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.9,
      metalness: 0.05,
    });

    const sunlitWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#B2966C'),
      roughness: 0.78,
      metalness: 0.03,
    });

    // Sub-structure: Heavy timber support pilings extending down into the riverbed (Y: -4.5 to +0.8)
    const pillarPositions: [number, number][] = [
      // Along main deck
      [-2, -9], [4, -9], [10, -9], [16, -9], [22, -9],
      [-2, -5], [4, -5], [10, -5], [16, -5], [22, -5],
      // Casting pier
      [-3.5, -1], [3.5, -1], [-3.5, 0.8], [3.5, 0.8],
      // Boat boarding extension
      [13, -1], [18, -1], [23, -1],
      [13, 1.2], [18, 1.2], [23, 1.2],
      // Shelter corners
      [5.5, -9], [11.5, -9], [5.5, -5], [11.5, -5]
    ];

    const pillarGeom = new THREE.CylinderGeometry(0.24, 0.28, 5.5, 12);
    pillarPositions.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(pillarGeom, darkWoodMat);
      pillar.position.set(px, -1.8, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.group.add(pillar);

      // Record water contact point for foam generation (at Y=0)
      this.foamPositions.push(new THREE.Vector3(px, 0.02, pz));

      // Crossbeams connecting pillars under the deck
      const braceGeom = new THREE.BoxGeometry(0.2, 0.35, 4.0);
      const brace = new THREE.Mesh(braceGeom, darkWoodMat);
      brace.position.set(px, 0.35, pz);
      brace.castShadow = true;
      this.group.add(brace);
    });

    // Longitudinal heavy support beams
    const beamGeom = new THREE.BoxGeometry(26, 0.4, 0.3);
    const beam1 = new THREE.Mesh(beamGeom, darkWoodMat);
    beam1.position.set(10, 0.55, -9);
    const beam2 = new THREE.Mesh(beamGeom, darkWoodMat);
    beam2.position.set(10, 0.55, -5);
    this.group.add(beam1, beam2);

    // Deck Surface Planks: Individual staggered aged timber planks for rich organic fidelity
    const plankWidth = 0.35;
    const plankThickness = 0.08;

    // A. Main deck planks (X: -2 to 22, Z: -10 to -4)
    for (let x = -2; x <= 22; x += plankWidth + 0.03) {
      const plankLen = 6.0 + (Math.random() - 0.5) * 0.2;
      const plankGeom = new THREE.BoxGeometry(plankWidth, plankThickness, plankLen);
      // Subtle color variation between planks
      const mat = Math.random() > 0.6 ? sunlitWoodMat : (Math.random() > 0.5 ? mainWoodMat : darkWoodMat);
      const plank = new THREE.Mesh(plankGeom, mat);
      // Slight vertical wobble for aged rustic timber
      const yOffset = (Math.random() - 0.5) * 0.02;
      plank.position.set(x, 0.82 + yOffset, -7);
      plank.rotation.x = (Math.random() - 0.5) * 0.015;
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    // B. Boat boarding steps & lower deck (X: 12 to 24, Z: -4 to 1.5)
    for (let x = 12.2; x <= 23.8; x += plankWidth + 0.03) {
      const plankLen = 5.4;
      const plankGeom = new THREE.BoxGeometry(plankWidth, plankThickness, plankLen);
      const mat = Math.random() > 0.4 ? mainWoodMat : darkWoodMat;
      const plank = new THREE.Mesh(plankGeom, mat);
      plank.position.set(x, 0.52, -1.2);
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    // Steps connecting main deck to lower boat deck
    const stepGeom = new THREE.BoxGeometry(11.8, 0.16, 0.45);
    const step1 = new THREE.Mesh(stepGeom, darkWoodMat);
    step1.position.set(18, 0.68, -4.0);
    this.group.add(step1);

    // C. Fisherman's casting pier (X: -4 to 4, Z: -4 to 1.0)
    for (let x = -3.8; x <= 3.8; x += plankWidth + 0.03) {
      const plankGeom = new THREE.BoxGeometry(plankWidth, plankThickness, 5.0);
      const mat = Math.random() > 0.5 ? mainWoodMat : sunlitWoodMat;
      const plank = new THREE.Mesh(plankGeom, mat);
      plank.position.set(x, 0.82, -1.5);
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    // D. Bank connector ramp planks (sloping up to the riverbank at Z: -14)
    for (let z = -14; z <= -10; z += 0.35) {
      const t = (z - (-14)) / 4.0;
      const rampY = THREE.MathUtils.lerp(1.75, 0.84, t);
      const rampPlankGeom = new THREE.BoxGeometry(14, plankThickness, 0.32);
      const plank = new THREE.Mesh(rampPlankGeom, mainWoodMat);
      plank.position.set(8, rampY, z);
      plank.rotation.x = 0.22; // Ramp pitch
      plank.castShadow = true;
      plank.receiveShadow = true;
      this.group.add(plank);
    }

    // Rustic wooden safety railings along safe edges (with open boarding slip for boats)
    this.buildDockRailings(darkWoodMat);
  }

  private buildDockRailings(railMat: THREE.Material) {
    const postGeom = new THREE.CylinderGeometry(0.08, 0.09, 1.1, 8);
    const railGeom = new THREE.BoxGeometry(5.8, 0.08, 0.12);

    // Railing posts along Fisherman pier
    [-4, 4].forEach((rx) => {
      for (let rz = -4; rz <= 1.0; rz += 1.8) {
        const post = new THREE.Mesh(postGeom, railMat);
        post.position.set(rx, 1.35, rz);
        post.castShadow = true;
        this.group.add(post);
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 5.0), railMat);
      rail.position.set(rx, 1.75, -1.5);
      rail.castShadow = true;
      this.group.add(rail);
    });

    // Railing along West edge of main deck
    const westRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 6.0), railMat);
    westRail.position.set(-2.1, 1.75, -7);
    this.group.add(westRail);

    // Railing along East edge of lower boarding platform
    const eastRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 5.5), railMat);
    eastRail.position.set(24.1, 1.45, -1.2);
    this.group.add(eastRail);
  }

  /**
   * Traditional Wooden Shelter for future boatman NPC
   * Weathered shingled gabled roof, rustic wooden bench, hanging lantern, dried fish racks
   */
  private buildBoatmanShelter() {
    const shelterGroup = new THREE.Group();
    const woodTex = textureFactory.getAgedWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.88,
    });

    // 4 Corner structural pillars
    const postGeom = new THREE.CylinderGeometry(0.14, 0.15, 2.8, 8);
    const corners = [
      [5.5, -9.5], [11.5, -9.5],
      [5.5, -4.5], [11.5, -4.5]
    ];
    corners.forEach(([cx, cz]) => {
      const post = new THREE.Mesh(postGeom, woodMat);
      post.position.set(cx, 2.3, cz);
      post.castShadow = true;
      shelterGroup.add(post);
    });

    // Gabled timber roof structure
    const roofBaseY = 3.6;
    const roofGeom = new THREE.ConeGeometry(4.6, 1.6, 4);
    roofGeom.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#4E3D2C'),
      roughness: 0.92,
    });
    const roof = new THREE.Mesh(roofGeom, roofMat);
    roof.position.set(8.5, roofBaseY + 0.8, -7.0);
    roof.scale.set(1.5, 1.0, 1.2);
    roof.castShadow = true;
    shelterGroup.add(roof);

    // Weathered wooden resting bench inside shelter
    const benchMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#92734F'),
      roughness: 0.8,
    });
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.8), benchMat);
    benchSeat.position.set(8.5, 1.3, -8.8);
    benchSeat.castShadow = true;
    shelterGroup.add(benchSeat);

    // Bench legs
    [-1.4, 1.4].forEach((bx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.45, 0.7), benchMat);
      leg.position.set(8.5 + bx, 1.08, -8.8);
      shelterGroup.add(leg);
    });

    // Hanging warm oil lantern inside shelter
    const lanternGroup = this.createOilLantern(true);
    lanternGroup.position.set(8.5, 3.1, -7.0);
    shelterGroup.add(lanternGroup);

    // Hanging fishing nets and dried fish rack inside shelter
    const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.0), woodMat);
    rackBar.rotation.z = Math.PI / 2;
    rackBar.position.set(8.5, 3.2, -5.2);
    shelterGroup.add(rackBar);

    // Rolled bamboo blinds along the back wall
    const blindGeom = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 10);
    blindGeom.rotateZ(Math.PI / 2);
    const blindMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B2966C'),
      roughness: 0.75,
    });
    const blind = new THREE.Mesh(blindGeom, blindMat);
    blind.position.set(8.5, 3.3, -9.4);
    shelterGroup.add(blind);

    this.group.add(shelterGroup);
  }

  /**
   * Dock Props:
   * Mooring posts with coiled ropes, woven bamboo fishing baskets, wooden crates,
   * tackle boxes, dock lanterns.
   */
  private buildDockProps() {
    const propsGroup = new THREE.Group();
    const woodTex = textureFactory.getAgedWoodTexture();
    const darkWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.9,
    });

    // 1. Heavy Mooring Posts & Cleats with Coiled Hemp Ropes
    const mooringPositions: [number, number, number][] = [
      [12.5, 0.55, 1.2],
      [18.0, 0.55, 1.2],
      [23.5, 0.55, 1.2],
      [-3.5, 0.85, 0.8],
      [3.5, 0.85, 0.8],
    ];

    const postGeom = new THREE.CylinderGeometry(0.16, 0.18, 0.9, 12);
    const ropeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C2AD85'),
      roughness: 0.95,
    });

    mooringPositions.forEach(([mx, my, mz]) => {
      const post = new THREE.Mesh(postGeom, darkWoodMat);
      post.position.set(mx, my + 0.45, mz);
      post.castShadow = true;
      propsGroup.add(post);

      // Coiled hemp rope around post
      const ropeRingGeom = new THREE.TorusGeometry(0.24, 0.05, 8, 16);
      ropeRingGeom.rotateX(Math.PI / 2);
      const rope = new THREE.Mesh(ropeRingGeom, ropeMat);
      rope.position.set(mx, my + 0.25, mz);
      propsGroup.add(rope);

      // Flat rope coil on the deck floor
      const deckRopeGeom = new THREE.TorusGeometry(0.38, 0.06, 6, 20);
      deckRopeGeom.rotateX(Math.PI / 2);
      const deckRope = new THREE.Mesh(deckRopeGeom, ropeMat);
      deckRope.position.set(mx + 0.3, my + 0.04, mz - 0.2);
      propsGroup.add(deckRope);
    });

    // 2. Traditional Woven Bamboo Fishing Baskets (Bengali "Khulshi" & "Dala")
    const basketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A89063'),
      roughness: 0.85,
    });

    const basketPositions: [number, number, number][] = [
      [-1.5, 0.85, -2.5],
      [-0.8, 0.85, -2.2],
      [1.8, 0.85, -3.2],
      [14.2, 0.55, -2.8],
    ];

    basketPositions.forEach(([bx, by, bz], idx) => {
      // Flared cone/cylinder basket
      const basketGeom = new THREE.CylinderGeometry(0.35, 0.22, 0.5, 12, 1, true);
      const basket = new THREE.Mesh(basketGeom, basketMat);
      basket.position.set(bx, by + 0.25, bz);
      basket.rotation.y = idx * 1.2;
      basket.rotation.z = (Math.random() - 0.5) * 0.15;
      basket.castShadow = true;
      propsGroup.add(basket);

      // Fresh silvery catch visible inside basket
      const fishGeom = new THREE.CylinderGeometry(0.08, 0.04, 0.35, 6);
      fishGeom.rotateZ(Math.PI / 2);
      const fishMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#B6C7CF'),
        roughness: 0.3,
        metalness: 0.6,
      });
      const fish = new THREE.Mesh(fishGeom, fishMat);
      fish.position.set(bx, by + 0.32, bz);
      fish.rotation.y = Math.random() * Math.PI;
      propsGroup.add(fish);
    });

    // 3. Stacked Wooden Fish Crates
    const crateMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#92734F'),
      roughness: 0.85,
    });

    const crateLocations: [number, number, number, number][] = [
      [3.8, 0.85, -7.5, 0],
      [3.8, 1.45, -7.5, 0.2], // Stacked
      [2.6, 0.85, -7.8, -0.4],
      [15.5, 0.55, -3.5, 0.15],
      [16.8, 0.55, -3.2, -0.2],
    ];

    crateLocations.forEach(([cx, cy, cz, rot]) => {
      const crateGeom = new THREE.BoxGeometry(0.9, 0.55, 0.7);
      const crate = new THREE.Mesh(crateGeom, crateMat);
      crate.position.set(cx, cy + 0.27, cz);
      crate.rotation.y = rot;
      crate.castShadow = true;
      crate.receiveShadow = true;
      propsGroup.add(crate);
    });

    // 4. Standing Dock Post Lanterns with warm glow
    const dockLantern1 = this.createOilLantern(false);
    dockLantern1.position.set(-3.5, 1.8, 0.8);
    const dockLantern2 = this.createOilLantern(false);
    dockLantern2.position.set(23.5, 1.5, 1.2);
    propsGroup.add(dockLantern1, dockLantern2);

    this.group.add(propsGroup);
  }

  /**
   * Moored Traditional Wooden Exploration Boat (Sampan / River craft)
   * Prepares the foundation for Phase 2 boat journey to the ancient city!
   */
  private buildMooredBoat() {
    const boatGroup = new THREE.Group();
    boatGroup.position.set(18.0, 0.15, 4.2);
    boatGroup.rotation.y = -0.15; // Pointed downstream toward the opened eastern river continuation

    const woodTex = textureFactory.getAgedWoodTexture();
    const hullMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#604A35'),
      roughness: 0.75,
      metalness: 0.05,
    });

    const deckWoodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: new THREE.Color('#B2966C'),
      roughness: 0.7,
    });

    // Traditional curved river boat hull
    const hullLength = 9.0;
    const hullWidth = 2.4;
    const hullHeight = 1.1;

    // Main hull body
    const hullGeom = new THREE.BoxGeometry(hullWidth, hullHeight, hullLength, 4, 2, 8);
    // Sculpt boat bow and stern taper
    const pos = hullGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const taper = 1.0 - Math.pow(Math.abs(z) / (hullLength * 0.5), 1.8) * 0.65;
      pos.setX(i, pos.getX(i) * taper);
      // Bow upward sheer
      if (z > 0) {
        pos.setY(i, pos.getY(i) + (z / hullLength) * 0.5);
      }
    }
    hullGeom.computeVertexNormals();

    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.position.set(0, 0.2, 0);
    hull.castShadow = true;
    hull.receiveShadow = true;
    boatGroup.add(hull);

    // Inner deck planking
    const boatDeck = new THREE.Mesh(new THREE.BoxGeometry(hullWidth * 0.85, 0.1, hullLength * 0.85), deckWoodMat);
    boatDeck.position.set(0, 0.45, 0);
    boatGroup.add(boatDeck);

    // Traditional curved bamboo woven roof canopy (Golpata / bamboo mat roof)
    const canopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8C7449'),
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const canopyGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.8, 16, 1, true, 0, Math.PI);
    canopyGeom.rotateZ(Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 1.3, -0.6);
    canopy.castShadow = true;
    boatGroup.add(canopy);

    // Boat oars & long steering oar (Baitha)
    const oarMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#92734F'),
      roughness: 0.8,
    });
    const oar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 4.2), oarMat);
    oar.rotation.x = 0.45;
    oar.rotation.z = 0.3;
    oar.position.set(1.1, 0.6, -3.2);
    boatGroup.add(oar);

    // Mooring line tying boat securely to the dock bollard
    const lineMat = new THREE.LineBasicMaterial({ color: 0xC2AD85, linewidth: 2 });
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.6, -4.0), // Boat bow
      new THREE.Vector3(0, 0.4, -4.5), // Sagging curve
      new THREE.Vector3(0.0, 0.6, -3.0), // Dock post connection point
    ]);
    const mooringLine = new THREE.Line(lineGeom, lineMat);
    boatGroup.add(mooringLine);

    // Gentle boat bobbing animation reference
    boatGroup.userData = { isBoat: true, baseRotationY: boatGroup.rotation.y };

    this.foamPositions.push(new THREE.Vector3(18.0, 0.02, 4.2));
    this.foamPositions.push(new THREE.Vector3(18.0, 0.02, 1.5));

    this.group.add(boatGroup);
  }

  private createOilLantern(withPointLight: boolean): THREE.Group {
    const lantern = new THREE.Group();

    // Brass/iron metal frame
    const metalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C241E'),
      metalness: 0.7,
      roughness: 0.4,
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 8), metalMat);
    lantern.add(base);

    // Glowing warm glass cylinder
    const glassMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFD175'),
      emissive: new THREE.Color('#FF9326'),
      emissiveIntensity: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 8), glassMat);
    glass.position.set(0, 0.16, 0);
    lantern.add(glass);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.12, 8), metalMat);
    cap.position.set(0, 0.32, 0);
    lantern.add(cap);

    if (withPointLight) {
      const light = new THREE.PointLight('#FFA533', 1.2, 8.0, 1.2);
      light.position.set(0, 0.2, 0);
      lantern.add(light);
    }

    return lantern;
  }
}
