import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Custom vignette + film grain shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uVignetteIntensity: { value: 0.4 },
    uGrainIntensity: { value: 0.06 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uVignetteIntensity;
    uniform float uGrainIntensity;
    varying vec2 vUv;

    float random(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);

      // Vignette
      vec2 center = vUv - 0.5;
      float dist = length(center);
      float vignette = 1.0 - smoothstep(0.3, 0.85, dist) * uVignetteIntensity;
      color.rgb *= vignette;

      // Film grain
      float grain = random(vUv + fract(uTime * 0.1)) * uGrainIntensity;
      color.rgb += grain - uGrainIntensity * 0.5;

      gl_FragColor = color;
    }
  `,
};

export function setupPostProcessing(renderer, scene, camera, isMobile = false) {
  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  if (!isMobile) {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.2,   // strength
      0.5,   // radius
      0.82   // threshold
    );
    composer.addPass(bloomPass);
  }

  const vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  return { composer, vignettePass };
}
