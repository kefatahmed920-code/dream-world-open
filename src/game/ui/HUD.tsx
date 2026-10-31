/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  BarChart2,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Navigation,
  Gauge,
  Trophy,
  Home,
  Smartphone,
} from 'lucide-react';
import { PlayerStats } from '../types';
import { ActiveVehicle } from '../vehicles/vehicleManager';

interface HUDProps {
  stats: PlayerStats;
  activeVehicle: ActiveVehicle | null;
  interactionPrompt: string | null;
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  onlineCount: number;
  isVoiceActive: boolean;
  isMicMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  unreadChatCount?: number;
  customWaypoint?: { x: number; z: number } | null;
  autoplayBlocked?: boolean;
  fps?: number;
  frameTime?: number;
  playerStance?: 'stand' | 'crouch' | 'prone' | 'swim';
  isDiving?: boolean;
  playerLocation?: 'PRIVATE_HOME' | 'SHARED_CITY';
  onReturnHome?: () => void;
  onOpenMap: () => void;
  onOpenChat: () => void;
  onOpenPlayers: () => void;
  onOpenStats: () => void;
  onOpenRankings?: () => void;
  onToggleVoice: () => void;
  onToggleDeafen: () => void;
  onUnlockAudio?: () => void;
  onOpenSettings: () => void;
  onOpenInventory?: () => void;
  onOpenSmartphone?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  activeVehicle,
  interactionPrompt,
  playerPos,
  playerYaw,
  onlineCount,
  isVoiceActive,
  isMicMuted,
  isDeafened,
  isSpeaking,
  unreadChatCount = 0,
  customWaypoint,
  autoplayBlocked = false,
  fps,
  frameTime,
  playerStance = 'stand',
  isDiving = false,
  playerLocation = 'PRIVATE_HOME',
  onReturnHome,
  onOpenMap,
  onOpenChat,
  onOpenPlayers,
  onOpenStats,
  onOpenRankings,
  onToggleVoice,
  onToggleDeafen,
  onUnlockAudio,
  onOpenSettings,
  onOpenSmartphone,
}) => {
  // Circular Mini-map calculations (Free Fire / PUBG radar scale)
  const miniMapRadius = 48; // pixels
  const radarScale = 0.55; // pixels per world meter

  // Relative waypoint position on circular radar
  let markerX = 0;
  let markerZ = 0;
  let hasMarker = false;

  if (customWaypoint) {
    const dx = customWaypoint.x - playerPos.x;
    const dz = customWaypoint.z - playerPos.z;
    const targetDistPix = Math.sqrt(dx * dx + dz * dz) * radarScale;
    const clampedRadius = Math.min(targetDistPix, miniMapRadius - 8);
    if (targetDistPix > 0) {
      markerX = ((dx * radarScale) / targetDistPix) * clampedRadius;
      markerZ = ((dz * radarScale) / targetDistPix) * clampedRadius;
      hasMarker = true;
    }
  }

  // Relative river channel position on radar (Padma River center at X = 87.5)
  const riverRelX = (87.5 - playerPos.x) * radarScale;

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-between overflow-hidden p-2 sm:p-3">
      {/* Autoplay blocked banner for mobile audio unlock */}
      {autoplayBlocked && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={onUnlockAudio}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Tap to enable voice audio</span>
          </button>
        </div>
      )}

      {/* ========================================================
          TOP HEADER: MULTIPLAYER/VOICE/CHAT ICONS, COMPACT HEALTH BAR, CIRCULAR MINIMAP
          ======================================================== */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* --- TOP LEFT: COMPACT CONTROL ICONS --- */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Home Button (বাড়ি / Return to Private Room) */}
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              title={playerLocation === 'PRIVATE_HOME' ? 'ব্যক্তিগত ঘর / Private Room' : 'বাড়ি ফিরুন / Return to Private Home'}
              className={`h-9 px-2.5 rounded-2xl border shadow-xl flex items-center gap-1.5 active:scale-95 transition-all backdrop-blur-xs ${
                playerLocation === 'PRIVATE_HOME'
                  ? 'bg-emerald-950/85 border-emerald-500/70 text-emerald-300'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-slate-700/80 text-amber-400'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[11px] font-bold hidden sm:inline">
                {playerLocation === 'PRIVATE_HOME' ? 'ঘর' : 'বাড়ি'}
              </span>
            </button>
          )}

          {/* Live Online Player Counter Button */}
          <button
            onClick={onOpenPlayers}
            title="Online Players in Room"
            className="h-9 px-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 shadow-xl flex items-center gap-1.5 text-white active:scale-95 transition-all backdrop-blur-xs"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold tabular-nums text-emerald-300">
              {onlineCount}
            </span>
          </button>

          {/* Statistics Button */}
          <button
            onClick={onOpenStats}
            title="Game Stats & Server Metrics"
            className="w-9 h-9 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 shadow-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all backdrop-blur-xs"
          >
            <BarChart2 className="w-4 h-4" />
          </button>

          {/* Dual Player Rankings Button (Playtime & Competitive) */}
          {onOpenRankings && (
            <button
              onClick={onOpenRankings}
              title="Player Rankings (Playtime & Competitive)"
              className="w-9 h-9 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 shadow-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all backdrop-blur-xs"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>
          )}

          {/* Smartphone Launcher Button (iPhone with Garage, Map, Wardrobe, Fishing, Settings) */}
          {onOpenSmartphone && (
            <button
              onClick={onOpenSmartphone}
              title="স্মার্টফোন ও গাড়ি ডেলিভারি / Smartphone Garage"
              className="h-9 px-2.5 rounded-2xl bg-gradient-to-r from-sky-950 to-indigo-950 hover:from-sky-900 hover:to-indigo-900 border border-sky-400/60 shadow-xl flex items-center gap-1.5 text-sky-300 active:scale-95 transition-all backdrop-blur-xs"
            >
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="text-[11px] font-bold hidden sm:inline">ফোন</span>
            </button>
          )}

          {/* Real-time Voice Chat Mic Button */}
          <button
            onClick={onToggleVoice}
            title={
              !isVoiceActive
                ? 'Enable Voice Chat'
                : isMicMuted
                ? 'Unmute Microphone'
                : 'Mute Microphone'
            }
            className={`w-9 h-9 rounded-2xl border shadow-xl flex items-center justify-center active:scale-95 transition-all backdrop-blur-xs relative ${
              !isVoiceActive
                ? 'bg-slate-950/80 hover:bg-slate-900 border-slate-700/80 text-slate-400'
                : isMicMuted
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-400'
                : 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-emerald-500/20'
            }`}
          >
            {!isVoiceActive ? (
              <MicOff className="w-4 h-4" />
            ) : isMicMuted ? (
              <MicOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Mic className="w-4 h-4 text-emerald-400" />
            )}
            {isSpeaking && !isMicMuted && (
              <span className="absolute -inset-0.5 rounded-2xl border-2 border-emerald-400 animate-ping opacity-80" />
            )}
          </button>

          {/* Speaker / Deafen Audio Toggle */}
          <button
            onClick={onToggleDeafen}
            title={isDeafened ? 'Undeafen Voice Audio' : 'Deafen Voice Audio'}
            className={`w-9 h-9 rounded-2xl border shadow-xl flex items-center justify-center active:scale-95 transition-all backdrop-blur-xs ${
              isDeafened
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-400'
                : 'bg-slate-950/80 hover:bg-slate-900 border-slate-700/80 text-slate-300'
            }`}
          >
            {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Real-Time Text Chat Button */}
          <button
            onClick={onOpenChat}
            title="Open Room Text Chat"
            className="w-9 h-9 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 shadow-xl flex items-center justify-center text-sky-400 active:scale-95 transition-all backdrop-blur-xs relative"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center shadow">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </button>
        </div>

        {/* --- TOP MIDDLE: COMPACT PUBG/FREE FIRE HEALTH & STAMINA BAR --- */}
        <div className="pointer-events-auto flex flex-col items-center">
          <div className="bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-700/60 shadow-xl flex flex-col gap-0.5 w-36 sm:w-44">
            {/* Health Bar (Red/White gradient with real health numbers) */}
            <div className="flex items-center justify-between text-[9px] leading-none mb-0.5">
              <span className="font-extrabold text-rose-400">HP</span>
              <span className="tabular-nums font-mono text-[9px] font-bold text-slate-200">
                {Math.round(stats.health)}/{stats.maxHealth}
              </span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700/40">
              <div
                className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-200"
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

            {/* Tactical Stance & Performance Chip */}
            <div className="flex items-center justify-between text-[8px] font-bold tracking-tight text-slate-300 mt-0.5 px-0.5">
              <span>
                {playerStance === 'prone' ? (
                  <span className="text-amber-400 font-extrabold uppercase">PRONE CRAWL</span>
                ) : playerStance === 'crouch' ? (
                  <span className="text-sky-400 font-extrabold uppercase">CROUCH</span>
                ) : playerStance === 'swim' ? (
                  <span className="text-cyan-400 font-extrabold uppercase">
                    {isDiving || playerPos.y < -0.55
                      ? `DIVING (${Math.abs(playerPos.y + 0.4).toFixed(1)}m)`
                      : 'SWIMMING'}
                  </span>
                ) : (
                  <span className="text-slate-400">STAND</span>
                )}
              </span>
              {fps !== undefined && (
                <span className="text-[8px] font-mono tabular-nums text-emerald-400 font-semibold">
                  {fps} FPS{frameTime !== undefined ? ` · ${frameTime}ms` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- TOP RIGHT: SETTINGS & CIRCULAR RADAR MINIMAP --- */}
        <div className="flex items-start gap-1.5 pointer-events-auto">
          {/* Pause / Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Settings (Esc)"
            className="w-9 h-9 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/70 shadow-xl flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* Circular GPS Radar Minimap (Tap opens enlarged world map) */}
          <div
            onClick={onOpenMap}
            title="Tap to open Full Map & set Waypoints"
            className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-slate-950/90 border-2 border-slate-600/80 shadow-2xl relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center backdrop-blur-xs"
          >
            {/* Concentric radar range rings */}
            <div className="absolute inset-2 rounded-full border border-slate-700/40" />
            <div className="absolute inset-5 rounded-full border border-slate-700/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-slate-700/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-px bg-slate-700/30" />
            </div>

            {/* River Padma ribbon on radar */}
            {Math.abs(riverRelX) < miniMapRadius + 15 && (
              <div
                className="absolute top-0 bottom-0 w-6 bg-sky-500/25 border-x border-sky-400/40 pointer-events-none"
                style={{
                  left: `calc(50% + ${riverRelX}px - 12px)`,
                }}
              />
            )}

            {/* Compass North Needle */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] font-black text-rose-400 flex items-center gap-0.5 tracking-tighter">
              N
            </div>

            {/* Center Player Direction Arrow */}
            <div
              className="absolute z-20 w-3.5 h-3.5 flex items-center justify-center"
              style={{ transform: `rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 filter drop-shadow" />
            </div>

            {/* Custom Waypoint Marker on Radar */}
            {hasMarker && (
              <div
                className="absolute z-30 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${markerX}px)`,
                  top: `calc(50% + ${markerZ}px)`,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-slate-950 shadow-md animate-ping" />
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
      <div className="flex flex-col items-center justify-center pointer-events-none mb-12">
        {/* Proximity Interaction Banner (only shown when contextual action is possible) */}
        {interactionPrompt && (
          <div className="bg-slate-950/90 text-white px-3.5 py-1.5 rounded-2xl border-2 border-emerald-400 shadow-2xl flex items-center gap-2 text-xs font-bold tracking-wide animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {interactionPrompt}
          </div>
        )}

        {/* Speedometer when Driving Vehicle */}
        {activeVehicle && (
          <div className="bg-slate-950/90 border border-slate-700/80 text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 mt-2 pointer-events-auto">
            <div className="p-1 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[9px] text-slate-400 uppercase font-semibold">
                {activeVehicle.config.nameBn}
              </div>
              <div className="text-lg font-black font-mono text-emerald-400 tabular-nums leading-tight">
                {Math.round(Math.abs(activeVehicle.velocity) * 3.6)}{' '}
                <span className="text-[9px] font-normal text-slate-400">km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty bottom placeholder to ensure clear view of character and landscape controls */}
      <div className="pointer-events-none" />
    </div>
  );
};
