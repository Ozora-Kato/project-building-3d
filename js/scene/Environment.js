import * as THREE from 'three';

// Store background colors for dynamic update - BRIGHTER
const skyColors = {
  top: { r: 0.35, g: 0.45, b: 0.7 },      // Bright clear sky at rooftop
  bottom: { r: 0.08, g: 0.08, b: 0.15 }   // Darker at ground level but not too dark
};

let bgCanvas, bgCtx, bgTexture;

export function setupEnvironment(scene) {
  // Exponential fog - lighter, will be updated dynamically
  scene.fog = new THREE.FogExp2(0x3a4a6a, 0.006);
  scene.userData.fog = scene.fog;

  // Background gradient via canvas texture
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = 2;
  bgCanvas.height = 512;
  bgCtx = bgCanvas.getContext('2d');

  // Initial gradient (will be updated based on scroll)
  updateBackgroundGradient(1.0); // Start at top

  bgTexture = new THREE.CanvasTexture(bgCanvas);
  scene.background = bgTexture;
  scene.userData.bgTexture = bgTexture;

  // Ground plane - lighter wet asphalt look
  const groundGeo = new THREE.PlaneGeometry(200, 200);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a24,
    roughness: 0.3,
    metalness: 0.7,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.1;
  ground.receiveShadow = true;
  scene.add(ground);

  return ground;
}

function updateBackgroundGradient(progress) {
  // progress: 0 = ground (darker), 1 = rooftop (bright sky)
  const t = progress;

  // Interpolate colors based on progress
  const topColor = lerpColor(skyColors.bottom, skyColors.top, t);
  const midColor = lerpColor(skyColors.bottom, { r: 0.2, g: 0.25, b: 0.4 }, t);
  const bottomColor = lerpColor({ r: 0.05, g: 0.05, b: 0.1 }, skyColors.bottom, t);

  const gradient = bgCtx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, rgbToHex(topColor));
  gradient.addColorStop(0.4, rgbToHex(midColor));
  gradient.addColorStop(1, rgbToHex(bottomColor));

  bgCtx.fillStyle = gradient;
  bgCtx.fillRect(0, 0, 2, 512);
}

function lerpColor(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  };
}

function rgbToHex(c) {
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

export function updateEnvironment(scene, progress) {
  // Update background gradient based on scroll progress
  updateBackgroundGradient(progress);
  if (scene.userData.bgTexture) {
    scene.userData.bgTexture.needsUpdate = true;
  }

  // Update fog density - denser at bottom, lighter at top
  if (scene.userData.fog) {
    const fogDensity = 0.012 - progress * 0.008; // 0.012 at bottom, 0.004 at top
    scene.userData.fog.density = fogDensity;
  }
}
