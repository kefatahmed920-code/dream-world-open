/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quest, InventoryItem, DialogueNode, PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';
import { authManager } from '../auth/authManager';
import { NetworkConfig } from '../config/networkConfig';
import { retentionManager } from '../pwa/retentionNotification';

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item_phone',
    name: 'Smart Phone',
    nameBn: 'স্মার্টফোন',
    description: 'A modern smartphone with high-speed 5G GPS mapping and communication.',
    icon: 'smartphone',
    category: 'tool',
    count: 1,
  },
  {
    id: 'item_wallet',
    name: 'Leather Wallet',
    nameBn: 'চামড়ার মানিব্যাগ',
    description: 'Holds your Bangladeshi Taka banknotes and national ID.',
    icon: 'wallet',
    category: 'tool',
    count: 1,
  },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_1_cha',
    title: 'Welcome to Dream World: The Morning Cha',
    titleBn: 'স্বপ্নের ভুবনে স্বাগতম: সকালের স্পেশাল চা',
    description: 'Explore the vibrant city street, meet Rahim Bhai at Dhaka Cha Stall, and enjoy a fragrant cup of spiced cardamom tea.',
    giverName: 'Rahim Bhai',
    rewardMoney: 150,
    rewardExp: 100,
    rewardItem: {
      id: 'item_spiced_cha',
      name: 'Spiced Cardamom Cha',
      nameBn: 'এলাচি স্পেশাল চা',
      description: 'Freshly brewed aromatic tea that restores your stamina and energy.',
      icon: 'coffee',
      category: 'consumable',
      count: 1,
    },
    objectives: [
      {
        id: 'obj_1_1',
        text: 'Walk up to Rahim Bhai at the Dhaka Cha Stall and talk with him.',
        targetPos: { x: 14, y: 0, z: 14 },
        targetRadius: 4.5,
        targetRegion: 'Modern City',
        completed: false,
      },
      {
        id: 'obj_1_2',
        text: 'Enjoy your hot tea and receive your reward.',
        targetPos: { x: 14, y: 0, z: 14 },
        targetRadius: 4.5,
        targetRegion: 'Dhaka Cha Stall',
        completed: false,
      },
    ],
    currentObjectiveIndex: 0,
    status: 'available',
  },
  {
    id: 'quest_2_drive',
    title: 'The Green Horizon: Journey Across the Padma',
    titleBn: 'পদ্মা পেরিয়ে সবুজ দিগন্তে যাত্রা',
    description: 'Meet Kabir at the auto stand, enter the Green CNG Auto-Rickshaw, and cruise across the Grand Bridge into rural Shonar Village.',
    giverName: 'Kabir Driver',
    rewardMoney: 500,
    rewardExp: 250,
    rewardItem: {
      id: 'item_cng_key',
      name: 'CNG Master Key',
      nameBn: 'সিএনজি মাস্টার চাবি',
      description: 'Your personal ignition key for green auto-rickshaws across the delta.',
      icon: 'key',
      category: 'tool',
      count: 1,
    },
    objectives: [
      {
        id: 'obj_2_1',
        text: 'Enter the Green CNG Auto-Rickshaw [Drive].',
        targetPos: { x: 20, y: 0, z: 16 },
        targetRadius: 3.5,
        targetRegion: 'Avenue Stand',
        completed: false,
      },
      {
        id: 'obj_2_2',
        text: 'Drive across the Grand Bridge into Shonar Village tea tong.',
        targetPos: { x: 160, y: 0.5, z: 95 },
        targetRadius: 16.0,
        targetRegion: 'Shonar Village',
        completed: false,
      },
    ],
    currentObjectiveIndex: 0,
    status: 'available',
  },
  {
    id: 'quest_3_waterfall',
    title: 'Ascent of the Misty Falls: The Mountain Relic',
    titleBn: 'ঝর্ণার গুপ্ত রহস্য: পাহাড়ের পবিত্র স্ফটিক',
    description: 'Ascend the scenic Sylhet mountain trail, reach the roaring waterfall grotto, and retrieve the glowing ancient crystal.',
    giverName: 'Anika',
    rewardMoney: 1000,
    rewardExp: 500,
    rewardItem: {
      id: 'item_relic',
      name: 'Ancient Waterfall Crystal',
      nameBn: 'পাহাড়ের পবিত্র স্ফটিক',
      description: 'A luminous crystalline artifact vibrating with pure water essence.',
      icon: 'gem',
      category: 'treasure',
      count: 1,
    },
    objectives: [
      {
        id: 'obj_3_1',
        text: 'Hike up the mountain trail to the Sylhet Waterfall Grotto.',
        targetPos: { x: 272, y: 3.4, z: -101 },
        targetRadius: 6.0,
        targetRegion: 'Sylhet Waterfall',
        completed: false,
      },
      {
        id: 'obj_3_2',
        text: 'Collect the luminous Ancient Waterfall Relic from the stone pedestal.',
        targetPos: { x: 272, y: 3.4, z: -101 },
        targetRadius: 4.0,
        targetRegion: 'Waterfall Grotto',
        completed: false,
      },
    ],
    currentObjectiveIndex: 0,
    status: 'available',
  },
];

export const DIALOGUE_DATABASE: Record<string, DialogueNode> = {
  dialogue_rahim: {
    id: 'dialogue_rahim',
    speaker: 'Rahim Bhai',
    speakerTitle: 'Dhaka Cha Stall Master',
    text: 'Assalamu Alaikum, bondhu! Welcome to Dream World! The morning breeze is fresh and my spiced cardamom milk tea is brewing hot. What brings you here today?',
    textBn: 'আসসালামু আলাইকুম বন্ধু! স্বপ্নের ভুবনে আপনাকে স্বাগতম। গরম এলাচি স্পেশাল চা তৈরি হচ্ছে।',
    options: [
      {
        label: 'I would love a cup of hot spiced cha!',
        nextNodeId: 'rahim_give_cha',
        action: 'acceptQuest',
        questId: 'quest_1_cha',
      },
      {
        label: 'Tell me about this open world.',
        nextNodeId: 'rahim_lore',
      },
      {
        label: 'Goodbye, Rahim Bhai.',
        action: 'close',
      },
    ],
  },
  rahim_give_cha: {
    id: 'rahim_give_cha',
    speaker: 'Rahim Bhai',
    speakerTitle: 'Dhaka Cha Stall Master',
    text: 'Here you go! Freshly poured milk tea with pure cardamom and crushed ginger. Drink up, and talk to Kabir over by the green CNG if you want to travel across the Padma Bridge!',
    textBn: 'এই নিন আপনার স্পেশাল চা! শরীর ও মন চাঙ্গা হবে। পদ্মা সেতু পার হতে চাইলে কবিরের সিএনজিতে চড়ুন!',
    options: [
      {
        label: 'Thank you! (Accept Cha & Complete Task)',
        action: 'giveItem',
        questId: 'quest_1_cha',
      },
    ],
  },
  rahim_lore: {
    id: 'rahim_lore',
    speaker: 'Rahim Bhai',
    speakerTitle: 'Dhaka Cha Stall Master',
    text: 'Beyond this bustling city lies the great Padma River. Cross the suspension bridge, and you will find tranquil Shonar Village, green paddy fields, and further north, the high green mountains and cascading waterfalls of Sylhet!',
    textBn: 'শহরের পাশেই পদ্মা নদী। ব্রিজ পার হলেই সবুজ গ্রাম, আর দূরে পাহাড় ও জলপ্রপাত!',
    options: [
      {
        label: 'Sounds amazing! Let me grab some cha.',
        nextNodeId: 'dialogue_rahim',
      },
    ],
  },
  dialogue_kabir: {
    id: 'dialogue_kabir',
    speaker: 'Kabir Driver',
    speakerTitle: 'CNG Auto-Rickshaw Pilot',
    text: 'Hey brother! Looking for a smooth ride? My green CNG auto-rickshaw is fueled and tuned to perfection. You can take the wheel and drive across the bridge to Shonar Village whenever you like!',
    textBn: 'ভাইয়া, সিএনজিতে ঘুরবেন? গাড়ি একদম রেডি, পদ্মা ব্রিজ দিয়ে গ্রাম ঘুরে আসুন!',
    options: [
      {
        label: 'I want to drive across the Padma Bridge! [Accept Quest]',
        action: 'acceptQuest',
        questId: 'quest_2_drive',
      },
      {
        label: 'How do the vehicle controls work?',
        nextNodeId: 'kabir_controls',
      },
      {
        label: 'Catch you later, Kabir.',
        action: 'close',
      },
    ],
  },
  kabir_controls: {
    id: 'kabir_controls',
    speaker: 'Kabir Driver',
    speakerTitle: 'CNG Auto-Rickshaw Pilot',
    text: 'Step close and press [F] or tap the Drive button to hop in. Use W/S for gas and reverse, and A/D to steer with responsive turning. Press [F] anytime to exit safely!',
    options: [
      {
        label: 'Got it, thanks Kabir!',
        nextNodeId: 'dialogue_kabir',
      },
    ],
  },
  dialogue_anika: {
    id: 'dialogue_anika',
    speaker: 'Anika',
    speakerTitle: 'Environmental Researcher',
    text: 'Hello! I am researching the unique microclimate of these hills. Up by the roaring waterfall, hidden behind the mist, there is an ancient glowing crystal on a stone pedestal. Could you help retrieve it?',
    textBn: 'হ্যালো! জলপ্রপাতের ভেতরে একটি রহস্যময় স্ফটিক রয়েছে। আপনি কি সেটি উদ্ধার করতে পারবেন?',
    options: [
      {
        label: 'I will ascend the mountain trail and find it! [Accept Quest]',
        action: 'acceptQuest',
        questId: 'quest_3_waterfall',
      },
      {
        label: 'Any tips for navigating the mountain?',
        nextNodeId: 'anika_tips',
      },
      {
        label: 'I will return soon.',
        action: 'close',
      },
    ],
  },
  anika_tips: {
    id: 'anika_tips',
    speaker: 'Anika',
    speakerTitle: 'Environmental Researcher',
    text: 'Follow the winding dirt trail past the suspension viewpoint bridge. The roar of the water will guide you straight to the grotto!',
    options: [
      {
        label: 'Understood, heading up now!',
        nextNodeId: 'dialogue_anika',
      },
    ],
  },
  dialogue_selim: {
    id: 'dialogue_selim',
    speaker: 'Uncle Selim',
    speakerTitle: 'Village Elder & Boatman',
    text: 'Joy Bangla, my child! Welcome to Shonar Village. The river waters flow gently and the fishermen are casting their nets. Peace and blessings to you.',
    textBn: 'জয় বাংলা! সোনার গ্রামে তোমাকে স্বাগতম। নদীর হাওয়া কত মিষ্টি দেখ!',
    options: [
      {
        label: 'It is truly peaceful here, Uncle Selim.',
        action: 'close',
      },
    ],
  },
  dialogue_mizan: {
    id: 'dialogue_mizan',
    speaker: 'Mizan Farmer',
    speakerTitle: 'Paddy Field Caretaker',
    text: 'The Aman paddy is coming along splendidly this season! Be careful not to trample the young seedlings as you explore the paths, bondhu!',
    textBn: 'এই বছর ধানের ফলন দারুণ হয়েছে বন্ধু!',
    options: [
      {
        label: 'Keep up the great work, Mizan!',
        action: 'close',
      },
    ],
  },
};

export class QuestManager {
  public quests: Quest[] = INITIAL_QUESTS;
  public activeQuestId: string | null = 'quest_1_cha';
  public inventory: InventoryItem[] = INITIAL_INVENTORY;
  public playerStats: PlayerStats = {
    money: 350,
    exp: 0,
    level: 1,
    stamina: 100,
    maxStamina: 100,
    health: 100,
    maxHealth: 100,
  };

  public onQuestUpdated?: (quest: Quest) => void;
  public onNotification?: (msg: string, title?: string) => void;

  constructor() {
    // Start with Quest 1 active
    this.quests[0].status = 'active';
  }

  public getActiveQuest(): Quest | null {
    if (!this.activeQuestId) return null;
    return this.quests.find((q) => q.id === this.activeQuestId) || null;
  }

  public acceptQuest(questId: string) {
    const q = this.quests.find((item) => item.id === questId);
    if (q && q.status !== 'completed') {
      q.status = 'active';
      this.activeQuestId = questId;
      soundManager.playDialogueChime();
      this.onNotification?.(`Accepted: ${q.title}`, 'New Quest');
      this.onQuestUpdated?.(q);
    }
  }

  public checkProximityObjectives(playerPos: { x: number; y: number; z: number }, isInVehicle: boolean) {
    const active = this.getActiveQuest();
    if (!active || active.status !== 'active') return;

    const currentObj = active.objectives[active.currentObjectiveIndex];
    if (!currentObj || currentObj.completed) return;

    const dx = playerPos.x - currentObj.targetPos.x;
    const dy = playerPos.y - currentObj.targetPos.y;
    const dz = playerPos.z - currentObj.targetPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Special condition checks
    if (active.id === 'quest_2_drive' && active.currentObjectiveIndex === 0) {
      // Must be driving vehicle
      if (isInVehicle) {
        this.completeCurrentObjective(active);
      }
    } else if (dist <= currentObj.targetRadius) {
      if (active.id === 'quest_1_cha' && active.currentObjectiveIndex === 0) {
        // Triggered via talking to Rahim
      } else {
        this.completeCurrentObjective(active);
      }
    }
  }

  public completeCurrentObjective(quest: Quest) {
    const obj = quest.objectives[quest.currentObjectiveIndex];
    if (!obj || obj.completed) return;

    obj.completed = true;
    soundManager.playCollectItem();

    if (quest.currentObjectiveIndex + 1 < quest.objectives.length) {
      quest.currentObjectiveIndex++;
      this.onNotification?.(`Objective Complete: ${obj.text}`, quest.title);
      this.onQuestUpdated?.(quest);
    } else {
      // Entire quest completed!
      this.completeQuest(quest);
    }
  }

  public completeQuest(quest: Quest) {
    quest.status = 'completed';
    soundManager.playQuestComplete();

    // Rewards
    this.playerStats.money += quest.rewardMoney;
    this.playerStats.exp += quest.rewardExp;
    let didLevelUp = false;
    if (this.playerStats.exp >= this.playerStats.level * 250) {
      this.playerStats.level++;
      didLevelUp = true;
      this.onNotification?.(`Level Up! You are now Level ${this.playerStats.level}`, 'LEVEL UP');
      retentionManager.sendImmediateNotification({
        title: `Level Up! Level ${this.playerStats.level}`,
        body: `Congratulations! You leveled up in Dhaka Open World!`,
      });
    }

    if (quest.rewardItem) {
      this.addItem(quest.rewardItem);
    }

    this.onNotification?.(
      `Quest Completed: ${quest.title} (+৳${quest.rewardMoney}, +${quest.rewardExp} EXP)`,
      'CONGRATULATIONS!',
    );

    retentionManager.sendImmediateNotification({
      title: `Quest Completed: ${quest.title}`,
      body: `Reward earned: ৳${quest.rewardMoney} Taka & ${quest.rewardExp} EXP!`,
    });

    // Sync updated stats to player account
    const completedQuestsCount = this.quests.filter((q) => q.status === 'completed').length;
    authManager.updateStats({
      level: this.playerStats.level,
      taka: this.playerStats.money,
      questsCompleted: completedQuestsCount,
    });

    // Asynchronously submit live score to backend leaderboard
    try {
      const user = authManager.getCurrentUser();
      const playerName = user?.displayName || localStorage.getItem('dream_player_name') || 'Explorer';
      fetch(NetworkConfig.getApiUrl('/api/leaderboard'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user?.uid,
          name: playerName,
          level: this.playerStats.level,
          taka: this.playerStats.money,
          quests: completedQuestsCount,
        }),
      }).catch(() => {});
    } catch {}

    // Auto-activate next available quest
    const nextQ = this.quests.find((q) => q.status === 'available');
    if (nextQ) {
      nextQ.status = 'active';
      this.activeQuestId = nextQ.id;
    } else {
      this.activeQuestId = null;
    }

    this.onQuestUpdated?.(quest);
  }

  public addItem(item: InventoryItem) {
    const existing = this.inventory.find((i) => i.id === item.id);
    if (existing) {
      existing.count += item.count;
    } else {
      this.inventory.push({ ...item });
    }
  }

  public removeItem(itemId: string, count = 1): boolean {
    const item = this.inventory.find((i) => i.id === itemId);
    if (!item || item.count < count) return false;
    item.count -= count;
    if (item.count <= 0) {
      this.inventory = this.inventory.filter((i) => i.id !== itemId);
    }
    return true;
  }
}
