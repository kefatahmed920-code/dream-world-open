/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Gem, ShieldAlert, Sparkles, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface DiamondPackage {
  id: string;
  diamonds: number;
  bonusDiamonds: number;
  priceBDT: number;
  popular?: boolean;
  tag: string;
}

export const DIAMOND_PACKAGES: DiamondPackage[] = [
  {
    id: 'pack_100',
    diamonds: 100,
    bonusDiamonds: 0,
    priceBDT: 150,
    tag: 'STARTER',
  },
  {
    id: 'pack_200',
    diamonds: 200,
    bonusDiamonds: 15,
    priceBDT: 250,
    popular: true,
    tag: 'POPULAR',
  },
  {
    id: 'pack_300',
    diamonds: 300,
    bonusDiamonds: 35,
    priceBDT: 350,
    tag: 'VALUE',
  },
  {
    id: 'pack_400',
    diamonds: 400,
    bonusDiamonds: 60,
    priceBDT: 450,
    tag: 'ELITE BUNDLE',
  },
];

interface DiamondStoreModalProps {
  isOpen: boolean;
  currentDiamonds: number;
  onClose: () => void;
}

export const DiamondStoreModal: React.FC<DiamondStoreModalProps> = ({
  isOpen,
  currentDiamonds,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Gem className="w-5 h-5 fill-cyan-400/20" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-wide text-white uppercase">
                  DIAMOND VAULT <span className="text-xs text-cyan-400 font-normal">ডায়মন্ড স্টোর</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Current: {currentDiamonds} 💎
                </span>
              </div>
              <p className="text-xs text-slate-400">Official top-up packages in Bangladeshi Taka (BDT)</p>
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

        {/* Notice Banner */}
        <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Payment Gateway Preview:</strong> Diamond checkout is currently locked in preview mode. No money or bank account will be charged.
          </span>
        </div>

        {/* Packages Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DIAMOND_PACKAGES.map((pack) => (
              <div
                key={pack.id}
                className={`relative rounded-2xl border-2 p-4 flex flex-col justify-between transition-all ${
                  pack.popular
                    ? 'border-cyan-400 bg-gradient-to-b from-cyan-950/40 to-slate-900 shadow-xl shadow-cyan-500/10'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {pack.tag}
                    </span>
                    {pack.bonusDiamonds > 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> +{pack.bonusDiamonds} Bonus
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 my-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Gem className="w-7 h-7 fill-cyan-400/30" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">
                        {pack.diamonds} <span className="text-cyan-400 text-lg">💎</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Total {pack.diamonds + pack.bonusDiamonds} Diamonds
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-base font-black text-amber-400">
                    ৳{pack.priceBDT} <span className="text-[10px] text-slate-400 font-normal">BDT</span>
                  </div>

                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 font-black text-xs uppercase flex items-center gap-1.5 cursor-not-allowed border border-slate-700/60"
                  >
                    <Lock className="w-3 h-3" /> COMING SOON
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Secure Payment Security Note */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs space-y-1">
            <div className="text-white font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Planned Payment Methods:
            </div>
            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-pink-950/60 border border-pink-500/30 text-pink-300">bKash (বিকাশ)</span>
              <span className="px-2 py-0.5 rounded bg-orange-950/60 border border-orange-500/30 text-orange-300">Nagad (নগদ)</span>
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">Rocket (রকেট)</span>
              <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300">Visa / Mastercard / Amex</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>In-game currency purchases are currently inactive for development.</span>
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
