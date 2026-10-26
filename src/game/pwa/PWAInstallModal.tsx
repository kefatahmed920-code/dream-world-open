/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, X, Smartphone, Globe, Share, CheckCircle2, Info } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950/90 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                INSTALL DREAM WORLD · <span className="text-emerald-400 font-medium">ইনস্টল গেম</span>
              </div>
              <div className="text-xs text-slate-400">
                Play offline anytime on Android, iOS, or Desktop
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Installation Note */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">ইনস্টল সম্পূর্ণ ঐচ্ছিক:</span> আপনি চাইলে কোনো অ্যাপ ইনস্টল না করেই সরাসরি যেকোনো ওয়েব ব্রাউজারে খেলতে পারেন। তবে ফোনে ইনস্টল করলে ফুল-স্ক্রিন মোড ও দ্রুত অফলাইন অ্যাক্সেস পাওয়া যায়।
          </div>
        </div>

        {/* Action / State */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-600/40 flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>অ্যাপটি আপনার ডিভাইসে ইতিমধ্যে ইনস্টল করা আছে!</span>
          </div>
        ) : isInstallable ? (
          <div className="space-y-3">
            <button
              onClick={handleNativeInstall}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-xl border-2 border-emerald-300 transition-all active:scale-98"
            >
              <Download className="w-5 h-5" />
              <span>INSTALL NOW TO HOMESCREEN (এক ক্লিকে ইনস্টল)</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Tap above to trigger the standard Chrome / Android system install dialog.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* iOS Instructions */}
            {isIOS ? (
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <div className="font-bold text-sky-400 flex items-center gap-1.5 text-sm">
                  <Smartphone className="w-4 h-4" /> iPhone / iPad (Safari):
                </div>
                <div className="text-slate-300 space-y-1.5 pl-2 border-l-2 border-sky-500">
                  <p>1. Safari ব্রাউজারের নিচে থাকা <strong className="text-white">Share (শেয়ার ⎋)</strong> বাটনে ট্যাপ করুন।</p>
                  <p>2. নিচে স্ক্রোল করে <strong className="text-white">'Add to Home Screen' (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।</p>
                  <p>3. উপরে <strong className="text-white">'Add'</strong> বাটনে চাপ দিন। আপনার হোমস্ক্রিনে অ্যাপ তৈরি হবে!</p>
                </div>
              </div>
            ) : (
              /* Android / Desktop Instructions */
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <Smartphone className="w-4 h-4" /> Android (Chrome) / Desktop:
                </div>
                <div className="text-slate-300 space-y-1.5 pl-2 border-l-2 border-emerald-500">
                  <p>1. ব্রাউজারের উপরের ডান কোণায় থাকা <strong className="text-white">মেনু (⋮)</strong> বাটনে ট্যাপ করুন।</p>
                  <p>2. <strong className="text-white">'Install app'</strong> অথবা <strong className="text-white">'Add to Home screen'</strong> চাপুন।</p>
                  <p>3. কম্পিউটার বা ল্যাপটপে থাকলে অ্যাড্রেস বারের ডানপাশে থাকা <strong className="text-white">ইনস্টল আইকন (⊕)</strong> চাপুন।</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>অফলাইনে খেলা যাবে</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ফুল-স্ক্রিন গেমপ্লে</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>কোনো আলাদা ডাউনলোড নেই</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>দ্রুত এবং লাইটওয়েট</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          বন্ধ করুন (Close)
        </button>
      </div>
    </div>
  );
};
