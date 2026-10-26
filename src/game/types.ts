/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeatherType = 'clear' | 'rain' | 'mist' | 'sunset';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export interface GameSettings {
  quality: GraphicsQuality;
  masterVolume: number;
  sfxVolume: number;
  timeSpeed: number; // 1 = real-time, 10 = fast
  invertY: boolean;
  cameraSensitivity: number;
  shadows: boolean;
  weather: WeatherType;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  icon: string;
  category: 'consumable' | 'quest' | 'tool' | 'treasure';
  count: number;
}

export interface QuestObjective {
  id: string;
  text: string;
  targetPos: { x: number; y: number; z: number };
  targetRadius: number;
  targetRegion: string;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  giverName: string;
  rewardMoney: number;
  rewardExp: number;
  rewardItem?: InventoryItem;
  objectives: QuestObjective[];
  currentObjectiveIndex: number;
  status: 'available' | 'active' | 'completed';
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerTitle: string;
  text: string;
  textBn?: string;
  options: {
    label: string;
    nextNodeId?: string;
    action?: 'acceptQuest' | 'giveItem' | 'close' | 'trade';
    questId?: string;
  }[];
}

export interface NPCConfig {
  id: string;
  name: string;
  nameBn: string;
  role: string;
  position: [number, number, number];
  rotationY: number;
  appearance: {
    skinTone: string;
    shirtColor: string;
    pantsColor: string;
    hairColor: string;
    clothingType: 'panjabi' | 'casual' | 'jacket' | 'vest';
    hasGamcha?: boolean;
    hasHat?: boolean;
    hasGlasses?: boolean;
  };
  dialogueId: string;
  idleType: 'stand' | 'lean' | 'wave' | 'sit';
  questAvailableId?: string;
}

export interface VehicleConfig {
  id: string;
  type: 'cng' | 'car' | 'bike';
  name: string;
  nameBn: string;
  position: [number, number, number];
  rotationY: number;
  color: string;
  maxSpeed: number;
  acceleration: number;
  handling: number;
}

export interface PlayerStats {
  money: number; // In Bangladeshi Taka (৳)
  exp: number;
  level: number;
  stamina: number;
  maxStamina: number;
  health: number;
  maxHealth: number;
}

export interface SavedGameState {
  version: number;
  playerPosition: [number, number, number];
  playerRotation: number;
  stats: PlayerStats;
  inventory: InventoryItem[];
  quests: Quest[];
  activeQuestId: string | null;
  timeOfDay: number;
  weather: WeatherType;
  settings: GameSettings;
}
