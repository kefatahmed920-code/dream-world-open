/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Package, Coffee, Key, Gem, Smartphone, Wallet } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryModalProps {
  inventory: InventoryItem[];
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ inventory, onClose }) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'coffee':
        return <Coffee className="w-6 h-6 text-amber-400" />;
      case 'key':
        return <Key className="w-6 h-6 text-yellow-400" />;
      case 'gem':
        return <Gem className="w-6 h-6 text-sky-400" />;
      case 'smartphone':
        return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case 'wallet':
        return <Wallet className="w-6 h-6 text-orange-400" />;
      default:
        return <Package className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-600/40 flex items-center justify-center text-sky-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                INVENTORY BAG · <span className="text-sky-400 font-medium">ঝুলি</span>
              </div>
              <div className="text-xs text-slate-400">{inventory.length} items carried</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {inventory.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3.5"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                {getIcon(item.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white truncate">{item.name}</span>
                  {item.count > 1 && (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                      x{item.count}
                    </span>
                  )}
                </div>
                <div className="text-xs text-sky-300 font-medium mb-1">{item.nameBn}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
