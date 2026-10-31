/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';
import { Volume2, VolumeX, Play, Pause, Disc3, Music2, X, Sparkles, Radio } from 'lucide-react';

interface VillageSpeakerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface VillageTrack {
  id: number;
  titleBn: string;
  titleEn: string;
  genre: string;
  duration: string;
}

export const VILLAGE_TRACKS: VillageTrack[] = [
  {
    id: 0,
    titleBn: 'গ্রামের বাঁশির সুর',
    titleEn: 'Peaceful Rural Bamboo Flute',
    genre: 'Folk Classical',
    duration: '03:45',
  },
  {
    id: 1,
    titleBn: 'পদ্মাপাড়ের ভাটিয়ালি গান',
    titleEn: 'Padma River Bhatiyali Melody',
    genre: 'Traditional River Folk',
    duration: '04:12',
  },
  {
    id: 2,
    titleBn: 'ঢাকাইয়া উৎসব বিট',
    titleEn: 'Festival Dhol & Percussion Beat',
    genre: 'Upbeat Celebration',
    duration: '02:50',
  },
  {
    id: 3,
    titleBn: 'শান্ত অপরাহ্ন একুস্টিক',
    titleEn: 'Golden Afternoon Lo-Fi Acoustic',
    genre: 'Ambient Harmony',
    duration: '03:20',
  },
];

export const VillageSpeakerModal: React.FC<VillageSpeakerModalProps> = ({ isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(soundManager.isVillageMusicPlaying);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(soundManager.currentVillageTrack);
  const [volume, setVolume] = useState(85);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(soundManager.isVillageMusicPlaying);
      setCurrentTrackIndex(soundManager.currentVillageTrack);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTrack = VILLAGE_TRACKS[currentTrackIndex] || VILLAGE_TRACKS[0];

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundManager.stopVillageMusic();
      setIsPlaying(false);
    } else {
      soundManager.startVillageMusic(currentTrackIndex);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    soundManager.startVillageMusic(index);
    setIsPlaying(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    soundManager.setVillageMusicVolume(val / 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/60 rounded-3xl shadow-2xl shadow-emerald-950/50 overflow-hidden text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide text-white flex items-center gap-2">
                গ্রামের সাউন্ড সিস্টেম
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  OUTDOOR AUDIO
                </span>
              </h2>
              <p className="text-xs text-slate-400">Central Plaza Public Event Speaker Tower</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speaker Visualizer & Active Track Card */}
        <div className="p-6 space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/30 flex items-center gap-5">
            {/* Spinning Disc / Woofer Graphic */}
            <div
              className={`w-20 h-20 rounded-full border-4 border-emerald-400/50 bg-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '4s' }}
            >
              <Disc3 className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isPlaying ? 'এখন বাজছে (NOW PLAYING)' : 'প্লেয়ার প্রস্তুত (PAUSED)'}
              </div>
              <div className="text-lg font-bold text-white truncate mt-0.5">{currentTrack.titleBn}</div>
              <div className="text-xs text-slate-400 truncate">{currentTrack.titleEn}</div>

              {/* Simulated Equalizer Bars */}
              <div className="flex items-end gap-1.5 h-4 mt-3">
                {[60, 100, 45, 90, 75, 100, 50, 85, 40, 95].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700 h-1.5'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(20, (h * (volume / 100)) % 100)}%` : '4px',
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Player Controls (Play/Pause & Volume) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <button
              onClick={handleTogglePlay}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2.5 transition shadow-lg ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>গান থামান (PAUSE)</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>গান বাজান (PLAY)</span>
                </>
              )}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-3 w-full sm:w-56">
              {volume === 0 ? (
                <VolumeX className="w-5 h-5 text-slate-500 shrink-0" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <span className="text-xs font-mono font-bold text-slate-300 w-9 text-right">{volume}%</span>
            </div>
          </div>

          {/* Track Selection List */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Music2 className="w-4 h-4 text-emerald-400" />
              গ্রাম্য সুর তালিকা (VILLAGE PLAYLIST)
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {VILLAGE_TRACKS.map((track, idx) => {
                const isCurrent = currentTrackIndex === idx && isPlaying;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition ${
                      isCurrent
                        ? 'bg-emerald-950/70 border-emerald-400 text-white'
                        : 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isCurrent ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{track.titleBn}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {track.titleEn} • {track.genre}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2">{track.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-400">
          স্পিকারের কাছে গেলে শব্দ আরও স্পষ্ট হবে (Spatial 3D Audio)
        </div>
      </div>
    </div>
  );
};
