import * as THREE from 'three';
import { FLOOR_HEIGHT, FLOOR_COUNT, BUILDING_WIDTH, BUILDING_DEPTH, STAIRCASE_RADIUS } from '../utils/constants.js';
import { createFloor } from './FloorGeometry.js';
import { createNeonSign, createRooftopNeonSign, animateNeonSigns } from './NeonSigns.js';
import { addBuildingDetails, animateDetails } from './Details.js';
import { animateWindows } from './WindowSystem.js';
import { floors as floorData } from '../content/floorData.js';

// Building has 8 floors (1F-8F) + rooftop (RF)
const BUILDING_FLOORS = 8;

export class BuildingGenerator {
  constructor(scene) {
    this.scene = scene;
    this.buildingGroup = new THREE.Group();
    this.allWindows = [];
    this.neonGroups = [];
    this.hitboxes = [];
    this.detailsGroup = null;

    this.generate();
    scene.add(this.buildingGroup);
  }

  generate() {
    // Generate building floors (1F-8F, indices 0-7)
    for (let i = 0; i < BUILDING_FLOORS; i++) {
      const data = floorData[i];
      const floorGroup = createFloor(i, data);
      floorGroup.position.y = i * FLOOR_HEIGHT;
      this.buildingGroup.add(floorGroup);

      // Collect windows for animation
      if (floorGroup.userData.windows) {
        this.allWindows.push(...floorGroup.userData.windows);
      }

      // Collect hitboxes for room entry
      if (floorGroup.userData.hitbox) {
        this.hitboxes.push(floorGroup.userData.hitbox);
      }

      // Add neon sign on building face
      const neonSign = createNeonSign(i, data);
      this.buildingGroup.add(neonSign);
      this.neonGroups.push(neonSign);
    }

    // Add rooftop structure
    const roofY = BUILDING_FLOORS * FLOOR_HEIGHT;
    this.addRooftop(roofY);

    // Add RF (rooftop) hitbox and neon sign
    this.addRooftopContent(roofY);

    // Add spiral staircase
    this.addStaircase();

    // Add building details (pipes, AC units, antenna, etc.)
    this.detailsGroup = addBuildingDetails(this.scene);

    // Add some interior glow lights (visible through windows)
    this.addInteriorLights();
  }

  addRooftop(roofY) {
    const w = BUILDING_WIDTH;
    const d = BUILDING_DEPTH;

    // === Main roof floor ===
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a32,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floorGeo = new THREE.BoxGeometry(w, 0.2, d);
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, roofY + 0.1, 0);
    floor.receiveShadow = true;
    this.buildingGroup.add(floor);

    // === Glass railings ===
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const railHeight = 1.0;
    const railThickness = 0.05;

    // Front glass rail
    const frontRailGeo = new THREE.BoxGeometry(w - 0.2, railHeight, railThickness);
    const frontRail = new THREE.Mesh(frontRailGeo, glassMat);
    frontRail.position.set(0, roofY + 0.2 + railHeight / 2, d / 2 - 0.1);
    this.buildingGroup.add(frontRail);

    // Back glass rail
    const backRail = new THREE.Mesh(frontRailGeo, glassMat);
    backRail.position.set(0, roofY + 0.2 + railHeight / 2, -d / 2 + 0.1);
    this.buildingGroup.add(backRail);

    // Side glass rails
    const sideRailGeo = new THREE.BoxGeometry(railThickness, railHeight, d - 0.2);
    const leftRail = new THREE.Mesh(sideRailGeo, glassMat);
    leftRail.position.set(-w / 2 + 0.1, roofY + 0.2 + railHeight / 2, 0);
    this.buildingGroup.add(leftRail);

    const rightRail = new THREE.Mesh(sideRailGeo, glassMat);
    rightRail.position.set(w / 2 - 0.1, roofY + 0.2 + railHeight / 2, 0);
    this.buildingGroup.add(rightRail);

    // Rail posts (metal)
    const postMat = new THREE.MeshStandardMaterial({
      color: 0x444450,
      roughness: 0.3,
      metalness: 0.8,
    });
    const postGeo = new THREE.CylinderGeometry(0.03, 0.03, railHeight + 0.1, 8);
    const postPositions = [
      [-w / 2 + 0.1, d / 2 - 0.1],
      [w / 2 - 0.1, d / 2 - 0.1],
      [-w / 2 + 0.1, -d / 2 + 0.1],
      [w / 2 - 0.1, -d / 2 + 0.1],
      [0, d / 2 - 0.1],
      [0, -d / 2 + 0.1],
      [-w / 2 + 0.1, 0],
      [w / 2 - 0.1, 0],
    ];
    for (const [px, pz] of postPositions) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(px, roofY + 0.2 + (railHeight + 0.1) / 2, pz);
      this.buildingGroup.add(post);
    }

    // === Helipad circle ===
    const helipadMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a45,
      roughness: 0.7,
      metalness: 0.2,
    });
    const helipadGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.02, 32);
    const helipad = new THREE.Mesh(helipadGeo, helipadMat);
    helipad.position.set(0, roofY + 0.22, 0);
    this.buildingGroup.add(helipad);

    // Helipad "H" marking
    const markingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.1,
    });
    // H vertical bars
    const hBarGeo = new THREE.BoxGeometry(0.3, 0.02, 1.5);
    const hLeft = new THREE.Mesh(hBarGeo, markingMat);
    hLeft.position.set(-0.5, roofY + 0.24, 0);
    this.buildingGroup.add(hLeft);
    const hRight = new THREE.Mesh(hBarGeo, markingMat);
    hRight.position.set(0.5, roofY + 0.24, 0);
    this.buildingGroup.add(hRight);
    // H horizontal bar
    const hCrossGeo = new THREE.BoxGeometry(1.3, 0.02, 0.3);
    const hCross = new THREE.Mesh(hCrossGeo, markingMat);
    hCross.position.set(0, roofY + 0.24, 0);
    this.buildingGroup.add(hCross);

    // === Equipment area (back corner) ===
    const equipMat = new THREE.MeshStandardMaterial({
      color: 0x333340,
      roughness: 0.6,
      metalness: 0.5,
    });

    // AC units
    const acGeo = new THREE.BoxGeometry(1.2, 0.8, 0.8);
    const ac1 = new THREE.Mesh(acGeo, equipMat);
    ac1.position.set(-w / 2 + 1.2, roofY + 0.6, -d / 2 + 1);
    this.buildingGroup.add(ac1);
    const ac2 = new THREE.Mesh(acGeo, equipMat);
    ac2.position.set(-w / 2 + 2.6, roofY + 0.6, -d / 2 + 1);
    this.buildingGroup.add(ac2);

    // AC fans (on top)
    const fanMat = new THREE.MeshStandardMaterial({
      color: 0x222230,
      roughness: 0.4,
      metalness: 0.7,
    });
    const fanGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 16);
    const fan1 = new THREE.Mesh(fanGeo, fanMat);
    fan1.position.set(-w / 2 + 1.2, roofY + 1.05, -d / 2 + 1);
    this.buildingGroup.add(fan1);
    const fan2 = new THREE.Mesh(fanGeo, fanMat);
    fan2.position.set(-w / 2 + 2.6, roofY + 1.05, -d / 2 + 1);
    this.buildingGroup.add(fan2);

    // === Antenna tower (back right) ===
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x555560,
      roughness: 0.3,
      metalness: 0.9,
    });
    const antennaGeo = new THREE.CylinderGeometry(0.05, 0.08, 4, 8);
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(w / 2 - 1, roofY + 2.2, -d / 2 + 1);
    this.buildingGroup.add(antenna);

    // Antenna light (red)
    const lightGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5,
    });
    const antennaLight = new THREE.Mesh(lightGeo, lightMat);
    antennaLight.position.set(w / 2 - 1, roofY + 4.3, -d / 2 + 1);
    antennaLight.layers.enable(1);
    this.buildingGroup.add(antennaLight);

    // === Rooftop ambient lights ===
    const roofLight = new THREE.PointLight(0x8899ff, 0.3, 15);
    roofLight.position.set(0, roofY + 3, 0);
    this.buildingGroup.add(roofLight);
  }

  addRooftopContent(roofY) {
    // RF data is at index 8
    const rfData = floorData[BUILDING_FLOORS];
    const rfIndex = BUILDING_FLOORS; // index 8 for RF

    // Rooftop hitbox for room entry
    const hitboxGeo = new THREE.BoxGeometry(BUILDING_WIDTH * 0.8, 2, BUILDING_DEPTH * 0.8);
    const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
    hitbox.position.set(0, roofY + 1.5, 0);
    hitbox.userData.floorIndex = rfIndex;
    hitbox.userData.isHitbox = true;
    this.buildingGroup.add(hitbox);
    this.hitboxes.push(hitbox);

    // Rooftop neon sign (standing on the roof)
    const neonSign = createRooftopNeonSign(rfIndex, rfData, roofY);
    this.buildingGroup.add(neonSign);
    this.neonGroups.push(neonSign);
  }

  addStaircase() {
    // Staircase goes up to the rooftop (8 floors)
    const totalHeight = BUILDING_FLOORS * FLOOR_HEIGHT;
    const radius = STAIRCASE_RADIUS;
    const stepsPerFloor = 16;
    const totalSteps = stepsPerFloor * BUILDING_FLOORS;
    const turns = 2.5;

    // Frosted glass material for staircase
    const frostedGlassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.4,
    });

    // InstancedMesh for steps
    const stepGeo = new THREE.BoxGeometry(1.8, 0.08, 0.5);
    const stepInstanced = new THREE.InstancedMesh(stepGeo, frostedGlassMat, totalSteps);
    stepInstanced.castShadow = false;
    stepInstanced.receiveShadow = false;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < totalSteps; i++) {
      const t = i / totalSteps;
      const angle = t * turns * Math.PI * 2;
      const y = t * totalHeight + 0.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, -angle + Math.PI / 2, 0);
      dummy.updateMatrix();
      stepInstanced.setMatrixAt(i, dummy.matrix);
    }
    stepInstanced.instanceMatrix.needsUpdate = true;
    this.buildingGroup.add(stepInstanced);

    // Railing material
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.35,
    });

    // Outer railing
    const railPoints = [];
    const segments = 300;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * turns * Math.PI * 2;
      const y = t * totalHeight + 1.1;
      railPoints.push(new THREE.Vector3(
        Math.cos(angle) * (radius + 0.3),
        y,
        Math.sin(angle) * (radius + 0.3)
      ));
    }
    const railCurve = new THREE.CatmullRomCurve3(railPoints);
    const railGeo = new THREE.TubeGeometry(railCurve, 400, 0.035, 6, false);
    const railing = new THREE.Mesh(railGeo, railMat);
    this.buildingGroup.add(railing);

    // Inner railing
    const innerRailPoints = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * turns * Math.PI * 2;
      const y = t * totalHeight + 1.1;
      innerRailPoints.push(new THREE.Vector3(
        Math.cos(angle) * (radius - 0.6),
        y,
        Math.sin(angle) * (radius - 0.6)
      ));
    }
    const innerRailCurve = new THREE.CatmullRomCurve3(innerRailPoints);
    const innerRailGeo = new THREE.TubeGeometry(innerRailCurve, 400, 0.025, 6, false);
    const innerRailing = new THREE.Mesh(innerRailGeo, railMat);
    this.buildingGroup.add(innerRailing);

    // Add glass human figures on staircase
    this.addGlassPeople(totalHeight, radius, turns);
  }

  addGlassPeople(totalHeight, radius, turns) {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.5,
    });

    // About 1 person per 2 floors
    const numPeople = Math.floor(BUILDING_FLOORS / 2);
    const usedFloors = new Set();

    for (let i = 0; i < numPeople; i++) {
      let floor;
      do {
        floor = Math.floor(Math.random() * BUILDING_FLOORS);
      } while (usedFloors.has(floor) && usedFloors.size < BUILDING_FLOORS);
      usedFloors.add(floor);

      const floorProgress = (floor + Math.random() * 0.8) / BUILDING_FLOORS;
      const angle = floorProgress * turns * Math.PI * 2;
      const y = floorProgress * totalHeight + 0.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const human = this.createGlassHuman(glassMat);
      human.position.set(x, y, z);
      human.rotation.y = -angle + Math.PI;
      this.buildingGroup.add(human);
    }
  }

  createGlassHuman(material) {
    const group = new THREE.Group();

    const headGeo = new THREE.SphereGeometry(0.12, 12, 8);
    const head = new THREE.Mesh(headGeo, material);
    head.position.y = 1.55;
    group.add(head);

    const neckGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8);
    const neck = new THREE.Mesh(neckGeo, material);
    neck.position.y = 1.4;
    group.add(neck);

    const torsoGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8);
    const torso = new THREE.Mesh(torsoGeo, material);
    torso.position.y = 1.1;
    group.add(torso);

    const hipsGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.2, 8);
    const hips = new THREE.Mesh(hipsGeo, material);
    hips.position.y = 0.75;
    group.add(hips);

    const legGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.6, 8);
    const leftLeg = new THREE.Mesh(legGeo, material);
    leftLeg.position.set(-0.07, 0.35, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, material);
    rightLeg.position.set(0.07, 0.35, 0);
    group.add(rightLeg);

    const armGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.45, 8);
    const leftArm = new THREE.Mesh(armGeo, material);
    leftArm.position.set(-0.2, 1.05, 0);
    leftArm.rotation.z = 0.15;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, material);
    rightArm.position.set(0.2, 1.05, 0);
    rightArm.rotation.z = -0.15;
    group.add(rightArm);

    return group;
  }

  addInteriorLights() {
    for (let i = 0; i < BUILDING_FLOORS; i++) {
      if (Math.random() > 0.6) continue;
      const y = i * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.6;
      const light = new THREE.PointLight(0xffaa44, 0.15, 8);
      light.position.set(0, y, 0);
      this.buildingGroup.add(light);
    }
  }

  update(elapsed) {
    animateWindows(this.allWindows, elapsed);
    animateNeonSigns(this.neonGroups, elapsed);
    if (this.detailsGroup) {
      animateDetails(this.detailsGroup, elapsed);
    }
  }

  getHitboxes() {
    return this.hitboxes;
  }
}
