/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, RotateCcw, X, Sliders, Move, Eye, EyeOff } from 'lucide-react';
import {
  HudCustomLayout,
  DEFAULT_HUD_LAYOUT,
  loadHudLayout,
  saveHudLayout,
  resetHudLayout,
} from './hudLayoutConfig';
import { soundManager } from '../audio/soundManager';

interface CustomizeHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLayoutUpdated: (layout: HudCustomLayout) => void;
}

type WidgetKey = keyof Omit<HudCustomLayout, 'version'>;

const WIDGET_NAMES: Record<WidgetKey, { name: string; desc: string }> = {
  joystick: { name: 'Movement Joystick & Sprint Button', desc: 'Bottom-left dark-grey joystick with small sprint button' },
  actionCluster: { name: 'Fire & Action Buttons', desc: 'Yellow fire button, Jump, Crouch, Prone, ADS, Reload' },
  curvedCarousel: { name: '5-Slot Weapon Inventory Bar', desc: 'Curved metallic bar with small plus (+) slots' },
  leftTactical: { name: 'Health Bar & Backpack', desc: 'Green HP bar with heart icon, backpack, and quick heal' },
  topBar: { name: 'Top Bar & Compass Ribbon', desc: 'Heading compass and match timer' },
  minimap: { name: 'Circular Mini-Map', desc: 'GPS radar with N, E, S, W compass markings and zoom' },
  squadPanel: { name: 'Squad Info & Voice Controls', desc: 'Teammates list, microphone, speaker, and quick chat' },
};

export const CustomizeHudModal: React.FC<CustomizeHudModalProps> = ({
  isOpen,
  onClose,
  onLayoutUpdated,
}) => {
  const [layout, setLayout] = useState<HudCustomLayout>(() => loadHudLayout());
  const [selectedWidget, setSelectedWidget] = useState<WidgetKey>('joystick');

  if (!isOpen) return null;

  const current = layout[selectedWidget];

  const updateSelected = (partial: Partial<typeof current>) => {
    setLayout((prev) => {
      const next = {
        ...prev,
        [selectedWidget]: {
          ...prev[selectedWidget],
          ...partial,
        },
      };
      return next;
    });
  };

  const handleSave = () => {
    saveHudLayout(layout);
    onLayoutUpdated(layout);
    soundManager.playCollectItem();
    onClose();
  };

  const handleReset = () => {
    const def = resetHudLayout();
    setLayout(def);
    onLayoutUpdated(def);
    soundManager.playUiClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none pointer-events-auto">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                CUSTOMIZE HUD LAYOUT <span className="text-xs text-amber-400 font-normal">কন্ট্রোল সেটআপ</span>
              </h2>
              <p className="text-xs text-slate-400">Position, scale, and opacity customization for all controls</p>
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
        <div className="p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Widget Selector Pills */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Select Element to Adjust
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(WIDGET_NAMES) as WidgetKey[]).map((key) => {
                const isSel = selectedWidget === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedWidget(key);
                      soundManager.playUiClick();
                    }}
                    className={`px-3 py-2 rounded-xl text-left border transition-all flex flex-col ${
                      isSel
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="text-xs font-bold truncate">{WIDGET_NAMES[key].name}</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {Math.round(layout[key].scale * 100)}% · {Math.round(layout[key].opacity * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Control Properties */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div>
                <h4 className="text-sm font-bold text-amber-400">{WIDGET_NAMES[selectedWidget].name}</h4>
                <p className="text-xs text-slate-400">{WIDGET_NAMES[selectedWidget].desc}</p>
              </div>

              {/* Visibility Toggle */}
              <button
                onClick={() => updateSelected({ visible: !current.visible })}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                  current.visible
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                }`}
              >
                {current.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{current.visible ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>

            {/* Scale Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-300">Scale / Button Size</span>
                <span className="font-mono text-amber-400 tabular-nums">{Math.round(current.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={current.scale}
                onChange={(e) => updateSelected({ scale: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-1">
                <span className="text-slate-300">Transparency / Opacity</span>
                <span className="font-mono text-sky-400 tabular-nums">{Math.round(current.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1.0"
                step="0.05"
                value={current.opacity}
                onChange={(e) => updateSelected({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Position Offset Presets */}
            <div>
              <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-amber-400" /> Fine Position Offsets
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Horizontal (X%)</span>
                    <span className="font-mono text-amber-300">{Math.round(current.x)}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    step="1"
                    value={current.x}
                    onChange={(e) => updateSelected({ x: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Vertical (Y%)</span>
                    <span className="font-mono text-amber-300">{Math.round(current.y)}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="98"
                    step="1"
                    value={current.y}
                    onChange={(e) => updateSelected({ y: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 border border-slate-700 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save Layout (লেআউট সংরক্ষণ)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
