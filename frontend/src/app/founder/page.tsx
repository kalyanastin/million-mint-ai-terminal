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

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      
      {/* ── 3D WEBGL BACKGROUND LAYER ── */}
      <Suspense fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
          CONNECTING ORBITAL TELEMETRY...
        </div>
      }>
        <SpaceUniverse scrollProgress={5.5} />
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
          <a href="/founder" className="opacity-100 text-[#00ffc8]">FOUNDER</a>
        </div>
      </nav>

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Executive Profile // Kalyan Chowdary</div>
            <h1 className="section-title text-center text-white mb-2" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              KALYAN CHOWDARY
            </h1>
            <p className="text-center font-mono text-xs text-[#f5c842] tracking-[4px] uppercase mb-10">
              Founder of Million Mint & Architect of Decentralized Civilizations
            </p>

            <div className="space-y-8 font-mono text-sm leading-relaxed text-zinc-300">
              
              {/* SECTION 1: STORY */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">1. The Founder Story</h2>
                <p>
                  Kalyan Chowdary is a blockchain systems engineer, decentralized architect, and product strategist dedicated to building self-sovereign digital infrastructure. His journey into decentralized technology began over a decade ago, focused on smart contract composability and structural cryptography. Kalyan saw that early internet designs were compromised by centralized web servers, leaving users subject to corporate gatekeepers.
                </p>
                <p className="mt-4">
                  Driven by the conviction that digital property rights are a fundamental human necessity, Kalyan designed Million Mint to be more than a visual game. He envisioned it as a robust technical layer—a decentralized digital civilization ecosystem where creators can claim coordinates, write code, run virtual businesses, and secure their financial future directly on the blockchain.
                </p>
              </div>

              {/* SECTION 2: VISION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">2. The Vision</h2>
                <p>
                  "We are living through a massive transition of human coordinate systems. The physical world is static, finite, and heavily constrained by legacy regulatory monopolies. The digital world is infinitely expansive, but its value is currently captured by centralized search engines and social conglomerates.
                </p>
                <p className="mt-4">
                  Our vision for Million Mint is to build the sovereign infrastructure that allows humanity to build decentralized civilizations. We are creating a composable, spatial ledger where property deeds, currency loops, and coordinate routing are guaranteed at the protocol level. We are paving the path to decentralized space economies, orbital commerce systems, and self-governed planetary DAOs. In the Million Mint universe, the user is the owner."
                </p>
              </div>

              {/* SECTION 3: MISSION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#0088ff] uppercase tracking-wider mb-4">3. The Mission</h2>
                <p>
                  Kalyan’s mission is to deploy the technical foundations required to scale decentralized ecosystems to millions of active nodes and businesses. Through Million Mint, his focus is on building high-performance developer toolkits, low-cost L2 rollup registries, and a sovereign Layer-1 blockchain (the Million Mint Network). 
                </p>
                <p className="mt-4">
                  His goal is to make virtual business creation, asset minting, and cross-planetary transaction settlement so efficient that developers can easily run highly complex decentralized applications on-chain. Kalyan is committed to ensuring that the value generated by builders remains in the hands of the builders.
                </p>
              </div>

              {/* SECTION 4: TECHNOLOGY PHILOSOPHY */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#7a22ff] uppercase tracking-wider mb-4">4. Technology Philosophy</h2>
                <p>
                  "In code we trust. The core technology philosophy of Million Mint is **Absolute Decoupling from Centralization**. Every layer of our stack is built to prioritize user independence:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Smart Contracts as Law:</strong> Rules regarding coordinate leases, transaction taxes, and staking limits are locked inside auditable smart contracts. No admin keys or central board can alter these rules unilaterally.
                  </li>
                  <li>
                    <strong className="text-white">Progressive Layer-1 Independence:</strong> While we start on established EVM chains to tap into deep liquidity, our roadmap leads to a custom sovereign Layer-1 blockchain. This guarantees that spatial validation and coordinate registries are secure from external network congested gas spikes.
                  </li>
                  <li>
                    <strong className="text-white">Democracy Over Plutocracy:</strong> Quadratic Voting is an essential component of our tech stack. By balancing voting weight based on the square root of tokens, we ensure that community developers guide platform parameters, preventing centralized whales from dominating governance.
                  </li>
                </ul>
              </div>

              {/* SECTION 5: LONG-TERM GOALS */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">5. Future of Digital Civilizations</h2>
                <p>
                  Kalyan sees the next decade as a critical period for digital coordination. As virtual work, assets, and spaces become central to global GDP, the platforms hosting them must be secure and censorship-resistant. 
                </p>
                <p className="mt-4">
                  His long-term goal is to build Million Mint into an interconnected network of autonomous planetary systems governed by regional DAOs. These DAOs will manage virtual public services, coordinate validator nodes, and build interstellar trade routes. By establishing a robust, circular economy powered by $MMINT, Kalyan aims to bridge the virtual economy with real-world financial systems, proving that digital labor and property are as valid and secure as physical assets.
                </p>
              </div>

              {/* SECTION 6: PERSONAL STATEMENT */}
              <div>
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">6. Personal Statement</h2>
                <blockquote className="border-l-2 border-[#f5c842] pl-4 italic text-zinc-400 my-6">
                  "For too long, the internet has operated on a landlord-tenant model. Creators build value, build communities, and launch businesses, only to be taxed or banned by central platforms. Million Mint is the solution. We are building a digital civilization where ownership is absolute, code is law, and builders are sovereigns. Join us as we build the infrastructure for the next generation of digital worlds."
                </blockquote>
                
                {/* Social links grid */}
                <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                  <h4 className="text-white font-bold uppercase mb-4">Connect with the Founder:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="p-4 border border-[rgba(255,255,255,0.06)] hover:border-[#00ffc8] bg-white/2 hover:bg-white/5 transition-all text-center">
                      <strong className="text-[#00ffc8] block mb-1">X / Twitter</strong>
                      <span className="text-xs text-zinc-500">@kalyanchow369</span>
                    </a>
                    <a href="https://github.com/kalyanastin" target="_blank" rel="noopener noreferrer" className="p-4 border border-[rgba(255,255,255,0.06)] hover:border-[#f5c842] bg-white/2 hover:bg-white/5 transition-all text-center">
                      <strong className="text-[#f5c842] block mb-1">GitHub</strong>
                      <span className="text-xs text-zinc-500">github.com/kalyanastin</span>
                    </a>
                    <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="p-4 border border-[rgba(255,255,255,0.06)] hover:border-[#0088ff] bg-white/2 hover:bg-white/5 transition-all text-center">
                      <strong className="text-[#0088ff] block mb-1">Telegram</strong>
                      <span className="text-xs text-zinc-500">t.me/millionmint</span>
                    </a>
                  </div>
                </div>
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
          <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">X (Twitter)</a>
          <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">Telegram</a>
          <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">GitHub</a>
          <a href="/sitemap.xml" className="hover:text-[#00ffc8] transition-colors">Sitemap</a>
        </div>
      </footer>

    </main>
  );
}
