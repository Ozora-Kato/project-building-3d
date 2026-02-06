import * as THREE from 'three';
import { FLOOR_COUNT, FLOOR_HEIGHT } from '../utils/constants.js';

export function setupLighting(scene) {
  // Brighter ambient fill
  const ambient = new THREE.AmbientLight(0x6677aa, 0.6);
  scene.add(ambient);

  // Main sunlight/daylight - brighter
  const sunlight = new THREE.DirectionalLight(0x8899cc, 1.0);
  sunlight.position.set(30, 60, 30);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.width = 2048;
  sunlight.shadow.mapSize.height = 2048;
  sunlight.shadow.camera.near = 1;
  sunlight.shadow.camera.far = 120;
  sunlight.shadow.camera.left = -40;
  sunlight.shadow.camera.right = 40;
  sunlight.shadow.camera.top = 60;
  sunlight.shadow.camera.bottom = -5;
  sunlight.shadow.bias = -0.001;
  scene.add(sunlight);

  // Secondary fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0x99aacc, 0.5);
  fillLight.position.set(-20, 40, -20);
  scene.add(fillLight);

  // Street lamp warm light at building base
  const streetLight = new THREE.PointLight(0xffaa66, 0.6, 35);
  streetLight.position.set(10, 4, 10);
  streetLight.castShadow = false;
  scene.add(streetLight);

  // Second street lamp other side
  const streetLight2 = new THREE.PointLight(0xffaa44, 0.4, 30);
  streetLight2.position.set(-8, 3, -8);
  scene.add(streetLight2);

  // Bright uplight on building top (skylight effect)
  const topHeight = FLOOR_COUNT * FLOOR_HEIGHT;
  const topLight = new THREE.PointLight(0xaabbff, 0.6, 30);
  topLight.position.set(0, topHeight + 5, 0);
  scene.add(topLight);

  // Hemisphere light for better ambient
  const hemiLight = new THREE.HemisphereLight(0x8899bb, 0x444455, 0.4);
  scene.add(hemiLight);

  return { ambient, sunlight, streetLight };
}
