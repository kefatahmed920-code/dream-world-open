/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Newspaper, Sparkles, MapPin, Radio, Fish, School, Flame } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NEWS_UPDATES = [
  {
    id: 'patch_1_4',
    date: 'LATEST UPDATE',
    title: 'Countryside Village & Padma Bridge Overhaul',
    titleBn: 'গ্রামীণ মনোরম পরিবেশ ও পদ্মাসেতুর পূর্ণাঙ্গ সংযোগ',
    tag: 'NEW EXPANSION',
    icon: MapPin,
    color: 'text-emerald-400 bg-emerald-950 border-emerald-500/40',
    content: [
      'Circular 52m Red-Brick Plaza with massive Ancient Banyan Shade Tree & seating.',
      'Concert-Grade Outdoor Music Speaker system with interactive Bangladeshi tracks.',
      'Enlarged 86m × 56m Natural Pond, Lotus water lilies & wooden fishing platform.',
      'Dream World High School & 36m Football field with regulation goalposts.',
      'Realistic organic Coconut Palms, Mango trees, Banana plants & Farmer homestead.',
    ],
  },
  {
    id: 'patch_1_3',
    date: 'SYSTEM UPDATE',
    title: 'Online Multiplayer Co-Op & Voice Chat Live',
    titleBn: 'অনলাইন মাল্টিপ্লেয়ার ও ভয়েস চ্যাট সমন্বয়',
    tag: 'MULTIPLAYER',
    icon: Radio,
    color: 'text-sky-400 bg-sky-950 border-sky-500/40',
    content: [
      'All players standing in the same room can now clearly see each other in 3D.',
      'Real-time position interpolation, animated human rigs, and floating nametags.',
      'Direct low-latency WebSocket connection with 50-player room capacity.',
      'WebRTC proximity voice chat with mute/deafen controls.',
    ],
  },
  {
    id: 'patch_1_2',
    date: 'SEASON EVENT',
    title: '2-Minute Padma River Fishing Challenge',
    titleBn: 'পদ্মা নদীর মাছ ধরার চ্যালেঞ্জ ও প্রতিযোগিতা',
    tag: 'CHALLENGE',
    icon: Fish,
    color: 'text-amber-400 bg-amber-950 border-amber-500/40',
    content: [
      'Compete against rival fisherman Kashem Majhi for 2 intense minutes.',
      'Catch Ilish, Rui, Katla, and Golden Boal fish for big Taka rewards.',
      'Leaderboard tracking for highest fish scores.',
    ],
  },
];

export const GameNewsModal: React.FC<GameNewsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Game News & Patch Notes <span className="text-xs text-emerald-400 font-normal">খেলার খবর</span>
              </h2>
              <p className="text-xs text-slate-400">Official Dream World World Announcements & Updates</p>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {NEWS_UPDATES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{item.title}</h3>
                      <div className="text-xs text-emerald-400 font-semibold">{item.titleBn}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {item.tag} · {item.date}
                  </span>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  {item.content.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Dream World Version 1.4 · Bangladesh Open World Edition</span>
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
