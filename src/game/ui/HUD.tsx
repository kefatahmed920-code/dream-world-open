/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Settings as SettingsIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Navigation,
  ZoomIn,
  ZoomOut,
  Crosshair,
  RotateCw,
  Hand,
  Package,
  Heart,
  Users,
  Compass,
  Sliders,
  Radio,
  Plus,
  Car,
  ChevronUp,
  AlertCircle,
  Flag,
  MapPin,
} from 'lucide-react';
import { PlayerStats } from '../types';
import { ActiveVehicle } from '../vehicles/vehicleManager';
import { InputManager } from '../controls/inputManager';
import { PlayerInfo } from './PlayerListModal';
import { soundManager } from '../audio/soundManager';
import { loadHudLayout, HudCustomLayout } from './hudLayoutConfig';

// Tactical small SVG icons
const JumpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="12" cy="4" r="2" />
    <path d="M12 7c-1 0-1.8.8-1.8 1.8v2.7l-2.2 1.3.7 1.6 2.4-1.4V16l-1.8 3.1 1.5.9 2-3.6 2 3.6 1.5-.9-1.8-3.1v-2.9l2.4 1.4.7-1.6L13.8 11.5V8.8c0-1-.8-1.8-1.8-1.8z" />
  </svg>
);

const CrouchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="15.5" cy="5.5" r="1.8" />
    <path d="M14 9c-.8 0-1.5.4-1.9 1.1L10 13.5l-2.7-.9v1.9l3 1 2.1-4.2 1.5 1.5V19h2.2v-5.8l-1.8-1.8 1.3-1.3c.3.4.8.7 1.3.7h1.8V9h-3.1z" />
  </svg>
);

const ProneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="5" cy="12" r="1.8" />
    <path d="M7.5 12.5c0-.5.3-.9.8-1l5.3-.9c.5-.1 1.1.2 1.3.7l1.8 3.1-1.6.9-1.4-2.5-2.3.4v3.4H10v-3.8l-2.1.4c-.3 0-.5-.1-.5-.5z" />
    <path d="M14 15h5v1.8h-5z" />
  </svg>
);

const RunningManIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="14" cy="4" r="2" />
    <path d="M13.5 7.5c-1 0-1.7.5-2 1.3l-2.2 4.7 3 1.5 1-2.4 1.6 1.3V19h2.2v-5.8l-1.9-1.9 1-2c.3.5.9.8 1.6.8H20V9h-2.2l-1.8-1.9c-.4-.4-1-.7-1.7-.7zM6 17l2.6-4.3-1.6-.9L4.6 15.6 6 17z" />
  </svg>
);

const GrenadeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <circle cx="12" cy="14" r="6" />
    <rect x="10" y="4" width="4" height="3" rx="1" />
    <path d="M12 2v2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export interface HUDProps {
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
  inputManager?: InputManager;
  connectedPlayers?: PlayerInfo[];
  combatHit?: { isHeadshot: boolean; targetName: string; time: number } | null;
  onSendMessage?: (text: string) => void;
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
  onOpenCustomizeHud?: () => void;
  onReturnToLobby?: () => void;
  onOpenCharacterSelect?: () => void;
  // Tactical action triggers
  onFireWeapon?: () => void;
  onReloadWeapon?: () => void;
  onQuickHeal?: () => void;
  onSetAim?: (aim: boolean) => void;
  onCyclePerspective?: () => void;
  onEquipSlot?: (slot: number) => void;
  activeWeaponSlot?: number;
  weaponSlots?: Array<{
    id: string;
    name: string;
    category: string;
    ammo?: number;
    maxAmmo?: number;
    reserveAmmo?: number;
    count?: number;
    maxCount?: number;
    icon: string;
  }>;
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
  fps = 60,
  playerStance = 'stand',
  inputManager,
  connectedPlayers = [],
  combatHit = null,
  onSendMessage,
  onOpenMap,
  onOpenChat,
  onOpenPlayers,
  onToggleVoice,
  onToggleDeafen,
  onUnlockAudio,
  onOpenSettings,
  onOpenInventory,
  onOpenSmartphone,
  onOpenCustomizeHud,
  onFireWeapon,
  onReloadWeapon,
  onQuickHeal,
  onSetAim,
  onCyclePerspective,
  onEquipSlot,
  activeWeaponSlot = 0,
}) => {
  // HUD layout config
  const [hudLayout, setHudLayout] = useState<HudCustomLayout>(() => loadHudLayout());

  useEffect(() => {
    const handleLayoutUpdate = () => {
      setHudLayout(loadHudLayout());
    };
    window.addEventListener('dream_hud_layout_changed', handleLayoutUpdate);
    return () => window.removeEventListener('dream_hud_layout_changed', handleLayoutUpdate);
  }, []);

  // UI States
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [isSprintActive, setIsSprintActive] = useState(inputManager?.virtualSprint || false);
  const [radarZoom, setRadarZoom] = useState(1.0);
  const [recentHitMarker, setRecentHitMarker] = useState<{ isHeadshot: boolean; targetName: string } | null>(null);
  const [damageIndicator, setDamageIndicator] = useState(false);
  const prevHealthRef = useRef(stats.health);

  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const [isJoystickTouching, setIsJoystickTouching] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Camera Drag Swipe State
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCameraTouchPos = useRef<{ x: number; y: number } | null>(null);

  // Detect damage taken for directional hit flash
  useEffect(() => {
    if (stats.health < prevHealthRef.current) {
      setDamageIndicator(true);
      const timer = setTimeout(() => setDamageIndicator(false), 900);
      prevHealthRef.current = stats.health;
      return () => clearTimeout(timer);
    }
    prevHealthRef.current = stats.health;
  }, [stats.health]);

  // Display combat hitmarker on actual hit
  useEffect(() => {
    if (combatHit && Date.now() - combatHit.time < 300) {
      setRecentHitMarker({ isHeadshot: combatHit.isHeadshot, targetName: combatHit.targetName });
      const timer = setTimeout(() => setRecentHitMarker(null), 350);
      return () => clearTimeout(timer);
    }
  }, [combatHit]);

  // Sync virtual sprint
  useEffect(() => {
    if (inputManager) {
      setIsSprintActive(inputManager.virtualSprint);
    }
  }, [inputManager?.virtualSprint]);

  // Compass degrees (0 to 360)
  const degrees = useMemo(() => {
    let deg = Math.round((-playerYaw * 180) / Math.PI) % 360;
    if (deg < 0) deg += 360;
    return deg;
  }, [playerYaw]);

  // Minimap radar math
  const miniMapRadius = 42;
  const radarScale = 0.5 * radarZoom;
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

  // River ribbon on radar
  const riverRelX = (87.5 - playerPos.x) * radarScale;

  // --- MOVEMENT JOYSTICK TOUCH HANDLERS ---
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickTouching(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickTouching(false);
        setJoystickThumb({ x: 0, y: 0 });
        inputManager?.setTouchMove(0, 0);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2 - 6;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let normX = dx / maxRadius;
    let normY = dy / maxRadius;

    if (distance > maxRadius) {
      normX = dx / distance;
      normY = dy / distance;
    }

    setJoystickThumb({ x: normX * maxRadius, y: normY * maxRadius });
    inputManager?.setTouchMove(normX, normY);
  };

  // Toggle Sprint Button
  const handleToggleSprint = () => {
    if (!inputManager) return;
    const next = !inputManager.virtualSprint;
    inputManager.virtualSprint = next;
    setIsSprintActive(next);
    soundManager.playUiClick();
  };

  // --- CAMERA DRAG ROTATION ZONE (Right side of screen) ---
  const handleCameraTouchStart = (e: React.TouchEvent) => {
    if (cameraTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    cameraTouchIdRef.current = touch.identifier;
    lastCameraTouchPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchMove = (e: React.TouchEvent) => {
    if (cameraTouchIdRef.current === null || !lastCameraTouchPos.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchIdRef.current) {
        const dx = touch.clientX - lastCameraTouchPos.current.x;
        const dy = touch.clientY - lastCameraTouchPos.current.y;
        lastCameraTouchPos.current = { x: touch.clientX, y: touch.clientY };
        inputManager?.addTouchCameraDelta(dx, dy);
        break;
      }
    }
  };

  const handleCameraTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null;
        lastCameraTouchPos.current = null;
        break;
      }
    }
  };

  // Handle ADS Aim toggle
  const handleToggleAim = () => {
    const next = !isAiming;
    setIsAiming(next);
    onSetAim?.(next);
    soundManager.playUiClick();
  };

  // Quick Squad Chat message trigger
  const handleQuickChat = (msg: string) => {
    onSendMessage?.(msg);
    setIsQuickChatOpen(false);
    soundManager.playRadioBeep(true);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden font-sans">
      {/* Directional Damage Indicator Flash */}
      {damageIndicator && (
        <div className="absolute inset-0 border-4 border-rose-500/60 pointer-events-none animate-pulse shadow-inner shadow-rose-950" />
      )}

      {/* Combat Hit Marker (Brief crosshair tick on damage / elimination) */}
      {recentHitMarker && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="relative flex flex-col items-center animate-ping">
            <span
              className={`text-2xl font-black ${
                recentHitMarker.isHeadshot ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b]' : 'text-rose-500'
              }`}
            >
              ✕
            </span>
            {recentHitMarker.isHeadshot && (
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider bg-rose-950/80 px-1.5 py-0.5 rounded border border-amber-400/60 mt-1">
                HEADSHOT!
              </span>
            )}
          </div>
        </div>
      )}

      {/* ADS Reticle Overlay when Aiming */}
      {isAiming && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-rose-500/60" />
            <div className="absolute inset-3 rounded-full border border-rose-400/30 border-dashed" />
            <div className="absolute w-full h-[1px] bg-rose-500/70" />
            <div className="absolute h-full w-[1px] bg-rose-500/70" />
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
          </div>
        </div>
      )}

      {/* 360-Degree Camera Touchpad (Right 60% of viewport) */}
      <div
        className="absolute inset-y-0 right-0 w-3/5 pointer-events-auto touch-none"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
        onTouchCancel={handleCameraTouchEnd}
      />

      {/* Audio Unlock Banner */}
      {autoplayBlocked && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <button
            onClick={onUnlockAudio}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 transition active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Enable Voice Audio</span>
          </button>
        </div>
      )}

      {/* ========================================================
          4. SQUAD INFORMATION & 8. SQUAD COMMUNICATION (TOP-LEFT)
          ======================================================== */}
      <div
        className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-auto z-40 transition-all"
        style={{
          opacity: hudLayout.squadPanel.opacity,
          transform: `scale(${hudLayout.squadPanel.scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Top Control Strip: Settings, Mic, Speaker, Chat, QuickChat */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSettings}
            title="Settings (Esc)"
            className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-slate-700/70 flex items-center justify-center">
              <SettingsIcon className="w-3.5 h-3.5" />
            </div>
          </button>

          <button
            onClick={onToggleVoice}
            title={!isVoiceActive ? 'Enable Mic' : isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition relative"
          >
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                !isVoiceActive || isMicMuted
                  ? 'bg-slate-950/80 border-slate-700/70 text-slate-400'
                  : 'bg-emerald-950/85 border-emerald-400 text-emerald-300'
              }`}
            >
              {!isVoiceActive || isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            </div>
            {isSpeaking && !isMicMuted && (
              <span className="absolute inset-2 rounded-lg border border-emerald-400 animate-ping opacity-75" />
            )}
          </button>

          <button
            onClick={onToggleDeafen}
            title={isDeafened ? 'Undeafen Speaker' : 'Deafen Speaker'}
            className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
          >
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                isDeafened
                  ? 'bg-rose-950/85 border-rose-500/60 text-rose-400'
                  : 'bg-slate-950/80 border-slate-700/70 text-slate-300'
              }`}
            >
              {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </div>
          </button>

          <button
            onClick={onOpenChat}
            title="Text Chat"
            className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-sky-400 active:scale-90 transition relative"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-slate-700/70 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            {unreadChatCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center">
                {unreadChatCount}
              </span>
            )}
          </button>

          {/* Quick Chat Dialogue Launcher */}
          <button
            onClick={() => setIsQuickChatOpen((prev) => !prev)}
            title="Squad Quick Chat"
            className={`w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition ${
              isQuickChatOpen ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-slate-700/70 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* HUD Customizer Shortcut */}
          {onOpenCustomizeHud && (
            <button
              onClick={onOpenCustomizeHud}
              title="Customize HUD Layout"
              className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-400 active:scale-90 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-amber-500/40 flex items-center justify-center">
                <Sliders className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>

        {/* Quick Chat Menu Popout */}
        {isQuickChatOpen && (
          <div className="bg-slate-950/95 border border-amber-500/60 rounded-xl p-1.5 flex flex-col gap-1 shadow-2xl backdrop-blur-md animate-fade-in w-40">
            <div className="text-[8px] font-bold uppercase tracking-wider text-amber-400 px-1">Quick Communication</div>
            {[
              { id: 'spotted', label: '🎯 Enemy Spotted!' },
              { id: 'follow', label: '🏃 Follow Me!' },
              { id: 'help', label: '🆘 Need Help!' },
              { id: 'location', label: '📍 Go to Location!' },
            ].map((qc) => (
              <button
                key={qc.id}
                onClick={() => handleQuickChat(qc.label)}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold text-left transition"
              >
                {qc.label}
              </button>
            ))}
          </div>
        )}

        {/* Real Squad List: Only actual connected players (No fake teammates!) */}
        <div className="bg-slate-950/75 border border-slate-800 rounded-xl p-1.5 flex flex-col gap-1 w-36 sm:w-40 backdrop-blur-xs">
          {connectedPlayers.map((p, idx) => (
            <div key={p.id || idx} className="flex items-center justify-between text-[10px] leading-tight">
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-[9px] text-amber-400 font-bold">{idx + 1}</span>
                <span className="text-slate-200 truncate font-semibold">{p.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="w-7 bg-slate-900 h-1 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-400 h-full w-full" />
                </div>
                {p.isSpeaking ? (
                  <Mic className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                ) : p.isMuted ? (
                  <MicOff className="w-2.5 h-2.5 text-slate-500" />
                ) : null}
              </div>
            </div>
          ))}
          {connectedPlayers.length <= 1 && (
            <div className="text-[8px] text-slate-500 font-medium px-0.5">
              Solo · Waiting for squad
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          5. COMPACT CIRCULAR MINI-MAP (TOP-RIGHT)
          ======================================================== */}
      <div
        className="absolute top-2 right-2 flex items-start gap-1.5 pointer-events-auto z-40 transition-all"
        style={{
          opacity: hudLayout.minimap.opacity,
          transform: `scale(${hudLayout.minimap.scale})`,
          transformOrigin: 'top right',
        }}
      >
        {/* Smartphone launcher */}
        {onOpenSmartphone && (
          <button
            onClick={onOpenSmartphone}
            title="Open Smartphone"
            className="w-7 h-7 min-w-[44px] min-h-[44px] flex items-center justify-center text-sky-400 active:scale-90 transition"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-950/80 border border-sky-400/50 flex items-center justify-center">
              <Car className="w-3.5 h-3.5" />
            </div>
          </button>
        )}

        {/* Circular Mini-map with N, E, S, W markings */}
        <div className="flex flex-col items-end gap-0.5">
          <div
            onClick={onOpenMap}
            title="Tap to open full-screen map"
            className="w-20 h-20 rounded-full bg-slate-950/90 border border-slate-600/80 shadow-xl relative overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors flex items-center justify-center backdrop-blur-xs group"
          >
            {/* Concentric rings */}
            <div className="absolute inset-1.5 rounded-full border border-slate-700/30" />
            <div className="absolute inset-4 rounded-full border border-slate-700/20" />

            {/* Compass Directions N, E, S, W clearly labeled along rim */}
            <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black text-rose-400">N</span>
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black text-slate-400">S</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-slate-400">W</span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] font-black text-slate-400">E</span>

            {/* River Padma ribbon on radar */}
            {Math.abs(riverRelX) < miniMapRadius + 10 && (
              <div
                className="absolute top-0 bottom-0 w-4 bg-sky-500/20 border-x border-sky-400/30 pointer-events-none"
                style={{
                  left: `calc(50% + ${riverRelX}px - 8px)`,
                }}
              />
            )}

            {/* Center Player Direction Arrow */}
            <div
              className="absolute z-20 w-3 h-3 flex items-center justify-center"
              style={{ transform: `rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            >
              <Navigation className="w-3 h-3 text-emerald-400 fill-emerald-400 drop-shadow" />
            </div>

            {/* Custom Waypoint Marker on Radar */}
            {hasMarker && (
              <div
                className="absolute z-30 w-2 h-2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{
                  left: `calc(50% + ${markerX}px)`,
                  top: `calc(50% + ${markerZ}px)`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              </div>
            )}
          </div>

          {/* Minimap Zoom Controls */}
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[8px] font-mono text-slate-400 tabular-nums">
              {degrees}°
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRadarZoom((z) => Math.min(1.8, z + 0.25));
                soundManager.playUiClick();
              }}
              title="Zoom In"
              className="w-4 h-4 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
            >
              <ZoomIn className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRadarZoom((z) => Math.max(0.6, z - 0.25));
                soundManager.playUiClick();
              }}
              title="Zoom Out"
              className="w-4 h-4 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center justify-center active:scale-90"
            >
              <ZoomOut className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          1. MOVEMENT CONTROLS & 6. HEALTH STATUS & 9. BACKPACK (BOTTOM-LEFT)
          ======================================================== */}
      <div
        className="absolute bottom-4 left-4 pointer-events-auto flex flex-col items-start gap-1.5 z-40 transition-all touch-none"
        style={{
          opacity: hudLayout.joystick.opacity,
          transform: `scale(${hudLayout.joystick.scale})`,
          transformOrigin: 'bottom left',
        }}
      >
        {/* 6. HEALTH AND STATUS: Compact Green Bar with Small Heart Icon */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800 shadow-md backdrop-blur-xs">
          <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400/40 shrink-0" />
          <div className="w-24 sm:w-28 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100))}%` }}
            />
          </div>
          <span className="font-mono text-[9px] font-bold text-slate-300 tabular-nums">
            {Math.round(stats.health)}
          </span>
        </div>

        {/* Small Sprint Button placed above the joystick */}
        <div className="flex items-center gap-2 pl-1">
          <button
            onClick={handleToggleSprint}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleToggleSprint();
            }}
            title="Toggle Sprint / Run"
            className={`w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition`}
          >
            <div
              className={`w-8 h-8 rounded-full border shadow-md flex items-center justify-center ${
                isSprintActive
                  ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-amber-500/30'
                  : 'bg-slate-900/80 border-slate-700 text-amber-400'
              }`}
            >
              <RunningManIcon />
            </div>
          </button>

          {/* 9. Backpack Button near bottom-left */}
          {onOpenInventory && (
            <button
              onClick={onOpenInventory}
              onTouchStart={(e) => {
                e.stopPropagation();
                onOpenInventory();
              }}
              title="Open Backpack (I / Tab)"
              className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700 text-amber-400 flex items-center justify-center shadow-md">
                <Package className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* Quick Heal Button */}
          <button
            onClick={() => onQuickHeal?.()}
            onTouchStart={(e) => {
              e.stopPropagation();
              onQuickHeal?.();
            }}
            title="Use Medkit / First Aid"
            className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
          >
            <div className="w-8 h-8 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-400 flex items-center justify-center shadow-md">
              <Heart className="w-3.5 h-3.5 fill-rose-500/30" />
            </div>
          </button>
        </div>

        {/* Movement Joystick: Compact, semi-transparent dark-grey with subtle white ring */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className={`w-28 h-28 rounded-full border flex items-center justify-center relative shadow-xl backdrop-blur-xs transition-colors ${
            isJoystickTouching
              ? 'bg-slate-900/75 border-slate-500'
              : 'bg-slate-900/55 border-slate-700/60'
          }`}
        >
          {/* Subtle white inner ring */}
          <div className="w-14 h-14 rounded-full border border-white/20" />

          {/* Small central thumb control */}
          <div
            className={`w-9 h-9 rounded-full border shadow-md absolute transition-transform pointer-events-none flex items-center justify-center ${
              isJoystickTouching
                ? 'bg-slate-600/90 border-white/40 text-white'
                : 'bg-slate-700/75 border-white/25 text-slate-300'
            }`}
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ========================================================
          2. WEAPON INVENTORY BAR (BOTTOM-CENTER)
          Compact curved metallic HUD with 5 empty slots showing ONLY small (+) icons
          ======================================================== */}
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto z-40 transition-all"
        style={{
          opacity: hudLayout.curvedCarousel.opacity,
          transform: `translateX(-50%) scale(${hudLayout.curvedCarousel.scale})`,
        }}
      >
        <div className="flex items-end justify-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-950/85 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
          {[0, 1, 2, 3, 4].map((slotIndex) => {
            const isEquipped = activeWeaponSlot === slotIndex;
            // Slight parabolic curve offset
            const arcOffset = Math.abs(slotIndex - 2) * -2;

            return (
              <button
                key={slotIndex}
                onClick={() => onEquipSlot?.(slotIndex)}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onEquipSlot?.(slotIndex);
                }}
                title={`Weapon Slot ${slotIndex + 1}`}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                  isEquipped
                    ? 'bg-slate-900 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)] text-cyan-300 -translate-y-1'
                    : 'bg-slate-900/60 hover:bg-slate-800 border-slate-700/60 text-slate-500'
                }`}
                style={{
                  transform: `translateY(${arcOffset}px)`,
                }}
              >
                {/* Slot index label */}
                <span className="absolute top-0.5 left-1 text-[7px] font-mono text-slate-500 font-bold">
                  {slotIndex + 1}
                </span>

                {/* Small centered plus (+) icon ONLY */}
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. FIRE AND ACTION CONTROLS & 11. VEHICLE CONTROLS (BOTTOM-RIGHT)
          ======================================================== */}
      <div
        className="absolute bottom-4 right-4 pointer-events-auto flex flex-col items-end gap-2 z-40 transition-all touch-none"
        style={{
          opacity: hudLayout.actionCluster.opacity,
          transform: `scale(${hudLayout.actionCluster.scale})`,
          transformOrigin: 'bottom right',
        }}
      >
        {/* Contextual Vehicle Controls when driving */}
        {activeVehicle ? (
          <div className="flex flex-col items-end gap-2">
            {/* Driving Speedometer */}
            <div className="bg-slate-950/85 border border-slate-800 text-white px-2.5 py-1 rounded-xl shadow-lg flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-mono font-black text-emerald-400 tabular-nums">
                {Math.round(Math.abs(activeVehicle.velocity) * 3.6)} km/h
              </span>
            </div>

            {/* Vehicle Action Row: Gas, Brake, Exit */}
            <div className="flex items-center gap-2">
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.touchMove.y = -1; // Accelerate
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.touchMove.y = 0;
                }}
                className="w-12 h-12 rounded-2xl bg-emerald-600 border border-emerald-400 text-white font-black text-[10px] flex items-center justify-center active:scale-90 shadow-lg"
              >
                GAS
              </button>

              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.touchMove.y = 1; // Brake
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.touchMove.y = 0;
                }}
                className="w-12 h-12 rounded-2xl bg-rose-600 border border-rose-400 text-white font-black text-[10px] flex items-center justify-center active:scale-90 shadow-lg"
              >
                BRAKE
              </button>

              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.virtualDrive = true; // Exit Vehicle
                }}
                className="w-10 h-10 rounded-xl bg-amber-500 border border-amber-300 text-slate-950 font-black text-[9px] flex items-center justify-center active:scale-90 shadow-lg"
              >
                EXIT
              </button>
            </div>
          </div>
        ) : (
          /* On-Foot Combat Controls */
          <div className="flex flex-col items-end gap-2">
            {/* Contextual Interaction / Drive Button */}
            {interactionPrompt && (
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (interactionPrompt.includes('Drive') && inputManager) {
                    inputManager.virtualDrive = true;
                  } else if (inputManager) {
                    inputManager.virtualInteract = true;
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs border border-amber-300 shadow-xl flex items-center gap-1.5 active:scale-90 animate-pulse"
              >
                <Hand className="w-3.5 h-3.5" />
                <span>{interactionPrompt}</span>
              </button>
            )}

            {/* Top Tactical Row: Scope/ADS, Reload, Perspective, Grenade */}
            <div className="flex items-center gap-1.5">
              {/* Grenade Button */}
              <button
                onClick={() => onFireWeapon?.()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onFireWeapon?.();
                }}
                title="Throw Grenade"
                className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 text-slate-300 flex items-center justify-center shadow-md">
                  <GrenadeIcon />
                </div>
              </button>

              {/* Perspective Cycle (TP / FP) */}
              <button
                onClick={() => onCyclePerspective?.()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onCyclePerspective?.();
                }}
                title="Camera Perspective (TP/FP)"
                className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 text-sky-400 flex items-center justify-center shadow-md text-[10px] font-bold">
                  TP
                </div>
              </button>

              {/* Reload Button */}
              <button
                onClick={() => onReloadWeapon?.()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onReloadWeapon?.();
                }}
                title="Reload (R)"
                className="w-8 h-8 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900/80 border border-slate-700/80 text-amber-400 flex items-center justify-center shadow-md">
                  <RotateCw className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Scope / ADS Button */}
              <button
                onClick={handleToggleAim}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleToggleAim();
                }}
                title="Scope / Aim (ADS)"
                className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
              >
                <div
                  className={`w-9 h-9 rounded-full border shadow-md flex items-center justify-center ${
                    isAiming
                      ? 'bg-rose-600 border-rose-300 text-white'
                      : 'bg-slate-900/80 border-slate-700/80 text-rose-400'
                  }`}
                >
                  <Crosshair className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Middle Row: Crouch, Prone, and Main Fire Button */}
            <div className="flex items-center gap-2">
              {/* Crouch Button */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.virtualCrouch = true;
                }}
                className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
                title="Crouch (C)"
              >
                <div
                  className={`w-9 h-9 rounded-full border shadow-md flex items-center justify-center ${
                    playerStance === 'crouch'
                      ? 'bg-sky-500 border-sky-200 text-slate-950'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <CrouchIcon />
                </div>
              </button>

              {/* Prone Button */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.virtualProne = true;
                }}
                className="w-9 h-9 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 transition"
                title="Prone (Z)"
              >
                <div
                  className={`w-9 h-9 rounded-full border shadow-md flex items-center justify-center ${
                    playerStance === 'prone'
                      ? 'bg-sky-500 border-sky-200 text-slate-950'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <ProneIcon />
                </div>
              </button>

              {/* Main Fire Button: Yellow/Orange circular with crosshair and subtle glow */}
              <button
                onClick={() => onFireWeapon?.()}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onFireWeapon?.();
                }}
                title="Fire Weapon"
                className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 border border-amber-300 text-slate-950 shadow-md shadow-amber-500/20 flex items-center justify-center active:scale-90 transition"
              >
                <Crosshair className="w-6 h-6 text-slate-950" />
              </button>
            </div>

            {/* Bottom Row: Jump Button */}
            <div className="flex items-center gap-2">
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (inputManager) inputManager.virtualJump = true;
                }}
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-black border border-emerald-300 shadow-md flex items-center justify-center active:scale-90 transition"
                title="Jump / Stand Up (Space)"
              >
                <JumpIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
