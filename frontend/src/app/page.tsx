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
    document.getElementById("vision")?.scrollIntoView({ behavior: "smooth" });
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

        {/* SECTION 01 — THE VISION (Moon Flyby) */}
        <section id="vision">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 01 // The Vision</div>
              <h2 className="section-title">A New Digital Frontier</h2>
              <p className="description">
                Million Mint represents a paradigm shift in the digital economy. Traditional platforms capture the value generated by their users, retaining control over virtual assets and creations. We are deploying an economy-native virtual universe designed to reverse this dynamic. Through absolute ownership secured by decentralized ledger systems, programmable assets, and a scalable economic architecture, creators, developers, and explorers are empowered to build sustainable businesses, coordinate global resources, and govern their virtual habitats.
              </p>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Build your world.</h3>
                  <p>Shape terrain, establish colonies, and design structures in a photorealistic space environment.</p>
                </div>
                <div className="data-card">
                  <h3>Create your economy.</h3>
                  <p>Issue tokens, establish trade pathways, and set up virtual businesses inside synthetic worlds.</p>
                </div>
                <div className="data-card">
                  <h3>Shape your future.</h3>
                  <p>Join a self-governing community where creators drive virtual GDP growth and govern resources.</p>
                </div>
              </div>
              <p className="description mt-6 italic text-[14px] text-zinc-400">
                This is more than a platform. It is a living digital civilization.
              </p>

              {/* Decrypt clue */}
              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono text-xs text-emerald-500 tracking-wider">SECURE ARCHIVE: mm_vision_capsule.log</span>
                </div>
                <button 
                  onClick={() => alert("LUNAR COMM DECRYPT:\nSystem lock is green.\nDecoded coordinates point to Mars orbital elevators. We are paving the path to space-based real estate...")}
                  className="font-mono text-[9px] text-[#00ffc8] border border-[#00ffc8]/30 px-3 py-1 hover:bg-[#00ffc8]/10 transition-colors uppercase tracking-widest cursor-pointer"
                >
                  Decrypt Transmission
                </button>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 02 — DIGITAL LAND (Mars Descent) */}
        <section id="land">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 02 // Digital Land</div>
              <h2 className="section-title">Own Your Space</h2>
              <p className="description">
                Land in Million Mint is a modular utility asset. Each parcel represents a distinct geographical territory that can be terraformed, partitioned, and integrated with customized smart contracts. Whether you construct industrial mining operations, establish residential colonies, or create immersive entertainment venues, your ownership is secured at the protocol level. Develop high-yield territories, trade coordinates on the open marketplace, and establish absolute digital sovereignty.
              </p>
              <p className="description mt-6 highlight">
                True ownership secured by blockchain technology.
              </p>
              
              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>MARS GROUND MATRIX LOCK: [CONNECTED]</span>
                <span className="text-[#00ffc8] tracking-widest">COORDS: 442-RED-DESCENT</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 03 — CREATE (Asteroid Mining belt) */}
        <section id="create">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 03 // Create</div>
              <h2 className="section-title">Build Without Limits</h2>
              <p className="description">
                With our intuitive builder SDK and interoperable asset standards, you are not limited by templates or rigid structures. Build photorealistic 3D environments, design space assets like cargo shuttle transport ships, or code interactive narrative events. You can import native GLTF/OBJ assets, establish physical properties, and integrate them directly into the space ecosystem. Transform raw ideas into functioning products that exist permanently in the virtual cosmos.
              </p>
              <p className="description mt-6 highlight">
                The universe grows through its creators.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>MINING DRILL HARVEST: ACTIVE</span>
                <span className="text-[#00e5ff] tracking-widest">EXTRACTION LASER FEED: OK</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 04 — EARN (Shipyard Space Station) */}
        <section id="earn">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 04 // Earn</div>
              <h2 className="section-title">Create Value. Earn Rewards.</h2>
              <p className="description">
                Our multi-token economic framework is engineered to align long-term value creation with financial incentives. By deploying synthetic businesses, providing logistics services between space stations, or listing customized spacecraft on the open marketplace, you can establish sustainable streams of digital revenue. Every action that expands the virtual GDP of the network directly benefits the participants who generate it.
              </p>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Land development</h3>
                  <p>Increase territories value by constructing habitats and infrastructures.</p>
                </div>
                <div className="data-card">
                  <h3>Digital businesses</h3>
                  <p>Run commerce, shipyards, or observatories inside worlds.</p>
                </div>
                <div className="data-card">
                  <h3>Asset creation</h3>
                  <p>Mint 3D spacecraft, rovers, and accessories as portable assets.</p>
                </div>
                <div className="data-card">
                  <h3>Marketplace activity</h3>
                  <p>Trade resources, coordinates, and spacecraft across connected worlds.</p>
                </div>
              </div>
              <p className="description mt-6 highlight">
                The more value you create, the more opportunities you unlock.
              </p>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 05 — DIGITAL ECONOMY (Spacecraft Fleet) */}
        <section id="economy">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 05 // Digital Economy</div>
              <h2 className="section-title">A Living Economy</h2>
              <p className="description">
                The virtual economy of Million Mint is powered by deep liquidity pools, automated market makers (AMMs), and smart routing contracts. Trade scarce materials gathered from asteroid belts, swap spacecraft engine modifications, or invest in regional development funds. By bridging virtual resources with real-world economic layers, we ensure that digital labor translates directly to tangible rewards, fostering an active and self-sustaining market environment.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>FLEET FLIGHT TELEMETRY: SYNCED</span>
                <span className="text-[#00ffc8] animate-pulse">FORMATION: COMPACT</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 06 — THE ECOSYSTEM (Saturn ring flythrough) */}
        <section id="ecosystem">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 06 // The Ecosystem</div>
              <h2 className="section-title">Connected Worlds</h2>
              <p className="description">
                The Million Mint universe is a network of connected worlds, each governed by its own creators and autonomous DAOs. Navigate through planetary systems, join explorer guilds, or establish interstellar trade lanes with neighboring colonies. Our core protocol guarantees complete interoperability: your credentials, spacecraft, assets, and capital travel with you seamlessly across every world, sector, and orbital station in the ecosystem.
              </p>

              <div className="mt-8 border-t border-[rgba(255,255,255,0.06)] pt-6 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>ORBIT SCANNER: SATURN / JUPITER / NEPTUNE</span>
                <span className="text-[#f5c842] animate-pulse">MATRIX SCAN: STABLE</span>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 07 — ROADMAP (Jupiter Voyage) */}
        <section id="roadmap">
          <div className="px-4 w-full flex justify-center">
            <GlassModule>
              <div className="eyebrow">Section 07 // Strategic Roadmap</div>
              <h2 className="section-title">The Journey Ahead</h2>
              <div className="data-grid">
                <div className="data-card">
                  <h3>Genesis</h3>
                  <p>Launch the foundation of the Million Mint universe.</p>
                </div>
                <div className="data-card">
                  <h3>Expansion</h3>
                  <p>Land ownership, world creation, and marketplace systems.</p>
                </div>
                <div className="data-card">
                  <h3>Civilization</h3>
                  <p>Advanced economies, businesses, and creator ecosystems.</p>
                </div>
                <div className="data-card">
                  <h3>Infinity</h3>
                  <p>A fully connected digital universe driven by its community.</p>
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
