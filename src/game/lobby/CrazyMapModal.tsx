/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, Lock, Sparkles, Flame, Shield, Zap, Trophy, Car } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface CrazyMapCard {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  status: 'AVAILABLE' | 'UPCOMING';
  players: string;
  bannerGradient: string;
  icon: 'car' | 'battle' | 'parkour' | 'soccer' | 'gravity';
  description: string;
  descriptionBn: string;
}

export const CRAZY_MAPS: CrazyMapCard[] = [
  {
    id: 'battle_royale',
    title: 'BATTLE ROYALE ARENA',
    titleBn: 'ব্যাটল রয়্যাল এরিনা',
    category: 'PVP SURVIVAL',
    status: 'UPCOMING',
    players: '50 Players',
    bannerGradient: 'from-amber-600 via-orange-500 to-rose-600',
    icon: 'battle',
    description: 'High-octane 50-player survival tournament across an expanded island zone with supply airdrops.',
    descriptionBn: '৫০ জন খেলোয়াড়ের সারভাইভাল যুদ্ধ, বিমান থেকে এয়ারড্রপ ও উত্তেজনাপূর্ণ প্রতিযোগিতা।',
  },
  {
    id: 'cyber_tesla_highway',
    title: 'CYBER EV HIGHWAY CHALLENGE',
    titleBn: 'সাইবার ইভি হাইওয়ে চ্যালেঞ্জ',
    category: 'TIME-ATTACK RACING',
    status: 'AVAILABLE',
    players: 'Single & Multiplayer',
    bannerGradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    icon: 'car',
    description: 'Autonomous high-speed electric hypercar dodge challenge through expressway traffic.',
    descriptionBn: 'এক্সপ্রেসওয়ে ট্রাফিকের মধ্য দিয়ে দ্রুতগতির সাইবার হাইপারকার ডজ ও স্পিড চ্যালেঞ্জ।',
  },
  {
    id: 'sky_parkour_arena',
    title: 'SKY PARKOUR TOWER',
    titleBn: 'স্কাই পার্কুর টাওয়ার',
    category: 'OBSTACLE RUN',
    status: 'UPCOMING',
    players: '1-16 Players',
    bannerGradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    icon: 'parkour',
    description: 'Floating neon obstacle course suspended in the clouds with bouncing pads and moving beams.',
    descriptionBn: 'আকাশের মেঘে ভাসমান চ্যালেঞ্জিং জাম্পিং এবং বাউন্সিং প্ল্যাটফর্ম পার্কুর রান।',
  },
  {
    id: 'soccer_showdown',
    title: 'STADIUM SOCCER DERBY',
    titleBn: 'স্টেডিয়াম সকার ডার্বি',
    category: 'SPORTS SHOWDOWN',
    status: 'UPCOMING',
    players: '4v4 Squad Match',
    bannerGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    icon: 'soccer',
    description: 'Team sports derby with oversized physics football, turbo boosts, and stadium goals.',
    descriptionBn: 'স্টেডিয়ামে জায়ান্ট বল ও টার্বো বুস্ট দিয়ে ৪ বনাম ৪ সকার গোল প্রতিযোগিতা।',
  },
  {
    id: 'gravity_sphere_run',
    title: 'GRAVITY SPHERE RUN',
    titleBn: 'গ্র্যাভিটি স্ফিয়ার রান',
    category: 'MINI GAME',
    status: 'UPCOMING',
    players: '1-8 Players',
    bannerGradient: 'from-blue-600 via-indigo-600 to-violet-800',
    icon: 'gravity',
    description: 'Roll inside futuristic kinetic spheres across curving neon tube tracks at Mach speed.',
    descriptionBn: 'গতিশীল নিয়ন টিউবের মধ্য দিয়ে কাইনেটিক স্ফিয়ারে ভর করে রোলার কোস্টার গতিতে দৌড়।',
  },
];

interface CrazyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchCyberTesla: () => void;
}

export const CrazyMapModal: React.FC<CrazyMapModalProps> = ({
  isOpen,
  onClose,
  onLaunchCyberTesla,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Flame className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wider uppercase text-white">
                  CRAZY MAPS <span className="text-amber-400 font-semibold text-xs">ক্রেজী ম্যাপস</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Featured Arcade
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Action-packed community arcade maps, high-speed challenges, and upcoming tournaments
              </p>
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

        {/* Maps Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRAZY_MAPS.map((map, index) => {
              const isAvailable = map.status === 'AVAILABLE';

              return (
                <div
                  key={map.id}
                  className={`group relative rounded-2xl border-2 overflow-hidden transition-all flex flex-col justify-between ${
                    isAvailable
                      ? 'border-cyan-500/70 bg-gradient-to-b from-slate-900 to-cyan-950/30 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/20'
                      : 'border-slate-800 bg-slate-900/60 opacity-80'
                  }`}
                >
                  {/* Card Banner */}
                  <div className={`h-24 bg-gradient-to-r ${map.bannerGradient} p-4 flex items-start justify-between relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-sm border border-white/20">
                        Card #{index + 1} · {map.category}
                      </span>
                      <h3 className="text-base font-black text-white mt-1 drop-shadow-md">
                        {map.title}
                      </h3>
                      <div className="text-[11px] font-semibold text-white/90 drop-shadow">
                        {map.titleBn}
                      </div>
                    </div>

                    <div className="relative z-10">
                      {isAvailable ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AVAILABLE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> UPCOMING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-1">
                        {map.description}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {map.descriptionBn}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        Capacity: <strong className="text-white">{map.players}</strong>
                      </span>

                      {isAvailable ? (
                        <button
                          onClick={() => {
                            soundManager.playUiClick();
                            onClose();
                            onLaunchCyberTesla();
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/30 active:scale-95 transition"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> PLAY NOW (খেলুন)
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1 cursor-not-allowed border border-slate-700/50"
                        >
                          <Lock className="w-3.5 h-3.5" /> LOCKED
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Card 2 is linked to the existing Cyber EV highway challenge in Dream World.</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
