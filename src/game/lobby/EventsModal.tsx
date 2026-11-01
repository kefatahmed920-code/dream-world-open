/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Gift, Calendar, CheckCircle2, Sparkles, Award } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface EventsModalProps {
  isOpen: boolean;
  onClaimReward: (rewardTaka: number) => void;
  onClose: () => void;
}

const DAILY_REWARDS = [
  { day: 1, title: 'Day 1 Login', reward: '৳ 500 Taka', amount: 500, icon: '💵' },
  { day: 2, title: 'Day 2 Streak', reward: '৳ 1,000 Taka', amount: 1000, icon: '💰' },
  { day: 3, title: 'Day 3 Cyber Tech', reward: 'Cyber Sunglasses', amount: 300, icon: '🕶️' },
  { day: 4, title: 'Day 4 Explorer', reward: '৳ 2,500 Taka', amount: 2500, icon: '💎' },
  { day: 5, title: 'Day 5 Master', reward: 'Dhaka Rickshaw Skin', amount: 500, icon: '🛺' },
  { day: 6, title: 'Day 6 Champion', reward: '৳ 5,000 Taka', amount: 5000, icon: '🏆' },
  { day: 7, title: 'Day 7 Legendary', reward: 'Bengal Tiger Companion', amount: 10000, icon: '🐯' },
];

export const EventsModal: React.FC<EventsModalProps> = ({
  isOpen,
  onClaimReward,
  onClose,
}) => {
  const [claimedDays, setClaimedDays] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('dream_claimed_events');
      return saved ? JSON.parse(saved) : [1];
    } catch {
      return [1];
    }
  });

  if (!isOpen) return null;

  const handleClaim = (day: number, amount: number) => {
    soundManager.playCollectCoin();
    const updated = [...claimedDays, day];
    setClaimedDays(updated);
    localStorage.setItem('dream_claimed_events', JSON.stringify(updated));
    onClaimReward(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Daily Events & Rewards <span className="text-xs text-amber-400 font-normal">দৈনিক পুরস্কার</span>
              </h2>
              <p className="text-xs text-slate-400">Season 1: Dhaka Frontier 7-Day Log-in Celebration</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DAILY_REWARDS.map((item) => {
              const isClaimed = claimedDays.includes(item.day);
              const canClaim = !isClaimed && item.day === Math.min(...DAILY_REWARDS.map(r => r.day).filter(d => !claimedDays.includes(d)));

              return (
                <div
                  key={item.day}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center justify-between transition-all ${
                    isClaimed
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : canClaim
                      ? 'bg-amber-950/40 border-amber-400 shadow-xl shadow-amber-950/40 scale-105'
                      : 'bg-slate-950/70 border-slate-800/80'
                  }`}
                >
                  <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-1">
                    Day {item.day}
                  </div>

                  <div className="text-3xl my-2">{item.icon}</div>

                  <div className="text-xs font-bold text-white mb-1">{item.title}</div>
                  <div className="text-[11px] font-bold text-emerald-400 mb-3">{item.reward}</div>

                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(item.day, item.amount)}
                      disabled={!canClaim}
                      className={`w-full py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                        canClaim
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow hover:scale-105 active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canClaim ? 'Claim' : 'Locked'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Daily rewards refresh automatically every 24 hours</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
