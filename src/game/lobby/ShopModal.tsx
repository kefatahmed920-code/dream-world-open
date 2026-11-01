/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShoppingBag, Car, Shirt, Sparkles, Check, DollarSign } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ShopModalProps {
  isOpen: boolean;
  playerMoney: number;
  onBuyItem: (cost: number, itemName: string) => void;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  nameBn: string;
  category: 'vehicle' | 'outfit' | 'crate';
  price: number;
  currency: 'taka' | 'gems';
  tag: string;
  description: string;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'cyber_tesla_skin',
    name: 'Cyber Tesla Neon Edition',
    nameBn: 'সাইবার টেসলা নিয়ন এডিশন',
    category: 'vehicle',
    price: 5000,
    currency: 'taka',
    tag: 'LEGENDARY',
    description: 'Autonomous electric cyber truck with cyan neon underglow and titanium chassis.',
  },
  {
    id: 'dhaka_cruiser_bike',
    name: 'Dhaka Cruiser Superbike',
    nameBn: 'ঢাকা ক্রুজার সুপারবাইক',
    category: 'vehicle',
    price: 2500,
    currency: 'taka',
    tag: 'EPIC',
    description: 'High-speed sports motorbike with nitrous acceleration for the Padma Bridge highway.',
  },
  {
    id: 'bengal_gamcha_tactical',
    name: 'Tactical Red Gamcha',
    nameBn: 'ট্যাকটিক্যাল লাল গামছা',
    category: 'outfit',
    price: 350,
    currency: 'taka',
    tag: 'POPULAR',
    description: 'Authentic Bangladeshi shoulder scarf with tactical stitching.',
  },
  {
    id: 'cyber_sunglasses',
    name: 'Neon Aviator Shades',
    nameBn: 'নিয়ন সানগ্লাস',
    category: 'outfit',
    price: 450,
    currency: 'taka',
    tag: 'TRENDING',
    description: 'Futuristic HUD sunglasses with anti-glare polarized lenses.',
  },
  {
    id: 'village_crate',
    name: 'Countryside Mystery Crate',
    nameBn: 'গ্রামীণ লাকি বক্স',
    category: 'crate',
    price: 1000,
    currency: 'taka',
    tag: 'CRATE',
    description: 'Contains a chance to unlock rare vehicle wraps, outfits and extra Taka currency.',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  playerMoney,
  onBuyItem,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'vehicle' | 'outfit' | 'crate'>('all');
  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dream_purchased_shop');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const handlePurchase = (item: ShopItem) => {
    if (purchasedItems.includes(item.id)) return;
    if (playerMoney < item.price) {
      soundManager.playUiClick();
      alert('টাকা অপর্যাপ্ত! কোয়েস্ট ও মাছ ধরে আরও টাকা আয় করুন।');
      return;
    }

    soundManager.playCollectCoin();
    const updated = [...purchasedItems, item.id];
    setPurchasedItems(updated);
    localStorage.setItem('dream_purchased_shop', JSON.stringify(updated));
    onBuyItem(item.price, item.name);
  };

  const filtered = SHOP_ITEMS.filter((i) => activeCategory === 'all' || i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in pointer-events-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border-2 border-emerald-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Dream World Shop <span className="text-xs text-emerald-400 font-normal">দোকান ও গ্যারেজ</span>
              </h2>
              <p className="text-xs text-slate-400">Vehicle Showroom, Outfits & Supply Crates</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-black text-xs font-mono">
              ৳ {playerMoney.toLocaleString()} TAKA
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
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1">
          {(['all', 'vehicle', 'outfit', 'crate'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundManager.playUiClick();
                setActiveCategory(cat);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat === 'vehicle' ? 'Vehicles' : cat === 'outfit' ? 'Outfits' : 'Crates'}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const isOwned = purchasedItems.includes(item.id);
              const canAfford = playerMoney >= item.price;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    isOwned
                      ? 'bg-slate-950/70 border-slate-800 opacity-75'
                      : 'bg-slate-950/90 border-slate-700 hover:border-emerald-500/60 shadow-lg'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.tag}
                      </span>
                      {isOwned && (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> OWNED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-white">{item.name}</h3>
                    <div className="text-xs font-semibold text-emerald-400 mb-2">{item.nameBn}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-sm font-mono font-black text-amber-400">
                      ৳ {item.price.toLocaleString()}
                    </div>

                    {isOwned ? (
                      <span className="text-xs font-bold text-slate-400">Equipped</span>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={!canAfford}
                        className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                          canAfford
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow hover:scale-105 active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Buy Now' : 'Need Taka'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Vehicles can be driven across Dhaka & the Countryside Village</span>
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
