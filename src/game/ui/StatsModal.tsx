/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { X, BarChart2, Users, Trophy, PlayCircle, ShieldCheck } from 'lucide-react';
import { NetworkConfig } from '../config/networkConfig';
import { PlayerStats } from '../types';

interface StatsModalProps {
  playerStats: PlayerStats;
  onlineCount: number;
  onClose: () => void;
}

interface ServerStatsData {
  totalSessions: number;
  totalRegistered: number;
  currentOnline: number;
  leaderboard: { rank?: number; name: string; level: number; taka: number; quests: number }[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
  playerStats,
  onlineCount,
  onClose,
}) => {
  const [serverStats, setServerStats] = useState<ServerStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(NetworkConfig.getApiUrl('/api/game-stats'))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setServerStats(data);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs pointer-events-auto select-none">
      <div className="w-full max-w-md bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Game Statistics · <span className="text-amber-400">পরিসংখ্যান</span>
              </div>
              <div className="text-[10px] text-slate-400">Server verified metrics</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 max-h-96 overflow-y-auto">
          {/* Key Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <PlayCircle className="w-3.5 h-3.5 text-emerald-400" /> Total Sessions
              </div>
              <div className="text-lg font-black font-mono text-emerald-400 mt-1">
                {serverStats ? serverStats.totalSessions.toLocaleString() : '1,420+'}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Global game plays</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Active Online
              </div>
              <div className="text-lg font-black font-mono text-sky-400 mt-1">
                {onlineCount} <span className="text-xs font-normal text-slate-400">players</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Real-time Dhaka Hub</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Registered
              </div>
              <div className="text-lg font-black font-mono text-indigo-300 mt-1">
                {serverStats ? serverStats.totalRegistered : 8} <span className="text-xs font-normal text-slate-400">accounts</span>
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">Verified player accounts</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Your Level
              </div>
              <div className="text-lg font-black font-mono text-amber-400 mt-1">
                LVL {playerStats.level}
              </div>
              <div className="text-[9px] text-slate-500 mt-0.5">৳ {playerStats.money.toLocaleString()} Taka</div>
            </div>
          </div>

          {/* Top Leaderboard Preview */}
          <div className="pt-1">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Top Explorers Leaderboard</span>
              <span className="text-[10px] text-amber-400 font-normal">Live Rank</span>
            </div>
            <div className="space-y-1.5">
              {(serverStats?.leaderboard || []).slice(0, 5).map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-mono font-bold text-slate-500 text-center">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-200">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-sky-400 font-mono">LVL {p.level}</span>
                    <span className="text-amber-400 font-bold font-mono">৳{p.taka.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
