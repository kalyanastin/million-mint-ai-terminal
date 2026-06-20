"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import * as THREE from "three";
import { GlassModule } from "../../../components/GlassModule";
import { WaitlistModal } from "../../../components/WaitlistModal";
import { createPlanet } from "../../../components/PlanetSphere";

// Dynamic import of the WebGL Space Canvas to bypass SSR issues during Next.js builds
const SpaceUniverse = dynamic(
  () => import("../../../components/SpaceUniverse").then((mod) => mod.SpaceUniverse),
  { ssr: false }
);

function NavLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="34" height="34" viewBox="0 0 200 200" fill="none">
        <defs>
          <linearGradient id="navMGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffc8" />
            <stop offset="50%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#7a22ff" />
          </linearGradient>
        </defs>
        <path d="M40,40 L60,40 L85,85 L115,85 L140,40 L160,40 L160,150 L140,150 L140,75 L110,120 L90,120 L60,75 L60,150 L40,150 Z" fill="url(#navMGradient)" />
      </svg>
      <span className="logo font-['Bebas_Neue'] text-2xl tracking-[4px] text-white">MILLION<span className="text-[#00ffc8]">MINT</span></span>
    </div>
  );
}

// ── DISTRICTS & PARCELS DATA ──
interface Parcel {
  id: string;
  status: "Available" | "Reserved";
  size: string;
  owner: string;
}

interface District {
  id: string;
  name: string;
  description: string;
  coords: { x: number; y: number; z: number }; // Target rotation angles for the globe
  parcels: Parcel[];
}

const DISTRICTS: District[] = [
  {
    id: "creator",
    name: "Creator District",
    description: "The architectural center configured for high-fidelity spatial assets, GLTF/USDz rendering ports, and asset procedural generation engines.",
    coords: { x: 0.2, y: 1.2, z: 0 },
    parcels: [
      { id: "MM-CRT-001", status: "Reserved", size: "16 Blocks", owner: "Kalyan Chowdary" },
      { id: "MM-CRT-002", status: "Available", size: "8 Blocks", owner: "-" },
      { id: "MM-CRT-003", status: "Available", size: "12 Blocks", owner: "-" },
    ]
  },
  {
    id: "commerce",
    name: "Commerce District",
    description: "The core trade plaza optimized for trustless inventory routing, regional market exchanges, escrow terminals, and logistics routes.",
    coords: { x: -0.5, y: -0.8, z: 0.3 },
    parcels: [
      { id: "MM-COM-001", status: "Reserved", size: "32 Blocks", owner: "Satoshi Bank" },
      { id: "MM-COM-002", status: "Available", size: "24 Blocks", owner: "-" },
      { id: "MM-COM-003", status: "Reserved", size: "16 Blocks", owner: "MM Treasury" },
    ]
  },
  {
    id: "innovation",
    name: "Innovation District",
    description: "R&D zones for zero-knowledge scaling systems, oracle network interfaces, and decentralized intelligence (AI) nodes.",
    coords: { x: 0.6, y: 0.5, z: -0.4 },
    parcels: [
      { id: "MM-INN-001", status: "Available", size: "12 Blocks", owner: "-" },
      { id: "MM-INN-002", status: "Available", size: "16 Blocks", owner: "-" },
      { id: "MM-INN-003", status: "Reserved", size: "20 Blocks", owner: "Solana Node" },
    ]
  },
  {
    id: "gaming",
    name: "Gaming District",
    description: "Real-time state verification zones configured for latency-sensitive multiplayer physics, battle arenas, and asset ports.",
    coords: { x: -0.2, y: 2.5, z: 0.5 },
    parcels: [
      { id: "MM-GAM-001", status: "Reserved", size: "64 Blocks", owner: "Cyber Arena" },
      { id: "MM-GAM-002", status: "Available", size: "32 Blocks", owner: "-" },
      { id: "MM-GAM-003", status: "Available", size: "48 Blocks", owner: "-" },
    ]
  },
  {
    id: "education",
    name: "Education District",
    description: "Collaborative knowledge academies, historical virtual libraries, lecture halls, and open-source spatial repositories.",
    coords: { x: 0.8, y: -2.0, z: -0.2 },
    parcels: [
      { id: "MM-EDU-001", status: "Reserved", size: "24 Blocks", owner: "MM Academy" },
      { id: "MM-EDU-002", status: "Available", size: "12 Blocks", owner: "-" },
      { id: "MM-EDU-003", status: "Available", size: "18 Blocks", owner: "-" },
    ]
  }
];

export default function PlanetGenesisPage() {
  const [activeDistrictIdx, setActiveDistrictIdx] = useState(0);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Refs to control planet rotation from react state
  const planetGroupRef = useRef<THREE.Group | null>(null);
  const targetRotation = useRef({ x: 0, y: 0, z: 0 });

  const activeDistrict = DISTRICTS[activeDistrictIdx];

  // Set target rotation whenever active district changes
  useEffect(() => {
    const coords = activeDistrict.coords;
    targetRotation.current = { x: coords.x, y: coords.y, z: coords.z };
  }, [activeDistrictIdx]);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    let isDestroyed = false;
    let animFrameId: number;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // 2. Setup Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 32);

    // 3. Setup Lights
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
    sunLight.position.set(50, 10, 30);
    scene.add(sunLight);

    const ambient = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambient);

    // 4. Create the Planet (Genesis Planet, using "earth" procedural generator)
    const planetGroup = createPlanet("earth");
    scene.add(planetGroup);
    planetGroupRef.current = planetGroup;

    // 5. Interactive Drag Rotation Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !planetGroup) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      // Add rotation based on drag offset
      planetGroup.rotation.y += deltaMove.x * 0.005;
      planetGroup.rotation.x += deltaMove.y * 0.005;

      // Update target rotation to current rotation to prevent jumping back
      targetRotation.current = {
        x: planetGroup.rotation.x,
        y: planetGroup.rotation.y,
        z: planetGroup.rotation.z
      };

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // 6. Animation Render Loop
    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (isDestroyed) return;
      const time = timestamp * 0.001;
      const delta = Math.min(0.1, time - lastTime);
      lastTime = time;

      // Smoothly interpolate (lerp) planet rotation toward target coordinate angles
      if (planetGroup && !isDragging) {
        planetGroup.rotation.x += (targetRotation.current.x - planetGroup.rotation.x) * 0.05;
        planetGroup.rotation.y += (targetRotation.current.y - planetGroup.rotation.y) * 0.05;
        planetGroup.rotation.z += (targetRotation.current.z - planetGroup.rotation.z) * 0.05;

        // Slow automatic idle spin while matching targets
        targetRotation.current.y += 0.0006;
      }

      // Update procedural animations on planet textures/clouds
      if (planetGroup && planetGroup.userData.update) {
        planetGroup.userData.update(time, delta);
      }

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    // Cleanup memory
    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animFrameId);
      
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);

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

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* ── 3D WEBGL BACKGROUND LAYER ── */}
      <Suspense fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
          CONNECTING ORBITAL TELEMETRY...
        </div>
      }>
        <SpaceUniverse scrollProgress={8.0} />
      </Suspense>

      {/* ── PERSISTENT HUD NAVIGATION ── */}
      <nav>
        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <NavLogo />
        </a>
        <div className="nav-links hidden md:flex">
          <a href="/about">ABOUT</a>
          <a href="/roadmap">ROADMAP</a>
          <a href="/token">TOKEN</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>

      {/* ── INTERACTIVE EXPLORER UI OVERLAYS ── */}
      <div className="relative z-10 w-full min-h-screen flex flex-col md:flex-row pointer-events-none pt-24 pb-12 px-6 gap-6">
        
        {/* LEFT SIDEBAR: DISTRICT CHOOSE PANEL */}
        <div className="w-full md:w-[350px] flex flex-col gap-6 pointer-events-auto shrink-0">
          <GlassModule className="!p-5 border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded flex-1 flex flex-col">
            <span className="text-[10px] font-mono text-[#00ffc8] tracking-widest uppercase mb-1">
              Planet Genesis Node
            </span>
            <h2 className="text-2xl font-bold font-['Bebas_Neue'] text-white tracking-[2px] uppercase mb-4 border-b border-zinc-800/60 pb-2">
              Genesis Explorer
            </h2>

            {/* List of Districts */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {DISTRICTS.map((dist, idx) => (
                <button
                  key={dist.id}
                  onClick={() => setActiveDistrictIdx(idx)}
                  className={`w-full text-left font-mono text-xs p-3.5 border transition-all cursor-pointer rounded flex flex-col gap-1 ${
                    idx === activeDistrictIdx
                      ? "border-[#00ffc8] bg-[#00ffc8]/5 text-white"
                      : "border-zinc-800/80 hover:border-zinc-500 bg-black/40 text-zinc-400"
                  }`}
                >
                  <span className={`text-[10px] tracking-wider uppercase font-bold ${
                    idx === activeDistrictIdx ? "text-[#00ffc8]" : "text-zinc-500"
                  }`}>
                    Coordinate Node 0{idx + 1}
                  </span>
                  <span className="text-sm font-sans font-bold tracking-wide uppercase">
                    {dist.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Global CTA Airdrop Signup */}
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="w-full mt-6 bg-[#f5c842] hover:bg-[#ebd281] text-black font-bold uppercase font-mono tracking-wider p-4 rounded text-center cursor-pointer transition-all hover:scale-[1.02]"
            >
              Join Genesis Airdrop
            </button>
          </GlassModule>
        </div>

        {/* MIDDLE AREA: 3D WEBGL GLOBE CANVAS */}
        <div className="flex-1 min-h-[300px] md:min-h-0 relative flex items-center justify-center">
          
          {/* Instructions overlay */}
          <div className="absolute top-4 font-mono text-[9px] text-zinc-500 uppercase tracking-widest bg-zinc-950/40 border border-zinc-900 px-3 py-1 rounded select-none">
            🖱️ Click & drag globe to rotate manually
          </div>

          <div ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-auto cursor-grab active:cursor-grabbing" />
        </div>

        {/* RIGHT SIDEBAR: DISTRICT PARCELS & RESERVATION */}
        <div className="w-full md:w-[350px] flex flex-col gap-6 pointer-events-auto shrink-0">
          <GlassModule className="!p-5 border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md rounded flex-1 flex flex-col">
            <span className="text-[10px] font-mono text-[#f5c842] tracking-widest uppercase mb-1">
              Active Coordinates Zone
            </span>
            <h2 className="text-xl font-bold font-sans text-white tracking-wide uppercase mb-3">
              {activeDistrict.name}
            </h2>
            <p className="text-xs font-mono text-zinc-400 leading-relaxed mb-6 border-b border-zinc-800/60 pb-4">
              {activeDistrict.description}
            </p>

            {/* List of sample land parcels */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-2 font-bold">
                Registered Land Parcels:
              </span>
              
              {activeDistrict.parcels.map((parcel) => (
                <div 
                  key={parcel.id}
                  className="bg-black/50 border border-zinc-800 p-3.5 rounded flex flex-col gap-2 font-mono text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{parcel.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      parcel.status === "Available"
                        ? "bg-[#00ffc8]/10 text-[#00ffc8] border border-[#00ffc8]/25"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {parcel.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500">
                    <div>SIZE: <span className="text-zinc-300">{parcel.size}</span></div>
                    <div>OWNER: <span className="text-zinc-300 truncate block">{parcel.owner}</span></div>
                  </div>

                  {parcel.status === "Available" ? (
                    <button
                      onClick={() => setIsWaitlistOpen(true)}
                      className="w-full mt-2 bg-[#00ffc8]/10 hover:bg-[#00ffc8] text-[#00ffc8] hover:text-black font-bold uppercase tracking-widest py-2 rounded text-[10px] border border-[#00ffc8]/30 transition-all text-center cursor-pointer"
                    >
                      Reserve Parcel
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full mt-2 bg-zinc-900 border border-zinc-800 text-zinc-600 font-bold uppercase tracking-widest py-2 rounded text-[10px] text-center cursor-not-allowed"
                    >
                      Acquired
                    </button>
                  )}
                </div>
              ))}
            </div>
          </GlassModule>
        </div>

      </div>

      {/* ── PERSISTENT REGISTRATION MODAL ── */}
      <WaitlistModal 
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
      />

    </main>
  );
}
