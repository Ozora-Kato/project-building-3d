import * as THREE from 'three';
import {
  BUILDING_WIDTH,
  BUILDING_DEPTH,
  FLOOR_HEIGHT,
  FLOOR_COUNT,
} from '../utils/constants.js';
import { randomRange } from '../utils/math.js';

const metalMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a30,
  roughness: 0.4,
  metalness: 0.85,
});

const rustMaterial = new THREE.MeshStandardMaterial({
  color: 0x443322,
  roughness: 0.9,
  metalness: 0.3,
});

const darkMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a22,
  roughness: 0.8,
  metalness: 0.5,
});

// Building has 8 floors (not counting rooftop)
const BUILDING_FLOORS = 8;

export function addBuildingDetails(scene) {
  const group = new THREE.Group();
  const w = BUILDING_WIDTH;
  const d = BUILDING_DEPTH;

  // Vertical pipes on building sides
  const pipePositions = [
    { x: w / 2 + 0.15, z: d * 0.25 },
    { x: w / 2 + 0.15, z: -d * 0.3 },
    { x: -w / 2 - 0.15, z: d * 0.15 },
    { x: -w / 2 - 0.15, z: -d * 0.35 },
    { x: w * 0.3, z: -d / 2 - 0.15 },
    { x: -w * 0.2, z: d / 2 + 0.15 },
  ];

  const totalHeight = BUILDING_FLOORS * FLOOR_HEIGHT;
  for (const pos of pipePositions) {
    const height = randomRange(totalHeight * 0.4, totalHeight);
    const radius = randomRange(0.06, 0.12);
    const pipeGeo = new THREE.CylinderGeometry(radius, radius, height, 8);
    const pipe = new THREE.Mesh(pipeGeo, Math.random() > 0.5 ? metalMaterial : rustMaterial);
    pipe.position.set(pos.x, height / 2, pos.z);
    pipe.castShadow = true;
    group.add(pipe);

    // Pipe brackets
    const bracketCount = Math.floor(height / 6);
    for (let i = 0; i < bracketCount; i++) {
      const bracketGeo = new THREE.BoxGeometry(0.3, 0.05, 0.15);
      const bracket = new THREE.Mesh(bracketGeo, metalMaterial);
      bracket.position.set(pos.x, (i + 1) * 6, pos.z);
      group.add(bracket);
    }
  }

  // AC units on random floors (only on building floors, not rooftop)
  for (let floor = 1; floor < BUILDING_FLOORS; floor++) {
    if (Math.random() > 0.45) continue;

    const acGeo = new THREE.BoxGeometry(1.2, 0.8, 0.6);
    const ac = new THREE.Mesh(acGeo, darkMaterial);

    const side = Math.floor(Math.random() * 4);
    const y = floor * FLOOR_HEIGHT + 1.5;
    const offset = randomRange(-2, 2);

    if (side === 0) ac.position.set(offset, y, d / 2 + 0.35);
    else if (side === 1) ac.position.set(offset, y, -d / 2 - 0.35);
    else if (side === 2) ac.position.set(w / 2 + 0.35, y, offset);
    else ac.position.set(-w / 2 - 0.35, y, offset);

    ac.castShadow = true;
    group.add(ac);

    // Fan grill on AC
    const grillGeo = new THREE.CircleGeometry(0.25, 12);
    const grillMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      roughness: 0.5,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });
    const grill = new THREE.Mesh(grillGeo, grillMat);
    grill.position.copy(ac.position);
    if (side === 0) grill.position.z += 0.31;
    else if (side === 1) { grill.position.z -= 0.31; grill.rotation.y = Math.PI; }
    else if (side === 2) { grill.position.x += 0.31; grill.rotation.y = Math.PI / 2; }
    else { grill.position.x -= 0.31; grill.rotation.y = -Math.PI / 2; }
    group.add(grill);
  }

  // Cable bundles between some floors
  for (let i = 0; i < 3; i++) {
    const startFloor = Math.floor(randomRange(1, BUILDING_FLOORS - 2));
    const startY = startFloor * FLOOR_HEIGHT + 2;
    const endY = startY + FLOOR_HEIGHT * randomRange(1, 3);
    const xOff = (Math.random() > 0.5 ? 1 : -1) * (w / 2 + 0.2);
    const zOff = randomRange(-d / 3, d / 3);

    const points = [
      new THREE.Vector3(xOff, startY, zOff),
      new THREE.Vector3(xOff + randomRange(-0.5, 0.5), (startY + endY) / 2, zOff + randomRange(-0.3, 0.3)),
      new THREE.Vector3(xOff, endY, zOff),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const cableGeo = new THREE.TubeGeometry(curve, 20, 0.03, 4, false);
    const cable = new THREE.Mesh(cableGeo, darkMaterial);
    group.add(cable);
  }

  scene.add(group);
  return group;
}

export function animateDetails(detailsGroup, elapsed) {
  // No rooftop antenna animation needed anymore
  // (antenna is now in BuildingGenerator with its own animation)
}
