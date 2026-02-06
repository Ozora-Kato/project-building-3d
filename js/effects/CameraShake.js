import * as THREE from 'three';

export class CameraShake {
  constructor() {
    this.intensity = 0.015;
    this.speed = 1.2;
    this.offset = new THREE.Vector3();
    this.enabled = true;
  }

  update(elapsed) {
    if (!this.enabled) {
      this.offset.set(0, 0, 0);
      return this.offset;
    }

    this.offset.set(
      Math.sin(elapsed * this.speed * 1.1) * Math.cos(elapsed * 0.7) * this.intensity,
      Math.sin(elapsed * this.speed * 0.8) * Math.cos(elapsed * 1.3) * this.intensity,
      Math.sin(elapsed * this.speed * 0.9) * Math.cos(elapsed * 0.5) * this.intensity * 0.5
    );

    return this.offset;
  }

  setIntensity(value) {
    this.intensity = value;
  }

  disable() {
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
  }
}
