import * as THREE from 'three';
import { BUILDING_WIDTH, BUILDING_DEPTH, FLOOR_HEIGHT } from '../utils/constants.js';

export function createNeonSign(floorIndex, floorData) {
  const group = new THREE.Group();

  const text = `${floorData.name} ${floorData.label}`;
  const color = floorData.neonColor;
  const hexColor = '#' + new THREE.Color(color).getHexString();

  // Create neon tube-style sign with backing panel

  // 1. Dark backing panel (sign board)
  const panelWidth = 6.5;
  const panelHeight = 1.3;
  const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, 0.12);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a10,
    roughness: 0.95,
    metalness: 0.2,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);

  // 2. Create neon text using canvas - NEON STYLE with bold font
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 128;

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bold font for neon tubes
  ctx.font = '900 68px "Inter", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // === NEON GLOW EFFECT - White glow, black text ===

  // Layer 1: Wide outer glow (white)
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 50;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  // Layer 2: Medium glow (white)
  ctx.shadowBlur = 25;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 2; i++) {
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  // Layer 3: Tight glow (white)
  ctx.shadowBlur = 12;
  ctx.globalAlpha = 0.8;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Layer 4: Core glow (bright white)
  ctx.shadowBlur = 5;
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // Layer 5: Black text on top
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 1.0;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // 3. Text plane in front of panel
  const textGeo = new THREE.PlaneGeometry(panelWidth * 1.15, panelHeight * 0.95);
  const textMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.z = 0.1;

  // Enable bloom layer for neon glow
  textMesh.layers.enable(1);

  // 4. Small mounting brackets
  const bracketGeo = new THREE.BoxGeometry(0.08, 0.25, 0.35);
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x222228,
    roughness: 0.6,
    metalness: 0.7,
  });
  const bracketLeft = new THREE.Mesh(bracketGeo, bracketMat);
  bracketLeft.position.set(-panelWidth / 2 - 0.08, 0, -0.1);
  const bracketRight = new THREE.Mesh(bracketGeo, bracketMat);
  bracketRight.position.set(panelWidth / 2 + 0.08, 0, -0.1);

  // Assemble sign
  const signGroup = new THREE.Group();
  signGroup.add(panel);
  signGroup.add(textMesh);
  signGroup.add(bracketLeft);
  signGroup.add(bracketRight);

  // Position on building front face
  const y = floorIndex * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.7;
  signGroup.position.set(0, y, BUILDING_DEPTH / 2 + 0.15);

  group.add(signGroup);

  // Point light for neon glow bleed onto building (white)
  const light = new THREE.PointLight(0xffffff, 0.5, 10);
  light.position.set(0, y, BUILDING_DEPTH / 2 + 1.5);
  group.add(light);

  // Store for animation
  group.userData.neonLight = light;
  group.userData.baseIntensity = 0.5;
  group.userData.textMesh = textMesh;
  group.userData.floorY = y;

  return group;
}

// Rooftop neon sign (standing on the roof)
export function createRooftopNeonSign(floorIndex, floorData, roofY) {
  const group = new THREE.Group();

  const text = `${floorData.name} ${floorData.label}`;

  // Create neon text using canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 128;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '900 68px "Inter", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // White glow, black text
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 50;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 3; i++) {
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  ctx.shadowBlur = 25;
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < 2; i++) {
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  }

  ctx.shadowBlur = 12;
  ctx.globalAlpha = 0.8;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.shadowBlur = 5;
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = 1.0;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Larger panel for rooftop sign
  const panelWidth = 7;
  const panelHeight = 1.5;

  // Dark backing panel
  const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, 0.15);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a10,
    roughness: 0.95,
    metalness: 0.2,
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);

  // Text plane
  const textGeo = new THREE.PlaneGeometry(panelWidth * 1.1, panelHeight * 0.9);
  const textMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(textGeo, textMat);
  textMesh.position.z = 0.1;
  textMesh.layers.enable(1);

  // Support poles for rooftop sign
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x333340,
    roughness: 0.5,
    metalness: 0.8,
  });
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 8);

  const leftPole = new THREE.Mesh(poleGeo, poleMat);
  leftPole.position.set(-panelWidth / 2 + 0.3, -1.25, 0);

  const rightPole = new THREE.Mesh(poleGeo, poleMat);
  rightPole.position.set(panelWidth / 2 - 0.3, -1.25, 0);

  // Assemble sign
  const signGroup = new THREE.Group();
  signGroup.add(panel);
  signGroup.add(textMesh);
  signGroup.add(leftPole);
  signGroup.add(rightPole);

  // Position on rooftop, facing front (+Z)
  const y = roofY + 2.0; // Elevated above roof
  signGroup.position.set(0, y, 0);

  group.add(signGroup);

  // Point light for glow
  const light = new THREE.PointLight(0xffffff, 0.6, 12);
  light.position.set(0, y, 2);
  group.add(light);

  group.userData.neonLight = light;
  group.userData.baseIntensity = 0.6;
  group.userData.textMesh = textMesh;
  group.userData.floorY = y;

  return group;
}

export function animateNeonSigns(neonGroups, elapsed) {
  for (const group of neonGroups) {
    const base = group.userData.baseIntensity;
    const light = group.userData.neonLight;

    // Subtle neon flicker
    const flicker1 = Math.sin(elapsed * 4.0) * 0.05;
    const flicker2 = Math.sin(elapsed * 7.3) * 0.02;
    const randomFlicker = Math.random() > 0.997 ? -0.15 : 0;

    light.intensity = Math.max(0.2, base + flicker1 + flicker2 + randomFlicker);
  }
}
