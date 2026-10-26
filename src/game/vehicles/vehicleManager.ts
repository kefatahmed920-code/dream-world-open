/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { VehicleConfig } from '../types';
import { soundManager } from '../audio/soundManager';

export interface ActiveVehicle {
  config: VehicleConfig;
  group: THREE.Group;
  wheels: THREE.Mesh[];
  frontSteerGroup?: THREE.Group;
  velocity: number; // forward speed in m/s
  steeringAngle: number;
  isOccupied: boolean;
  driverSeatOffset: THREE.Vector3;
}

export class VehicleManager {
  public vehicles: ActiveVehicle[] = [];
  public group: THREE.Group;
  public activePlayerVehicle: ActiveVehicle | null = null;
  public trafficVehicles: { mesh: THREE.Group; speed: number; minX: number; maxX: number; dir: number }[] = [];

  constructor(scene: THREE.Scene, getTerrainHeight: (x: number, z: number) => number) {
    this.group = new THREE.Group();
    this.group.name = 'Vehicles';
    scene.add(this.group);

    this.spawnDefaultVehicles(getTerrainHeight);
    this.spawnAmbientTraffic(getTerrainHeight);
  }

  private spawnDefaultVehicles(getTerrainHeight: (x: number, z: number) => number) {
    // 1. Classic Bangladeshi Green CNG Auto-Rickshaw (near Dhaka Cha Stall)
    const cngConfig: VehicleConfig = {
      id: 'veh_cng_1',
      type: 'cng',
      name: 'Green CNG Auto-Rickshaw',
      nameBn: 'সবুজ সিএনজি অটোরিকশা',
      position: [20, 0, 16],
      rotationY: Math.PI * 0.5,
      color: '#15803d', // Dhaka Green
      maxSpeed: 18, // 18 m/s (~65 km/h)
      acceleration: 8,
      handling: 2.2,
    };
    this.createCNGRickshaw(cngConfig, getTerrainHeight);

    // 2. City Sedan Car (in the city avenue lane)
    const carConfig: VehicleConfig = {
      id: 'veh_car_1',
      type: 'car',
      name: 'City Sedan',
      nameBn: 'প্রাইভেট কার',
      position: [-5, 0, 1],
      rotationY: 0,
      color: '#0284c7', // Sky Blue
      maxSpeed: 28, // 28 m/s (~100 km/h)
      acceleration: 14,
      handling: 1.8,
    };
    this.createSedanCar(carConfig, getTerrainHeight);
  }

  /**
   * Build Bangladeshi CNG Auto-Rickshaw 3D Model
   */
  private createCNGRickshaw(config: VehicleConfig, getTerrainHeight: (x: number, z: number) => number) {
    const vehGroup = new THREE.Group();
    vehGroup.name = 'CNG_Rickshaw';

    const groundY = getTerrainHeight(config.position[0], config.position[2]);
    vehGroup.position.set(config.position[0], groundY, config.position[2]);
    vehGroup.rotation.y = config.rotationY;

    // Materials
    const greenBodyMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Dhaka Green
      roughness: 0.4,
      metalness: 0.2,
    });
    const yellowTrimMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Yellow safety stripe
      roughness: 0.5,
    });
    const blackRubberMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.9,
    });
    const metalRimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.65,
    });

    // 1. Lower Chassis
    const chassisGeo = new THREE.BoxGeometry(1.4, 0.45, 2.6);
    const chassis = new THREE.Mesh(chassisGeo, greenBodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    vehGroup.add(chassis);

    // Yellow stripe around waist
    const stripeGeo = new THREE.BoxGeometry(1.42, 0.1, 2.62);
    const stripe = new THREE.Mesh(stripeGeo, yellowTrimMat);
    stripe.position.y = 0.7;
    vehGroup.add(stripe);

    // 2. Cabin Roof & Curved Canopy
    const roofGeo = new THREE.BoxGeometry(1.35, 0.08, 2.3);
    const roof = new THREE.Mesh(roofGeo, greenBodyMat);
    roof.position.set(0, 1.82, -0.15);
    roof.castShadow = true;
    vehGroup.add(roof);

    // Cabin Support Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8);
    [
      [-0.6, -1.1],
      [0.6, -1.1],
      [-0.6, 0.9],
      [0.6, 0.9],
    ].forEach(([px, pz]) => {
      const p = new THREE.Mesh(pillarGeo, blackRubberMat);
      p.position.set(px, 1.25, pz);
      vehGroup.add(p);
    });

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.2, 0.65, 0.04);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.35, 0.92);
    windshield.rotation.x = -0.2;
    vehGroup.add(windshield);

    // Back Luggage Mesh / Grille (Protective wire-mesh iconic to CNGs)
    const grilleGeo = new THREE.BoxGeometry(1.3, 0.75, 0.04);
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, wireframe: true });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 1.15, -1.22);
    vehGroup.add(grille);

    // Headlights
    const lightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    lightGeo.rotateX(Math.PI / 2);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 0.7,
    });
    const headlight = new THREE.Mesh(lightGeo, lightMat);
    headlight.position.set(0, 0.75, 1.32);
    vehGroup.add(headlight);

    // Wheels: 1 front center wheel, 2 rear wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    // Front Steer Group
    const frontSteerGroup = new THREE.Group();
    frontSteerGroup.position.set(0, 0.32, 1.05);
    vehGroup.add(frontSteerGroup);

    const frontWheel = new THREE.Mesh(wheelGeo, blackRubberMat);
    frontWheel.castShadow = true;
    frontSteerGroup.add(frontWheel);
    wheels.push(frontWheel);

    // Rear Wheels (Left & Right)
    [-0.72, 0.72].forEach((wx) => {
      const rw = new THREE.Mesh(wheelGeo, blackRubberMat);
      rw.position.set(wx, 0.32, -0.75);
      rw.castShadow = true;
      vehGroup.add(rw);
      wheels.push(rw);
    });

    this.group.add(vehGroup);

    const activeVeh: ActiveVehicle = {
      config,
      group: vehGroup,
      wheels,
      frontSteerGroup,
      velocity: 0,
      steeringAngle: 0,
      isOccupied: false,
      driverSeatOffset: new THREE.Vector3(0, 0.45, 0.25),
    };

    this.vehicles.push(activeVeh);
  }

  /**
   * Build Modern City Sedan 3D Model
   */
  private createSedanCar(config: VehicleConfig, getTerrainHeight: (x: number, z: number) => number) {
    const vehGroup = new THREE.Group();
    vehGroup.name = 'City_Car';

    const groundY = getTerrainHeight(config.position[0], config.position[2]);
    vehGroup.position.set(config.position[0], groundY, config.position[2]);
    vehGroup.rotation.y = config.rotationY;

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Metallic blue
      roughness: 0.25,
      metalness: 0.7,
    });
    const darkGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.8,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });

    // Lower Body
    const bodyLowerGeo = new THREE.BoxGeometry(2.0, 0.6, 4.4);
    const bodyLower = new THREE.Mesh(bodyLowerGeo, bodyMat);
    bodyLower.position.y = 0.55;
    bodyLower.castShadow = true;
    bodyLower.receiveShadow = true;
    vehGroup.add(bodyLower);

    // Upper Cabin
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.65, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, darkGlassMat);
    cabin.position.set(0, 1.15, -0.2);
    cabin.castShadow = true;
    vehGroup.add(cabin);

    // Headlights
    const headGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfef08a,
      emissiveIntensity: 0.8,
    });
    [-0.7, 0.7].forEach((hx) => {
      const hl = new THREE.Mesh(headGeo, headMat);
      hl.position.set(hx, 0.65, 2.22);
      vehGroup.add(hl);
    });

    // 4 Wheels
    const wheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.26, 16);
    wheelGeo.rotateZ(Math.PI / 2);

    const frontSteerGroup = new THREE.Group();
    frontSteerGroup.position.set(0, 0.38, 1.35);
    vehGroup.add(frontSteerGroup);

    [-0.98, 0.98].forEach((wx) => {
      const fw = new THREE.Mesh(wheelGeo, tireMat);
      fw.position.x = wx;
      fw.castShadow = true;
      frontSteerGroup.add(fw);
      wheels.push(fw);
    });

    // Rear Wheels
    [-0.98, 0.98].forEach((wx) => {
      const rw = new THREE.Mesh(wheelGeo, tireMat);
      rw.position.set(wx, 0.38, -1.35);
      rw.castShadow = true;
      vehGroup.add(rw);
      wheels.push(rw);
    });

    this.group.add(vehGroup);

    const activeVeh: ActiveVehicle = {
      config,
      group: vehGroup,
      wheels,
      frontSteerGroup,
      velocity: 0,
      steeringAngle: 0,
      isOccupied: false,
      driverSeatOffset: new THREE.Vector3(-0.35, 0.45, -0.1),
    };

    this.vehicles.push(activeVeh);
  }

  /**
   * Ambient Traffic System
   * Realistic cars cruising down the avenue and across the bridge
   */
  private spawnAmbientTraffic(getTerrainHeight: (x: number, z: number) => number) {
    const colors = [0xd97706, 0x475569, 0xb91c1c];
    colors.forEach((col, idx) => {
      const car = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(1.9, 0.55, 4.0);
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4, metalness: 0.5 });
      const mesh = new THREE.Mesh(bodyGeo, mat);
      mesh.position.y = 0.55;
      mesh.castShadow = true;
      car.add(mesh);

      const cabinGeo = new THREE.BoxGeometry(1.6, 0.5, 2.0);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const cab = new THREE.Mesh(cabinGeo, cabMat);
      cab.position.set(0, 1.05, -0.1);
      car.add(cab);

      const laneZ = idx % 2 === 0 ? 0.5 : 5.5;
      const initialX = -110 + idx * 45;
      car.position.set(initialX, getTerrainHeight(initialX, laneZ), laneZ);
      if (idx % 2 === 1) {
        car.rotation.y = Math.PI; // heading westbound
      }

      this.group.add(car);
      this.trafficVehicles.push({
        mesh: car,
        speed: 12 + Math.random() * 5,
        minX: -130,
        maxX: 45,
        dir: idx % 2 === 0 ? 1 : -1,
      });
    });
  }

  /**
   * Update all vehicles, physics, steering, and ambient traffic
   */
  public update(
    delta: number,
    getTerrainHeight: (x: number, z: number) => number,
    checkObstacleCollision: (x: number, z: number, r: number) => boolean,
  ) {
    // 1. Update Active Player Driven Vehicle
    if (this.activePlayerVehicle) {
      const v = this.activePlayerVehicle;
      const pos = v.group.position;

      // Calculate forward movement vector based on vehicle yaw
      const forwardX = Math.sin(v.group.rotation.y);
      const forwardZ = Math.cos(v.group.rotation.y);

      // Desired next position
      const nextX = pos.x + forwardX * v.velocity * delta;
      const nextZ = pos.z + forwardZ * v.velocity * delta;

      // Obstacle collision check
      if (!checkObstacleCollision(nextX, nextZ, 1.2)) {
        pos.x = nextX;
        pos.z = nextZ;
      } else {
        // Impact stop & bounce back
        v.velocity = -v.velocity * 0.3;
      }

      // Height alignment with terrain
      pos.y = getTerrainHeight(pos.x, pos.z);

      // Apply steering turning rate
      if (Math.abs(v.velocity) > 0.1) {
        const turnDirection = v.velocity > 0 ? 1 : -1;
        v.group.rotation.y += v.steeringAngle * v.config.handling * delta * turnDirection;
      }

      // Steerable wheels visual orientation
      if (v.frontSteerGroup) {
        v.frontSteerGroup.rotation.y = THREE.MathUtils.damp(
          v.frontSteerGroup.rotation.y,
          v.steeringAngle * 0.6,
          10,
          delta,
        );
      }

      // Wheel spin rotation based on distance travelled
      const rollAngle = (v.velocity * delta) / 0.35;
      v.wheels.forEach((w) => {
        w.rotation.x += rollAngle;
      });

      // Update synthesized Web Audio engine sounds
      const speedNorm = Math.abs(v.velocity) / v.config.maxSpeed;
      soundManager.updateVehicleEngine(speedNorm, Math.abs(v.velocity) > 0.5);
    }

    // 2. Ambient Traffic AI
    for (const car of this.trafficVehicles) {
      car.mesh.position.x += car.dir * car.speed * delta;
      if (car.dir > 0 && car.mesh.position.x > car.maxX) {
        car.mesh.position.x = car.minX;
      } else if (car.dir < 0 && car.mesh.position.x < car.minX) {
        car.mesh.position.x = car.maxX;
      }
      car.mesh.position.y = getTerrainHeight(car.mesh.position.x, car.mesh.position.z);
    }
  }

  /**
   * Apply Driving Inputs to Current Vehicle
   */
  public applyDriveInput(delta: number, throttle: number, steer: number, handbrake: boolean) {
    if (!this.activePlayerVehicle) return;
    const v = this.activePlayerVehicle;

    // Steering
    const targetSteer = steer * 0.55;
    v.steeringAngle = THREE.MathUtils.damp(v.steeringAngle, targetSteer, 8, delta);

    // Throttle & Acceleration
    if (throttle > 0) {
      v.velocity = Math.min(v.config.maxSpeed, v.velocity + v.config.acceleration * delta);
    } else if (throttle < 0) {
      // Reverse
      v.velocity = Math.max(-v.config.maxSpeed * 0.4, v.velocity - v.config.acceleration * 0.8 * delta);
    } else {
      // Natural rolling friction
      v.velocity = THREE.MathUtils.damp(v.velocity, 0, 1.8, delta);
    }

    // Handbrake
    if (handbrake) {
      v.velocity = THREE.MathUtils.damp(v.velocity, 0, 10, delta);
    }
  }

  /**
   * Player Mounts Vehicle
   */
  public enterVehicle(vehicle: ActiveVehicle) {
    this.activePlayerVehicle = vehicle;
    vehicle.isOccupied = true;
    soundManager.playVehicleDoor();
    soundManager.startVehicleEngine(vehicle.config.type);
  }

  /**
   * Player Dismounts Vehicle
   */
  public exitVehicle(): THREE.Vector3 {
    if (!this.activePlayerVehicle) return new THREE.Vector3();
    const v = this.activePlayerVehicle;
    v.isOccupied = false;
    v.velocity = 0;
    soundManager.stopVehicleEngine();
    soundManager.playVehicleDoor();

    // Spawn player to the left of driver door
    const exitPos = v.group.position.clone();
    const leftX = -Math.cos(v.group.rotation.y) * 1.8;
    const leftZ = Math.sin(v.group.rotation.y) * 1.8;
    exitPos.x += leftX;
    exitPos.z += leftZ;

    this.activePlayerVehicle = null;
    return exitPos;
  }

  public getNearestVehicle(pos: THREE.Vector3, maxDist = 3.5): ActiveVehicle | null {
    let nearest: ActiveVehicle | null = null;
    let minDist = maxDist;

    for (const v of this.vehicles) {
      const d = v.group.position.distanceTo(pos);
      if (d < minDist) {
        minDist = d;
        nearest = v;
      }
    }
    return nearest;
  }
}
