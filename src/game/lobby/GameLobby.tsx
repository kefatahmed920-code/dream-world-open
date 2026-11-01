/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  User,
  Users,
  Settings as SettingsIcon,
  Package,
  PawPrint,
  Maximize2,
  Compass,
  Smartphone,
  RotateCw,
} from 'lucide-react';
import { Lobby3DCanvas } from './Lobby3DCanvas';
import { PetType } from './PetCompanionModel';
import { ModeSelectModal, GameModeId, TeamMode, GAME_MODES } from './ModeSelectModal';
import { PetSelectModal } from './PetSelectModal';
import { FriendsSocialModal } from './FriendsSocialModal';
import { soundManager } from '../audio/soundManager';
import { authManager, PlayerAccount } from '../auth/authManager';
import { CharacterAppearance } from '../character/characterModel';
import { PlayerStats } from '../types';
import { NetworkConfig } from '../config/networkConfig';

interface GameLobbyProps {
  appearance: CharacterAppearance;
  playerStats: PlayerStats;
  currentRoom?: string;
  onStartGame: (mode: 'single' | 'multiplayer') => void;
  onOpenCharacterSelect: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenRankings: () => void;
  onOpenChat: () => void;
  onOpenInstallModal: () => void;
  onOpenPublishGuide: () => void;
  onUpdateAppearance?: (appearance: CharacterAppearance) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  appearance,
  playerStats,
  currentRoom = 'Dhaka-Hub-1',
  onStartGame,
  onOpenCharacterSelect,
  onOpenInventory,
  onOpenSettings,
  onOpenProfile,
}) => {
  // Lobby State
  const [user, setUser] = useState<PlayerAccount | null>(authManager.getCurrentUser());
  const [selectedPet, setSelectedPet] = useState<PetType>(() => {
    try {
      const saved = localStorage.getItem('dream_active_pet') as PetType;
      return saved && ['cyber_fox', 'tiger_cub', 'aero_drone'].includes(saved)
        ? saved
        : 'cyber_fox';
    } catch {
      return 'cyber_fox';
    }
  });

  const [selectedMode, setSelectedMode] = useState<GameModeId>('open_world');
  const [teamMode, setTeamMode] = useState<TeamMode>('solo');
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [orientationLocked, setOrientationLocked] = useState<boolean>(false);

  // Sub-modal states
  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [isPetSelectOpen, setIsPetSelectOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  // Subscribe to Auth changes
  useEffect(() => {
    const unsub = authManager.subscribe((acc) => setUser(acc));
    return () => unsub();
  }, []);

  // Check Orientation and Manage Landscape Lock
  const checkOrientation = useCallback(() => {
    if (typeof window === 'undefined') return;
    const isNarrowPortrait =
      window.innerHeight > window.innerWidth &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 850);
    setIsPortrait(isNarrowPortrait);
  }, []);

  // Request Native Landscape Orientation & Fullscreen
  const requestLandscapeAndFullscreen = useCallback(async () => {
    soundManager.playUiClick();
    let locked = false;

    // 1. Request Fullscreen first (required by Screen Orientation API on standard mobile browsers)
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
      }
    } catch {}

    // 2. Lock screen orientation to landscape
    try {
      const screenAny = window.screen as unknown as {
        orientation?: { lock?: (o: string) => Promise<void> };
        lockOrientation?: (o: string) => boolean;
        mozLockOrientation?: (o: string) => boolean;
        msLockOrientation?: (o: string) => boolean;
      };

      if (screenAny.orientation?.lock) {
        await screenAny.orientation.lock('landscape');
        locked = true;
      } else if (screenAny.lockOrientation) {
        locked = screenAny.lockOrientation('landscape');
      } else if (screenAny.mozLockOrientation) {
        locked = screenAny.mozLockOrientation('landscape');
      }
    } catch {
      // Browser may require PWA standalone mode or specific hardware support
    }

    setOrientationLocked(locked);
    setTimeout(checkOrientation, 250);
  }, [checkOrientation]);

  // Initial check & auto-request landscape on mount/PWA launch
  useEffect(() => {
    checkOrientation();

    // Auto-attempt orientation lock for installed PWA / compatible mobile environments
    const autoAttempt = async () => {
      try {
        const screenAny = window.screen as unknown as {
          orientation?: { lock?: (o: string) => Promise<void> };
        };
        if (screenAny.orientation?.lock) {
          await screenAny.orientation.lock('landscape');
          setOrientationLocked(true);
        }
      } catch {}
    };
    autoAttempt();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    if ('orientation' in window.screen) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if ('orientation' in window.screen) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, [checkOrientation]);

  // Poll server online count
  useEffect(() => {
    let isMounted = true;
    const fetchStats = () => {
      fetch(NetworkConfig.getApiUrl('/api/stats'))
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          if (data && typeof data.totalOnline === 'number') {
            setOnlineCount(data.totalOnline);
          }
        })
        .catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectPet = (pet: PetType) => {
    setSelectedPet(pet);
    localStorage.setItem('dream_active_pet', pet);
  };

  const handleStartPlay = () => {
    soundManager.resume();
    soundManager.playCollectCoin();
    // Try to ensure landscape fullscreen when starting
    requestLandscapeAndFullscreen();
    onStartGame(teamMode === 'solo' ? 'single' : 'multiplayer');
  };

  const activeModeConfig = GAME_MODES.find((m) => m.id === selectedMode) || GAME_MODES[0];

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none pointer-events-auto bg-slate-950 font-sans"
      style={{ touchAction: 'none' }}
    >
      {/* ========================================================
          1. 3D LOBBY VIEWPORT (CHARACTER & PET IN CENTER)
          ======================================================== */}
      <Lobby3DCanvas appearance={appearance} petType={selectedPet} />

      {/* Subtle Mobile Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-slate-950/15 to-slate-950/80" />

      {/* ========================================================
          2. ESSENTIAL TOP BAR (PROFILE, FRIENDS, SETTINGS)
          ======================================================== */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between pointer-events-none"
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        }}
      >
        {/* Top-Left: Player Profile Pill */}
        <div
          onClick={() => {
            soundManager.playUiClick();
            onOpenProfile();
          }}
          className="pointer-events-auto cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 shadow-2xl backdrop-blur-md transition-all active:scale-95"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
              {(user?.displayName || 'Explorer').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 py-0.1 rounded-full bg-emerald-500 text-slate-950 font-black text-[8px] leading-tight">
              {playerStats.level}
            </div>
          </div>

          <div className="text-left pr-1">
            <div className="text-xs font-black text-white group-hover:text-amber-400 transition leading-tight max-w-[120px] truncate">
              {user?.displayName || 'Explorer'}
            </div>
            <div className="text-[9px] text-slate-400 font-mono">
              UID: {(user?.uid || 'guest').substring(0, 7)}
            </div>
          </div>
        </div>

        {/* Top-Right: Quick Essential Utility Buttons (Friends, Fullscreen, Settings) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Online Friends Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsFriendsOpen(true);
            }}
            className="w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-emerald-400 border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition active:scale-95 relative"
            title="Friends & Online Room"
          >
            <Users className="w-4 h-4" />
            {onlineCount > 1 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                {onlineCount}
              </span>
            )}
          </button>

          {/* Fullscreen & Orientation Lock Trigger */}
          <button
            onClick={requestLandscapeAndFullscreen}
            className="w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition active:scale-95"
            title="Fullscreen & Landscape Lock"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur-md flex items-center justify-center transition active:scale-95"
            title="Game Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          3. ESSENTIAL LEFT SIDE DOCK (VAULT / BAG / PETS)
          ======================================================== */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 pointer-events-auto"
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        }}
      >
        {/* Character / Vault / Outfit */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenCharacterSelect();
          }}
          className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-amber-400 shadow-xl backdrop-blur-md transition active:scale-95"
          title="Character & Outfits"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
            <User className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-amber-400 hidden sm:inline">
            Vault
          </span>
        </button>

        {/* Bag / Inventory */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenInventory();
          }}
          className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-emerald-400 shadow-xl backdrop-blur-md transition active:scale-95"
          title="Backpack Inventory"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-emerald-400 hidden sm:inline">
            Bag
          </span>
        </button>

        {/* Pets Companion */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            setIsPetSelectOpen(true);
          }}
          className="group flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 hover:border-sky-400 shadow-xl backdrop-blur-md transition active:scale-95"
          title="Pet Companion"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-950/70 border border-sky-500/40 text-sky-400 flex items-center justify-center group-hover:scale-105 transition">
            <PawPrint className="w-4 h-4" />
          </div>
          <span className="text-xs font-black text-white group-hover:text-sky-400 hidden sm:inline">
            Pet
          </span>
        </button>
      </div>

      {/* ========================================================
          4. BOTTOM LANDSCAPE DOCK (MODE SELECTION & GOLDEN START)
          ======================================================== */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-3 pointer-events-none"
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
          paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Bottom-Left: Compact Game Mode Selector */}
        <div
          onClick={() => {
            soundManager.playUiClick();
            setIsModeSelectOpen(true);
          }}
          className="pointer-events-auto cursor-pointer group bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 hover:border-emerald-400 px-3.5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md transition active:scale-95 flex items-center gap-2.5 max-w-[240px] sm:max-w-xs"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md group-hover:scale-105 transition shrink-0">
            <Compass className="w-5 h-5" />
          </div>

          <div className="text-left leading-tight truncate">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                ACTIVE
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase">
                {teamMode}
              </span>
            </div>
            <div className="text-xs font-black text-white group-hover:text-emerald-400 transition truncate">
              {activeModeConfig.title}
            </div>
          </div>
        </div>

        {/* Bottom-Right: Large Free Fire Style Golden START Button */}
        <div className="pointer-events-auto">
          <button
            onClick={handleStartPlay}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg tracking-widest uppercase shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-yellow-200"
          >
            <Play className="w-6 h-6 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <div className="text-left leading-tight">
              <div className="text-base sm:text-lg font-black tracking-widest">START</div>
              <div className="text-[9px] font-bold tracking-normal opacity-90">শুরু করুন</div>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          5. ROTATE PHONE PROMPT (PORTRAIT DETECTION OVERLAY)
          Shown only if held vertically so player rotates to landscape
          ======================================================== */}
      {isPortrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl text-center select-none pointer-events-auto animate-fade-in">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-2xl animate-pulse">
              <Smartphone className="w-10 h-10 rotate-90 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
              <RotateCw className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <h2 className="text-lg font-black text-white uppercase tracking-wider mb-1">
            PLEASE ROTATE DEVICE TO LANDSCAPE
          </h2>
          <div className="text-sm font-bold text-amber-400 mb-3">
            মোবাইলটি আড়াআড়ি (ল্যান্ডস্কেপ) করুন
          </div>
          <p className="text-xs text-slate-300 max-w-xs leading-relaxed mb-6">
            Dream World is an immersive 3D open-world game built for full-screen landscape gameplay.
          </p>

          <button
            onClick={requestLandscapeAndFullscreen}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-2xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition"
          >
            ENTER LANDSCAPE FULLSCREEN (ফুলস্ক্রিন খেলুন)
          </button>
        </div>
      )}

      {/* ========================================================
          6. MODULAR SUB-MODALS
          ======================================================== */}
      <ModeSelectModal
        isOpen={isModeSelectOpen}
        selectedMode={selectedMode}
        teamMode={teamMode}
        onSelectMode={(mode) => setSelectedMode(mode)}
        onSelectTeamMode={(tm) => setTeamMode(tm)}
        onClose={() => setIsModeSelectOpen(false)}
      />

      <PetSelectModal
        isOpen={isPetSelectOpen}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
        onClose={() => setIsPetSelectOpen(false)}
      />

      <FriendsSocialModal
        isOpen={isFriendsOpen}
        currentUser={user}
        currentRoom={currentRoom}
        onlineCount={onlineCount}
        onClose={() => setIsFriendsOpen(false)}
      />
    </div>
  );
};
