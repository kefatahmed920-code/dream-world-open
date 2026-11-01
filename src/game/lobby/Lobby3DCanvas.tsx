/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterRig, CharacterAppearance } from '../character/characterModel';
import { PetCompanionModel, PetType } from './PetCompanionModel';

interface Lobby3DCanvasProps {
  appearance: CharacterAppearance;
  petType: PetType;
  isAutoRotating?: boolean;
}

export const Lobby3DCanvas: React.FC<Lobby3DCanvasProps> = ({
  appearance,
  petType,
  isAutoRotating = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rig: CharacterRig | null;
    pet: PetCompanionModel | null;
    stageGroup: THREE.Group;
    particlesMesh: THREE.Points;
    hologramRing1: THREE.Mesh;
    hologramRing2: THREE.Mesh;
    rotationAngle: number;
    rotationVelocity: number;
    isDragging: boolean;
    lastMouseX: number;
    frameId: number;
    lastTime: number;
  } | null>(null);

  // Initialize Three.js Lobby Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // Deep futuristic slate-night
    scene.fog = new THREE.FogExp2(0x030712, 0.08);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // Framed for landscape-first full body character & pet visibility
    camera.position.set(0, 1.15, 3.8);
    camera.lookAt(0, 0.88, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Cinematic Studio & Rim Lighting (PUBG/Free Fire lobby aesthetic)
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    // Key front-angled warm spotlight
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.8);
    keyLight.position.set(2.5, 4.0, 3.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    // Fill cyan cool light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    fillLight.position.set(-3.2, 2.5, 2.0);
    scene.add(fillLight);

    // Gold/Amber rear rim light for silhouette edge glow
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.4);
    rimLight.position.set(0, 3.2, -3.0);
    scene.add(rimLight);

    // Pedestal accent glow
    const pedestalLight = new THREE.PointLight(0x10b981, 1.6, 3.5);
    pedestalLight.position.set(0, 0.2, 0);
    scene.add(pedestalLight);

    // 4. Futuristic Podium & Holographic Pedestal
    const stageGroup = new THREE.Group();

    // Metallic Chamfered Podium
    const podGeo = new THREE.CylinderGeometry(1.25, 1.45, 0.16, 48);
    const podMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.22,
    });
    const podium = new THREE.Mesh(podGeo, podMat);
    podium.position.y = -0.08;
    podium.receiveShadow = true;
    stageGroup.add(podium);

    // Inner glowing ring
    const innerRingGeo = new THREE.RingGeometry(1.05, 1.15, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.003;
    stageGroup.add(innerRing);

    // Outer rotating holographic cyber reticles
    const ring1Geo = new THREE.RingGeometry(1.48, 1.54, 48);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const hologramRing1 = new THREE.Mesh(ring1Geo, ring1Mat);
    hologramRing1.rotation.x = -Math.PI / 2;
    hologramRing1.position.y = 0.005;
    stageGroup.add(hologramRing1);

    const ring2Geo = new THREE.RingGeometry(1.68, 1.72, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const hologramRing2 = new THREE.Mesh(ring2Geo, ring2Mat);
    hologramRing2.rotation.x = -Math.PI / 2;
    hologramRing2.position.y = 0.006;
    stageGroup.add(hologramRing2);

    // Surrounding Floor Grid
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fCtx = floorCanvas.getContext('2d')!;
    fCtx.fillStyle = '#020617';
    fCtx.fillRect(0, 0, 256, 256);
    fCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    fCtx.lineWidth = 1.5;
    fCtx.strokeRect(0, 0, 256, 256);

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(12, 12);

    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.4,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.16;
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. Overhead Sci-Fi Backdrop Wall & Holographic Banner
    const bannerGroup = new THREE.Group();
    bannerGroup.position.set(0, 1.6, -2.8);

    const bCanvas = document.createElement('canvas');
    bCanvas.width = 512;
    bCanvas.height = 128;
    const bCtx = bCanvas.getContext('2d')!;
    bCtx.fillStyle = 'rgba(2, 6, 23, 0.6)';
    bCtx.fillRect(0, 0, 512, 128);
    bCtx.strokeStyle = '#38bdf8';
    bCtx.lineWidth = 4;
    bCtx.strokeRect(8, 8, 496, 112);

    bCtx.fillStyle = '#f59e0b';
    bCtx.font = '900 36px Impact, Arial Black, sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('DREAM WORLD', 256, 52);

    bCtx.fillStyle = '#38bdf8';
    bCtx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    bCtx.fillText('DHAKA BATTLEGROUNDS & COUNTRYSIDE', 256, 90);

    const bannerTex = new THREE.CanvasTexture(bCanvas);
    bannerTex.colorSpace = THREE.SRGBColorSpace;
    const bannerMat = new THREE.MeshBasicMaterial({
      map: bannerTex,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), bannerMat);
    bannerGroup.add(banner);
    scene.add(bannerGroup);

    // 6. Floating Cyber Dust Particles (Ambient Sci-Fi Vibe)
    const particleCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 5.0;
      pPos[i + 1] = Math.random() * 3.0;
      pPos[i + 2] = (Math.random() - 0.5) * 4.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particlesMesh = new THREE.Points(pGeo, pMat);
    scene.add(particlesMesh);

    // 7. Add 3D Character Rig
    const rig = new CharacterRig(appearance);
    rig.group.position.set(0, 0, 0);
    stageGroup.add(rig.group);

    // 8. Add Pet Companion beside character
    const pet = new PetCompanionModel(petType);
    pet.group.position.set(0.68, 0, 0.15);
    pet.group.rotation.y = -0.35;
    stageGroup.add(pet.group);

    scene.add(stageGroup);

    stateRef.current = {
      renderer,
      scene,
      camera,
      rig,
      pet,
      stageGroup,
      particlesMesh,
      hologramRing1,
      hologramRing2,
      rotationAngle: 0,
      rotationVelocity: 0,
      isDragging: false,
      lastMouseX: 0,
      frameId: 0,
      lastTime: performance.now(),
    };

    // 9. Touch & Drag Event Handlers for 360° Character Rotation
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      stateRef.current.isDragging = true;
      stateRef.current.lastMouseX = clientX;
      stateRef.current.rotationVelocity = 0;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current || !stateRef.current.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - stateRef.current.lastMouseX;
      stateRef.current.lastMouseX = clientX;

      const rotSpeed = 0.008;
      stateRef.current.rotationAngle += deltaX * rotSpeed;
      stateRef.current.rotationVelocity = deltaX * rotSpeed;
    };

    const onPointerUp = () => {
      if (stateRef.current) {
        stateRef.current.isDragging = false;
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // 10. Responsive Resize Handler
    const handleResize = () => {
      if (!stateRef.current || !mountRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;
      const aspect = w / h;
      stateRef.current.camera.aspect = aspect;

      // Dynamically optimize camera framing for mobile landscape viewports
      if (aspect >= 1.6) {
        stateRef.current.camera.position.set(0, 1.08, 3.4);
        stateRef.current.camera.lookAt(0, 0.86, 0);
      } else {
        stateRef.current.camera.position.set(0, 1.15, 3.8);
        stateRef.current.camera.lookAt(0, 0.88, 0);
      }

      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 11. Animation Tick Loop
    const animate = (now: number) => {
      if (!stateRef.current) return;
      const state = stateRef.current;
      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;

      // Handle Character Rotation & Momentum Damping
      if (!state.isDragging) {
        if (isAutoRotating) {
          state.rotationAngle += dt * 0.45;
        } else {
          // Natural friction deceleration
          state.rotationAngle += state.rotationVelocity;
          state.rotationVelocity *= 0.92;
          if (Math.abs(state.rotationVelocity) < 0.0001) {
            state.rotationVelocity = 0;
          }
        }
      }

      state.stageGroup.rotation.y = state.rotationAngle;

      // Holographic Ring counter-rotations
      state.hologramRing1.rotation.z += dt * 0.35;
      state.hologramRing2.rotation.z -= dt * 0.25;

      // Particle floating drift
      const pAttr = state.particlesMesh.geometry.attributes.position as THREE.BufferAttribute;
      const pArr = pAttr.array as Float32Array;
      for (let i = 1; i < pArr.length; i += 3) {
        pArr[i] += dt * 0.18;
        if (pArr[i] > 3.2) pArr[i] = 0.05;
      }
      pAttr.needsUpdate = true;

      // Character Natural Idle Stance Animation
      if (state.rig) {
        state.rig.updateAnimation(dt, 0, false, false);
      }

      // Pet Companion Animation
      if (state.pet) {
        state.pet.update(dt);
      }

      state.renderer.render(state.scene, state.camera);
      state.frameId = requestAnimationFrame(animate);
    };

    if (stateRef.current) {
      stateRef.current.frameId = requestAnimationFrame(animate);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      if (stateRef.current) {
        cancelAnimationFrame(stateRef.current.frameId);
        renderer.dispose();
        if (dom.parentElement) {
          dom.parentElement.removeChild(dom);
        }
        stateRef.current = null;
      }
    };
  }, [isAutoRotating]);

  // Update Appearance Dynamically
  useEffect(() => {
    if (!stateRef.current) return;
    const current = stateRef.current;
    if (current.rig) {
      current.stageGroup.remove(current.rig.group);
    }
    current.rig = new CharacterRig(appearance);
    current.stageGroup.add(current.rig.group);
  }, [appearance]);

  // Update Pet Dynamically
  useEffect(() => {
    if (!stateRef.current || !stateRef.current.pet) return;
    stateRef.current.pet.setType(petType);
  }, [petType]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};
