"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { GlassModule } from "../../../components/GlassModule";
import { supabase } from "../../../lib/supabase";

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

interface WaitlistEntry {
  email: string;
  name?: string | null;
  x_username?: string | null;
  telegram_username?: string | null;
  created_at: string;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Metrics
  const [stats, setStats] = useState({
    total: 0,
    hasX: 0,
    hasTelegram: 0,
    hasBoth: 0,
  });

  const loadEntries = async () => {
    setIsLoading(true);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("airdrop_waitlist")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          setEntries(data);
          computeMetrics(data);
          setIsFallbackMode(false);
        } else {
          throw error || new Error("Failed to fetch data");
        }
      } catch (err) {
        console.warn("Could not query Supabase waitlist, loading from localStorage:", err);
        loadLocalEntries();
      }
    } else {
      loadLocalEntries();
    }
    setIsLoading(false);
  };

  const loadLocalEntries = () => {
    setIsFallbackMode(true);
    const localData = localStorage.getItem("mm_airdrop_waitlist");
    if (localData) {
      try {
        const data = JSON.parse(localData);
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setEntries(sorted);
          computeMetrics(sorted);
        }
      } catch (e) {
        console.error("Failed to parse local waitlist data:", e);
      }
    } else {
      // Set some initial sample mock data if local storage is completely empty
      const sampleData: WaitlistEntry[] = [
        { email: "explorer.one@genesis.io", name: "Alpha Leader", x_username: "alpha_lead", telegram_username: "alpha_tg", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { email: "sol.explorer@block.com", name: "Sola Miner", x_username: "sol_miner", telegram_username: null, created_at: new Date(Date.now() - 3600000 * 4).toISOString() },
        { email: "nebula.space@mint.com", name: null, x_username: null, telegram_username: "nebula_tg", created_at: new Date(Date.now() - 3600000 * 6).toISOString() }
      ];
      localStorage.setItem("mm_airdrop_waitlist", JSON.stringify(sampleData));
      setEntries(sampleData);
      computeMetrics(sampleData);
    }
  };

  const computeMetrics = (data: WaitlistEntry[]) => {
    let hasX = 0;
    let hasTelegram = 0;
    let hasBoth = 0;

    data.forEach(entry => {
      const x = !!entry.x_username;
      const tg = !!entry.telegram_username;
      if (x) hasX++;
      if (tg) hasTelegram++;
      if (x && tg) hasBoth++;
    });

    setStats({
      total: data.length,
      hasX,
      hasTelegram,
      hasBoth
    });
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleResetLocal = () => {
    if (confirm("Are you sure you want to clear all mock registrations in local storage?")) {
      localStorage.removeItem("mm_airdrop_waitlist");
      loadLocalEntries();
    }
  };

  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    return (
      entry.email.toLowerCase().includes(query) ||
      (entry.name || "").toLowerCase().includes(query) ||
      (entry.x_username || "").toLowerCase().includes(query) ||
      (entry.telegram_username || "").toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-black text-white relative">
      
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

      {/* ── DOM CONTENT OVERLAY ── */}
      <div className="scroll-wrapper pt-32 pb-20">
        <div className="px-4 w-full flex justify-center">
          <GlassModule className="max-w-[1100px] pointer-events-auto">
            
            <div className="eyebrow">Database Controller // Waitlist Panel</div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800/60 pb-6 mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold font-['Bebas_Neue'] text-white tracking-[2px] uppercase">
                  Waitlist Admin Dashboard
                </h1>
                <p className="text-xs font-mono text-zinc-500 mt-1">
                  Ecosystem Airdrop Registration Logs
                </p>
              </div>

              {isFallbackMode ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1.5 rounded">
                    ⚙️ PERSISTENCE: LOCAL STORAGE FALLBACK
                  </span>
                  <button
                    onClick={handleResetLocal}
                    className="text-[10px] font-mono border border-red-500/30 hover:border-red-500 bg-red-950/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Clear Mock Data
                  </button>
                </div>
              ) : (
                <span className="text-[10px] font-mono bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] px-3 py-1.5 rounded">
                  🟢 DATABASE CONNECTED: SUPABASE
                </span>
              )}
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border border-zinc-800 bg-black/40 rounded text-center font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Total Signups</span>
                <strong className="text-2xl text-[#f5c842] mt-1 block">{stats.total}</strong>
              </div>
              <div className="p-4 border border-zinc-800 bg-black/40 rounded text-center font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Linked X Accounts</span>
                <strong className="text-2xl text-white mt-1 block">
                  {stats.hasX} <span className="text-xs text-zinc-500">({stats.total > 0 ? Math.round((stats.hasX / stats.total) * 100) : 0}%)</span>
                </strong>
              </div>
              <div className="p-4 border border-zinc-800 bg-black/40 rounded text-center font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Linked Telegram</span>
                <strong className="text-2xl text-white mt-1 block">
                  {stats.hasTelegram} <span className="text-xs text-zinc-500">({stats.total > 0 ? Math.round((stats.hasTelegram / stats.total) * 100) : 0}%)</span>
                </strong>
              </div>
              <div className="p-4 border border-zinc-800 bg-black/40 rounded text-center font-mono">
                <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Linked Both</span>
                <strong className="text-2xl text-[#00ffc8] mt-1 block">
                  {stats.hasBoth} <span className="text-xs text-zinc-500">({stats.total > 0 ? Math.round((stats.hasBoth / stats.total) * 100) : 0}%)</span>
                </strong>
              </div>
            </div>

            {/* Search filter */}
            <div className="mb-6 font-mono text-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search entries by Name, Email, or Social handle..."
                className="w-full bg-black border border-zinc-800 text-white p-3.5 rounded focus:outline-none focus:border-[#00ffc8] transition-colors"
              />
            </div>

            {/* Submissions Table */}
            <div className="border border-zinc-800 rounded bg-black/40 overflow-hidden font-mono text-xs">
              {isLoading ? (
                <div className="p-12 text-center text-zinc-500">
                  <span className="inline-block w-6 h-6 border-2 border-[#00ffc8] border-t-transparent rounded-full animate-spin mb-3"></span>
                  <div>FETCHING DATABASE REGISTRY...</div>
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  NO explorational entries found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-zinc-500 uppercase tracking-widest text-[9px]">
                        <th className="p-4">Submission Date</th>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email Address</th>
                        <th className="p-4">X Username</th>
                        <th className="p-4">Telegram</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredEntries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-zinc-900/30 transition-colors text-zinc-300">
                          <td className="p-4 text-zinc-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="p-4 font-bold text-white">
                            {entry.name || "-"}
                          </td>
                          <td className="p-4">
                            {entry.email}
                          </td>
                          <td className="p-4 text-[#00ffc8]">
                            {entry.x_username ? `@${entry.x_username}` : "-"}
                          </td>
                          <td className="p-4 text-[#0088ff]">
                            {entry.telegram_username ? `@${entry.telegram_username}` : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Back button */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60 flex justify-between items-center">
              <button 
                onClick={loadEntries}
                className="font-mono text-[10px] text-[#00ffc8] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                🔄 Refresh Logs
              </button>
              <a href="/" className="btn-gold !mt-0 !py-2.5 !px-8 text-xs">
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
