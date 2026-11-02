/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, PawPrint, Sparkles, Check, Radio } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { AnyLobbyPetType } from './Lobby3DCanvas';

export interface PetEntry {
  id: AnyLobbyPetType;
  name: string;
  nameBn: string;
  category: 'AERO DRONE' | 'TEDDY BEAR' | 'WILD PET';
  rarity: 'Mythic' | 'Legendary' | 'Epic';
  personality: string;
  description: string;
  descriptionBn: string;
  passiveBonus: string;
}

export const ALL_PET_COMPANIONS: PetEntry[] = [
  {
    id: 'aero_drone',
    name: 'Aero Hover Drone',
    nameBn: 'অ্যারো ড্রোন',
    category: 'AERO DRONE',
    rarity: 'Legendary',
    personality: 'Autonomous Scanner · Smooth aerial hover & LiDAR pulses',
    description: 'High-tech autonomous companion hover drone equipped with emerald scanning LiDAR, stabilizing quad thrusters, and beacon.',
    descriptionBn: 'উন্নত সেন্সর, ঘুরন্ত রটার ও সবুজ স্ক্যানার সম্পন্ন আপনার বিশ্বস্ত উড়ন্ত কম্প্যানিয়ন ড্রোন।',
    passiveBonus: '+25m Mini-map Radar Range',
  },
  {
    id: 'cyber_neon',
    name: 'Cyber Winged Teddy',
    nameBn: 'সাইবার উইংড টেডি',
    category: 'TEDDY BEAR',
    rarity: 'Mythic',
    personality: 'Futuristic & Playful · Glowing cyan wings & visor',
    description: 'Charming futuristic companion equipped with glowing cyan cyber wings, holographic visor, and lively waddling locomotion.',
    descriptionBn: 'উজ্জ্বল নিয়ন ডানা এবং সাইবার কলার যুক্ত চমৎকার বুদ্ধিমত্তাসম্পন্ন বন্ধু।',
    passiveBonus: '+20% Sprint Stamina Recovery',
  },
  {
    id: 'classic_honey',
    name: 'Classic Honey Bear',
    nameBn: 'ক্লাসিক হানি টেডি',
    category: 'TEDDY BEAR',
    rarity: 'Legendary',
    personality: 'Energetic & Cheerful · Jumps happily and greets owner',
    description: 'Beloved traditional honey-brown plush teddy bear with a crimson bow tie and warm heart.',
    descriptionBn: 'ঐতিহ্যবাহী মিষ্টি বাদামী টেডি বিয়ার, লাল বো-টাই পরা বিশ্বস্ত সঙ্গী।',
    passiveBonus: '+15% Bonus Taka from Quests',
  },
  {
    id: 'panda_bear',
    name: 'Bamboo Panda Bear',
    nameBn: 'ব্যাম্বু পান্ডা টেডি',
    category: 'TEDDY BEAR',
    rarity: 'Legendary',
    personality: 'Curious & Inquisitive · Head-tilts and looks around',
    description: 'Chubby black-and-white panda companion that loves exploring new villages and bridges.',
    descriptionBn: 'গোলগাল সাদা-কালো পান্ডা টেডি যা নতুন স্থান দেখতে ভালোবাসে।',
    passiveBonus: '+20m Discovery Radius',
  },
  {
    id: 'golden_hero',
    name: 'Royal Golden Bear',
    nameBn: 'রয়েল গোল্ডেন টেডি',
    category: 'TEDDY BEAR',
    rarity: 'Legendary',
    personality: 'Heroic & Celebratory · Red hero cape',
    description: 'Radiant golden plush teddy bear wearing a miniature hero cape and royal badge.',
    descriptionBn: 'সোনার রঙের হিরো টেডি বিয়ার, লাল হিরো কেপ পরা সাহসী যোদ্ধা।',
    passiveBonus: '+10% Speed Boost in Squad',
  },
  {
    id: 'tiger_cub',
    name: 'Bengal Tiger Cub',
    nameBn: 'রয়েল বেঙ্গল শাবক',
    category: 'WILD PET',
    rarity: 'Legendary',
    personality: 'Brave & Loyal · Courageous spirit',
    description: 'Traditional Royal Bengal Tiger cub known for bravery and loyalty.',
    descriptionBn: 'সাহসী ও বিশ্বস্ত সুন্দরবনের ঐতিহ্যবাহী রয়েল বেঙ্গল বাঘের শাবক।',
    passiveBonus: '+10% Taka Multiplier',
  },
];

interface PetSelectModalProps {
  isOpen: boolean;
  selectedPet: AnyLobbyPetType;
  onSelectPet: (pet: AnyLobbyPetType) => void;
  onClose: () => void;
}

export const PetSelectModal: React.FC<PetSelectModalProps> = ({
  isOpen,
  selectedPet,
  onSelectPet,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentConfig = ALL_PET_COMPANIONS.find((p) => p.id === selectedPet) || ALL_PET_COMPANIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                COMPANIONS & PETS <span className="text-xs text-cyan-400 font-normal">ড্রোন ও টেডি সঙ্গী</span>
              </h2>
              <p className="text-xs text-slate-400">Equip your Aero Drone or intelligent Teddy Bear companion</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Pet Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {ALL_PET_COMPANIONS.map((pet) => {
              const isSelected = selectedPet === pet.id;
              const isDrone = pet.id === 'aero_drone';

              return (
                <div
                  key={pet.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    soundManager.playPetChirp();
                    onSelectPet(pet.id);
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? isDrone
                        ? 'border-emerald-400 bg-emerald-950/30 shadow-xl shadow-emerald-500/10'
                        : 'border-cyan-400 bg-cyan-950/30 shadow-xl shadow-cyan-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isDrone ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300' : 'bg-slate-800 text-cyan-300'
                      }`}>
                        {pet.category} · {pet.rarity}
                      </span>
                      {isSelected && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${isDrone ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> EQUIPPED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-white">{pet.name}</h3>
                    <div className="text-[11px] text-slate-400 mb-1.5">{pet.nameBn}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-1.5">{pet.description}</p>
                    <div className="text-[10px] text-cyan-300/80 italic mb-2">
                      ★ {pet.personality}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-400">
                      {pet.passiveBonus}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playUiClick();
                        soundManager.playPetChirp();
                        onSelectPet(pet.id);
                      }}
                      className={`px-3 py-1 rounded-xl font-bold text-xs uppercase transition ${
                        isSelected
                          ? isDrone ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-cyan-500 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      {isSelected ? 'Active' : 'Equip'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Companion Spotlight */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Active Companion: {currentConfig.name}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{currentConfig.descriptionBn}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Both Aero Drones and Teddy Bears accompany you in the 3D lobby and open world.</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition text-xs uppercase"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
