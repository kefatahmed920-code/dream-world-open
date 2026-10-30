/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CharacterRig, CharacterAppearance, CHARACTER_PRESETS, DEFAULT_PLAYER_APPEARANCE } from '../character/characterModel';
import { X, Sparkles, Check, RotateCw, User, Scissors, Palette } from 'lucide-react';

interface CharacterSelectModalProps {
  isOpen: boolean;
  currentAppearance: CharacterAppearance;
  onSave: (appearance: CharacterAppearance) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  currentAppearance,
  onSave,
  onClose,
}) => {
  const [appearance, setAppearance] = useState<CharacterAppearance>({ ...currentAppearance });
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'colors'>('presets');
  const previewMountRef = useRef<HTMLDivElement>(null);
  const previewSceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rig: CharacterRig | null;
    rotationAngle: number;
    frameId: number;
  } | null>(null);

  // Initialize preview 3D turntable canvas
  useEffect(() => {
    if (!isOpen || !previewMountRef.current) return;

    const mount = previewMountRef.current;
    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 2.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(2, 3, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    fillLight.position.set(-3, 2, -1);
    scene.add(fillLight);

    // Circular pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.08, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(0.68, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    // Character Rig
    const rig = new CharacterRig(appearance);
    scene.add(rig.group);

    const previewState = {
      renderer,
      scene,
      camera,
      rig,
      rotationAngle: 0,
      frameId: 0,
    };
    previewSceneRef.current = previewState;

    let lastT = performance.now();
    const animate = (t: number) => {
      const dt = (t - lastT) / 1000;
      lastT = t;

      if (previewState.rig) {
        previewState.rotationAngle += dt * 0.45; // Gentle 360 turntable
        previewState.rig.group.rotation.y = previewState.rotationAngle;
        previewState.rig.updateAnimation(dt, 0, false, false); // Idle breathe
      }

      renderer.render(scene, camera);
      previewState.frameId = requestAnimationFrame(animate);
    };

    previewState.frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(previewState.frameId);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      previewSceneRef.current = null;
    };
  }, [isOpen]);

  // Re-render rig in turntable when appearance changes
  useEffect(() => {
    if (!previewSceneRef.current) return;
    const { scene, rig } = previewSceneRef.current;
    if (rig) {
      scene.remove(rig.group);
    }
    const newRig = new CharacterRig(appearance);
    newRig.group.rotation.y = previewSceneRef.current.rotationAngle;
    scene.add(newRig.group);
    previewSceneRef.current.rig = newRig;
  }, [appearance]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetKey: string) => {
    const selected = CHARACTER_PRESETS[presetKey];
    if (selected) {
      setAppearance({ ...selected.appearance });
    }
  };

  const handleRotateManual = () => {
    if (previewSceneRef.current) {
      previewSceneRef.current.rotationAngle += Math.PI / 4;
    }
  };

  const handleConfirm = () => {
    onSave(appearance);
    onClose();
  };

  const skinColors = ['#f4c29e', '#d99c73', '#c68a62', '#bd8058', '#b57b53', '#8c5837'];
  const hairColors = ['#111111', '#1c1917', '#2e1c14', '#451a03', '#78350f', '#0284c7'];
  const clothesColors = [
    '#2b5c8f', '#1d3e64', '#0284c7', '#0d9488', '#15803d',
    '#e11d48', '#be123c', '#7e22ce', '#d97706', '#1e293b', '#f8fafc',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Turntable Preview */}
        <div className="relative w-full md:w-5/12 h-64 md:h-auto bg-slate-950 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/80">
          <div ref={previewMountRef} className="w-full h-full min-h-[260px]" />
          
          {/* Turntable Control Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-emerald-400 backdrop-blur-sm pointer-events-auto">
              360° Live Preview
            </span>
            <button
              onClick={handleRotateManual}
              className="p-2 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white pointer-events-auto transition active:scale-95 shadow-lg"
              title="Rotate View"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Customization Controls */}
        <div className="flex-1 p-5 md:p-7 flex flex-col overflow-y-auto max-h-[60vh] md:max-h-[88vh]">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Character Customization
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white">Choose Your Avatar</h2>
            <p className="text-xs text-slate-400">
              Customize your Bangladeshi explorer for open-world single-player and multiplayer co-op.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-4 border border-slate-700/60">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'presets'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" /> Presets
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'custom'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" /> Style & Body
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition ${
                activeTab === 'colors'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Colors & Fabrics
            </button>
          </div>

          {/* Tab 1: Presets Grid */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(CHARACTER_PRESETS).map(([key, data]) => {
                  const isSelected =
                    appearance.hairStyle === data.appearance.hairStyle &&
                    appearance.gender === data.appearance.gender &&
                    appearance.shirtColor === data.appearance.shirtColor;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-white">{data.name}</span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-700/60 text-emerald-400">
                            {data.appearance.gender}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{data.title}</div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: data.appearance.shirtColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: data.appearance.pantsColor }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: data.appearance.skinTone }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Style & Anatomy */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              {/* Gender Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Body Anatomy
                </label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setAppearance((prev) => ({ ...prev, gender: g }))}
                      className={`flex-1 py-2.5 rounded-xl border text-xs font-bold uppercase transition ${
                        appearance.gender === g
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {g === 'male' ? 'Male (Athletic)' : 'Female (Curved)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hairstyle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['styled', 'short', 'wavy', 'buzz', 'ponytail', 'braid', 'bob'] as const).map((hs) => (
                    <button
                      key={hs}
                      onClick={() => setAppearance((prev) => ({ ...prev, hairStyle: hs }))}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium capitalize transition ${
                        appearance.hairStyle === hs
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-200'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {hs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories Toggles */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Accessories & Garments
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAppearance((p) => ({ ...p, hasJacket: !p.hasJacket }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      appearance.hasJacket
                        ? 'bg-emerald-950/80 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>Denim Jacket</span>
                    {appearance.hasJacket && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => setAppearance((p) => ({ ...p, hasGlasses: !p.hasGlasses }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      appearance.hasGlasses
                        ? 'bg-emerald-950/80 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>Spectacles</span>
                    {appearance.hasGlasses && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => setAppearance((p) => ({ ...p, hasGamcha: !p.hasGamcha }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      appearance.hasGamcha
                        ? 'bg-emerald-950/80 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>Bengali Gamcha</span>
                    {appearance.hasGamcha && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => setAppearance((p) => ({ ...p, hasDupatta: !p.hasDupatta }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      appearance.hasDupatta
                        ? 'bg-emerald-950/80 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>Dupatta Scarf</span>
                    {appearance.hasDupatta && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Colors */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              {/* Skin Tone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Skin Tone
                </label>
                <div className="flex gap-2">
                  {skinColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAppearance((p) => ({ ...p, skinTone: c }))}
                      className={`w-9 h-9 rounded-xl border-2 transition ${
                        appearance.skinTone === c ? 'border-emerald-400 scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hair Color
                </label>
                <div className="flex gap-2">
                  {hairColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAppearance((p) => ({ ...p, hairColor: c }))}
                      className={`w-9 h-9 rounded-xl border-2 transition ${
                        appearance.hairColor === c ? 'border-emerald-400 scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt / Top Color */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Shirt / Top Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {clothesColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAppearance((p) => ({ ...p, shirtColor: c }))}
                      className={`w-8 h-8 rounded-xl border-2 transition ${
                        appearance.shirtColor === c ? 'border-emerald-400 scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Pants / Bottom Color */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Pants / Bottom Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {clothesColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setAppearance((p) => ({ ...p, pantsColor: c }))}
                      className={`w-8 h-8 rounded-xl border-2 transition ${
                        appearance.pantsColor === c ? 'border-emerald-400 scale-110 shadow-lg' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons: Apply, Cancel, Reset to Default, and Back */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAppearance({ ...DEFAULT_PLAYER_APPEARANCE })}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              title="Reset all settings to default avatar"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold text-xs transition"
            >
              Back
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Apply & Equip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
