/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Users,
  Settings as SettingsIcon,
  Package,
  PawPrint,
  Maximize2,
  Compass,
  Smartphone,
  RotateCw,
  ShoppingBag,
  Gift,
  Mail,
  Trophy,
  Wifi,
  Plus,
  Crosshair,
  Crown,
  Flame,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Lobby3DCanvas, AnyLobbyPetType } from './Lobby3DCanvas';
import { PetToyAccessory } from '../character/TeddyBearCompanion';
import { FriendsSocialModal } from './FriendsSocialModal';
import { ShopModal } from './ShopModal';
import { EventsModal } from './EventsModal';
import { GameNewsModal } from './GameNewsModal';
import { CrazyMapModal } from './CrazyMapModal';
import { MapSelectModal } from './MapSelectModal';
import { DiamondStoreModal } from './DiamondStoreModal';
import { WeaponLoadoutModal } from './WeaponLoadoutModal';
import { PetSelectModal } from './PetSelectModal';
import { soundManager } from '../audio/soundManager';
import { authManager, PlayerAccount } from '../auth/authManager';
import { CharacterAppearance } from '../character/characterModel';
import { PlayerStats } from '../types';
import { NetworkConfig } from '../config/networkConfig';

export type TeamModeType = 'solo' | 'duo' | 'squad';

interface GameLobbyProps {
  appearance: CharacterAppearance;
  playerStats: PlayerStats;
  currentRoom?: string;
  onStartGame: (mode: 'single' | 'multiplayer', mapId?: string) => void;
  onOpenCharacterSelect: () => void;
  onOpenInventory: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard?: () => void;
  onOpenStats?: () => void;
  onOpenRankings?: () => void;
  onOpenChat?: () => void;
  onOpenInstallModal?: () => void;
  onOpenPublishGuide?: () => void;
  onLaunchCyberTesla?: () => void;
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
  onOpenLeaderboard = () => {},
  onLaunchCyberTesla = () => {},
}) => {
  // Lobby State
  const [user, setUser] = useState<PlayerAccount | null>(authManager.getCurrentUser());
  const [selectedPet, setSelectedPet] = useState<AnyLobbyPetType>(() => {
    try {
      const saved = localStorage.getItem('dream_active_pet_companion') as AnyLobbyPetType;
      return saved && ['aero_drone', 'cyber_neon', 'classic_honey', 'panda_bear', 'golden_hero', 'tiger_cub'].includes(saved)
        ? saved
        : 'cyber_neon';
    } catch {
      return 'cyber_neon';
    }
  });

  const [petAccessory, setPetAccessory] = useState<PetToyAccessory>('toy_blaster');
  const [selectedWeapon, setSelectedWeapon] = useState<string>('cyber_blaster_neon');
  const [selectedWorldMap, setSelectedWorldMap] = useState<string>('bangladesh_open_world');
  const [teamMode, setTeamMode] = useState<TeamModeType>('squad');
  const [onlineCount, setOnlineCount] = useState<number>(50);
  const [playerCoins, setPlayerCoins] = useState<number>(() => Math.max(playerStats.money, 2350));
  const [playerDiamonds, setPlayerDiamonds] = useState<number>(100);

  // Screen orientation
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [orientationLocked, setOrientationLocked] = useState<boolean>(false);

  // Sub-modal states
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isWeaponModalOpen, setIsWeaponModalOpen] = useState(false);
  const [isCrazyMapModalOpen, setIsCrazyMapModalOpen] = useState(false);
  const [isMapSelectModalOpen, setIsMapSelectModalOpen] = useState(false);
  const [isDiamondStoreOpen, setIsDiamondStoreOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
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

    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' } as FullscreenOptions);
      }
    } catch {}

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
    } catch {}

    setOrientationLocked(locked);
    setTimeout(checkOrientation, 250);
  }, [checkOrientation]);

  useEffect(() => {
    checkOrientation();
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

  // Server capacity: 50 players preserved
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
            setOnlineCount(Math.max(1, data.totalOnline));
          }
        })
        .catch(() => {});
    };

    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSelectPet = (pet: AnyLobbyPetType) => {
    setSelectedPet(pet);
    localStorage.setItem('dream_active_pet_companion', pet);
    localStorage.setItem('dream_active_teddy', pet);
  };

  const handleStartPlay = () => {
    soundManager.resume();
    soundManager.playCollectCoin();
    requestLandscapeAndFullscreen();
    onStartGame(teamMode === 'solo' ? 'single' : 'multiplayer', selectedWorldMap);
  };

  const handleClaimReward = (amt: number) => {
    setPlayerCoins((prev) => prev + amt);
  };

  const handleBuyItem = (cost: number) => {
    setPlayerCoins((prev) => Math.max(0, prev - cost));
  };

  const playerName = user?.displayName || 'DreamerBoy';
  const playerUid = (user?.uid || '12345678').substring(0, 8);
  const playerLv = playerStats.level || 12;

  return (
    <div
      className="fixed inset-0 w-full h-full overflow-hidden select-none pointer-events-auto bg-slate-950 font-sans"
      style={{ touchAction: 'none' }}
    >
      {/* ========================================================
          1. 3D LOBBY VIEWPORT WITH STATIC GROUND & HERO ROTATOR
          (Ground does NOT rotate under character's boots!)
          ======================================================== */}
      <Lobby3DCanvas
        appearance={appearance}
        petType={selectedPet}
        petAccessory={petAccessory}
      />

      {/* Subtle Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-slate-950/5 to-slate-950/60" />

      {/* ========================================================
          2. COMPACT TOP BAR (SLEEK PROFILE, COINS, DIAMONDS, ICONS)
          Minimalist, low-profile, AAA mobile game aesthetic
          ======================================================== */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between pointer-events-none"
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
          paddingTop: 'max(0.35rem, env(safe-area-inset-top))',
        }}
      >
        {/* Left Side: Micro Profile Pill + Compact Currencies */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Micro Profile Pill */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              onOpenProfile();
            }}
            className="group cursor-pointer relative flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
          >
            {/* Crown */}
            <div className="absolute -top-1.5 -left-0.5 text-amber-400">
              <Crown className="w-3 h-3 fill-amber-400 stroke-amber-200" />
            </div>

            {/* Avatar Circle */}
            <div className="relative">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-[10px] shadow border border-cyan-300/40">
                {playerName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Player Details */}
            <div className="text-left leading-tight pr-1">
              <div className="text-[10px] font-black text-white group-hover:text-amber-400 transition max-w-[90px] truncate">
                {playerName}
              </div>
              <div className="text-[8px] text-amber-300/90 font-bold">
                Lv.{playerLv} <span className="text-slate-400 font-mono text-[7px]">UID:{playerUid}</span>
              </div>
            </div>
          </div>

          {/* Micro Coins Pill */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-amber-500/40 shadow backdrop-blur-md">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-[8px] shadow">
              ৳
            </div>
            <span className="text-[10px] font-black text-amber-300 font-mono">
              {playerCoins.toLocaleString()}
            </span>
          </div>

          {/* Micro Diamonds Pill with '+' Store Button */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              setIsDiamondStoreOpen(true);
            }}
            className="flex items-center gap-1 pl-2 pr-0.5 py-0.5 rounded-full bg-slate-950/80 border border-cyan-500/50 hover:border-cyan-400 shadow backdrop-blur-md cursor-pointer transition active:scale-95 group"
            title="Open Diamond Vault"
          >
            <span className="text-cyan-400 text-[10px]">💎</span>
            <span className="text-[10px] font-black text-cyan-300 font-mono mr-0.5">
              {playerDiamonds}
            </span>
            <div className="w-4 h-4 rounded-full bg-cyan-500 group-hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow transition">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Right Side: Ultra-Compact Utilities */}
        <div className="flex items-center gap-1 pointer-events-auto">
          {/* Trophy */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenLeaderboard();
            }}
            className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-amber-400 border border-slate-700/80 shadow backdrop-blur-md flex items-center justify-center transition active:scale-95"
            title="Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>

          {/* Friends Counter */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsFriendsOpen(true);
            }}
            className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-cyan-400 border border-slate-700/80 shadow backdrop-blur-md flex items-center justify-center transition active:scale-95 relative"
            title="Friends"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 px-1 py-0.1 rounded-full bg-emerald-500 text-slate-950 font-black text-[7px] shadow">
              {onlineCount}
            </span>
          </button>

          {/* Mail */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsNewsModalOpen(true);
            }}
            className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 shadow backdrop-blur-md flex items-center justify-center transition active:scale-95 relative"
            title="Game News"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={requestLandscapeAndFullscreen}
            className="w-7 h-7 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 shadow backdrop-blur-md flex items-center justify-center transition active:scale-95"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Wifi Signal Indicator */}
          <div
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-emerald-400"
            title="Ping: 28ms (Excellent)"
          >
            <Wifi className="w-3 h-3" />
            <span className="text-[7px] font-mono font-bold hidden sm:inline">28ms</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. COMPACT LEFT COLUMN: MULTIPLAYER & MAPS WIDGETS
          Ultra-compact footprint so center character is wide open!
          ======================================================== */}
      <div
        className="absolute left-0 top-12 sm:top-14 z-20 flex flex-col gap-1.5 pointer-events-none"
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        }}
      >
        {/* COMPACT MULTIPLAYER PANEL */}
        <div className="pointer-events-auto p-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/60 shadow-lg backdrop-blur-md w-44 sm:w-48 transition-all">
          <div className="flex items-center gap-1 mb-1 pb-1 border-b border-slate-800/80">
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] font-black text-white uppercase tracking-wider">
              MULTIPLAYER
            </span>
            <span className="text-[8px] font-bold text-amber-400 ml-auto">
              Play Together
            </span>
          </div>

          {/* Mode Switcher Buttons: Solo / Duo / Squad (50-player capacity preserved) */}
          <div className="grid grid-cols-3 gap-1">
            {/* Solo */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                setTeamMode('solo');
              }}
              className={`py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition text-center ${
                teamMode === 'solo'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="text-[8px] font-bold leading-tight">Solo</span>
              <span className={`text-[7px] font-mono ${teamMode === 'solo' ? 'text-slate-950' : 'text-slate-400'}`}>
                1 Online
              </span>
            </button>

            {/* Duo */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                setTeamMode('duo');
              }}
              className={`py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition text-center ${
                teamMode === 'duo'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="text-[8px] font-bold leading-tight">Duo</span>
              <span className={`text-[7px] font-mono ${teamMode === 'duo' ? 'text-slate-950' : 'text-slate-400'}`}>
                2 Online
              </span>
            </button>

            {/* Squad (50-player capacity) */}
            <button
              onClick={() => {
                soundManager.playUiClick();
                setTeamMode('squad');
              }}
              className={`py-1 px-0.5 rounded-lg flex flex-col items-center justify-center transition text-center ${
                teamMode === 'squad'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="text-[8px] font-bold leading-tight">Squad</span>
              <span className={`text-[7px] font-mono font-bold ${teamMode === 'squad' ? 'text-slate-950' : 'text-emerald-400'}`}>
                50 Online
              </span>
            </button>
          </div>
        </div>

        {/* ULTRA-COMPACT MAPS WIDGET */}
        <div
          onClick={() => {
            soundManager.playUiClick();
            setIsMapSelectModalOpen(true);
          }}
          className="pointer-events-auto cursor-pointer group p-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/60 hover:border-amber-400 shadow-lg backdrop-blur-md w-44 sm:w-48 transition-all active:scale-95 flex items-center justify-between"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-600 to-emerald-600 flex items-center justify-center text-white shrink-0">
              <Compass className="w-3 h-3 text-amber-300" />
            </div>
            <div className="leading-tight truncate">
              <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider block">
                MAPS
              </span>
              <span className="text-[8px] font-bold text-slate-300 group-hover:text-white truncate block">
                Explore Worlds
              </span>
            </div>
          </div>

          <div className="w-5 h-5 rounded-md bg-amber-400 group-hover:bg-amber-300 text-slate-950 flex items-center justify-center font-black shadow shrink-0">
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          4. RIGHT SIDE DOCK (COMPACT SHOP, FRIENDS, EVENTS)
          ======================================================== */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5 pointer-events-auto"
        style={{
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        }}
      >
        {/* Shop */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            setIsShopModalOpen(true);
          }}
          className="group flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 hover:border-amber-400 shadow backdrop-blur-md transition active:scale-95 text-amber-400"
          title="Shop"
        >
          <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black text-white leading-none mt-0.5">Shop</span>
        </button>

        {/* Friends */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            setIsFriendsOpen(true);
          }}
          className="group flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/50 hover:border-cyan-400 shadow backdrop-blur-md transition active:scale-95 text-cyan-400"
          title="Friends"
        >
          <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black text-white leading-none mt-0.5">Friends</span>
        </button>

        {/* Events */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            setIsEventsModalOpen(true);
          }}
          className="group flex flex-col items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-yellow-500/50 hover:border-yellow-400 shadow backdrop-blur-md transition active:scale-95 text-yellow-400"
          title="Events"
        >
          <Gift className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black text-white leading-none mt-0.5">Events</span>
        </button>
      </div>

      {/* ========================================================
          5. BOTTOM BAR:
          - Far-Left: Settings Icon (Message box completely removed!)
          - Center: Sleek Compact Tabs (Character, Weapon, Pet, Inventory)
          - Bottom-Right: CRAZY MAP directly ABOVE the START button!
          ======================================================== */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between gap-2 pointer-events-none"
        style={{
          paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
          paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
          paddingBottom: 'max(0.45rem, env(safe-area-inset-bottom))',
        }}
      >
        {/* Bottom Left: Clean Settings Button (as requested: "রবি থেকে মেসেজ বক্স সরিয়ে ফেলা বাম পাশে নিচে যে আছে সেটিং আইকন একটা রাখো") */}
        <div className="pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenSettings();
            }}
            className="w-8 h-8 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg backdrop-blur-md flex items-center justify-center transition active:scale-95 group"
            title="Game Settings"
          >
            <SettingsIcon className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* Center: Slim Nav Tabs (Character, Weapon, Pet, Inventory) */}
        <div className="pointer-events-auto flex items-center gap-1 p-0.5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-lg backdrop-blur-md">
          {/* Character */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenCharacterSelect();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-amber-400 transition text-[9px] font-black uppercase"
          >
            <User className="w-3 h-3" />
            <span className="hidden sm:inline">Character</span>
          </button>

          {/* Weapon */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsWeaponModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-amber-400 transition text-[9px] font-black uppercase"
          >
            <Crosshair className="w-3 h-3" />
            <span className="hidden sm:inline">Weapon</span>
          </button>

          {/* Pet */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              setIsPetModalOpen(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-cyan-400 transition text-[9px] font-black uppercase"
          >
            <PawPrint className="w-3 h-3" />
            <span className="hidden sm:inline">Pet</span>
          </button>

          {/* Inventory */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInventory();
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-emerald-400 transition text-[9px] font-black uppercase"
          >
            <Package className="w-3 h-3" />
            <span className="hidden sm:inline">Inventory</span>
          </button>
        </div>

        {/* Bottom Right: CRAZY MAP directly ABOVE the START button! (as requested: "ক্রেজি ম্যাপ স্টার্ট বাটন এর উপরে থাকবে") */}
        <div className="pointer-events-auto flex flex-col items-end gap-1">
          {/* CRAZY MAP Widget (Positioned ABOVE Start button) */}
          <div
            onClick={() => {
              soundManager.playUiClick();
              setIsCrazyMapModalOpen(true);
            }}
            className="cursor-pointer group flex flex-col p-1 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-amber-500/70 hover:border-amber-400 shadow-lg backdrop-blur-md transition-all active:scale-95 w-36 sm:w-44"
            title="Crazy Maps Arcade"
          >
            {/* Header with Arrow */}
            <div className="flex items-center justify-between px-1 mb-0.5">
              <span className="text-[8px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 fill-amber-400" /> CRAZY MAP
              </span>
              <ChevronRight className="w-3 h-3 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            </div>

            {/* 5-Game Thumbnail Collage Strip */}
            <div className="flex items-center gap-0.5 h-6 rounded-md overflow-hidden border border-slate-700/60 bg-slate-900 p-0.5">
              {/* Card 1: Battle Royale */}
              <div className="flex-1 h-full rounded bg-gradient-to-t from-orange-600 to-amber-500 flex items-center justify-center text-[6px] font-black text-white shadow">
                BR
              </div>
              {/* Card 2: Cyber EV */}
              <div className="flex-1 h-full rounded bg-gradient-to-t from-cyan-600 to-blue-500 flex items-center justify-center text-[6px] font-black text-white shadow">
                EV
              </div>
              {/* Card 3: Parkour */}
              <div className="flex-1 h-full rounded bg-gradient-to-t from-purple-600 to-pink-500 flex items-center justify-center text-[6px] font-black text-white shadow">
                PK
              </div>
              {/* Card 4: Soccer */}
              <div className="flex-1 h-full rounded bg-gradient-to-t from-emerald-600 to-teal-500 flex items-center justify-center text-[6px] font-black text-white shadow">
                ⚽
              </div>
              {/* Card 5: Sphere */}
              <div className="flex-1 h-full rounded bg-gradient-to-t from-blue-700 to-indigo-600 flex items-center justify-center text-[6px] font-black text-white shadow">
                ⚪
              </div>
            </div>
          </div>

          {/* START > Button (Positioned directly UNDER Crazy Map) */}
          <button
            onClick={handleStartPlay}
            className="group relative inline-flex items-center justify-center gap-1.5 px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-yellow-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-yellow-200 w-36 sm:w-44"
          >
            <span className="font-black italic tracking-wider drop-shadow">
              START
            </span>
            <ChevronRight className="w-5 h-5 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ========================================================
          6. ROTATE PHONE PROMPT (PORTRAIT DETECTION OVERLAY)
          ======================================================== */}
      {isPortrait && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl text-center select-none pointer-events-auto animate-fade-in">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-2xl animate-pulse">
              <Smartphone className="w-8 h-8 rotate-90 transition-transform duration-700" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
              <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>

          <h2 className="text-base font-black text-white uppercase tracking-wider mb-1">
            PLEASE ROTATE DEVICE TO LANDSCAPE
          </h2>
          <div className="text-xs font-bold text-amber-400 mb-2">
            মোবাইলটি আড়াআড়ি (ল্যান্ডস্কেপ) করুন
          </div>
          <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed mb-4">
            Dream World is designed for full-screen landscape gameplay.
          </p>

          <button
            onClick={requestLandscapeAndFullscreen}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition"
          >
            ENTER LANDSCAPE (ফুলস্ক্রিন)
          </button>
        </div>
      )}

      {/* ========================================================
          7. ALL INTEGRATED MODALS
          ======================================================== */}
      <PetSelectModal
        isOpen={isPetModalOpen}
        selectedPet={selectedPet}
        onSelectPet={handleSelectPet}
        onClose={() => setIsPetModalOpen(false)}
      />

      <WeaponLoadoutModal
        isOpen={isWeaponModalOpen}
        selectedWeapon={selectedWeapon}
        onSelectWeapon={(w) => setSelectedWeapon(w)}
        onClose={() => setIsWeaponModalOpen(false)}
      />

      <CrazyMapModal
        isOpen={isCrazyMapModalOpen}
        onClose={() => setIsCrazyMapModalOpen(false)}
        onLaunchCyberTesla={() => {
          setIsCrazyMapModalOpen(false);
          onLaunchCyberTesla();
        }}
      />

      <MapSelectModal
        isOpen={isMapSelectModalOpen}
        selectedMapId={selectedWorldMap}
        onSelectMap={(id) => setSelectedWorldMap(id)}
        onClose={() => setIsMapSelectModalOpen(false)}
      />

      <DiamondStoreModal
        isOpen={isDiamondStoreOpen}
        currentDiamonds={playerDiamonds}
        onClose={() => setIsDiamondStoreOpen(false)}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        playerMoney={playerCoins}
        onBuyItem={handleBuyItem}
        onClose={() => setIsShopModalOpen(false)}
      />

      <EventsModal
        isOpen={isEventsModalOpen}
        onClaimReward={handleClaimReward}
        onClose={() => setIsEventsModalOpen(false)}
      />

      <GameNewsModal
        isOpen={isNewsModalOpen}
        onClose={() => setIsNewsModalOpen(false)}
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
