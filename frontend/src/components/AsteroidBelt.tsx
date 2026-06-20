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

  // 2. LARGE TARGETED ROCK FOR EXTRACTION
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

  // 3. ROBOTIC MAPPING PROBE (Replacing Refinery Platform & Neon Laser)
  const probeGroup = new THREE.Group();
  probeGroup.position.set(0, 2.5, -2);

  // Golden probe body
  const bodyGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xd4a030,
    metalness: 0.8,
    roughness: 0.3,
  });
  const probeBody = new THREE.Mesh(bodyGeo, bodyMat);
  probeGroup.add(probeBody);

  // Solar panels extending out
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.95 });
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x0b1d33, roughness: 0.1 });
  [-1, 1].forEach((side) => {
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8);
    const arm = new THREE.Mesh(armGeo, metalMat);
    arm.position.x = side * 0.5;
    arm.rotation.z = Math.PI / 2;
    probeGroup.add(arm);

    const solarGeo = new THREE.BoxGeometry(0.8, 0.02, 0.55);
    const solar = new THREE.Mesh(solarGeo, solarMat);
    solar.position.x = side * 1.1;
    probeGroup.add(solar);
  });

  // High gain dish antenna
  const dishGeo = new THREE.ConeGeometry(0.25, 0.15, 12, 1, true);
  const dish = new THREE.Mesh(dishGeo, bodyMat);
  dish.position.y = 0.45;
  probeGroup.add(dish);

  // Subtle scanning sensor light cone (instead of intense laser)
  const scanGeo = new THREE.ConeGeometry(0.6, 4.0, 16, 1, true);
  const scanMat = new THREE.MeshBasicMaterial({
    color: 0x00ffc8,
    transparent: true,
    opacity: 0.08, // extremely soft
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const scanCone = new THREE.Mesh(scanGeo, scanMat);
  scanCone.position.y = -2.25;
  scanCone.rotation.x = Math.PI;
  probeGroup.add(scanCone);

  group.add(probeGroup);

  // 4. CARGO TRANSPORT DRONES (Living Elements)
  const drone1 = new THREE.Group();
  const droneGeom = new THREE.BoxGeometry(0.25, 0.25, 0.4);
  const droneMat = new THREE.MeshStandardMaterial({
    color: 0x606066,
    metalness: 0.9,
  });
  const droneMesh1 = new THREE.Mesh(droneGeom, droneMat);
  drone1.add(droneMesh1);
  const coneGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
  const coneMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
  const coneMesh1 = new THREE.Mesh(coneGeom, coneMat);
  coneMesh1.position.set(0, 0, -0.22);
  coneMesh1.rotation.x = Math.PI / 2;
  drone1.add(coneMesh1);
  group.add(drone1);

  const drone2 = new THREE.Group();
  const droneMesh2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 0.35),
    droneMat
  );
  drone2.add(droneMesh2);
  const coneMesh2 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.15, 8), coneMat);
  coneMesh2.position.set(0, 0, -0.2);
  coneMesh2.rotation.x = Math.PI / 2;
  drone2.add(coneMesh2);
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

    if (prefersReducedMotion) {
      scanCone.scale.x = 1.0;
      scanCone.scale.z = 1.0;
      return;
    }

    // 2. Rotate large targeted asteroid slowly (observatory aesthetic)
    largeAstGroup.rotation.y = time * 0.01;
    largeAstGroup.rotation.z = time * 0.004;
    secondRockMesh.rotation.y = time * 0.008;

    // 3. Softly pulse mapping sensor
    scanCone.scale.x = 1.0 + Math.sin(time * 1.5) * 0.05;
    scanCone.scale.z = 1.0 + Math.cos(time * 1.5) * 0.05;

    // 4. Animate cargo drones back and forth (slowed down for observatory glide)
    const t1 = (time * 0.03) % 1.0;
    const start = new THREE.Vector3(0, 2.5, -2);
    const end = new THREE.Vector3(-10, -1, 5);
    const frac1 = Math.sin(t1 * Math.PI);
    drone1.position.lerpVectors(start, end, frac1);
    drone1.lookAt(end);

    const t2 = ((time + 2.5) * 0.04) % 1.0;
    const end2 = new THREE.Vector3(8, 2, -6);
    const frac2 = Math.sin(t2 * Math.PI);
    drone2.position.lerpVectors(start, end2, frac2);
    drone2.lookAt(end2);
  };

  return { group, update };
}
