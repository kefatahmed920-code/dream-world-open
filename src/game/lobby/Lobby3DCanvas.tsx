/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CharacterRig, CharacterAppearance } from '../character/characterModel';
import { TeddyBearCompanion, TeddyBearType, PetToyAccessory } from '../character/TeddyBearCompanion';
import { PetCompanionModel, PetType } from './PetCompanionModel';

export type AnyLobbyPetType = TeddyBearType | PetType;

interface Lobby3DCanvasProps {
  appearance: CharacterAppearance;
  petType: AnyLobbyPetType;
  petAccessory?: PetToyAccessory;
  isAutoRotating?: boolean;
}

export const Lobby3DCanvas: React.FC<Lobby3DCanvasProps> = ({
  appearance,
  petType,
  petAccessory = 'none',
  isAutoRotating = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    rig: CharacterRig | null;
    teddyPet: TeddyBearCompanion | null;
    dronePet: PetCompanionModel | null;
    characterRotatorGroup: THREE.Group;
    yawAngle: number;
    pitchAngle: number;
    yawVelocity: number;
    isDragging: boolean;
    lastX: number;
    lastY: number;
    frameId: number;
    lastTime: number;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Atmosphere Setup - Clean, High-End Game Studio Backdrop
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b); // Sleek modern slate-blue gradient sky
    scene.fog = new THREE.FogExp2(0x1e293b, 0.008);

    // 2. Camera Setup (Optimized to showcase character full-body in center)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 500);
    camera.position.set(0, 1.15, 3.8);
    camera.lookAt(0, 0.88, 0);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio & Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 1.2);
    scene.add(hemiLight);

    // Key Light: Crisp Sun/Studio Spotlight
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(4, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);

    // Cyan Fill Light from lower left
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-5, 3, 4);
    scene.add(fillLight);

    // Golden Rim Light behind hero (creates premium character silhouette glow)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    // 5. STATIC PLATFORM / PODIUM UNDER FEET (DOES NOT ROTATE!)
    // As explicitly requested: "ক্যারেক্টারে পায়ের নিচে জায়গাটা না নড়ে"
    const staticPodium = new THREE.Group();

    // Main Circular Terrace Pavement (Ground)
    const terraceGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.25, 64);
    const terraceMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep carbon slate
      roughness: 0.45,
      metalness: 0.5,
    });
    const terrace = new THREE.Mesh(terraceGeo, terraceMat);
    terrace.position.y = -0.125;
    terrace.receiveShadow = true;
    staticPodium.add(terrace);

    // Inner Glowing Concentric Orange/Gold Rings (Stationary on floor)
    const goldGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.1,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.85, 0.92, 64), goldGlowMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.002;
    staticPodium.add(innerRing);

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(1.45, 1.52, 64), goldGlowMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.003;
    staticPodium.add(outerRing);

    // Clean Perimeter Railings & Neon Posts (Stationary)
    const railMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.2 });
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.9,
    });

    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const rx = Math.cos(a) * 3.4;
      const rz = Math.sin(a) * 3.4;

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 8), railMat);
      post.position.set(rx, 0.2, rz);
      post.castShadow = true;
      staticPodium.add(post);

      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), lampMat);
      lamp.position.set(rx, 0.43, rz);
      staticPodium.add(lamp);
    }

    const topRailGeo = new THREE.TorusGeometry(3.4, 0.022, 8, 48);
    const topRail = new THREE.Mesh(topRailGeo, railMat);
    topRail.rotation.x = Math.PI / 2;
    topRail.position.y = 0.38;
    staticPodium.add(topRail);

    // Soft Studio Floor Glow Light
    const floorSpot = new THREE.PointLight(0xf59e0b, 1.2, 4.0);
    floorSpot.position.set(0, 0.2, 0);
    staticPodium.add(floorSpot);

    scene.add(staticPodium);

    // 6. ROTATING CHARACTER & COMPANION GROUP
    // Only this group rotates when dragged, while the ground stays static!
    const characterRotatorGroup = new THREE.Group();

    // 3D Player Character Rig
    const rig = new CharacterRig(appearance);
    rig.group.position.set(0, 0, 0);
    characterRotatorGroup.add(rig.group);

    // Equipped Companion (Teddy Bear or Aero Drone)
    let teddyPet: TeddyBearCompanion | null = null;
    let dronePet: PetCompanionModel | null = null;

    if (petType === 'aero_drone') {
      // Previous beloved Aero Hover Drone
      dronePet = new PetCompanionModel('aero_drone');
      dronePet.group.position.set(0.72, 0.3, 0.2);
      characterRotatorGroup.add(dronePet.group);
    } else if (petType === 'cyber_fox' || petType === 'tiger_cub') {
      dronePet = new PetCompanionModel(petType);
      dronePet.group.position.set(0.68, 0, 0.2);
      characterRotatorGroup.add(dronePet.group);
    } else {
      // Teddy Bear Companions (Cyber Neon, Classic Honey, Panda, Golden Hero)
      const validTeddy: TeddyBearType = [
        'cyber_neon',
        'classic_honey',
        'panda_bear',
        'golden_hero',
      ].includes(petType as TeddyBearType)
        ? (petType as TeddyBearType)
        : 'cyber_neon';

      teddyPet = new TeddyBearCompanion(validTeddy, petAccessory);
      teddyPet.group.position.set(0.68, 0, 0.2);
      teddyPet.group.rotation.y = -0.3;
      characterRotatorGroup.add(teddyPet.group);
    }

    scene.add(characterRotatorGroup);

    // 7. CLEAN ATMOSPHERIC BACKGROUND (No distracting fantasy citadel/waterfalls)
    // Distant soft horizon ring & sky dome
    const horizonGeo = new THREE.CylinderGeometry(140, 140, 45, 32, 1, true);
    const horizonMat = new THREE.MeshBasicMaterial({
      color: 0x091426,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.85,
    });
    const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
    horizonMesh.position.y = 10;
    scene.add(horizonMesh);

    // Save Refs
    stateRef.current = {
      renderer,
      scene,
      camera,
      rig,
      teddyPet,
      dronePet,
      characterRotatorGroup,
      yawAngle: 0,
      pitchAngle: 0.15,
      yawVelocity: 0,
      isDragging: false,
      lastX: 0,
      lastY: 0,
      frameId: 0,
      lastTime: performance.now(),
    };

    // 8. DUAL-AXIS TOUCH & MOUSE DRAGGING (Rotates character smoothly in 360°)
    const dom = renderer.domElement;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      if (!stateRef.current) return;
      stateRef.current.isDragging = true;
      stateRef.current.lastX = clientX;
      stateRef.current.lastY = clientY;
      stateRef.current.yawVelocity = 0;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!stateRef.current || !stateRef.current.isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - stateRef.current.lastX;
      const dy = clientY - stateRef.current.lastY;

      stateRef.current.lastX = clientX;
      stateRef.current.lastY = clientY;

      // Rotate character horizontally
      const sensitivity = 0.007;
      stateRef.current.yawAngle += dx * sensitivity;
      stateRef.current.yawVelocity = dx * sensitivity * 0.4;

      // Slight camera pitch tilt (clamped safely so hero remains heroically framed)
      stateRef.current.pitchAngle = THREE.MathUtils.clamp(
        stateRef.current.pitchAngle - dy * 0.003,
        0.05,
        0.35,
      );
    };

    const onPointerUp = () => {
      if (!stateRef.current) return;
      stateRef.current.isDragging = false;
    };

    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp, { passive: true });

    // 9. RESIZE HANDLER
    const handleResize = () => {
      if (!container || !stateRef.current) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;

      stateRef.current.camera.aspect = w / h;
      if (w < 700) {
        stateRef.current.camera.fov = 48;
      } else {
        stateRef.current.camera.fov = 38;
      }

      stateRef.current.camera.updateProjectionMatrix();
      stateRef.current.renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // 10. ANIMATION TICK LOOP
    const animate = (now: number) => {
      if (!stateRef.current) return;
      const state = stateRef.current;
      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;

      // Apply yaw rotation to character ONLY (ground remains still!)
      if (!state.isDragging) {
        if (isAutoRotating) {
          state.yawAngle += dt * 0.35;
        } else {
          state.yawAngle += state.yawVelocity;
          state.yawVelocity *= 0.92;
          if (Math.abs(state.yawVelocity) < 0.0001) state.yawVelocity = 0;
        }
      }

      state.characterRotatorGroup.rotation.y = state.yawAngle;

      // Camera vertical framing
      const targetDist = 3.8;
      const camY = 1.0 + Math.sin(state.pitchAngle) * 1.2;
      const camZ = Math.cos(state.pitchAngle) * targetDist;
      state.camera.position.set(0, camY, camZ);
      state.camera.lookAt(0, 0.88, 0);

      // Character Idle Animation
      if (state.rig) {
        state.rig.updateAnimation(dt, 0, false, false);
      }

      // Companion Animation
      if (state.teddyPet) {
        state.teddyPet.update(dt, 0);
      }
      if (state.dronePet) {
        state.dronePet.update(dt);
      }

      state.renderer.render(state.scene, state.camera);
      state.frameId = requestAnimationFrame(animate);
    };

    stateRef.current.frameId = requestAnimationFrame(animate);

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
        try {
          stateRef.current.renderer.dispose();
          if (dom.parentElement === container) {
            container.removeChild(dom);
          }
        } catch {}
      }
    };
  }, [appearance, petType, petAccessory, isAutoRotating]);

  return <div ref={mountRef} className="absolute inset-0 z-0 w-full h-full overflow-hidden" />;
};
