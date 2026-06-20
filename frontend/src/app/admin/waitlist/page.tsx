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
  const [socialFilter, setSocialFilter] = useState<"all" | "x" | "telegram" | "both" | "none">("all");
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDev, setIsDev] = useState(false);

  // Metrics
  const [stats, setStats] = useState({
    total: 0,
    hasX: 0,
    hasTelegram: 0,
    hasBoth: 0,
  });

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === "development");
  }, []);

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
        setEntries([]);
        computeMetrics([]);
      }
    } else {
      setEntries([]);
      computeMetrics([]);
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
    if (confirm("Are you sure you want to clear all registrations in local storage?")) {
      localStorage.removeItem("mm_airdrop_waitlist");
      loadLocalEntries();
    }
  };

  const handleExportCSV = () => {
    if (entries.length === 0) {
      alert("No registrations available to export.");
      return;
    }

    const headers = ["Submission Date", "Name", "Email Address", "X Username", "Telegram Username"];
    const rows = entries.map(entry => [
      new Date(entry.created_at).toISOString(),
      entry.name || "",
      entry.email,
      entry.x_username ? `@${entry.x_username}` : "",
      entry.telegram_username ? `@${entry.telegram_username}` : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mm_waitlist_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      entry.email.toLowerCase().includes(query) ||
      (entry.name || "").toLowerCase().includes(query) ||
      (entry.x_username || "").toLowerCase().includes(query) ||
      (entry.telegram_username || "").toLowerCase().includes(query);

    if (!matchesSearch) return false;

    const hasX = !!entry.x_username;
    const hasTG = !!entry.telegram_username;

    if (socialFilter === "x") return hasX;
    if (socialFilter === "telegram") return hasTG;
    if (socialFilter === "both") return hasX && hasTG;
    if (socialFilter === "none") return !hasX && !hasTG;

    return true;
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
                  {isDev && (
                    <>
                      <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-3 py-1.5 rounded">
                        ⚙️ PERSISTENCE: LOCAL STORAGE FALLBACK
                      </span>
                      <button
                        onClick={handleResetLocal}
                        className="text-[10px] font-mono border border-red-500/30 hover:border-red-500 bg-red-950/20 hover:bg-red-900/40 text-red-400 px-3 py-1.5 rounded transition-all cursor-pointer uppercase tracking-wider"
                      >
                        Clear Local Registrations
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <span className="text-[10px] font-mono bg-[#00ffc8]/10 border border-[#00ffc8]/30 text-[#00ffc8] px-3 py-1.5 rounded">
                  🟢 DATABASE CONNECTED: SUPABASE
                </span>
              )}
            </div>

            {isDev && isFallbackMode && (
              <div className="mb-6 text-[10px] font-mono bg-yellow-950/20 border border-yellow-900/40 text-yellow-400 p-4 rounded">
                ⚠️ [DEV WARNING] Supabase is unconfigured or unavailable. Admin panel is running in localStorage fallback mode. Mock data seeding is disabled.
              </div>
            )}

            {/* Metrics cards */}
            {(!isFallbackMode || isDev) ? (
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
            ) : (
              <div className="bg-black/40 border border-zinc-800/50 p-6 rounded text-center mb-8 font-mono">
                <div className="text-sm font-bold text-[#f5c842] tracking-widest uppercase">
                  Ecosystem Analytics Disabled
                </div>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                  Database Connection Required for Live Metrics
                </div>
              </div>
            )}

            {/* Search filter */}
            <div className="mb-4 font-mono text-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search entries by Name, Email, or Social handle..."
                className="w-full bg-black border border-zinc-800 text-white p-3.5 rounded focus:outline-none focus:border-[#00ffc8] transition-colors"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 mb-6 font-mono text-[9px] tracking-wider">
              <span className="text-zinc-500 uppercase self-center mr-2">Filter By:</span>
              <button
                onClick={() => setSocialFilter("all")}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer uppercase ${
                  socialFilter === "all"
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-white"
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                All Explorers
              </button>
              <button
                onClick={() => setSocialFilter("x")}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer uppercase ${
                  socialFilter === "x"
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-white"
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Linked X
              </button>
              <button
                onClick={() => setSocialFilter("telegram")}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer uppercase ${
                  socialFilter === "telegram"
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-white"
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Linked Telegram
              </button>
              <button
                onClick={() => setSocialFilter("both")}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer uppercase ${
                  socialFilter === "both"
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-white"
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                Linked Both
              </button>
              <button
                onClick={() => setSocialFilter("none")}
                className={`px-3 py-1.5 rounded border transition-colors cursor-pointer uppercase ${
                  socialFilter === "none"
                    ? "border-[#00ffc8] bg-[#00ffc8]/10 text-white"
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                No Socials
              </button>
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
            <div className="mt-8 pt-6 border-t border-zinc-800/60 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-4">
                <button 
                  onClick={loadEntries}
                  className="font-mono text-[10px] text-[#00ffc8] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  🔄 Refresh Logs
                </button>
                <button 
                  onClick={handleExportCSV}
                  className="font-mono text-[10px] text-[#00ffc8] hover:text-white uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  📥 Export CSV
                </button>
              </div>
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
          <a href="https://x.com/kalyanchow369" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">X (Twitter)</a>
          <a href="https://t.me/millionmint" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">Telegram</a>
          <a href="https://github.com/kalyanastin/million-mint-ai-terminal" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ffc8] transition-colors">GitHub</a>
          <a href="/sitemap.xml" className="hover:text-[#00ffc8] transition-colors">Sitemap</a>
        </div>
      </footer>

    </main>
  );
}
