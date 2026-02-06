import { clamp } from '../utils/math.js';
import { FLOOR_COUNT } from '../utils/constants.js';

export class ScrollController {
  constructor() {
    // Start from top (RF) = floor index FLOOR_COUNT - 1
    this.currentFloor = FLOOR_COUNT - 1;
    this.targetFloor = FLOOR_COUNT - 1;
    this.currentProgress = 1.0;
    this.enabled = true;
    this.smoothing = 0.055;

    this._wheelAccumulator = 0;
    this._wheelThreshold = 50;
    this._scrollCooldown = false;
    this._cooldownTime = 400;

    // Touch
    this._touchStartY = 0;
    this._lastTouchY = 0;
    this._touchAccumulator = 0;
    this._touchThreshold = 50;

    // Mouse drag
    this._isDragging = false;
    this._dragStartY = 0;
    this._lastDragY = 0;
    this._dragAccumulator = 0;
    this._dragThreshold = 40;

    // Wheel events
    window.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // Touch events
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    window.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener('touchend', () => this.onTouchEnd(), { passive: true });

    // Mouse drag events
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());
    window.addEventListener('mouseleave', () => this.onMouseUp());
  }

  onWheel(event) {
    if (!this.enabled || this._scrollCooldown) return;
    event.preventDefault();

    this._wheelAccumulator += event.deltaY;

    if (Math.abs(this._wheelAccumulator) >= this._wheelThreshold) {
      if (this._wheelAccumulator > 0) {
        this.goToFloor(this.targetFloor - 1);
      } else {
        this.goToFloor(this.targetFloor + 1);
      }
      this._wheelAccumulator = 0;
      this._startCooldown();
    }
  }

  onTouchStart(event) {
    this._touchStartY = event.touches[0].clientY;
    this._lastTouchY = this._touchStartY;
    this._touchAccumulator = 0;
  }

  onTouchMove(event) {
    if (!this.enabled || this._scrollCooldown) return;
    event.preventDefault();

    const currentY = event.touches[0].clientY;
    const delta = this._lastTouchY - currentY;
    this._lastTouchY = currentY;
    this._touchAccumulator += delta;

    if (Math.abs(this._touchAccumulator) >= this._touchThreshold) {
      if (this._touchAccumulator > 0) {
        this.goToFloor(this.targetFloor - 1);
      } else {
        this.goToFloor(this.targetFloor + 1);
      }
      this._touchAccumulator = 0;
      this._startCooldown();
    }
  }

  onTouchEnd() {
    this._touchAccumulator = 0;
  }

  onMouseDown(event) {
    // Only start drag on left mouse button
    if (event.button !== 0) return;
    this._isDragging = true;
    this._dragStartY = event.clientY;
    this._lastDragY = event.clientY;
    this._dragAccumulator = 0;
    document.body.style.cursor = 'grabbing';
  }

  onMouseMove(event) {
    if (!this._isDragging || !this.enabled || this._scrollCooldown) return;

    const currentY = event.clientY;
    const delta = this._lastDragY - currentY;
    this._lastDragY = currentY;
    this._dragAccumulator += delta;

    if (Math.abs(this._dragAccumulator) >= this._dragThreshold) {
      if (this._dragAccumulator > 0) {
        // Drag up = go down the building
        this.goToFloor(this.targetFloor - 1);
      } else {
        // Drag down = go up the building
        this.goToFloor(this.targetFloor + 1);
      }
      this._dragAccumulator = 0;
      this._startCooldown();
    }
  }

  onMouseUp() {
    this._isDragging = false;
    this._dragAccumulator = 0;
    document.body.style.cursor = '';
  }

  _startCooldown() {
    this._scrollCooldown = true;
    setTimeout(() => {
      this._scrollCooldown = false;
    }, this._cooldownTime);
  }

  goToFloor(floorIndex) {
    const clamped = clamp(floorIndex, 0, FLOOR_COUNT - 1);
    if (clamped !== this.targetFloor) {
      this.targetFloor = clamped;
    }
  }

  update() {
    const targetProgress = this.targetFloor / (FLOOR_COUNT - 1);
    const diff = targetProgress - this.currentProgress;
    this.currentProgress += diff * this.smoothing;

    if (Math.abs(diff) < 0.001) {
      this.currentProgress = targetProgress;
      this.currentFloor = this.targetFloor;
    }

    return this.currentProgress;
  }

  getVelocity() {
    const targetProgress = this.targetFloor / (FLOOR_COUNT - 1);
    return Math.abs(targetProgress - this.currentProgress);
  }

  disable() {
    this.enabled = false;
    this._isDragging = false;
  }

  enable() {
    this.enabled = true;
  }

  setProgress(value) {
    const clamped = clamp(value, 0, 1);
    this.currentProgress = clamped;
    this.targetFloor = Math.round(clamped * (FLOOR_COUNT - 1));
    this.currentFloor = this.targetFloor;
  }
}
