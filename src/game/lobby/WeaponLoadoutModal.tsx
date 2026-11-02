/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Crosshair, Sparkles, Check, Shield } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface WeaponLoadout {
  id: string;
  name: string;
  nameBn: string;
  category: 'Toy Blaster' | 'Foam Launcher' | 'Water Cannon';
  damage: string;
  mobility: string;
  description: string;
  color: string;
}

export const WEAPON_LOADOUTS: WeaponLoadout[] = [
  {
    id: 'cyber_blaster_neon',
    name: 'Cyber Pulse Toy Blaster',
    nameBn: 'সাইবার পালস টয় ব্লাস্টার',
    category: 'Toy Blaster',
    damage: 'Cosmetic Light FX',
    mobility: 'High (100%)',
    description: 'Futuristic glowing toy blaster with sound effects, LED flashes, and harmless soft light beams.',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'foam_dart_storm',
    name: 'Foam Dart Rapid Launcher',
    nameBn: 'ফোম ডার্ট র্যাপিড লঞ্চার',
    category: 'Foam Launcher',
    damage: 'Playful Dart Pop',
    mobility: 'Max Speed (105%)',
    description: 'Rapid-firing soft foam suction dart launcher that sticks playfully to targets and street signs.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'hydro_super_soaker',
    name: 'Hydro Turbo Water Cannon',
    nameBn: 'হাইড্রো টার্বো ওয়াটার ক্যানন',
    category: 'Water Cannon',
    damage: 'Water Splash FX',
    mobility: 'Standard (95%)',
    description: 'High-pressure festival splash blaster that shoots sparkling water droplets across the pond and parks.',
    color: 'from-emerald-500 to-teal-600',
  },
];

interface WeaponLoadoutModalProps {
  isOpen: boolean;
  selectedWeapon: string;
  onSelectWeapon: (id: string) => void;
  onClose: () => void;
}

export const WeaponLoadoutModal: React.FC<WeaponLoadoutModalProps> = ({
  isOpen,
  selectedWeapon,
  onSelectWeapon,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                WEAPON LOADOUT <span className="text-xs text-amber-400 font-normal">টয় ও কসমেটিক আর্মারি</span>
              </h2>
              <p className="text-xs text-slate-400">Select harmless toy blasters and foam launchers for play</p>
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

        {/* Weapons List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {WEAPON_LOADOUTS.map((w) => {
            const isEquipped = selectedWeapon === w.id;

            return (
              <div
                key={w.id}
                onClick={() => {
                  soundManager.playUiClick();
                  onSelectWeapon(w.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isEquipped
                    ? 'border-amber-400 bg-amber-950/20 shadow-xl shadow-amber-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${w.color} flex items-center justify-center text-slate-950 shadow-md shrink-0`}>
                    <Crosshair className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white">{w.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {w.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-1">{w.nameBn}</div>
                    <p className="text-xs text-slate-300">{w.description}</p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isEquipped ? (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase flex items-center gap-1 shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> EQUIPPED
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playUiClick();
                        onSelectWeapon(w.id);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition"
                    >
                      EQUIP
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Safe for all ages: All toy blasters use harmless foam darts and light FX.</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
