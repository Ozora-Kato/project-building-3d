import * as THREE from 'three';
import {
  FLOOR_HEIGHT,
  BUILDING_WIDTH,
  BUILDING_DEPTH,
  WALL_THICKNESS,
  WINDOW_WIDTH,
  WINDOW_HEIGHT,
  WINDOWS_PER_SIDE_FRONT,
  WINDOWS_PER_SIDE_SIDE,
} from '../utils/constants.js';
import { createWindow } from './WindowSystem.js';

const concreteMaterial = new THREE.MeshStandardMaterial({
  color: 0x3a3a42,
  roughness: 0.92,
  metalness: 0.08,
});

const darkConcreteMaterial = new THREE.MeshStandardMaterial({
  color: 0x2a2a32,
  roughness: 0.95,
  metalness: 0.05,
});

const ledgeMaterial = new THREE.MeshStandardMaterial({
  color: 0x333340,
  roughness: 0.7,
  metalness: 0.3,
});

export function createFloor(floorIndex, floorData) {
  const group = new THREE.Group();
  const allWindows = [];

  const w = BUILDING_WIDTH;
  const d = BUILDING_DEPTH;
  const h = FLOOR_HEIGHT;
  const wt = WALL_THICKNESS;

  // Floor slab
  const slabGeo = new THREE.BoxGeometry(w + 0.2, 0.25, d + 0.2);
  const slab = new THREE.Mesh(slabGeo, darkConcreteMaterial);
  slab.position.y = 0;
  slab.castShadow = true;
  slab.receiveShadow = true;
  group.add(slab);

  // Ledge / overhang at each floor
  const ledgeGeo = new THREE.BoxGeometry(w + 0.6, 0.08, d + 0.6);
  const ledge = new THREE.Mesh(ledgeGeo, ledgeMaterial);
  ledge.position.y = 0.13;
  group.add(ledge);

  // Build walls with window cutouts for each side
  const sides = [
    { axis: 'front', nx: 0, nz: 1, width: w, depth: d, windowsCount: WINDOWS_PER_SIDE_FRONT },
    { axis: 'back', nx: 0, nz: -1, width: w, depth: d, windowsCount: WINDOWS_PER_SIDE_FRONT },
    { axis: 'left', nx: -1, nz: 0, width: d, depth: w, windowsCount: WINDOWS_PER_SIDE_SIDE },
    { axis: 'right', nx: 1, nz: 0, width: d, depth: w, windowsCount: WINDOWS_PER_SIDE_SIDE },
  ];

  for (const side of sides) {
    const { wallMeshes, windowMeshes } = createWallWithWindows(
      side, h, wt, w, d, floorData.neonColor
    );
    wallMeshes.forEach(m => {
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    });
    windowMeshes.forEach(m => group.add(m));
    allWindows.push(...windowMeshes);
  }

  // Corner pillars
  const pillarGeo = new THREE.BoxGeometry(0.4, h, 0.4);
  const corners = [
    [w / 2, h / 2, d / 2],
    [-w / 2, h / 2, d / 2],
    [w / 2, h / 2, -d / 2],
    [-w / 2, h / 2, -d / 2],
  ];
  for (const [px, py, pz] of corners) {
    const pillar = new THREE.Mesh(pillarGeo, concreteMaterial);
    pillar.position.set(px, py, pz);
    pillar.castShadow = true;
    group.add(pillar);
  }

  // Hitbox for room entry (invisible)
  const hitboxGeo = new THREE.BoxGeometry(w * 0.9, h * 0.8, d * 0.9);
  const hitboxMat = new THREE.MeshBasicMaterial({
    visible: false,
  });
  const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
  hitbox.position.y = h / 2;
  hitbox.userData.floorIndex = floorIndex;
  hitbox.userData.isHitbox = true;
  group.add(hitbox);

  group.userData.windows = allWindows;
  group.userData.hitbox = hitbox;

  return group;
}

function createWallWithWindows(side, floorHeight, wallThickness, buildingW, buildingD, neonColor) {
  const wallMeshes = [];
  const windowMeshes = [];

  const { axis, nx, nz, width, windowsCount } = side;
  const wallWidth = (axis === 'front' || axis === 'back') ? buildingW : buildingD;
  const wallOffset = (axis === 'front' || axis === 'back') ? buildingD / 2 : buildingW / 2;

  const windowSpacing = wallWidth / (windowsCount + 1);
  const windowBottomY = floorHeight * 0.3;
  const windowCenterY = windowBottomY + WINDOW_HEIGHT / 2;

  // Wall segments between and around windows
  const segmentHeight = floorHeight;

  // Below windows wall strip
  const belowGeo = new THREE.BoxGeometry(wallWidth, windowBottomY, wallThickness);
  const belowWall = new THREE.Mesh(belowGeo, concreteMaterial);

  // Above windows wall strip
  const aboveWindowTop = windowBottomY + WINDOW_HEIGHT;
  const aboveHeight = floorHeight - aboveWindowTop;
  const aboveGeo = new THREE.BoxGeometry(wallWidth, Math.max(aboveHeight, 0.1), wallThickness);
  const aboveWall = new THREE.Mesh(aboveGeo, concreteMaterial);

  // Position walls based on side
  if (axis === 'front') {
    belowWall.position.set(0, windowBottomY / 2, wallOffset);
    aboveWall.position.set(0, aboveWindowTop + aboveHeight / 2, wallOffset);
  } else if (axis === 'back') {
    belowWall.position.set(0, windowBottomY / 2, -wallOffset);
    aboveWall.position.set(0, aboveWindowTop + aboveHeight / 2, -wallOffset);
  } else if (axis === 'left') {
    belowWall.position.set(-wallOffset, windowBottomY / 2, 0);
    belowWall.rotation.y = Math.PI / 2;
    aboveWall.position.set(-wallOffset, aboveWindowTop + aboveHeight / 2, 0);
    aboveWall.rotation.y = Math.PI / 2;
  } else {
    belowWall.position.set(wallOffset, windowBottomY / 2, 0);
    belowWall.rotation.y = Math.PI / 2;
    aboveWall.position.set(wallOffset, aboveWindowTop + aboveHeight / 2, 0);
    aboveWall.rotation.y = Math.PI / 2;
  }

  wallMeshes.push(belowWall, aboveWall);

  // Pillar segments between windows
  const pillarWidth = (wallWidth - windowsCount * WINDOW_WIDTH) / (windowsCount + 1);

  for (let i = 0; i <= windowsCount; i++) {
    const pillarGeo = new THREE.BoxGeometry(
      Math.max(pillarWidth * 0.8, 0.15),
      WINDOW_HEIGHT,
      wallThickness
    );
    const pillar = new THREE.Mesh(pillarGeo, concreteMaterial);

    const px = -wallWidth / 2 + pillarWidth / 2 + i * (WINDOW_WIDTH + pillarWidth);

    if (axis === 'front') {
      pillar.position.set(px, windowCenterY, wallOffset);
    } else if (axis === 'back') {
      pillar.position.set(px, windowCenterY, -wallOffset);
    } else if (axis === 'left') {
      pillar.position.set(-wallOffset, windowCenterY, px);
      pillar.rotation.y = Math.PI / 2;
    } else {
      pillar.position.set(wallOffset, windowCenterY, px);
      pillar.rotation.y = Math.PI / 2;
    }

    wallMeshes.push(pillar);
  }

  // Windows
  for (let i = 0; i < windowsCount; i++) {
    const { mesh: winMesh } = createWindow(neonColor);

    const wx = -wallWidth / 2 + pillarWidth + WINDOW_WIDTH / 2 + i * (WINDOW_WIDTH + pillarWidth);
    const recess = 0.05;

    if (axis === 'front') {
      winMesh.position.set(wx, windowCenterY, wallOffset - recess);
    } else if (axis === 'back') {
      winMesh.position.set(wx, windowCenterY, -wallOffset + recess);
      winMesh.rotation.y = Math.PI;
    } else if (axis === 'left') {
      winMesh.position.set(-wallOffset + recess, windowCenterY, wx);
      winMesh.rotation.y = Math.PI / 2;
    } else {
      winMesh.position.set(wallOffset - recess, windowCenterY, wx);
      winMesh.rotation.y = -Math.PI / 2;
    }

    windowMeshes.push(winMesh);
  }

  return { wallMeshes, windowMeshes };
}
