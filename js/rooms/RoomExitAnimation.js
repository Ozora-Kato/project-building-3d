import { CAMERA_FOV } from '../utils/constants.js';

export function playRoomExitAnimation(camera, onComplete) {
  const prevPos = camera.userData.prevPos;
  if (!prevPos) {
    onComplete();
    return;
  }

  const tl = gsap.timeline({ onComplete });

  // Pull back through window
  tl.to(camera.position, {
    x: prevPos.x,
    y: prevPos.y,
    z: prevPos.z,
    duration: 1.0,
    ease: 'power2.inOut',
  });

  // FOV slight compress then restore
  tl.to(camera, {
    fov: 45,
    duration: 0.3,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix(),
  }, 0);

  tl.to(camera, {
    fov: CAMERA_FOV,
    duration: 0.7,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix(),
  }, 0.3);

  return tl;
}
