/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, PawPrint, Sparkles, Check, ShieldAlert, Award } from 'lucide-react';
import { PetType, PET_CONFIGS, PetConfig } from './PetCompanionModel';
import { soundManager } from '../audio/soundManager';

interface PetSelectModalProps {
  isOpen: boolean;
  selectedPet: PetType;
  onSelectPet: (pet: PetType) => void;
  onClose: () => void;
}

export const PetSelectModal: React.FC<PetSelectModalProps> = ({
  isOpen,
  selectedPet,
  onSelectPet,
  onClose,
}) => {
  if (!isOpen) return null;

  const currentConfig = PET_CONFIGS[selectedPet];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <PawPrint className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Pet Companions <span className="text-xs text-emerald-400 font-normal">পোষা সঙ্গী</span>
              </h2>
              <p className="text-xs text-slate-400">Equip your loyal companion in the 3D game world</p>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Pet Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(Object.values(PET_CONFIGS) as PetConfig[]).map((pet) => {
              const isSelected = selectedPet === pet.id;
              return (
                <div
                  key={pet.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    onSelectPet(pet.id);
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/95 border-emerald-400 shadow-xl shadow-emerald-950/60 scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {pet.rarity}
                      </span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-white">{pet.name}</h3>
                    <div className="text-xs font-semibold text-emerald-400 mb-2">{pet.nameBn}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-3 mb-3">{pet.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Bonus Buff:</div>
                    <div className="text-[11px] font-bold text-amber-400">{pet.passiveBonus}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Pet Detail Highlight Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <PawPrint className="w-8 h-8" />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-black text-white">{currentConfig.name}</span>
                <span className="text-xs text-emerald-400 font-semibold">({currentConfig.nameBn})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  EQUIPPED
                </span>
              </div>
              <p className="text-xs text-slate-300">{currentConfig.descriptionBn}</p>
              <div className="text-xs font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentConfig.passiveBonus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Pet stands beside your 3D avatar in the lobby & open world</span>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
};
