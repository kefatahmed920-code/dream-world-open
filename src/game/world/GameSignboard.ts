/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WorldObstacle } from './terrain';

export interface GameSignboardConfig {
  id: string;
  gameId: string;
  titleBn: string;
  titleEn: string;
  gameTitleBn: string;
  gameTitleEn: string;
  categoryBn: string;
  categoryEn: string;
  description: string;
  promptText: string;
  position: { x: number; y: number; z: number };
  rotationY: number;
  isAvailable: boolean;
  accentColor: number; // Hex color
}

/**
 * Reusable Registry for 3D Game Signboards across Dream World
 */
export const DEFAULT_SIGNBOARDS: GameSignboardConfig[] = [
  {
    id: 'sign_overbridge_cyber_tesla',
    gameId: 'game_cyber_tesla',
    titleBn: 'গেম খেলতে চাইলে এখানে ক্লিক করুন',
    titleEn: 'CLICK HERE TO PLAY THE GAME',
    gameTitleBn: 'সাইবার ইভি হাইওয়ে চ্যালেঞ্জ',
    gameTitleEn: 'Cyber EV Highway Challenge',
    categoryBn: 'হাই-স্পিড রেসিং',
    categoryEn: 'High-Speed Racing',
    description: 'High-speed futuristic electric highway driving and traffic skitching challenge across Dhaka Elevated Expressway.',
    promptText: '[E] গেম খেলুন / Play Game',
    position: { x: 10.5, y: 0.0, z: 14.8 }, // Directly beside overbridge South staircase landing
    rotationY: Math.PI, // Facing north toward sidewalk pedestrians and stair climbers
    isAvailable: true,
    accentColor: 0x06b6d4, // Neon Cyan
  },
];

/**
 * 3D Game Signboard Actor & Manager
 * Features double-sided illuminated cyber LED screen, metal stanchions, glowing edges,
 * animated spinning holographic icon, and proximity sensor.
 */
export class GameSignboardManager {
  public group: THREE.Group;
  private animatedEmblems: THREE.Mesh[] = [];
  private floatingRings: THREE.Mesh[] = [];

  constructor(signboardConfigs: GameSignboardConfig[] = DEFAULT_SIGNBOARDS) {
    this.group = new THREE.Group();
    this.group.name = 'GameSignboards';
    this.signboards = signboardConfigs;

    this.buildSignboards();
  }

  public update(delta: number): void {
    const timeMs = performance.now();
    // Spin floating 3D holographic emblems
    for (const emblem of this.animatedEmblems) {
      emblem.rotation.y += delta * 1.5;
      emblem.position.y = 3.65 + Math.sin(timeMs * 0.003) * 0.08;
    }

    // Spin and bob the floating glowing portal rings
    for (const ring of this.floatingRings) {
      ring.rotation.z += delta * 0.8;
      ring.position.y = 0.95 + Math.sin(timeMs * 0.004) * 0.12;
    }
  }

  /**
   * Check proximity to any game signboard circular trigger zone
   */
  public getNearbySignboard(playerPos: THREE.Vector3, threshold = 2.6): GameSignboardConfig | null {
    for (const sign of this.signboards) {
      // Check distance to the circular activation zone in front of the board
      const zoneZ = sign.position.z - 1.4; // in front of signboard facing north
      const dx = playerPos.x - sign.position.x;
      const dz = playerPos.z - zoneZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= threshold) {
        return sign;
      }
    }
    return null;
  }

  private buildSignboards() {
    for (const config of this.signboards) {
      const signGroup = new THREE.Group();
      signGroup.position.set(config.position.x, config.position.y, config.position.z);
      signGroup.rotation.y = config.rotationY;

      // 1. Concrete Ground Foundation Plinth
      const baseGeo = new THREE.BoxGeometry(3.2, 0.25, 0.8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.125;
      base.receiveShadow = true;
      signGroup.add(base);

      // 2. Heavy Dual Steel Mounting Posts
      const postMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.85,
      });

      [-1.2, 1.2].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 12), postMat);
        post.position.set(px, 1.4, 0);
        post.castShadow = true;
        signGroup.add(post);

        // Ground anchor flange
        const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 12), postMat);
        flange.position.set(px, 0.28, 0);
        signGroup.add(flange);
      });

      // 3. Cyber Neon Illuminated Frame
      const frameWidth = 2.8;
      const frameHeight = 1.7;
      const frameY = 2.3;

      const frameGeo = new THREE.BoxGeometry(frameWidth + 0.16, frameHeight + 0.16, 0.14);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.9,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, frameY, 0);
      frame.castShadow = true;
      signGroup.add(frame);

      // Neon Glowing Edge Bezel
      const glowMat = new THREE.MeshBasicMaterial({
        color: config.accentColor,
      });
      const topNeon = new THREE.Mesh(new THREE.BoxGeometry(frameWidth + 0.18, 0.04, 0.15), glowMat);
      topNeon.position.set(0, frameY + (frameHeight + 0.16) / 2, 0);
      signGroup.add(topNeon);

      const bottomNeon = new THREE.Mesh(new THREE.BoxGeometry(frameWidth + 0.18, 0.04, 0.15), glowMat);
      bottomNeon.position.set(0, frameY - (frameHeight + 0.16) / 2, 0);
      signGroup.add(bottomNeon);

      // 4. Double-Sided High-Resolution Canvas Screen
      const screenTexture = this.createSignboardTexture(config);
      const screenMat = new THREE.MeshStandardMaterial({
        map: screenTexture,
        roughness: 0.2,
        emissive: 0xffffff,
        emissiveMap: screenTexture,
        emissiveIntensity: 0.55,
      });

      // Front Face
      const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(frameWidth, frameHeight), screenMat);
      frontScreen.position.set(0, frameY, 0.075);
      signGroup.add(frontScreen);

      // Back Face
      const backScreen = new THREE.Mesh(new THREE.PlaneGeometry(frameWidth, frameHeight), screenMat);
      backScreen.rotation.y = Math.PI;
      backScreen.position.set(0, frameY, -0.075);
      signGroup.add(backScreen);

      // 5. Floating 3D Holographic Cyber Diamond Icon
      const diamondGeo = new THREE.OctahedronGeometry(0.35, 0);
      const diamondMat = new THREE.MeshStandardMaterial({
        color: config.accentColor,
        emissive: config.accentColor,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.9,
        wireframe: false,
      });
      const diamond = new THREE.Mesh(diamondGeo, diamondMat);
      diamond.position.set(0, 3.65, 0);
      signGroup.add(diamond);
      this.animatedEmblems.push(diamond);

      // Accent Point Light casting neon glow on surrounding sidewalk
      const neonLight = new THREE.PointLight(config.accentColor, 1.8, 6.0);
      neonLight.position.set(0, frameY, 0.5);
      signGroup.add(neonLight);

      // 6. Ground Circular Activation Disc (সাইনবোর্ডের নিচে গোল চিহ্ন)
      const circleRadius = 2.0;
      const groundCircleGeo = new THREE.RingGeometry(0.2, circleRadius, 32);
      const groundCircleMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4, // Cyan neon
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
      });
      const groundCircle = new THREE.Mesh(groundCircleGeo, groundCircleMat);
      groundCircle.rotation.x = -Math.PI / 2;
      groundCircle.position.set(0, 0.04, -1.4);
      signGroup.add(groundCircle);

      const groundGlowGeo = new THREE.CircleGeometry(circleRadius, 32);
      const groundGlowMat = new THREE.MeshBasicMaterial({
        color: 0x0891b2,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
      });
      const groundGlow = new THREE.Mesh(groundGlowGeo, groundGlowMat);
      groundGlow.rotation.x = -Math.PI / 2;
      groundGlow.position.set(0, 0.035, -1.4);
      signGroup.add(groundGlow);

      // 7. Floating Glowing Animated Circle (ভাসমান একটা বৃত্ত)
      const floatingRingGeo = new THREE.TorusGeometry(circleRadius * 0.85, 0.06, 8, 32);
      const floatingRingMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const floatingRing = new THREE.Mesh(floatingRingGeo, floatingRingMat);
      floatingRing.rotation.x = Math.PI / 2;
      floatingRing.position.set(0, 0.95, -1.4);
      signGroup.add(floatingRing);
      this.floatingRings.push(floatingRing);

      this.group.add(signGroup);

      // Add obstacle collision box so players don't walk through the signboard
      this.obstacles.push({
        minX: config.position.x - 1.6,
        maxX: config.position.x + 1.6,
        minZ: config.position.z - 0.5,
        maxZ: config.position.z + 0.5,
        height: 3.5,
      });
    }
  }

  /**
   * Procedural High-Resolution Bilingual Signboard Canvas Texture
   */
  private createSignboardTexture(config: GameSignboardConfig): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 620;
    const ctx = canvas.getContext('2d')!;

    // 1. Dark Cyber Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 620);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#09152b');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 620);

    // Cyber Grid lines
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 1024; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 620);
      ctx.stroke();
    }
    for (let y = 0; y < 620; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Glowing Inner Border
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 6;
    ctx.strokeRect(16, 16, 992, 588);

    // Top Category Pill Badge
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(362, 32, 300, 48, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`⚡ ${config.categoryBn} • ${config.categoryEn}`, 512, 56);

    // High-Contrast Title Banner Plate
    ctx.fillStyle = 'rgba(2, 6, 23, 0.95)';
    ctx.beginPath();
    ctx.roundRect(40, 95, 944, 150, 20);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Primary Bengali Call to Action (Extra Bold, Glowing, High Contrast)
    ctx.fillStyle = '#fef08a'; // High visibility luminous yellow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 16;
    ctx.font = '900 52px "Segoe UI", Arial, sans-serif';
    ctx.fillText(config.titleBn, 512, 148);

    // Primary English Call to Action (Cyber Cyan)
    ctx.fillStyle = '#38bdf8'; // Bright cyan
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 12;
    ctx.font = '900 34px "Segoe UI", Arial, sans-serif';
    ctx.fillText(config.titleEn, 512, 212);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Center Game Banner Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(70, 260, 884, 210, 20);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Game Icon / Cyber Car Silhouette Badge
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.roundRect(100, 285, 120, 120, 16);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = 'bold 54px "Segoe UI", Arial, sans-serif';
    ctx.fillText('⚡🏎️', 160, 350);

    // Game Titles inside Card
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Segoe UI", Arial, sans-serif';
    ctx.fillText(config.gameTitleBn, 245, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px "Segoe UI", Arial, sans-serif';
    ctx.fillText(config.gameTitleEn, 245, 365);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.fillText('● ONLINE MULTIPLAYER & LEADERBOARD READY', 245, 410);

    // Bottom Action Prompt Button Bar
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(262, 505, 500, 72, 36);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = '900 32px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▶ এখনই খেলুন / PLAY NOW', 512, 545);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}
