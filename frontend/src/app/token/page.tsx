"use client";

import React from "react";
import { GlassModule } from "../../components/GlassModule";

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

export default function TokenPage() {
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
          <a href="/token" className="opacity-100 text-[#00ffc8]">TOKEN</a>
          <a href="/whitepaper">WHITEPAPER</a>
          <a href="/founder">FOUNDER</a>
        </div>
      </nav>

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Economic Specification // Tokenomics</div>
            <h1 className="section-title text-center text-white mb-8" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              MMINT TOKEN ECOSYSTEM
            </h1>

            <div className="space-y-10 font-mono text-sm leading-relaxed text-zinc-300">
              
              {/* SECTION 1: CORE SPECIFICATIONS */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">1. Token Metadata & Design</h2>
                <p>
                  The native cryptographic asset of the Million Mint civilization ecosystem is the **Million Mint Token ($MMINT)**. The asset is designed to serve as the unified pricing, utility, and governance mechanism across all connected virtual worlds.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-zinc-400">
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/2">
                    <span className="text-xs block text-zinc-500">ASSET NAME</span>
                    <strong className="text-white text-base">Million Mint</strong>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/2">
                    <span className="text-xs block text-zinc-500">TICKER SYMBOL</span>
                    <strong className="text-white text-base">$MMINT</strong>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/2">
                    <span className="text-xs block text-zinc-500">TOTAL SUPPLY</span>
                    <strong className="text-[#f5c842] text-base">1,000,000,000</strong>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)] bg-white/2">
                    <span className="text-xs block text-zinc-500">DECIMALS</span>
                    <strong className="text-white text-base">18</strong>
                  </div>
                </div>
                <p className="mt-6 text-zinc-400">
                  $MMINT features a strictly **Fixed Supply** model. The smart contracts do not include any minting mechanisms, ensuring that no additional tokens can ever be created. This protects the ecosystem from long-term supply inflation.
                </p>
              </div>

              {/* SECTION 2: UTILITY MATRIX */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">2. Core Utility Loops</h2>
                <p>
                  To secure economic sustainability, $MMINT is tightly integrated with every system action. It is not merely a speculative asset, but the operational gas and asset-minting currency of our digital civilization:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">A. Land Acquisition</h3>
                    <p className="text-xs text-zinc-400">
                      Purchasing or leasing raw planetary coordinates requires staking or spending $MMINT. Staked tokens are locked to guarantee land deeds.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">B. Marketplace Fees</h3>
                    <p className="text-xs text-zinc-400">
                      Transactions in the NFT marketplace (spacecraft trading, structural templates, raw resources) use $MMINT, with a small percentage routed to a burn mechanism.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">C. Planet Development</h3>
                    <p className="text-xs text-zinc-400">
                      Terraforming, building, and running commercial planetary assets (like asteroid mining drills and orbital warehouses) require active $MMINT consumption.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">D. Node Staking</h3>
                    <p className="text-xs text-zinc-400">
                      Validators and node operators stake $MMINT to secure state validation networks, earning block rewards and transaction fees.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">E. DAO Governance</h3>
                    <p className="text-xs text-zinc-400">
                      $MMINT provides voting weight in the planetary and global DAOs, allowing holders to direct treasury funds and decide critical code upgrades.
                    </p>
                  </div>
                  <div className="p-4 border border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-white font-bold mb-2">F. Creator Incentives</h3>
                    <p className="text-xs text-zinc-400">
                      A dedicated pool distributes $MMINT to creators who design popular assets, drive traffic, or build virtual communities.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: TOKEN DISTRIBUTION */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#0088ff] uppercase tracking-wider mb-4">3. Token Allocation & Supply Metrics</h2>
                <p>
                  Our distribution model is structured to align incentives across long-term developers, strategic investors, validators, and creators, while reserving a substantial portion for community growth and decentralized governance.
                </p>
                <div className="mt-6 overflow-x-auto">
                  <table className="comp-table">
                    <thead>
                      <tr>
                        <th>Allocation Pool</th>
                        <th>Percentage</th>
                        <th>Token Amount</th>
                        <th>Vesting & Release Schedule</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-white font-bold">Community & Ecosystem</td>
                        <td className="text-[#00ffc8] font-bold">35%</td>
                        <td>350,000,000 MMINT</td>
                        <td>Distributed via creator rewards, dev grants, and community campaigns.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">DAO Treasury</td>
                        <td className="text-[#00ffc8] font-bold">20%</td>
                        <td>200,000,000 MMINT</td>
                        <td>Under direct control of the DAO; unlocked via community proposals.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">Founder & Team</td>
                        <td className="text-[#00ffc8] font-bold">15%</td>
                        <td>150,000,000 MMINT</td>
                        <td>12-month cliff, followed by 48-month linear monthly vesting.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">Staking Rewards</td>
                        <td className="text-[#00ffc8] font-bold">15%</td>
                        <td>150,000,000 MMINT</td>
                        <td>Distributed programmatically to validators and delegators over 10 years.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">Strategic Partners</td>
                        <td className="text-[#00ffc8] font-bold">5%</td>
                        <td>50,000,000 MMINT</td>
                        <td>6-month cliff, followed by 24-month linear monthly vesting.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">Liquidity Pool</td>
                        <td className="text-[#00ffc8] font-bold">5%</td>
                        <td>50,000,000 MMINT</td>
                        <td>Fully unlocked at TGE for exchange liquidity depth.</td>
                      </tr>
                      <tr>
                        <td className="text-white font-bold">Marketing & Growth</td>
                        <td className="text-[#00ffc8] font-bold">5%</td>
                        <td>50,000,000 MMINT</td>
                        <td>36-month controlled release for marketing outreach campaigns.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: GOVERNANCE & VOTING MODEL */}
              <div>
                <h2 className="text-xl font-bold text-[#7a22ff] uppercase tracking-wider mb-4">4. Governance Stages & Quadratic Voting</h2>
                <p>
                  To secure democratic sovereignty and avoid central accumulation of power, Million Mint implements a multi-stage progressive decentralization roadmap alongside **Quadratic Voting**:
                </p>
                <div className="space-y-6 mt-6">
                  <div className="p-5 border border-[rgba(255,255,255,0.06)] bg-white/1">
                    <h4 className="text-white font-bold uppercase mb-2">Stage 1: Foundation Governance (Launch Phase)</h4>
                    <p className="text-xs text-zinc-400">
                      The Foundation acts as a steward, coordinating critical audits, setting initial validator parameters, and executing safety hotfixes. Multisig control is held by founder Kalyan Chowdary and early developers.
                    </p>
                  </div>
                  <div className="p-5 border border-[rgba(255,255,255,0.06)] bg-white/1">
                    <h4 className="text-white font-bold uppercase mb-2">Stage 2: Community Governance (Phase 2)</h4>
                    <p className="text-xs text-zinc-400">
                      Staking pools and property coordinates register voting signatures. Token holders gain the ability to submit binding proposals regarding local planetary tax structures, marketplace upgrades, and minor treasury disbursements.
                    </p>
                  </div>
                  <div className="p-5 border border-[rgba(255,255,255,0.06)] bg-white/1">
                    <h4 className="text-white font-bold uppercase mb-2">Stage 3: Full DAO Governance (Phase 3 & 4)</h4>
                    <p className="text-xs text-zinc-400">
                      All system parameters, validator allocations, treasury assets, and platform upgrades are completely managed on-chain by the global DAO. The Foundation's keys are burned, establishing absolute self-governance.
                    </p>
                  </div>
                </div>
                
                <h4 className="text-white font-bold uppercase mt-8 mb-2">Quadratic Voting Mechanics:</h4>
                <p className="text-zinc-400">
                  Traditional voting models operate on a simple 1 Token = 1 Vote rule. This permits massive token holders (whales) to dictate project outcomes, disenfranchising active creators. 
                </p>
                <p className="mt-4 text-zinc-400">
                  Million Mint uses **Quadratic Voting (QV)**. The voting weight is calculated as the **square root of the tokens committed** to a proposal. For instance:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-zinc-400">
                  <li>1 Token committed = 1 Vote</li>
                  <li>100 Tokens committed = 10 Votes</li>
                  <li>10,000 Tokens committed = 100 Votes</li>
                </ul>
                <p className="mt-4 text-zinc-400">
                  This mathematical scale ensures that the combined voice of a unified community of small builders carrying out digital commerce overrides the narrow interests of a single massive investor. This makes the civilization ecosystem highly democratic and resilient.
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
          <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">X (Twitter)</a>
          <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">Telegram</a>
          <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">GitHub</a>
          <a href="/sitemap.xml" className="hover:text-[#00ffc8] transition-colors">Sitemap</a>
        </div>
      </footer>

    </main>
  );
}
