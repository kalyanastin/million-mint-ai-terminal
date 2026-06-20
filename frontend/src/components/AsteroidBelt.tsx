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

  // 3. RESOURCE EXTRACTION PLATFORM
  const platformGroup = new THREE.Group();
  platformGroup.position.set(0, 0, -2);

  // Anchor asteroid
  const anchorGeom = new THREE.DodecahedronGeometry(2.0, 1);
  const anchorMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1f,
    roughness: 0.9,
  });
  const anchorMesh = new THREE.Mesh(anchorGeom, anchorMat);
  anchorMesh.castShadow = true;
  platformGroup.add(anchorMesh);

  // Industrial Platform Structure
  const boxGeom = new THREE.BoxGeometry(2.5, 0.4, 2.5);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x404046,
    metalness: 0.9,
    roughness: 0.3,
  });
  const boxMesh = new THREE.Mesh(boxGeom, boxMat);
  boxMesh.position.set(0, 1.4, 0);
  boxMesh.castShadow = true;
  platformGroup.add(boxMesh);

  // Truss pillars connecting down
  const pillarGeom = new THREE.CylinderGeometry(0.2, 0.2, 1.4, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    metalness: 0.95,
  });
  const pillarMesh = new THREE.Mesh(pillarGeom, pillarMat);
  pillarMesh.position.set(0, 0.7, 0);
  pillarMesh.castShadow = true;
  platformGroup.add(pillarMesh);

  // Glowing refinery stacks (vertical tubes)
  const stackGeom = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
  const stackMesh = new THREE.Mesh(stackGeom, boxMat);
  stackMesh.position.set(0.6, 2.2, 0.6);
  stackMesh.castShadow = true;
  platformGroup.add(stackMesh);

  const glowGeom = new THREE.SphereGeometry(0.1, 8, 8);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00ffc8 });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  glowMesh.position.set(0.6, 2.8, 0.6);
  platformGroup.add(glowMesh);

  // Solar panels for power
  const panelGeom = new THREE.BoxGeometry(1.8, 0.02, 1.0);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x0b1d33,
    emissive: 0x00ffc8,
    emissiveIntensity: 0.2,
  });
  const panelMesh = new THREE.Mesh(panelGeom, panelMat);
  panelMesh.position.set(-2.2, 1.4, 0);
  panelMesh.rotation.set(0.2, 0, 0);
  panelMesh.castShadow = true;
  platformGroup.add(panelMesh);

  // Glowing cyan extraction laser drill beam
  const laserGeom = new THREE.CylinderGeometry(0.12, 0.12, 11.5, 8, 1, true);
  const laserMat = new THREE.MeshBasicMaterial({
    color: 0x00ffc8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const laserMesh = new THREE.Mesh(laserGeom, laserMat);
  laserMesh.position.set(-5, -1.2, 3.5);
  laserMesh.rotation.set(0, Math.PI / 6, -Math.PI / 16);
  platformGroup.add(laserMesh);

  group.add(platformGroup);

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

  const update = (time: number, delta: number) => {
    // 1. Update instanced background asteroids
    asteroidData.forEach((ast, idx) => {
      ast.rotation.x += ast.rotSpeed.x * delta;
      ast.rotation.y += ast.rotSpeed.y * delta;
      ast.rotation.z += ast.rotSpeed.z * delta;

      const wave = Math.sin(time * 0.1 + idx) * 0.02;
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

    // 2. Rotate large targeted asteroid
    largeAstGroup.rotation.y = time * 0.05;
    largeAstGroup.rotation.z = time * 0.02;

    // 3. Flicker mining laser drill beam
    laserMesh.scale.x = 1.0 + Math.sin(time * 40) * 0.15;
    laserMesh.scale.z = 1.0 + Math.cos(time * 40) * 0.15;

    // 4. Animate cargo drones back and forth
    const t1 = (time * 0.2) % 1.0;
    const start = new THREE.Vector3(0, 0, -2);
    const end = new THREE.Vector3(-10, -1, 5);
    const frac1 = Math.sin(t1 * Math.PI);
    drone1.position.lerpVectors(start, end, frac1);
    drone1.lookAt(end);

    const t2 = ((time + 2.5) * 0.25) % 1.0;
    const end2 = new THREE.Vector3(8, 2, -6);
    const frac2 = Math.sin(t2 * Math.PI);
    drone2.position.lerpVectors(start, end2, frac2);
    drone2.lookAt(end2);
  };

  return { group, update };
}
