/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Users, Mic, MicOff, Volume2 } from 'lucide-react';

export interface PlayerInfo {
  id: string;
  name: string;
  isSelf: boolean;
  isOnline: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}

interface PlayerListModalProps {
  roomName: string;
  players: PlayerInfo[];
  onClose: () => void;
}

export const PlayerListModal: React.FC<PlayerListModalProps> = ({
  roomName,
  players,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs pointer-events-auto select-none">
      <div className="w-full max-w-sm bg-slate-950/95 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Room Players ({players.length})
              </div>
              <div className="text-[10px] text-emerald-400 font-mono font-medium">{roomName}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player List */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                p.isSelf
                  ? 'bg-emerald-950/40 border-emerald-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar with talking pulse ring */}
                <div className="relative">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md ${
                      p.isSelf ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  {p.isSpeaking && (
                    <span className="absolute -inset-1 rounded-2xl border-2 border-emerald-400 animate-ping opacity-75" />
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    {p.name}
                    {p.isSelf && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Active in room</span>
                  </div>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1 text-slate-400">
                {p.isSpeaking && <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
                {p.isMuted ? (
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
