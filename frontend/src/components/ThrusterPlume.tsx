"use client";

import * as THREE from "three";

// Generate a programmatically-created soft radial gradient circle texture
function createSoftParticleTexture() {
  if (typeof window === "undefined") return new THREE.Texture();
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
  grad.addColorStop(0.3, "rgba(255, 255, 255, 0.7)");
  grad.addColorStop(0.7, "rgba(255, 255, 255, 0.1)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createThrusterPlume(color = "#88aaff", count = 300, scale = 1.0) {
  const plumeColor = new THREE.Color(color);
  const particleTexture = createSoftParticleTexture();

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const ages = new Float32Array(count);
  const lifetimes = new Float32Array(count);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  const spread = 0.14 * scale; // 8 degree half-cone spread angle

  for (let i = 0; i < count; i++) {
    // Start at engine exit plane
    positions[i * 3 + 0] = (Math.random() - 0.5) * 0.1 * scale;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1 * scale;

    // Velocity mostly downward (negative Y direction)
    velocities[i * 3 + 0] = (Math.random() - 0.5) * spread;
    velocities[i * 3 + 1] = -(2.5 + Math.random() * 1.5) * scale;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * spread;

    sizes[i] = (0.02 + Math.random() * 0.04) * scale;
    lifetimes[i] = 0.3 + Math.random() * 0.4; // lifetime in seconds
    ages[i] = Math.random() * lifetimes[i]; // stagger particle starts
    opacities[i] = 1.0;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("opacity", new THREE.BufferAttribute(opacities, 1));

  const customShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: particleTexture },
      color: { value: plumeColor },
    },
    vertexShader: `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;
      void main() {
        vOpacity = opacity;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (350.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform sampler2D pointTexture;
      uniform vec3 color;
      varying float vOpacity;
      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);
        gl_FragColor = vec4(color, tex.a * vOpacity);
        if (gl_FragColor.a < 0.01) discard;
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });

  const points = new THREE.Points(geometry, customShaderMaterial);
  points.userData = { velocities, ages, lifetimes, scale, count };
  return points;
}

export function updateThrusterPlume(plume: THREE.Points, delta: number, prefersReducedMotion?: boolean) {
  if (prefersReducedMotion) return;

  const geometry = plume.geometry;
  const posAttr = geometry.attributes.position;
  const opacAttr = geometry.attributes.opacity;
  if (!posAttr || !opacAttr) return;

  const posArray = posAttr.array as Float32Array;
  const opacArray = opacAttr.array as Float32Array;
  const { velocities, ages, lifetimes, scale, count } = plume.userData;

  for (let i = 0; i < count; i++) {
    ages[i] += delta;

    if (ages[i] > lifetimes[i]) {
      // Reset to nozzle origin
      posArray[i * 3 + 0] = (Math.random() - 0.5) * 0.08 * scale;
      posArray[i * 3 + 1] = 0;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.08 * scale;
      ages[i] = 0;
      opacArray[i] = 1.0;
    } else {
      // Update positions based on velocity vectors
      posArray[i * 3 + 0] += velocities[i * 3 + 0] * delta;
      posArray[i * 3 + 1] += velocities[i * 3 + 1] * delta;
      posArray[i * 3 + 2] += velocities[i * 3 + 2] * delta;

      // Exhaust plume expands as it drifts
      velocities[i * 3 + 0] *= 1.002;
      velocities[i * 3 + 2] *= 1.002;

      // Particle fades as it decays
      opacArray[i] = 1.0 - (ages[i] / lifetimes[i]);
    }
  }

  posAttr.needsUpdate = true;
  opacAttr.needsUpdate = true;
}
