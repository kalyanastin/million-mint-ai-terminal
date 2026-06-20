"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { createPlanet } from "./PlanetSphere";
import { createAsteroidBelt } from "./AsteroidBelt";
import {
  createSpaceShipyard,
  createSpacecraftFleet,
  createSatellite,
  createISS,
  createHabitatRing,
  createRelaySatellite,
  createPassengerShuttle,
  createMaintenanceDrone,
  createOrbitalFerry,
  createCargoShip
} from "./SpacecraftFleet";
import { updateThrusterPlume } from "./ThrusterPlume";

interface SpaceUniverseProps {
  scrollProgress: number;
}

// ── ZERO-GRAVITY NEWTONIAN PHYSICS SIMULATOR ──
class ZeroGravityPhysics {
  bodies: Array<{
    mesh: THREE.Object3D;
    mass: number;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    force: THREE.Vector3;
    torque: THREE.Vector3;
  }> = [];
  G = 6.674e-11;           // Gravitational constant
  sceneScale = 1e-7;       // 1 Three.js unit = 10,000 km

  addBody(mesh: THREE.Object3D, mass: number, velocity = new THREE.Vector3(), angularVel = new THREE.Vector3()) {
    this.bodies.push({
      mesh,
      mass,
      velocity: velocity.clone(),
      angularVelocity: angularVel.clone(),
      force: new THREE.Vector3(),
      torque: new THREE.Vector3(),
    });
  }

  step(delta: number) {
    this.computeGravitationalForces();
    this.bodies.forEach(body => {
      // Acceleration a = F / m
      const accel = body.force.clone().divideScalar(body.mass);
      body.velocity.addScaledVector(accel, delta);
      body.mesh.position.addScaledVector(body.velocity, delta);

      // Rotate via angular momentum in zero-damping vacuum space
      const q = new THREE.Quaternion().setFromAxisAngle(
        body.angularVelocity.clone().normalize(),
        body.angularVelocity.length() * delta
      );
      body.mesh.quaternion.multiplyQuaternions(q, body.mesh.quaternion);
    });
  }

  computeGravitationalForces() {
    for (let i = 0; i < this.bodies.length; i++) {
      this.bodies[i].force.set(0, 0, 0);

      for (let j = 0; j < this.bodies.length; j++) {
        if (i === j) continue;

        const r = new THREE.Vector3().subVectors(
          this.bodies[j].mesh.position,
          this.bodies[i].mesh.position
        );
        const rMag = r.length();
        if (rMag < 0.01) continue;

        // F = G * m1 * m2 / r^2
        const forceMag = this.G * this.bodies[i].mass * this.bodies[j].mass / (rMag * rMag);
        r.normalize().multiplyScalar(forceMag * this.sceneScale);
        this.bodies[i].force.add(r);
      }
    }
  }
}

// ── HIGH-FIDELITY STARFIELD BACKGROUND SPHERE ──
function createStarfieldTexture() {
  if (typeof window === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#020205";
  ctx.fillRect(0, 0, 2048, 1024);

  // Render 6000 stars with color classes (blue-white, gold, warm white)
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = Math.random() * 1.5 + 0.6; // slightly larger to prevent minification discard

    const spectralSeed = Math.random();
    let color = "#ffffff";
    if (spectralSeed > 0.9) color = "#a0c8ff";      // Hot blue-white stars
    else if (spectralSeed > 0.82) color = "#ffeeb5"; // Golden stars
    else if (spectralSeed > 0.76) color = "#ffd2d2"; // Red dwarfs

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  
  // Disable mipmapping to prevent small stars from blurring into darkness at distance
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  
  return texture;
}

// ── GLOWING TRANSIT LANE CREATOR ──
function createGlowingRoute(points: THREE.Vector3[], color: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(80);
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  
  const material = new THREE.LineDashedMaterial({
    color: color,
    dashSize: 1.2,
    gapSize: 0.8,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  
  line.userData = {
    update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
      if (prefersReducedMotion) return;
      (material as any).dashOffset = -time * 2.2;
    }
  };

  return line;
}

export function SpaceUniverse({ scrollProgress }: SpaceUniverseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);

  // State/Ref to track prefers-reduced-motion
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotionRef.current = mediaQuery.matches;

      const listener = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDestroyed = false;
    let animationFrameId: number;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Initialize WebGLRenderer with ACES Filmic Tone Mapping and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85; // Slightly underexposed cinematic
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Initialize Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#020205");
    scene.fog = new THREE.FogExp2("#020205", 0.0035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 10, -20);

    // 3. Setup Lights
    // Sun
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 3.5);
    sunLight.position.set(200, 50, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // Ambient Space Glow
    const ambient = new THREE.AmbientLight(0x111122, 0.04);
    scene.add(ambient);

    // Earthshine
    const earthShine = new THREE.PointLight(0x3366ff, 0.3, 20);
    earthShine.position.set(0, 0, 0);
    scene.add(earthShine);

    // 4. Billboard Sun Flare Glow & Core Mesh
    const flareGroup = new THREE.Group();
    flareGroup.position.set(200, 50, 300);
    // Draw simple procedural glow sprite
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 128;
    spriteCanvas.height = 128;
    const sCtx = spriteCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, "rgba(255, 246, 224, 0.85)");
      grad.addColorStop(0.2, "rgba(255, 246, 224, 0.5)");
      grad.addColorStop(0.6, "rgba(255, 220, 180, 0.1)");
      grad.addColorStop(1, "rgba(255, 220, 180, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const flareTex = new THREE.CanvasTexture(spriteCanvas);
    const flareSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: flareTex,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    }));
    flareSprite.scale.set(50, 50, 1);
    flareGroup.add(flareSprite);

    // Glowing white Sun core mesh
    const sunGeom = new THREE.SphereGeometry(15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    flareGroup.add(sunMesh);
    scene.add(flareGroup);

    // 5. Triple-Layered Starfield Spheres (For organic depth parallax)
    const starGeo1 = new THREE.SphereGeometry(900, 32, 32);
    const starTex = createStarfieldTexture();
    const starMat1 = new THREE.MeshBasicMaterial({
      map: starTex,
      side: THREE.BackSide,
      color: new THREE.Color(0x666666),
    });
    const starField1 = new THREE.Mesh(starGeo1, starMat1);
    scene.add(starField1);

    const starGeo2 = new THREE.SphereGeometry(600, 32, 32);
    const starMat2 = new THREE.MeshBasicMaterial({
      map: starTex,
      side: THREE.BackSide,
      color: new THREE.Color(0x333333),
      transparent: true,
      opacity: 0.6,
    });
    const starField2 = new THREE.Mesh(starGeo2, starMat2);
    scene.add(starField2);

    const starGeo3 = new THREE.SphereGeometry(350, 32, 32);
    const starMat3 = new THREE.MeshBasicMaterial({
      map: starTex,
      side: THREE.BackSide,
      color: new THREE.Color(0x222222),
      transparent: true,
      opacity: 0.4,
    });
    const starField3 = new THREE.Mesh(starGeo3, starMat3);
    scene.add(starField3);

    // 6. Zero Gravity Newtonian Physics
    const physics = new ZeroGravityPhysics();

    // Drifting maintenance debris near shipyard
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);

    const debrisMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
    const debrisGeoms = [
      new THREE.DodecahedronGeometry(0.08, 1),
      new THREE.OctahedronGeometry(0.1, 0),
      new THREE.DodecahedronGeometry(0.06, 1),
    ];
    const debrisPositions = [
      new THREE.Vector3(26, 2, -133),
      new THREE.Vector3(22, -3, -137),
      new THREE.Vector3(25, 4, -138),
    ];

    debrisPositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(debrisGeoms[idx], debrisMaterial);
      mesh.position.copy(pos);
      debrisGroup.add(mesh);

      const mass = 10 + Math.random() * 90;
      const velocity = new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.2);
      const angularVel = new THREE.Vector3((Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15, (Math.random() - 0.5) * 0.15);
      physics.addBody(mesh, mass, velocity, angularVel);
    });

    // 7. Active Shooting Stars (Living Event)
    const shootingStar = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending })
    );
    scene.add(shootingStar);

    // 8. Construct narrative scene objects and stages
    // Stage 1: Earth (Hero closeup)
    const earthGroup = createPlanet("earth");
    scene.add(earthGroup);

    // Space Elevator Cable and Climbers
    const elevatorGroup = new THREE.Group();
    const cableGeom = new THREE.CylinderGeometry(0.015, 0.015, 45, 8);
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.9,
      roughness: 0.1,
      transparent: true,
      opacity: 0.6
    });
    const cable = new THREE.Mesh(cableGeom, cableMat);
    cable.position.set(0, 0, 0); // centered at Earth, going up and down
    elevatorGroup.add(cable);

    // Add climber pods at various heights
    const climberGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12);
    const climberMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      metalness: 0.9,
      roughness: 0.2
    });
    const climbers: THREE.Mesh[] = [];
    const heights = [-15, -5, 5, 15];
    heights.forEach((h) => {
      const climber = new THREE.Mesh(climberGeom, climberMat);
      climber.position.set(0, h, 0);
      elevatorGroup.add(climber);
      climbers.push(climber);
    });

    scene.add(elevatorGroup);

    // Animating the climbers up and down the cable
    elevatorGroup.userData = {
      update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
        if (prefersReducedMotion) return;
        climbers.forEach((climber, idx) => {
          const speed = 0.05 + idx * 0.01;
          let newY = climber.position.y + speed * delta * ((idx % 2 === 0) ? 1 : -1);
          if (newY > 22) newY = -22;
          if (newY < -22) newY = 22;
          climber.position.y = newY;
        });
      }
    };

    // Hubble Space Telescope
    const satellite = createSatellite();
    satellite.position.set(12, 1, 0);
    satellite.scale.set(0.5, 0.5, 0.5);
    scene.add(satellite);

    // ISS (International Space Station) floating near Earth
    const iss = createISS();
    iss.position.set(-6, 2, -5);
    iss.scale.set(0.6, 0.6, 0.6);
    scene.add(iss);

    // Stage 2: Moon & Orbital Research Network
    const moonGroup = createPlanet("moon");
    moonGroup.position.set(12, 5, -22);
    scene.add(moonGroup);

    const researchGroup = new THREE.Group();
    researchGroup.position.set(15, 3, -25);
    
    // Core lab module
    const labCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
    );
    labCore.rotation.x = Math.PI / 2;
    researchGroup.add(labCore);

    // Large research solar wings
    const solarWingMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, metalness: 0.8 });
    [-1.2, 1.2].forEach((side) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.02, 0.8),
        solarWingMat
      );
      panel.position.set(side, 0, 0);
      researchGroup.add(panel);
    });

    // Flashing research signal light
    const researchBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffc8 })
    );
    researchBeacon.position.set(0, 0.8, 0);
    researchGroup.add(researchBeacon);

    researchGroup.userData = {
      update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
        const pulse = Math.sin(time * 6.0) > 0.0;
        (researchBeacon.material as THREE.MeshBasicMaterial).color.setHex(pulse ? 0x00ffc8 : 0x002211);
        if (prefersReducedMotion) return;
        researchGroup.rotation.y = time * 0.05;
      }
    };
    scene.add(researchGroup);

    // Additional telescope in the array
    const hubble2 = createSatellite();
    hubble2.position.set(9, 4, -26);
    hubble2.scale.set(0.45, 0.45, 0.45);
    scene.add(hubble2);

    // Stage 3: Resource Extraction Zone (Asteroid Belt & Mining)
    const { group: asteroidBelt, update: updateBelt } = createAsteroidBelt();
    asteroidBelt.position.set(0, 0, -90);
    scene.add(asteroidBelt);

    // Mining Laser Beams
    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00ffc8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const laserPoints1 = [
      new THREE.Vector3(0, 3.0 + 0.1, -92), // depot relative
      new THREE.Vector3(-10, -1, -85)      // rock 1 relative
    ];
    const laserGeom1 = new THREE.BufferGeometry().setFromPoints(laserPoints1);
    const laser1 = new THREE.Line(laserGeom1, laserMat);
    scene.add(laser1);

    const laserPoints2 = [
      new THREE.Vector3(0, 3.0 + 0.1, -92),
      new THREE.Vector3(8, 2, -96)
    ];
    const laserGeom2 = new THREE.BufferGeometry().setFromPoints(laserPoints2);
    const laser2 = new THREE.Line(laserGeom2, laserMat);
    scene.add(laser2);

    laser1.userData = {
      update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
        if (prefersReducedMotion) {
          laser1.visible = true;
          laser2.visible = true;
          return;
        }
        laser1.visible = Math.sin(time * 25.0) > -0.2;
        laser2.visible = Math.cos(time * 18.0) > -0.3;
      }
    };

    // Stage 4: MMINT Trade Hub (Space Shipyard)
    const shipyard = createSpaceShipyard();
    shipyard.position.set(24, 0, -135);
    shipyard.rotation.y = -Math.PI / 6;
    scene.add(shipyard);

    // Stage 5: MMINT Orbital Gateway (Habitat Ring scaled up at [0, 0, -175])
    const habitatRing = createHabitatRing();
    habitatRing.scale.setScalar(2.2);
    habitatRing.position.set(0, 0, -175);
    scene.add(habitatRing);

    habitatRing.userData = {
      update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
        habitatRing.children.forEach(c => {
          if (c.userData.update) c.userData.update(time, delta, prefersReducedMotion);
        });
        if (prefersReducedMotion) return;
        habitatRing.rotation.y = time * 0.035;
      }
    };

    // Stage 6: Genesis Planet relocated to [18, 0, -220]
    const genesisGroup = createPlanet("genesis");
    genesisGroup.position.set(18, 0, -220);
    scene.add(genesisGroup);

    // Stage 7: MMINT Creator Fleet
    const fleet = createSpacecraftFleet();
    fleet.position.set(0, 0, -250);
    scene.add(fleet);

    // ── MMINT COMMUNICATION NETWORK (32 Relay Satellites Orbiting Earth) ──
    const relaySatellites: THREE.Group[] = [];
    const numPlanes = 4;
    const satsPerPlane = 8;
    const orbitRadius = 13.8;
    const relayGroup = new THREE.Group();
    scene.add(relayGroup);

    for (let plane = 0; plane < numPlanes; plane++) {
      const inclination = (plane / numPlanes) * Math.PI + 0.35;
      const planeRotY = (plane / numPlanes) * Math.PI * 2;

      for (let sat = 0; sat < satsPerPlane; sat++) {
        const satObj = createRelaySatellite();
        satObj.scale.setScalar(0.25);
        relaySatellites.push(satObj);
        relayGroup.add(satObj);

        satObj.userData = {
          phase: (sat / satsPerPlane) * Math.PI * 2,
          update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
            const speed = prefersReducedMotion ? 0.03 : 0.10;
            const currentPhase = satObj.userData.phase + time * speed;
            
            const x = Math.cos(currentPhase) * orbitRadius;
            const z = Math.sin(currentPhase) * orbitRadius;
            
            const pos = new THREE.Vector3(x, 0, z);
            pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
            pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), planeRotY);
            
            satObj.position.copy(pos);
            satObj.lookAt(0, 0, 0); // Point transponder dish towards Earth
            
            // Beacon pulsing update
            satObj.children.forEach(c => {
              if (c.userData.update) {
                c.userData.update(time, delta, prefersReducedMotion);
              }
            });
          }
        };
      }
    }

    // ── GLOWING TRANSIT LANES (Communication/Cargo Corridors) ──
    const routes = [
      createGlowingRoute([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(6, 2, -10),
        new THREE.Vector3(15, 3, -25)
      ], 0x3388ff), // Earth to Research Network (blue)

      createGlowingRoute([
        new THREE.Vector3(15, 3, -25),
        new THREE.Vector3(8, 3, -60),
        new THREE.Vector3(0, 3, -92)
      ], 0x00ffcc), // Research Network to Asteroid Depot (teal)

      createGlowingRoute([
        new THREE.Vector3(0, 3, -92),
        new THREE.Vector3(12, 1, -115),
        new THREE.Vector3(24, 0, -135)
      ], 0xffaa00), // Asteroid Depot to Trade Hub (orange)

      createGlowingRoute([
        new THREE.Vector3(24, 0, -135),
        new THREE.Vector3(12, 0, -155),
        new THREE.Vector3(0, 0, -175)
      ], 0x00ffcc), // Trade Hub to Orbital Gateway (teal)

      createGlowingRoute([
        new THREE.Vector3(0, 0, -175),
        new THREE.Vector3(9, 0, -195),
        new THREE.Vector3(18, 0, -220)
      ], 0xffaa00) // Orbital Gateway to Genesis (orange)
    ];
    routes.forEach(route => scene.add(route));

    // ── CIVILIAN TRAFFIC FLEET ──
    interface TrafficShip {
      mesh: THREE.Group;
      curve: THREE.CatmullRomCurve3;
      progress: number;
      speed: number;
      direction: number;
    }
    const trafficShips: TrafficShip[] = [];

    const spawnTrafficShip = (points: THREE.Vector3[], modelCreator: () => THREE.Group, speed: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const mesh = modelCreator();
      mesh.scale.setScalar(0.35);
      scene.add(mesh);

      trafficShips.push({
        mesh,
        curve,
        progress: Math.random(),
        speed: speed * (0.8 + Math.random() * 0.4),
        direction: Math.random() > 0.5 ? 1 : -1
      });
    };

    // Spawn various civilian ferries, shuttles, drones, and cargo vessels
    spawnTrafficShip([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2, 1, -2),
      new THREE.Vector3(-6, 2, -5)
    ], createPassengerShuttle, 0.05);

    spawnTrafficShip([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2, 1, -2),
      new THREE.Vector3(-6, 2, -5)
    ], createMaintenanceDrone, 0.08);

    spawnTrafficShip([
      new THREE.Vector3(15, 3, -25),
      new THREE.Vector3(8, 3, -60),
      new THREE.Vector3(0, 3, -92)
    ], createOrbitalFerry, 0.025);

    spawnTrafficShip([
      new THREE.Vector3(0, 3, -92),
      new THREE.Vector3(12, 1, -115),
      new THREE.Vector3(24, 0, -135)
    ], createCargoShip, 0.018);

    spawnTrafficShip([
      new THREE.Vector3(24, 0, -135),
      new THREE.Vector3(12, 0, -155),
      new THREE.Vector3(0, 0, -175)
    ], createCargoShip, 0.02);

    spawnTrafficShip([
      new THREE.Vector3(0, 0, -175),
      new THREE.Vector3(9, 0, -195),
      new THREE.Vector3(18, 0, -220)
    ], createPassengerShuttle, 0.035);

    // Stage 8: Jupiter
    const jupiterGroup = createPlanet("jupiter");
    jupiterGroup.position.set(55, 30, -150);
    scene.add(jupiterGroup);

    // Stage 9: Saturn & Cassini rings
    const saturnGroup = createPlanet("saturn");
    saturnGroup.position.set(-15, 10, -225);
    scene.add(saturnGroup);

    // Stage 10: Neptune
    const neptuneGroup = createPlanet("neptune");
    neptuneGroup.position.set(-40, 20, -190);
    scene.add(neptuneGroup);

    // 9. Camera spring-dynamics paths (All aligned to keep Earth visible, with route-specific centerpieces)
    const pathPoints = [
      { pos: [0, 8, -20], target: [0, 0, 0] },           // 0: Hero (Behind Earth closeup)
      { pos: [-8, 3, -12], target: [-6, 2, -5] },        // 1: Section 01 (Earth Orbit / ISS)
      { pos: [12, 6, -18], target: [15, 3, -25] },       // 2: Section 02 (Research Network near Moon)
      { pos: [2, 4, -80], target: [0, 0, -90] },         // 3: Section 03 (Resource Extraction / Asteroids)
      { pos: [20, 2, -125], target: [24, 0, -135] },     // 4: Section 04 (MMINT Trade Hub / Shipyard)
      { pos: [0, 4, -165], target: [0, 0, -175] },       // 5: Section 05 (MMINT Orbital Gateway)
      { pos: [14, 6, -210], target: [18, 0, -220] },     // 6: Section 06 (Genesis Planet Closeup)
      { pos: [-25, 12, -120], target: [0, 0, -120] },    // 7: Section 07 (Future Civilizations Panoramic Overview)
      { pos: [0, 25, -35], target: [0, 0, 0] }           // 8: Final/Founder (Lookback)
    ];

    const currentPos = new THREE.Vector3(0, 10, -20);
    const currentLook = new THREE.Vector3(0, 0, 0);

    // Interactive mouse parallax variables
    const mouse = { x: 0, y: 0 };
    const currentMouseOffset = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle viewport changes
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Camera update function using scroll interpolation & spring-damper easing
    const updateCamera = (time: number, delta: number, prefersReducedMotion?: boolean) => {
      const maxIdx = pathPoints.length - 1;
      const progress = Math.min(Math.max(scrollRef.current, 0), maxIdx);
      const idx = Math.floor(progress);
      const frac = progress - idx;

      const currentPoint = pathPoints[idx];
      const nextPoint = pathPoints[Math.min(idx + 1, maxIdx)];

      const targetPos = new THREE.Vector3()
        .fromArray(currentPoint.pos)
        .lerp(new THREE.Vector3().fromArray(nextPoint.pos), frac);

      const targetLook = new THREE.Vector3()
        .fromArray(currentPoint.target)
        .lerp(new THREE.Vector3().fromArray(nextPoint.target), frac);

      // 30-second camera drift cycle: 12 seconds of active drift, 18 seconds of absolute stabilization pause
      const cycleTime = time % 30;
      let driftX = 0;
      let driftY = 0;
      let driftZ = 0;

      if (!prefersReducedMotion && cycleTime < 12) {
        // Smooth sine envelope for the 12-second drift window to prevent jerky transitions
        const envelope = Math.sin((cycleTime / 12) * Math.PI);
        // Zero-G double-cosine oscillators for slow cinematic drift
        driftX = Math.sin(time * 0.5) * 0.12 * envelope;
        driftY = Math.cos(time * 0.3) * 0.08 * envelope;
        driftZ = Math.sin(time * 0.4) * 0.06 * envelope;
      }

      // Apply zero-G spring offsets based on mouse coordinates
      if (prefersReducedMotion) {
        currentMouseOffset.x = 0;
        currentMouseOffset.y = 0;
      } else {
        currentMouseOffset.x += (mouse.x * 2.8 - currentMouseOffset.x) * 0.05;
        currentMouseOffset.y += (-mouse.y * 2.8 - currentMouseOffset.y) * 0.05;
      }

      // Spring lerp (4% position spring, 6% rotation spring)
      currentPos.lerp(targetPos, 0.04);
      currentLook.lerp(targetLook, 0.06);

      camera.position.copy(currentPos);
      if (!prefersReducedMotion) {
        camera.position.x += currentMouseOffset.x + driftX;
        camera.position.y += currentMouseOffset.y + driftY;
        camera.position.z += driftZ;

        // Proximity camera vibration from ship drives / orbital docks
        const distToShipyard = camera.position.distanceTo(new THREE.Vector3(24, 0, -135));
        const distToFleet = camera.position.distanceTo(new THREE.Vector3(0, 0, -175));
        const closestDist = Math.min(distToShipyard, distToFleet);

        if (closestDist < 25) {
          const shakeIntensity = (25 - closestDist) * 0.008;
          camera.position.x += (Math.random() - 0.5) * shakeIntensity;
          camera.position.y += (Math.random() - 0.5) * shakeIntensity;
          camera.position.z += (Math.random() - 0.5) * shakeIntensity;
        }
      }

      camera.lookAt(currentLook);
    };

    // 10. Frame render loop
    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (isDestroyed) return;

      const prefersReducedMotion = prefersReducedMotionRef.current;
      const time = timestamp * 0.001;
      const delta = Math.min(0.1, time - lastTime); // clamp frame spikes
      lastTime = time;

      // Physics stepping
      physics.step(prefersReducedMotion ? 0 : delta);

      // Living events (shooting stars crossing the galaxy)
      if (prefersReducedMotion) {
        shootingStar.position.set(999, 999, 999);
      } else {
        const starCycle = (time * 0.55) % 9.0;
        if (starCycle < 1.4) {
          const t = starCycle / 1.4;
          shootingStar.position.set(-90 + t * 180, 45 - t * 55, -80 - t * 90);
          shootingStar.scale.setScalar(1.3 - t);
        } else {
          shootingStar.position.set(999, 999, 999);
        }
      }

      // Rotate flare group towards camera
      flareGroup.lookAt(camera.position);

      // Rotate background stars slowly (triple-layered parallax) at prime-factored rates to eliminate repeats
      if (!prefersReducedMotion) {
        starField1.rotation.y = time * 0.0001;
        starField2.rotation.x = time * 0.00017;
        starField2.rotation.y = time * 0.00023;
        starField3.rotation.z = time * 0.00031;
        starField3.rotation.y = time * 0.00013;
      }

      // Scene traversals for elements containing animations and thruster plumes
      scene.traverse((child) => {
        // Run specific element update hooks (warning lights, rotating drums, ships trajectories)
        if (child.userData.update) {
          child.userData.update(time, delta, prefersReducedMotion);
        }
        // Run scroll-based interactive blueprint/docking animations
        if (child.userData.updateScroll) {
          child.userData.updateScroll(scrollRef.current);
        }
        // Run particle plume expansion physics
        if (child instanceof THREE.Points && child.userData.velocities) {
          updateThrusterPlume(child, delta, prefersReducedMotion);
        }
      });

      // Update civilian traffic along corridors
      trafficShips.forEach(ship => {
        const step = delta * ship.speed;
        ship.progress += step * ship.direction;

        if (ship.progress > 1.0) {
          ship.progress = 1.0;
          ship.direction = -1; // turnaround
        } else if (ship.progress < 0.0) {
          ship.progress = 0.0;
          ship.direction = 1; // turnaround
        }

        // Calculate position and tangent orientation
        const pos = ship.curve.getPointAt(ship.progress);
        ship.mesh.position.copy(pos);

        const tangent = ship.curve.getTangentAt(ship.progress).normalize();
        if (ship.direction < 0) tangent.multiplyScalar(-1);
        
        const lookTarget = pos.clone().add(tangent);
        ship.mesh.lookAt(lookTarget);

        // Run nested updates (for engine exhaust, plumes, warning lights)
        ship.mesh.children.forEach(c => {
          if (c.userData.update) {
            c.userData.update(time, delta, prefersReducedMotion);
          }
        });
      });

      // Update Asteroid Belt custom operations (laser flickering, instanced orbits)
      updateBelt(time, delta, prefersReducedMotion);

      // Apply spring dynamics to camera coords
      updateCamera(time, delta, prefersReducedMotion);

      // Render frame
      renderer.render(scene, camera);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Cleanups and dispose memory on unmount
    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Deallocate graphics memory
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} id="canvas-container" />;
}
