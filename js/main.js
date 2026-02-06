import * as THREE from 'three';
import { SceneManager } from './scene/SceneManager.js';
import { setupEnvironment, updateEnvironment } from './scene/Environment.js';
import { setupLighting } from './scene/Lighting.js';
import { setupPostProcessing } from './scene/PostProcessing.js';
import { BuildingGenerator } from './building/BuildingGenerator.js';
import { SpiralPath } from './camera/SpiralPath.js';
import { ScrollController } from './camera/ScrollController.js';
import { CameraRig } from './camera/CameraRig.js';
import { RainSystem } from './effects/RainSystem.js';
import { FogParticles } from './effects/FogParticles.js';
import { CameraShake } from './effects/CameraShake.js';
import { RoomManager } from './rooms/RoomManager.js';
import { playFloorTransitionAnimation } from './rooms/RoomEntryAnimation.js';
import { UIOverlay } from './ui/UIOverlay.js';
import { LoadingScreen } from './ui/LoadingScreen.js';
import { FLOOR_COUNT } from './utils/constants.js';
import { floors } from './content/floorData.js';

const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;

// Loading
const loading = new LoadingScreen();
loading.setProgress(10, 'CREATING WORLD...');

// Scene
const canvas = document.getElementById('webgl-canvas');
const sm = new SceneManager(canvas);
loading.setProgress(20, 'SETTING ATMOSPHERE...');

// Environment
setupEnvironment(sm.scene);
setupLighting(sm.scene);

// Distant city silhouette (background buildings)
addCitySilhouette(sm.scene);

loading.setProgress(35, 'CONSTRUCTING BUILDING...');

// Building
const building = new BuildingGenerator(sm.scene);
loading.setProgress(60, 'WIRING ELEVATORS...');

// Camera system
const spiralPath = new SpiralPath();
const scrollController = new ScrollController();
const cameraRig = new CameraRig(sm.camera, spiralPath);

// Initialize camera to spiral path start (now at top, progress = 1.0)
const startPos = spiralPath.getPositionAt(1.0);
const startLookAt = spiralPath.getLookAtTarget(1.0);
sm.camera.position.copy(startPos);
sm.camera.lookAt(startLookAt);

loading.setProgress(70, 'SUMMONING RAIN...');

// Effects
const rain = new RainSystem(sm.scene, isMobile);
const fog = new FogParticles(sm.scene);
const cameraShake = new CameraShake();
loading.setProgress(80, 'TUNING NEON LIGHTS...');

// Post-processing
const { composer, vignettePass } = setupPostProcessing(sm.renderer, sm.scene, sm.camera, isMobile);
sm.composer = composer;
loading.setProgress(90, 'OPENING DOORS...');

// Room system
const roomManager = new RoomManager(sm.camera, scrollController, cameraRig);
roomManager.setHitboxes(building.getHitboxes());

// UI
const uiOverlay = new UIOverlay();

// Setup floor navigation (left side)
const floorNav = document.getElementById('floor-nav');
const floorNavList = document.getElementById('floor-nav-list');
const navMenu = document.getElementById('nav-menu');
const navList = document.getElementById('nav-list');
const hamburgerMenu = document.getElementById('hamburger-menu');

// Build floor navigation list (reversed - RF at top, 1F at bottom)
const reversedFloors = [...floors].reverse();
reversedFloors.forEach((floor, idx) => {
  const actualIndex = floors.length - 1 - idx;

  // Left side nav
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = '#';
  a.textContent = `${floor.name} ${floor.label}`;
  a.dataset.floorIndex = actualIndex;
  a.dataset.color = floor.cssColor;
  a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToFloor(actualIndex);
  });
  li.appendChild(a);
  floorNavList.appendChild(li);

  // Hamburger menu nav
  const navLi = document.createElement('li');
  const navA = document.createElement('a');
  navA.href = '#';
  navA.textContent = `${floor.name} ${floor.label}`;
  navA.dataset.floorIndex = actualIndex;
  navA.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToFloor(actualIndex);
    closeNavMenu();
  });
  navLi.appendChild(navA);
  navList.appendChild(navLi);
});

function scrollToFloor(floorIndex) {
  const progress = floorIndex / (FLOOR_COUNT - 1);
  scrollController.setProgress(progress);
}

// Hamburger menu toggle
hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('active');
  navMenu.classList.toggle('open');
});

function closeNavMenu() {
  hamburgerMenu.classList.remove('active');
  navMenu.classList.remove('open');
}

// Track current room floor for elevator transitions
let currentRoomFloor = null;

// Connect room manager to UI
roomManager.onEnterRoom = (floorIndex) => {
  currentRoomFloor = floorIndex;
  uiOverlay.showContent(floorIndex);
  floorNav.classList.remove('visible');
  heroCopy.classList.remove('visible');
  siteFooter.classList.remove('visible');
  cameraShake.disable();
};

roomManager.onExitRoom = () => {
  currentRoomFloor = null;
  uiOverlay.hideContent();
  setTimeout(() => {
    floorNav.classList.add('visible');
    cameraShake.enable();
  }, 800);
};

uiOverlay.onBack = () => {
  roomManager.exitRoom();
};

// Handle elevator floor changes (transition between floors while inside room)
uiOverlay.onFloorChange = (newFloorIndex) => {
  if (currentRoomFloor !== null && currentRoomFloor !== newFloorIndex) {
    playFloorTransitionAnimation(sm.camera, currentRoomFloor, newFloorIndex, () => {
      // Update room manager's active floor
      roomManager.activeFloorIndex = newFloorIndex;
    });
    currentRoomFloor = newFloorIndex;
  }
};

// Hero copy
const heroCopy = document.getElementById('hero-copy');
const heroCopyJa = heroCopy.querySelector('.hero-copy-ja');
const heroCopyEn = heroCopy.querySelector('.hero-copy-en');
const heroCopyAuthor = heroCopy.querySelector('.hero-copy-author');

// Scramble text animation - Hacker UI style
const scrambleChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function scrambleText(element, finalText, duration = 1500, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const length = finalText.length;
      const frameTime = 16; // ~60fps
      const totalFrames = Math.floor(duration / frameTime);

      // Time per character (with overlap for scramble effect)
      const framesPerChar = totalFrames / length;
      const scrambleFramesPerChar = 8; // Frames to scramble before locking

      let frame = 0;
      let lockedCount = 0;

      // Start with random characters
      element.textContent = Array.from({ length }, () =>
        scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
      ).join('');

      function animate() {
        frame++;

        // Calculate how many characters should be locked
        const targetLocked = Math.min(length, Math.floor(frame / framesPerChar));

        let result = '';

        for (let i = 0; i < length; i++) {
          if (i < targetLocked) {
            // Locked - show final character
            result += finalText[i];
          } else if (i === targetLocked) {
            // Currently resolving - rapid scramble
            result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          } else {
            // Not yet reached - slower scramble
            if (frame % 3 === 0) {
              result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            } else {
              const prev = element.textContent[i];
              result += (prev && prev !== finalText[i]) ? prev : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
          }
        }

        element.textContent = result;

        if (targetLocked >= length) {
          element.textContent = finalText;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    }, delay);
  });
}

// Store original text
const originalTexts = {
  ja: '変革せよ。変革を迫られる前に。',
  en: 'Change before you have to.',
  author: 'ー Jack Welch'
};

// Initialize with empty text
heroCopyJa.textContent = '';
heroCopyEn.textContent = '';
heroCopyAuthor.textContent = '';

let heroAnimationPlayed = false;

async function playHeroCopyAnimation() {
  heroCopy.classList.add('visible');

  if (!heroAnimationPlayed) {
    heroAnimationPlayed = true;
    // Play scramble animations in sequence (1.3x duration)
    await scrambleText(heroCopyJa, originalTexts.ja, 1560, 0);
    await scrambleText(heroCopyEn, originalTexts.en, 1040, 300);
    await scrambleText(heroCopyAuthor, originalTexts.author, 780, 200);
  }
}

function restoreHeroCopyText() {
  // Restore text without animation (for when scrolling back to top)
  if (heroAnimationPlayed) {
    heroCopyJa.textContent = originalTexts.ja;
    heroCopyEn.textContent = originalTexts.en;
    heroCopyAuthor.textContent = originalTexts.author;
  }
}

// Footer
const siteFooter = document.getElementById('site-footer');

// Scroll hint
const scrollHint = document.getElementById('scroll-hint');
const clickHint = document.getElementById('click-hint');
let hasScrolled = false;

window.addEventListener('mousemove', (e) => {
  const hoverFloor = roomManager.checkHover(e.clientX, e.clientY);
  if (hoverFloor >= 0 && roomManager.isExploring()) {
    clickHint.classList.add('visible');
    canvas.style.cursor = 'pointer';
  } else {
    clickHint.classList.remove('visible');
    canvas.style.cursor = 'default';
  }
});

window.addEventListener('wheel', () => {
  if (!hasScrolled) {
    hasScrolled = true;
    scrollHint.classList.remove('visible');
  }
}, { passive: true });

// Track current floor for nav highlight
let currentFloorIndex = FLOOR_COUNT - 1; // Start at RF

function updateHeroCopyVisibility(progress) {
  // Show hero copy only when near the top (RF area)
  if (progress > 0.85) {
    if (!heroCopy.classList.contains('visible')) {
      restoreHeroCopyText();
      heroCopy.classList.add('visible');
    }
  } else {
    heroCopy.classList.remove('visible');
  }
}

function updateFooterVisibility(progress) {
  // Show footer only when near the bottom (1F area)
  if (progress < 0.15) {
    siteFooter.classList.add('visible');
  } else {
    siteFooter.classList.remove('visible');
  }
}

function updateFloorNavHighlight(progress) {
  const floorIndex = Math.round(progress * (FLOOR_COUNT - 1));
  if (floorIndex === currentFloorIndex) return;

  currentFloorIndex = floorIndex;
  const floor = floors[floorIndex];

  // Update left nav
  const navLinks = floorNavList.querySelectorAll('a');
  navLinks.forEach(link => {
    const linkIndex = parseInt(link.dataset.floorIndex);
    if (linkIndex === floorIndex) {
      link.classList.add('active');
      link.style.setProperty('--active-color', floor.cssColor);
    } else {
      link.classList.remove('active');
    }
  });

  // Update hamburger nav
  const menuLinks = navList.querySelectorAll('a');
  menuLinks.forEach(link => {
    const linkIndex = parseInt(link.dataset.floorIndex);
    if (linkIndex === floorIndex) {
      link.classList.add('active');
      link.style.setProperty('--floor-color', floor.cssColor);
    } else {
      link.classList.remove('active');
    }
  });
}

// Main update loop
sm.onUpdate((delta, elapsed) => {
  // Update scroll & camera
  const progress = scrollController.update();
  const shakeOffset = cameraShake.update(elapsed);
  cameraRig.setShake(shakeOffset);
  cameraRig.update(progress);

  // Update building animations
  building.update(elapsed);

  // Update effects
  rain.update(delta);
  fog.update(elapsed);

  // Update vignette time uniform
  if (vignettePass) {
    vignettePass.uniforms.uTime.value = elapsed;
  }

  // Update environment (background/fog based on scroll)
  updateEnvironment(sm.scene, progress);

  // Update floor nav highlight
  updateFloorNavHighlight(progress);

  // Update hero copy visibility
  updateHeroCopyVisibility(progress);

  // Update footer visibility
  updateFooterVisibility(progress);
});

// Final setup
loading.setProgress(100, 'READY');
loading.hide();

// Show UI elements after loading
setTimeout(() => {
  floorNav.classList.add('visible');
  scrollHint.classList.add('visible');
  // Play scramble text animation for hero copy
  playHeroCopyAnimation();
  // Initialize nav highlight
  updateFloorNavHighlight(1.0);
}, 2000);

// Start render loop
sm.start();

// === Distant cityscape ===
function addCitySilhouette(scene) {
  const cityGroup = new THREE.Group();
  const silhouetteMat = new THREE.MeshBasicMaterial({
    color: 0x080812,
    transparent: true,
    opacity: 0.6,
  });

  // Random distant buildings
  for (let i = 0; i < 60; i++) {
    const bw = 2 + Math.random() * 5;
    const bh = 5 + Math.random() * 30;
    const bd = 2 + Math.random() * 5;
    const geo = new THREE.BoxGeometry(bw, bh, bd);
    const mesh = new THREE.Mesh(geo, silhouetteMat);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 80;
    mesh.position.set(
      Math.cos(angle) * dist,
      bh / 2 - 1,
      Math.sin(angle) * dist
    );
    mesh.rotation.y = Math.random() * Math.PI;
    cityGroup.add(mesh);

    // Occasional lit window on distant buildings
    if (Math.random() > 0.6) {
      const winCount = Math.floor(Math.random() * 4) + 1;
      for (let j = 0; j < winCount; j++) {
        const winGeo = new THREE.PlaneGeometry(0.5, 0.5);
        const winMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.1, 0.3, 0.5 + Math.random() * 0.3),
          transparent: true,
          opacity: 0.3 + Math.random() * 0.4,
        });
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(
          mesh.position.x + (Math.random() - 0.5) * bw * 0.8,
          Math.random() * bh,
          mesh.position.z + bd / 2 + 0.1
        );
        cityGroup.add(win);
      }
    }
  }

  scene.add(cityGroup);
}
