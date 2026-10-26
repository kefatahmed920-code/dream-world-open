/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { CharacterRig, CharacterAppearance } from './characterModel';
import { NPCConfig } from '../types';

export interface ActiveNPC {
  config: NPCConfig;
  rig: CharacterRig;
  patrolWaypoints?: THREE.Vector3[];
  patrolIndex: number;
  patrolWaitTime: number;
  currentSpeed: number;
}

export const WORLD_NPCS: NPCConfig[] = [
  {
    id: 'npc_rahim',
    name: 'Rahim Bhai',
    nameBn: 'রহিম ভাই',
    role: 'Dhaka Cha Master',
    position: [14, 0, 14],
    rotationY: Math.PI * 0.85,
    appearance: {
      skinTone: '#be8055',
      shirtColor: '#f7f4ea', // Cream Panjabi
      pantsColor: '#2d3748',
      hairColor: '#2b2b2b',
      clothingType: 'panjabi',
      hasGamcha: true,
    },
    dialogueId: 'dialogue_rahim',
    idleType: 'stand',
    questAvailableId: 'quest_1_cha',
  },
  {
    id: 'npc_kabir',
    name: 'Kabir Driver',
    nameBn: 'কবির চালক',
    role: 'CNG Auto-Rickshaw Pilot',
    position: [24, 0, 19],
    rotationY: Math.PI * 0.4,
    appearance: {
      skinTone: '#9d633d',
      shirtColor: '#22543d', // Dark green shirt
      pantsColor: '#1a202c',
      hairColor: '#111111',
      clothingType: 'jacket',
      hasGamcha: false,
    },
    dialogueId: 'dialogue_kabir',
    idleType: 'lean',
    questAvailableId: 'quest_2_drive',
  },
  {
    id: 'npc_anika',
    name: 'Anika',
    nameBn: 'আনিকা',
    role: 'Environmental Researcher',
    position: [240, 0, -45],
    rotationY: -Math.PI * 0.25,
    appearance: {
      skinTone: '#cca17b',
      shirtColor: '#805ad5', // Purple university hoodie
      pantsColor: '#1a365d', // Navy jeans
      hairColor: '#1c1c1c',
      clothingType: 'casual',
      hasGlasses: true,
    },
    dialogueId: 'dialogue_anika',
    idleType: 'stand',
    questAvailableId: 'quest_3_waterfall',
  },
  {
    id: 'npc_selim',
    name: 'Uncle Selim',
    nameBn: 'সেলিম চাচা',
    role: 'Village Elder & Boatman',
    position: [185, 0, 110],
    rotationY: Math.PI * 1.1,
    appearance: {
      skinTone: '#a26b47',
      shirtColor: '#dd6b20', // Orange cotton kurta
      pantsColor: '#4a5568',
      hairColor: '#718096', // Greying elder hair
      clothingType: 'panjabi',
      hasGamcha: true,
    },
    dialogueId: 'dialogue_selim',
    idleType: 'stand',
    questAvailableId: 'quest_4_relic',
  },
  {
    id: 'npc_mizan',
    name: 'Mizan Farmer',
    nameBn: 'মিজান কৃষক',
    role: 'Paddy Field Caretaker',
    position: [140, 0, 135],
    rotationY: 0,
    appearance: {
      skinTone: '#8c532d',
      shirtColor: '#e2e8f0',
      pantsColor: '#2b6cb0',
      hairColor: '#1a202c',
      clothingType: 'casual',
      hasGamcha: true,
    },
    dialogueId: 'dialogue_mizan',
    idleType: 'stand',
  },
];

export class NPCManager {
  public npcs: ActiveNPC[] = [];
  public group: THREE.Group;

  constructor(scene: THREE.Scene, getTerrainHeight: (x: number, z: number) => number) {
    this.group = new THREE.Group();
    this.group.name = 'NPCs';
    scene.add(this.group);

    this.spawnNPCs(getTerrainHeight);
  }

  private spawnNPCs(getTerrainHeight: (x: number, z: number) => number) {
    for (const config of WORLD_NPCS) {
      const appearance: CharacterAppearance = {
        skinTone: config.appearance.skinTone,
        hairColor: config.appearance.hairColor,
        hairStyle: 'short',
        shirtColor: config.appearance.shirtColor,
        jacketColor: config.appearance.shirtColor,
        pantsColor: config.appearance.pantsColor,
        shoesColor: '#333333',
        hasJacket: config.appearance.clothingType === 'jacket',
        hasGamcha: config.appearance.hasGamcha,
        hasGlasses: config.appearance.hasGlasses,
      };

      const rig = new CharacterRig(appearance);
      const groundY = getTerrainHeight(config.position[0], config.position[2]);
      rig.group.position.set(config.position[0], groundY, config.position[2]);
      rig.group.rotation.y = config.rotationY;

      this.group.add(rig.group);

      const activeNpc: ActiveNPC = {
        config,
        rig,
        patrolIndex: 0,
        patrolWaitTime: 0,
        currentSpeed: 0,
      };

      // Add patrol waypoints for walking NPCs (like Mizan in the village)
      if (config.id === 'npc_mizan') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(140, getTerrainHeight(140, 135), 135),
          new THREE.Vector3(170, getTerrainHeight(170, 130), 130),
          new THREE.Vector3(160, getTerrainHeight(160, 150), 150),
        ];
      }

      this.npcs.push(activeNpc);
    }
  }

  public update(delta: number, playerPos: THREE.Vector3, getTerrainHeight: (x: number, z: number) => number) {
    const _playerVec = playerPos.clone();

    for (const npc of this.npcs) {
      const npcPos = npc.rig.group.position;
      const distToPlayer = npcPos.distanceTo(_playerVec);

      // Natural head tracking when player is within 8m
      if (distToPlayer < 8.0) {
        npc.rig.lookAt(_playerVec);
      }

      // Handle patrolling for moving NPCs
      if (npc.patrolWaypoints && npc.patrolWaypoints.length > 0) {
        if (distToPlayer < 3.0) {
          // Pause and talk to player if very close
          npc.currentSpeed = 0;
          npc.rig.updateAnimation(delta, 0, false);
        } else {
          const target = npc.patrolWaypoints[npc.patrolIndex];
          const toTarget = new THREE.Vector2(target.x - npcPos.x, target.z - npcPos.z);
          const distToTarget = toTarget.length();

          if (distToTarget < 1.0) {
            npc.patrolWaitTime += delta;
            npc.currentSpeed = 0;
            if (npc.patrolWaitTime > 3.0) {
              npc.patrolWaitTime = 0;
              npc.patrolIndex = (npc.patrolIndex + 1) % npc.patrolWaypoints.length;
            }
          } else {
            toTarget.normalize();
            const moveSpeed = 1.2; // 1.2 m/s gentle walk
            npc.currentSpeed = 0.4; // walk animation speed
            const angle = Math.atan2(toTarget.x, toTarget.y);
            npc.rig.group.rotation.y = THREE.MathUtils.damp(npc.rig.group.rotation.y, angle, 6, delta);

            npcPos.x += Math.sin(angle) * moveSpeed * delta;
            npcPos.z += Math.cos(angle) * moveSpeed * delta;
            npcPos.y = getTerrainHeight(npcPos.x, npcPos.z);
          }
          npc.rig.updateAnimation(delta, npc.currentSpeed, false);
        }
      } else {
        // Stationary NPC idle breathing
        npc.rig.updateAnimation(delta, 0, false);
      }
    }
  }

  public getNearestNPC(pos: THREE.Vector3, maxDist = 3.0): ActiveNPC | null {
    let nearest: ActiveNPC | null = null;
    let minDist = maxDist;

    for (const npc of this.npcs) {
      const d = npc.rig.group.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        nearest = npc;
      }
    }
    return nearest;
  }
}
