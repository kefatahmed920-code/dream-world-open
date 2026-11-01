/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Users, UserPlus, Copy, Check, Search, Globe, Shield, Wifi } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { PlayerAccount } from '../auth/authManager';

interface FriendsSocialModalProps {
  isOpen: boolean;
  currentUser: PlayerAccount | null;
  currentRoom: string;
  onlineCount: number;
  onClose: () => void;
}

export const FriendsSocialModal: React.FC<FriendsSocialModalProps> = ({
  isOpen,
  currentUser,
  currentRoom,
  onlineCount,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'search' | 'invite'>('room');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isOpen) return null;

  const handleCopyInvite = () => {
    soundManager.playUiClick();
    const url = window.location.href;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyUid = () => {
    soundManager.playUiClick();
    const uid = currentUser?.uid || 'guest-explorer';
    navigator.clipboard?.writeText?.(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Friends & Social <span className="text-xs text-emerald-400 font-normal">বন্ধু ও মাল্টিপ্লেয়ার</span>
              </h2>
              <p className="text-xs text-slate-400">Connected Hub: {currentRoom} (Capacity: 50 players)</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('room');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'room'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Online Room ({onlineCount})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('search');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Add Friend by UID</span>
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('invite');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'invite'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Room Invite Link</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'room' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Active Server Hub</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Live Synchronized
                </span>
              </div>

              {/* Player Self Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                    {(currentUser?.displayName || 'Explorer').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{currentUser?.displayName || 'Explorer'}</span>
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40">
                        YOU
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">UID: {currentUser?.uid || 'guest-explorer'}</div>
                  </div>
                </div>

                <button
                  onClick={handleCopyUid}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 text-slate-300 hover:text-white"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUid ? 'Copied' : 'Copy UID'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-2">
                <div className="font-bold text-slate-200">Shared Online World Features:</div>
                <p>• All players in the same room stand together in real-time in Dhaka City and the Countryside Village.</p>
                <p>• Proximity WebRTC voice chat and text messages are live across the room.</p>
                <p>• Current server max room limit is permanently set to 50 concurrent players.</p>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Search Player by UID or Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter 8-digit UID (e.g. p_ab12cd3)..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => soundManager.playUiClick()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase tracking-wider text-white"
                  >
                    Search
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                {searchQuery ? (
                  <div>
                    Searching for <span className="text-white font-mono font-bold">"{searchQuery}"</span> across Dhaka Hub...
                    <div className="mt-2 text-amber-400">No external request pending. Make sure player is online.</div>
                  </div>
                ) : (
                  <div>Enter a player's UID to send a friend request or co-op invite.</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200">Shareable Co-Op Link</div>
                <p className="text-xs text-slate-400">
                  Send this link to your friends on WhatsApp or Messenger to join the same Dhaka-Hub open-world room directly.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : 'https://dream-world-open.onrender.com'}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-300"
                  />
                  <button
                    onClick={handleCopyInvite}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Multiplayer Server Capacity: 50 Concurrent Players</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
