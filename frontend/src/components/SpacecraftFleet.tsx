"use client";

import * as THREE from "three";
import { createThrusterPlume } from "./ThrusterPlume";

// ── PROCEDURAL HULL AND MYLAR TEXTURES FOR IMMERSION ──
function createCrinkledFoilTexture() {
  if (typeof window === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 45; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 128, Math.random() * 128);
    ctx.lineTo(Math.random() * 128, Math.random() * 128);
    ctx.lineTo(Math.random() * 128, Math.random() * 128);
    ctx.closePath();
    const g = 140 + Math.floor(Math.random() * 115);
    ctx.fillStyle = `rgb(${g}, ${g}, ${g})`;
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

function createPanelNormalMap() {
  if (typeof window === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#8080ff"; // neutral normal vector
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#7272ff"; // normal bevel lines
  ctx.lineWidth = 3;
  for (let i = 0; i <= 256; i += 64) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

// ── SPACEWALKING ASTRONAUT EMU SUIT ──
export function createAstronaut() {
  const astronautGroup = new THREE.Group();
  const innerGroup = new THREE.Group();
  astronautGroup.add(innerGroup);

  const fabricNormal = createPanelNormalMap();

  // HELMET (sphere with visor cutout)
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, normalMap: fabricNormal })
  );
  helmet.position.set(0, 0.98, 0);
  helmet.castShadow = true;
  innerGroup.add(helmet);

  // GOLD REFLECTIVE VISOR
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.185, 32, 16, 0, Math.PI * 2, 0, 1.1),
    new THREE.MeshStandardMaterial({ color: 0xffbb00, metalness: 0.95, roughness: 0.05 })
  );
  visor.position.set(0, 1.02, 0.04);
  visor.rotation.x = -0.3;
  visor.castShadow = true;
  innerGroup.add(visor);

  // HUT UPPER TORSO
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.35, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xeeeee8, roughness: 0.7, normalMap: fabricNormal })
  );
  torso.position.set(0, 0.6, 0);
  torso.castShadow = true;
  innerGroup.add(torso);

  // LTA LOWER TORSO TROUSERS
  const lowerTorso = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.28, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.75 })
  );
  lowerTorso.position.set(0, 0.28, 0);
  lowerTorso.castShadow = true;
  innerGroup.add(lowerTorso);

  // JOINTED SUIT ARMS
  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.2, 0.6, 0);
  const upperArmL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 })
  );
  upperArmL.rotation.z = -Math.PI / 6;
  upperArmL.castShadow = true;
  leftArm.add(upperArmL);
  
  const elbowL = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd0d0c8, roughness: 0.5 })
  );
  elbowL.position.set(-0.05, -0.18, 0);
  elbowL.castShadow = true;
  leftArm.add(elbowL);

  const lowerArmL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xe0e0d8, roughness: 0.7 })
  );
  lowerArmL.position.set(-0.1, -0.34, 0);
  lowerArmL.castShadow = true;
  leftArm.add(lowerArmL);

  const gloveL = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.1, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.5 })
  );
  gloveL.position.set(-0.12, -0.48, 0);
  gloveL.castShadow = true;
  leftArm.add(gloveL);
  innerGroup.add(leftArm);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.2, 0.6, 0);
  const upperArmR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 })
  );
  upperArmR.rotation.z = Math.PI / 6;
  upperArmR.castShadow = true;
  rightArm.add(upperArmR);

  const elbowR = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd0d0c8, roughness: 0.5 })
  );
  elbowR.position.set(0.05, -0.18, 0);
  elbowR.castShadow = true;
  rightArm.add(elbowR);

  const lowerArmR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0xe0e0d8, roughness: 0.7 })
  );
  lowerArmR.position.set(0.1, -0.34, 0);
  lowerArmR.castShadow = true;
  rightArm.add(lowerArmR);

  const gloveR = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.1, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x909090, roughness: 0.5 })
  );
  gloveR.position.set(0.12, -0.48, 0);
  gloveR.castShadow = true;
  rightArm.add(gloveR);
  innerGroup.add(rightArm);

  // SUIT LEGS
  [-0.07, 0.07].forEach((xOffset) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(xOffset, 0, 0);
    const legMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.06, 0.32, 12),
      new THREE.MeshStandardMaterial({ color: 0xe0e0d8, roughness: 0.75 })
    );
    legMesh.position.set(0, -0.06, 0);
    legMesh.castShadow = true;
    legGroup.add(legMesh);

    const bootMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x808880, roughness: 0.6 })
    );
    bootMesh.position.set(0, -0.24, 0.02);
    bootMesh.castShadow = true;
    legGroup.add(bootMesh);
    innerGroup.add(legGroup);
  });

  // PLSS LIFE SUPPORT BACKPACK
  const plss = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.3, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xddddd8, roughness: 0.6 })
  );
  plss.position.set(0, 0.6, -0.17);
  plss.castShadow = true;
  innerGroup.add(plss);

  // SAFER THRUSTER NOZZLES
  const nozzles = [
    [-0.12, 0.1],
    [0.12, 0.1],
    [-0.12, -0.1],
    [0.12, -0.1],
  ];
  nozzles.forEach(([x, y]) => {
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.025, 0.04, 8),
      new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.9, roughness: 0.3 })
    );
    nozzle.position.set(x, 0.6 + y, -0.24);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.castShadow = true;
    innerGroup.add(nozzle);
  });

  // Safety Umbilical golden tether
  const tetherCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.5, -0.5, 0.5),
    new THREE.Vector3(1.2, 0.2, -0.3),
    new THREE.Vector3(2.0, 0.5, 0),
  ]);
  const tether = new THREE.Mesh(
    new THREE.TubeGeometry(tetherCurve, 40, 0.008, 6, false),
    new THREE.MeshStandardMaterial({ color: 0xd4a030, metalness: 0.7, roughness: 0.3 })
  );
  astronautGroup.add(tether);

  astronautGroup.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    if (prefersReducedMotion) return;
    // Float zero-g drift tumbles
    innerGroup.position.y = Math.sin(time * 0.8) * 0.4;
    innerGroup.position.x = Math.cos(time * 0.5) * 0.2;
    innerGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
    innerGroup.rotation.y = time * 0.05;
  };

  return astronautGroup;
}

// ── CREATOR CRUISER ──
export function createCreatorCruiser() {
  const cruiser = new THREE.Group();

  // Sleek aerodynamic main hull (white)
  const hullGeo = new THREE.CylinderGeometry(0.2, 0.4, 2.2, 16);
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.3,
    metalness: 0.1,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.rotation.x = Math.PI / 2;
  hull.castShadow = true;
  cruiser.add(hull);

  // Tapered nosecone
  const noseGeo = new THREE.ConeGeometry(0.2, 0.6, 16);
  const nose = new THREE.Mesh(noseGeo, hullMat);
  nose.position.set(0, 0, 1.4);
  nose.rotation.x = Math.PI / 2;
  cruiser.add(nose);

  // Golden solar panel wings
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xd4a030,
    metalness: 0.9,
    roughness: 0.2,
  });
  [-1, 1].forEach((side) => {
    const wingGeo = new THREE.BoxGeometry(1.6, 0.02, 0.4);
    const wing = new THREE.Mesh(wingGeo, panelMat);
    wing.position.set(side * 0.9, 0, 0.1);
    cruiser.add(wing);
  });

  // Subtly glowing engine exhaust
  const enginePlume = createThrusterPlume("#00ffc8", 80, 0.3);
  enginePlume.position.set(0, 0, -1.25);
  enginePlume.rotation.x = Math.PI / 2;
  cruiser.add(enginePlume);

  cruiser.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    if (prefersReducedMotion) return;
    cruiser.position.y = Math.sin(time * 0.5) * 0.1;
  };

  return cruiser;
}

// ── PRESSURIZED INDUSTRIAL CARGO SPACECRAFT ──
export function createCargoShip() {
  const cargoGroup = new THREE.Group();
  const panelNormal = createPanelNormalMap();

  // Pressurized cylindrical hull module
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 2.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.8, metalness: 0.2, normalMap: panelNormal })
  );
  hull.castShadow = true;
  hull.receiveShadow = true;
  cargoGroup.add(hull);

  // Modular shipping cargo cubes
  const containerCoords = [
    [-0.5, -0.75],
    [0.5, -0.75],
    [-0.5, 0.1],
    [0.5, 0.1],
  ];
  const containerColors = [0x3050a0, 0xa03020, 0x30a040, 0xa09020];
  containerCoords.forEach(([x, y], idx) => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.6, 0.8),
      new THREE.MeshStandardMaterial({
        color: containerColors[idx],
        roughness: 0.7,
        metalness: 0.3,
        normalMap: panelNormal,
      })
    );
    box.position.set(x, y, 0);
    box.castShadow = true;
    cargoGroup.add(box);
  });

  // Front octagonal docking port collar
  const dock = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.06, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.9 })
  );
  dock.position.y = 1.2;
  dock.rotation.x = Math.PI / 2;
  dock.castShadow = true;
  cargoGroup.add(dock);

  // Rear engine cluster bells
  [-0.35, 0.35].forEach((xOffset) => {
    const nozzleGroup = new THREE.Group();
    nozzleGroup.position.set(xOffset, -1.3, 0);

    const bell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.14, 0.4, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x604010, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide })
    );
    bell.castShadow = true;
    nozzleGroup.add(bell);

    const plume = createThrusterPlume("#ff5500", 120, 0.5);
    plume.position.set(0, -0.2, 0);
    plume.rotation.x = Math.PI;
    nozzleGroup.add(plume);

    cargoGroup.add(nozzleGroup);
  });

  return cargoGroup;
}

// ── HUBBLE SPACE TELESCOPE ──
export function createHubbleTelescope() {
  const hubble = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1,
  });

  const foilTex = createCrinkledFoilTexture();
  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xd4a030, // Golden Mylar insulation
    map: foilTex,
    roughness: 0.35,
    metalness: 0.9,
  });

  // 1. Tapered Front Telescope Tube
  const frontTube = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 1.0, 16), bodyMat);
  frontTube.position.set(0, 0, 0.4);
  frontTube.rotation.x = Math.PI / 2;
  frontTube.castShadow = true;
  hubble.add(frontTube);

  // 2. Rear Wider Equipment/Mirror Section
  const rearSection = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.8, 16), bodyMat);
  rearSection.position.set(0, 0, -0.5);
  rearSection.rotation.x = Math.PI / 2;
  rearSection.castShadow = true;
  hubble.add(rearSection);

  // 3. Reflective Telescope Lens primary mirror inside the barrel
  const lensGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    roughness: 0.01,
    metalness: 0.98,
    emissive: 0x001133,
    emissiveIntensity: 0.4,
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.position.set(0, 0, 0.3); // nested inside the front tube
  lens.rotation.x = Math.PI / 2;
  hubble.add(lens);

  // 4. Aperture door (open cap at one end)
  const doorGeo = new THREE.BoxGeometry(0.35, 0.02, 0.35);
  const door = new THREE.Mesh(doorGeo, bodyMat);
  door.position.set(0, 0.32, 0.88);
  door.rotation.x = -Math.PI / 3.5;
  door.castShadow = true;
  hubble.add(door);

  // 5. Golden/copper solar panels
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xd4a030,
    metalness: 0.7,
    roughness: 0.3,
  });
  [-1, 1].forEach((side) => {
    const panelGroup = new THREE.Group();
    panelGroup.position.set(side * 0.75, 0, 0);

    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8);
    const arm = new THREE.Mesh(armGeo, bodyMat);
    arm.rotation.z = Math.PI / 2;
    panelGroup.add(arm);

    const solarGeo = new THREE.BoxGeometry(0.12, 0.02, 1.4);
    const solar = new THREE.Mesh(solarGeo, panelMat);
    solar.position.x = side * 0.25;
    panelGroup.add(solar);

    hubble.add(panelGroup);
  });

  // 6. Gold-foiled electronics equipment boxes on the rear
  const boxGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
  [-0.48, 0.48].forEach((xPos) => {
    const box = new THREE.Mesh(boxGeo, foilMat);
    box.position.set(xPos, 0.15, -0.4);
    box.castShadow = true;
    hubble.add(box);
  });

  // 7. Communication antenna dishes
  const dishGeo = new THREE.ConeGeometry(0.15, 0.08, 12, 1, true);
  const dish = new THREE.Mesh(dishGeo, panelMat);
  dish.position.set(0, -0.45, -0.2);
  dish.rotation.x = Math.PI;
  dish.castShadow = true;
  hubble.add(dish);

  hubble.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    if (prefersReducedMotion) return;
    hubble.rotation.y = time * 0.03;
    hubble.rotation.x = time * 0.01;
  };

  return hubble;
}

// ── INTERNATIONAL SPACE STATION (ISS) ──
export function createISS() {
  const iss = new THREE.Group();

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x999999,
    metalness: 0.9,
    roughness: 0.2,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xb87333, // Copper/gold solar panels
    metalness: 0.8,
    roughness: 0.4,
  });

  const radiatorMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0, // White thermal radiators
    roughness: 0.8,
    metalness: 0.1,
  });

  // 1. Central long integrated truss structure with detailed cross grid supports
  const trussGeo = new THREE.BoxGeometry(0.12, 0.12, 7.5);
  const truss = new THREE.Mesh(trussGeo, metalMat);
  iss.add(truss);

  // Detailed cross support girders on the truss
  for (let z = -3.0; z <= 3.0; z += 1.0) {
    if (Math.abs(z) < 0.5) continue;
    const girder = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.04), metalMat);
    girder.position.set(0, 0, z);
    iss.add(girder);
  }

  // 2. Central cylindrical modules core (Destiny / Unity Node)
  const coreModule = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 12), metalMat);
  coreModule.rotation.x = Math.PI / 2;
  coreModule.castShadow = true;
  iss.add(coreModule);

  const coreNode = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), metalMat);
  iss.add(coreNode);

  // 3. Columbus & Kibo Research Modules extending laterally
  const kiboModule = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.8, 12), metalMat);
  kiboModule.position.set(0.6, 0, 0.3);
  kiboModule.rotation.z = Math.PI / 2;
  kiboModule.castShadow = true;
  iss.add(kiboModule);

  const columbusModule = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.6, 12), metalMat);
  columbusModule.position.set(-0.55, 0, 0.3);
  columbusModule.rotation.z = Math.PI / 2;
  columbusModule.castShadow = true;
  iss.add(columbusModule);

  // 4. Russian Zvezda Service Module core (back section)
  const serviceModule = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.85, 12), metalMat);
  serviceModule.position.set(0, 0, -1.25);
  serviceModule.rotation.x = Math.PI / 2;
  serviceModule.castShadow = true;
  iss.add(serviceModule);

  // Smaller solar panels for Zvezda module
  [-0.9, 0.9].forEach((xOffset) => {
    const smPanelGeo = new THREE.BoxGeometry(0.65, 0.01, 0.18);
    const smPanel = new THREE.Mesh(smPanelGeo, copperMat);
    smPanel.position.set(xOffset, 0, -1.25);
    iss.add(smPanel);
  });

  // 5. White radiator arrays perpendicular to solar arrays
  const radiatorPositions = [-1.6, 1.6];
  radiatorPositions.forEach((zOffset) => {
    const radGeo = new THREE.BoxGeometry(0.75, 0.01, 1.1);
    const rad = new THREE.Mesh(radGeo, radiatorMat);
    rad.position.set(0, 0.2, zOffset);
    rad.rotation.y = Math.PI / 2;
    rad.castShadow = true;
    iss.add(rad);
  });

  // 6. Main solar array wings mounted on cylindrical rotating masts
  const arrayWings = [-3.3, 3.3];
  const panelsToTrack: THREE.Mesh[] = [];
  arrayWings.forEach((zOffset) => {
    // Mounting mast
    const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.8, 8);
    const mast = new THREE.Mesh(mastGeo, metalMat);
    mast.rotation.z = Math.PI / 2;
    mast.position.set(0, 0, zOffset);
    iss.add(mast);

    // 4 large solar panels on each side
    [-0.8, -0.3, 0.3, 0.8].forEach((xOffset) => {
      const panelGeo = new THREE.BoxGeometry(1.4, 0.02, 0.45);
      const panel = new THREE.Mesh(panelGeo, copperMat);
      panel.position.set(xOffset * 1.5, 0, zOffset);
      panel.castShadow = true;
      iss.add(panel);
      panelsToTrack.push(panel);
    });
  });

  iss.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    // Dual axis sun tracking
    iss.updateMatrixWorld();
    const sunWorld = new THREE.Vector3(200, 50, 300);
    const localSun = sunWorld.clone().applyMatrix4(iss.matrixWorld.clone().invert());
    // Rotate panels around local X-axis to point normal to the sun in local space
    const angle = Math.atan2(localSun.z, localSun.y);
    panelsToTrack.forEach((p) => {
      p.rotation.x = angle;
    });

    if (prefersReducedMotion) return;
    iss.rotation.y = time * 0.015;
    iss.rotation.x = time * 0.005;
  };

  return iss;
}

// ── ORBITAL DOCKING SHIPYARD ──
export function createSpaceShipyard() {
  const shipyard = new THREE.Group();
  const panelNormal = createPanelNormalMap();

  // Central base spaceport tube
  const mainTube = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a4a50, metalness: 0.9, roughness: 0.3, normalMap: panelNormal })
  );
  mainTube.castShadow = true;
  mainTube.receiveShadow = true;
  shipyard.add(mainTube);

  // Massive open docking coordinates ring
  const dockRing = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 0.5, 8, 48),
    new THREE.MeshStandardMaterial({ color: 0x2d2d32, metalness: 0.9, normalMap: panelNormal })
  );
  dockRing.rotation.x = Math.PI / 2;
  dockRing.castShadow = true;
  shipyard.add(dockRing);

  // Rotating Gravity Hub
  const gravityHub = new THREE.Group();
  const rotor = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.5 })
  );
  rotor.position.y = 4;
  rotor.castShadow = true;
  gravityHub.add(rotor);

  // Support truss columns
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const truss = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 12, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x303035 })
    );
    truss.position.set(Math.cos(angle) * 7.5, -4, Math.sin(angle) * 7.5);
    truss.rotation.y = -angle;
    truss.castShadow = true;
    gravityHub.add(truss);
  }
  shipyard.add(gravityHub);

  // Solar Panel energy collectors
  const solarGroup = new THREE.Group();
  solarGroup.position.y = 8;
  solarGroup.rotation.y = Math.PI / 4;
  const shipyardPanels: THREE.Mesh[] = [];
  [-8, 8].forEach((xPos) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.02, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x0b1d33, emissive: 0x00ffc8, emissiveIntensity: 0.2, normalMap: panelNormal })
    );
    panel.position.x = xPos;
    panel.castShadow = true;
    solarGroup.add(panel);
    shipyardPanels.push(panel);
  });
  shipyard.add(solarGroup);

  // Warning strobe beacons
  const beaconMatRed = new THREE.MeshBasicMaterial({ color: 0xff0040 });
  const beaconMatGreen = new THREE.MeshBasicMaterial({ color: 0x00ff40 });

  const beaconRed = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), beaconMatRed);
  beaconRed.position.set(0, 2.5, 1.6);
  shipyard.add(beaconRed);

  const beaconGreen = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), beaconMatGreen);
  beaconGreen.position.set(0, -2.5, -1.6);
  shipyard.add(beaconGreen);

  // Drifting maintenance Spacewalker
  const astronaut = createAstronaut();
  astronaut.position.set(3.5, 2, 0);
  astronaut.rotation.y = Math.PI / 2;
  shipyard.add(astronaut);

  // Creator Cruiser docked at the platform
  const dockedExplorer = createCreatorCruiser();
  dockedExplorer.position.set(7.5, 0, 0);
  dockedExplorer.rotation.z = Math.PI / 2;
  dockedExplorer.scale.set(0.45, 0.45, 0.45);
  shipyard.add(dockedExplorer);

  shipyard.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    const strobe = Math.sin(time * 8.0) > 0.0;
    beaconMatRed.color.setHex(strobe ? 0xff0040 : 0x200005);
    beaconMatGreen.color.setHex(strobe ? 0x00ff40 : 0x002005);

    // Sun tracking
    shipyard.updateMatrixWorld();
    const sunWorld = new THREE.Vector3(200, 50, 300);
    const localSun = sunWorld.clone().applyMatrix4(shipyard.matrixWorld.clone().invert());
    // Rotate solarGroup around local Y-axis to track sun azimuth
    const azimuth = Math.atan2(localSun.x, localSun.z);
    solarGroup.rotation.y = azimuth;

    // Tilt panels around their X axis to track sun elevation
    const localSunRotated = localSun.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -azimuth);
    const tiltAngle = Math.atan2(localSunRotated.z, localSunRotated.y);
    shipyardPanels.forEach((p) => {
      p.rotation.x = tiltAngle;
    });

    if (prefersReducedMotion) return;
    gravityHub.rotation.y = time * 0.04;
    
    // Delegate updates to children
    astronaut.userData.update?.(time, delta, prefersReducedMotion);
    dockedExplorer.userData.update?.(time, delta, prefersReducedMotion);
  };

  return shipyard;
}

// ── FLEET FORMATION ORGANIZER ──
export function createSpacecraftFleet() {
  const fleetGroup = new THREE.Group();

  // 1. Large Cargo Container Ship
  const cargo = createCargoShip();
  fleetGroup.add(cargo);

  // 2. Creator Cruiser
  const cruiser = createCreatorCruiser();
  cruiser.position.set(-12, 4, -4);
  cruiser.scale.set(1.2, 1.2, 1.2);
  cruiser.rotation.x = 0.05;
  fleetGroup.add(cruiser);

  // 3. Companion mapping probes
  const probe1 = createHubbleTelescope();
  probe1.position.set(8, 3, 6);
  probe1.scale.set(0.8, 0.8, 0.8);
  fleetGroup.add(probe1);

  const probe2 = createHubbleTelescope();
  probe2.position.set(-9, -3, 8);
  probe2.scale.set(0.8, 0.8, 0.8);
  fleetGroup.add(probe2);

  fleetGroup.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    if (prefersReducedMotion) return;
    fleetGroup.position.z = -175 + Math.sin(time * 0.03) * 3;

    // Propagate updates to children
    cruiser.userData.update?.(time, delta, prefersReducedMotion);
    probe1.userData.update?.(time, delta, prefersReducedMotion);
    probe2.userData.update?.(time, delta, prefersReducedMotion);
  };

  return fleetGroup;
}

// ── SATELLITE SYSTEM ARRAY (Hubble Space Telescope) ──
export function createSatellite() {
  return createHubbleTelescope();
}

// ── MMINT HABITAT RING (Rotating Stanford Torus) ──
export function createHabitatRing() {
  const group = new THREE.Group();
  
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.8,
    roughness: 0.2,
  });

  const emissiveWindowMat = new THREE.MeshBasicMaterial({
    color: 0xffdd80,
  });

  // Main torus tube (the living ring)
  const ringGeo = new THREE.TorusGeometry(3.0, 0.35, 16, 64);
  const ring = new THREE.Mesh(ringGeo, metalMat);
  ring.rotation.x = Math.PI / 2;
  ring.castShadow = true;
  ring.receiveShadow = true;
  group.add(ring);

  // Central hub (cylinder)
  const hubGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.0, 16);
  const hub = new THREE.Mesh(hubGeo, metalMat);
  hub.rotation.x = Math.PI / 2;
  hub.castShadow = true;
  group.add(hub);

  // Spokes connecting hub to torus
  const numSpokes = 6;
  for (let i = 0; i < numSpokes; i++) {
    const angle = (i / numSpokes) * Math.PI * 2;
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.y = angle;

    const spokeGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8);
    const spoke = new THREE.Mesh(spokeGeo, metalMat);
    spoke.position.y = 1.5;
    spoke.rotation.z = Math.PI / 2; // Lie flat in the ring plane
    spoke.castShadow = true;
    spokeGroup.add(spoke);

    group.add(spokeGroup);
  }

  // Windows: small glowing cylinders/boxes around the ring
  const numWindows = 32;
  for (let i = 0; i < numWindows; i++) {
    const angle = (i / numWindows) * Math.PI * 2;
    const x = Math.cos(angle) * 3.0;
    const z = Math.sin(angle) * 3.0;

    const winGeo = new THREE.BoxGeometry(0.08, 0.12, 0.04);
    
    // Inner windows
    const win1 = new THREE.Mesh(winGeo, emissiveWindowMat);
    win1.position.set(x * 0.9, 0.0, z * 0.9);
    win1.lookAt(0, 0, 0);
    group.add(win1);

    // Outer windows
    const win2 = new THREE.Mesh(winGeo, emissiveWindowMat);
    win2.position.set(x * 1.1, 0.0, z * 1.1);
    win2.lookAt(0, 0, 0);
    group.add(win2);
  }

  group.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    if (prefersReducedMotion) return;
    group.rotation.y = time * 0.06; // Spin station for artificial gravity simulation
  };

  return group;
}

// ── MMINT RELAY SATELLITE ──
export function createRelaySatellite() {
  const satGroup = new THREE.Group();
  
  const foilTex = createCrinkledFoilTexture();
  const foilMat = new THREE.MeshStandardMaterial({
    color: 0xd4a030, // Golden Mylar foil
    map: foilTex,
    roughness: 0.35,
    metalness: 0.9,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa,
    metalness: 0.8,
    roughness: 0.3,
  });

  const beaconMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
  });

  // 1. Central bus (gold foil cube)
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), foilMat);
  bus.castShadow = true;
  satGroup.add(bus);

  // 2. High-gain communication dish (parabolic cone)
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.18, 0.12, 12, 1, true),
    metalMat
  );
  dish.position.z = 0.22;
  dish.rotation.x = Math.PI / 2;
  dish.castShadow = true;
  satGroup.add(dish);

  const subFeed = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6), metalMat);
  subFeed.position.z = 0.28;
  subFeed.rotation.x = Math.PI / 2;
  satGroup.add(subFeed);

  // 3. Solar panel wings (two wings, blue-grey)
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0a1d33,
    roughness: 0.2,
    metalness: 0.8,
    emissive: 0x003344,
    emissiveIntensity: 0.3,
  });
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6), metalMat);
    arm.position.x = side * 0.22;
    arm.rotation.z = Math.PI / 2;
    satGroup.add(arm);

    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.18), panelMat);
    panel.position.x = side * 0.5;
    panel.castShadow = true;
    satGroup.add(panel);
  });

  // 4. Thruster nozzles (tiny grey cylinders at the bottom)
  [-0.1, 0.1].forEach((xOff) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.04, 6), metalMat);
    nozzle.position.set(xOff, -0.16, 0);
    nozzle.castShadow = true;
    satGroup.add(nozzle);
  });

  // 5. Glowing blue transponder beacons
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), beaconMat);
  beacon.position.set(0, 0.16, 0);
  satGroup.add(beacon);

  satGroup.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    // Pulse beacon glow
    const pulse = 0.5 + 0.5 * Math.sin(time * 6.0);
    beaconMat.color.setRGB(0, pulse, pulse);
    
    if (prefersReducedMotion) return;
    // Micro-rotations to simulate attitude control drift
    bus.rotation.y = Math.sin(time * 0.2) * 0.05;
    bus.rotation.x = Math.cos(time * 0.15) * 0.05;
  };

  return satGroup;
}

// ── PASSENGER SHUTTLE ──
export function createPassengerShuttle() {
  const group = new THREE.Group();
  
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.3,
    metalness: 0.2,
  });
  
  const darkGlassMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.1,
    metalness: 0.9,
  });

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.4,
    metalness: 0.3,
  });

  // Main cabin (capsule-like shape)
  const cabin = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.8, 12), hullMat);
  cabin.rotation.x = Math.PI / 2;
  cabin.castShadow = true;
  group.add(cabin);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 12), hullMat);
  nose.position.z = 0.55;
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  // Visor / Cockpit window
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12, 0, Math.PI * 2, 0, 0.6), darkGlassMat);
  visor.position.set(0, 0.05, 0.5);
  visor.rotation.x = Math.PI / 3;
  group.add(visor);

  // Wings
  [-1, 1].forEach((side) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), wingMat);
    wing.position.set(side * 0.3, -0.05, -0.1);
    wing.rotation.y = side * 0.1;
    group.add(wing);
  });

  // Engine exhaust bell
  const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 8), wingMat);
  engine.position.set(0, 0, -0.475);
  engine.rotation.x = Math.PI / 2;
  group.add(engine);

  // Small blue thruster plume
  const plume = createThrusterPlume("#3388ff", 40, 0.12);
  plume.position.set(0, 0, -0.55);
  plume.rotation.x = Math.PI / 2;
  group.add(plume);

  return group;
}

// ── MAINTENANCE DRONE ──
export function createMaintenanceDrone() {
  const group = new THREE.Group();
  
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.9,
    roughness: 0.3,
  });

  const lightMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
  });

  // Spherical body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), metalMat);
  body.castShadow = true;
  group.add(body);

  // Sensor lens
  const eye = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.05, 8), new THREE.MeshBasicMaterial({ color: 0x00ffcc }));
  eye.position.set(0, 0.03, 0.1);
  eye.rotation.x = Math.PI / 2;
  group.add(eye);

  // Two tiny robotic arms
  [-1, 1].forEach((side) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.12, -0.05, 0.05);

    const segment1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6), metalMat);
    segment1.position.y = -0.075;
    segment1.rotation.z = side * 0.4;
    arm.add(segment1);

    const segment2 = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), metalMat);
    segment2.position.set(side * 0.05, -0.18, 0.05);
    segment2.rotation.x = 0.5;
    arm.add(segment2);

    group.add(arm);
  });

  // Blinking light
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), lightMat);
  light.position.set(0, 0.13, 0);
  group.add(light);

  group.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    // blink
    const blink = Math.sin(time * 12.0) > 0.0;
    lightMat.color.setHex(blink ? 0xffaa00 : 0x332200);
  };

  return group;
}

// ── ORBITAL FERRY ──
export function createOrbitalFerry() {
  const group = new THREE.Group();
  
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xddddcc,
    roughness: 0.5,
    metalness: 0.4,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.8,
    roughness: 0.3,
  });

  // Main flat rectangular bed/cabin
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.9), hullMat);
  body.castShadow = true;
  group.add(body);

  // Docking adaptors (torus on top)
  const dock = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), metalMat);
  dock.position.y = 0.14;
  dock.rotation.x = Math.PI / 2;
  group.add(dock);

  // Engine exhaust ports (four smaller nozzles at the back)
  const positions = [
    [-0.12, -0.06],
    [0.12, -0.06],
    [-0.12, 0.06],
    [0.12, 0.06],
  ];
  positions.forEach(([x, y]) => {
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.08, 6), metalMat);
    nozzle.position.set(x, y, -0.49);
    nozzle.rotation.x = Math.PI / 2;
    group.add(nozzle);
  });

  // Small orange plumes
  const plume1 = createThrusterPlume("#ffaa00", 30, 0.08);
  plume1.position.set(-0.12, 0, -0.54);
  plume1.rotation.x = Math.PI / 2;
  group.add(plume1);

  const plume2 = createThrusterPlume("#ffaa00", 30, 0.08);
  plume2.position.set(0.12, 0, -0.54);
  plume2.rotation.x = Math.PI / 2;
  group.add(plume2);

  return group;
}
