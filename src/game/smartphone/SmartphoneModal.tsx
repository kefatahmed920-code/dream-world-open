/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Car,
  User,
  MapPin,
  Trophy,
  MessageSquare,
  Camera,
  Sun,
  Settings,
  X,
  Wifi,
  Battery,
  Sparkles,
  Fish,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface SmartphoneVehicleOption {
  type: string;
  name: string;
  nameBn: string;
  icon: string;
  topSpeed: string;
  acceleration: string;
  category: string;
}

export const SMARTPHONE_VEHICLES: SmartphoneVehicleOption[] = [
  {
    type: 'tesla',
    name: 'Cyber EV Highway Sedan',
    nameBn: 'সাইবার ইভি সুপারকার',
    icon: '⚡🏎️',
    topSpeed: '120 km/h',
    acceleration: 'Extreme',
    category: 'Electric Supercar',
  },
  {
    type: 'cng',
    name: 'Green CNG Auto-Rickshaw',
    nameBn: 'সবুজ সিএনজি অটোরিকশা',
    icon: '🛺',
    topSpeed: '65 km/h',
    acceleration: 'Agile',
    category: 'Dhaka Iconic',
  },
  {
    type: 'car',
    name: 'Dhanmondi Private Sedan',
    nameBn: 'প্রাইভেট কার (সেডান)',
    icon: '🚗',
    topSpeed: '100 km/h',
    acceleration: 'High',
    category: 'Urban Luxury',
  },
  {
    type: 'bus',
    name: 'Dhaka Chaka Metro Bus',
    nameBn: 'ঢাকা চাকা মেট্রো বাস',
    icon: '🚌',
    topSpeed: '75 km/h',
    acceleration: 'Heavy',
    category: 'Public Transit',
  },
  {
    type: 'boat',
    name: 'Padma River Speedboat',
    nameBn: 'পদ্মা রিভার স্পিডবোট',
    icon: '🚤',
    topSpeed: '85 km/h',
    acceleration: 'High Wave',
    category: 'Watercraft',
  },
];

interface SmartphoneModalProps {
  isOpen: boolean;
  playerName: string;
  playerMoney: number;
  timeString?: string;
  onSpawnVehicle: (vehicleType: string) => void;
  onOpenCustomizer: () => void;
  onOpenMap: () => void;
  onOpenRankings: () => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  onStartFishing: () => void;
  onClose: () => void;
}

export const SmartphoneModal: React.FC<SmartphoneModalProps> = ({
  isOpen,
  playerName,
  playerMoney,
  timeString = '10:30',
  onSpawnVehicle,
  onOpenCustomizer,
  onOpenMap,
  onOpenRankings,
  onOpenChat,
  onOpenSettings,
  onStartFishing,
  onClose,
}) => {
  const [activeApp, setActiveApp] = useState<'home' | 'garage'>('home');

  if (!isOpen) return null;

  const handleDeliverVehicle = (type: string) => {
    soundManager.playVehicleDoor();
    onSpawnVehicle(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-xs pointer-events-auto select-none animate-fade-in">
      {/* Smartphone Chassis Frame */}
      <div className="relative w-full max-w-[340px] h-[640px] bg-slate-950 rounded-[44px] p-3 shadow-2xl shadow-cyan-500/20 border-4 border-slate-700/80 flex flex-col justify-between overflow-hidden">
        {/* Dynamic Island Pill */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400">{timeString}</span>
        </div>

        {/* Status Bar */}
        <div className="relative z-20 flex items-center justify-between px-4 pt-1.5 text-xs text-white">
          <span className="font-semibold text-xs tracking-tight">{playerName}</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Wallpaper Container */}
        <div className="relative flex-1 rounded-[32px] overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 p-4 mt-2 flex flex-col border border-slate-800">
          {/* Top App Header if in sub-app */}
          {activeApp === 'garage' ? (
            <div className="flex flex-col h-full">
              {/* Back to Home Button */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <button
                  onClick={() => setActiveApp('home')}
                  className="flex items-center gap-1 text-cyan-400 text-xs font-bold hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" /> ব্যাক / Home
                </button>
                <span className="text-xs font-black text-white">গাড়ি বাজার (Garage)</span>
                <span className="text-xs text-emerald-400 font-bold">{playerMoney} ৳</span>
              </div>

              {/* Vehicle Cards List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {SMARTPHONE_VEHICLES.map((v) => (
                  <div
                    key={v.type}
                    className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 shadow-md transition flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {v.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white truncate">{v.nameBn}</div>
                        <div className="text-[10px] text-slate-400 truncate">{v.name}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[9px] font-bold text-cyan-400">
                          <span>গতি: {v.topSpeed}</span>
                          <span>•</span>
                          <span>{v.category}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeliverVehicle(v.type)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>ডেলিভারি / Spawn on Road</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Home Screen Apps Grid */
            <div className="flex-1 flex flex-col justify-between">
              {/* Header Clock & Balance Widget */}
              <div className="text-center pt-2 pb-4">
                <div className="text-4xl font-extrabold text-white tracking-tight font-mono">{timeString}</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">ঢাকা, বাংলাদেশ</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ব্যালেন্স: {playerMoney} ৳</span>
                </div>
              </div>

              {/* 3x3 Grid of App Icons */}
              <div className="grid grid-cols-3 gap-3 my-auto">
                {/* 1. Garage / Vehicles App */}
                <button
                  onClick={() => setActiveApp('garage')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/30 group-active:scale-90 transition-transform">
                    <Car className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">গাড়ির অ্যাপ</span>
                </button>

                {/* 2. Customizer / Wardrobe App */}
                <button
                  onClick={() => {
                    onOpenCustomizer();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-active:scale-90 transition-transform">
                    <User className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">সাজসজ্জা</span>
                </button>

                {/* 3. Map App */}
                <button
                  onClick={() => {
                    onOpenMap();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 group-active:scale-90 transition-transform">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">ম্যাপ</span>
                </button>

                {/* 4. Unified Rankings App */}
                <button
                  onClick={() => {
                    onOpenRankings();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 group-active:scale-90 transition-transform">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">র‍্যাঙ্কিং</span>
                </button>

                {/* 5. Messenger App */}
                <button
                  onClick={() => {
                    onOpenChat();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-active:scale-90 transition-transform">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">মেসেঞ্জার</span>
                </button>

                {/* 6. Fishing Challenge App */}
                <button
                  onClick={() => {
                    onStartFishing();
                    onClose();
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/30 group-active:scale-90 transition-transform">
                    <Fish className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-tight">মাছ ধরা</span>
                </button>
              </div>

              {/* Bottom Quick-Launch Dock */}
              <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-around border border-slate-800">
                <button
                  onClick={() => setActiveApp('garage')}
                  className="p-2 rounded-xl hover:bg-slate-800 text-cyan-400 transition"
                  title="গাড়ি বাজার / Garage"
                >
                  <Car className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                  title="সেটিংস / Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                  title="ফোন বন্ধ করুন / Close Phone"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto my-1.5" />
      </div>
    </div>
  );
};
