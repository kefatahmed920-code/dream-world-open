/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameSignboardConfig } from '../world/GameSignboard';
import { X, Play, Zap, Trophy, ShieldCheck } from 'lucide-react';

interface GameSignboardModalProps {
  isOpen: boolean;
  signboard: GameSignboardConfig | null;
  onPlayNow: (gameId: string) => void;
  onClose: () => void;
}

export const GameSignboardModal: React.FC<GameSignboardModalProps> = ({
  isOpen,
  signboard,
  onPlayNow,
  onClose,
}) => {
  if (!isOpen || !signboard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-cyan-500/60 rounded-3xl shadow-2xl shadow-cyan-500/20 overflow-hidden text-white">
        {/* Glow Header */}
        <div className="relative bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 p-6 border-b border-cyan-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>{signboard.categoryBn} • {signboard.categoryEn}</span>
          </div>

          {/* Bengali Header & English Header */}
          <h2 className="text-2xl font-black text-amber-300 tracking-tight leading-snug">
            {signboard.titleBn}
          </h2>
          <p className="text-sm font-bold text-cyan-400 tracking-wide mt-0.5">
            {signboard.titleEn}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Game Title & Card */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-400 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30 shrink-0">
              🏎️
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{signboard.gameTitleBn}</h3>
              <p className="text-xs text-slate-400 font-semibold">{signboard.gameTitleEn}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-bold text-emerald-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> অফিশিয়াল মডিউল
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> লিডারবোর্ড সক্রিয়
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            {signboard.description}
          </p>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">কন্ট্রোল / Controls</span>
              <span className="text-cyan-300 font-mono font-bold mt-0.5 block">W, A, S, D / Arrows</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">টার্বো বুস্ট / Boost</span>
              <span className="text-amber-300 font-mono font-bold mt-0.5 block">Spacebar / Shift</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              বন্ধ করুন / Close
            </button>
            <button
              onClick={() => onPlayNow(signboard.gameId)}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>এখনই খেলুন / Play Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
