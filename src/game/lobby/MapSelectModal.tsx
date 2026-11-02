/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, MapPin, Compass, Lock, Sparkles, Trees, Building2, Mountain } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

export interface WorldMapEntry {
  id: string;
  name: string;
  nameBn: string;
  status: 'ACTIVE' | 'COMING_SOON';
  type: string;
  thumbnailGradient: string;
  highlights: string[];
  description: string;
  descriptionBn: string;
}

export const WORLD_MAPS: WorldMapEntry[] = [
  {
    id: 'bangladesh_open_world',
    name: 'Bangladesh Open World',
    nameBn: 'বাংলাদেশ ওপেন ওয়ার্ল্ড (ঢাকা ও গ্রাম)',
    status: 'ACTIVE',
    type: 'Metropolis + Countryside + Padma Bridge',
    thumbnailGradient: 'from-blue-600 via-indigo-700 to-emerald-700',
    highlights: ['Dhaka Skyline', 'Padma China Bridge', 'Village Pond & Fishing', 'High School', 'Farmland'],
    description: 'Explore the full seamless open-world with urban Dhaka city, China suspension bridge, realistic countryside village, fishing pond, and high school.',
    descriptionBn: 'সম্পূর্ণ ওপেন ওয়ার্ল্ড: ঢাকা শহর, পদ্মা ব্রিজ, সুন্দর গ্রাম, পুকুরে মাছ ধরা, হাই স্কুল এবং কৃষিক্ষেত।',
  },
  {
    id: 'sylhet_tea_gardens',
    name: 'Sylhet Green Hills & Tea Valleys',
    nameBn: 'সিলেট সবুজ চা বাগান ও নদী উপত্যকা',
    status: 'COMING_SOON',
    type: 'Hill Station & Nature Trails',
    thumbnailGradient: 'from-emerald-700 via-teal-800 to-slate-900',
    highlights: ['Lush Tea Estates', 'Bichnakandi Streams', 'Mountain Bikes', 'Off-road Jeeps'],
    description: 'Breathtaking undulating rolling hills covered in emerald tea estates, crystal mountain streams, and off-road trails.',
    descriptionBn: 'পাহাড়ঘেরা সবুজ চা বাগান, স্বচ্ছ পানির জলপ্রপাত এবং অফরোড ড্রাইভিং ট্র্যাক।',
  },
  {
    id: 'chittagong_coastal_highway',
    name: 'Chittagong Marine Drive & Peaks',
    nameBn: 'চট্টগ্রাম মেরিন ড্রাইভ ও পাহাড়ি ট্রেইল',
    status: 'COMING_SOON',
    type: 'Coastal Expressway & Mountain Ranges',
    thumbnailGradient: 'from-amber-600 via-rose-700 to-purple-900',
    highlights: ['Cox Marine Drive', 'Kaptai Lake Boating', 'Coastal Racing', 'Sunset Viewpoint'],
    description: 'Scenic high-speed coastal highway hugging the coastline, ocean beach drives, and mountain viewpoints.',
    descriptionBn: 'দীর্ঘতম মেরিন ড্রাইভ সমুদ্র সৈকত এবং পাহাড়ি প্রাকৃতিক সৌন্দর্য।',
  },
];

interface MapSelectModalProps {
  isOpen: boolean;
  selectedMapId: string;
  onSelectMap: (id: string) => void;
  onClose: () => void;
}

export const MapSelectModal: React.FC<MapSelectModalProps> = ({
  isOpen,
  selectedMapId,
  onSelectMap,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                MAP SELECTION <span className="text-xs text-cyan-400 font-normal">মানচিত্র নির্বাচন</span>
              </h2>
              <p className="text-xs text-slate-400">Select an open world territory to explore</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {WORLD_MAPS.map((map) => {
            const isSelected = selectedMapId === map.id;
            const isActive = map.status === 'ACTIVE';

            return (
              <div
                key={map.id}
                onClick={() => {
                  if (isActive) {
                    soundManager.playUiClick();
                    onSelectMap(map.id);
                  }
                }}
                className={`relative rounded-2xl border-2 transition-all p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center ${
                  isActive
                    ? isSelected
                      ? 'border-cyan-400 bg-cyan-950/30 shadow-xl shadow-cyan-500/10 cursor-pointer'
                      : 'border-slate-700/80 hover:border-cyan-500/50 bg-slate-950/60 cursor-pointer'
                    : 'border-slate-800/80 bg-slate-950/40 opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className={`w-full sm:w-40 h-24 rounded-xl bg-gradient-to-br ${map.thumbnailGradient} p-3 flex flex-col justify-between relative overflow-hidden shrink-0`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {map.type.split(' ')[0]}
                    </span>
                    {isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="text-xs font-black text-white drop-shadow">
                    {map.name.split(' ')[0]}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-black text-white">{map.name}</h3>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ACTIVE · LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-800 text-amber-300 border border-amber-500/30">
                        COMING SOON
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-cyan-300/90 font-medium mb-1.5">{map.nameBn}</div>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-2">{map.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {map.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-[10px] text-slate-300 border border-slate-700/60"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Select / Status Button */}
                <div className="sm:self-center shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  {isActive ? (
                    isSelected ? (
                      <div className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30">
                        <Check className="w-4 h-4 stroke-[3]" /> SELECTED
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playUiClick();
                          onSelectMap(map.id);
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase transition border border-slate-700"
                      >
                        SELECT
                      </button>
                    )
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-500 font-bold text-xs uppercase flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> LOCKED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Current active map: Bangladesh Open World (Dhaka & Countryside).</span>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black transition text-xs uppercase"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
