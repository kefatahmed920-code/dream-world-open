/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GameHouseConfig {
  position: { x: number; y: number; z: number };
  dimensions: { width: number; depth: number; height: number };
  roofCrownHeight: number;
  entranceDirection: 'west' | 'east' | 'north' | 'south';
  floorCount: number;
  doorsPerFloor: number;
}

export const GAME_HOUSE_CONFIG: GameHouseConfig = {
  // Prominent location in Dhaka city, bordering the East River Road sidewalk at X = 38-40
  position: { x: 52, y: 0, z: -45 },
  dimensions: { width: 28, depth: 28, height: 26 },
  roofCrownHeight: 36,
  entranceDirection: 'west', // Main plaza and grand double doors face West toward the street
  floorCount: 3,
  doorsPerFloor: 6,
};
