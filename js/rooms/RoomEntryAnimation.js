import {
  FLOOR_HEIGHT,
  BUILDING_DEPTH,
  CAMERA_FOV,
} from '../utils/constants.js';

// Building has 8 floors (1F-8F), RF (index 8) is on rooftop
const BUILDING_FLOORS = 8;

export function playRoomEntryAnimation(camera, floorIndex, onComplete) {
  // Save previous position for exit animation
  camera.userData.prevPos = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
  };

  const tl = gsap.timeline({ onComplete });

  // Check if entering rooftop (RF)
  if (floorIndex >= BUILDING_FLOORS) {
    // Rooftop entry - descend from above
    const roofY = BUILDING_FLOORS * FLOOR_HEIGHT + 1.5;

    // Phase 1: Move above the rooftop
    tl.to(camera.position, {
      x: 0,
      y: roofY + 5,
      z: 8,
      duration: 0.6,
      ease: 'power2.inOut',
    });

    // Phase 2: Descend onto rooftop
    tl.to(camera.position, {
      x: 0,
      y: roofY,
      z: 3,
      duration: 0.6,
      ease: 'power2.out',
    });
  } else {
    // Regular floor entry - straight from front
    const floorY = floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.55;
    const approachZ = BUILDING_DEPTH / 2 + 2;
    const insideZ = 0;

    // Phase 1: Approach straight toward building front
    tl.to(camera.position, {
      x: 0,
      y: floorY + 0.5,
      z: approachZ,
      duration: 0.8,
      ease: 'power2.inOut',
    });

    // Phase 2: Push through into the room
    tl.to(camera.position, {
      x: 0,
      y: floorY + 0.8,
      z: insideZ,
      duration: 0.5,
      ease: 'power3.out',
    });
  }

  // FOV effect
  tl.to(camera, {
    fov: 65,
    duration: 0.5,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix(),
  }, 0);

  tl.to(camera, {
    fov: CAMERA_FOV,
    duration: 0.7,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix(),
  }, 0.5);

  return tl;
}

// Transition camera between floors while inside
export function playFloorTransitionAnimation(camera, fromFloorIndex, toFloorIndex, onComplete) {
  const tl = gsap.timeline({ onComplete });

  const direction = toFloorIndex > fromFloorIndex ? 'up' : 'down';
  const isToRooftop = toFloorIndex >= BUILDING_FLOORS;
  const isFromRooftop = fromFloorIndex >= BUILDING_FLOORS;

  // Calculate target Y position
  let targetY;
  let targetZ;

  if (isToRooftop) {
    targetY = BUILDING_FLOORS * FLOOR_HEIGHT + 1.5;
    targetZ = 3;
  } else {
    targetY = toFloorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.55 + 0.8;
    targetZ = 0;
  }

  // Elevator-style vertical movement
  if (isFromRooftop !== isToRooftop) {
    // Transitioning between rooftop and building
    const midY = (camera.position.y + targetY) / 2;

    // Phase 1: Move back slightly
    tl.to(camera.position, {
      z: camera.position.z + 2,
      duration: 0.25,
      ease: 'power2.in',
    });

    // Phase 2: Vertical movement
    tl.to(camera.position, {
      y: targetY,
      duration: 0.5,
      ease: 'power2.inOut',
    });

    // Phase 3: Move forward to final position
    tl.to(camera.position, {
      z: targetZ,
      duration: 0.25,
      ease: 'power2.out',
    });
  } else {
    // Same type transition (building to building or rooftop to rooftop)
    // Simple vertical slide
    tl.to(camera.position, {
      y: targetY,
      z: targetZ,
      duration: 0.4,
      ease: 'power2.inOut',
    });
  }

  return tl;
}
