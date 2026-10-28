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
  Gauge,
  Navigation,
  Users,
  Download,
  User,
  Scissors,
  Trophy,
  ChevronDown,
  ChevronUp,
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
  customWaypoint?: { x: number; z: number } | null;
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
  customWaypoint,
  onOpenMap,
  onOpenInventory,
  onOpenSettings,
  onOpenMultiplayer,
  onOpenInstallModal,
  onOpenProfile,
  onOpenCharacterSelect,
  onOpenLeaderboard,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(true);
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());

  // Determine Current Region Name based on player coordinates
  let currentRegion = 'Dhanmondi Avenue';
  let currentRegionBn = 'ধানমন্ডি এভিনিউ';
  if (playerPos.x >= 50 && playerPos.x <= 125 && Math.abs(playerPos.z - 3) < 14) {
    currentRegion = 'Padma Bridge';
    currentRegionBn = 'পদ্মা সেতু';
  } else if (playerPos.x > 180 && playerPos.z < 25) {
    currentRegion = 'Sylhet Waterfall';
    currentRegionBn = 'সিলেট ঝর্ণা';
  } else if (playerPos.x >= 115 && playerPos.z >= 25) {
    currentRegion = 'Shonar Village';
    currentRegionBn = 'সোনার গ্রাম';
  }

  // Format Time (e.g. 10:30 AM)
  const hours = Math.floor(timeOfDay);
  const minutes = Math.floor((timeOfDay - hours) * 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const timeStr = `${displayHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

  // Circular Mini-map calculations (Free Fire / PUBG radar scale)
  const miniMapRadius = 52; // pixels
  const radarScale = 0.58; // pixels per world meter

  // Quest objective distance & relative radar position
  const currentObjective = activeQuest?.objectives[activeQuest.currentObjectiveIndex];
  let targetRelX = 0;
  let targetRelZ = 0;
  let targetDistM = 0;
  let targetType: 'quest' | 'waypoint' | null = null;

  if (customWaypoint) {
    const dx = customWaypoint.x - playerPos.x;
    const dz = customWaypoint.z - playerPos.z;
    targetDistM = Math.round(Math.sqrt(dx * dx + dz * dz));
    targetRelX = dx * radarScale;
    targetRelZ = dz * radarScale;
    targetType = 'waypoint';
  } else if (currentObjective) {
    const dx = currentObjective.targetPos.x - playerPos.x;
    const dz = currentObjective.targetPos.z - playerPos.z;
    targetDistM = Math.round(Math.sqrt(dx * dx + dz * dz));
    targetRelX = dx * radarScale;
    targetRelZ = dz * radarScale;
    targetType = 'quest';
  }

  // Clamp target marker within circular radar bounds
  const targetDistPix = Math.sqrt(targetRelX * targetRelX + targetRelZ * targetRelZ);
  const clampedRadius = Math.min(targetDistPix, miniMapRadius - 8);
  const markerX = targetDistPix > 0 ? (targetRelX / targetDistPix) * clampedRadius : 0;
  const markerZ = targetDistPix > 0 ? (targetRelZ / targetDistPix) * clampedRadius : 0;

  // Relative river position on radar (River center at X = 87.5, width 50)
  const riverRelX = (87.5 - playerPos.x) * radarScale;

  const toggleMute = () => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between overflow-hidden p-2 sm:p-4">
      {/* ========================================================
          TOP HEADER: REGION INFO, HEALTH BAR, CIRCULAR RADAR MINIMAP
          ======================================================== */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* --- TOP LEFT: REGION & CLOCK (Clean, Uncluttered) --- */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="bg-slate-950/75 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                {currentRegion}
              </div>
              <div className="text-[10px] text-slate-300 font-medium">
                {currentRegionBn} · <span className="tabular-nums text-amber-300 font-semibold">{timeStr}</span>
              </div>
            </div>
            <div className="ml-1.5 pl-2 border-l border-slate-800 text-[9px] text-slate-400 tabular-nums">
              {fps} FPS
            </div>
          </div>

          {/* Quick Active Quest Pill */}
          {activeQuest && currentObjective && (
            <div
              onClick={onOpenMap}
              className="bg-slate-950/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg border border-amber-500/40 shadow flex items-center gap-2 max-w-[200px] sm:max-w-[240px] cursor-pointer hover:border-amber-400 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <div className="text-[10px] font-medium text-slate-200 truncate flex-1">
                {currentObjective.text}
              </div>
              <div className="text-[9px] font-mono font-bold text-amber-400 tabular-nums shrink-0">
                {targetDistM}m
              </div>
            </div>
          )}
        </div>

        {/* --- TOP MIDDLE: COMPACT PUBG/FREE FIRE HEALTH & STAMINA BAR --- */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="bg-slate-950/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-2xl flex flex-col gap-1 w-48 sm:w-56">
            {/* Health Bar (Red/White gradient with real health numbers) */}
            <div className="flex items-center justify-between text-[10px] leading-none">
              <span className="font-extrabold text-rose-400 tracking-wider">HP</span>
              <span className="tabular-nums font-mono text-[10px] font-bold text-slate-200">
                {Math.round(stats.health)}/{stats.maxHealth}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700/40 p-0.5">
              <div
                className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-200 shadow-xs"
                style={{ width: `${Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100))}%` }}
              />
            </div>

            {/* Stamina Bar (Emerald energy bar) */}
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, stats.stamina))}%` }}
              />
            </div>

            {/* Micro Currency & Level */}
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-300 pt-0.5">
              <span className="text-amber-400 tabular-nums font-bold">৳ {stats.money}</span>
              <span className="text-sky-300">LVL {stats.level}</span>
            </div>
          </div>
        </div>

        {/* --- TOP RIGHT: CIRCULAR RADAR MINIMAP & SETTINGS BUTTON --- */}
        <div className="flex items-start gap-2 pointer-events-auto">
          {/* Pause / Settings Button (Separate from minimap, easily tapped) */}
          <button
            onClick={onOpenSettings}
            title="Open Settings & Audio (Esc)"
            className="w-10 h-10 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/70 shadow-xl flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>

          {/* Circular GPS Radar Minimap */}
          <div
            onClick={onOpenMap}
            title="Tap to open Full Map (M)"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-950/90 border-2 border-slate-600/80 shadow-2xl relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center backdrop-blur-xs"
          >
            {/* Concentric radar range rings */}
            <div className="absolute inset-2 rounded-full border border-slate-700/40" />
            <div className="absolute inset-6 rounded-full border border-slate-700/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-slate-700/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-slate-700/30" />
            </div>

            {/* River Padma ribbon on radar */}
            {Math.abs(riverRelX) < miniMapRadius + 20 && (
              <div
                className="absolute top-0 bottom-0 w-7 bg-sky-500/25 border-x border-sky-400/40 pointer-events-none"
                style={{
                  left: `calc(50% + ${riverRelX}px - 14px)`,
                }}
              />
            )}

            {/* Compass North Needle */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-rose-400 flex items-center gap-0.5 tracking-tighter">
              N
            </div>

            {/* Center Player Direction Arrow */}
            <div
              className="absolute z-20 w-4 h-4 flex items-center justify-center"
              style={{ transform: `rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            >
              <Navigation className="w-4 h-4 text-emerald-400 fill-emerald-400 filter drop-shadow" />
            </div>

            {/* Objective / Waypoint Marker */}
            {targetType && (
              <div
                className="absolute z-30 w-3 h-3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${markerX}px)`,
                  top: `calc(50% + ${markerZ}px)`,
                }}
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full border border-slate-950 shadow-md ${
                    targetType === 'waypoint'
                      ? 'bg-sky-400 animate-ping'
                      : 'bg-amber-400 animate-bounce'
                  }`}
                />
              </div>
            )}

            {/* Tap indicator label */}
            <div className="absolute bottom-1 text-[7px] font-extrabold text-slate-400 tracking-wider">
              MAP
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          CENTER SCREEN: SPEEDOMETER & PROXIMITY INTERACTION CUE
          ======================================================== */}
      <div className="flex flex-col items-center justify-center pointer-events-none mb-14">
        {/* Proximity Interaction Banner (when looking at NPC/car) */}
        {interactionPrompt && (
          <div className="bg-slate-950/90 text-white px-4 py-2 rounded-2xl border-2 border-emerald-400 shadow-2xl flex items-center gap-2 text-xs font-bold tracking-wide animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {interactionPrompt}
          </div>
        )}

        {/* Speedometer when Driving Vehicle */}
        {activeVehicle && (
          <div className="bg-slate-950/90 border border-slate-700/80 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3.5 mt-2 pointer-events-auto">
            <div className="p-1.5 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {activeVehicle.config.nameBn}
              </div>
              <div className="text-xl font-black font-mono text-emerald-400 tabular-nums">
                {Math.round(Math.abs(activeVehicle.velocity) * 3.6)}{' '}
                <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          BOTTOM CENTER: MINIMAL DISCREET MENU DOCK
          ======================================================== */}
      <div className="flex flex-col items-center pointer-events-auto mb-2 px-2 w-full">
        {/* Expand / Collapse Toggle Bar */}
        <button
          onClick={() => setIsDockCollapsed((prev) => !prev)}
          className="bg-slate-950/80 hover:bg-slate-900 border border-slate-700/60 text-slate-400 hover:text-slate-200 px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Menu
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" /> Hide Menu
            </>
          )}
        </button>

        {/* Collapsible Utility Items */}
        {!isDockCollapsed && (
          <div className="mt-2 bg-slate-950/90 border border-slate-700/80 rounded-2xl p-2 shadow-2xl flex items-center gap-1.5 flex-wrap justify-center animate-fade-in backdrop-blur-xs">
            <button
              onClick={onOpenInventory}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" /> Backpack (I)
            </button>
            <button
              onClick={onOpenMultiplayer}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" /> Co-Op Room
            </button>
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
              </button>
            )}
            {onOpenCharacterSelect && (
              <button
                onClick={onOpenCharacterSelect}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Scissors className="w-3.5 h-3.5 text-sky-400" /> Character
              </button>
            )}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" /> Profile
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-emerald-600/40"
            >
              <Download className="w-3.5 h-3.5" /> Install
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
