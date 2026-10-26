/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Play, Download, Sparkles, Compass, ShieldCheck, Users, HelpCircle, Share2, Globe, Wifi } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStartGame: (mode: 'single' | 'multiplayer') => void;
  onOpenInstallModal: () => void;
  onOpenPublishGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenInstallModal,
  onOpenPublishGuide,
}) => {
  const [selectedMode, setSelectedMode] = useState<'single' | 'multiplayer'>('single');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        soundManager.resume();
        soundManager.playUiClick();
        onStartGame(selectedMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame, selectedMode]);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 md:p-10 select-none pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20 overflow-y-auto">
      {/* Top Banner / Quality Badges */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AAA 3D OPEN-WORLD · BANGLADESH</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Free Share & Publish Link Guide Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenPublishGuide();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors shadow"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>প্রকাশ ও শেয়ার গাইড</span>
          </button>

          {/* Optional Install Game Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInstallModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-emerald-950 text-emerald-300 hover:text-emerald-200 text-xs font-bold border border-emerald-500/50 transition-colors shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install Game (ইনস্টল)</span>
          </button>
        </div>
      </div>

      {/* Center: Bespoke Inline SVG Title Lockup & Subtitle */}
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto space-y-4 py-4">
        {/* Inline SVG Title Lockup */}
        <div className="w-full max-w-lg">
          <svg viewBox="0 0 500 110" className="w-full h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <text
              x="250"
              y="60"
              textAnchor="middle"
              fontFamily="Impact, system-ui, sans-serif"
              fontSize="68"
              fontWeight="900"
              letterSpacing="6"
              fill="url(#titleGrad)"
              filter="url(#glow)"
            >
              DREAM WORLD
            </text>
            <text
              x="250"
              y="98"
              textAnchor="middle"
              fontFamily="'Segoe UI', Arial, sans-serif"
              fontSize="20"
              fontWeight="700"
              letterSpacing="8"
              fill="#e2e8f0"
            >
              স্বপ্নের ভুবন · 3D ADVENTURE
            </text>
          </svg>
        </div>

        <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed drop-shadow-md">
          Explore a realistic continuous open world: modern Dhaka streets with tea stalls, the majestic Padma River bridge, Shonar village paddy fields, and the cascading Sylhet waterfall.
        </p>

        {/* Mode Selector: Single Player vs Online Multiplayer */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-700/80 shadow-lg">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setSelectedMode('single');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedMode === 'single'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>একক খেলা / অফলাইন (Single Player)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setSelectedMode('multiplayer');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedMode === 'multiplayer'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>অনলাইন মাল্টিপ্লেয়ার (Online Co-op)</span>
          </button>
        </div>

        {/* Action CTAs: PLAY NOW & INSTALL GAME */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 w-full max-w-md">
          {/* Primary PLAY NOW Button */}
          <button
            onClick={() => {
              soundManager.resume();
              soundManager.playUiClick();
              onStartGame(selectedMode);
            }}
            className="w-full sm:w-auto flex-1 group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-slate-950 text-base font-black tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-emerald-300"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY NOW (এখনই খেলুন)</span>
            <Sparkles className="w-4 h-4 text-emerald-950" />
          </button>

          {/* Optional Install Game Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInstallModal();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-sm font-bold border-2 border-slate-700 hover:border-emerald-400/70 transition-all cursor-pointer shadow-xl active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Install Game (ঐচ্ছিক)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          ইনস্টল করা সম্পূর্ণ ঐচ্ছিক · ব্রাউজারে সরাসরি অথবা ফোনে হোমস্ক্রিন অ্যাপ হিসেবে উপভোগ করুন
        </div>
      </div>

      {/* Bottom Flat Control-Hint Line */}
      <div className="text-center pt-2">
        <div className="inline-block bg-slate-950/80 border border-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-[11px] font-mono font-medium tracking-wide shadow-lg">
          WASD Move · Shift Sprint · Space Jump · E Talk · F Drive · M Map · Esc Settings
        </div>
      </div>
    </div>
  );
};
