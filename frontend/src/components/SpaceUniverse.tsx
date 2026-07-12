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
import { cosAudio } from "../utils/AudioEngine";
import { DESIGN_TOKENS } from "../utils/DesignTokens";

interface SpaceUniverseProps {
  scrollProgress: number;
  explorerMode: boolean;
  activeLayer: string;
  onAssetHover?: (asset: any | null) => void;
  onAssetClick?: (asset: any) => void;
  onTimelineUpdate?: (year: number) => void;
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
function createGlowingRoute(points: THREE.Vector3[], color: number, routeType: string) {
  const curve = new THREE.CatmullRomCurve3(points);
  const pathPoints = curve.getPoints(70);
  const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);

  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.8,
    gapSize: 0.6,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.name = "glowing-route";
  
  line.userData = {
    routeType,
    defaultColor: color,
    update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
      if (prefersReducedMotion) return;
      (material as any).dashOffset = -time * 2.2;
    }
  };

  return line;
}

export function SpaceUniverse({
  scrollProgress,
  explorerMode,
  activeLayer,
  onAssetHover,
  onAssetClick,
  onTimelineUpdate
}: SpaceUniverseProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);
  const explorerModeRef = useRef(explorerMode);
  const activeLayerRef = useRef(activeLayer);

  const orbitThetaRef = useRef(0);
  const orbitPhiRef = useRef(Math.PI / 4);
  const targetThetaRef = useRef(0);
  const targetPhiRef = useRef(Math.PI / 4);
  const bankRollRef = useRef(0);

  // State/Ref to track prefers-reduced-motion
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    explorerModeRef.current = explorerMode;
  }, [explorerMode]);

  useEffect(() => {
    activeLayerRef.current = activeLayer;
  }, [activeLayer]);

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

    // Browser policy unlock for Web Audio API
    const unlockAudio = () => {
      cosAudio.init();
      cosAudio.startSpaceAmbience();
      cosAudio.startReactorHum();
      window.removeEventListener("mousedown", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      window.removeEventListener("mousemove", unlockAudio);
    };
    window.addEventListener("mousedown", unlockAudio, { passive: true });
    window.addEventListener("scroll", unlockAudio, { passive: true });
    window.addEventListener("mousemove", unlockAudio, { passive: true });

    // 1. Initialize WebGLRenderer with ACES Filmic Tone Mapping and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = DESIGN_TOKENS.camera.exposure; // Physically calibrated cinematic exposure
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Initialize Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(DESIGN_TOKENS.colors.bgSpace);
    scene.fog = new THREE.FogExp2(DESIGN_TOKENS.hex.bgSpace, 0.0035);

    const camera = new THREE.PerspectiveCamera(DESIGN_TOKENS.camera.fov, width / height, DESIGN_TOKENS.camera.near, DESIGN_TOKENS.camera.far);
    camera.position.set(0, 120, -320); // start distant for arrival sequence

    // 3. Setup Lights
    const sunLight = new THREE.DirectionalLight(DESIGN_TOKENS.lighting.sunColor, DESIGN_TOKENS.lighting.sunIntensity);
    sunLight.position.set(200, 50, 300);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(DESIGN_TOKENS.lighting.ambientColor, DESIGN_TOKENS.lighting.ambientIntensity);
    scene.add(ambient);

    const earthShine = new THREE.PointLight(DESIGN_TOKENS.lighting.earthShineColor, DESIGN_TOKENS.lighting.earthShineIntensity, 20);
    earthShine.position.set(0, 0, 0);
    scene.add(earthShine);

    // 4. Billboard Sun Flare Glow & Core Mesh
    const flareGroup = new THREE.Group();
    flareGroup.position.set(200, 50, 300);
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

    const sunGeom = new THREE.SphereGeometry(15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    flareGroup.add(sunMesh);
    scene.add(flareGroup);

    // 5. Procedural Nebula Background Shader & Starfield Spheres
    const nebulaGeo = new THREE.SphereGeometry(950, 32, 32);
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vNormal;

        float noise(vec2 p) {
          return sin(p.x * 1.8 + time * 0.015) * cos(p.y * 1.6 - time * 0.012) * 0.5 + 0.5;
        }

        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          vec2 p = vUv * 6.0;
          float n = fbm(p + vec2(time * 0.008, time * 0.004));
          
          vec3 baseSpace = vec3(0.003, 0.003, 0.008);
          vec3 gasCyan = vec3(0.0, 0.22, 0.2);
          vec3 gasGold = vec3(0.3, 0.16, 0.02);

          vec3 gasMixed = mix(gasCyan * n, gasGold * (1.0 - n), sin(n * 3.1415) * 0.5 + 0.5);
          vec3 finalColor = baseSpace + gasMixed * 0.55;

          float radial = dot(vNormal, vec3(0.0, 0.0, 1.0));
          finalColor += vec3(0.0, 0.03, 0.06) * (1.0 - radial);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.BackSide,
      transparent: false,
      depthWrite: false
    });
    const nebulaSphere = new THREE.Mesh(nebulaGeo, nebulaMat);
    scene.add(nebulaSphere);

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

    // 6. Ambient drifting space dust particles (twinkling star dust field)
    const dustCount = 180;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 320;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 140;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 450;
    }
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: DESIGN_TOKENS.colors.cyan,
      size: 0.12,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const dustPoints = new THREE.Points(dustGeom, dustMat);
    scene.add(dustPoints);

    // 7. Zero Gravity Newtonian Physics
    const physics = new ZeroGravityPhysics();

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
    earthGroup.userData = {
      interactive: true,
      id: "earth",
      name: "Earth - Mother World",
      type: "planet",
      faction: "Earth Federation",
      powerDraw: 1250.0,
      population: 8200000000,
      dockedShips: 2450,
      materials: ["Oxygen", "Nitrogen", "Water"],
      telemetry: {
        climateIndex: "Nominal",
        gridCapacity: "100%",
        elevatorsActive: "1"
      }
    };
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
    cable.position.set(0, 0, 0);
    elevatorGroup.add(cable);

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

    elevatorGroup.userData = {
      interactive: true,
      id: "space-elevator",
      name: "Sol-1 Space Elevator",
      type: "elevator",
      faction: "Earth Federation",
      powerDraw: 8.4,
      population: 180,
      dockedShips: 4,
      materials: ["Carbon Nanotubes", "Graphene"],
      telemetry: {
        tensionIntegrity: "99.8%",
        climberSpeed: "180 km/h",
        activeClimbers: "4"
      },
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
    scene.add(elevatorGroup);

    // Hubble Space Telescope
    const satellite = createSatellite();
    satellite.position.set(12, 1, 0);
    satellite.scale.set(0.5, 0.5, 0.5);
    satellite.userData = {
      interactive: true,
      id: "hubble-satellite",
      name: "Hubble Sentinel Probe",
      type: "satellite",
      faction: "Orbital Research Alliance",
      powerDraw: 0.02,
      population: 0,
      dockedShips: 0,
      materials: ["Polymers", "Optics Gold"],
      telemetry: {
        signalStrength: "96.4%",
        apertureMode: "Deep Scan",
        dataLink: "Stable"
      }
    };
    scene.add(satellite);

    // ISS (International Space Station) floating near Earth
    const iss = createISS();
    iss.position.set(-6, 2, -5);
    iss.scale.set(0.6, 0.6, 0.6);
    iss.userData = {
      interactive: true,
      id: "iss",
      name: "International Space Station",
      type: "station",
      faction: "Earth Federation",
      powerDraw: 0.12,
      population: 7,
      dockedShips: 1,
      materials: ["Aluminum Alloy", "Silicon Plates"],
      telemetry: {
        orbitVelocity: "7.66 km/s",
        altitude: "418 km",
        atmosphericDrag: "Nominal"
      }
    };
    scene.add(iss);

    // Stage 2: Moon & Orbital Research Network
    const moonGroup = createPlanet("moon");
    moonGroup.position.set(12, 5, -22);
    moonGroup.userData = {
      interactive: true,
      id: "moon",
      name: "The Moon",
      type: "planet",
      faction: "Earth Federation",
      powerDraw: 0.8,
      population: 2800,
      dockedShips: 15,
      materials: ["Regolith", "Titanium", "Helium-3"],
      telemetry: {
        outpostStatus: "Nominal",
        gravityIndex: "0.166g",
        miningOutput: "240 t/day"
      }
    };
    scene.add(moonGroup);

    const researchGroup = new THREE.Group();
    researchGroup.position.set(15, 3, -25);
    
    const labCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 2.5, 12),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
    );
    labCore.rotation.x = Math.PI / 2;
    researchGroup.add(labCore);

    const solarWingMat = new THREE.MeshStandardMaterial({ color: 0x0055ff, metalness: 0.8 });
    [-1.2, 1.2].forEach((side) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.02, 0.8),
        solarWingMat
      );
      panel.position.set(side, 0, 0);
      researchGroup.add(panel);
    });

    const researchBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffc8 })
    );
    researchBeacon.position.set(0, 0.8, 0);
    researchGroup.add(researchBeacon);

    researchGroup.userData = {
      interactive: true,
      id: "research-station",
      name: "Aegis Research Campus",
      type: "station",
      faction: "Orbital Research Alliance",
      powerDraw: 14.2,
      population: 1200,
      dockedShips: 3,
      materials: ["Superconductors", "Xenon Gas"],
      telemetry: {
        fusionTemperature: "142 MK",
        quantumNodes: "1,024 active",
        spectralTelemetry: "Optimal"
      },
      update: (time: number, delta: number, prefersReducedMotion?: boolean) => {
        const pulse = Math.sin(time * 6.0) > 0.0;
        (researchBeacon.material as THREE.MeshBasicMaterial).color.setHex(pulse ? 0x00ffc8 : 0x002211);
        if (prefersReducedMotion) return;
        researchGroup.rotation.y = time * 0.05;
      }
    };
    scene.add(researchGroup);

    const hubble2 = createSatellite();
    hubble2.position.set(9, 4, -26);
    hubble2.scale.set(0.45, 0.45, 0.45);
    hubble2.userData = {
      interactive: true,
      id: "sentinel-telescope",
      name: "Deep Space Observation Array",
      type: "satellite",
      faction: "Orbital Research Alliance",
      powerDraw: 0.05,
      population: 0,
      dockedShips: 0,
      materials: ["Beryllium Mirrors", "Graphite Core"],
      telemetry: {
        spectralFocus: "Infrared",
        sensorBuffer: "100%",
        dataDownlink: "99.2%"
      }
    };
    scene.add(hubble2);

    // Stage 3: Resource Extraction Zone (Asteroid Belt & Mining)
    const { group: asteroidBelt, update: updateBelt } = createAsteroidBelt();
    asteroidBelt.position.set(0, 0, -90);
    scene.add(asteroidBelt);

    // Tag the depot and large asteroids inside asteroidBelt
    const depot = asteroidBelt.children.find(c => c.position.y === 3.0);
    if (depot) {
      depot.userData = {
        interactive: true,
        id: "mining-depot",
        name: "Helios Refinement Depot",
        type: "station",
        faction: "Helios Mining Consortium",
        powerDraw: 22.1,
        population: 340,
        dockedShips: 2,
        materials: ["Platinum", "Titanium", "Helium-3"],
        telemetry: {
          refinementRate: "1,420 kg/s",
          laserIntegrity: "98.2%",
          activeDrones: "2"
        }
      };
    }

    const largeAst1 = asteroidBelt.children.find(c => c.position.x === -10 || c.scale?.x > 2);
    if (largeAst1) {
      largeAst1.userData = {
        interactive: true,
        id: "asteroid-alpha",
        name: "Asteroid Vesta Alpha-433",
        type: "satellite",
        faction: "Helios Mining Consortium",
        powerDraw: 0,
        population: 0,
        dockedShips: 0,
        materials: ["Helium-3", "Platinum Ore", "Silicates"],
        telemetry: {
          yieldConfidence: "98.9%",
          thermalGradient: "45 K",
          densityIndex: "7.8 g/cm³"
        }
      };
    }

    const laserMat = new THREE.LineBasicMaterial({
      color: 0x00ffc8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    const laserPoints1 = [
      new THREE.Vector3(0, 3.0 + 0.1, -92),
      new THREE.Vector3(-10, -1, -85)
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
    shipyard.userData = {
      interactive: true,
      id: "orbital-shipyard",
      name: "Genesis Orbital Shipyard",
      type: "station",
      faction: "MMINT Commerce Network",
      powerDraw: 48.5,
      population: 31420,
      dockedShips: 183,
      materials: ["Titanium Plates", "Carbon Composites", "Helium-3"],
      telemetry: {
        constructionQueue: "14 ships",
        manufacturingOutput: "2.8 Mt/day",
        aiSupervisors: "42"
      }
    };
    scene.add(shipyard);

    // Stage 5: MMINT Orbital Gateway (Habitat Ring scaled up at [0, 0, -175])
    const habitatRing = createHabitatRing();
    habitatRing.scale.setScalar(2.2);
    habitatRing.position.set(0, 0, -175);
    habitatRing.userData = {
      interactive: true,
      id: "habitat-ring",
      name: "Vanguard Habitat Ring",
      type: "station",
      faction: "MMINT Commerce Network",
      powerDraw: 76.2,
      population: 42000,
      dockedShips: 24,
      materials: ["Water Ice", "Silicon Dioxide", "Deuterium"],
      telemetry: {
        lifeSupportStatus: "100%",
        warpCharge: "98.5%",
        artificialGravity: "0.85g"
      }
    };
    scene.add(habitatRing);

    habitatRing.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
      habitatRing.children.forEach(c => {
        if (c.userData.update) c.userData.update(time, delta, prefersReducedMotion);
      });
      if (prefersReducedMotion) return;
      habitatRing.rotation.y = time * 0.035;
    };

    // Stage 6: Genesis Planet relocated to [18, 0, -220]
    const genesisGroup = createPlanet("genesis");
    genesisGroup.position.set(18, 0, -220);
    genesisGroup.userData = {
      interactive: true,
      id: "genesis-planet",
      name: "Genesis Prime",
      type: "planet",
      faction: "Genesis Colony",
      powerDraw: 215.0,
      population: 1250000,
      dockedShips: 94,
      materials: ["Oxygen", "Nitrogen", "Water", "Silicates"],
      telemetry: {
        terraformStage: "Stage 4 (Vegetation)",
        shieldIntegrity: "100%",
        logisticsEfficiency: "100%"
      }
    };
    scene.add(genesisGroup);

    // Stage 7: MMINT Creator Fleet
    const fleet = createSpacecraftFleet();
    fleet.position.set(0, 0, -250);
    fleet.userData = {
      interactive: true,
      id: "creator-fleet",
      name: "Explorer Flagship Fleet",
      type: "ship",
      faction: "MMINT Commerce Network",
      powerDraw: 12.0,
      population: 850,
      dockedShips: 0,
      materials: ["Antimatter Cells", "Titanium Alloy"],
      telemetry: {
        propulsionSystem: "Antimatter Drive",
        shieldEnergy: "100%",
        destination: "Deep Space Alpha"
      }
    };
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
        satObj.userData = {
          interactive: true,
          id: `relay-sat-${plane}-${sat}`,
          name: `Relay Node ${plane * 8 + sat}`,
          type: "satellite",
          faction: "MMINT Commerce Network",
          powerDraw: 0.08,
          population: 0,
          dockedShips: 0,
          materials: ["Solar Transponders", "Alloys"],
          telemetry: {
            uplinkChannel: `SEC-COM-${plane}-${sat}`,
            pingRate: "12ms",
            dataThroughput: "4.8 Gbps"
          }
        };
        relaySatellites.push(satObj);
        relayGroup.add(satObj);

        satObj.userData.phase = (sat / satsPerPlane) * Math.PI * 2;
        satObj.userData.update = (time: number, delta: number, prefersReducedMotion?: boolean) => {
          const speed = prefersReducedMotion ? 0.03 : 0.10;
          const currentPhase = satObj.userData.phase + time * speed;
          
          const x = Math.cos(currentPhase) * orbitRadius;
          const z = Math.sin(currentPhase) * orbitRadius;
          
          const pos = new THREE.Vector3(x, 0, z);
          pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), inclination);
          pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), planeRotY);
          
          satObj.position.copy(pos);
          satObj.lookAt(0, 0, 0);
          
          satObj.children.forEach(c => {
            if (c.userData.update) {
              c.userData.update(time, delta, prefersReducedMotion);
            }
          });
        };
      }
    }

    // ── GLOWING TRANSIT LANES (Communication/Cargo Corridors) ──
    const routes = [
      createGlowingRoute([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(6, 2, -10),
        new THREE.Vector3(15, 3, -25)
      ], 0x3388ff, "research"),

      createGlowingRoute([
        new THREE.Vector3(15, 3, -25),
        new THREE.Vector3(8, 3, -60),
        new THREE.Vector3(0, 3, -92)
      ], 0x00ffcc, "mining"),

      createGlowingRoute([
        new THREE.Vector3(0, 3, -92),
        new THREE.Vector3(12, 1, -115),
        new THREE.Vector3(24, 0, -135)
      ], 0xffaa00, "trade"),

      createGlowingRoute([
        new THREE.Vector3(24, 0, -135),
        new THREE.Vector3(12, 0, -155),
        new THREE.Vector3(0, 0, -175)
      ], 0x00ffcc, "transportation"),

      createGlowingRoute([
        new THREE.Vector3(0, 0, -175),
        new THREE.Vector3(9, 0, -195),
        new THREE.Vector3(18, 0, -220)
      ], 0xffaa00, "population")
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

    const spawnTrafficShip = (points: THREE.Vector3[], modelCreator: () => THREE.Group, speed: number, name: string) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const mesh = modelCreator();
      mesh.scale.setScalar(0.35);
      mesh.userData = {
        interactive: true,
        id: `ship-${Math.random().toString(36).substring(2, 7)}`,
        name,
        type: "ship",
        faction: "MMINT Commerce Network",
        powerDraw: 0.42,
        population: 5,
        dockedShips: 0,
        materials: ["Helium-3 Tanks", "Thruster Fuel"],
        telemetry: {
          velocity: `${(speed * 36000).toFixed(0)} km/h`,
          route: "Supply Pipeline Delta",
          engineStability: "100%"
        }
      };
      scene.add(mesh);

      trafficShips.push({
        mesh,
        curve,
        progress: Math.random(),
        speed: speed * (0.8 + Math.random() * 0.4),
        direction: Math.random() > 0.5 ? 1 : -1
      });
    };

    spawnTrafficShip([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2, 1, -2),
      new THREE.Vector3(-6, 2, -5)
    ], createPassengerShuttle, 0.05, "Passenger Shuttle MM-04");

    spawnTrafficShip([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-2, 1, -2),
      new THREE.Vector3(-6, 2, -5)
    ], createMaintenanceDrone, 0.08, "Repair Drone A-1");

    spawnTrafficShip([
      new THREE.Vector3(15, 3, -25),
      new THREE.Vector3(8, 3, -60),
      new THREE.Vector3(0, 3, -92)
    ], createOrbitalFerry, 0.025, "Ferry Helion-3");

    spawnTrafficShip([
      new THREE.Vector3(0, 3, -92),
      new THREE.Vector3(12, 1, -115),
      new THREE.Vector3(24, 0, -135)
    ], createCargoShip, 0.018, "Cargo Carrier Vesta");

    spawnTrafficShip([
      new THREE.Vector3(24, 0, -135),
      new THREE.Vector3(12, 0, -155),
      new THREE.Vector3(0, 0, -175)
    ], createCargoShip, 0.02, "Merchant freighter Zenith");

    spawnTrafficShip([
      new THREE.Vector3(0, 0, -175),
      new THREE.Vector3(9, 0, -195),
      new THREE.Vector3(18, 0, -220)
    ], createPassengerShuttle, 0.035, "Genesis Colony Shuttler");

    // Stage 8: Jupiter
    const jupiterGroup = createPlanet("jupiter");
    jupiterGroup.position.set(55, 30, -150);
    jupiterGroup.userData = {
      interactive: true,
      id: "jupiter",
      name: "Jupiter",
      type: "planet",
      faction: "Helios Mining Consortium",
      powerDraw: 0,
      population: 0,
      dockedShips: 4,
      materials: ["Hydrogen", "Helium"],
      telemetry: {
        miningAtmosphere: "Uncharted",
        magneticRadiation: "High Warning",
        moonsRegistered: "79"
      }
    };
    scene.add(jupiterGroup);

    // Stage 9: Saturn & Cassini rings
    const saturnGroup = createPlanet("saturn");
    saturnGroup.position.set(-15, 10, -225);
    saturnGroup.userData = {
      interactive: true,
      id: "saturn",
      name: "Saturn",
      type: "planet",
      faction: "Helios Mining Consortium",
      powerDraw: 0,
      population: 0,
      dockedShips: 2,
      materials: ["Ice Rocks", "Carbon Dust"],
      telemetry: {
        ringsRefinery: "Planning Stage",
        gravityFactor: "1.08g",
        solarWindFlux: "Nominal"
      }
    };
    scene.add(saturnGroup);

    // Stage 10: Neptune
    const neptuneGroup = createPlanet("neptune");
    neptuneGroup.position.set(-40, 20, -190);
    neptuneGroup.userData = {
      interactive: true,
      id: "neptune",
      name: "Neptune",
      type: "planet",
      faction: "Orbital Research Alliance",
      powerDraw: 0,
      population: 0,
      dockedShips: 0,
      materials: ["Methane Ice", "Water Ammonia"],
      telemetry: {
        stormSpeed: "2100 km/h",
        darkSpotScan: "Completed",
        temperatures: "55 K"
      }
    };
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

    const focalPoints = pathPoints.map(p => new THREE.Vector3().fromArray(p.target));

    const currentPos = new THREE.Vector3(0, 10, -20);
    const currentLook = new THREE.Vector3(0, 0, 0);

    // Interactive mouse parallax variables
    const mouse = { x: 0, y: 0 };
    const currentMouseOffset = { x: 0, y: 0 };

    // Active visual click scan rings in 3D
    const activePulses: Array<{ update: (delta: number) => boolean }> = [];

    const triggerScanPulse = (target: THREE.Object3D) => {
      const pulseGeo = new THREE.RingGeometry(0.3, 0.4, 32);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x00ffc8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      
      const pos = new THREE.Vector3();
      target.getWorldPosition(pos);
      pulseMesh.position.copy(pos);
      pulseMesh.lookAt(camera.position);
      scene.add(pulseMesh);
      
      let pScale = 1;
      const pulseAnim = {
        mesh: pulseMesh,
        update: (dt: number) => {
          pScale += 20 * dt;
          pulseMesh.scale.setScalar(pScale);
          pulseMat.opacity -= 1.8 * dt;
          if (pulseMat.opacity <= 0) {
            scene.remove(pulseMesh);
            pulseGeo.dispose();
            pulseMat.dispose();
            return false;
          }
          return true;
        }
      };
      activePulses.push(pulseAnim);
    };

    const getScreenCoordinates = (object: THREE.Object3D) => {
      const vector = new THREE.Vector3();
      object.getWorldPosition(vector);
      vector.project(camera);
      const behind = vector.z > 1;
      return {
        x: behind ? -9999 : (vector.x * 0.5 + 0.5) * container.clientWidth,
        y: behind ? -9999 : (-(vector.y * 0.5) + 0.5) * container.clientHeight,
        behind
      };
    };

    const findInteractiveParent = (object: THREE.Object3D | null): THREE.Object3D | null => {
      if (!object) return null;
      if (object.userData && object.userData.interactive) return object;
      return findInteractiveParent(object.parent);
    };

    const setGroupGlow = (group: THREE.Object3D, glowColor: number | null) => {
      group.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          const matArray = Array.isArray(child.material) ? child.material : [child.material];
          matArray.forEach(m => {
            if (m.emissive) {
              if (glowColor !== null) {
                if (m.userData.origEmissive === undefined) {
                  m.userData.origEmissive = m.emissive.clone();
                  m.userData.origEmissiveIntensity = m.emissiveIntensity;
                }
                m.emissive.setHex(glowColor);
                m.emissiveIntensity = 0.8;
              } else {
                if (m.userData.origEmissive !== undefined) {
                  m.emissive.copy(m.userData.origEmissive);
                  m.emissiveIntensity = m.userData.origEmissiveIntensity;
                }
              }
            }
          });
        }
      });
    };

    const ndcMouse = new THREE.Vector2();
    let dragStartX = 0;
    let dragStartY = 0;
    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      ndcMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndcMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isMouseDown && explorerModeRef.current) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        targetThetaRef.current -= dx * 0.005;
        targetPhiRef.current += dy * 0.005;
        targetPhiRef.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, targetPhiRef.current));
        
        bankRollRef.current = -dx * 0.03;
      } else {
        mouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
        mouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      isMouseDown = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      const dx = Math.abs(e.clientX - dragStartX);
      const dy = Math.abs(e.clientY - dragStartY);
      if (dx < 5 && dy < 5 && explorerModeRef.current) {
        raycastSelect(true);
      }
    };

    let hoveredGroup: THREE.Object3D | null = null;
    const raycastSelect = (isClick = false) => {
      raycaster.setFromCamera(ndcMouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      let foundParent: THREE.Object3D | null = null;
      for (let i = 0; i < intersects.length; i++) {
        const obj = findInteractiveParent(intersects[i].object);
        if (obj) {
          foundParent = obj;
          break;
        }
      }

      if (foundParent) {
        if (isClick) {
          triggerScanPulse(foundParent);
          cosAudio.playClickChime(); // Selection feedback chime sound
          if (onAssetClick) {
            onAssetClick({
              id: foundParent.userData.id,
              name: foundParent.userData.name,
              type: foundParent.userData.type,
              faction: foundParent.userData.faction,
              powerDraw: foundParent.userData.powerDraw,
              population: foundParent.userData.population,
              dockedShips: foundParent.userData.dockedShips,
              materials: foundParent.userData.materials,
              telemetry: foundParent.userData.telemetry
            });
          }
        } else {
          if (hoveredGroup !== foundParent) {
            if (hoveredGroup) setGroupGlow(hoveredGroup, null);
            hoveredGroup = foundParent;
            setGroupGlow(hoveredGroup, DESIGN_TOKENS.colors.cyan);
            cosAudio.playHoverTick(); // Hover lock-on feedback tick sound
          }
          
          if (hoveredGroup) {
            const screenCoords = getScreenCoordinates(hoveredGroup);
            if (onAssetHover) {
              onAssetHover({
                id: hoveredGroup.userData.id,
                name: hoveredGroup.userData.name,
                type: hoveredGroup.userData.type,
                faction: hoveredGroup.userData.faction,
                powerDraw: hoveredGroup.userData.powerDraw,
                population: hoveredGroup.userData.population,
                dockedShips: hoveredGroup.userData.dockedShips,
                materials: hoveredGroup.userData.materials,
                telemetry: hoveredGroup.userData.telemetry,
                screenX: screenCoords.x,
                screenY: screenCoords.y,
                behind: screenCoords.behind
              });
            }
          }
        }
      } else {
        if (!isClick && hoveredGroup) {
          setGroupGlow(hoveredGroup, null);
          hoveredGroup = null;
          if (onAssetHover) onAssetHover(null);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });

    const raycaster = new THREE.Raycaster();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Sync layers color styles dynamically in three.js scene
    const syncVisualizationLayers = () => {
      const layer = activeLayerRef.current.toLowerCase();
      scene.traverse((child) => {
        if (child.name === "glowing-route" && child instanceof THREE.Line) {
          const mat = child.material as THREE.LineDashedMaterial;
          const defaultCol = child.userData.defaultColor;
          const routeType = child.userData.routeType;
          
          if (layer === "infrastructure") {
            mat.color.setHex(DESIGN_TOKENS.colors.cyan);
            mat.opacity = 0.85;
          } else if (layer === "energy") {
            mat.color.setHex(DESIGN_TOKENS.colors.gold);
            mat.opacity = 0.85;
          } else if (layer === "transportation") {
            mat.color.setHex(DESIGN_TOKENS.colors.cyan);
            mat.opacity = 0.8;
          } else if (layer === routeType) {
            mat.color.setHex(defaultCol);
            mat.opacity = 0.9;
          } else if (layer === "normal" || layer === "") {
            mat.color.setHex(defaultCol);
            mat.opacity = 0.5;
          } else {
            mat.color.setHex(0x222226);
            mat.opacity = 0.15;
          }
        }
      });
    };

    // Camera update function using scroll interpolation & spring-damper easing
    const updateCamera = (time: number, delta: number, prefersReducedMotion?: boolean) => {
      const maxIdx = pathPoints.length - 1;
      const progress = Math.min(Math.max(scrollRef.current, 0), maxIdx);
      const idx = Math.floor(progress);
      const frac = progress - idx;

      const currentPoint = pathPoints[idx];
      const nextPoint = pathPoints[Math.min(idx + 1, maxIdx)];
      const focalPoint = focalPoints[idx];

      let targetPos = new THREE.Vector3();
      let targetLook = new THREE.Vector3();

      if (explorerModeRef.current) {
        // Orbital command rotation
        orbitThetaRef.current += (targetThetaRef.current - orbitThetaRef.current) * 0.05;
        orbitPhiRef.current += (targetPhiRef.current - orbitPhiRef.current) * 0.05;
        bankRollRef.current += (0 - bankRollRef.current) * 0.08; // relax roll

        const radius = 15;
        const camX = focalPoint.x + radius * Math.sin(orbitThetaRef.current) * Math.cos(orbitPhiRef.current);
        const camY = focalPoint.y + radius * Math.sin(orbitPhiRef.current);
        const camZ = focalPoint.z + radius * Math.cos(orbitThetaRef.current) * Math.cos(orbitPhiRef.current);

        targetPos.set(camX, camY, camZ);
        targetLook.copy(focalPoint);
      } else {
        // Standard scroll-linked Cruise Mode
        targetPos = new THREE.Vector3()
          .fromArray(currentPoint.pos)
          .lerp(new THREE.Vector3().fromArray(nextPoint.pos), frac);

        targetLook = new THREE.Vector3()
          .fromArray(currentPoint.target)
          .lerp(new THREE.Vector3().fromArray(nextPoint.target), frac);
      }

      // Cinematic Arrival zoom-in on mount
      if (isArriving) {
        arrivalTime += delta;
        const t = Math.min(1, arrivalTime / 4.0);
        const easedT = 1 - Math.pow(1 - t, 3); // cubic ease out
        const startPos = new THREE.Vector3(0, 120, -320);
        const startLook = new THREE.Vector3(0, 0, 0);
        
        targetPos.copy(startPos).lerp(targetPos, easedT);
        targetLook.copy(startLook).lerp(targetLook, easedT);
        
        if (t >= 1) {
          isArriving = false;
        }
      }

      // Smooth camera banking offset from mouse/drift
      const cycleTime = time % 30;
      let driftX = 0;
      let driftY = 0;
      let driftZ = 0;

      if (!prefersReducedMotion && cycleTime < 12 && !explorerModeRef.current) {
        const envelope = Math.sin((cycleTime / 12) * Math.PI);
        driftX = Math.sin(time * 0.5) * 0.12 * envelope;
        driftY = Math.cos(time * 0.3) * 0.08 * envelope;
        driftZ = Math.sin(time * 0.4) * 0.06 * envelope;
      }

      if (prefersReducedMotion) {
        currentMouseOffset.x = 0;
        currentMouseOffset.y = 0;
      } else {
        currentMouseOffset.x += (mouse.x * 2.8 - currentMouseOffset.x) * 0.05;
        currentMouseOffset.y += (-mouse.y * 2.8 - currentMouseOffset.y) * 0.05;
      }

      // Heavy drone spring positioning
      currentPos.lerp(targetPos, 0.02);
      currentLook.lerp(targetLook, 0.04);

      camera.position.copy(currentPos);
      if (!prefersReducedMotion && !explorerModeRef.current) {
        camera.position.x += currentMouseOffset.x + driftX;
        camera.position.y += currentMouseOffset.y + driftY;
        camera.position.z += driftZ;

        // Spaceport / shipyard thruster vibration shake
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

      // Scale reactor hum intensity dynamically based on proximity to the Shipyard [24, 0, -135]
      const distToShipyard = camera.position.distanceTo(new THREE.Vector3(24, 0, -135));
      const proximity = Math.max(0.0, 1.0 - distToShipyard / 70.0);
      cosAudio.updateReactorHumIntensity(proximity);

      // Apply bank roll on roll up vector
      if (explorerModeRef.current) {
        camera.up.set(bankRollRef.current, 1, 0).normalize();
      } else {
        camera.up.set(0, 1, 0);
      }

      camera.lookAt(currentLook);
    };

    // Sync theta/phi from current relative position
    const syncOrbitAngles = () => {
      const progress = Math.min(Math.max(scrollRef.current, 0), pathPoints.length - 1);
      const idx = Math.floor(progress);
      const currentFocal = focalPoints[idx] || new THREE.Vector3(0, 0, 0);
      
      const relativePos = camera.position.clone().sub(currentFocal);
      const r = relativePos.length();
      
      targetThetaRef.current = Math.atan2(relativePos.x, relativePos.z);
      targetPhiRef.current = Math.asin(relativePos.y / r);
      
      orbitThetaRef.current = targetThetaRef.current;
      orbitPhiRef.current = targetPhiRef.current;
    };

    let arrivalTime = 0;
    let isArriving = true;
    let lastTime = 0;
    let wasExplorerMode = false;
    const startYear = 2035;
    const endYear = 2200;
    const lastYearRef = { current: 2035 };

    const animate = (timestamp: number) => {
      if (isDestroyed) return;

      const prefersReducedMotion = prefersReducedMotionRef.current;
      const time = timestamp * 0.001;
      const delta = Math.min(0.1, time - lastTime);
      lastTime = time;

      // Sync explorer mode states
      const explorerModeActive = explorerModeRef.current;
      if (explorerModeActive && !wasExplorerMode) {
        syncOrbitAngles();
        wasExplorerMode = true;
      } else if (!explorerModeActive && wasExplorerMode) {
        wasExplorerMode = false;
      }

      // Sync timeline updates to react layer
      const progress = Math.min(Math.max(scrollRef.current, 0), pathPoints.length - 1);
      const currentYear = Math.floor(startYear + (progress / (pathPoints.length - 1)) * (endYear - startYear));
      if (currentYear !== lastYearRef.current) {
        lastYearRef.current = currentYear;
        if (onTimelineUpdate) onTimelineUpdate(currentYear);
      }

      // Sync layers
      syncVisualizationLayers();

      // Physics stepping
      physics.step(prefersReducedMotion ? 0 : delta);

      // Pulse scan rings
      for (let i = activePulses.length - 1; i >= 0; i--) {
        const keep = activePulses[i].update(delta);
        if (!keep) activePulses.splice(i, 1);
      }

      // Raycast updates
      if (explorerModeActive) {
        raycastSelect(false);
      }

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

      flareGroup.lookAt(camera.position);

      // Animate background shader nebula & stars
      nebulaMat.uniforms.time.value = time;
      if (!prefersReducedMotion) {
        starField1.rotation.y = time * 0.0001;
        starField2.rotation.x = time * 0.00017;
        starField2.rotation.y = time * 0.00023;
        dustPoints.rotation.y = time * 0.005;
        dustPoints.rotation.x = time * 0.002;
      }

      scene.traverse((child) => {
        if (child.userData.update) {
          child.userData.update(time, delta, prefersReducedMotion);
        }
        if (child.userData.updateScroll) {
          child.userData.updateScroll(scrollRef.current);
        }
        if (child instanceof THREE.Points && child.userData.velocities) {
          updateThrusterPlume(child, delta, prefersReducedMotion);
        }
      });

      trafficShips.forEach(ship => {
        const step = delta * ship.speed;
        ship.progress += step * ship.direction;

        if (ship.progress > 1.0) {
          ship.progress = 1.0;
          ship.direction = -1;
        } else if (ship.progress < 0.0) {
          ship.progress = 0.0;
          ship.direction = 1;
        }

        const pos = ship.curve.getPointAt(ship.progress);
        ship.mesh.position.copy(pos);

        const tangent = ship.curve.getTangentAt(ship.progress).normalize();
        if (ship.direction < 0) tangent.multiplyScalar(-1);
        
        const lookTarget = pos.clone().add(tangent);
        ship.mesh.lookAt(lookTarget);

        // Attach glowing volumetric ion engine trails to traffic freighters
        let trail = ship.mesh.getObjectByName("ion-trail");
        if (!trail) {
          const trailGeom = new THREE.ConeGeometry(0.12, 1.2, 8);
          trailGeom.translate(0, -0.6, 0); // offset pivot backwards
          const trailMat = new THREE.MeshBasicMaterial({
            color: DESIGN_TOKENS.colors.cyan,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
          });
          const trailMesh = new THREE.Mesh(trailGeom, trailMat);
          trailMesh.name = "ion-trail";
          trailMesh.rotation.x = Math.PI / 2; // point tail backwards
          trailMesh.position.z = -0.55;       // position behind thrusters
          ship.mesh.add(trailMesh);
          trail = trailMesh;
        }

        // Pulse exhaust trails
        if (trail && !prefersReducedMotion) {
          trail.scale.set(
            1.0 + Math.sin(time * 30.0) * 0.12,
            1.0 + Math.cos(time * 25.0) * 0.18,
            1.0
          );
        }

        ship.mesh.children.forEach(c => {
          if (c.name !== "ion-trail" && c.userData.update) {
            c.userData.update(time, delta, prefersReducedMotion);
          }
        });
      });

      updateBelt(time, delta, prefersReducedMotion);
      updateCamera(time, delta, prefersReducedMotion);
      renderer.render(scene, camera);

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);

      // Shutdown programmatic audio context safely
      cosAudio.shutdown();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

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

