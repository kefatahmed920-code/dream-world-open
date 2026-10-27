/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Compass,
  Map as MapIcon,
  Package,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Eye,
  ChevronDown,
  ChevronUp,
  Gauge,
  Navigation,
  Users,
  Download,
  User,
  Scissors,
  Trophy,
} from 'lucide-react';
import { PlayerStats, Quest } from '../types';
import { ActiveVehicle } from '../vehicles/vehicleManager';
import { soundManager } from '../audio/soundManager';

interface HUDProps {
  stats: PlayerStats;
  activeQuest: Quest | null;
  activeVehicle: ActiveVehicle | null;
  interactionPrompt: string | null;
  timeOfDay: number;
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  fps: number;
  onOpenMap: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onOpenMultiplayer: () => void;
  onOpenInstallModal: () => void;
  onOpenProfile?: () => void;
  onOpenCharacterSelect?: () => void;
  onOpenLeaderboard?: () => void;
  onTeleportToQuest?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  activeQuest,
  activeVehicle,
  interactionPrompt,
  timeOfDay,
  playerPos,
  playerYaw,
  fps,
  onOpenMap,
  onOpenInventory,
  onOpenSettings,
  onOpenMultiplayer,
  onOpenInstallModal,
  onOpenProfile,
  onOpenCharacterSelect,
  onOpenLeaderboard,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  // Determine Current Region Name based on player coordinates
  let currentRegion = 'Dhanmondi City Avenue';
  let currentRegionBn = 'ধানমন্ডি সিটি এভিনিউ';
  if (playerPos.x >= 50 && playerPos.x <= 125 && Math.abs(playerPos.z - 3) < 14) {
    currentRegion = 'Grand Padma Bridge';
    currentRegionBn = 'পদ্মা সেতু এক্সপ্রেসওয়ে';
  } else if (playerPos.x > 180 && playerPos.z < 25) {
    currentRegion = 'Sylhet Mountain & Waterfall';
    currentRegionBn = 'সিলেট পাহাড় ও ঝর্ণা ধারা';
  } else if (playerPos.x >= 115 && playerPos.z >= 25) {
    currentRegion = 'Shonar Village & Green Fields';
    currentRegionBn = 'সোনার গ্রাম ও সবুজ প্রান্তর';
  }

  // Format Time (e.g. 10:30 AM)
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

  // Mini-map calculations
  const miniMapSize = 120;
  const miniMapScale = 0.55; // pixels per world meter

  // Quest Marker in Mini-Map
  const currentObjective = activeQuest?.objectives[activeQuest.currentObjectiveIndex];
  let questRelX = 0;
  let questRelZ = 0;
  let questDistMeters = 0;
  if (currentObjective) {
    const dx = currentObjective.targetPos.x - playerPos.x;
    const dz = currentObjective.targetPos.z - playerPos.z;
    questDistMeters = Math.round(Math.sqrt(dx * dx + dz * dz));
    questRelX = dx * miniMapScale;
    questRelZ = dz * miniMapScale;
  }

  const toggleMute = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between overflow-hidden">
      {/* --- TOP BAR: REGION INFO & GPS MINI-MAP --- */}
      <div className="flex justify-between items-start p-4 md:p-6 w-full">
        {/* Top Left: Title, Location & Player Status */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* World Badge */}
          <div className="bg-slate-900/90 text-white px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div>
              <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                {currentRegion}
              </div>
              <div className="text-[11px] text-slate-300 font-medium">
                {currentRegionBn} · <span className="tabular-nums text-amber-300 font-semibold">{timeStr}</span>
              </div>
            </div>
            <div className="ml-2 pl-2 border-l border-slate-700 text-[10px] text-slate-400 tabular-nums">
              {fps} FPS
            </div>
          </div>

          {/* Vitals Cluster: Health, Stamina, Taka */}
          <div className="bg-slate-900/85 px-3.5 py-2.5 rounded-xl border border-slate-700/50 shadow-md flex flex-col gap-1.5 w-60">
            {/* Health Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold text-rose-400">HEALTH</span>
              <span className="tabular-nums font-mono text-slate-200">{stats.health}/{stats.maxHealth}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}
              />
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400">STAMINA</span>
              <span className="tabular-nums font-mono text-slate-200">{Math.round(stats.stamina)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.stamina}%` }}
              />
            </div>

            {/* Currency & Level */}
            <div className="pt-1 mt-1 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-amber-400 font-bold tabular-nums flex items-center gap-1">
                <span className="text-amber-500 text-sm">৳</span> {stats.money.toLocaleString()}
              </span>
              <span className="text-sky-300 text-[11px] font-semibold bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/40">
                LVL {stats.level}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: GPS Mini-Map & Active Quest Pin */}
        <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
          {/* Circular GPS Radar */}
          <div
            onClick={onOpenMap}
            title="Click to open Full World Map (M)"
            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 shadow-2xl relative overflow-hidden cursor-pointer hover:border-emerald-500/80 transition-colors"
          >
            {/* Grid concentric rings */}
            <div className="absolute inset-2 rounded-xl border border-slate-700/40" />
            <div className="absolute inset-7 rounded-lg border border-slate-700/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-slate-700/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-slate-700/30" />
            </div>

            {/* Compass North Needle */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-400 flex items-center gap-0.5">
              <Compass className="w-2.5 h-2.5 text-rose-400" /> N
            </div>

            {/* Quest Waypoint on Mini-map */}
            {currentObjective && (
              <div
                className="absolute w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `${Math.max(12, Math.min(miniMapSize - 12, miniMapSize / 2 + questRelX))}px`,
                  top: `${Math.max(12, Math.min(miniMapSize - 12, miniMapSize / 2 + questRelZ))}px`,
                }}
              >
                <div className="w-3 h-3 bg-amber-400 border border-slate-900 rounded-full shadow-sm animate-bounce" />
              </div>
            )}

            {/* Center Player Direction Arrow */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center"
              style={{ transform: `translate(-50%, -50%) rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            >
              <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400 filter drop-shadow" />
            </div>

            {/* Mini map tap label */}
            <div className="absolute bottom-1 right-2 text-[8px] font-bold text-slate-400">
              TAP MAP
            </div>
          </div>

          {/* Active Quest Objective Box */}
          {activeQuest && currentObjective && (
            <div
              onClick={onOpenMap}
              className="bg-slate-900/90 text-white p-3 rounded-xl border border-amber-500/40 shadow-lg max-w-[240px] md:max-w-[280px] cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> ACTIVE QUEST
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-semibold tabular-nums">
                  {questDistMeters}m
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-100 line-clamp-1">{activeQuest.title}</div>
              <div className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                ▸ {currentObjective.text}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CENTER SCREEN: CONTEXT INTERACTION PROMPT --- */}
      <div className="flex flex-col items-center justify-center pointer-events-none mb-12">
        {interactionPrompt && (
          <div className="bg-slate-950/90 text-white px-5 py-2.5 rounded-2xl border-2 border-emerald-400 shadow-2xl flex items-center gap-2.5 text-sm font-bold tracking-wide animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            {interactionPrompt}
          </div>
        )}

        {/* Speedometer when Driving Vehicle */}
        {activeVehicle && (
          <div className="bg-slate-950/90 border border-slate-700/80 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 mt-3 pointer-events-auto">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-400">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">
                {activeVehicle.config.nameBn}
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
                {Math.round(Math.abs(activeVehicle.velocity) * 3.6)}{' '}
                <span className="text-xs font-normal text-slate-400">km/h</span>
              </div>
            </div>
            <div className="pl-4 border-l border-slate-800 text-[11px] text-slate-400 font-medium">
              [W] Gas · [S] Reverse<br />[Space] Handbrake · [F] Exit
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM CENTER: UNIFIED COLLAPSIBLE CONTROL DOCK --- */}
      {/* Per Three.js guidelines: zero viewport occlusion, consolidated bottom center dock */}
      <div className="flex flex-col items-center pointer-events-auto mb-4 px-4 w-full">
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-1 rounded-t-xl border-t border-x border-slate-700/70 text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
          title="Toggle HUD view (H)"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Show Controls
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Zen / Cinema Mode
            </>
          )}
        </button>

        {/* Main Dock Container */}
        {!isDockCollapsed && (
          <div className="bg-slate-950/90 border border-slate-700/70 rounded-2xl p-2 md:p-2.5 shadow-2xl flex items-center gap-2 max-w-full overflow-x-auto">
            {/* World Map Button */}
            <button
              onClick={onOpenMap}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
              title="Open Interactive Map (M)"
            >
              <MapIcon className="w-4 h-4 text-emerald-400" />
              <span>Map (M)</span>
            </button>

            {/* Inventory Bag Button */}
            <button
              onClick={onOpenInventory}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
              title="Open Inventory (I)"
            >
              <Package className="w-4 h-4 text-sky-400" />
              <span>Bag</span>
            </button>

            {/* Profile Button */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
                title="Player Profile & Permanent UID"
              >
                <User className="w-4 h-4 text-cyan-400" />
                <span>ID</span>
              </button>
            )}

            {/* Character Customizer Button */}
            {onOpenCharacterSelect && (
              <button
                onClick={onOpenCharacterSelect}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
                title="Customize Character & Outfit"
              >
                <Scissors className="w-4 h-4 text-pink-400" />
                <span>Avatar</span>
              </button>
            )}

            {/* Leaderboard Button */}
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
                title="Global Leaderboard"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Ranks</span>
              </button>
            )}

            {/* Multiplayer Button */}
            <button
              onClick={onOpenMultiplayer}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
              title="Online Multiplayer (মাল্টিপ্লেয়ার)"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Co-op</span>
            </button>

            {/* Install Game Button */}
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
              title="Install Game (ইনস্টল)"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Install</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600/40 transition-colors"
              title="Settings (Esc)"
            >
              <SettingsIcon className="w-4 h-4 text-amber-400" />
              <span>Settings</span>
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border transition-colors ${
                isMuted
                  ? 'bg-rose-950/80 border-rose-800/60 text-rose-300'
                  : 'bg-slate-800/80 border-slate-600/40 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Controls hint text */}
            <div className="hidden lg:flex items-center text-[11px] text-slate-400 px-3 pl-4 border-l border-slate-800 font-medium">
              WASD Move · Shift Sprint · Space Jump · E Interact · F Drive
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
