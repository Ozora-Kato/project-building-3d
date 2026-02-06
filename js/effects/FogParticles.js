import * as THREE from 'three';
import { FLOOR_HEIGHT, FLOOR_COUNT, BUILDING_WIDTH } from '../utils/constants.js';

export class FogParticles {
  constructor(scene) {
    const count = 400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.driftData = [];

    const totalHeight = FLOOR_COUNT * FLOOR_HEIGHT;
    const spread = 40;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * totalHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;

      this.driftData.push({
        speedX: (Math.random() - 0.5) * 0.3,
        speedZ: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.2 + Math.random() * 0.5,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x667799,
      size: 2.5,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.count = count;
    this.spread = spread;
    scene.add(this.mesh);
  }

  update(elapsed) {
    const positions = this.mesh.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const d = this.driftData[i];
      positions[i * 3] += Math.sin(elapsed * 0.3 + d.phase) * d.speedX * 0.02;
      positions[i * 3 + 2] += Math.cos(elapsed * 0.2 + d.phase) * d.speedZ * 0.02;

      // Wrap around
      if (Math.abs(positions[i * 3]) > this.spread / 2) {
        positions[i * 3] *= -0.9;
      }
      if (Math.abs(positions[i * 3 + 2]) > this.spread / 2) {
        positions[i * 3 + 2] *= -0.9;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}
