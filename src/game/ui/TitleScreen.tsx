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
  ShieldCheck,
  Users,
  Share2,
  Trophy,
  User,
  Scissors,
  Bell,
  Wifi,
  CheckCircle2,
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
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenInstallModal,
  onOpenPublishGuide,
  onOpenLeaderboard,
  onOpenAuth,
  onOpenProfile,
  onOpenCharacterSelect,
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

  // Poll server stats for real live player count
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
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-3 sm:p-6 md:p-8 select-none pointer-events-auto bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30 overflow-y-auto">
      {/* Top Banner: Status, Auth, Leaderboard, and Share */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Live Online Ticker */}
          <div className="flex items-center gap-2 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-xs">
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
                ? `${onlineCount} ACTIVE ONLINE · DHAKA HUB`
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/40 transition shadow"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Notifications Daily Alert Opt-In */}
          <button
            onClick={handleToggleNotifications}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow ${
              notificationsActive
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Get alerts for new quests and co-op events"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationsActive ? 'Alerts On' : 'Enable Daily Alerts'}</span>
          </button>

          {/* User Account / Profile Button */}
          {user ? (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenProfile();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-emerald-500/50 text-white text-xs font-bold transition shadow"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{user.displayName}</span>
              <span className="text-[10px] text-emerald-400 font-mono">({user.uid})</span>
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
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Publish & Share Guide */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenPublishGuide();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition shadow"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Install Game Button */}
          <button
            onClick={() => {
              soundManager.playUiClick();
              onOpenInstallModal();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-800/90 hover:bg-emerald-950 text-emerald-300 hover:text-emerald-200 text-xs font-bold border border-emerald-500/50 transition shadow"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Install</span>
          </button>
        </div>
      </div>

      {/* Center: Bangladeshi Character & Map Logo Lockup */}
      <div className="flex flex-col items-center justify-center text-center my-auto max-w-3xl mx-auto space-y-4 py-3">
        {/* Bespoke Logo with Bangladesh Map, River Bridge & Character Silhouette */}
        <div className="w-full max-w-md">
          <svg viewBox="0 0 520 125" className="w-full h-auto drop-shadow-2xl">
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
              x="260"
              y="68"
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
              x="260"
              y="108"
              textAnchor="middle"
              fontFamily="'Segoe UI', Arial, sans-serif"
              fontSize="20"
              fontWeight="700"
              letterSpacing="7"
              fill="#e2e8f0"
            >
              স্বপ্নের ভুবন · 3D ADVENTURE
            </text>
          </svg>
        </div>

        <p className="text-slate-200 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed drop-shadow-md">
          Continuous open-world Bangladesh: vibrant Dhanmondi avenues, tea stalls, flyovers, Padma bridge, lush green villages, and Sylhet waterfalls.
        </p>

        {/* Character Customizer Quick CTA */}
        <button
          onClick={() => {
            soundManager.playUiClick();
            onOpenCharacterSelect();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg transition active:scale-95"
        >
          <Scissors className="w-3.5 h-3.5 text-emerald-400" />
          <span>Customize Character (চরিত্র নির্বাচন ও সাজসজ্জা)</span>
        </button>

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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-md">
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
