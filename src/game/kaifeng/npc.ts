/**
 * Fisherman NPC (Kalu Mian / Rahim) & Interactive Fishing Mechanism
 * Preserves and enhances the fisherman NPC on the expanded wooden dock.
 * Features animated fishing rod, water bobber, live fish bites, and deep lore dialogues.
 */

import * as THREE from 'three';
import { soundEngine } from './audio';

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  options: { label: string; nextId?: string; action?: 'fish' | 'close' }[];
}

export class FishermanNPC {
  public group: THREE.Group = new THREE.Group();
  public position: THREE.Vector3 = new THREE.Vector3(0, 0.85, -1.2);
  public rodTipPos: THREE.Vector3 = new THREE.Vector3();
  public bobberPos: THREE.Vector3 = new THREE.Vector3(0, 0.05, 3.8);

  private rodGroup: THREE.Group = new THREE.Group();
  private bobberMesh!: THREE.Mesh;
  private lineMesh!: THREE.Line;
  private fishCaughtCount: number = 7;
  private biteTimer: number = 0;
  private isBiting: boolean = false;
  private pullUpProgress: number = 0;
  private caughtFishMesh: THREE.Mesh | null = null;

  constructor() {
    this.buildFishermanModel();
    this.buildFishingRodAndLine();
    this.group.position.copy(this.position);
    this.group.rotation.y = 0.2; // Facing the open river
  }

  private buildFishermanModel() {
    // 1. Kurta (Torso)
    const kurtaMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#EAE6DF'), // Traditional off-white cotton
      roughness: 0.8,
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.35), kurtaMat);
    torso.position.set(0, 1.25, 0);
    torso.castShadow = true;
    this.group.add(torso);

    // 2. Traditional Checked Lungi (Lower body)
    const lungiMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C5E7A'), // Indigo / teal checks
      roughness: 0.85,
    });
    const lungi = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.95, 10), lungiMat);
    lungi.position.set(0, 0.48, 0);
    lungi.castShadow = true;
    this.group.add(lungi);

    // 3. Head & Face
    const skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#946B54'), // Sun-weathered warm brown tone
      roughness: 0.7,
    });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), skinMat);
    head.position.set(0, 1.8, 0);
    this.group.add(head);

    // Traditional Bamboo Conical Fishing Hat (Mathal)
    const hatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#A89063'),
      roughness: 0.85,
    });
    const mathal = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.22, 16), hatMat);
    mathal.position.set(0, 1.95, 0);
    mathal.rotation.x = -0.15; // Tilted slightly forward
    mathal.castShadow = true;
    this.group.add(mathal);

    // Arms holding the rod
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.12), kurtaMat);
    leftArm.position.set(-0.32, 1.35, 0.15);
    leftArm.rotation.x = 0.85;
    this.group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.48, 0.12), kurtaMat);
    rightArm.position.set(0.32, 1.35, 0.15);
    rightArm.rotation.x = 0.85;
    this.group.add(rightArm);
  }

  private buildFishingRodAndLine() {
    // Bamboo fishing rod (long, flexible)
    const bambooMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#C9A86A'),
      roughness: 0.6,
    });

    const rodLength = 4.8;
    const rodGeom = new THREE.CylinderGeometry(0.015, 0.05, rodLength, 8);
    rodGeom.rotateX(Math.PI / 2);

    const rodMesh = new THREE.Mesh(rodGeom, bambooMat);
    rodMesh.position.set(0, 0, rodLength * 0.5);
    this.rodGroup.add(rodMesh);

    this.rodGroup.position.set(0.2, 1.45, 0.35);
    this.rodGroup.rotation.x = -0.42; // Angled outward over water
    this.rodGroup.rotation.y = 0.15;
    this.group.add(this.rodGroup);

    // Floating red & white bobber in river water
    const bobberGeom = new THREE.SphereGeometry(0.09, 8, 8);
    const bobberMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E74C3C'), // Bright red top
      roughness: 0.3,
    });
    this.bobberMesh = new THREE.Mesh(bobberGeom, bobberMat);
    this.bobberMesh.position.copy(this.bobberPos);
    this.group.add(this.bobberMesh);

    // Monofilament fishing line connecting rod tip to bobber
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xEEEEEE,
      transparent: true,
      opacity: 0.6,
    });
    const lineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, rodLength),
      this.bobberPos,
    ]);
    this.lineMesh = new THREE.Line(lineGeom, lineMat);
    this.group.add(this.lineMesh);

    // Caught fish model attached to hook when pulling up
    const fishMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#7F97A3'),
      metalness: 0.6,
      roughness: 0.3,
    });
    const fishGeom = new THREE.CylinderGeometry(0.06, 0.03, 0.45, 6);
    fishGeom.rotateZ(Math.PI / 2);
    this.caughtFishMesh = new THREE.Mesh(fishGeom, fishMat);
    this.caughtFishMesh.visible = false;
    this.group.add(this.caughtFishMesh);
  }

  public update(delta: number, elapsed: number) {
    this.biteTimer += delta;

    // Trigger biting event every 12 to 18 seconds
    if (!this.isBiting && this.biteTimer > 12.0) {
      if (Math.random() < delta * 0.5) {
        this.isBiting = true;
        this.biteTimer = 0;
        this.pullUpProgress = 0;
        soundEngine.playFishBite();
      }
    }

    if (this.isBiting) {
      this.pullUpProgress += delta * 1.5;
      if (this.pullUpProgress < 1.0) {
        // Rod bends deeply down, bobber bobs aggressively
        this.rodGroup.rotation.x = -0.42 + Math.sin(elapsed * 25) * 0.12;
        this.bobberMesh.position.y = -0.15 + Math.sin(elapsed * 30) * 0.08;
      } else if (this.pullUpProgress < 2.5) {
        // Rod jerks up, pulls fish out of water!
        this.rodGroup.rotation.x = -0.85;
        if (this.caughtFishMesh) {
          this.caughtFishMesh.visible = true;
          this.caughtFishMesh.position.set(0.2, 1.8 + Math.sin(elapsed * 20) * 0.1, 2.5);
          this.caughtFishMesh.rotation.y = elapsed * 8;
        }
      } else {
        // Reset after catch
        this.isBiting = false;
        this.biteTimer = 0;
        this.pullUpProgress = 0;
        this.fishCaughtCount++;
        if (this.caughtFishMesh) this.caughtFishMesh.visible = false;
        this.rodGroup.rotation.x = -0.42;
        this.bobberMesh.position.y = 0.05;
        soundEngine.playFishCatchSuccess();
      }
    } else {
      // Gentle natural water wave bobbing
      this.bobberMesh.position.y = 0.05 + Math.sin(elapsed * 3.0) * 0.04;
      this.bobberMesh.position.x = Math.sin(elapsed * 1.2) * 0.05;
      this.rodGroup.rotation.x = -0.42 + Math.sin(elapsed * 1.5) * 0.02;
    }

    // Update fishing line vertices
    const rodWorldTip = new THREE.Vector3(0, 0, 4.8);
    this.rodGroup.localToWorld(rodWorldTip);
    this.group.worldToLocal(rodWorldTip);

    const linePos = this.lineMesh.geometry.attributes.position;
    linePos.setXYZ(0, rodWorldTip.x, rodWorldTip.y, rodWorldTip.z);
    linePos.setXYZ(1, this.bobberMesh.position.x, this.bobberMesh.position.y, this.bobberMesh.position.z);
    linePos.needsUpdate = true;
  }

  public getFishCaughtCount(): number {
    return this.fishCaughtCount;
  }

  public getDialogueTree(): Record<string, DialogueNode> {
    return {
      root: {
        id: 'root',
        speaker: 'Fisherman Kalu Mian',
        text: 'Ah, greetings traveler! The Buriganga river is peaceful today. Look at this clear water—it hasn’t shone this beautifully in decades.',
        options: [
          { label: 'How is the catch today?', nextId: 'catch' },
          { label: 'What lies downriver now?', nextId: 'downriver' },
          { label: 'Tell me about this new dock.', nextId: 'dock' },
          { label: 'Can I try catching a fish?', action: 'fish' },
          { label: 'Goodbye for now.', action: 'close' },
        ],
      },
      catch: {
        id: 'catch',
        speaker: 'Fisherman Kalu Mian',
        text: `Splendid! I have already reeled in ${this.fishCaughtCount} fresh Hilsa and sweet river carp. When the river current flows steady from the west, the schools swim right past our dock pilings!`,
        options: [
          { label: 'Can I try catching a fish?', action: 'fish' },
          { label: 'Tell me about the downriver path.', nextId: 'downriver' },
          { label: 'Back', nextId: 'root' },
        ],
      },
      downriver: {
        id: 'downriver',
        speaker: 'Fisherman Kalu Mian',
        text: 'The unnatural mountain barriers to the east have broken open! A majestic river gorge now winds toward distant misty horizons. The old tales speak of an ancient dynasty city waiting across that water route...',
        options: [
          { label: 'Is the boat ready for travel?', nextId: 'boat' },
          { label: 'Back', nextId: 'root' },
        ],
      },
      dock: {
        id: 'dock',
        speaker: 'Fisherman Kalu Mian',
        text: 'Our traditional dock was recently expanded with aged timber and deep water pilings! We built the boat shelter and lower landing steps so travelers and boatmen have a safe harbor.',
        options: [
          { label: 'What is that boat moored there?', nextId: 'boat' },
          { label: 'Back', nextId: 'root' },
        ],
      },
      boat: {
        id: 'boat',
        speaker: 'Fisherman Kalu Mian',
        text: 'That is our expedition river craft! The waters have been opened and surveyed. When Phase 2 begins, that vessel will carry travelers on the grand voyage across the eastern gorge towards the new realm!',
        options: [
          { label: 'I look forward to the journey.', nextId: 'root' },
        ],
      },
    };
  }
}
