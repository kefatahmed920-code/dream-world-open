/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Compass,
  Crosshair,
  Flame,
  Boxes,
  Users,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export type GameModeId = 'open_world' | 'battle_royale' | 'racing' | 'sandbox';
export type TeamMode = 'solo' | 'duo' | 'squad';

export interface GameModeInfo {
  id: GameModeId;
  title: string;
  titleBn: string;
  tagline: string;
  status: 'active' | 'coming_soon';
  badgeColor: string;
  playersText: string;
  features: string[];
}

export const GAME_MODES: GameModeInfo[] = [
  {
    id: 'open_world',
    title: 'MAP 02: Bangladesh Open World',
    titleBn: 'ম্যাপ ০২: বাংলাদেশ ওপেন ওয়ার্ল্ড',
    tagline: 'Dhaka Mega-City, Padma Bridge & Scenic Rebuilt Riverbank',
    status: 'active',
    badgeColor: 'bg-emerald-500 text-slate-950',
    playersText: '1 - 50 Players (Dhaka Hub)',
    features: ['Dhaka City & Padma Bridge', 'Cyber Tesla Garage & Vehicles', 'Scenic Rebuilt Riverbank', '50-Player Multiplayer Adventure'],
  },
  {
    id: 'battle_royale',
    title: 'MAP 01: Battle Royale Game (Kaifeng)',
    titleBn: 'ম্যাপ ০১: ব্যাটেল রয়্যাল গেম (কাইফেং)',
    tagline: '50-Player Historical Chinese Citadel Arena (Prepared, Disabled Pending Authorization)',
    status: 'coming_soon',
    badgeColor: 'bg-amber-500 text-slate-950',
    playersText: '50 Players (Prepared / Disabled)',
    features: ['Kaifeng 8 Historical Districts', 'Great Wall Fortress & Karst Peaks', 'Shrinking Blue Storm & Safe Zones', 'Prepared for 50 Players (Disabled)'],
  },
  {
    id: 'racing',
    title: 'Cyber Highway Racing',
    titleBn: 'সাইবার হাইওয়ে রেসিং',
    tagline: 'High-Speed Hypercar & Superbike Speed Trials along Expressway',
    status: 'coming_soon',
    badgeColor: 'bg-sky-500 text-slate-950',
    playersText: '8 Players Drag & Circuit',
    features: ['Dhaka Elevated Expressway', 'Nitro Boost & Drift Physics', 'Tesla Cyber & Custom Superbikes', 'Real-Time Speed Leaderboard'],
  },
  {
    id: 'sandbox',
    title: 'Dream World Sandbox',
    titleBn: 'ড্রিম ওয়ার্ল্ড স্যান্ডবক্স',
    tagline: 'Infinite Creative Building, Landscaping & Custom Architecture',
    status: 'coming_soon',
    badgeColor: 'bg-purple-500 text-white',
    playersText: 'Co-Op Creative',
    features: ['Voxel & Structure Placement', 'Community World Sharing', 'Custom Terrain Sculpting', 'Collaborative Building'],
  },
];

interface ModeSelectModalProps {
  isOpen: boolean;
  selectedMode: GameModeId;
  teamMode: TeamMode;
  onSelectMode: (mode: GameModeId) => void;
  onSelectTeamMode: (team: TeamMode) => void;
  onClose: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  selectedMode,
  teamMode,
  onSelectMode,
  onSelectTeamMode,
  onClose,
}) => {
  if (!isOpen) return null;

  const handlePickMode = (mode: GameModeInfo) => {
    soundManager.playUiClick();
    if (mode.status === 'active') {
      onSelectMode(mode.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Select Game Mode <span className="text-xs text-emerald-400 font-normal">গেম মোড নির্বাচন</span>
              </h2>
              <p className="text-xs text-slate-400">Choose your destination in the Dream World universe</p>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Team Mode Selector (Solo / Duo / Squad) */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Matchmaking Party:</span>
            </div>

            <div className="flex items-center gap-2">
              {(['solo', 'duo', 'squad'] as TeamMode[]).map((tm) => (
                <button
                  key={tm}
                  onClick={() => {
                    soundManager.playUiClick();
                    onSelectTeamMode(tm);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    teamMode === tm
                      ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tm === 'solo' ? 'SOLO (১ জন)' : tm === 'duo' ? 'DUO (২ জন)' : 'SQUAD (দল)'}
                </button>
              ))}
            </div>
          </div>

          {/* Game Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GAME_MODES.map((mode) => {
              const isSelected = selectedMode === mode.id;
              const isActive = mode.status === 'active';

              return (
                <div
                  key={mode.id}
                  onClick={() => handlePickMode(mode)}
                  className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-400 shadow-xl shadow-emerald-950/50 scale-[1.01]'
                      : isActive
                      ? 'bg-slate-950/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                      : 'bg-slate-950/50 border-slate-800/80 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${mode.badgeColor}`}>
                      {isActive ? 'READY TO PLAY' : 'COMING SOON'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{mode.playersText}</span>
                  </div>

                  {/* Mode Title */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2">
                      {mode.id === 'open_world' && <Compass className="w-5 h-5 text-emerald-400" />}
                      {mode.id === 'battle_royale' && <Crosshair className="w-5 h-5 text-amber-400" />}
                      {mode.id === 'racing' && <Flame className="w-5 h-5 text-sky-400" />}
                      {mode.id === 'sandbox' && <Boxes className="w-5 h-5 text-purple-400" />}
                      <h3 className="text-base font-black text-white">{mode.title}</h3>
                    </div>
                    <div className="text-xs font-semibold text-emerald-300">{mode.titleBn}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{mode.tagline}</p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    {mode.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Selection Indicator */}
                  <div className="mt-4 pt-3 flex items-center justify-between border-t border-slate-800">
                    {isActive ? (
                      <div className="flex items-center gap-2 text-xs font-bold">
                        {isSelected ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Selected Mode (বাছাইকৃত)
                          </span>
                        ) : (
                          <span className="text-slate-400 hover:text-white">Click to Select</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                        <Lock className="w-3.5 h-3.5" /> Under Development in Future Phase
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Currently Active: Bangladesh Open World (Dhaka & Countryside)</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition"
          >
            Confirm & Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};
