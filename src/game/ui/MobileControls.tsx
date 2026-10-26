/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Zap, MessageSquare, Car, Map as MapIcon } from 'lucide-react';
import { InputManager } from '../controls/inputManager';

interface MobileControlsProps {
  inputManager: InputManager;
  isDriving: boolean;
  canInteract: boolean;
  canDrive: boolean;
  onOpenMap: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  inputManager,
  isDriving,
  canInteract,
  canDrive,
  onOpenMap,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickThumbPos, setJoystickThumbPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);

  // Right touch camera swipe area
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCameraTouchPos = useRef<{ x: number; y: number } | null>(null);

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
    const maxRadius = rect.width / 2 - 10;
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

  // Right-side camera drag swipe
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
    <div className="absolute inset-0 pointer-events-none select-none z-20">
      {/* Right Side: 360-Degree Camera Swipe Touchpad */}
      <div
        className="absolute top-24 right-0 bottom-24 w-1/2 pointer-events-auto touch-none"
        onTouchStart={handleCameraTouchStart}
        onTouchMove={handleCameraTouchMove}
        onTouchEnd={handleCameraTouchEnd}
        onTouchCancel={handleCameraTouchEnd}
      />

      {/* Left Side: Virtual Analog Joystick */}
      <div className="absolute bottom-6 left-6 pointer-events-auto touch-none">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-colors shadow-2xl ${
            isJoystickActive
              ? 'bg-slate-900/80 border-emerald-400'
              : 'bg-slate-950/60 border-slate-700/60'
          }`}
        >
          {/* Inner ring */}
          <div className="w-16 h-16 rounded-full border border-slate-700/50" />

          {/* Draggable Thumb Knob */}
          <div
            className={`w-14 h-14 rounded-full border-2 shadow-lg absolute transition-transform pointer-events-none ${
              isJoystickActive
                ? 'bg-emerald-500 border-emerald-300 scale-105'
                : 'bg-slate-800 border-slate-600'
            }`}
            style={{
              transform: `translate(${joystickThumbPos.x}px, ${joystickThumbPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right Side: Mobile Action Buttons */}
      <div className="absolute bottom-6 right-6 pointer-events-auto flex flex-col items-end gap-3 touch-none">
        {/* Drive / Exit Vehicle Button */}
        {(canDrive || isDriving) && (
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              inputManager.virtualDrive = true;
            }}
            className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-bold border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
          >
            <Car className="w-6 h-6" />
            <span className="text-[9px] font-black">{isDriving ? 'EXIT' : 'DRIVE'}</span>
          </button>
        )}

        {/* Talk / Interact Button */}
        {canInteract && !isDriving && (
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              inputManager.virtualInteract = true;
            }}
            className="w-14 h-14 rounded-2xl bg-sky-500 text-white font-bold border-2 border-sky-300 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="text-[9px] font-black">TALK</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Sprint Toggle Button */}
          {!isDriving && (
            <button
              onTouchStart={(e) => {
                e.stopPropagation();
                inputManager.virtualSprint = !inputManager.virtualSprint;
              }}
              className={`w-13 h-13 rounded-2xl border-2 shadow-xl flex flex-col items-center justify-center active:scale-95 transition-all ${
                inputManager.virtualSprint
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-900/80 text-slate-200 border-slate-700'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span className="text-[8px] font-black">RUN</span>
            </button>
          )}

          {/* Jump / Handbrake Button */}
          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              inputManager.virtualJump = true;
            }}
            className="w-16 h-16 rounded-3xl bg-emerald-500 text-slate-950 font-black border-2 border-emerald-300 shadow-2xl flex flex-col items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowUp className="w-7 h-7" />
            <span className="text-[9px] font-black">{isDriving ? 'BRAKE' : 'JUMP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
