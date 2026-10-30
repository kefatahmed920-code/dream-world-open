/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, X, Check, BedDouble } from 'lucide-react';

interface ReturnHomeModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReturnHomeModal: React.FC<ReturnHomeModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-500/20 overflow-hidden text-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">বাড়িতে ফিরতে চান?</h3>
              <p className="text-xs font-bold text-emerald-400">Return to Private Home?</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <BedDouble className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি আপনার ব্যক্তিগত সুরক্ষিত ঘরে ফিরে যাবেন (বিছানার পাশে)। সেখানে আপনি অন্যান্য খেলোয়াড়দের ঝামেলা ছাড়াই পোশাক পরিবর্তন করতে পারবেন।
            </p>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            You will be instantly returned to your private room beside your bed.
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onCancel}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
            >
              বাতিল / Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>হ্যাঁ, ফিরুন / Yes, Return</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
