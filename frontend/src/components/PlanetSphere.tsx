"use client";

import * as THREE from "three";

// ── PROCEDURAL PLANETARY TEXTURE GENERATORS (Zero network requests, zero CORS) ──

function createProceduralTexture(
  type: "earth-day" | "earth-night" | "earth-specular" | "moon" | "mars" | "saturn" | "saturn-ring" | "venus" | "jupiter" | "neptune"
) {
  if (typeof window === "undefined") return new THREE.Texture();

  const isRing = type === "saturn-ring";
  const canvas = document.createElement("canvas");
  canvas.width = isRing ? 512 : 1024;
  canvas.height = isRing ? 2 : 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  if (type === "earth-day") {
    // 1. Deep blue ocean background
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, "#081b3b");
    oceanGrad.addColorStop(0.5, "#0b2554");
    oceanGrad.addColorStop(1, "#051329");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw continents in green/brown/sandy shades
    ctx.fillStyle = "#2d5e35";
    ctx.strokeStyle = "#40733a";
    ctx.lineWidth = 2;

    const drawContinent = (coords: Array<[number, number]>) => {
      ctx.beginPath();
      coords.forEach(([x, y], idx) => {
        const px = (x / 360 + 0.5) * canvas.width;
        const py = (1.0 - (y / 180 + 0.5)) * canvas.height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    // Americas
    drawContinent([
      [-120, 60], [-80, 50], [-70, 10], [-40, -10],
      [-70, -50], [-75, -55], [-70, -20], [-80, 0],
      [-100, 15], [-110, 30]
    ]);
    // Africa
    drawContinent([
      [-15, 30], [30, 30], [50, 10], [40, -30],
      [20, -35], [10, 0]
    ]);
    // Eurasia
    drawContinent([
      [-10, 60], [30, 70], [120, 70], [130, 35],
      [100, 10], [80, 10], [50, 25], [35, 10], [10, 35]
    ]);
    // Australia
    drawContinent([
      [115, -20], [145, -15], [150, -35], [115, -30]
    ]);
    // Antarctica
    ctx.fillStyle = "#e0f2fe";
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

    // 3. Draw white atmosphere clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * (canvas.height - 100) + 50;
      const rx = Math.random() * 120 + 40;
      const ry = Math.random() * 35 + 10;
      ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "earth-night") {
    // Black background
    ctx.fillStyle = "#010103";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Golden clusters for cities
    ctx.fillStyle = "#f5c842";
    const drawCityLights = (cx: number, cy: number, count: number, radius: number) => {
      const px = (cx / 360 + 0.5) * canvas.width;
      const py = (1.0 - (cy / 180 + 0.5)) * canvas.height;
      for (let i = 0; i < count; i++) {
        const dx = (Math.random() - 0.5) * radius;
        const dy = (Math.random() - 0.5) * radius;
        ctx.fillRect(px + dx, py + dy, Math.random() * 2 + 1, Math.random() * 2 + 1);
      }
    };

    // Major global hub areas
    drawCityLights(-74, 40, 60, 18);  // New York / US East
    drawCityLights(-118, 34, 40, 15); // LA / US West
    drawCityLights(0, 51, 80, 25);    // London / Western Europe
    drawCityLights(139, 35, 90, 20);  // Tokyo / Japan
    drawCityLights(121, 31, 70, 22);  // Shanghai / East China
    drawCityLights(77, 28, 50, 30);   // New Delhi / India
    drawCityLights(151, -33, 30, 10); // Sydney / Australia
    drawCityLights(37, 55, 35, 12);   // Moscow / Russia
  } else if (type === "earth-specular") {
    // Oceans white (reflective), land black (rough)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    const drawContinentMask = (coords: Array<[number, number]>) => {
      ctx.beginPath();
      coords.forEach(([x, y], idx) => {
        const px = (x / 360 + 0.5) * canvas.width;
        const py = (1.0 - (y / 180 + 0.5)) * canvas.height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
    };

    drawContinentMask([
      [-120, 60], [-80, 50], [-70, 10], [-40, -10],
      [-70, -50], [-75, -55], [-70, -20], [-80, 0],
      [-100, 15], [-110, 30]
    ]);
    drawContinentMask([
      [-15, 30], [30, 30], [50, 10], [40, -30],
      [20, -35], [10, 0]
    ]);
    drawContinentMask([
      [-10, 60], [30, 70], [120, 70], [130, 35],
      [100, 10], [80, 10], [50, 25], [35, 10], [10, 35]
    ]);
    drawContinentMask([
      [115, -20], [145, -15], [150, -35], [115, -30]
    ]);
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
  } else if (type === "moon") {
    // Gray craters
    ctx.fillStyle = "#7a7a82";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Maria basins
    ctx.fillStyle = "#55555c";
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 120 + 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters
    for (let i = 0; i < 80; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const r = Math.random() * 20 + 2;

      // Dark shadow crater center
      ctx.fillStyle = "#404044";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // White highlights rim
      ctx.strokeStyle = "#a3a3ab";
      ctx.lineWidth = Math.max(1, r * 0.15);
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy - r * 0.1, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === "mars") {
    // Volcanic red iron-oxide
    ctx.fillStyle = "#bc6742";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark Syrtis Major volcanic sands
    ctx.fillStyle = "#71321d";
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 140 + 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // White polar ice caps
    ctx.fillStyle = "#fefefe";
    ctx.fillRect(0, 0, canvas.width, 22);
    ctx.fillRect(0, canvas.height - 22, canvas.width, 22);

    // Dusty light brown streaks
    ctx.fillStyle = "rgba(226, 178, 142, 0.25)";
    for (let i = 0; i < 15; i++) {
      ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 45 + 15);
    }
  } else if (type === "venus") {
    // Yellow sulfur clouds
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#e3c886");
    grad.addColorStop(0.5, "#d2b474");
    grad.addColorStop(1, "#c0a062");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Acid swirls
    ctx.strokeStyle = "rgba(240, 220, 180, 0.4)";
    ctx.lineWidth = 15;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 200 + 80, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (type === "jupiter") {
    // Standard gas bands base
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#b88a53");
    grad.addColorStop(0.2, "#dfcca6");
    grad.addColorStop(0.4, "#cf9663");
    grad.addColorStop(0.6, "#a26a3f");
    grad.addColorStop(0.8, "#dfcca6");
    grad.addColorStop(1, "#86532b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (type === "saturn") {
    // Golden bands
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#dfcca6");
    grad.addColorStop(0.3, "#e9dbaa");
    grad.addColorStop(0.6, "#caa06c");
    grad.addColorStop(1, "#a88050");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (type === "saturn-ring") {
    // Saturn concentric ring Cassini divisions 1D gradient
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0, "rgba(215, 182, 126, 0.0)");
    grad.addColorStop(0.15, "rgba(180, 142, 90, 0.45)");
    grad.addColorStop(0.48, "rgba(80, 60, 40, 0.0)"); // Cassini Division Gap
    grad.addColorStop(0.53, "rgba(220, 195, 150, 0.85)");
    grad.addColorStop(0.85, "rgba(150, 115, 75, 0.7)");
    grad.addColorStop(1, "rgba(215, 182, 126, 0.0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (type === "neptune") {
    // Methane ice giant
    ctx.fillStyle = "#1e4d9b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0c2859";
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 60 + 20);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// ── CUSTOM SHADER DESCRIPTIONS ──

// Rayleigh atmosphere scatter outer rim glow
const RayleighAtmosphereShader = {
  uniforms: {
    sunDirection: { value: new THREE.Vector3(30, 20, 40).normalize() },
    glowColor: { value: new THREE.Color(0.3, 0.6, 1.0) },
    atmosphereThickness: { value: 0.15 },
  },
  vertexShader: `
    uniform float atmosphereThickness;
    varying float vIntensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vPosition = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      // Rayleigh formula matching SpaceX deep cinematic limb profiles
      vIntensity = pow(atmosphereThickness - dot(vNormal, vPosition), 2.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    varying float vIntensity;
    void main() {
      vec3 atmosphere = glowColor * vIntensity;
      gl_FragColor = vec4(atmosphere, vIntensity * 0.8);
    }
  `
};

// Thin dust scattering atmosphere for Mars
const MarsAtmosphereShader = {
  uniforms: {
    dustColor: { value: new THREE.Color(0.7, 0.4, 0.25) },
    atmosphereThickness: { value: 0.12 },
  },
  vertexShader: `
    uniform float atmosphereThickness;
    varying float vIntensity;
    void main() {
      vec3 vNormal = normalize(normalMatrix * normal);
      vec3 vPosition = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
      vIntensity = pow(atmosphereThickness - dot(vNormal, vPosition), 2.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 dustColor;
    varying float vIntensity;
    void main() {
      gl_FragColor = vec4(dustColor * vIntensity, vIntensity * 0.45);
    }
  `
};

// Saturn rings shadow calculation using LOCAL geometry coordinates
const SaturnRingShader = {
  uniforms: {
    ringTexture: { value: null as THREE.Texture | null },
    sunDir: { value: new THREE.Vector3(1, 0.2, 0).normalize() },
    innerRadius: { value: 8.5 * 1.2 },
    outerRadius: { value: 8.5 * 2.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vLocalPos;
    varying vec3 vWorldPos;
    void main() {
      vUv = uv;
      vLocalPos = position; // local coordinates to bypass rotated world origins!
      vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D ringTexture;
    uniform vec3 sunDir;
    uniform float innerRadius;
    uniform float outerRadius;
    varying vec2 vUv;
    varying vec3 vLocalPos;
    varying vec3 vWorldPos;

    void main() {
      // Calculate radial distance in the flat XY plane of the geometry
      float dist = length(vLocalPos.xy);
      float t = (dist - innerRadius) / (outerRadius - innerRadius);
      vec4 ringColor = texture2D(ringTexture, vec2(t, 0.5));

      // Cassini Division filtering
      if (t < 0.0 || t > 1.0) discard;
      
      // Ring self shadowing based on world position and light vector
      float shadowFactor = clamp(dot(normalize(vWorldPos), sunDir) + 0.5, 0.0, 1.0);
      gl_FragColor = vec4(ringColor.rgb * shadowFactor, ringColor.a * 0.85);
    }
  `
};

// Jupiter latitudinal wave bands and GRS vortex shaders
const JupiterShader = {
  uniforms: {
    time: { value: 0 },
    jupiterTexture: { value: null as THREE.Texture | null },
    redSpotCenter: { value: new THREE.Vector2(0.18, 0.47) },
  },
  vertexShader: `
    uniform float time;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 pos = position;
      float bandFreq = sin(uv.y * 18.0 + time * 0.05); // 18 gas bands
      pos += normal * bandFreq * 0.008; // Physical latitude band wave displacement
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform sampler2D jupiterTexture;
    uniform vec2 redSpotCenter;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      uv.x += time * 0.004; // Differential fast equator spin rotation

      vec4 texColor = texture2D(jupiterTexture, uv);

      // Red Spot vortex mixing
      float spotDist = distance(vUv, redSpotCenter);
      float spot = smoothstep(0.08, 0.03, spotDist);
      vec3 redSpotColor = vec3(0.85, 0.2, 0.05);
      vec3 final = mix(texColor.rgb, redSpotColor, spot * 0.7);

      gl_FragColor = vec4(final, 1.0);
    }
  `
};

// Neptune royal blue gas noise and Great Dark Spot shaders
const NeptuneShader = {
  uniforms: {
    time: { value: 0 },
    baseColor: { value: new THREE.Color(0x1a4a9c) },
    stormColor: { value: new THREE.Color(0x0a1f4f) },
    brightColor: { value: new THREE.Color(0x4488ff) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 stormColor;
    uniform vec3 brightColor;
    varying vec2 vUv;

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float n = i.x + i.y * 57.0;
      return mix(mix(hash(n), hash(n+1.0), f.x), mix(hash(n+57.0), hash(n+58.0), f.x), f.y);
    }

    void main() {
      vec2 uv = vUv;
      uv.x += time * 0.009; // Neptune fast spin (16 Earth hours)

      float band = sin(uv.y * 12.0 + noise(vec2(uv.x * 3.0, time * 0.02)) * 2.0);
      vec3 color = mix(stormColor, baseColor, smoothstep(-0.3, 0.6, band));

      // Great Dark Spot vortex
      float gds = distance(uv, vec2(0.25 + sin(time * 0.003) * 0.05, 0.42));
      color = mix(color, stormColor * 0.5, smoothstep(0.07, 0.02, gds));

      // Lit hemisphere methane brightness highlight
      color += brightColor * 0.12 * max(0.0, 1.0 - uv.x * 2.0);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// ── MAIN CREATOR FUNCTION ──

export function createPlanet(type: "earth" | "moon" | "mars" | "saturn" | "venus" | "jupiter" | "neptune") {
  const group = new THREE.Group();

  // Planet radius sizes
  const sizes = {
    earth: 10,
    moon: 2.5,
    mars: 6.0,
    venus: 9.2,
    jupiter: 18.0,
    saturn: 8.5,
    neptune: 12.0,
  };

  const radius = sizes[type];

  if (type === "earth") {
    // 1. Surface PBR MeshStandardMaterial
    const earthDay = createProceduralTexture("earth-day");
    const earthNight = createProceduralTexture("earth-night");
    const earthSpec = createProceduralTexture("earth-specular");

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthDay,
      roughnessMap: earthSpec,
      roughness: 0.7,
      metalness: 0.0,
      emissiveMap: earthNight,
      emissive: new THREE.Color(0xffd090),
      emissiveIntensity: 0.4,
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), earthMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 2. Volumetric Cloud Shell
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.15, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })
    );
    group.add(clouds);

    // 3. Atmosphere Halo (Rayleigh scattering backside glow)
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: RayleighAtmosphereShader.vertexShader,
      fragmentShader: RayleighAtmosphereShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(RayleighAtmosphereShader.uniforms),
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.4, 32, 32), atmosphereMat);
    group.add(halo);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.000072;
      clouds.rotation.y += 0.000082;
    };
  } else if (type === "moon") {
    const moonTex = createProceduralTexture("moon");
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshStandardMaterial({
        map: moonTex,
        roughness: 0.98, // Regolith has zero specularity
        metalness: 0.0,
        color: new THREE.Color(0x8a8a8a),
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.000011; // tidally locked spin
    };
  } else if (type === "mars") {
    const marsTex = createProceduralTexture("mars");
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshStandardMaterial({
        map: marsTex,
        roughness: 0.92,
        metalness: 0.0,
        color: new THREE.Color(0xb07040),
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Thin Mars dust atmosphere
    const marsAtmosphereMat = new THREE.ShaderMaterial({
      vertexShader: MarsAtmosphereShader.vertexShader,
      fragmentShader: MarsAtmosphereShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(MarsAtmosphereShader.uniforms),
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.25, 32, 32), marsAtmosphereMat);
    group.add(halo);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.00007;
    };
  } else if (type === "venus") {
    const venusTex = createProceduralTexture("venus");
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshStandardMaterial({
        map: venusTex,
        roughness: 0.3,
        metalness: 0.0,
        color: new THREE.Color(0xe8c870),
        emissive: new THREE.Color(0x402000),
        emissiveIntensity: 0.15,
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Nested acid cloud layers
    const scales = [1.03, 1.06, 1.1];
    scales.forEach((scale) => {
      const cloud = new THREE.Mesh(
        new THREE.SphereGeometry(radius * scale, 32, 32),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xc08820),
          transparent: true,
          opacity: 0.08,
          side: THREE.FrontSide,
          depthWrite: false,
        })
      );
      group.add(cloud);
    });

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y -= 0.000005; // slow retrograde spin
    };
  } else if (type === "jupiter") {
    const jupiterTex = createProceduralTexture("jupiter");
    const jupiterMat = new THREE.ShaderMaterial({
      vertexShader: JupiterShader.vertexShader,
      fragmentShader: JupiterShader.fragmentShader,
      uniforms: {
        time: { value: 0 },
        jupiterTexture: { value: jupiterTex },
        redSpotCenter: { value: new THREE.Vector2(0.18, 0.47) },
      },
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), jupiterMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Jupiter atmospheric orange glow
    const jupiterAtmosphereMat = new THREE.ShaderMaterial({
      vertexShader: RayleighAtmosphereShader.vertexShader,
      fragmentShader: RayleighAtmosphereShader.fragmentShader,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(30, 20, 40).normalize() },
        glowColor: { value: new THREE.Color(0.89, 0.65, 0.42) },
        atmosphereThickness: { value: 0.15 },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.4, 32, 32), jupiterAtmosphereMat);
    group.add(halo);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.00018;
      jupiterMat.uniforms.time.value = time;
    };
  } else if (type === "saturn") {
    const saturnTex = createProceduralTexture("saturn");
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshStandardMaterial({
        map: saturnTex,
        roughness: 0.6,
        metalness: 0.2,
        color: new THREE.Color(0xe5caa0),
      })
    );
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Concentric rings (fixed Cassini shader)
    const ringTex = createProceduralTexture("saturn-ring");
    const ringMat = new THREE.ShaderMaterial({
      vertexShader: SaturnRingShader.vertexShader,
      fragmentShader: SaturnRingShader.fragmentShader,
      uniforms: {
        ringTexture: { value: ringTex },
        sunDir: { value: new THREE.Vector3(1, 0.2, 0).normalize() },
        innerRadius: { value: radius * 1.2 },
        outerRadius: { value: radius * 2.3 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const rings = new THREE.Mesh(new THREE.RingGeometry(radius * 1.2, radius * 2.3, 256, 4), ringMat);
    rings.rotation.x = Math.PI / 2.3;
    rings.castShadow = true;
    rings.receiveShadow = true;
    group.add(rings);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.00015;
      rings.rotation.z = time * 0.015;
    };
  } else if (type === "neptune") {
    const neptuneMat = new THREE.ShaderMaterial({
      vertexShader: NeptuneShader.vertexShader,
      fragmentShader: NeptuneShader.fragmentShader,
      uniforms: {
        time: { value: 0 },
        baseColor: { value: new THREE.Color(0x1a4a9c) },
        stormColor: { value: new THREE.Color(0x0a1f4f) },
        brightColor: { value: new THREE.Color(0x4488ff) },
      },
    });

    const body = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), neptuneMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Cold blue methane halo
    const neptuneAtmosphereMat = new THREE.ShaderMaterial({
      vertexShader: RayleighAtmosphereShader.vertexShader,
      fragmentShader: RayleighAtmosphereShader.fragmentShader,
      uniforms: {
        sunDirection: { value: new THREE.Vector3(30, 20, 40).normalize() },
        glowColor: { value: new THREE.Color(0.29, 0.52, 0.85) },
        atmosphereThickness: { value: 0.15 },
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(radius + 0.35, 32, 32), neptuneAtmosphereMat);
    group.add(halo);

    group.userData.update = (time: number, delta: number) => {
      body.rotation.y += 0.00016;
      neptuneMat.uniforms.time.value = time;
    };
  }

  return group;
}
