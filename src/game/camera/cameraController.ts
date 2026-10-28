/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public targetPos: THREE.Vector3 = new THREE.Vector3(0, 1.5, 0);

  public yaw = 0; // horizontal angle
  public pitch = 0.25; // vertical angle (radians)
  public distance = 4.2; // target orbit distance
  public currentDistance = 4.2;

  private minDistance = 1.8;
  private maxDistance = 7.5;
  private minPitch = -0.4;
  private maxPitch = 1.25;

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
  ) {
    // Smoothly follow player / vehicle center
    const targetOffset = isDriving ? new THREE.Vector3(0, 1.2, 0) : new THREE.Vector3(0, targetYOffset, 0);
    const desiredCenter = followTarget.clone().add(targetOffset);
    this.targetPos.lerp(desiredCenter, 1 - Math.exp(-12 * delta));

    // In driving mode, softly align camera behind vehicle heading if not rotating manually
    if (isDriving && vehicleYaw !== undefined) {
      const targetYaw = vehicleYaw + Math.PI;
      this.yaw = THREE.MathUtils.damp(this.yaw, targetYaw, 2.5, delta);
      this.distance = 5.8;
    } else {
      this.distance = 4.2;
    }

    // Target spherical position
    let desiredDist = this.distance;

    // Camera Collision Avoidance
    // Check if line between target and camera intersects ground terrain or obstacles
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const camOffset = new THREE.Vector3(
      Math.sin(this.yaw) * cosPitch * desiredDist,
      sinPitch * desiredDist,
      Math.cos(this.yaw) * cosPitch * desiredDist,
    );

    const testCamPos = this.targetPos.clone().add(camOffset);

    // Terrain ground clearance check
    if (getTerrainHeight) {
      const terrainY = getTerrainHeight(testCamPos.x, testCamPos.z) + 0.45;
      if (testCamPos.y < terrainY) {
        testCamPos.y = terrainY;
        desiredDist = Math.max(1.8, this.targetPos.distanceTo(testCamPos));
      }
    }

    this.currentDistance = THREE.MathUtils.damp(this.currentDistance, desiredDist, 14, delta);

    // Final camera positioning
    const finalCamPos = new THREE.Vector3(
      this.targetPos.x + Math.sin(this.yaw) * cosPitch * this.currentDistance,
      this.targetPos.y + sinPitch * this.currentDistance,
      this.targetPos.z + Math.cos(this.yaw) * cosPitch * this.currentDistance,
    );

    // Keep camera above minimum ground clearance
    if (getTerrainHeight) {
      const minCamY = getTerrainHeight(finalCamPos.x, finalCamPos.z) + 0.35;
      if (finalCamPos.y < minCamY) {
        finalCamPos.y = minCamY;
      }
    }

    this.camera.position.copy(finalCamPos);
    this.camera.lookAt(this.targetPos);
  }
}
