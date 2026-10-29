/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Preallocated static scratch vectors to eliminate garbage collection pressure
const _targetOffset = new THREE.Vector3();
const _desiredCenter = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _testCamPos = new THREE.Vector3();
const _finalCamPos = new THREE.Vector3();

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public targetPos: THREE.Vector3 = new THREE.Vector3(0, 1.5, 0);

  public yaw = 0; // horizontal angle
  public pitch = 0.25; // vertical angle (radians)
  public distance = 4.2; // target orbit distance
  public currentDistance = 4.2;

  private minDistance = 1.4;
  private maxDistance = 7.5;
  private minPitch = -0.55;
  private maxPitch = 1.35;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public rotate(deltaYaw: number, deltaPitch: number) {
    this.yaw -= deltaYaw;
    this.pitch = THREE.MathUtils.clamp(this.pitch + deltaPitch, this.minPitch, this.maxPitch);
  }

  public zoom(deltaDistance: number) {
    this.distance = THREE.MathUtils.clamp(this.distance + deltaDistance, this.minDistance, this.maxDistance);
  }

  public update(
    delta: number,
    followTarget: THREE.Vector3,
    isDriving = false,
    vehicleYaw?: number,
    getTerrainHeight?: (x: number, z: number) => number,
    targetYOffset = 1.55,
    isSwimming = false,
  ) {
    // Smoothly follow player / vehicle center without allocating new vectors
    if (isDriving) {
      _targetOffset.set(0, 1.2, 0);
    } else {
      _targetOffset.set(0, targetYOffset, 0);
    }

    _desiredCenter.copy(followTarget).add(_targetOffset);
    this.targetPos.lerp(_desiredCenter, 1 - Math.exp(-14 * delta));

    // In driving mode, softly align camera behind vehicle heading if not rotating manually
    if (isDriving && vehicleYaw !== undefined) {
      const targetYaw = vehicleYaw + Math.PI;
      this.yaw = THREE.MathUtils.damp(this.yaw, targetYaw, 2.5, delta);
      this.distance = 5.8;
    } else if (isSwimming) {
      this.distance = 3.6;
    } else {
      this.distance = 4.2;
    }

    let desiredDist = this.distance;
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);

    _camOffset.set(
      Math.sin(this.yaw) * cosPitch * desiredDist,
      sinPitch * desiredDist,
      Math.cos(this.yaw) * cosPitch * desiredDist,
    );

    _testCamPos.copy(this.targetPos).add(_camOffset);

    // Terrain ground clearance check
    if (getTerrainHeight) {
      // In water, allow camera to dip below water surface (-0.4) down to riverbed + 0.35
      const terrainY = getTerrainHeight(_testCamPos.x, _testCamPos.z) + (isSwimming ? 0.35 : 0.45);
      if (_testCamPos.y < terrainY) {
        _testCamPos.y = terrainY;
        desiredDist = Math.max(1.4, this.targetPos.distanceTo(_testCamPos));
      }
    }

    this.currentDistance = THREE.MathUtils.damp(this.currentDistance, desiredDist, 14, delta);

    // Final camera positioning
    _finalCamPos.set(
      this.targetPos.x + Math.sin(this.yaw) * cosPitch * this.currentDistance,
      this.targetPos.y + sinPitch * this.currentDistance,
      this.targetPos.z + Math.cos(this.yaw) * cosPitch * this.currentDistance,
    );

    // Keep camera above minimum ground clearance
    if (getTerrainHeight) {
      const minCamY = getTerrainHeight(_finalCamPos.x, _finalCamPos.z) + (isSwimming ? 0.30 : 0.35);
      if (_finalCamPos.y < minCamY) {
        _finalCamPos.y = minCamY;
      }
    }

    this.camera.position.copy(_finalCamPos);
    this.camera.lookAt(this.targetPos);
  }
}
