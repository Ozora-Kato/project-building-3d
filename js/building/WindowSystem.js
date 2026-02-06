import * as THREE from 'three';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from '../utils/constants.js';
import { randomRange } from '../utils/math.js';

const windowGeo = new THREE.PlaneGeometry(WINDOW_WIDTH, WINDOW_HEIGHT);

export function createWindow(floorNeonColor) {
  const isLit = Math.random() > 0.15;

  let emissiveIntensity, opacity;

  if (!isLit) {
    emissiveIntensity = 0.05;
    opacity = 0.2;
  } else {
    emissiveIntensity = randomRange(0.2, 0.6);
    opacity = randomRange(0.35, 0.6);
  }

  // All windows are white/frosted glass style
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity,
    transparent: true,
    opacity,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(windowGeo, mat);

  // Add to bloom layer if bright enough (lowered threshold for subtler glow)
  if (isLit && emissiveIntensity > 0.45) {
    mesh.layers.enable(1);
  }

  // Store animation data
  mesh.userData.baseEmissiveIntensity = emissiveIntensity;
  mesh.userData.isLit = isLit;
  mesh.userData.flickerSpeed = randomRange(0.5, 3.0);
  mesh.userData.flickerPhase = randomRange(0, Math.PI * 2);

  return { mesh, isLit, emissiveIntensity };
}

export function animateWindows(windowMeshes, elapsed) {
  for (const win of windowMeshes) {
    if (!win.userData.isLit) continue;
    const base = win.userData.baseEmissiveIntensity;
    const flicker = Math.sin(elapsed * win.userData.flickerSpeed + win.userData.flickerPhase);
    win.material.emissiveIntensity = base + flicker * 0.05;
  }
}
