/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { GAME_DOORS_REGISTRY, GameDoorMetadata } from './gameRegistry';
import { GAME_HOUSE_CONFIG } from './gameHouseConfig';
import { soundManager } from '../game/audio/soundManager';

interface DoorInstance {
  metadata: GameDoorMetadata;
  group: THREE.Group;
  leftPanel: THREE.Mesh;
  rightPanel: THREE.Mesh;
  portalMesh: THREE.Mesh;
  portalTexture: THREE.CanvasTexture;
  labelSprite: THREE.Sprite;
  currentOpenAmount: number; // 0 (closed) to 1 (fully open)
  targetOpenAmount: number;
  isOpen: boolean;
  worldPos: THREE.Vector3;
}

/**
 * Creates an ornate, illuminated 3D signboard texture for a magical game door
 */
function createDoorLabelTexture(door: GameDoorMetadata): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark glass background panel
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(0, 0, 512, 256);

  // Border with glowing category theme color
  ctx.strokeStyle = door.themeHex;
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 244);

  // Header banner: Door Number & Category
  ctx.fillStyle = door.themeHex;
  ctx.fillRect(10, 10, 492, 54);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 22px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`DOOR ${door.doorNumber.toString().padStart(2, '0')} · ${door.category.toUpperCase()}`, 256, 37);

  // Main Game Title (English)
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px "Segoe UI", Arial, sans-serif';
  ctx.fillText(door.title, 256, 105);

  // Bengali Subtitle
  ctx.fillStyle = door.themeHex;
  ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText(door.titleBn, 256, 148);

  // Status Pill
  const isAvailable = door.status === 'available';
  const pillColor = isAvailable ? '#10b981' : '#f59e0b';
  const pillText = isAvailable ? '● ENTER TO PLAY' : '● COMING SOON';

  ctx.fillStyle = isAvailable ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)';
  ctx.fillRect(120, 185, 272, 48);
  ctx.strokeStyle = pillColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(120, 185, 272, 48);

  ctx.fillStyle = pillColor;
  ctx.font = '900 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(pillText, 256, 210);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates an animated luminous magical portal vortex texture
 */
function createPortalVortexTexture(colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, colorHex);
  gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.8)');
  gradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export class MagicDoorManager {
  public group = new THREE.Group();
  public doors: DoorInstance[] = [];

  // Active interaction callbacks
  public onProximityDoorChanged?: (door: GameDoorMetadata | null) => void;
  public onEnterDoorTriggered?: (door: GameDoorMetadata) => void;

  private activeProximityDoor: GameDoorMetadata | null = null;
  private animTimer = 0;

  constructor() {
    this.buildAllDoors();
  }

  private buildAllDoors() {
    const housePos = GAME_HOUSE_CONFIG.position;

    GAME_DOORS_REGISTRY.forEach((doorMeta) => {
      const doorGroup = new THREE.Group();

      // Position relative to Game House center
      const localPos = doorMeta.relativeDoorPos;
      doorGroup.position.set(
        housePos.x + localPos.x,
        housePos.y + localPos.y,
        housePos.z + localPos.z,
      );
      doorGroup.rotation.y = localPos.rotY;

      // 1. Ornate Arch Frame
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.8,
      });
      const runeMat = new THREE.MeshStandardMaterial({
        color: doorMeta.accentColor,
        emissive: doorMeta.accentColor,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });

      // Arch Jambs (Left and Right pillars)
      [-1.4, 1.4].forEach((px) => {
        const pillarGeo = new THREE.BoxGeometry(0.35, 4.2, 0.5);
        const pillar = new THREE.Mesh(pillarGeo, frameMat);
        pillar.position.set(px, 2.1, 0);
        doorGroup.add(pillar);

        // Glowing Rune Trim along pillar
        const runeTrimGeo = new THREE.BoxGeometry(0.08, 3.8, 0.54);
        const runeTrim = new THREE.Mesh(runeTrimGeo, runeMat);
        runeTrim.position.set(px, 2.1, 0);
        doorGroup.add(runeTrim);
      });

      // Arch Lintel Top Beam
      const lintelGeo = new THREE.BoxGeometry(3.2, 0.45, 0.6);
      const lintel = new THREE.Mesh(lintelGeo, frameMat);
      lintel.position.set(0, 4.25, 0);
      doorGroup.add(lintel);

      // Bengali Arch Crown Peak
      const crownGeo = new THREE.ConeGeometry(0.5, 0.6, 4);
      crownGeo.rotateY(Math.PI / 4);
      const crown = new THREE.Mesh(crownGeo, runeMat);
      crown.position.set(0, 4.75, 0);
      doorGroup.add(crown);

      // 2. Sliding Magical Door Panels (Left & Right)
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.5,
        metalness: 0.7,
      });

      const panelGeo = new THREE.BoxGeometry(1.2, 3.9, 0.12);

      const leftPanel = new THREE.Mesh(panelGeo, panelMat);
      leftPanel.position.set(-0.62, 2.0, 0);
      doorGroup.add(leftPanel);

      const rightPanel = new THREE.Mesh(panelGeo, panelMat);
      rightPanel.position.set(0.62, 2.0, 0);
      doorGroup.add(rightPanel);

      // 3. Magical Portal Energy Vortex (revealed when door panels slide open)
      const portalGeo = new THREE.PlaneGeometry(2.4, 3.9);
      const portalTexture = createPortalVortexTexture(doorMeta.themeHex);
      const portalMat = new THREE.MeshBasicMaterial({
        map: portalTexture,
        transparent: true,
        opacity: 0.88,
        side: THREE.DoubleSide,
      });
      const portalMesh = new THREE.Mesh(portalGeo, portalMat);
      portalMesh.position.set(0, 2.0, -0.06);
      doorGroup.add(portalMesh);

      // 4. Hovering 3D Signboard Label Sprite
      const labelTex = createDoorLabelTexture(doorMeta);
      const labelMat = new THREE.SpriteMaterial({
        map: labelTex,
        depthTest: false,
        transparent: true,
      });
      const labelSprite = new THREE.Sprite(labelMat);
      labelSprite.position.set(0, 4.95, 0.3);
      labelSprite.scale.set(3.4, 1.7, 1.0);
      doorGroup.add(labelSprite);

      this.group.add(doorGroup);

      const worldPos = new THREE.Vector3(
        housePos.x + localPos.x,
        housePos.y + localPos.y,
        housePos.z + localPos.z,
      );

      this.doors.push({
        metadata: doorMeta,
        group: doorGroup,
        leftPanel,
        rightPanel,
        portalMesh,
        portalTexture,
        labelSprite,
        currentOpenAmount: 0,
        targetOpenAmount: 0,
        isOpen: false,
        worldPos,
      });
    });
  }

  /**
   * Update proximity sensors and animate doors opening/closing
   */
  public update(playerPos: THREE.Vector3, delta: number) {
    this.animTimer += delta;
    let closestDoor: GameDoorMetadata | null = null;
    let closestDist = Infinity;

    const OPEN_PROXIMITY = 3.6; // Meters to open
    const CLOSE_PROXIMITY = 4.4; // Meters to close
    const TRIGGER_PROXIMITY = 1.35; // Step into doorway

    for (const door of this.doors) {
      const dist = door.worldPos.distanceTo(playerPos);

      // Check proximity for opening
      if (dist < OPEN_PROXIMITY) {
        door.targetOpenAmount = 1.0;
        if (!door.isOpen) {
          door.isOpen = true;
          soundManager.playUiClick();
        }
      } else if (dist > CLOSE_PROXIMITY) {
        door.targetOpenAmount = 0.0;
        door.isOpen = false;
      }

      // Track closest door
      if (dist < OPEN_PROXIMITY && dist < closestDist) {
        closestDist = dist;
        closestDoor = door.metadata;

        // Check if player walked through the doorway
        if (dist < TRIGGER_PROXIMITY && door.currentOpenAmount > 0.7) {
          this.onEnterDoorTriggered?.(door.metadata);
        }
      }

      // Smooth door slide animation
      door.currentOpenAmount = THREE.MathUtils.damp(
        door.currentOpenAmount,
        door.targetOpenAmount,
        8.0,
        delta,
      );

      // Move door panels sideways: 0 -> closed (x = ±0.62), 1 -> open (x = ±1.65)
      door.leftPanel.position.x = -0.62 - door.currentOpenAmount * 1.03;
      door.rightPanel.position.x = 0.62 + door.currentOpenAmount * 1.03;

      // Animate magical portal texture UV rotation
      door.portalTexture.rotation = this.animTimer * 0.45;
      door.portalTexture.center.set(0.5, 0.5);
    }

    // Notify HUD of active proximity door prompt change
    if (closestDoor?.id !== this.activeProximityDoor?.id) {
      this.activeProximityDoor = closestDoor;
      this.onProximityDoorChanged?.(closestDoor);
    }
  }

  public getActiveProximityDoor(): GameDoorMetadata | null {
    return this.activeProximityDoor;
  }
}
