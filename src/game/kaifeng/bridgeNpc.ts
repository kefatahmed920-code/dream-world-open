/**
 * Bridge Environmental NPCs — Dream World Phase 3
 * Populates the Grand Ancient Wooden Bridge with authentic ancient Chinese NPCs:
 *  - Traveling Scholars in Hanfu silk robes
 *  - Riverside Merchants with bamboo shoulder poles
 *  - Townsfolk & Wanderers with conical bamboo hats
 * Walks smoothly across the bridge, through both monumental gates, and gazes at the river vista.
 */

import * as THREE from 'three';
import { AncientBridgeManager } from './bridge';

export interface BridgeNPCData {
  name: string;
  role: string;
  speed: number;
  direction: 1 | -1; // 1 = North to South, -1 = South to North
  currentZ: number;
  laneX: number; // Lateral offset from bridge center
  state: 'walking' | 'pausing';
  pauseTimer: number;
  walkCycle: number;
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
}

export class BridgeNPCManager {
  public group: THREE.Group = new THREE.Group();
  private npcs: BridgeNPCData[] = [];

  constructor(private bridge: AncientBridgeManager) {
    this.createBridgePedestrians();
  }

  private createBridgePedestrians() {
    const configs = [
      {
        name: 'Scholar Master Li',
        role: 'Imperial Scholar',
        robeColor: '#2D6A4F', // Jade Green Hanfu
        hatType: 'scholar',
        startZ: -18,
        direction: 1 as const,
        laneX: -1.4,
        speed: 1.4,
      },
      {
        name: 'Merchant Zhang',
        role: 'River Merchant',
        robeColor: '#8C5A32', // Ochre Merchant Tunic
        hatType: 'douli',
        startZ: 20,
        direction: -1 as const,
        laneX: 1.5,
        speed: 1.25,
      },
      {
        name: 'Maiden Meiling',
        role: 'Silk Weaver',
        robeColor: '#9E2A2B', // Crimson & Plum Silk
        hatType: 'hairpin',
        startZ: -8,
        direction: 1 as const,
        laneX: 1.2,
        speed: 1.35,
      },
      {
        name: 'Wanderer Zhao',
        role: 'Gorge Explorer',
        robeColor: '#1D3557', // Indigo Traveler
        hatType: 'douli',
        startZ: 12,
        direction: -1 as const,
        laneX: -1.6,
        speed: 1.5,
      },
      {
        name: 'Scholar Chen',
        role: 'Calligrapher',
        robeColor: '#457B9D', // Azure Silk
        hatType: 'scholar',
        startZ: -2,
        direction: 1 as const,
        laneX: -0.9,
        speed: 1.2,
      },
      {
        name: 'Old Herb Gatherer Liu',
        role: 'Tea & Herb Merchant',
        robeColor: '#585123', // Olive Linen
        hatType: 'douli',
        startZ: 22,
        direction: -1 as const,
        laneX: 1.0,
        speed: 1.15,
      },
    ];

    configs.forEach((cfg) => {
      const npcGroup = new THREE.Group();

      const robeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.robeColor),
        roughness: 0.75,
      });

      const skinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#DDB892'),
        roughness: 0.6,
      });

      const darkMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#222222'),
        roughness: 0.8,
      });

      // 1. Torso / Flowing Robe
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.3), robeMat);
      torso.position.set(0, 1.25, 0);
      torso.castShadow = true;
      npcGroup.add(torso);

      // Traditional Chinese cross-collar / sash
      const sash = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.12, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.5 })
      );
      sash.position.set(0, 0.95, 0);
      npcGroup.add(sash);

      // 2. Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), skinMat);
      head.position.set(0, 1.8, 0);
      head.castShadow = true;
      npcGroup.add(head);

      // Headwear
      if (cfg.hatType === 'scholar') {
        // Imperial scholar box cap
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.24), darkMat);
        cap.position.set(0, 1.98, 0);
        npcGroup.add(cap);
      } else if (cfg.hatType === 'douli') {
        // Conical bamboo hat
        const douliMat = new THREE.MeshStandardMaterial({ color: 0xC9A86A, roughness: 0.85 });
        const douli = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.18, 12), douliMat);
        douli.position.set(0, 1.95, 0);
        douli.rotation.x = -0.1;
        npcGroup.add(douli);
      } else {
        // Hair topknot / bun
        const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), darkMat);
        bun.position.set(0, 1.96, -0.05);
        npcGroup.add(bun);
      }

      // 3. Legs
      const legGeom = new THREE.BoxGeometry(0.18, 0.72, 0.2);
      const leftLeg = new THREE.Mesh(legGeom, robeMat);
      leftLeg.position.set(-0.16, 0.45, 0);
      leftLeg.castShadow = true;

      const rightLeg = new THREE.Mesh(legGeom, robeMat);
      rightLeg.position.set(0.16, 0.45, 0);
      rightLeg.castShadow = true;

      npcGroup.add(leftLeg, rightLeg);

      // 4. Arms
      const armGeom = new THREE.BoxGeometry(0.14, 0.62, 0.14);
      const leftArm = new THREE.Mesh(armGeom, robeMat);
      leftArm.position.set(-0.35, 1.25, 0);
      leftArm.castShadow = true;

      const rightArm = new THREE.Mesh(armGeom, robeMat);
      rightArm.position.set(0.35, 1.25, 0);
      rightArm.castShadow = true;

      npcGroup.add(leftArm, rightArm);

      // Merchant accessories (bamboo shoulder pole if merchant)
      if (cfg.role.includes('Merchant')) {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xC49A45, roughness: 0.6 });
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8), poleMat);
        pole.rotation.z = Math.PI / 2;
        pole.position.set(0, 1.45, 0);
        npcGroup.add(pole);

        // Hanging woven baskets
        const basketMat = new THREE.MeshStandardMaterial({ color: 0xA8884B, roughness: 0.9 });
        [-0.8, 0.8].forEach((bx) => {
          const b = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.3, 8), basketMat);
          b.position.set(bx, 1.05, 0);
          npcGroup.add(b);
        });
      }

      const deckY = this.bridge.getBridgeDeckHeight(cfg.startZ);
      npcGroup.position.set(this.bridge.BRIDGE_X + cfg.laneX, deckY, cfg.startZ);
      npcGroup.rotation.y = cfg.direction === 1 ? 0 : Math.PI;

      this.group.add(npcGroup);

      this.npcs.push({
        name: cfg.name,
        role: cfg.role,
        speed: cfg.speed,
        direction: cfg.direction,
        currentZ: cfg.startZ,
        laneX: cfg.laneX,
        state: 'walking',
        pauseTimer: 0,
        walkCycle: Math.random() * Math.PI * 2,
        group: npcGroup,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
      });
    });
  }

  public update(delta: number, elapsed: number) {
    this.npcs.forEach((npc) => {
      if (npc.state === 'pausing') {
        npc.pauseTimer -= delta;
        // Idle animation
        npc.walkCycle += delta * 1.5;
        npc.leftLeg.rotation.x = THREE.MathUtils.damp(npc.leftLeg.rotation.x, 0, 8, delta);
        npc.rightLeg.rotation.x = THREE.MathUtils.damp(npc.rightLeg.rotation.x, 0, 8, delta);
        npc.leftArm.rotation.x = THREE.MathUtils.damp(npc.leftArm.rotation.x, 0, 8, delta);
        npc.rightArm.rotation.x = THREE.MathUtils.damp(npc.rightArm.rotation.x, 0, 8, delta);

        if (npc.pauseTimer <= 0) {
          // Resume walking and turn around
          npc.direction = (npc.direction === 1 ? -1 : 1);
          npc.state = 'walking';
          npc.group.rotation.y = npc.direction === 1 ? 0 : Math.PI;
        }
      } else {
        // Walking traversal along bridge
        npc.currentZ += npc.direction * npc.speed * delta;
        npc.walkCycle += delta * npc.speed * 4.5;

        // Limb animation
        const legSwing = Math.sin(npc.walkCycle) * 0.45;
        npc.leftLeg.rotation.x = legSwing;
        npc.rightLeg.rotation.x = -legSwing;
        npc.leftArm.rotation.x = -legSwing * 0.7;
        npc.rightArm.rotation.x = legSwing * 0.7;

        // Check bridge boundaries and gates (North Gate Z: -22, South Gate Z: 24)
        const northTurnaroundZ = -23.5;
        const southTurnaroundZ = 25.5;

        // Occasional scenic pause near central pavilion
        if (Math.abs(npc.currentZ - 1.0) < 0.3 && Math.random() < delta * 0.15) {
          npc.state = 'pausing';
          npc.pauseTimer = 3.5 + Math.random() * 4.0;
        } else if (npc.direction === 1 && npc.currentZ >= southTurnaroundZ) {
          // Reached south gate exit
          npc.state = 'pausing';
          npc.pauseTimer = 4.0 + Math.random() * 3.0;
        } else if (npc.direction === -1 && npc.currentZ <= northTurnaroundZ) {
          // Reached north gate exit
          npc.state = 'pausing';
          npc.pauseTimer = 4.0 + Math.random() * 3.0;
        }

        // Align smoothly to the arched bridge deck height
        const deckY = this.bridge.getBridgeDeckHeight(npc.currentZ);
        npc.group.position.set(this.bridge.BRIDGE_X + npc.laneX, deckY, npc.currentZ);
      }
    });
  }
}
