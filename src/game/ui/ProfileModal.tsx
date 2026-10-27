/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlayerAccount, authManager } from '../auth/authManager';
import { X, User, Shield, Award, Coins, Compass, LogOut, Check, Edit2, Copy } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  user: PlayerAccount | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, user, onClose, onOpenAuth }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyUid = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.uid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) return;
    await authManager.updateProfile({ displayName: editName.trim() });
    setIsEditingName(false);
  };

  const handleLogout = () => {
    authManager.logout();
    onClose();
    onOpenAuth();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl p-6 text-white overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-emerald-500/20">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="flex-1 min-w-0">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-slate-800 border border-emerald-400 px-2.5 py-1 rounded-lg text-sm font-bold text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1.5 bg-emerald-500 text-slate-950 rounded-lg font-bold"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white truncate">{user?.displayName || 'Guest Explorer'}</h3>
                <button
                  onClick={() => {
                    setEditName(user?.displayName || '');
                    setIsEditingName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Edit Name"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                {user?.uid || 'DW-GUEST'}
              </span>
              <button
                onClick={handleCopyUid}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                title="Copy UID"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Account Badge */}
        <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-800 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                user?.isGuest ? 'bg-amber-400' : 'bg-emerald-400'
              } animate-pulse`}
            />
            <span className="text-xs font-semibold text-slate-300">
              {user?.isGuest ? 'Temporary Guest Session' : 'Verified Permanent Account'}
            </span>
          </div>
          {user?.isGuest && (
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="text-[11px] font-bold text-emerald-400 hover:underline"
            >
              Upgrade Account
            </button>
          )}
        </div>

        {/* Lifetime Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Level</span>
            </div>
            <div className="text-2xl font-black text-white">{user?.stats.level || 1}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Dhanmondi Veteran</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Coins className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Taka Balance</span>
            </div>
            <div className="text-2xl font-black text-white">৳{user?.stats.taka ?? 350}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cash in Hand</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Completed Quests</span>
            </div>
            <div className="text-2xl font-black text-white">{user?.stats.questsCompleted || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Tasks Finished</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Compass className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Exploration</span>
            </div>
            <div className="text-2xl font-black text-white">
              {((user?.stats.distanceExploredKm || 0) + 1.2).toFixed(1)} km
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Distance Walked/Driven</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleLogout}
            className="flex-1 py-3 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            Switch / Sign Out
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
