"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { GlassModule } from "../../components/GlassModule";
import { WaitlistModal } from "../../components/WaitlistModal";

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
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

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
            
            <div className="eyebrow">Founder Profile // Kalyan Chowdary</div>
            <h1 className="section-title text-center text-white mb-2" style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
              KALYAN CHOWDARY
            </h1>
            <p className="text-center font-mono text-xs text-[#f5c842] tracking-[4px] uppercase mb-10">
              Founder of Million Mint
            </p>

            <div className="space-y-8 font-mono text-sm leading-relaxed text-zinc-300">
              
              {/* SECTION 1: WHO I AM */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">1. Who I Am</h2>
                <p>
                  Kalyan Chowdary is the founder of Million Mint. With a background in building web systems and software tools, Kalyan focuses on creating platforms that explore digital ownership and virtual economies. He is passionate about creator-first ecosystems, aiming to build tools that let users own, manage, and shape their digital assets directly without relying on centralized intermediaries.
                </p>
              </div>

              {/* SECTION 2: WHY I STARTED MILLION MINT */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">2. Why I Started Million Mint</h2>
                <p>
                  Million Mint began because Kalyan noticed a recurring problem with modern internet platforms: creators do the hard work of building value and communities, but the platforms retain absolute control over monetization, assets, and rules. Kalyan wanted to build a world where creators are the primary beneficiaries of their efforts. Million Mint is an exploration into how digital ownership and virtual economies can be open, transparent, and guided by the community itself, rather than by a single corporate entity.
                </p>
                <p className="mt-4">
                  Through his work on decentralized networks, Kalyan learned that building a successful ecosystem is not just about writing code; it is about building trust. A key lesson has been that authenticity and real, working tools are far more valuable than speculative promises. That is why Kalyan is committed to grounding Million Mint in concrete execution and designing it based on continuous community feedback.
                </p>
              </div>

              {/* SECTION 3: WHAT EXISTS TODAY */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#0088ff] uppercase tracking-wider mb-4">3. What Exists Today</h2>
                <p>
                  We believe in showing real progress. Today, the initial foundation of Million Mint is live and fully interactive:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Interactive 3D Planet Explorer:</strong> A virtual globe interface allowing supporters to select districts (Creator, Commerce, Innovation, Gaming, and Education) and inspect sample land parcels.
                  </li>
                  <li>
                    <strong className="text-white">Genesis Waitlist System:</strong> A secure registration pipeline backed by Supabase that stores explorer data permanently, with a localized client-side fallback mode if database connections are unconfigured.
                  </li>
                  <li>
                    <strong className="text-white">Admin Dashboard Panel:</strong> An internal management dashboard equipped with social handles filters, query searches, and CSV log exports to coordinate signups.
                  </li>
                  <li>
                    <strong className="text-white">Core Specification Libraries:</strong> Ready-to-read blueprints explaining platform timelines, token distributions, and system values.
                  </li>
                </ul>
              </div>

              {/* SECTION 4: CURRENT FOCUS */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#7a22ff] uppercase tracking-wider mb-4">4. Current Focus</h2>
                <p>
                  Rather than making future promises, we prioritize present-day execution. Kalyan is currently focusing on:
                </p>
                <ul className="list-disc pl-6 mt-4 space-y-2 text-zinc-400">
                  <li>
                    <strong className="text-white">Growing the Genesis Community:</strong> Engaging directly with early explorers, collecting emails, and building a foundation of aligned supporters.
                  </li>
                  <li>
                    <strong className="text-white">Refining Ecosystem Design:</strong> Working on stable utility mechanics for the $MMINT token to verify it functions smoothly for transactions and staking.
                  </li>
                  <li>
                    <strong className="text-white">Improving the Planet Explorer:</strong> Refining the Three.js rendering loops to provide smooth, high-fidelity visual rotations and coordinates selections.
                  </li>
                  <li>
                    <strong className="text-white">Refining Governance Systems:</strong> Developing clean voting models (such as quadratic voting) to protect the community from unequal centralization.
                  </li>
                  <li>
                    <strong className="text-white">Collecting Feedback:</strong> Testing concepts with developers and builders to ensure the tools we create solve genuine creator problems.
                  </li>
                </ul>
              </div>

              {/* SECTION 5: JOIN THE JOURNEY */}
              <div className="border-b border-[rgba(255,255,255,0.06)] pb-8">
                <h2 className="text-xl font-bold text-[#00ffc8] uppercase tracking-wider mb-4">5. Join the Journey</h2>
                <p>
                  Building a new digital environment is a collaborative effort, and early feedback is vital. We invite you to get involved today:
                </p>
                <ul className="list-decimal pl-6 mt-4 space-y-3 text-zinc-400 font-mono text-xs">
                  <li className="pl-2">
                    <button 
                      onClick={() => setIsWaitlistOpen(true)} 
                      className="text-left hover:text-[#00ffc8] transition-colors cursor-pointer focus:outline-none"
                    >
                      <strong className="text-white underline">Join the Genesis Waitlist:</strong> Register your email to receive future ecosystem update logs and potential early rewards announcements.
                    </button>
                  </li>
                  <li className="pl-2">
                    <a href="/planet/genesis" className="hover:text-[#00ffc8] transition-colors">
                      <strong className="text-white underline">Explore the Genesis Planet:</strong> Visit the 3D globe interface to rotate and inspect coordinate zones.
                    </a>
                  </li>
                  <li className="pl-2">
                    <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">
                      <strong className="text-white underline">Follow Project Updates:</strong> Follow our official X / Twitter profile for real-time announcements.
                    </a>
                  </li>
                  <li className="pl-2">
                    <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">
                      <strong className="text-white underline">Participate in Discussions:</strong> Review code templates, open issues, and contribute on our public GitHub repository.
                    </a>
                  </li>
                </ul>
              </div>

              {/* SECTION 6: PERSONAL STATEMENT */}
              <div>
                <h2 className="text-xl font-bold text-[#f5c842] uppercase tracking-wider mb-4">6. Personal Statement</h2>
                <blockquote className="border-l-2 border-[#f5c842] pl-4 italic text-zinc-400 my-6">
                  "For too long, the internet has operated on a landlord-tenant model where creators build value, only to be controlled by centralized platforms. Million Mint is an experiment in authentic digital ownership and community governance. Grounded in concrete execution, we invite you to explore this next generation of virtual systems with us."
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

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />

    </main>
  );
}
