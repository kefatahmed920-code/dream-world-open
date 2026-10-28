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
  // Active Walking Pedestrians along Dhanmondi Avenue Sidewalks
  {
    id: 'ped_shuvo',
    name: 'Shuvo',
    nameBn: 'শুভ',
    role: 'Student & Tech Enthusiast',
    position: [5, 0, 14.8],
    rotationY: 0,
    appearance: {
      skinTone: '#be8055',
      shirtColor: '#2563eb', // Blue polo
      pantsColor: '#1e293b', // Denim
      hairColor: '#171717',
      clothingType: 'casual',
      hasGamcha: false,
    },
    dialogueId: 'dialogue_ped_generic',
    idleType: 'stand',
  },
  {
    id: 'ped_fatima',
    name: 'Fatima',
    nameBn: 'ফাতিমা',
    role: 'Dhaka University Student',
    position: [-15, 0, -8.8],
    rotationY: Math.PI,
    appearance: {
      skinTone: '#cca17b',
      shirtColor: '#db2777', // Magenta kurti
      pantsColor: '#fdf2f8',
      hairColor: '#18181b',
      clothingType: 'casual',
      hasGlasses: true,
    },
    dialogueId: 'dialogue_ped_generic',
    idleType: 'stand',
  },
  {
    id: 'ped_tanvir',
    name: 'Tanvir Ahmed',
    nameBn: 'তানভীর আহমেদ',
    role: 'Corporate Executive',
    position: [-45, 0, 14.8],
    rotationY: Math.PI * 0.5,
    appearance: {
      skinTone: '#9d633d',
      shirtColor: '#0f172a', // Navy suit
      pantsColor: '#334155',
      hairColor: '#27272a',
      clothingType: 'jacket',
      hasGamcha: false,
    },
    dialogueId: 'dialogue_ped_generic',
    idleType: 'stand',
  },
  {
    id: 'ped_nasreen',
    name: 'Nasreen Begum',
    nameBn: 'নাসরীন বেগম',
    role: 'Shopper',
    position: [20, 0, 14.8],
    rotationY: -Math.PI * 0.5,
    appearance: {
      skinTone: '#cca17b',
      shirtColor: '#059669', // Emerald saree/kurta
      pantsColor: '#f0fdf4',
      hairColor: '#09090b',
      clothingType: 'casual',
    },
    dialogueId: 'dialogue_ped_generic',
    idleType: 'stand',
  },
  {
    id: 'ped_ashraf',
    name: 'Master Ashraf',
    nameBn: 'মাস্টার আশরাফ',
    role: 'Retired School Teacher',
    position: [-75, 0, -8.8],
    rotationY: 0,
    appearance: {
      skinTone: '#a26b47',
      shirtColor: '#f59e0b', // Amber Panjabi
      pantsColor: '#475569',
      hairColor: '#94a3b8', // Silver grey
      clothingType: 'panjabi',
      hasGamcha: true,
      hasGlasses: true,
    },
    dialogueId: 'dialogue_ped_generic',
    idleType: 'stand',
  },
];

export interface ActiveNPC {
  config: NPCConfig;
  rig: CharacterRig;
  patrolWaypoints?: THREE.Vector3[];
  patrolIndex: number;
  patrolWaitTime: number;
  currentSpeed: number;
  routineState?: 'walking' | 'window_shopping' | 'waiting_crosswalk' | 'greeting';
  targetFacingAngle?: number;
}

export class NPCManager {
  public npcs: ActiveNPC[] = [];
  public group: THREE.Group;

  constructor(scene: THREE.Scene, getTerrainHeight: (x: number, z: number, y?: number) => number) {
    this.group = new THREE.Group();
    this.group.name = 'NPCs';
    scene.add(this.group);

    this.spawnNPCs(getTerrainHeight);
  }

  private spawnNPCs(getTerrainHeight: (x: number, z: number, y?: number) => number) {
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
        routineState: 'walking',
      };

      // 1. Village Farmer Mizan (Field inspection)
      if (config.id === 'npc_mizan') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(140, getTerrainHeight(140, 135), 135),
          new THREE.Vector3(170, getTerrainHeight(170, 130), 130),
          new THREE.Vector3(160, getTerrainHeight(160, 150), 150),
        ];
      }

      // 2. City Pedestrian Shuvo (South sidewalk route with Cha Stall & Overbridge visits)
      if (config.id === 'ped_shuvo') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(5, getTerrainHeight(5, 14.8), 14.8),
          new THREE.Vector3(14, getTerrainHeight(14, 14.8), 14.8),
          new THREE.Vector3(22, getTerrainHeight(22, 14.8), 14.8),
          new THREE.Vector3(12, getTerrainHeight(12, 14.8), 14.8),
          new THREE.Vector3(-2, getTerrainHeight(-2, 14.8), 14.8),
          new THREE.Vector3(-25, getTerrainHeight(-25, 14.8), 14.8),
        ];
      }

      // 3. City Pedestrian Fatima (North sidewalk route between Pharmacy, Textiles, and Hotel)
      if (config.id === 'ped_fatima') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(16, getTerrainHeight(16, -8.8), -8.8),
          new THREE.Vector3(4, getTerrainHeight(4, -8.8), -8.8),
          new THREE.Vector3(-8, getTerrainHeight(-8, -8.8), -8.8),
          new THREE.Vector3(-25, getTerrainHeight(-25, -8.8), -8.8),
          new THREE.Vector3(-55, getTerrainHeight(-55, -8.8), -8.8),
          new THREE.Vector3(-25, getTerrainHeight(-25, -8.8), -8.8),
        ];
      }

      // 4. City Pedestrian Tanvir (West commercial sidewalk walk)
      if (config.id === 'ped_tanvir') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(-45, getTerrainHeight(-45, 14.8), 14.8),
          new THREE.Vector3(-65, getTerrainHeight(-65, 14.8), 14.8),
          new THREE.Vector3(-95, getTerrainHeight(-95, 14.8), 14.8),
          new THREE.Vector3(-65, getTerrainHeight(-65, 14.8), 14.8),
        ];
      }

      // 5. City Pedestrian Nasreen (Window shopper browsing Dhanmondi shopfronts)
      if (config.id === 'ped_nasreen') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(20, getTerrainHeight(20, 14.8), 14.8),
          new THREE.Vector3(14, getTerrainHeight(14, 14.8), 14.8),
          new THREE.Vector3(8, getTerrainHeight(8, 14.8), 14.8),
          new THREE.Vector3(-1, getTerrainHeight(-1, 14.8), 14.8),
          new THREE.Vector3(8, getTerrainHeight(8, 14.8), 14.8),
        ];
      }

      // 6. Master Ashraf (Peaceful morning stroll along north sidewalk)
      if (config.id === 'ped_ashraf') {
        activeNpc.patrolWaypoints = [
          new THREE.Vector3(-75, getTerrainHeight(-75, -8.8), -8.8),
          new THREE.Vector3(-105, getTerrainHeight(-105, -8.8), -8.8),
          new THREE.Vector3(-60, getTerrainHeight(-60, -8.8), -8.8),
        ];
      }

      this.npcs.push(activeNpc);
    }
  }

  public update(
    delta: number,
    playerPos: THREE.Vector3,
    getTerrainHeight: (x: number, z: number, y?: number) => number,
  ) {
    const _playerVec = playerPos.clone();

    for (const npc of this.npcs) {
      const npcPos = npc.rig.group.position;
      const distToPlayer = npcPos.distanceTo(_playerVec);

      // Natural head tracking when player is within 6m
      if (distToPlayer < 6.0) {
        npc.rig.lookAt(_playerVec);
      }

      // Handle purposeful routines for patrolling/walking NPCs
      if (npc.patrolWaypoints && npc.patrolWaypoints.length > 0) {
        if (distToPlayer < 2.2) {
          // Pause and acknowledge player when very close
          npc.currentSpeed = 0;
          npc.rig.updateAnimation(delta, 0, false);
          continue;
        }

        const target = npc.patrolWaypoints[npc.patrolIndex];
        const toTarget = new THREE.Vector2(target.x - npcPos.x, target.z - npcPos.z);
        const distToTarget = toTarget.length();

        // Check if reached current waypoint
        if (distToTarget < 1.1) {
          npc.patrolWaitTime += delta;
          npc.currentSpeed = 0;

          // State Machine: alternate between window shopping and waiting
          if (npc.config.id === 'ped_nasreen' || npc.config.id === 'ped_shuvo') {
            npc.routineState = 'window_shopping';
            // Turn toward the shopfront facing (+Z = South facade)
            const shopAngle = npcPos.z > 0 ? 0 : Math.PI;
            npc.rig.group.rotation.y = THREE.MathUtils.damp(npc.rig.group.rotation.y, shopAngle, 4, delta);
          } else {
            npc.routineState = 'waiting_crosswalk';
          }

          const waitDuration = npc.routineState === 'window_shopping' ? 4.5 : 2.5;

          if (npc.patrolWaitTime > waitDuration) {
            npc.patrolWaitTime = 0;
            npc.routineState = 'walking';
            npc.patrolIndex = (npc.patrolIndex + 1) % npc.patrolWaypoints.length;
          }

          npc.rig.updateAnimation(delta, 0, false);
        } else {
          // Walking towards target waypoint
          npc.routineState = 'walking';
          toTarget.normalize();
          const moveSpeed = 1.25; // 1.25 m/s natural human walking pace
          npc.currentSpeed = 0.45; // walk animation speed

          const targetAngle = Math.atan2(toTarget.x, toTarget.y);
          npc.rig.group.rotation.y = THREE.MathUtils.damp(npc.rig.group.rotation.y, targetAngle, 8, delta);

          npcPos.x += Math.sin(targetAngle) * moveSpeed * delta;
          npcPos.z += Math.cos(targetAngle) * moveSpeed * delta;
          npcPos.y = getTerrainHeight(npcPos.x, npcPos.z, npcPos.y);

          npc.rig.updateAnimation(delta, npc.currentSpeed, false);
        }
      } else {
        // Stationary story NPC idle breathing animation
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
