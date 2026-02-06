import * as THREE from 'three';

export class RainSystem {
  constructor(scene, isMobile = false) {
    const count = isMobile ? 5000 : 15000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count);

    const spread = 80;
    const height = 65;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      this.velocities[i] = 0.25 + Math.random() * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8899cc,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.mesh = new THREE.Points(geometry, material);
    this.count = count;
    this.height = height;
    scene.add(this.mesh);
  }

  update(delta) {
    const positions = this.mesh.geometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      positions[i * 3 + 1] -= this.velocities[i];
      if (positions[i * 3 + 1] < -2) {
        positions[i * 3 + 1] = this.height;
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}
