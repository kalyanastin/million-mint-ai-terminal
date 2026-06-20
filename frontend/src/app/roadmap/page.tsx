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

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      
      {/* ── 3D WEBGL BACKGROUND LAYER ── */}
      <Suspense fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
          CONNECTING ORBITAL TELEMETRY...
        </div>
      }>
        <SpaceUniverse scrollProgress={2.5} />
      </Suspense>

      {/* ── PERSISTENT HUD NAVIGATION ── */}
      <nav>
        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <NavLogo />
        </a>
        <div className="nav-links hidden md:flex">
          <a href="/about">ABOUT</a>
          <a href="/roadmap" className="opacity-100 text-[#00ffc8]">ROADMAP</a>
          <a href="/token">TOKEN</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Strategic Timeline // Roadmap</div>
            <h1 className="section-title text-center text-white mb-8" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              MILLION MINT ROADMAP
            </h1>

            <div className="space-y-12 font-mono text-sm leading-relaxed text-zinc-300">
              
              {/* INTRODUCTION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8 text-zinc-400">
                <p>
                  The strategic evolution of Million Mint is mapped across four distinct development cycles. Our objective is to transition from an initial protocol deployment on an established EVM/L2 chain to a sovereign, proof-of-stake layer-1 blockchain (the Million Mint Network) dedicated to digital civilization workloads, planetary governance DAOs, and high-frequency virtual asset settlements.
                </p>
                <p className="mt-4">
                  Each phase represents a milestone in technical engineering, tokenomics activation, and community growth, ensuring long-term utility for the $MMINT token.
                </p>
              </div>

              {/* PHASE 1 — GENESIS */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider">Phase 1: Genesis — Launch & Protocol Core</h2>
                  <span className="bg-[#00ffc8]/10 text-[#00ffc8] text-xs px-3 py-1 border border-[#00ffc8]/20">Q1 - Q4 2026</span>
                </div>
                <p>
                  The primary focus of Phase 1 is the launch of the core Million Mint infrastructure, token release, and community consolidation. This establishes the security, base-level coordinate registries, and initial liquidity loops required to support developer activity.
                </p>
                <h4 className="text-white font-bold uppercase mt-6 mb-2">Milestones & Key Deliverables:</h4>
                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">MMINT Token Release:</strong> Token generation event (TGE) with 1,000,000,000 fixed supply, implementing multisig controls, team locks, and initial exchange integrations.
                  </li>
                  <li>
                    <strong className="text-white">AI Terminal Dashboard:</strong> Deployment of the FastAPI, Redis, and Next.js terminal, allowing users to switch tiers, fetch live market data, and query the Gemini-powered research engine.
                  </li>
                  <li>
                    <strong className="text-white">Genesis Smart Contracts:</strong> Deploying ERC-20 token contracts and initial planetary land coordinate register vaults to the host network.
                  </li>
                  <li>
                    <strong className="text-white">Foundation Governance:</strong> Setup of the primary foundation multisig to manage the treasury, initial validator setups, and community incentive distributions.
                  </li>
                  <li>
                    <strong className="text-white">Community & Guild Programs:</strong> Initiating explorer guilds, developer grants, and early contributor allocation checks to kickstart decentralized platform interest.
                  </li>
                </ul>
              </div>

              {/* PHASE 2 — EXPANSION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider">Phase 2: Expansion — Property & Markets</h2>
                  <span className="bg-[#f5c842]/10 text-[#f5c842] text-xs px-3 py-1 border border-[#f5c842]/25">Q1 - Q4 2027</span>
                </div>
                <p>
                  During Phase 2, the physical and commercial utilities of the ecosystem are deployed. We activate the digital land system, launch modular asset NFT standards, and deploy the decentralized marketplace.
                </p>
                <h4 className="text-white font-bold uppercase mt-6 mb-2">Milestones & Key Deliverables:</h4>
                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Virtual Land Release:</strong> Launching the interactive planetary maps. Users can stake $MMINT to secure raw land coordinates, terraform parcels, and execute property transactions.
                  </li>
                  <li>
                    <strong className="text-white">Asset NFT Infrastructure:</strong> Releasing standard 3D metadata definitions (ERC-721/1155 compatible) for spacecraft, modular structures, and regional resource extractors.
                  </li>
                  <li>
                    <strong className="text-white">Creator Marketplace:</strong> Deploying smart contract protocols for local trading. Creators can buy, sell, lease, or swap space coordinates and assets with minimal gas costs.
                  </li>
                  <li>
                    <strong className="text-white">Developer SDK v1.0:</strong> Documentation and SDK packages to import GLTF assets, set custom spatial scripts, and deploy private micro-games on personal land parcels.
                  </li>
                  <li>
                    <strong className="text-white">Ecosystem Yield Integrations:</strong> Activating the staking rewards model, allowing validators and delegators to locks tokens in return for a share of transaction fee revenues.
                  </li>
                </ul>
              </div>

              {/* PHASE 3 — CIVILIZATION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-[#0088ff] uppercase tracking-wider">Phase 3: Civilization — DAOs & Commerce</h2>
                  <span className="bg-[#0088ff]/10 text-[#0088ff] text-xs px-3 py-1 border border-[#0088ff]/20">Q1 - Q4 2028</span>
                </div>
                <p>
                  Phase 3 introduces cross-planet infrastructure, sovereign organization systems, and structured virtual business contracts. We transition governance control from the Foundation to the autonomous planetary DAOs.
                </p>
                <h4 className="text-white font-bold uppercase mt-6 mb-2">Milestones & Key Deliverables:</h4>
                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Planetary Portal Networks:</strong> Interconnecting the five unique planets (Genesis, Creator, Commerce, Gaming, Education) with functional spatial gates and route fees.
                  </li>
                  <li>
                    <strong className="text-white">Synthetic Business Contracts:</strong> Deployment of specialized registry templates that allow players to run in-world services (e.g., fuel depots, structural workshops, and banking services) that process real-time $MMINT transactions.
                  </li>
                  <li>
                    <strong className="text-white">Quadratic Voting DAO Engine:</strong> Integration of on-chain quadratic voting modules, ensuring that land parcels and token weight are balanced fairly to protect smaller developers from dominant whales.
                  </li>
                  <li>
                    <strong className="text-white">Resource Harvester Engines:</strong> Launching systemic raw resource gathering loops, allowing players to mine asteroid zones and refine assets into tradeable materials.
                  </li>
                  <li>
                    <strong className="text-white">Cross-Chain Portability:</strong> Bridges to integrate assets with other L1/L2 systems, expanding accessibility to outside marketplaces.
                  </li>
                </ul>
              </div>

              {/* PHASE 4 — INFINITY */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold text-[#7a22ff] uppercase tracking-wider">Phase 4: Infinity — Native Sovereign Chain</h2>
                  <span className="bg-[#7a22ff]/10 text-[#7a22ff] text-xs px-3 py-1 border border-[#7a22ff]/20">2029 - 2030</span>
                </div>
                <p>
                  The terminal phase achieves absolute decentralization through the deployment of the Million Mint Network (MMN)—our custom sovereign layer-1 Proof-of-Stake chain. The $MMINT token transitions to the native utility and gas asset of this blockchain.
                </p>
                <h4 className="text-white font-bold uppercase mt-6 mb-2">Milestones & Key Deliverables:</h4>
                <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Million Mint Network (MMN) Mainnet:</strong> Successful testnet transition to MMN, implementing a high-throughput, custom virtual machine tailored for spatial registries.
                  </li>
                  <li>
                    <strong className="text-white">Native Validator Pools:</strong> Activating the decentralized validator network. Independent node operators stake $MMINT to secure transactions, earn blocks, and maintain regional state records.
                  </li>
                  <li>
                    <strong className="text-white">Absolute DAO Control:</strong> The Foundation hands over full ownership and key management of treasury allocations to the global, quadratic community voting pools.
                  </li>
                  <li>
                    <strong className="text-white">Inter-Civilization Frameworks:</strong> Empowering secondary developers to spawn custom, independent sub-planets linked to the main network, turning Million Mint into an infinite virtual federation.
                  </li>
                </ul>
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
