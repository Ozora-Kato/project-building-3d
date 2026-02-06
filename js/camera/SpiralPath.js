import * as THREE from 'three';
import {
  FLOOR_HEIGHT,
  FLOOR_COUNT,
  SPIRAL_RADIUS,
} from '../utils/constants.js';

// Building has 8 floors (1F-8F) + rooftop (RF)
const BUILDING_FLOORS = 8;

export class SpiralPath {
  constructor() {
    // Camera path goes from 1F center to RF (rooftop)
    this.minY = FLOOR_HEIGHT * 0.5; // 1F center
    // RF is on top of the building (above 8F)
    this.maxY = BUILDING_FLOORS * FLOOR_HEIGHT + 2.0; // Rooftop level
    this.totalHeight = this.maxY - this.minY;

    // Fixed distance from building
    this.radius = SPIRAL_RADIUS;

    // One full revolution per floor transition
    this.turnsPerFloor = 1.0;
    this.totalTurns = (FLOOR_COUNT - 1) * this.turnsPerFloor;

    // Base angle: +Z position (facing neon signs)
    this.baseAngle = Math.PI / 2;
  }

  getPositionAt(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);

    // Calculate angle - rotates around building
    const angle = this.baseAngle + (1 - clamped) * this.totalTurns * Math.PI * 2;

    // Y position based on progress
    const y = this.minY + clamped * this.totalHeight;

    // Fixed radius - no zoom, just rotation
    const x = Math.cos(angle) * this.radius;
    const z = Math.sin(angle) * this.radius;

    return new THREE.Vector3(x, y, z);
  }

  getLookAtTarget(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    const y = this.minY + clamped * this.totalHeight;
    // Always look at building center at same height
    return new THREE.Vector3(0, y, 0);
  }

  getFloorAtProgress(progress) {
    const clamped = THREE.MathUtils.clamp(progress, 0, 1);
    return Math.round(clamped * (FLOOR_COUNT - 1));
  }
}
