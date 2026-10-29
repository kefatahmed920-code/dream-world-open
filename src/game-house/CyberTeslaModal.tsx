/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RotateCcw, Zap, Gauge, Award, Volume2, VolumeX } from 'lucide-react';
import { GameEngine, GameEngineCallbacks } from './games/tesla-data/Bangladeshi-tesla--main/src/game/GameEngine';
import { GameScoreState, VehicleStage } from './games/tesla-data/Bangladeshi-tesla--main/src/types/game';
import { soundManager } from '../game/audio/soundManager';

interface CyberTeslaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CyberTeslaModal: React.FC<CyberTeslaModalProps> = ({ isOpen, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('title');
  const [scoreState, setScoreState] = useState<GameScoreState>({
    currentScore: 0,
    distance: 0,
    coinsCollected: 0,
    multiplier: 1.0,
    combo: 0,
    nearMisses: 0,
    skitchBonus: 0,
    speedKmh: 45,
  });
  const [currentVehicle, setCurrentVehicle] = useState<VehicleStage>('skateboard');
  const [gameOverReason, setGameOverReason] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const callbacks: GameEngineCallbacks = {
      onScoreUpdate: (st) => setScoreState({ ...st }),
      onVehicleChange: (stage) => setCurrentVehicle(stage),
      onGameOver: (finalStats, reason) => {
        setScoreState({ ...finalStats });
        setGameOverReason(reason);
        setGameState('gameover');
      },
      onFloatingNotification: () => {},
      onSkitchStateChange: () => {},
      onPickupAvailable: () => {},
    };

    const engine = new GameEngine(containerRef.current, callbacks);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartGame = () => {
    soundManager.playUiClick();
    setGameState('playing');
  };

  const handleRestart = () => {
    soundManager.playUiClick();
    setGameState('playing');
    // Re-mount cleanly
    if (engineRef.current) {
      engineRef.current.dispose();
      if (containerRef.current) {
        const callbacks: GameEngineCallbacks = {
          onScoreUpdate: (st) => setScoreState({ ...st }),
          onVehicleChange: (stage) => setCurrentVehicle(stage),
          onGameOver: (finalStats, reason) => {
            setScoreState({ ...finalStats });
            setGameOverReason(reason);
            setGameState('gameover');
          },
          onFloatingNotification: () => {},
          onSkitchStateChange: () => {},
          onPickupAvailable: () => {},
        };
        const engine = new GameEngine(containerRef.current, callbacks);
        engineRef.current = engine;
        engine.start();
      }
    }
  };

  const handleExit = () => {
    soundManager.playUiClick();
    engineRef.current?.pause();
    onClose();
  };

  const simulateKey = (code: string, isDown: boolean) => {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { code }));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none pointer-events-auto">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden" />

      {/* Top Header Navigation Bar */}
      <div className="relative z-10 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent">
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-2xl text-xs font-bold text-white transition-all active:scale-95 backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Return to Dream World</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/40 rounded-2xl px-3 py-1.5 backdrop-blur-xs">
          <Zap className="w-4 h-4 text-cyan-400" />
          <div className="text-xs font-black tracking-wider uppercase">
            <span className="text-white">Game House · </span>
            <span className="text-cyan-400">Door 01: Cyber EV Challenge</span>
          </div>
        </div>

        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* In-Game Playing HUD Overlay */}
      {gameState === 'playing' && (
        <div className="relative z-10 flex flex-col justify-between flex-1 p-4 pointer-events-none">
          {/* Top Metric Cards */}
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Distance</div>
                  <div className="text-base font-black font-mono text-emerald-400">
                    {Math.floor(scoreState.distance)}m
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-3.5 py-1.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold">Score</div>
                  <div className="text-base font-black font-mono text-cyan-400">
                    {Math.floor(scoreState.currentScore).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-2xl px-3 py-1 text-xs font-bold text-cyan-300 uppercase">
              {currentVehicle}
            </div>
          </div>

          {/* On-Screen Mobile Touch Controls */}
          <div className="flex items-end justify-between pointer-events-auto pb-4">
            <div className="flex gap-2">
              <button
                onTouchStart={() => simulateKey('KeyA', true)}
                onTouchEnd={() => simulateKey('KeyA', false)}
                onMouseDown={() => simulateKey('KeyA', true)}
                onMouseUp={() => simulateKey('KeyA', false)}
                className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 font-black text-xl text-cyan-400 active:scale-95 shadow-xl flex items-center justify-center"
              >
                ◀
              </button>
              <button
                onTouchStart={() => simulateKey('KeyD', true)}
                onTouchEnd={() => simulateKey('KeyD', false)}
                onMouseDown={() => simulateKey('KeyD', true)}
                onMouseUp={() => simulateKey('KeyD', false)}
                className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 font-black text-xl text-cyan-400 active:scale-95 shadow-xl flex items-center justify-center"
              >
                ▶
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => engineRef.current?.triggerSlide()}
                className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-600 font-bold text-xs text-amber-300 active:scale-95 shadow-xl flex items-center justify-center uppercase"
              >
                Duck
              </button>
              <button
                onClick={() => engineRef.current?.triggerJump()}
                className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500 font-bold text-xs text-emerald-300 active:scale-95 shadow-xl flex items-center justify-center uppercase"
              >
                Jump
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-slate-900/95 border-2 border-cyan-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-cyan-950 border border-cyan-500 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-white tracking-wide uppercase">
              Cyber EV Highway Challenge
            </h2>
            <div className="text-xs font-bold text-cyan-400 mt-0.5">সাইবার ইভি হাইওয়ে চ্যালেঞ্জ</div>
            <p className="text-xs text-slate-300 mt-2 mb-6">
              Dodge Dhaka highway traffic, skitch behind buses and CNGs, upgrade to electric vehicles, and score massive combos!
            </p>
            <button
              onClick={handleStartGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-102 active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Launch Highway Run</span>
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-slate-900/95 border-2 border-rose-500/60 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-black text-rose-400 tracking-wide uppercase">
              Run Completed!
            </h2>
            <div className="text-xs text-slate-400 mt-1">{gameOverReason || 'Traffic Collision'}</div>

            <div className="grid grid-cols-2 gap-2.5 w-full my-5">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Final Score</div>
                <div className="text-lg font-black font-mono text-cyan-400">
                  {Math.floor(scoreState.currentScore).toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Distance</div>
                <div className="text-lg font-black font-mono text-emerald-400">
                  {Math.floor(scoreState.distance)}m
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-xl transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={handleExit}
                className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
              >
                <span>Exit to World</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
