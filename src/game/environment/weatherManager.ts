/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { WeatherType } from '../types';
import { soundManager } from '../audio/soundManager';

export class WeatherManager {
  public scene: THREE.Scene;
  public dirLight: THREE.DirectionalLight;
  public hemiLight: THREE.HemisphereLight;
  public rainParticles: THREE.Points | null = null;
  public skyDome: THREE.Mesh;

  public timeOfDay = 10.5; // 10:30 AM default
  public weather: WeatherType = 'clear';
  public timeSpeed = 0.05; // hours per real-time second

  private rainVelocity: Float32Array | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Directional Sunlight / Moonlight
    this.dirLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1.0;
    this.dirLight.shadow.camera.far = 400;
    const shadowD = 80;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.dirLight.shadow.bias = -0.0005;
    this.dirLight.shadow.normalBias = 0.02;
    scene.add(this.dirLight);

    // 2. Hemisphere Ambient Fill (Sky vs Ground)
    this.hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x334155, 1.0);
    scene.add(this.hemiLight);

    // 3. Dynamic Fog
    scene.fog = new THREE.FogExp2(0x94a3b8, 0.0035);

    // 4. Sky Dome
    const skyGeo = new THREE.SphereGeometry(450, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.BackSide,
    });
    this.skyDome = new THREE.Mesh(skyGeo, skyMat);
    scene.add(this.skyDome);

    // 5. Rain Particle System
    this.initRainSystem();
  }

  private initRainSystem() {
    const rainCount = 4000;
    const rainGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    this.rainVelocity = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
      this.rainVelocity[i] = 25 + Math.random() * 15;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(rainGeo, rainMat);
    this.rainParticles.visible = false;
    this.scene.add(this.rainParticles);
  }

  public setWeather(type: WeatherType) {
    this.weather = type;
    if (this.rainParticles) {
      this.rainParticles.visible = type === 'rain';
    }
    if (type === 'rain') {
      soundManager.playThunder();
    }
  }

  public update(delta: number, playerPos: THREE.Vector3) {
    // Advance time of day
    this.timeOfDay = (this.timeOfDay + delta * this.timeSpeed) % 24;

    // Sun solar angle
    // 6.0 = sunrise (angle = 0), 12.0 = noon (angle = PI/2), 18.0 = sunset (angle = PI), 24.0 = midnight
    const sunAngle = ((this.timeOfDay - 6) / 24) * Math.PI * 2;
    const sunDist = 200;

    const sunX = Math.cos(sunAngle) * sunDist + playerPos.x;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunZ = Math.sin(sunAngle * 0.4) * 80 + playerPos.z;

    this.dirLight.position.set(sunX, Math.max(sunY, -sunDist), sunZ);
    this.dirLight.target.position.copy(playerPos);
    this.dirLight.target.updateMatrixWorld();

    // Move Sky Dome with player
    this.skyDome.position.copy(playerPos);

    // Color grading based on Time of Day
    const isDay = sunY > 0;
    const sunElev = Math.max(0, sunY / sunDist);

    if (this.weather === 'rain') {
      // Monsoonal Dark Storm Atmosphere
      (this.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x334155);
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0x475569);
        (this.scene.fog as THREE.FogExp2).density = 0.008;
      }
      this.dirLight.intensity = 0.6;
      this.dirLight.color.setHex(0x94a3b8);
      this.hemiLight.intensity = 0.4;
      this.hemiLight.color.setHex(0x64748b);
    } else if (this.weather === 'mist') {
      // Misty Morning River Fog
      (this.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0xcfd8dc);
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0xdbeafe);
        (this.scene.fog as THREE.FogExp2).density = 0.015;
      }
      this.dirLight.intensity = 1.4;
      this.hemiLight.intensity = 0.9;
    } else if (isDay) {
      if (sunElev < 0.25) {
        // Golden Sunrise / Sunset
        (this.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0xf97316); // Amber Sunset
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0xfb923c);
          (this.scene.fog as THREE.FogExp2).density = 0.0035;
        }
        this.dirLight.color.setHex(0xfde047);
        this.dirLight.intensity = 2.4;
        this.hemiLight.color.setHex(0xfb7185);
      } else {
        // Bright Daytime Blue
        (this.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x60a5fa);
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setHex(0x93c5fd);
          (this.scene.fog as THREE.FogExp2).density = 0.0028;
        }
        this.dirLight.color.setHex(0xfffbeb);
        this.dirLight.intensity = 2.2;
        this.hemiLight.color.setHex(0xdbeafe);
      }
    } else {
      // Starry Night
      (this.skyDome.material as THREE.MeshBasicMaterial).color.setHex(0x050814);
      if (this.scene.fog) {
        (this.scene.fog as THREE.FogExp2).color.setHex(0x090d1a);
        (this.scene.fog as THREE.FogExp2).density = 0.005;
      }
      this.dirLight.color.setHex(0x60a5fa); // Cool blue moonlight
      this.dirLight.intensity = 0.45;
      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.intensity = 0.25;
    }

    // Update Rain Particles around player
    if (this.rainParticles && this.rainParticles.visible && this.rainVelocity) {
      this.rainParticles.position.x = playerPos.x;
      this.rainParticles.position.z = playerPos.z;

      const posAttr = this.rainParticles.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < this.rainVelocity.length; i++) {
        arr[i * 3 + 1] -= this.rainVelocity[i] * delta;
        if (arr[i * 3 + 1] < 0) {
          arr[i * 3 + 1] = 45;
        }
      }
      posAttr.needsUpdate = true;
    }
  }
}
