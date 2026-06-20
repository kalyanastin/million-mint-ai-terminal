"use client";

import React, { useState } from "react";
import { GlassModule } from "../components/GlassModule";
import { WaitlistModal } from "../components/WaitlistModal";

// High-fidelity vector SVG logo component matching the brand image
function MillionMintLogo({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffc8" />
          <stop offset="50%" stopColor="#0088ff" />
          <stop offset="100%" stopColor="#7a22ff" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Circuit board trace lines extending from sides */}
      <path d="M25,60 L10,60 L10,120 L25,120" stroke="url(#mGradient)" strokeWidth="2.5" strokeDasharray="4,4" />
      <circle cx="25" cy="60" r="3.5" fill="#00ffc8" />
      <circle cx="25" cy="120" r="3.5" fill="#7a22ff" />
      
      <path d="M175,60 L190,60 L190,120 L175,120" stroke="url(#mGradient)" strokeWidth="2.5" strokeDasharray="4,4" />
      <circle cx="175" cy="60" r="3.5" fill="#00ffc8" />
      <circle cx="175" cy="120" r="3.5" fill="#7a22ff" />

      {/* Styled M core geometry matching image */}
      <path 
        d="M40,40 L60,40 L85,85 L115,85 L140,40 L160,40 L160,150 L140,150 L140,75 L110,120 L90,120 L60,75 L60,150 L40,150 Z" 
        fill="url(#mGradient)" 
        filter="url(#neonGlow)"
        stroke="#ffffff"
        strokeWidth="1"
        strokeOpacity="0.25"
      />
    </svg>
  );
}

// Smaller navigation bar logo
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

export default function Home() {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleDescend = () => {
    document.getElementById("earth-orbit")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-black text-white relative">
      
      {/* ── PERSISTENT HUD NAVIGATION ── */}
      <nav>
        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <NavLogo />
        </a>
        <div className="nav-links hidden md:flex">
          <a href="/about">ABOUT</a>
          <a href="/planet/genesis">PLANET</a>
          <a href="/roadmap">ROADMAP</a>
          <a href="/token">TOKEN</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>


      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper">
        
        {/* HERO SECTION */}
        <section id="hero">
          <div className="w-full flex justify-center text-center pointer-events-auto px-4">
            <div className="max-w-[900px] flex flex-col items-center">
              {/* Circuit "M" Vector logo */}
              <div className="mb-6 animate-pulse">
                <MillionMintLogo size={140} />
              </div>
              
              <h1 className="hero-title" style={{ fontSize: "clamp(60px, 12vw, 150px)" }}>
                MILLION MINT
              </h1>
              
              <div className="eyebrow mt-4">
                Build Worlds. Own Land. Shape the Future.
              </div>
              
              <p className="description mt-4 text-center" style={{ maxWidth: "700px" }}>
                A high-fidelity decentralized virtual universe powered by smart contracts and real-time spatial computing, where creators exercise full sovereignty over their virtual land, design complex digital economies, and capture absolute value from their creations.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-8 pointer-events-auto">
                <button onClick={handleDescend} className="btn-gold !mt-0">
                  Explore The Universe
                </button>
                <button onClick={() => setIsWaitlistOpen(true)} className="btn-gold !mt-0 !bg-[#00ffc8] hover:!shadow-[0_0_35px_rgba(0,255,200,0.3)]">
                  Join Genesis Airdrop
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 01 — EARTH ORBIT */}
        <section id="earth-orbit">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 01 // Earth Orbit</div>
              <h2 className="section-title">Infrastructure at the Edge of Space</h2>
              <p className="description">
                Humanity has established a permanent, thriving presence in low Earth orbit. High-capacity space elevators anchor terrestrial transport grids to massive orbital structures, cargo traffic shuttles materials to and from the surface, and a network of satellites maintains planetary coordination. This is the foundation of space civilization.
              </p>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Massive Earth</h3>
                  <p>High-realism orbital overview of our home planet.</p>
                </div>
                <div className="data-card">
                  <h3>Space Elevators</h3>
                  <p>Anchoring planetary logistics routes to space elevators.</p>
                </div>
                <div className="data-card">
                  <h3>Orbital Infrastructure</h3>
                  <p>Satellites, cargo hubs, and the ISS operating in unison.</p>
                </div>
              </div>
              <p className="description mt-6 italic text-[14px] text-zinc-400">
                Humanity has already reached orbit.
              </p>

              {/* Decrypt clue */}
              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-xs text-emerald-500 tracking-wider">SECURE ARCHIVE: space_elevator_logistics.log</span>
                </div>
                <button 
                  onClick={() => alert("ORBIT COMM DECRYPT:\nOrbital elevators operational. Humanity's footprint has successfully extended beyond the atmosphere.")}
                  className="font-mono text-[9px] text-[#00ffc8] border border-[#00ffc8]/30 px-3 py-1 hover:bg-[#00ffc8]/10 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Decrypt Transmission
                </button>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 02 — ORBITAL RESEARCH NETWORK */}
        <section id="research-network">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 02 // Orbital Research Network</div>
              <h2 className="section-title">Expanding the Boundaries of Knowledge</h2>
              <p className="description">
                Scientific discovery drives humanity's journey outward. The Orbital Research Network houses high-fidelity laboratories, telescope arrays peering into deep space, and research vessels studying cosmic physics. By coordinating decentralized intelligence nodes and observation platforms, we expand our collective technological capabilities.
              </p>
              <p className="description mt-6 highlight">
                Humanity is expanding knowledge.
              </p>
              
              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>RESEARCH GRID: LAB_NODE_ACTIVE</span>
                <span className="text-[#00ffc8] tracking-widest">SPECTRUM TELEMETRY: COMPILING</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 03 — RESOURCE EXTRACTION ZONE */}
        <section id="resource-extraction">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 03 // Resource Extraction Zone</div>
              <h2 className="section-title">The Engine of Space Economy</h2>
              <p className="description">
                Sustainable space civilization requires local materials. In the Resource Extraction Zone, asteroid mining operations harvest raw resources, industrial refinement platforms process high-yield metals, and cargo ships transport resources to active trade routes.
              </p>
              <p className="description mt-6 highlight">
                Civilizations require resources.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>EXTRACTION ZONE: MINING_LASERS_ACTIVE</span>
                <span className="text-[#00e5ff] tracking-widest">REFINEMENT SPEED: 1420 KG/S</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 04 — MMINT TRADE HUB */}
        <section id="trade-hub">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 04 // MMINT Trade Hub</div>
              <h2 className="section-title">A Thriving Space Economy</h2>
              <p className="description">
                Wealth flows through orbital cities and bustling trade networks. The MMINT Trade Hub coordinates commerce, trade terminals execute real-time transactions, and market districts support civilian commerce. Every spacecraft, raw metal, and virtual land coordinate contributes to a growing GDP.
              </p>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Orbital City</h3>
                  <p>High-density habitats supporting thousands of residents.</p>
                </div>
                <div className="data-card">
                  <h3>Trade Terminals</h3>
                  <p>Real-time exchange of synthetic resources and land coordinates.</p>
                </div>
                <div className="data-card">
                  <h3>Market Districts</h3>
                  <p>Creator marketplace for ship parts, modules, and spatial assets.</p>
                </div>
                <div className="data-card">
                  <h3>Cargo Ports</h3>
                  <p>Civilian and merchant traffic docking at active loading elevators.</p>
                </div>
              </div>
              <p className="description mt-6 highlight">
                A functioning economy exists.
              </p>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 05 — MMINT ORBITAL GATEWAY */}
        <section id="orbital-gateway">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 05 // MMINT Orbital Gateway</div>
              <h2 className="section-title">Center of Interstellar Logistics</h2>
              <p className="description">
                The Orbital Gateway coordinates logistical operations across the system. Anchored by a colossal ring station with multi-port docking systems, it coordinates passenger shuttles, long-range freight, and logistics networks to ensure seamless movement between connected worlds.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>GATEWAY SYSTEM: STATUS_ONLINE</span>
                <span className="text-[#00ffc8] animate-pulse">DOCKING CHANNELS: CLEAR</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 06 — GENESIS PLANET */}
        <section id="genesis-planet">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 06 // Genesis Planet</div>
              <h2 className="section-title">Building New Worlds</h2>
              <p className="description">
                The frontier of expansion is planetary colonization. Genesis Planet features surface colonies, spaceports connecting ground-to-orbit routes, weather modification networks, and local surface transport rails connecting settlements.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>GENESIS HABITATS: LIFE_SUPPORT_OK</span>
                <span className="text-[#f5c842] animate-pulse">WEATHER SHIELD: OPERATIONAL</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 07 — FUTURE CIVILIZATIONS */}
        <section id="future-civilizations">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 07 // Future Civilizations</div>
              <h2 className="section-title">The Endless Frontier</h2>
              <p className="description">
                The expansion of space civilization continues to grow. Long-term roadmaps outline habitat rings, deep-space colonies, interplanetary networks, and expansion routes tracing lines to new planetary horizons.
              </p>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Habitat Rings</h3>
                  <p>Self-sustaining Megastructures orbiting parent stars.</p>
                </div>
                <div className="data-card">
                  <h3>New Worlds</h3>
                  <p>Terraforming plans for systems beyond the core orbit.</p>
                </div>
                <div className="data-card">
                  <h3>Interplanetary Net</h3>
                  <p>Establishing secure high-speed light-based communication nets.</p>
                </div>
                <div className="data-card">
                  <h3>Expansion Routes</h3>
                  <p>Tracing path coordinates to raw uncharted stellar nodes.</p>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* FINAL SECTION (Solar Horizon Lookback) */}
        <section id="founder">
          <div className="px-4 w-full flex justify-center">
            <GlassModule className="text-center max-w-[800px] flex flex-col items-center">
              <div className="eyebrow">Deep Space Horizon</div>
              <h2 className="section-title font-bold text-white mb-6 animate-pulse" style={{ fontSize: "clamp(35px, 6vw, 65px)", lineHeight: 1.1 }}>
                The Future Belongs To Builders
              </h2>
              <p className="description text-center" style={{ fontSize: "16px", color: "var(--muted)", maxWidth: "600px" }}>
                The next generation of digital civilizations will be created by visionaries. Not spectators.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-zinc-400 font-mono text-[11px] tracking-widest uppercase">
                <span>Builders //</span>
                <span>Creators //</span>
                <span>Explorers</span>
              </div>

              <p className="description text-center mt-6 highlight font-semibold" style={{ fontSize: "18px" }}>
                Welcome to Million Mint.
              </p>
              
              {/* Kalyan Chowdary Founder card */}
              <div className="mt-10 flex flex-col items-center border-t border-[rgba(255,255,255,0.06)] pt-6 w-full">
                <div className="text-3xl font-bold font-['Bebas_Neue'] tracking-[3px] text-white">Kalyan Chowdary</div>
                <div className="font-mono text-[#f5c842] tracking-[5px] text-[10px] font-bold uppercase mt-1">
                  Founder | Million Mint
                </div>
                <p className="mt-2 text-[11px] font-mono text-zinc-400 max-w-[500px]">
                  Building high-fidelity decentralized virtual environments and economic primitives for creator-owned space civilizations.
                </p>
                <div className="flex gap-4 mt-4 font-mono text-xs text-[#00ffc8]">
                  <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">X / Twitter</a>
                  <span>•</span>
                  <a href="https://github.com/kalyanastin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                  <span>•</span>
                  <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram</a>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* FOOTER SECTION */}
        <footer className="w-full py-12 px-6 border-t border-[rgba(255,255,255,0.03)] bg-black/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-auto mt-20">
          <div className="flex flex-col items-center md:items-start gap-2">
            <NavLogo />
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              © {new Date().getFullYear()} Million Mint. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 font-mono text-xs text-zinc-400">
            <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">X (Twitter)</a>
            <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">Telegram</a>
            <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">GitHub</a>
            <a href="/sitemap.xml" className="hover:text-[#00ffc8] transition-colors">Sitemap</a>
          </div>
        </footer>

      </div>
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </main>
  );
}
