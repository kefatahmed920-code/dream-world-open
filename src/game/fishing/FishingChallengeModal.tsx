/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../audio/soundManager';
import { Fish, Trophy, Timer, X, Sparkles } from 'lucide-react';

interface FishingChallengeModalProps {
  isOpen: boolean;
  onFinishChallenge: (playerFish: number, rivalFish: number, rewardTaka: number, rewardExp: number) => void;
  onClose: () => void;
}

export const FishingChallengeModal: React.FC<FishingChallengeModalProps> = ({
  isOpen,
  onFinishChallenge,
  onClose,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2 minutes
  const [playerFish, setPlayerFish] = useState(0);
  const [rivalFish, setRivalFish] = useState(0);
  const [fishBiting, setFishBiting] = useState(false);
  const [reelSuccessMsg, setReelSuccessMsg] = useState<string | null>(null);
  const [challengeFinished, setChallengeFinished] = useState(false);

  const biteTimerRef = useRef<number | null>(null);
  const biteWindowRef = useRef<number | null>(null);
  const rivalCatchTimerRef = useRef<number | null>(null);

  // Initialize or reset challenge
  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(120);
      setPlayerFish(0);
      setRivalFish(0);
      setFishBiting(false);
      setReelSuccessMsg(null);
      setChallengeFinished(false);
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
      if (biteWindowRef.current) clearTimeout(biteWindowRef.current);
      if (rivalCatchTimerRef.current) clearInterval(rivalCatchTimerRef.current);
      return;
    }

    soundManager.playWaterSplash();

    // 1-second countdown interval
    const countdown = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule periodic fish bites for player
    const scheduleNextBite = () => {
      const waitMs = 4000 + Math.random() * 4500; // 4 to 8.5 seconds
      biteTimerRef.current = window.setTimeout(() => {
        setFishBiting(true);
        soundManager.playWaterSplash();

        // 2.2-second window to reel in
        biteWindowRef.current = window.setTimeout(() => {
          setFishBiting(false);
          scheduleNextBite();
        }, 2200);
      }, waitMs);
    };
    scheduleNextBite();

    // Rival Kashem Majhi catches fish at authentic pace (~every 15 to 22 seconds)
    rivalCatchTimerRef.current = window.setInterval(() => {
      setRivalFish((prev) => prev + 1);
      soundManager.playWaterSplash();
    }, 17000);

    return () => {
      clearInterval(countdown);
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
      if (biteWindowRef.current) clearTimeout(biteWindowRef.current);
      if (rivalCatchTimerRef.current) clearInterval(rivalCatchTimerRef.current);
    };
  }, [isOpen]);

  // Handle Game Over
  useEffect(() => {
    if (secondsRemaining === 0 && isOpen && !challengeFinished) {
      setChallengeFinished(true);
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
      if (biteWindowRef.current) clearTimeout(biteWindowRef.current);
      if (rivalCatchTimerRef.current) clearInterval(rivalCatchTimerRef.current);

      soundManager.playLevelUp();
    }
  }, [secondsRemaining, isOpen, challengeFinished]);

  // Handle Reel In Action
  const handleReelIn = () => {
    if (!fishBiting || challengeFinished) return;

    if (biteWindowRef.current) clearTimeout(biteWindowRef.current);
    setFishBiting(false);
    setPlayerFish((prev) => prev + 1);

    const fishTypes = ['রুই মাছ (Rohu Carp)', 'কাতলা মাছ (Catla)', 'ইলিশ মাছ (Hilsa)', 'পাঙ্গাস (Pangasius)', 'চিংড়ি (Tiger Prawn)'];
    const caught = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    setReelSuccessMsg(`+1 ${caught}!`);
    soundManager.playCollectCoin();

    setTimeout(() => {
      setReelSuccessMsg(null);
    }, 1800);

    // Schedule next bite
    const waitMs = 4500 + Math.random() * 4000;
    biteTimerRef.current = window.setTimeout(() => {
      setFishBiting(true);
      soundManager.playWaterSplash();
      biteWindowRef.current = window.setTimeout(() => {
        setFishBiting(false);
      }, 2200);
    }, waitMs);
  };

  // Keyboard Spacebar listener to reel in
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && fishBiting && !challengeFinished) {
        e.preventDefault();
        handleReelIn();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fishBiting, challengeFinished]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isPlayerWinner = playerFish > rivalFish;
  const isTie = playerFish === rivalFish;
  const rewardTaka = isPlayerWinner ? 600 : isTie ? 350 : 200;
  const rewardExp = isPlayerWinner ? 150 : isTie ? 80 : 50;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none flex flex-col justify-between p-4">
      {/* 1. TOP MINIMALIST CHALLENGE HUD BAR */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/50 rounded-2xl px-5 py-2.5 shadow-2xl pointer-events-auto">
        {/* Left: Player Fish Score */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
            <Fish className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">আমার মাছ (You)</span>
            <span className="text-lg font-black text-emerald-400 tabular-nums">{playerFish} টি</span>
          </div>
        </div>

        {/* Center: 2-Minute Countdown Timer */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300">
            <Timer className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-base font-black font-mono tracking-widest">{timeFormatted}</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">২ মিনিট প্রতিযোগিতা</span>
        </div>

        {/* Right: Rival Kashem Majhi Fish Score */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">কাশেম মাঝি (Rival)</span>
            <span className="text-lg font-black text-cyan-400 tabular-nums">{rivalFish} টি</span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
            <Fish className="w-4 h-4" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="ml-3 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          title="খেলা বন্ধ করুন / Exit Challenge"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. REEL-IN PROMPT / BITE POPUP (Clean action cue) */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-auto">
        {fishBiting && !challengeFinished && (
          <button
            onClick={handleReelIn}
            className="px-8 py-4 rounded-3xl bg-gradient-to-r from-amber-500 via-emerald-400 to-teal-400 hover:from-amber-400 hover:to-teal-300 text-slate-950 font-black text-lg uppercase tracking-wider flex items-center gap-3 shadow-2xl shadow-emerald-500/50 animate-bounce active:scale-95 transition-all"
          >
            <Fish className="w-6 h-6 animate-spin" />
            <span>ছিপ টানুন! / REEL IN! (Space)</span>
          </button>
        )}

        {reelSuccessMsg && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 text-sm font-bold shadow-xl animate-fade-in">
            {reelSuccessMsg}
          </div>
        )}
      </div>

      {/* 3. CHALLENGE FINISHED RESULT BANNER */}
      {challengeFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/70 rounded-3xl p-6 text-center text-white shadow-2xl shadow-emerald-500/25 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/30">
              <Trophy className="w-8 h-8 text-slate-950" />
            </div>

            <h3 className="text-2xl font-black text-amber-300">
              {isPlayerWinner ? 'অভিনন্দন! আপনি জিতেছেন!' : isTie ? 'অসাধারণ ড্র হয়েছে!' : 'ভালো প্রতিযোগিতা হয়েছে!'}
            </h3>

            <p className="text-xs text-slate-300">
              {isPlayerWinner
                ? `আপনি ${playerFish} টি মাছ ধরে কাশেম মাঝিকে হারিয়েছেন!`
                : `কাশেম মাঝি ধরেছে ${rivalFish} টি, আপনি ধরেছেন ${playerFish} টি মাছ।`}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[11px] text-slate-400 block font-semibold">পুরস্কার টাকা</span>
                <span className="text-base font-black text-emerald-400">+{rewardTaka} ৳</span>
              </div>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <span className="text-[11px] text-slate-400 block font-semibold">পুরস্কার EXP</span>
                <span className="text-base font-black text-cyan-400">+{rewardExp} EXP</span>
              </div>
            </div>

            <button
              onClick={() => {
                onFinishChallenge(playerFish, rivalFish, rewardTaka, rewardExp);
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>পুরস্কার গ্রহণ করুন / Claim Rewards</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
