"use client";

import * as THREE from "three";

export const DESIGN_TOKENS = {
  // 1. Sleek Future Color Palette
  colors: {
    cyan: 0x00ffc8,     // Primary infrastructure (nominals)
    blue: 0x0088ff,     // Science / Research
    gold: 0xffd080,     // Mining / Energy
    orange: 0xffaa00,   // Trade / Cargo Pipelines
    alertRed: 0xff3b30, // Emergency Alerts
    bgSpace: 0x020205,  // Deep Space void background
    ambientGlow: 0x111122
  },

  // 2. CSS-Equivalent String Hex Values
  hex: {
    cyan: "#00ffc8",
    blue: "#0088ff",
    gold: "#ffd080",
    orange: "#ffaa00",
    alertRed: "#ff3b30",
    bgSpace: "#020205"
  },

  // 3. Typographical Styles
  typography: {
    mono: "'Space Mono', monospace",
    sans: "'Outfit', sans-serif",
    logo: "'Bebas Neue', sans-serif"
  },

  // 4. Glassmorphic Settings
  glass: {
    background: "rgba(4, 4, 8, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(25px)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)"
  },

  // 5. Canonical Lighting Coefficients
  lighting: {
    sunIntensity: 3.5,
    sunColor: 0xfff5e0,
    ambientIntensity: 0.04,
    ambientColor: 0x111122,
    earthShineIntensity: 0.3,
    earthShineColor: 0x3366ff
  },

  // 6. Camera Settings
  camera: {
    fov: 55,
    near: 0.1,
    far: 1000,
    exposure: 0.85
  }
};

// Reusable WebGL material generator
export function createSharedMaterial(type: "glass" | "hologram" | "energy" | "metal") {
  if (typeof window === "undefined") return new THREE.MeshBasicMaterial();

  switch (type) {
    case "glass":
      return new THREE.MeshStandardMaterial({
        color: 0x112233,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
    case "hologram":
      return new THREE.MeshBasicMaterial({
        color: DESIGN_TOKENS.colors.cyan,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        wireframe: true
      });
    case "energy":
      return new THREE.MeshBasicMaterial({
        color: DESIGN_TOKENS.colors.gold,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
    case "metal":
      return new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.2
      });
    default:
      return new THREE.MeshStandardMaterial();
  }
}
