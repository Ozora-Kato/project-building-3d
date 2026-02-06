import * as THREE from 'three';
import { SPIRAL_RADIUS } from '../utils/constants.js';

export class CameraRig {
  constructor(camera, spiralPath) {
    this.camera = camera;
    this.path = spiralPath;
    this.shakeOffset = new THREE.Vector3();
    this.active = true;

    // Smooth interpolation
    this._currentProgress = 1.0; // Start at RF
    this._currentLookAt = new THREE.Vector3(0, 2.5, 0);
    this._targetLookAt = new THREE.Vector3(0, 2.5, 0);
  }

  update(progress) {
    if (!this.active) return;

    // Smoothly interpolate progress instead of position
    // This keeps the camera on the circular path
    const progressDiff = progress - this._currentProgress;
    this._currentProgress += progressDiff * 0.06;

    // Get position from path using interpolated progress
    const currentPos = this.path.getPositionAt(this._currentProgress);
    const targetLookAt = this.path.getLookAtTarget(this._currentProgress);

    // Apply camera shake
    const finalPos = currentPos.clone().add(this.shakeOffset);
    this.camera.position.copy(finalPos);

    // Smooth lookAt
    this._currentLookAt.lerp(targetLookAt, 0.055);
    this._targetLookAt.copy(targetLookAt);
    this.camera.lookAt(this._currentLookAt);
  }

  setShake(offset) {
    this.shakeOffset.copy(offset);
  }

  disable() {
    this.active = false;
  }

  enable() {
    this.active = true;
  }

  // Store current state for room entry/exit
  saveState() {
    return {
      position: this.camera.position.clone(),
      lookAt: this._currentLookAt.clone(),
      fov: this.camera.fov,
      progress: this._currentProgress,
    };
  }

  // Restore state after room exit
  restoreState(state) {
    this._currentProgress = state.progress;
    this._currentLookAt.copy(state.lookAt);
    this.camera.fov = state.fov;
    this.camera.updateProjectionMatrix();
  }
}
