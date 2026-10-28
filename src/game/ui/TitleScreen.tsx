/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Play,
  Download,
  Sparkles,
  Compass,
  Users,
  Share2,
  Trophy,
  User,
  Scissors,
  Bell,
  Package,
  Settings as SettingsIcon,
  Wifi,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { authManager, PlayerAccount } from '../auth/authManager';
import { retentionManager } from '../pwa/retentionNotification';
import { NetworkConfig } from '../config/networkConfig';

interface TitleScreenProps {
  onStartGame: (mode: 'single' | 'multiplayer') => void;
  onOpenInstallModal: () => void;
  onOpenPublishGuide: () => void;
  onOpenLeaderboard: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenCharacterSelect: () => void;
  onOpenInventory?: () => void;
  onOpenSettings?: () => void;
  onOpenMultiplayer?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenInstallModal,
  onOpenPublishGuide,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenProfile,
  onOpenCharacterSelect,
  onOpenInventory,
  onOpenSettings,
  onOpenMultiplayer,
}) => {
  const [selectedMode, setSelectedMode] = useState<'single' | 'multiplayer'>('single');
  const [user, setUser] = useState<PlayerAccount | null>(authManager.getCurrentUser());
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [notificationsActive, setNotificationsActive] = useState<boolean>(retentionManager.isEnabled());

  useEffect(() => {
    const unsub = authManager.subscribe((acc) => setUser(acc));
    return () => unsub();
  }, []);

  // Poll server stats for real live player count from Render backend
  useEffect(() => {
    let isMounted = true;
    const fetchStats = () => {
      fetch(NetworkConfig.getApiUrl('/api/stats'))
        .then((res) => {
          if (!res.ok) throw new Error('status ' + res.status);
          return res.json();
        })
        .then((data) => {
          if (!isMounted) return;
          if (data && typeof data.totalOnline === 'number') {
            setOnlineCount(data.totalOnline);
            setServerStatus('online');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          setServerStatus('offline');
        });
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  const handleToggleNotifications = async () => {
    soundManager.playUiClick();
    if (!notificationsActive) {
      const granted = await retentionManager.requestPermission();
      setNotificationsActive(granted);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 md:p-7 select-none pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/20 overflow-y-auto">
      {/* ========================================================
          TOP BAR: LIVE SERVER STATUS, AUTH, LEADERBOARD, GUIDE
          ======================================================== */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Live Online Ticker */}
          <div className="flex items-center gap-2 bg-slate-950/80 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  serverStatus === 'online'
                    ? 'animate-ping bg-emerald-400'
                    : serverStatus === 'checking'
                    ? 'animate-pulse bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  serverStatus === 'online'
                    ? 'bg-emerald-500'
                    : serverStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-slate-400'
                }`}
              />
            </span>
            <span>
              {serverStatus === 'online'
                ? `${onlineCount} ONLINE · DHAKA HUB`
                : serverStatus === 'checking'
                ? 'CONNECTING TO DHAKA HUB...'
                : 'DHAKA HUB (RENDER SERVER)'}
            </span>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-amber-500/40 transition shadow"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Notifications Daily Alert Opt-In */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow ${
              notificationsActive
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Get alerts for new quests and co-op events"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{notificationsActive ? 'Alerts On' : 'Alerts'}</span>
          </button>

          {/* User Account / Profile Button */}
          {user ? (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/50 text-white text-xs font-bold transition shadow"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[90px] truncate">{user.displayName}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 text-xs font-bold transition shadow"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Settings Menu Button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenSettings();
              }}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition shadow"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          )}

          {/* Optional Install Game Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInstallModal();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-emerald-950 text-emerald-300 hover:text-emerald-200 text-xs font-bold border border-emerald-500/50 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CENTER: LOGO, MODE SELECTOR & PRIMARY PLAY ACTION
          ======================================================== */}
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-2xl mx-auto space-y-3.5 py-2">
        {/* Title Logo */}
        <div className="w-full max-w-sm sm:max-w-md">
          <svg viewBox="0 0 520 120" className="w-full h-auto drop-shadow-2xl">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <text
              x="260"
              y="68"
              textAnchor="middle"
              fontFamily="Impact, system-ui, sans-serif"
              fontSize="66"
              fontWeight="900"
              letterSpacing="6"
              fill="url(#titleGrad)"
            >
              DREAM WORLD
            </text>
            <text
              x="260"
              y="105"
              textAnchor="middle"
              fontFamily="'Segoe UI', Arial, sans-serif"
              fontSize="19"
              fontWeight="700"
              letterSpacing="6"
              fill="#e2e8f0"
            >
              স্বপ্নের ভুবন · 3D OPEN WORLD
            </text>
          </svg>
        </div>

        {/* Mode Selector: Single Player vs Online Multiplayer */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-700/80 shadow-lg backdrop-blur-xs">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setSelectedMode('single');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedMode === 'single'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Single Player (একক)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setSelectedMode('multiplayer');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedMode === 'multiplayer'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Online Co-Op (মাল্টিপ্লেয়ার)</span>
          </button>
        </div>

        {/* Primary PLAY NOW CTA */}
        <div className="pt-1 w-full max-w-xs sm:max-w-sm">
          <button
            onClick={() => {
              soundManager.resume();
              soundManager.playUiClick();
              onStartGame(selectedMode);
            }}
            className="w-full group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-slate-950 text-base font-black tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-emerald-300"
          >
            <Play className="w-5 h-5 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
            <span>PLAY NOW (এখনই খেলুন)</span>
            <Sparkles className="w-4 h-4 text-emerald-950" />
          </button>
        </div>
      </div>

      {/* ========================================================
          BOTTOM: LOBBY HUB BUTTONS (CHARACTER, INVENTORY, MULTIPLAYER)
          ======================================================== */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {/* Quick Lobby Feature Tabs */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenCharacterSelect();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Scissors className="w-3.5 h-3.5 text-emerald-400" />
            <span>Character & Loadout</span>
          </button>

          {onOpenInventory && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenInventory();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>Inventory / Backpack</span>
            </button>
          )}

          {onOpenMultiplayer && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenMultiplayer();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-sky-300 text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Multiplayer Rooms</span>
            </button>
          )}

          {onOpenProfile && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenProfile();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/80 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Profile</span>
            </button>
          )}
        </div>

        {/* Discreet Control Hint */}
        <div className="text-[10px] text-slate-400 font-mono tracking-wider">
          WASD Move · Shift Run · Space Jump · C Crouch · Z Prone · E Interact · F Drive · M Map
        </div>
      </div>
    </div>
  );
};
