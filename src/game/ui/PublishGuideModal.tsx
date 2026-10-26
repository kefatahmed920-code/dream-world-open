/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Share2, Globe, ExternalLink, Copy, CheckCircle2, Rocket, Cloud } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    soundManager.playCollectItem();
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                FREE PUBLISHING & SHARING GUIDE · <span className="text-emerald-400 font-medium">বিনামূল্যে প্রকাশ</span>
              </div>
              <div className="text-xs text-slate-400">
                How to share and host your 3D open-world game for free worldwide
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

        {/* Current App Share Link */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-2">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4" /> আপনার বর্তমান শেয়ারযোগ্য গেম লিঙ্ক (Live App Link):
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            এই লিঙ্কটি যেকোনো বন্ধু বা ব্যবহারকারীকে পাঠালে তারা ফোন বা কম্পিউটারে সরাসরি গেমটি খেলতে ও ইনস্টল করতে পারবে।
          </p>
        </div>

        {/* Step-by-Step Free Hosting Platforms */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            বিশ্বজুড়ে বিনামূল্যে গেম হোস্ট ও রিলিজ করার ৩টি সহজ মাধ্যম:
          </div>

          {/* Option 1: AI Studio Shared URL */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-sky-400">
              <Cloud className="w-4 h-4" /> ১. Google AI Studio Instant Deployment (জিরো কনফিগারেশন)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI Studio স্ক্রিনের উপরের ডানপাশে থাকা <strong>'Share'</strong> বাটনে চাপ দিলেই সাথে সাথে ক্লাউডে বিশ্বব্যাপী অ্যাক্সেসিবল HTTPS লিংক তৈরি হয়ে যায়। কোনো হোস্টিং ফি বা সার্ভার সেটআপ ছাড়াই খেলা যায়।
            </p>
          </div>

          {/* Option 2: Vercel / Netlify */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <Globe className="w-4 h-4" /> ২. Vercel বা Netlify (ফ্রি লাইফটাইম হোস্টিং)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ১. আপনার গেমের কোড GitHub-এ আপলোড করুন।<br />
              ২. <strong>vercel.com</strong> বা <strong>netlify.com</strong> এ ফ্রি অ্যাকাউন্ট খুলে রিপোজিটরি ইমপোর্ট করুন।<br />
              ৩. Build Command: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">npm run build</code> এবং Output Directory: <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">dist</code> দিন।<br />
              ৪. কয়েক সেকেন্ডে তৈরি হবে আপনার নিজস্ব <code className="text-emerald-300">dreamworld.vercel.app</code> লিঙ্ক!
            </p>
          </div>

          {/* Option 3: GitHub Pages */}
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-400">
              <ExternalLink className="w-4 h-4" /> ৩. GitHub Pages (১০০% ফ্রি ওপেন-সোর্স)
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              GitHub রিপোজিটরির <strong>Settings → Pages</strong> অপশনে গিয়ে <strong>GitHub Actions</strong> সিলেক্ট করলেই স্বয়ংক্রিয়ভাবে একটি ফ্রি গ্লোবাল লিংক তৈরি হবে।
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors mt-1"
        >
          বুঝেছি (Got It)
        </button>
      </div>
    </div>
  );
};
