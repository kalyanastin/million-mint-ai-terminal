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

  astronautGroup.userData.update = (time: number) => {
    // Float zero-g drift tumbles
    innerGroup.position.y = Math.sin(time * 0.8) * 0.4;
    innerGroup.position.x = Math.cos(time * 0.5) * 0.2;
    innerGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
    innerGroup.rotation.y = time * 0.05;
  };

  return astronautGroup;
}

// ── SCOUT INTERCEPTOR JET ──
export function createScoutShip() {
  const scoutGroup = new THREE.Group();

  const lathePoints = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.08, 0.5),
    new THREE.Vector2(0.15, 1.2), // Max thickness
    new THREE.Vector2(0.12, 2.0),
    new THREE.Vector2(0.06, 2.8),
    new THREE.Vector2(0.0, 3.0),
  ];

  // Aerodynamic Wing Lathe Fuselage
  const fuselage = new THREE.Mesh(
    new THREE.LatheGeometry(lathePoints, 24),
    new THREE.MeshStandardMaterial({ color: 0x222230, roughness: 0.9, metalness: 0.1 })
  );
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  scoutGroup.add(fuselage);

  // Swept delta wing shape
  [-1, 1].forEach((side) => {
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(side * 2.2, -0.8);
    wingShape.lineTo(side * 0.8, 1.4);
    wingShape.closePath();
    const wingMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(wingShape),
      new THREE.MeshStandardMaterial({ color: 0x1a1a28, roughness: 0.85, metalness: 0.15, side: THREE.DoubleSide })
    );
    wingMesh.position.z = 0.8;
    wingMesh.castShadow = true;
    scoutGroup.add(wingMesh);
  });

  // Nacelle thrust pods
  [-0.4, 0.4].forEach((xOffset) => {
    const podGroup = new THREE.Group();
    podGroup.position.set(xOffset, -0.1, 1.8);

    const nacelle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.18, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x505060, metalness: 0.8, roughness: 0.4 })
    );
    nacelle.rotation.x = Math.PI / 2;
    nacelle.castShadow = true;
    podGroup.add(nacelle);

    // Active exhaust gas particle system
    const plume = createThrusterPlume("#00ffc8", 100, 0.4);
    plume.position.set(0, 0, 0.4);
    plume.rotation.x = Math.PI;
    podGroup.add(plume);

    scoutGroup.add(podGroup);
  });

  scoutGroup.userData.update = (time: number) => {
    scoutGroup.position.y = Math.sin(time * 2.0) * 0.2;
  };

  return scoutGroup;
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

// ── HABITAT EXPLORER CRUISER ──
export function createExplorerShip() {
  const explorer = new THREE.Group();

  const mylarFoil = createCrinkledFoilTexture();
  const panelNormal = createPanelNormalMap();

  // Command Module (truncated capsule cone)
  const cmd = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 0.9, 24),
    new THREE.MeshStandardMaterial({ color: 0xc8c8c0, roughness: 0.85, metalness: 0.1, normalMap: panelNormal })
  );
  cmd.position.y = 2.1;
  cmd.castShadow = true;
  explorer.add(cmd);

  // Service Module (gold MLI crinkle foil blanket)
  const service = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 1.8, 24),
    new THREE.MeshStandardMaterial({
      color: 0xd4a030,
      metalness: 0.7,
      roughness: 0.5,
      bumpMap: mylarFoil,
      bumpScale: 0.08,
    })
  );
  service.position.y = 0.75;
  service.castShadow = true;
  explorer.add(service);

  // Rotating Torus Habitat Ring
  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(0, 0, 0);

  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.22, 16, 64),
    new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 0.5, roughness: 0.7, normalMap: panelNormal })
  );
  torus.rotation.x = Math.PI / 2;
  torus.castShadow = true;
  wheelGroup.add(torus);

  // Support structural spokes
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.6 })
    );
    spoke.position.set(Math.cos(angle) * 0.9, 0, Math.sin(angle) * 0.9);
    spoke.rotation.set(0, -angle, Math.PI / 2);
    spoke.castShadow = true;
    wheelGroup.add(spoke);
  }
  explorer.add(wheelGroup);

  // Photovoltaic Solar Panel double-wing arrays
  [-1, 1].forEach((side) => {
    const armGroup = new THREE.Group();
    armGroup.position.set(side * 1.5, 0.9, 0);

    const support = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.3 })
    );
    support.castShadow = true;
    armGroup.add(support);

    // Silicon cell mesh
    const cells = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.02, 0.9),
      new THREE.MeshStandardMaterial({
        color: 0x1a1a3e,
        emissive: 0x0011aa,
        emissiveIntensity: 0.08,
        roughness: 0.2,
        metalness: 0.0,
        normalMap: panelNormal,
      })
    );
    cells.position.x = side * 1.1;
    cells.castShadow = true;
    armGroup.add(cells);

    explorer.add(armGroup);
  });

  // Main engine thrust nozzle bell
  const engineGroup = new THREE.Group();
  engineGroup.position.set(0, -0.6, 0);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.18, 0.6, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x604010, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide })
  );
  nozzle.castShadow = true;
  engineGroup.add(nozzle);

  // Additive exhaust jet fire
  const plume = createThrusterPlume("#88aaff", 350, 0.7);
  plume.position.set(0, -0.3, 0);
  plume.rotation.x = Math.PI;
  engineGroup.add(plume);

  explorer.add(engineGroup);

  explorer.userData.update = (time: number, delta: number) => {
    wheelGroup.rotation.z += delta * 0.3; // 1 RPM artificial gravity spin
  };

  return explorer;
}

// ── AGILE HIGH SPEED FIGHTER JET ──
export function createFighterJet(offset = 0) {
  const jet = new THREE.Group();

  // Delta Wing Fuselage
  const fuselage = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 1.2, 4),
    new THREE.MeshStandardMaterial({ color: 0x606066, metalness: 0.9, roughness: 0.2 })
  );
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  jet.add(fuselage);

  // Back wings sweep
  const wings = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.02, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x18181c, metalness: 0.8, roughness: 0.4 })
  );
  wings.position.set(0, -0.05, -0.2);
  wings.rotation.x = Math.PI / 2;
  wings.castShadow = true;
  jet.add(wings);

  // Thruster Engine exhaust bell
  const engineGroup = new THREE.Group();
  engineGroup.position.set(0, 0, -0.65);

  const bell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.07, 0.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 })
  );
  bell.rotation.x = Math.PI / 2;
  bell.castShadow = true;
  engineGroup.add(bell);

  const plume = createThrusterPlume("#00ffc8", 150, 0.3);
  plume.position.set(0, 0, -0.1);
  plume.rotation.x = Math.PI / 2;
  engineGroup.add(plume);

  jet.add(engineGroup);

  jet.userData.update = (time: number) => {
    const speed = 1.4;
    const radiusX = 14;
    const radiusY = 6;

    const angle = (time + offset) * speed;
    jet.position.x = Math.cos(angle) * radiusX + (offset * 12);
    jet.position.y = Math.sin(angle * 2.0) * radiusY;
    jet.position.z = -175 + Math.sin(angle) * 15;

    const targetRoll = -Math.sin(angle) * 0.8;
    jet.rotation.z += (targetRoll - jet.rotation.z) * 0.1;

    jet.lookAt(
      Math.cos(angle + 0.15) * radiusX + (offset * 12),
      Math.sin((angle + 0.15) * 2.0) * radiusY,
      -175 + Math.sin(angle + 0.15) * 15
    );
  };

  return jet;
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

  // Explorer Cruiser docked at the platform
  const dockedExplorer = createExplorerShip();
  dockedExplorer.position.set(7.5, 0, 0);
  dockedExplorer.rotation.z = Math.PI / 2;
  dockedExplorer.scale.set(0.45, 0.45, 0.45);
  shipyard.add(dockedExplorer);

  shipyard.userData.update = (time: number, delta: number) => {
    gravityHub.rotation.y = time * 0.08;
    
    // Update beacons strobe
    const strobe = Math.sin(time * 8.0) > 0.0;
    beaconMatRed.color.setHex(strobe ? 0xff0040 : 0x200005);
    beaconMatGreen.color.setHex(strobe ? 0x00ff40 : 0x002005);

    // Delegate updates to children
    astronaut.userData.update?.(time, delta);
    dockedExplorer.userData.update?.(time, delta);
  };

  return shipyard;
}

// ── FLEET FORMATION ORGANIZER ──
export function createSpacecraftFleet() {
  const fleetGroup = new THREE.Group();

  // 1. Large Industrial Cargo Ship
  const cargo = createCargoShip();
  fleetGroup.add(cargo);

  // 2. Escort Explorer Cruiser
  const explorer = createExplorerShip();
  explorer.position.set(-12, 4, -4);
  explorer.scale.set(0.8, 0.8, 0.8);
  explorer.rotation.x = 0.05;
  fleetGroup.add(explorer);

  // 3. Escort Scouts
  const scoutL = createScoutShip();
  scoutL.position.set(8, 3, 6);
  scoutL.scale.set(0.6, 0.6, 0.6);
  scoutL.rotation.z = -Math.PI / 6;
  fleetGroup.add(scoutL);

  const scoutR = createScoutShip();
  scoutR.position.set(-9, -3, 8);
  scoutR.scale.set(0.6, 0.6, 0.6);
  scoutR.rotation.z = Math.PI / 6;
  fleetGroup.add(scoutR);

  // 4. Active Banking Fighter Formation
  const jet1 = createFighterJet(0);
  const jet2 = createFighterJet(Math.PI * 0.6);
  const jet3 = createFighterJet(Math.PI * 1.3);
  fleetGroup.add(jet1);
  fleetGroup.add(jet2);
  fleetGroup.add(jet3);

  fleetGroup.userData.update = (time: number, delta: number) => {
    fleetGroup.position.z = -175 + Math.sin(time * 0.05) * 6;

    // Propagate updates to children
    explorer.userData.update?.(time, delta);
    scoutL.userData.update?.(time, delta);
    scoutR.userData.update?.(time, delta);
    jet1.userData.update?.(time, delta);
    jet2.userData.update?.(time, delta);
    jet3.userData.update?.(time, delta);
  };

  return fleetGroup;
}

// ── SATELLITE SYSTEM ARRAY ──
export function createSatellite() {
  const sat = new THREE.Group();
  const panelNormal = createPanelNormalMap();

  // Central probe body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x6e6e76, metalness: 0.9, roughness: 0.1, normalMap: panelNormal })
  );
  body.castShadow = true;
  sat.add(body);

  // High-gain dish antenna
  const dish = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.4, 16, 1, true),
    new THREE.MeshStandardMaterial({ color: 0xe5caa0, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide })
  );
  dish.position.y = 0.7;
  sat.add(dish);

  const feed = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.4, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  feed.position.y = 0.9;
  sat.add(feed);

  // Solar Panel Wings
  [-1.2, 1.2].forEach((xPos) => {
    const wingGroup = new THREE.Group();
    wingGroup.position.x = xPos;

    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.02, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x0b1d33, emissive: 0x00ffc8, emissiveIntensity: 0.2, roughness: 0.1 })
    );
    panel.castShadow = true;
    wingGroup.add(panel);

    const boom = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x44444c, metalness: 0.9 })
    );
    boom.position.x = -xPos * 0.3;
    boom.rotation.z = Math.PI / 2;
    boom.castShadow = true;
    wingGroup.add(boom);

    sat.add(wingGroup);
  });

  sat.userData.update = (time: number) => {
    sat.rotation.y = time * 0.05;
    sat.rotation.x = time * 0.02;
  };

  return sat;
}
