/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Flame, X, User, Shield } from 'lucide-react';
import { PlayerAccount } from '../auth/authManager';
import { NetworkConfig } from '../config/networkConfig';

interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  taka: number;
  quests: number;
  isOnline: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  currentUser: PlayerAccount | null;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  currentUser,
  onClose,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'quests' | 'taka'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    fetch(NetworkConfig.getApiUrl('/api/leaderboard'))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.leaderboard) {
          setEntries(data.leaderboard);
        }
      })
      .catch(() => {
        // Fallback static rankings
        setEntries([
          { rank: 1, name: 'Tanvir_Pro', level: 24, taka: 45200, quests: 18, isOnline: true },
          { rank: 2, name: 'Afnan_Dhaka', level: 21, taka: 38900, quests: 15, isOnline: true },
          { rank: 3, name: 'Sadia_Rider', level: 19, taka: 31400, quests: 14, isOnline: false },
          { rank: 4, name: 'Sami_Bandarban', level: 17, taka: 26800, quests: 12, isOnline: true },
          { rank: 5, name: 'Farhan_Explorer', level: 15, taka: 21500, quests: 10, isOnline: false },
          { rank: 6, name: 'Nusrat_Chit', level: 14, taka: 18200, quests: 9, isOnline: false },
          { rank: 7, name: 'Rifat_Speed', level: 13, taka: 16500, quests: 8, isOnline: true },
          { rank: 8, name: 'Ananya_Dhaka', level: 11, taka: 14200, quests: 7, isOnline: true },
        ]);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const sorted = [...entries].sort((a, b) => {
    if (filter === 'quests') return b.quests - a.quests;
    if (filter === 'taka') return b.taka - a.taka;
    return b.level - a.level;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-white overflow-hidden flex flex-col max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white">Global Leaderboard</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Top adventurers across all Bangladeshi city servers & co-op sessions.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-4 border border-slate-700/60">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Level Ranking
          </button>
          <button
            onClick={() => setFilter('taka')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'taka'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wealthiest (৳ Taka)
          </button>
          <button
            onClick={() => setFilter('quests')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition ${
              filter === 'quests'
                ? 'bg-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quests Completed
          </button>
        </div>

        {/* User Rank Card if logged in */}
        {currentUser && (() => {
          const userRankIndex = sorted.findIndex(
            (entry) =>
              entry.name.toLowerCase() === currentUser.displayName.toLowerCase() ||
              (entry as { uid?: string }).uid === currentUser.uid
          );
          const userRankDisplay = userRankIndex !== -1 ? `#${userRankIndex + 1}` : 'Unranked';

          return (
            <div className="p-3 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                  YOU
                </span>
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    {currentUser.displayName}
                    <span className="text-[10px] text-emerald-400 font-mono">({currentUser.uid})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Level {currentUser.stats.level} • ৳{currentUser.stats.taka.toLocaleString()} • {currentUser.stats.questsCompleted} Quests
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Rank</span>
                <span className="text-base font-black text-white">{userRankDisplay}</span>
              </div>
            </div>
          );
        })()}

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading rankings...</div>
          ) : (
            sorted.map((p, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={p.name}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    rank === 1
                      ? 'bg-amber-950/40 border-amber-500/50 text-white'
                      : rank === 2
                      ? 'bg-slate-800/80 border-slate-600/60 text-white'
                      : rank === 3
                      ? 'bg-amber-950/20 border-amber-700/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rank Badge */}
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                      {rank === 1 && <Trophy className="w-5 h-5 text-amber-400" />}
                      {rank === 2 && <Medal className="w-5 h-5 text-slate-300" />}
                      {rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                      {rank > 3 && <span className="text-slate-400 font-bold">#{rank}</span>}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        {p.name}
                        {p.isOnline && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online Now" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Level {p.level}</span>
                        <span>•</span>
                        <span>{p.quests} Quests</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">৳{p.taka.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-medium">Accumulated Taka</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
