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

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      
      {/* ── 3D WEBGL BACKGROUND LAYER ── */}
      <Suspense fallback={
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
          CONNECTING ORBITAL TELEMETRY...
        </div>
      }>
        <SpaceUniverse scrollProgress={4.5} />
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
          <a href="/whitepaper" className="opacity-100 text-[#00ffc8]">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Technical Blueprint // Whitepaper v1.0</div>
            <h1 className="section-title text-center text-white mb-4" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              TECHNICAL WHITEPAPER
            </h1>
            <p className="text-center font-mono text-xs text-[#00ffc8] tracking-widest uppercase mb-10">
              Million Mint: A Sovereign Layer-1 Digital Civilization Ecosystem
            </p>

            <div className="space-y-12 font-mono text-sm leading-relaxed text-zinc-300 max-h-[70vh] overflow-y-auto pr-4 scrollbar-custom">
              
              {/* 1. EXECUTIVE SUMMARY */}
              <div id="wp-sec-1">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">1. Executive Summary</h3>
                <p>
                  Million Mint represents a structural paradigm shift in decentralized coordination and spatial computing. Rather than positioning itself as a speculative virtual gaming environment, Million Mint is engineered as a complete decentralized digital civilization platform. It enables independent creators, developer collectives, businesses, and DAOs to deploy, secure, and monetize custom virtual worlds. 
                </p>
                <p className="mt-2">
                  At the core of the ecosystem is a dual utility framework: a fixed-supply native asset (**$MMINT**) that powers coordinate deeds, staking validation, and quadratic governance, coexisting with a modular spatial computing engine. This architecture guarantees absolute, protocol-level user sovereignty over virtual assets, commercial revenue streams, and local zoning laws.
                </p>
              </div>

              {/* 2. PROBLEM STATEMENT */}
              <div id="wp-sec-2">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">2. Problem Statement</h3>
                <p>
                  Modern internet configurations (Web2) and early virtual platform implementations (metaverses) suffer from structural centralization, economic misalignments, and technical scaling bottlenecks:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Centralized Capture:</strong> Traditional platforms retain complete ownership of user data, digital creations, and customer relationships, extracting rent up to 30–50% while holding the arbitrary authority to close accounts or alter code standards.
                  </li>
                  <li>
                    <strong className="text-white">Speculative Virtual Lands:</strong> Early blockchain land registries treat virtual space as a finite real estate commodity without underlying composability, leading to vacant, inactive digital spaces that fail to generate organic economic activity.
                  </li>
                  <li>
                    <strong className="text-white">Governance Centralization:</strong> The traditional "one token, one vote" governance models lead to plutocracies, where wealthy investment funds dictate development paths, alienating the actual developers and users who populate the ecosystem.
                  </li>
                </ul>
              </div>

              {/* 3. VISION OF MILLION MINT */}
              <div id="wp-sec-3">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">3. Vision of Million Mint</h3>
                <p>
                  Million Mint replaces these extractive structures with a modular sovereign layer designed to support decentralized civilization building. We envision an infinite galaxy of interconnected, creator-owned worlds where assets, credentials, and tokens move freely. 
                </p>
                <p className="mt-2">
                  Our system establishes absolute digital property rights enforced by cryptographic smart contracts. The code acts as the ultimate referee, guaranteeing that if you build a business, register coordinates, or code an application, the underlying asset and all revenue generated by it belong completely to you. We aim to power a sustainable, active virtual economy capable of scaling to support thousands of coordinate-based businesses and millions of citizens.
                </p>
              </div>

              {/* 4. PLANETARY ECOSYSTEM ARCHITECTURE */}
              <div id="wp-sec-4">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">4. Planetary Ecosystem Architecture</h3>
                <p>
                  To accommodate diverse industrial, commercial, and creative activities, the initial coordinate system is structured into five distinct planetary models:
                </p>
                <ul className="list-decimal pl-6 mt-2 space-y-3 text-zinc-400">
                  <li>
                    <strong className="text-white">Genesis Planet:</strong> The administrative and coordinating core of the ecosystem. It houses the global DAO assembly, token indices, registration vaults, and official coordinates routing.
                  </li>
                  <li>
                    <strong className="text-white">Creator Planet:</strong> Optimized for spatial developers. It features low-latency rendering parameters, native support for complex asset pipelines (GLTF, USDz), and modular tools to procedural terraform terrain.
                  </li>
                  <li>
                    <strong className="text-white">Commerce Planet:</strong> The corporate trade center of the cosmos. Equipped with built-in escrow protocols, wholesale inventory registries, and automated liquidity ports to manage massive transaction volume.
                  </li>
                  <li>
                    <strong className="text-white">Gaming Planet:</strong> Optimized for real-time physics simulation, peer-to-peer relay sync, and state channel coordination to execute latency-sensitive multiplayer games.
                  </li>
                  <li>
                    <strong className="text-white">Education Planet:</strong> Dedicated to intellectual coordination. Houses collaborative learning academies, research institutions, interactive lecture halls, and decentralized archives.
                  </li>
                </ul>
              </div>

              {/* 5. DIGITAL LAND OWNERSHIP */}
              <div id="wp-sec-5">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">5. Digital Land Ownership</h3>
                <p>
                  Digital land in Million Mint is not a static JPEG. It is registered on-chain as a **Sovereign Coordinate Deed**. Each parcel is defined by dynamic 3D spatial parameters (X, Y, Z coordinates plus scale vectors) mapped onto a public index.
                </p>
                <p className="mt-2">
                  Ownership is absolute and secured via decentralized ledger vaults. Land deeds grant the holder execution rights over that spatial volume. The owner can set local access policies, execute custom scripts, deploy interactive applications, partition the land into sub-coordinates, or lease the land to secondary businesses through automated rental smart contracts.
                </p>
              </div>

              {/* 6. CREATOR ECONOMY ENGINE */}
              <div id="wp-sec-6">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">6. Creator Economy Engine</h3>
                <p>
                  The platform implements a modular **Creator SDK** and a set of open standard protocols that simplify the monetization of digital creations. Creators do not have to write custom smart contracts from scratch. 
                </p>
                <p className="mt-2">
                  The SDK provides pre-audited templates for subscription fees, coordinate entrance tolls, microtransactions, and item upgrades. This allows creators to instantly monetize their builds and focus on producing high-quality interactive content.
                </p>
              </div>

              {/* 7. SYNTHETIC BUSINESSES */}
              <div id="wp-sec-7">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">7. Synthetic Businesses</h3>
                <p>
                  Citizens can register and deploy **Synthetic Businesses** directly inside their coordinates. These include orbital shipyards, asset shops, material refinement factories, financial offices, and gaming arenas. 
                </p>
                <p className="mt-2">
                  These businesses operate via trustless, automated escrow and settlement contracts. When a client purchases an asset or schedules a service, payment is routed instantly to the business registry contract, which handles payouts, stakeholder dividends, and local planetary taxes automatically.
                </p>
              </div>

              {/* 8. NFT INFRASTRUCTURE */}
              <div id="wp-sec-8">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">8. NFT Infrastructure</h3>
                <p>
                  Million Mint uses an advanced **Composed NFT Metadata** standard. Unlike static NFTs, Million Mint assets are state-aware, mutable, and composable. An asset NFT (such as an orbital factory) can contain secondary NFTs (like cargo shuttles or raw resource containers) within its own inventory register, with changes synced securely on-chain.
                </p>
              </div>

              {/* 9. SPACECRAFT & ASSET NFTS */}
              <div id="wp-sec-9">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">9. Spacecraft & Asset NFTs</h3>
                <p>
                  All vehicles, machinery, mining drills, and customized spacecraft are minted as interoperable assets. Each asset features certified spatial bounds, weight parameters, speed configurations, and fuel metrics. 
                </p>
                <p className="mt-2">
                  This guarantees that a spacecraft minted on the Creator Planet can be piloted seamlessly through the gaming systems on the Gaming Planet, traded at the terminals on the Commerce Planet, or staked inside orbital logistics contracts.
                </p>
              </div>

              {/* 10. MMINT UTILITY */}
              <div id="wp-sec-10">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">10. MMINT Utility</h3>
                <p>
                  The **$MMINT** token is the economic lifeblood of the ecosystem. It has five core utility vectors:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Sovereign Deeds:</strong> Required to acquire, stake, and register coordinate-linked land deeds.
                  </li>
                  <li>
                    <strong className="text-white">Ecosystem Gas:</strong> Serves as the native execution gas for all contracts, spatial edits, and asset registrations.
                  </li>
                  <li>
                    <strong className="text-white">Commerce Settlements:</strong> The default settlement asset for in-world marketplace commerce.
                  </li>
                  <li>
                    <strong className="text-white">Validator Staking:</strong> Operators stake $MMINT to validate state blocks and receive staking rewards.
                  </li>
                  <li>
                    <strong className="text-white">DAO Governance Weight:</strong> Used to calculate quadratic voting weight for platform parameter decisions.
                  </li>
                </ul>
              </div>

              {/* 11. TOKENOMICS */}
              <div id="wp-sec-11">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">11. Tokenomics</h3>
                <p>
                  $MMINT features a fixed supply of **1,000,000,000** tokens. The allocation is designed to prioritize decentralization and community ownership:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-zinc-400">
                  <li>**35% Community & Ecosystem:** Grants, user rewards, and active creator incentives.</li>
                  <li>**20% DAO Treasury:** Long-term ecosystem reserve managed by token vote.</li>
                  <li>**15% Staking Rewards:** Programmatic distribution to validators securing MMN.</li>
                  <li>**15% Founder & Team:** 12-month cliff, 48-month linear vesting.</li>
                  <li>**5% Strategic Partners:** 6-month cliff, 24-month linear vesting.</li>
                  <li>**5% Liquidity:** Fully unlocked to establish deep exchange books.</li>
                  <li>**5% Marketing:** 36-month controlled release for ecosystem expansion.</li>
                </ul>
              </div>

              {/* 12. GOVERNANCE FRAMEWORK */}
              <div id="wp-sec-12">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">12. Governance Framework</h3>
                <p>
                  Million Mint shifts control to the community through a three-stage progressive decentralization roadmap, arriving at a fully autonomous global DAO. To ensure a fair democratic process, we implement **Quadratic Voting (QV)**. 
                </p>
                <p className="mt-2">
                  Under QV, the cost of casting multiple votes on a proposal increases quadratically (Votes = √Tokens). This mathematical structure prevents massive token holders from overriding the shared decisions of the active developer and creator community.
                </p>
              </div>

              {/* 13. TREASURY MODEL */}
              <div id="wp-sec-13">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">13. Treasury Model</h3>
                <p>
                  The **DAO Treasury** holds 20% of the total supply, along with a percentage of platform transaction fees collected over time. The treasury funds are managed via on-chain smart contracts. 
                </p>
                <p className="mt-2">
                  Ecosystem members submit proposals for developer grants, marketing campaigns, or strategic asset acquisitions. Proposals require a quadratic voting majority to execute, guaranteeing complete transparency in capital allocation.
                </p>
              </div>

              {/* 14. TECHNICAL ARCHITECTURE */}
              <div id="wp-sec-14">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">14. Technical Architecture</h3>
                <p>
                  The current operational backend is built as a high-performance polyglot architecture:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">FastAPI Core:</strong> Serves as the high-speed backend execution layer, routing requests and managing secure SSE connections.
                  </li>
                  <li>
                    <strong className="text-white">Redis 7:</strong> Handles real-time spatial caching, tracking the location coordinates and coordinate deeds of active assets with sub-millisecond latency.
                  </li>
                  <li>
                    <strong className="text-white">Next.js & WebGL:</strong> Renders the interactive 3D universe client directly inside standard browsers without plugins or downloads.
                  </li>
                </ul>
              </div>

              {/* 15. SCALABILITY STRATEGY */}
              <div id="wp-sec-15">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">15. Scalability Strategy</h3>
                <p>
                  To manage the high transaction throughput required for real-time commerce and spatial coordinate updates, Million Mint implements a progressive scalability roadmap:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">EVM Deployment (Current):</strong> Rapid deployment and integration with existing EVM chains to tap into deep liquidity and established security.
                  </li>
                  <li>
                    <strong className="text-white">Layer-2 Rollup (2027-2028):</strong> Migration to a custom zero-knowledge (ZK) rollup to support near-zero gas fees for coordinate edits and micro-transactions.
                  </li>
                  <li>
                    <strong className="text-white">Sovereign Layer-1 (2028-2030):</strong> The launch of the **Million Mint Network (MMN)**, a custom Proof-of-Stake chain optimized specifically for digital property registers.
                  </li>
                </ul>
              </div>

              {/* 16. SECURITY PRINCIPLES */}
              <div id="wp-sec-16">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">16. Security Principles</h3>
                <p>
                  The platform operates under a zero-trust architecture. All state updates, asset ownership changes, and voting outputs are verified cryptographically. Smart contracts are designed to be simple, clean, and fully audited, reducing the attack surface. Private keys remain with the user at all times, securing self-sovereign control.
                </p>
              </div>

              {/* 17. EVOLUTION PATH */}
              <div id="wp-sec-17">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">17. Evolution Path</h3>
                <p>
                  Million Mint's long-term lifecycle is structured to guide the ecosystem toward native chain independence:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">2026–2027 (Ecosystem Core):</strong> Focuses on launching the core $MMINT token, coordinate deeds register, and developer toolkits.
                  </li>
                  <li>
                    <strong className="text-white">2027–2028 (L2 & Bridges):</strong> Activates custom rollups and cross-chain asset bridges to lower transaction costs and expand accessibility.
                  </li>
                  <li>
                    <strong className="text-white">2028–2030 (Sovereign Mainnet):</strong> Launches the Million Mint Network L1 Mainnet, validator pool staking, and complete DAO management hand-over.
                  </li>
                </ul>
              </div>

              {/* 18. CONCLUSION */}
              <div id="wp-sec-18">
                <h3 className="text-base font-bold text-[#00ffc8] border-b border-[rgba(255,255,255,0.06)] pb-2 mb-3">18. Conclusion</h3>
                <p>
                  Million Mint is more than a virtual layout. It is a technical framework for decentralized human organization, digital property rights, and composable commercial systems. By uniting 3D spatial computing with robust cryptographic ledgers and democratic quadratic governance, Million Mint establishes a solid foundation for the sovereign digital civilizations of tomorrow. We invite developers, creators, and visionaries to join founder Kalyan Chowdary in building this next-generation decentralized ecosystem.
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
