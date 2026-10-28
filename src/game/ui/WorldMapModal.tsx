/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Navigation, MapPin, Compass, Zap, Flag, Trash2 } from 'lucide-react';
import { Quest } from '../types';
import { soundManager } from '../audio/soundManager';

interface WorldMapModalProps {
  playerPos: { x: number; y: number; z: number };
  playerYaw: number;
  activeQuest: Quest | null;
  customWaypoint?: { x: number; z: number } | null;
  onSetWaypoint?: (point: { x: number; z: number } | null) => void;
  onClose: () => void;
  onTeleport: (x: number, z: number) => void;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  playerPos,
  playerYaw,
  activeQuest,
  customWaypoint,
  onSetWaypoint,
  onClose,
  onTeleport,
}) => {
  // Map world coordinate limits: X: -150 to +350, Z: -150 to +200
  const worldMinX = -150;
  const worldMaxX = 350;
  const worldMinZ = -150;
  const worldMaxZ = 200;

  const mapW = worldMaxX - worldMinX;
  const mapH = worldMaxZ - worldMinZ;

  const [waypoint, setWaypoint] = useState<{ x: number; z: number } | null>(customWaypoint || null);

  const toMapPercentX = (x: number) => ((x - worldMinX) / mapW) * 100;
  const toMapPercentY = (z: number) => ((z - worldMinZ) / mapH) * 100;

  const currentObj = activeQuest?.objectives[activeQuest.currentObjectiveIndex];

  // Map click handler to set custom destination
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPercentX = (e.clientX - rect.left) / rect.width;
    const clickPercentY = (e.clientY - rect.top) / rect.height;
    const worldX = Math.round(worldMinX + clickPercentX * mapW);
    const worldZ = Math.round(worldMinZ + clickPercentY * mapH);
    const target = { x: worldX, z: worldZ };
    setWaypoint(target);
    onSetWaypoint?.(target);
    soundManager.playCollectCoin();
  };

  const handleClearWaypoint = () => {
    setWaypoint(null);
    onSetWaypoint?.(null);
  };

  const handleFastTravel = (x: number, z: number) => {
    soundManager.playCollectItem();
    onTeleport(x, z);
    onClose();
  };

  // Distance to waypoint
  let waypointDist = 0;
  if (waypoint) {
    const dx = waypoint.x - playerPos.x;
    const dz = waypoint.z - playerPos.z;
    waypointDist = Math.round(Math.sqrt(dx * dx + dz * dz));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-full max-w-4xl h-[92vh] bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Map Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                BANGLADESH DREAM WORLD MAP · <span className="text-emerald-400 font-medium">মানচিত্র</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Player GPS: X: {Math.round(playerPos.x)}, Z: {Math.round(playerPos.z)} · Tap map to place Waypoint
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {waypoint && (
              <button
                onClick={handleClearWaypoint}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear Pin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Map Canvas Playfield */}
        <div
          onClick={handleMapClick}
          className="flex-1 relative bg-slate-950 overflow-hidden border-b border-slate-800 cursor-crosshair"
        >
          {/* Visual Regions representation */}
          {/* 1. City Zone (West) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-slate-900/90 border-r border-slate-800 pointer-events-none"
            style={{ width: `${toMapPercentX(65)}%` }}
          >
            <div className="absolute top-4 left-5 text-slate-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
              Dhaka City Avenue
              <div className="text-[10px] text-slate-500 font-normal">Modern Commercial District</div>
            </div>
            {/* Roads */}
            <div className="absolute top-[43%] left-0 right-0 h-4 bg-slate-800" />
            <div className="absolute top-0 bottom-0 left-[60%] w-4 bg-slate-800" />
          </div>

          {/* 2. River Padma (Blue Ribbon Channel) */}
          <div
            className="absolute top-0 bottom-0 bg-sky-950/80 border-x-2 border-sky-800/40 pointer-events-none"
            style={{
              left: `${toMapPercentX(65)}%`,
              width: `${toMapPercentX(115) - toMapPercentX(65)}%`,
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-sky-400/60 font-black tracking-widest text-[11px]">
              PADMA RIVER
            </div>
            {/* Grand Bridge Crossing */}
            <div className="absolute top-[43%] left-0 right-0 h-4 bg-amber-500/80 border-y border-amber-300 flex items-center justify-center">
              <span className="text-[8px] font-bold text-slate-950 tracking-tighter">PADMA BRIDGE</span>
            </div>
          </div>

          {/* 3. Shonar Village (South-East) */}
          <div
            className="absolute bottom-0 right-0 bg-emerald-950/40 border-t border-emerald-900/30 pointer-events-none"
            style={{
              left: `${toMapPercentX(115)}%`,
              height: `${100 - toMapPercentY(25)}%`,
            }}
          >
            <div className="absolute bottom-5 right-6 text-emerald-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
              Shonar Village
              <div className="text-[10px] text-emerald-500/80 font-normal">Paddy Fields & River Ghat</div>
            </div>
          </div>

          {/* 4. Sylhet Mountain & Waterfall (North-East) */}
          <div
            className="absolute top-0 right-0 bg-stone-900/80 border-l border-stone-800 pointer-events-none"
            style={{
              left: `${toMapPercentX(180)}%`,
              height: `${toMapPercentY(25)}%`,
            }}
          >
            <div className="absolute top-4 right-6 text-sky-300 font-bold text-xs sm:text-sm tracking-wider uppercase">
              Sylhet Hills & Waterfall
              <div className="text-[10px] text-sky-400/80 font-normal">Mountain Trail & Misty Cascade</div>
            </div>
          </div>

          {/* Direction indicator vector from player to waypoint */}
          {waypoint && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              <line
                x1={`${toMapPercentX(playerPos.x)}%`}
                y1={`${toMapPercentY(playerPos.z)}%`}
                x2={`${toMapPercentX(waypoint.x)}%`}
                y2={`${toMapPercentY(waypoint.z)}%`}
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
            </svg>
          )}

          {/* Custom Player Waypoint Pin */}
          {waypoint && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-30"
              style={{
                left: `${toMapPercentX(waypoint.x)}%`,
                top: `${toMapPercentY(waypoint.z)}%`,
              }}
            >
              <div className="w-7 h-7 rounded-full bg-sky-400 border-2 border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 animate-bounce">
                <Flag className="w-4 h-4 fill-slate-950 text-slate-950" />
              </div>
              <div className="bg-slate-950/95 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1 border border-sky-400/50 whitespace-nowrap">
                Destination: {waypointDist}m
              </div>
            </div>
          )}

          {/* Active Quest Objective Pin */}
          {currentObj && (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-25"
              style={{
                left: `${toMapPercentX(currentObj.targetPos.x)}%`,
                top: `${toMapPercentY(currentObj.targetPos.z)}%`,
              }}
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-slate-950 shadow-lg flex items-center justify-center text-slate-950 animate-bounce">
                <MapPin className="w-4 h-4 fill-slate-950" />
              </div>
              <div className="bg-slate-950/90 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded shadow mt-0.5 whitespace-nowrap border border-amber-500/40">
                {currentObj.targetRegion}
              </div>
            </div>
          )}

          {/* Player Position Pin */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-40 pointer-events-none"
            style={{
              left: `${toMapPercentX(playerPos.x)}%`,
              top: `${toMapPercentY(playerPos.z)}%`,
            }}
          >
            <div
              className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center transition-transform"
              style={{ transform: `rotate(${(-playerYaw * 180) / Math.PI}deg)` }}
            >
              <Navigation className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Footer: Fast Travel Landmarks & Waypoint Actions */}
        <div className="p-3.5 bg-slate-950 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Fast Travel:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleFastTravel(10, 14)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                🏢 City Cha Stall
              </button>
              <button
                onClick={() => handleFastTravel(87, 3)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                🌉 Padma Bridge
              </button>
              <button
                onClick={() => handleFastTravel(165, 95)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                🌾 Shonar Village
              </button>
              <button
                onClick={() => handleFastTravel(255, -85)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                🌊 Sylhet Waterfall
              </button>
            </div>
          </div>

          {waypoint && (
            <button
              onClick={() => handleFastTravel(waypoint.x, waypoint.z)}
              className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-lg flex items-center gap-1 transition-all"
            >
              <Navigation className="w-3.5 h-3.5 fill-slate-950" /> Teleport to Waypoint
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
