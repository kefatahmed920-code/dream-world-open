/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Settings as SettingsIcon, Save, Sun, CloudRain, Wind, Monitor, Volume2 } from 'lucide-react';
import { GameSettings, WeatherType, GraphicsQuality } from '../types';
import { soundManager } from '../audio/soundManager';

interface SettingsModalProps {
  settings: GameSettings;
  timeOfDay: number;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onSetTimeOfDay: (time: number) => void;
  onSetWeather: (weather: WeatherType) => void;
  onSaveGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  timeOfDay,
  onUpdateSettings,
  onSetTimeOfDay,
  onSetWeather,
  onSaveGame,
  onClose,
}) => {
  const qualities: GraphicsQuality[] = ['low', 'medium', 'high', 'ultra'];
  const weathers: { id: WeatherType; label: string; icon: React.ReactNode }[] = [
    { id: 'clear', label: 'Clear Sky', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { id: 'rain', label: 'Monsoon Rain', icon: <CloudRain className="w-4 h-4 text-sky-400" /> },
    { id: 'mist', label: 'Morning Mist', icon: <Wind className="w-4 h-4 text-slate-300" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600/40 flex items-center justify-center text-amber-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white">SETTINGS & WORLD OPTIONS</div>
              <div className="text-xs text-slate-400">Audio, Graphics & Environmental Simulation</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Graphics Quality */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-emerald-400" /> Graphics Preset
            </div>
            <div className="grid grid-cols-4 gap-2">
              {qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    soundManager.playUiClick();
                    onUpdateSettings({ quality: q });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                    settings.quality === q
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Selector */}
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase mb-2 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Atmospheric Weather
            </div>
            <div className="grid grid-cols-3 gap-2">
              {weathers.map((w) => (
                <button
                  key={w.id}
                  onClick={() => {
                    soundManager.playUiClick();
                    onSetWeather(w.id);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                    settings.weather === w.id
                      ? 'bg-sky-600 border-sky-400 text-white shadow-lg'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {w.icon}
                  <span>{w.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase mb-1.5">
              <span>Time of Day</span>
              <span className="text-amber-400 font-mono tabular-nums">
                {Math.floor(timeOfDay)}:00 ({timeOfDay >= 6 && timeOfDay < 18 ? 'Day' : 'Night'})
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="0.5"
              value={timeOfDay}
              onChange={(e) => onSetTimeOfDay(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 uppercase mb-1.5">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-sky-400" /> Master Volume
              </span>
              <span className="text-sky-400 font-mono tabular-nums">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                soundManager.setMasterVolume(val);
                onUpdateSettings({ masterVolume: val });
              }}
              className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Save Game Progress */}
          <div className="pt-2">
            <button
              onClick={() => {
                soundManager.playUiClick();
                onSaveGame();
              }}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xl border border-emerald-400 transition-all active:scale-98"
            >
              <Save className="w-4 h-4" /> Save Game Progress to Device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
