/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameCategory =
  | 'Racing'
  | 'Battle Royale'
  | 'Adventure'
  | 'Survival'
  | 'Horror'
  | 'Puzzle'
  | 'Sports'
  | 'Simulation';

export type GameDoorStatus = 'available' | 'coming_soon' | 'loading' | 'maintenance';

export interface GameDoorMetadata {
  id: string;
  doorNumber: number;
  floor: number;
  title: string;
  titleBn: string;
  category: GameCategory;
  categoryBn: string;
  description: string;
  status: GameDoorStatus;
  accentColor: number; // Hex color for magical runes and frame
  themeHex: string;
  relativeDoorPos: { x: number; y: number; z: number; rotY: number };
}

/**
 * 12 Magical Game Doors across Floor 1 (Grand Atrium) and Floor 2 (Esports Mezzanine)
 */
export const GAME_DOORS_REGISTRY: GameDoorMetadata[] = [
  // --- FLOOR 1: GROUND ATRIUM (Doors 1 to 6) ---
  {
    id: 'game_cyber_tesla',
    doorNumber: 1,
    floor: 1,
    title: 'Cyber EV Highway Challenge',
    titleBn: 'সাইবার ইভি হাইওয়ে চ্যালেঞ্জ',
    category: 'Racing',
    categoryBn: 'রেসিং',
    description: 'High-speed futuristic electric highway driving and traffic skitching challenge.',
    status: 'available',
    accentColor: 0x06b6d4, // Cyan
    themeHex: '#06b6d4',
    relativeDoorPos: { x: -8, y: 0.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_dhaka_royale',
    doorNumber: 2,
    floor: 1,
    title: 'Dhaka Battle Royale',
    titleBn: 'ঢাকা ব্যাটল রয়্যাল',
    category: 'Battle Royale',
    categoryBn: 'ব্যাটল রয়্যাল',
    description: 'Intense tactical open-field survival arena across the rooftops of Old Dhaka.',
    status: 'coming_soon',
    accentColor: 0xf59e0b, // Amber
    themeHex: '#f59e0b',
    relativeDoorPos: { x: 0, y: 0.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_sundarbans_adventure',
    doorNumber: 3,
    floor: 1,
    title: 'Sundarbans Tiger Mystery',
    titleBn: 'সুন্দরবন রহস্য অভিযান',
    category: 'Adventure',
    categoryBn: 'অ্যাডভেঞ্চার',
    description: 'Journey deep into the mystical mangrove forest solving ancient ruins.',
    status: 'coming_soon',
    accentColor: 0x10b981, // Emerald
    themeHex: '#10b981',
    relativeDoorPos: { x: 8, y: 0.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_padma_survival',
    doorNumber: 4,
    floor: 1,
    title: 'Padma River Surge Survival',
    titleBn: 'পদ্মার প্লাবন সারভাইভাল',
    category: 'Survival',
    categoryBn: 'সারভাইভাল',
    description: 'Brave monsoon rapids and stormy tides in custom river rescue boats.',
    status: 'coming_soon',
    accentColor: 0x3b82f6, // Blue
    themeHex: '#3b82f6',
    relativeDoorPos: { x: 10, y: 0.1, z: -4, rotY: -Math.PI / 2 },
  },
  {
    id: 'game_lalbagh_horror',
    doorNumber: 5,
    floor: 1,
    title: 'Shadows of Lalbagh Fort',
    titleBn: 'লালবাগ কেল্লার রহস্য ছায়া',
    category: 'Horror',
    categoryBn: 'হরর',
    description: 'Explore subterranean Mughal passageways shrouded in spectral mystery.',
    status: 'coming_soon',
    accentColor: 0x8b5cf6, // Purple
    themeHex: '#8b5cf6',
    relativeDoorPos: { x: 10, y: 0.1, z: 4, rotY: -Math.PI / 2 },
  },
  {
    id: 'game_chittagong_express',
    doorNumber: 6,
    floor: 1,
    title: 'Chittagong High-Speed Express',
    titleBn: 'চট্টগ্রাম হাই-স্পিড এক্সপ্রেস',
    category: 'Racing',
    categoryBn: 'রেসিং',
    description: 'Mountain pass hill-climb and coastal drift trials along the Bay of Bengal.',
    status: 'coming_soon',
    accentColor: 0xec4899, // Pink
    themeHex: '#ec4899',
    relativeDoorPos: { x: -10, y: 0.1, z: -4, rotY: Math.PI / 2 },
  },

  // --- FLOOR 2: ESPORTS & ARCADE MEZZANINE (Doors 7 to 12) ---
  {
    id: 'game_metro_puzzle',
    doorNumber: 7,
    floor: 2,
    title: 'Dhaka Metro Rail Gridlock',
    titleBn: 'মেট্রোরেল গ্রিডলক পাজল',
    category: 'Puzzle',
    categoryBn: 'ধাঁধা ও লজিক',
    description: 'Dispatch high-speed electric trains avoiding signal deadlocks.',
    status: 'coming_soon',
    accentColor: 0x14b8a6, // Teal
    themeHex: '#14b8a6',
    relativeDoorPos: { x: -8, y: 8.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_bengal_cricket',
    doorNumber: 8,
    floor: 2,
    title: 'Mirpur Stadium Cricket Clash',
    titleBn: 'মিরপুর স্টেডিয়াম ক্রিকেট ক্ল্যাশ',
    category: 'Sports',
    categoryBn: 'খেলাধুলা',
    description: 'Step up to the crease and smash massive sixes under stadium floodlights.',
    status: 'coming_soon',
    accentColor: 0x22c55e, // Green
    themeHex: '#22c55e',
    relativeDoorPos: { x: 0, y: 8.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_cng_sim',
    doorNumber: 9,
    floor: 2,
    title: 'Rickshaw & CNG City Rush',
    titleBn: 'রিকশা ও সিএনজি সিটি রাশ',
    category: 'Simulation',
    categoryBn: 'সিমুলেশন',
    description: 'Master the bustling streets of Dhaka navigating alleys and bustling bazaars.',
    status: 'coming_soon',
    accentColor: 0xf97316, // Orange
    themeHex: '#f97316',
    relativeDoorPos: { x: 8, y: 8.1, z: -10, rotY: 0 },
  },
  {
    id: 'game_bandarban_climb',
    doorNumber: 10,
    floor: 2,
    title: 'Nilgiri Peak Extreme Climber',
    titleBn: 'নীলগিরি পিক ক্লাইম্বার',
    category: 'Adventure',
    categoryBn: 'অ্যাডভেঞ্চার',
    description: 'Scale misty mountain ridges and zip-line through cloud-covered peaks.',
    status: 'coming_soon',
    accentColor: 0x6366f1, // Indigo
    themeHex: '#6366f1',
    relativeDoorPos: { x: 10, y: 8.1, z: -4, rotY: -Math.PI / 2 },
  },
  {
    id: 'game_bengal_haunt_2',
    doorNumber: 11,
    floor: 2,
    title: 'Ahsan Manzil Midnight Haunt',
    titleBn: 'আহসান মঞ্জিল মিডনাইট হরর',
    category: 'Horror',
    categoryBn: 'হরর',
    description: 'Paranormal investigation inside the historic Pink Palace on the Buriganga.',
    status: 'coming_soon',
    accentColor: 0xa855f7, // Purple
    themeHex: '#a855f7',
    relativeDoorPos: { x: 10, y: 8.1, z: 4, rotY: -Math.PI / 2 },
  },
  {
    id: 'game_cox_jetski',
    doorNumber: 12,
    floor: 2,
    title: 'Cox Bazar Jet Ski Grand Prix',
    titleBn: 'কক্সবাজার ওয়াটার গ্র্যান্ড প্রিক্স',
    category: 'Sports',
    categoryBn: 'খেলাধুলা',
    description: 'High-speed ocean waves jet-ski racing along the world’s longest sandy beach.',
    status: 'coming_soon',
    accentColor: 0x0284c7, // Sky Blue
    themeHex: '#0284c7',
    relativeDoorPos: { x: -10, y: 8.1, z: -4, rotY: Math.PI / 2 },
  },
];
