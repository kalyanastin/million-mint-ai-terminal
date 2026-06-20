"use client";

import * as THREE from "three";

export function createAsteroidBelt() {
  const group = new THREE.Group();

  // 1. BACKGROUND INSTANCED ASTEROIDS
  const count = 180;
  const geom = new THREE.DodecahedronGeometry(1.0, 1);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x222226,
    roughness: 0.9,
    metalness: 0.1,
  });
  const instancedMesh = new THREE.InstancedMesh(geom, mat, count);
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;
  group.add(instancedMesh);

  // Pre-calculate positions, rotations, scales, and individual speeds for the background asteroids
  const asteroidData: Array<{
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    rotSpeed: THREE.Vector3;
    scale: THREE.Vector3;
  }> = [];

  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 55;
    const y = (Math.random() - 0.5) * 12;
    const z = (Math.random() - 0.5) * 60; // centered in belt coordinate slab

    const scale = Math.random() * 0.7 + 0.15;
    const rotSpeedX = (Math.random() - 0.5) * 0.4;
    const rotSpeedY = (Math.random() - 0.5) * 0.4;
    const rotSpeedZ = (Math.random() - 0.5) * 0.4;

    asteroidData.push({
      position: new THREE.Vector3(x, y, z),
      rotation: new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotSpeed: new THREE.Vector3(rotSpeedX, rotSpeedY, rotSpeedZ),
      scale: new THREE.Vector3(scale, scale, scale),
    });
  }

  // 2. LARGE TARGETED ROCKS FOR EXTRACTION
  const largeAstGroup = new THREE.Group();
  largeAstGroup.position.set(-10, -1, 5);
  const largeGeom = new THREE.DodecahedronGeometry(3.2, 1);
  const largeMat = new THREE.MeshStandardMaterial({
    color: 0x2d2d32,
    roughness: 0.95,
  });
  const largeMesh = new THREE.Mesh(largeGeom, largeMat);
  largeMesh.castShadow = true;
  largeMesh.receiveShadow = true;
  largeAstGroup.add(largeMesh);
  group.add(largeAstGroup);

  // Second large rock
  const secondRockGeom = new THREE.DodecahedronGeometry(2.5, 1);
  const secondRockMat = new THREE.MeshStandardMaterial({
    color: 0x28282c,
    roughness: 0.9,
  });
  const secondRockMesh = new THREE.Mesh(secondRockGeom, secondRockMat);
  secondRockMesh.position.set(8, 2, -6);
  secondRockMesh.castShadow = true;
  secondRockMesh.receiveShadow = true;
  group.add(secondRockMesh);

  // 3. ORBITAL RESEARCH PLATFORM / DEPOT (Replacing mapping probe)
  const depotGroup = new THREE.Group();
  depotGroup.position.set(0, 3.0, -2);

  const depotMat = new THREE.MeshStandardMaterial({
    color: 0x55555d,
    metalness: 0.85,
    roughness: 0.25,
  });
  const depotCoreGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12);
  const depotCore = new THREE.Mesh(depotCoreGeo, depotMat);
  depotCore.castShadow = true;
  depotGroup.add(depotCore);

  // Upper dome structure
  const depotDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.1, metalness: 0.9 })
  );
  depotDome.position.y = 0.6;
  depotGroup.add(depotDome);

  // Warning beacon on dome
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), beaconMat);
  beacon.position.y = 1.4;
  depotGroup.add(beacon);

  // Large solar arrays (two horizontal panels)
  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), depotMat);
    arm.position.x = side * 0.8;
    arm.rotation.z = Math.PI / 2;
    depotGroup.add(arm);

    const solarPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.02, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x0b1d33, roughness: 0.2, metalness: 0.8 })
    );
    solarPanel.position.x = side * 1.5;
    solarPanel.castShadow = true;
    depotGroup.add(solarPanel);
  });

  group.add(depotGroup);

  // 4. CARGO TRANSPORT DRONES WITH ORE CANISTERS
  const drone1 = new THREE.Group();
  const droneGeom = new THREE.BoxGeometry(0.3, 0.3, 0.45);
  const droneMat = new THREE.MeshStandardMaterial({
    color: 0x77777f,
    metalness: 0.85,
    roughness: 0.3,
  });
  const droneMesh1 = new THREE.Mesh(droneGeom, droneMat);
  droneMesh1.castShadow = true;
  drone1.add(droneMesh1);

  // Glow thruster plume on back
  const coneGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
  const coneMesh1 = new THREE.Mesh(coneGeom, coneMat);
  coneMesh1.position.set(0, 0, -0.24);
  coneMesh1.rotation.x = Math.PI / 2;
  drone1.add(coneMesh1);

  // Glowing orange cylindrical ore canister
  const canisterGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8);
  const canisterMat1 = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff5500,
    emissiveIntensity: 0.8,
  });
  const canister1 = new THREE.Mesh(canisterGeom, canisterMat1);
  canister1.position.set(0, -0.2, 0); // attached under the belly
  canister1.rotation.x = Math.PI / 2;
  drone1.add(canister1);
  group.add(drone1);

  const drone2 = new THREE.Group();
  const droneMesh2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.4), droneMat);
  droneMesh2.castShadow = true;
  drone2.add(droneMesh2);

  const coneMesh2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), coneMat);
  coneMesh2.position.set(0, 0, -0.22);
  coneMesh2.rotation.x = Math.PI / 2;
  drone2.add(coneMesh2);

  const canisterMat2 = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff5500,
    emissiveIntensity: 0.8,
  });
  const canister2 = new THREE.Mesh(canisterGeom, canisterMat2);
  canister2.position.set(0, -0.16, 0);
  canister2.rotation.x = Math.PI / 2;
  drone2.add(canister2);
  group.add(drone2);

  // Animation frame loop update helper
  const tempObject = new THREE.Object3D();

  const update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
    // 1. Update instanced background asteroids
    asteroidData.forEach((ast, idx) => {
      if (!prefersReducedMotion) {
        ast.rotation.x += ast.rotSpeed.x * delta;
        ast.rotation.y += ast.rotSpeed.y * delta;
        ast.rotation.z += ast.rotSpeed.z * delta;
      }

      const wave = prefersReducedMotion ? 0 : Math.sin(time * 0.1 + idx) * 0.02;
      tempObject.position.set(
        ast.position.x,
        ast.position.y + wave,
        ast.position.z
      );
      tempObject.rotation.set(ast.rotation.x, ast.rotation.y, ast.rotation.z);
      tempObject.scale.copy(ast.scale);
      tempObject.updateMatrix();

      instancedMesh.setMatrixAt(idx, tempObject.matrix);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;

    // Pulse research platform dome beacon
    const strobe = Math.sin(time * 6.0) > 0.0;
    beaconMat.color.setHex(strobe ? 0xffbb00 : 0x221100);

    if (prefersReducedMotion) {
      return;
    }

    // 2. Rotate large targeted asteroids slowly
    largeAstGroup.rotation.y = time * 0.01;
    largeAstGroup.rotation.z = time * 0.004;
    secondRockMesh.rotation.y = time * 0.008;

    // 3. Animate cargo drones hauling ore back and forth
    // Drone 1: Depot -> Rock 1 -> Depot
    const t1 = (time * 0.05) % 1.0;
    const start = new THREE.Vector3(0, 3.0, -2);
    const end = new THREE.Vector3(-10, -1, 5);
    
    let progress1 = 0;
    let hasOre1 = false;
    let targetLook1 = new THREE.Vector3();

    if (t1 < 0.5) {
      progress1 = t1 / 0.5;
      progress1 = Math.sin(progress1 * Math.PI / 2);
      drone1.position.lerpVectors(start, end, progress1);
      targetLook1.copy(end);
      hasOre1 = false;
    } else {
      progress1 = (t1 - 0.5) / 0.5;
      progress1 = Math.sin(progress1 * Math.PI / 2);
      drone1.position.lerpVectors(end, start, progress1);
      targetLook1.copy(start);
      hasOre1 = true;
    }
    drone1.lookAt(targetLook1);
    canisterMat1.emissiveIntensity = hasOre1 ? 1.5 : 0.05;
    canisterMat1.color.setHex(hasOre1 ? 0xffaa00 : 0x222222);

    // Drone 2: Depot -> Rock 2 -> Depot
    const t2 = ((time + 2.5) * 0.065) % 1.0;
    const end2 = new THREE.Vector3(8, 2, -6);
    let progress2 = 0;
    let hasOre2 = false;
    let targetLook2 = new THREE.Vector3();

    if (t2 < 0.5) {
      progress2 = t2 / 0.5;
      progress2 = Math.sin(progress2 * Math.PI / 2);
      drone2.position.lerpVectors(start, end2, progress2);
      targetLook2.copy(end2);
      hasOre2 = false;
    } else {
      progress2 = (t2 - 0.5) / 0.5;
      progress2 = Math.sin(progress2 * Math.PI / 2);
      drone2.position.lerpVectors(end2, start, progress2);
      targetLook2.copy(start);
      hasOre2 = true;
    }
    drone2.lookAt(targetLook2);
    canisterMat2.emissiveIntensity = hasOre2 ? 1.5 : 0.05;
    canisterMat2.color.setHex(hasOre2 ? 0xffaa00 : 0x222222);
  };

  return { group, update };
}
