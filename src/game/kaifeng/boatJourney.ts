/**
 * Real-Time River Boat Journey & Ferryman System — Dream World Phase 3
 * Seamlessly connects Dhaka Wooden Dock to the Grand Ancient Bridge Eastern Landing.
 * Features:
 *  - Ferryman Master Wu stationed at the dock
 *  - Real-time continuous boat navigation along the scenic river
 *  - Cinematic river vista with the Grand Bridge & Gates coming into view
 *  - Smooth passenger embarkation and disembarkation at the Eastern Landing
 *  - Two-way travel (Dhaka to Bridge, Bridge to Dhaka)
 */

import * as THREE from 'three';
import { soundEngine } from './audio';
import { CharacterController } from './character';

export interface RiverWaypoint {
  pos: THREE.Vector3;
  heading: number; // Y rotation
}

export class BoatJourneyManager {
  public group: THREE.Group = new THREE.Group();
  public ferrymanGroup: THREE.Group = new THREE.Group();
  public boatMesh: THREE.Group = new THREE.Group();

  // State
  public isTraveling: boolean = false;
  public travelDirection: 'toBridge' | 'toDhaka' = 'toBridge';
  public progress: number = 0; // 0 to 1
  public currentDockLocation: 'dhaka' | 'bridge' = 'dhaka';

  // River Waypoint Path along the actual Buriganga / Gorge channel
  private riverPath: RiverWaypoint[] = [
    { pos: new THREE.Vector3(18.0, 0.15, 4.2), heading: -0.15 },   // 0. Dhaka Dock Slip
    { pos: new THREE.Vector3(38.0, 0.15, 4.5), heading: 0.1 },     // 1. Passing riverside willows
    { pos: new THREE.Vector3(62.0, 0.15, 8.5), heading: 0.35 },    // 2. Entering opened river gorge
    { pos: new THREE.Vector3(92.0, 0.15, 13.5), heading: 0.2 },    // 3. Winding bend (Bridge appears in distance!)
    { pos: new THREE.Vector3(118.0, 0.15, 8.0), heading: -0.25 },  // 4. Approaching the Grand Bridge
    { pos: new THREE.Vector3(132.0, 0.15, -4.0), heading: -0.7 },  // 5. Turning toward North Landing
    { pos: new THREE.Vector3(142.0, 0.15, -14.0), heading: -1.4 }, // 6. Arrived at Eastern Landing Pier
  ];

  private totalPathLength: number = 0;
  private segmentLengths: number[] = [];
  private boatOar!: THREE.Mesh;

  constructor() {
    this.calculatePathMetrics();
    this.buildFerrymanModel();
    this.buildJourneyBoat();
    this.updateBoatTransform(0);
  }

  private calculatePathMetrics() {
    this.totalPathLength = 0;
    this.segmentLengths = [];
    for (let i = 0; i < this.riverPath.length - 1; i++) {
      const dist = this.riverPath[i].pos.distanceTo(this.riverPath[i + 1].pos);
      this.segmentLengths.push(dist);
      this.totalPathLength += dist;
    }
  }

  private buildFerrymanModel() {
    // Master Wu / Ferryman in traditional riverman attire
    const robeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#3D5A80'), // Deep indigo riverman coat
      roughness: 0.8,
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#946B54'),
      roughness: 0.65,
    });

    const hatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A89063'),
      roughness: 0.85,
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), robeMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    this.ferrymanGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), skinMat);
    head.position.set(0, 1.8, 0);
    this.ferrymanGroup.add(head);

    // Traditional woven conical hat (Mathal / Douli)
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.22, 16), hatMat);
    hat.position.set(0, 1.95, 0);
    hat.rotation.x = -0.15;
    hat.castShadow = true;
    this.ferrymanGroup.add(hat);

    // Arms holding steering pole
    const armMat = new THREE.MeshStandardMaterial({ color: '#946B54', roughness: 0.7 });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), armMat);
    leftArm.position.set(-0.32, 1.3, 0.2);
    leftArm.rotation.x = 0.7;
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), armMat);
    rightArm.position.set(0.32, 1.3, 0.2);
    rightArm.rotation.x = 0.7;
    this.ferrymanGroup.add(leftArm, rightArm);

    // Initial position on dock boarding slip (Ferryman model detached for clean map environment)
    this.ferrymanGroup.position.set(16.5, 0.55, 1.5);
    this.ferrymanGroup.rotation.y = -Math.PI / 4;
    // Omit ferryman character model: boat remains a pristine environmental river craft
    // this.group.add(this.ferrymanGroup);
  }

  private buildJourneyBoat() {
    // River passenger boat
    const hullMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#553E2C'),
      roughness: 0.75,
    });

    const deckMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A1845C'),
      roughness: 0.7,
    });

    const canopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#8C7449'),
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

    const hullLength = 9.2;
    const hullWidth = 2.5;
    const hullHeight = 1.1;

    // Sculpted river hull
    const hullGeom = new THREE.BoxGeometry(hullWidth, hullHeight, hullLength, 4, 2, 8);
    const pos = hullGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i);
      const taper = 1.0 - Math.pow(Math.abs(z) / (hullLength * 0.5), 1.8) * 0.65;
      pos.setX(i, pos.getX(i) * taper);
      if (z > 0) pos.setY(i, pos.getY(i) + (z / hullLength) * 0.5);
    }
    hullGeom.computeVertexNormals();

    const hull = new THREE.Mesh(hullGeom, hullMat);
    hull.position.set(0, 0.2, 0);
    hull.castShadow = true;
    hull.receiveShadow = true;
    this.boatMesh.add(hull);

    // Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(hullWidth * 0.85, 0.1, hullLength * 0.85), deckMat);
    deck.position.set(0, 0.45, 0);
    this.boatMesh.add(deck);

    // Bamboo woven roof canopy
    const canopyGeom = new THREE.CylinderGeometry(1.25, 1.25, 4.0, 16, 1, true, 0, Math.PI);
    canopyGeom.rotateZ(Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeom, canopyMat);
    canopy.position.set(0, 1.35, -0.6);
    canopy.castShadow = true;
    this.boatMesh.add(canopy);

    // Steering Oar (Baitha)
    const oarMat = new THREE.MeshStandardMaterial({ color: 0x92734F, roughness: 0.8 });
    this.boatOar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 4.4), oarMat);
    this.boatOar.rotation.x = 0.5;
    this.boatOar.position.set(0, 0.6, -4.2);
    this.boatMesh.add(this.boatOar);

    // Lantern on boat bow
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xFFD175,
      emissive: 0xFF9326,
      emissiveIntensity: 0.8,
    });
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lanternMat);
    lantern.position.set(0, 1.2, 4.2);
    this.boatMesh.add(lantern);

    this.group.add(this.boatMesh);
  }

  /**
   * Start the real-time river boat voyage
   */
  public startVoyage(direction: 'toBridge' | 'toDhaka', player: CharacterController) {
    if (this.isTraveling) return;

    this.isTraveling = true;
    this.travelDirection = direction;
    this.progress = direction === 'toBridge' ? 0 : 1;
    soundEngine.playFishingCast(); // Boat cast-off sound

    // Position player comfortably inside the boat canopy
    player.position.set(0, 0.48, 0.5);
  }

  public update(delta: number, elapsed: number, player?: CharacterController): boolean {
    if (!this.isTraveling || !player) {
      // Gentle water bobbing at dock
      const bobY = Math.sin(elapsed * 1.5) * 0.04;
      const bobRotZ = Math.sin(elapsed * 1.2) * 0.015;
      this.boatMesh.position.y = 0.15 + bobY;
      this.boatMesh.rotation.z = bobRotZ;
      return false;
    }

    // Advance travel progress along the river
    const speed = 0.065; // ~15 seconds scenic journey
    if (this.travelDirection === 'toBridge') {
      this.progress += delta * speed;
      if (this.progress >= 1.0) {
        this.progress = 1.0;
        this.completeVoyage(player);
        return true;
      }
    } else {
      this.progress -= delta * speed;
      if (this.progress <= 0) {
        this.progress = 0;
        this.completeVoyage(player);
        return true;
      }
    }

    this.updateBoatTransform(this.progress);

    // Move player with the boat
    const boatPos = this.boatMesh.position;
    const boatRot = this.boatMesh.rotation.y;
    const playerLocalOffset = new THREE.Vector3(0, 0.5, 0.6).applyAxisAngle(new THREE.Vector3(0, 1, 0), boatRot);
    player.position.set(boatPos.x + playerLocalOffset.x, boatPos.y + 0.45, boatPos.z + playerLocalOffset.z);

    // Oar rowing animation
    if (this.boatOar) {
      this.boatOar.rotation.z = Math.sin(elapsed * 3.0) * 0.25;
    }

    return false;
  }

  private updateBoatTransform(t: number) {
    const targetDist = t * this.totalPathLength;
    let accumulated = 0;

    for (let i = 0; i < this.segmentLengths.length; i++) {
      const segLen = this.segmentLengths[i];
      if (accumulated + segLen >= targetDist || i === this.segmentLengths.length - 1) {
        const segT = (targetDist - accumulated) / segLen;
        const p1 = this.riverPath[i];
        const p2 = this.riverPath[i + 1];

        // Interpolate position and heading
        this.boatMesh.position.lerpVectors(p1.pos, p2.pos, segT);
        this.boatMesh.rotation.y = THREE.MathUtils.lerp(p1.heading, p2.heading, segT);
        break;
      }
      accumulated += segLen;
    }
  }

  private completeVoyage(player: CharacterController) {
    this.isTraveling = false;
    soundEngine.playWaterPlop();

    if (this.travelDirection === 'toBridge') {
      this.currentDockLocation = 'bridge';
      // Disembark player safely onto the Eastern Landing pier steps
      player.position.set(142, 0.8, -15);
      // Reposition ferryman to Eastern landing
      this.ferrymanGroup.position.set(144, 0.75, -13.5);
      this.ferrymanGroup.rotation.y = -Math.PI * 0.8;
    } else {
      this.currentDockLocation = 'dhaka';
      // Disembark player safely onto Dhaka Dock
      player.position.set(18.0, 0.9, 1.5);
      // Reposition ferryman to Dhaka dock
      this.ferrymanGroup.position.set(16.5, 0.55, 1.5);
      this.ferrymanGroup.rotation.y = -Math.PI / 4;
    }
  }

  public getFerrymanPrompt(playerPos: THREE.Vector3): { canInteract: boolean; isAtDhaka: boolean } {
    const ferrymanPos = this.ferrymanGroup.position;
    const dist = playerPos.distanceTo(ferrymanPos);
    return {
      canInteract: dist < 3.8,
      isAtDhaka: this.currentDockLocation === 'dhaka',
    };
  }
}
