import * as THREE from 'three';
import { playRoomEntryAnimation } from './RoomEntryAnimation.js';
import { playRoomExitAnimation } from './RoomExitAnimation.js';

export class RoomManager {
  constructor(camera, scrollController, cameraRig) {
    this.state = 'EXPLORING'; // EXPLORING | APPROACHING | INSIDE | EXITING
    this.activeFloorIndex = null;
    this.camera = camera;
    this.scrollController = scrollController;
    this.cameraRig = cameraRig;
    this.hitboxes = [];
    this.savedCameraState = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Touch tracking for tap detection
    this._touchStartX = 0;
    this._touchStartY = 0;
    this._touchStartTime = 0;
    this._tapThreshold = 15; // Max movement in pixels to count as tap
    this._tapMaxDuration = 300; // Max duration in ms to count as tap

    // Callbacks
    this.onEnterRoom = null;
    this.onExitRoom = null;

    // Desktop click
    window.addEventListener('click', (e) => this.onClick(e));

    // Mobile tap detection
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    window.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.state === 'INSIDE') {
        this.exitRoom();
      }
    });
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      this._touchStartX = event.touches[0].clientX;
      this._touchStartY = event.touches[0].clientY;
      this._touchStartTime = Date.now();
    }
  }

  onTouchEnd(event) {
    if (this.state !== 'EXPLORING') return;

    const touch = event.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - this._touchStartX);
    const deltaY = Math.abs(touch.clientY - this._touchStartY);
    const duration = Date.now() - this._touchStartTime;

    // Check if it's a tap (minimal movement, short duration)
    if (deltaX < this._tapThreshold && deltaY < this._tapThreshold && duration < this._tapMaxDuration) {
      this.handleTap(touch.clientX, touch.clientY);
    }
  }

  handleTap(x, y) {
    this.mouse.x = (x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.hitboxes);
    if (intersects.length > 0) {
      const floorIndex = intersects[0].object.userData.floorIndex;
      this.enterRoom(floorIndex);
    }
  }

  setHitboxes(hitboxes) {
    this.hitboxes = hitboxes;
  }

  onClick(event) {
    if (this.state !== 'EXPLORING') return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.hitboxes);
    if (intersects.length > 0) {
      const floorIndex = intersects[0].object.userData.floorIndex;
      this.enterRoom(floorIndex);
    }
  }

  enterRoom(floorIndex) {
    this.state = 'APPROACHING';
    this.activeFloorIndex = floorIndex;

    // Save camera state and disable scroll
    this.savedCameraState = this.cameraRig.saveState();
    this.scrollController.disable();
    this.cameraRig.disable();

    playRoomEntryAnimation(this.camera, floorIndex, () => {
      this.state = 'INSIDE';
      if (this.onEnterRoom) {
        this.onEnterRoom(floorIndex);
      }
    });
  }

  exitRoom() {
    if (this.state !== 'INSIDE') return;
    this.state = 'EXITING';

    if (this.onExitRoom) {
      this.onExitRoom();
    }

    playRoomExitAnimation(this.camera, () => {
      this.state = 'EXPLORING';
      this.activeFloorIndex = null;

      // Restore camera and enable scroll
      if (this.savedCameraState) {
        this.cameraRig.restoreState(this.savedCameraState);
      }
      this.cameraRig.enable();
      this.scrollController.enable();
    });
  }

  isInRoom() {
    return this.state === 'INSIDE';
  }

  isExploring() {
    return this.state === 'EXPLORING';
  }

  // Check if mouse is hovering over a hitbox
  checkHover(mouseX, mouseY) {
    if (this.state !== 'EXPLORING') return -1;

    this.mouse.x = (mouseX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(mouseY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.hitboxes);
    if (intersects.length > 0) {
      return intersects[0].object.userData.floorIndex;
    }
    return -1;
  }
}
