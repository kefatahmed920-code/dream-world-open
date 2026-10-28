/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Car, MessageSquare, Hand, Sparkles } from 'lucide-react';
import { InputManager } from '../controls/inputManager';

interface MobileControlsProps {
  inputManager: InputManager;
  isDriving: boolean;
  canInteract: boolean;
  canDrive: boolean;
  interactionPrompt?: string | null;
  playerStance?: 'stand' | 'crouch' | 'prone' | 'swim';
  isSwimming?: boolean;
  onOpenInventory?: () => void;
  onOpenMap?: () => void;
}

// Tactical SVG silhouette icons for Free Fire / PUBG inspired mobile controls
const JumpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <circle cx="12" cy="4" r="2.2" />
    <path d="M12 7c-1.1 0-2 .9-2 2v3l-2.5 1.5.8 1.8 2.7-1.6V17l-2 3.5 1.7 1 2.3-4.1 2.3 4.1 1.7-1-2-3.5v-3.3l2.7 1.6.8-1.8L14 12V9c0-1.1-.9-2-2-2z" />
  </svg>
);

const CrouchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <circle cx="15.5" cy="5.5" r="2.2" />
    <path d="M14 9c-.9 0-1.7.5-2.1 1.3L10 14l-3-1v2.2l3.4 1.1 2.4-4.8 1.7 1.7V20h2.5v-6.5l-2-2 1.5-1.5c.3.5.9.8 1.5.8h2V9h-3.5z" />
  </svg>
);

const ProneIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <circle cx="5" cy="12" r="2" />
    <path d="M8 12.5c0-.6.4-1.1 1-1.2l6-1c.6-.1 1.2.2 1.5.8l2 3.5-1.8 1-1.6-2.8-2.6.4v3.8H11v-4.3l-2.4.4c-.4.1-.6-.2-.6-.6z" />
    <path d="M15 15h6v2h-6z" />
  </svg>
);

const RunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <circle cx="14" cy="4" r="2.2" />
    <path d="M13.5 7.5c-1 0-1.8.6-2.2 1.5L9 14l3.5 1.8 1.2-2.8 1.8 1.5V20h2.5v-6.5l-2.2-2.2 1.2-2.3c.4.6 1.1 1 1.9 1H20V9h-2.5l-2-2.2c-.5-.5-1.2-.8-2-.8zM5 18l3-5-1.8-1-2.7 4.5L5 18z" />
  </svg>
);

const BackpackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M8 3c-1.1 0-2 .9-2 2v1H5c-1.1 0-2 .9-2 2v10c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V8c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H8zm0 2h8v1H8V5zm-3 5h14v3H5v-3zm0 5h14v4c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-4zm4 1v2h6v-2H9z" />
  </svg>
);

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputManager,
  isDriving,
  canInteract,
  canDrive,
  interactionPrompt,
  playerStance = 'stand',
  isSwimming = false,
  onOpenInventory,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickThumbPos, setJoystickThumbPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Right touch camera swipe area
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCameraTouchPos = useRef<{ x: number; y: number } | null>(null);

  // Sprint toggle state mirror for UI
  const [isSprintActive, setIsSprintActive] = useState(inputManager.virtualSprint);

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickThumbPos({ x: 0, y: 0 });
        inputManager.setTouchMove(0, 0);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2 - 8;
    const distance = Math.sqrt(dx * dx + dy * dy);

    let normX = dx / maxRadius;
    let normY = dy / maxRadius;

    if (distance > maxRadius) {
      normX = dx / distance;
      normY = dy / distance;
    }

    setJoystickThumbPos({ x: normX * maxRadius, y: normY * maxRadius });
    inputManager.setTouchMove(normX, normY);
  };

  // Right-side 360 camera drag swipe
  const handleCameraTouchStart = (e: React.TouchEvent) => {
    if (cameraTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    cameraTouchIdRef.current = touch.identifier;
    lastCameraTouchPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchMove = (e: React.TouchEvent) => {
    if (cameraTouchIdRef.current === null || !lastCameraTouchPos.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchIdRef.current) {
        const dx = touch.clientX - lastCameraTouchPos.current.x;
        const dy = touch.clientY - lastCameraTouchPos.current.y;
        lastCameraTouchPos.current = { x: touch.clientX, y: touch.clientY };
        inputManager.addTouchCameraDelta(dx, dy);
        break;
      }
    }
  };

  const handleCameraTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null;
        lastCameraTouchPos.current = null;
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden">
      {/* 360-Degree Camera Touchpad (Middle and Right half of screen, avoiding UI buttons) */}
      <div
        className="absolute inset-y-0 right-0 w-3/5 pointer-events-auto touch-none"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
        onTouchCancel={handleCameraTouchEnd}
      />

      {/* --- LOWER LEFT: JOYSTICK & BACKPACK --- */}
      <div className="absolute bottom-5 left-5 pointer-events-auto flex items-end gap-3 touch-none">
        {/* Virtual Analog Joystick */}
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-colors shadow-2xl backdrop-blur-xs ${
            isJoystickActive
              ? 'bg-slate-950/70 border-emerald-400/80 shadow-emerald-500/20'
              : 'bg-slate-950/40 border-slate-600/50'
          }`}
        >
          {/* Inner ring & directional ticks */}
          <div className="w-16 h-16 rounded-full border border-white/20" />
          <div className="absolute top-2 w-1 h-2 bg-white/30 rounded-full" />
          <div className="absolute bottom-2 w-1 h-2 bg-white/30 rounded-full" />
          <div className="absolute left-2 w-2 h-1 bg-white/30 rounded-full" />
          <div className="absolute right-2 w-2 h-1 bg-white/30 rounded-full" />

          {/* Draggable Thumb Knob */}
          <div
            className={`w-14 h-14 rounded-full border-2 shadow-lg absolute transition-transform pointer-events-none flex items-center justify-center ${
              isJoystickActive
                ? 'bg-emerald-500/90 border-emerald-200 text-slate-950 scale-105 shadow-emerald-500/50'
                : 'bg-slate-800/80 border-slate-500/60 text-slate-300'
            }`}
            style={{
              transform: `translate(${joystickThumbPos.x}px, ${joystickThumbPos.y}px)`,
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white/50" />
          </div>
        </div>

        {/* Backpack / Inventory Button (Extreme lower-left beside joystick) */}
        {onOpenInventory && (
          <button
            onClick={onOpenInventory}
            onTouchStart={(e) => {
              e.stopPropagation();
              onOpenInventory();
            }}
            title="Open Backpack (I)"
            className="w-12 h-12 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-600/60 shadow-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all mb-1"
          >
            <BackpackIcon />
          </button>
        )}
      </div>

      {/* --- LOWER RIGHT: PUBG / FREE FIRE ACTION BUTTON CLUSTER --- */}
      <div className="absolute bottom-5 right-5 pointer-events-auto flex flex-col items-end gap-2.5 touch-none">
        {/* Contextual Interaction / Drive Button */}
        {(canDrive || isDriving || canInteract || interactionPrompt) && (
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              if (canDrive || isDriving) {
                inputManager.virtualDrive = true;
              } else {
                inputManager.virtualInteract = true;
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/90 hover:bg-amber-400 text-slate-950 font-black border-2 border-amber-300 shadow-2xl flex items-center gap-2 active:scale-95 transition-transform animate-pulse"
          >
            {isDriving ? (
              <>
                <Car className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wide">Exit Vehicle</span>
              </>
            ) : canDrive ? (
              <>
                <Car className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wide">Drive Vehicle</span>
              </>
            ) : (
              <>
                <Hand className="w-5 h-5" />
                <span className="text-xs uppercase tracking-wide">Interact [E]</span>
              </>
            )}
          </button>
        )}

        {/* Driving Handbrake & Gas controls when inside vehicle */}
        {isDriving ? (
          <div className="flex items-center gap-3">
            <button
              onTouchStart={(e) => {
                e.stopPropagation();
                inputManager.virtualJump = true;
              }}
              className="w-16 h-16 rounded-2xl bg-rose-600/90 text-white font-black border-2 border-rose-400 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
            >
              <span className="text-xs font-black">BRAKE</span>
            </button>
          </div>
        ) : (
          /* On-Foot & Swimming Action Buttons Cluster */
          <div className="flex flex-col items-end gap-2.5">
            {/* Top row: Run Toggle and Crouch */}
            <div className="flex items-center gap-2.5">
              {/* Sprint / Run Button */}
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  const next = !inputManager.virtualSprint;
                  inputManager.virtualSprint = next;
                  setIsSprintActive(next);
                }}
                className={`w-12 h-12 rounded-2xl border-2 shadow-xl flex items-center justify-center active:scale-90 transition-all ${
                  isSprintActive
                    ? 'bg-amber-500 border-amber-200 text-slate-950 scale-105 shadow-amber-500/40'
                    : 'bg-slate-950/70 border-slate-700/80 text-slate-300'
                }`}
                title="Toggle Sprint / Run (Shift)"
              >
                <RunIcon />
              </button>

              {/* Crouch Button */}
              {!isSwimming && (
                <button
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    inputManager.virtualCrouch = true;
                  }}
                  className={`w-12 h-12 rounded-2xl border-2 shadow-xl flex items-center justify-center active:scale-90 transition-all ${
                    playerStance === 'crouch'
                      ? 'bg-sky-500 border-sky-200 text-slate-950 scale-105'
                      : 'bg-slate-950/70 border-slate-700/80 text-slate-300'
                  }`}
                  title="Crouch (C)"
                >
                  <CrouchIcon />
                </button>
              )}

              {/* Prone Button */}
              {!isSwimming && (
                <button
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    inputManager.virtualProne = true;
                  }}
                  className={`w-12 h-12 rounded-2xl border-2 shadow-xl flex items-center justify-center active:scale-90 transition-all ${
                    playerStance === 'prone'
                      ? 'bg-sky-500 border-sky-200 text-slate-950 scale-105'
                      : 'bg-slate-950/70 border-slate-700/80 text-slate-300'
                  }`}
                  title="Prone Crawl (Z)"
                >
                  <ProneIcon />
                </button>
              )}
            </div>

            {/* Bottom row: Primary Action Jump Button */}
            <div className="flex items-center gap-3">
              <button
                onTouchStart={(e) => {
                  e.stopPropagation();
                  inputManager.virtualJump = true;
                }}
                className="w-16 h-16 rounded-3xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-black border-2 border-emerald-300 shadow-2xl flex items-center justify-center active:scale-90 transition-transform shadow-emerald-500/30"
                title="Jump / Stand Up (Space)"
              >
                <JumpIcon />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
