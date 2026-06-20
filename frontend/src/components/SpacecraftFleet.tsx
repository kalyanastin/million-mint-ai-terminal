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

  // Silver cylindrical body
  const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.9,
    roughness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  hubble.add(body);

  // Aperture door (open cap at one end)
  const doorGeo = new THREE.BoxGeometry(0.4, 0.02, 0.4);
  const door = new THREE.Mesh(doorGeo, bodyMat);
  door.position.set(0, 0.4, 0.95);
  door.rotation.x = -Math.PI / 4;
  hubble.add(door);

  // Golden/copper solar panels
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

    const solarGeo = new THREE.BoxGeometry(0.1, 0.02, 1.4);
    const solar = new THREE.Mesh(solarGeo, panelMat);
    solar.position.x = side * 0.2;
    panelGroup.add(solar);

    hubble.add(panelGroup);
  });

  // Antennas / dishes
  const dishGeo = new THREE.ConeGeometry(0.15, 0.1, 8, 1, true);
  const dish = new THREE.Mesh(dishGeo, panelMat);
  dish.position.set(0, -0.45, 0);
  dish.rotation.x = Math.PI;
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
    color: 0xb87333, // Copper/gold
    metalness: 0.8,
    roughness: 0.4,
  });

  // Central long truss structure
  const trussGeo = new THREE.BoxGeometry(0.1, 0.1, 7.5);
  const truss = new THREE.Mesh(trussGeo, metalMat);
  iss.add(truss);

  // Central cylindrical modules (hab/labs)
  const moduleGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.2, 12);
  const coreModule = new THREE.Mesh(moduleGeo, metalMat);
  coreModule.rotation.x = Math.PI / 2;
  iss.add(coreModule);

  const nodeGeo = new THREE.SphereGeometry(0.3, 12, 12);
  const coreNode = new THREE.Mesh(nodeGeo, metalMat);
  iss.add(coreNode);

  // Cross modules
  const crossModule = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1.6, 12), metalMat);
  crossModule.position.set(0, 0, 0.4);
  iss.add(crossModule);

  // Solar array wings at the ends of the truss
  const arrayWings = [-3.2, 3.2];
  arrayWings.forEach((zOffset) => {
    // 4 large solar panels on each side
    [-0.8, -0.3, 0.3, 0.8].forEach((xOffset) => {
      const panelGeo = new THREE.BoxGeometry(1.4, 0.02, 0.45);
      const panel = new THREE.Mesh(panelGeo, copperMat);
      panel.position.set(xOffset * 1.5, 0, zOffset);
      iss.add(panel);
    });
  });

  iss.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
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
  [-8, 8].forEach((xPos) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.02, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x0b1d33, emissive: 0x00ffc8, emissiveIntensity: 0.2, normalMap: panelNormal })
    );
    panel.position.x = xPos;
    panel.castShadow = true;
    solarGroup.add(panel);
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
