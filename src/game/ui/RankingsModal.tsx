/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Clock, Swords, RefreshCw, Crown, User, ShieldCheck } from 'lucide-react';
import { NetworkConfig } from '../config/networkConfig';
import { PlayerAccount } from '../auth/authManager';
import { PlayerStats } from '../types';
import { soundManager } from '../audio/soundManager';

export interface PlaytimeLeaderboardEntry {
  rank: number;
  uid?: string;
  name: string;
  totalSeconds: number;
  formattedTime: string;
  isOnline: boolean;
  isSelf?: boolean;
}

export interface CompetitiveLeaderboardEntry {
  rank: number;
  uid?: string;
  name: string;
  score: number;
  level: number;
  quests: number;
  taka: number;
  isOnline: boolean;
  isSelf?: boolean;
}

interface RankingsModalProps {
  currentUser: PlayerAccount | null;
  playerStats: PlayerStats;
  currentPlaytimeSeconds: number;
  onClose: () => void;
}

/**
 * Helper to format seconds as e.g. "1h 24m 36s" or "42m 18s"
 */
export function formatPlaytime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remS = s % 60;

  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m ${remS.toString().padStart(2, '0')}s`;
  }
  return `${m}m ${remS.toString().padStart(2, '0')}s`;
}

export const RankingsModal: React.FC<RankingsModalProps> = ({
  currentUser,
  playerStats,
  currentPlaytimeSeconds,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'playtime' | 'competitive'>('playtime');

  // Playtime ranking state
  const [playtimeList, setPlaytimeList] = useState<PlaytimeLeaderboardEntry[]>([]);
  const [playtimeLoading, setPlaytimeLoading] = useState(true);
  const [playtimeError, setPlaytimeError] = useState<string | null>(null);

  // Competitive ranking state
  const [competitiveList, setCompetitiveList] = useState<CompetitiveLeaderboardEntry[]>([]);
  const [competitiveLoading, setCompetitiveLoading] = useState(true);
  const [competitiveError, setCompetitiveError] = useState<string | null>(null);
  const [lastCompetitiveUpdate, setLastCompetitiveUpdate] = useState<string>('');

  const competitiveTimerRef = useRef<number | null>(null);

  // Fetch Playtime Rankings
  const fetchPlaytime = async () => {
    setPlaytimeLoading(true);
    setPlaytimeError(null);
    try {
      const uid = currentUser?.uid || 'guest';
      const name = currentUser?.displayName || 'Explorer';
      const res = await fetch(NetworkConfig.getApiUrl(`/api/rankings/playtime?uid=${uid}&name=${encodeURIComponent(name)}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.leaderboard)) {
        setPlaytimeList(data.leaderboard);
      }
    } catch {
      setPlaytimeError('Unable to sync live playtime records.');
    } finally {
      setPlaytimeLoading(false);
    }
  };

  // Fetch Competitive Rankings (Two-minute refresh requirement)
  const fetchCompetitive = async () => {
    setCompetitiveLoading(true);
    setCompetitiveError(null);
    try {
      const uid = currentUser?.uid || 'guest';
      const name = currentUser?.displayName || 'Explorer';
      const res = await fetch(NetworkConfig.getApiUrl(`/api/rankings/competitive?uid=${uid}&name=${encodeURIComponent(name)}`));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.leaderboard)) {
        setCompetitiveList(data.leaderboard);
        setLastCompetitiveUpdate(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch {
      setCompetitiveError('Unable to reach competitive server.');
    } finally {
      setCompetitiveLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaytime();
    fetchCompetitive();

    // Auto-refresh Competitive Leaderboard every TWO MINUTES (120,000 ms)
    competitiveTimerRef.current = window.setInterval(() => {
      fetchCompetitive();
    }, 120000);

    return () => {
      if (competitiveTimerRef.current) {
        clearInterval(competitiveTimerRef.current);
      }
    };
  }, [currentUser]);

  // Derive Current Player Stats
  const selfPlaytimeSeconds = currentPlaytimeSeconds;
  const selfPlaytimeFormatted = formatPlaytime(selfPlaytimeSeconds);
  const selfCompetitiveScore = Math.floor(
    (playerStats.level * 250) + Math.floor(playerStats.money / 100) + 1200,
  );

  // Leading Players
  const leadingPlaytimePlayer = playtimeList.length > 0 ? playtimeList[0] : null;
  const leadingCompetitivePlayer = competitiveList.length > 0 ? competitiveList[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs pointer-events-auto select-none">
      <div className="w-full max-w-lg bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Player Rankings · <span className="text-amber-400">প্লেয়ার র‍্যাঙ্কিং</span>
              </div>
              <div className="text-[10px] text-slate-400">Official Dream World Global Standings</div>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-2 gap-2 bg-slate-900/50 border-b border-slate-800/80">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('playtime');
            }}
            className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'playtime'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Playtime Ranking</span>
          </button>
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('competitive');
            }}
            className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'competitive'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Competitive Ranking</span>
          </button>
        </div>

        {/* Tab 1: Playtime Ranking View */}
        {activeTab === 'playtime' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Highlights Card */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Current Player's Accumulated Playtime */}
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase">
                  <User className="w-3.5 h-3.5 text-amber-400" /> Your Accumulated Time
                </div>
                <div className="text-base font-black font-mono text-amber-400 mt-1 tabular-nums">
                  {selfPlaytimeFormatted}
                </div>
                <div className="text-[9px] text-amber-200/70 mt-0.5">Active session recorded</div>
              </div>

              {/* Leading Playtime Player */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Leading Explorer
                </div>
                <div className="text-sm font-bold text-slate-100 truncate mt-1">
                  {leadingPlaytimePlayer ? leadingPlaytimePlayer.name : 'Sadia_Rider'}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold tabular-nums">
                  {leadingPlaytimePlayer ? leadingPlaytimePlayer.formattedTime : '14h 32m 45s'}
                </div>
              </div>
            </div>

            {/* List Header */}
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-1">
              <span>Explorer</span>
              <span>Accumulated Playtime</span>
            </div>

            {playtimeLoading && (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Syncing playtime data...</span>
              </div>
            )}

            {playtimeError && (
              <div className="text-center text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5">
                {playtimeError}
              </div>
            )}

            {/* Scrollable Leaderboard Table */}
            <div className="space-y-1.5">
              {playtimeList.map((player) => {
                const isFirst = player.rank === 1;
                const isTopThree = player.rank <= 3;
                return (
                  <div
                    key={player.rank + player.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-2xl border transition-all ${
                      player.isSelf
                        ? 'bg-amber-950/40 border-amber-500/50'
                        : isFirst
                        ? 'bg-slate-900/90 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-black ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950'
                            : isTopThree
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {player.name}
                          {player.isSelf && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 rounded font-mono">
                              YOU
                            </span>
                          )}
                          {isFirst && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                      {player.formattedTime}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Competitive Ranking View */}
        {activeTab === 'competitive' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Highlights Card */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Current Player's Competitive Standing */}
              <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-300 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Your Competitive Score
                </div>
                <div className="text-base font-black font-mono text-indigo-300 mt-1 tabular-nums">
                  {selfCompetitiveScore.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">PTS</span>
                </div>
                <div className="text-[9px] text-indigo-200/70 mt-0.5">LVL {playerStats.level} · ৳ {playerStats.money}</div>
              </div>

              {/* Leading Competitive Player */}
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Ranked #1 Master
                </div>
                <div className="text-sm font-bold text-slate-100 truncate mt-1">
                  {leadingCompetitivePlayer ? leadingCompetitivePlayer.name : 'Tanvir_Pro'}
                </div>
                <div className="text-[10px] font-mono text-indigo-400 font-bold tabular-nums">
                  {leadingCompetitivePlayer ? leadingCompetitivePlayer.score.toLocaleString() : '18,500'} PTS
                </div>
              </div>
            </div>

            {/* Refresh Banner (Two-Minute Auto Refresh) */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/40 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Refreshes every 2 minutes · Last updated: {lastCompetitiveUpdate || 'Just now'}</span>
              </span>
              <button
                onClick={fetchCompetitive}
                disabled={competitiveLoading}
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
              >
                <RefreshCw className={`w-3 h-3 ${competitiveLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {competitiveLoading && (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Retrieving competitive scores...</span>
              </div>
            )}

            {competitiveError && (
              <div className="text-center text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 rounded-xl p-2.5">
                {competitiveError}
              </div>
            )}

            {/* Scrollable Leaderboard Table */}
            <div className="space-y-1.5">
              {competitiveList.map((player) => {
                const isFirst = player.rank === 1;
                const isTopThree = player.rank <= 3;
                return (
                  <div
                    key={player.rank + player.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-2xl border transition-all ${
                      player.isSelf
                        ? 'bg-indigo-950/40 border-indigo-500/50'
                        : isFirst
                        ? 'bg-slate-900/90 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-black ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950'
                            : isTopThree
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {player.rank}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          {player.name}
                          {player.isSelf && (
                            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded font-mono">
                              YOU
                            </span>
                          )}
                          {isFirst && <Crown className="w-3 h-3 text-amber-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
                          <span>LVL {player.level}</span>
                          <span>·</span>
                          <span>{player.quests} quests</span>
                          <span>·</span>
                          <span className="text-amber-400">৳{player.taka}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-black text-indigo-400 tabular-nums">
                      {player.score.toLocaleString()}{' '}
                      <span className="text-[9px] font-normal text-slate-400">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
