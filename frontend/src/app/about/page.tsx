"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { GlassModule } from "../../components/GlassModule";

// Dynamic import of the WebGL Space Canvas to bypass SSR issues during Next.js builds
const SpaceUniverse = dynamic(
  () => import("../../components/SpaceUniverse").then((mod) => mod.SpaceUniverse),
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      
      {/* ── 3D WEBGL BACKGROUND LAYER ── */}
      <Suspense fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
          CONNECTING ORBITAL TELEMETRY...
        </div>
      }>
        {/* Pass a static progress value to set a beautiful floating background */}
        <SpaceUniverse scrollProgress={1.5} />
      </Suspense>

      {/* ── PERSISTENT HUD NAVIGATION ── */}
      <nav>
        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <NavLogo />
        </a>
        <div className="nav-links hidden md:flex">
          <a href="/about" className="opacity-100 text-[#00ffc8]">ABOUT</a>
          <a href="/roadmap">ROADMAP</a>
          <a href="/token">TOKEN</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Platform Specification // About Us</div>
            <h1 className="section-title text-center text-white mb-8" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              ABOUT MILLION MINT
            </h1>

            <div className="space-y-8 font-mono text-sm leading-relaxed text-zinc-300">
              
              {/* SECTION 1: VISION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">1. The Vision</h2>
                <p>
                  Million Mint is not a virtual game world, nor is it a traditional, passive metaverse project. We represent a paradigm shift in how humanity coordinates, owns, and monetizes value across the digital frontier. Our vision is the deployment of a fully decentralized digital civilization. Within this high-fidelity universe, creators, communities, businesses, and decentralized autonomous organizations (DAOs) build and govern interconnected planetary environments. 
                </p>
                <p className="mt-4">
                  We believe that the next generation of virtual real estate and digital economies must be built on the principles of absolute self-sovereign ownership. Rather than renting space inside centralized servers owned by multi-billion-dollar conglomerates, the citizens of Million Mint hold immutable cryptographic deeds to their worlds, assets, and cash flows. The future belongs to those who build it—not those who spectate.
                </p>
              </div>

              {/* SECTION 2: MISSION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">2. The Mission</h2>
                <p>
                  Our mission is to establish the infrastructure, protocols, and developer toolkits necessary to support creator-owned spatial computing. Million Mint provides the architectural foundation—combining smart contracts, high-speed relational caching, and real-time WebGL streaming—that enables anyone to design, mint, and launch coordinate-linked assets. 
                </p>
                <p className="mt-4">
                  By lowering the technical barriers to deploying complex decentralized virtual applications, we are democratizing access to the synthetic economies of tomorrow. We strive to align economic incentives so that value flows directly to the builders, developers, and active community members who generate it. We are building the rails for a self-sustaining virtual GDP.
                </p>
              </div>

              {/* SECTION 3: PHILOSOPHY */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#0088ff] uppercase tracking-wider mb-4">3. Platform Philosophy</h2>
                <p>
                  At the core of Million Mint is a commitment to three structural philosophy pillars: **Absolute Sovereignty**, **Composable Utility**, and **Decentralized Governance**.
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Absolute Sovereignty:</strong> Your files, your coordinates, your tokens, and your customers are yours. The platform cannot arbitrarily confiscate assets, block access, or change transaction fees. Smart contracts guarantee user independence.
                  </li>
                  <li>
                    <strong className="text-white">Composable Utility:</strong> Every digital asset minted on Million Mint (from planetary land parcels to custom spacecraft) is built using open standards, allowing them to interface dynamically with other decentralized applications, markets, and external blockchains.
                  </li>
                  <li>
                    <strong className="text-white">Decentralized Governance:</strong> Protocol updates, treasury allocation, and parameter adjustments are decided through quadratic voting by $MMINT token holders. This ensures that resource allocation is determined democratically by the community, reducing the power of large token whales.
                  </li>
                </ul>
              </div>

              {/* SECTION 4: THE DIGITAL CIVILIZATION FRAMEWORK */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#7a22ff] uppercase tracking-wider mb-4">4. Digital Civilization Framework</h2>
                <p>
                  A digital civilization requires more than visual space; it requires governance, commercial frameworks, communication infrastructure, and legal/financial primitives. Million Mint implements a multi-tiered architecture that integrates these core components:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/5">
                    <h3 className="text-[#f5c842] font-bold uppercase mb-2">Decentralized Identity (DID)</h3>
                    <p className="text-xs text-zinc-400">
                      Your identity is cross-chain, portable, and secure. It records your achievements, planetary alignment, voting weight, and asset portfolio without exposing private personal information.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/5">
                    <h3 className="text-[#00ffc8] font-bold uppercase mb-2">Planetary DAO Systems</h3>
                    <p className="text-xs text-zinc-400">
                      Every virtual planet acts as an autonomous district. The owners of local land parcels form a specialized DAO to govern zoning laws, tax structures, and resource yields on their planet.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/5">
                    <h3 className="text-[#0088ff] font-bold uppercase mb-2">Universal Asset Registry</h3>
                    <p className="text-xs text-zinc-400">
                      All assets—from massive orbital factories to small structural modules—are recorded on a public, secure ledger to ensure transparency, scarcity, and interoperable transactions.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/5">
                    <h3 className="text-[#7a22ff] font-bold uppercase mb-2">Synthetic Commercial Layer</h3>
                    <p className="text-xs text-zinc-400">
                      Includes built-in automated market makers (AMMs), lending protocols, and escrow contracts designed to support trustless trading between planetary systems.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 5: PLANETARY ECOSYSTEMS */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">5. Virtual Planet Ecosystem</h2>
                <p>
                  The universe of Million Mint is divided into specialized planetary systems, each catering to distinct components of a digital civilization:
                </p>
                <div className="space-y-4 mt-4">
                  <p>
                    * **Genesis Planet:** The central coordinate hub, acting as the primary entry point for new explorers, hosting the grand virtual assembly, administrative archives, and official token exchanges.
                  </p>
                  <p>
                    * **Creator Planet:** A design-focused system configured to support high-fidelity building tools, procedural terrain mapping, and specialized workshops for minting digital items.
                  </p>
                  <p>
                    * **Commerce Planet:** The financial engine of the cosmos, optimized for heavy transaction throughput, planetary wholesale markets, financial services, and shipping terminals.
                  </p>
                  <p>
                    * **Gaming & Entertainment Planet:** A playground of interactive experiences, offering developers the physics engines, network relays, and state channels required to deploy real-time games.
                  </p>
                  <p>
                    * **Education Planet:** A collaborative hub for academies, universities, and virtual research observatories, offering open-source libraries, interactive lectures, and historical archives.
                  </p>
                </div>
              </div>

              {/* SECTION 6: ECONOMIC SUSTAINABILITY */}
              <div>
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">6. Economic Sustainability</h2>
                <p>
                  Many blockchain systems fail due to inflationary reward tokenomics that lack real utility. Million Mint resolves this issue by ensuring that the **$MMINT** token has multiple structural utility loops. The token is required for land acquisition, marketplace fees, node staking, and planetary DAO registry.
                </p>
                <p className="mt-4">
                  Furthermore, a percentage of transaction fees is automatically routed to the DAO Treasury or burned, creating a deflationary pressure that offsets rewards. This dynamic creates a balanced token loop: as platform usage grows, token utility increases, ensuring that the Million Mint economy remains robust, liquid, and sustainable over decades.
                </p>
              </div>

            </div>

            {/* Back button */}
            <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-500">SYSTEM SECURE STATUS: ONLINE</span>
              <a href="/" className="btn-gold !mt-0 !py-3 !px-8 text-xs">
                Back To Terminal
              </a>
            </div>

          </GlassModule>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="w-full py-12 px-6 border-t border-[rgba(255,255,255,0.03)] bg-black/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-auto relative z-10">
        <div className="flex flex-col items-center md:items-start gap-2">
          <NavLogo />
          <p className="text-[10px] font-mono text-zinc-500 mt-1">
            © {new Date().getFullYear()} Million Mint. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 font-mono text-xs text-zinc-400">
          <a href="https://x.com/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">X (Twitter)</a>
          <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">Telegram</a>
          <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">GitHub</a>
          <a href="/sitemap.xml" className="hover:text-[#00ffc8] transition-colors">Sitemap</a>
        </div>
      </footer>

    </main>
  );
}
