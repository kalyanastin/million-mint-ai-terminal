"use client";

import React, { useState, useEffect, useRef } from "react";
import { GlassModule } from "../components/GlassModule";
import { WaitlistModal } from "../components/WaitlistModal";
import { useSpace } from "../context/SpaceContext";
import { cosAudio } from "../utils/AudioEngine";
import { getMilestoneForYear } from "../utils/WorldData";
import { DESIGN_TOKENS } from "../utils/DesignTokens";

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
  const [terminalInput, setTerminalInput] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);
  const [cosState, setCosState] = useState<string>("Nominal");
  const [isMuted, setIsMuted] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Terminal logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Consume space context
  const {
    explorerMode,
    setExplorerMode,
    activeLayer,
    setActiveLayer,
    hoveredAsset,
    selectedAsset,
    setSelectedAsset,
    year,
    setYear
  } = useSpace();

  // Procedural dynamic economy statistics
  const [economy, setEconomy] = useState({
    cargoShips: 12,
    energyGrid: 1.2,
    population: 180,
    miningYield: 0.0
  });

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  // AI Companion boot-up log sync sequence on mount (satisfies AAA intro spec)
  useEffect(() => {
    const bootSteps = [
      { log: "COS INITIALIZATION SEQUENCER INITIATED...", brief: "COS Initializing..." },
      { log: "SYNCHRONIZING ORBITAL LOGISTICS LANES...", brief: "Synchronizing Logistics..." },
      { log: "SYNCHRONIZING MOON SCIENCE COMPUTATION ARRAYS...", brief: "Synchronizing Research..." },
      { log: "SYNCHRONIZING HELIOS MINING EXTRACTION CORRIDORS...", brief: "Synchronizing Energy..." },
      { log: "SYNCHRONIZING POPULATION SECTOR REGISTRIES...", brief: "Synchronizing Population..." },
      { log: "SYNCHRONIZING COMMERCE NETWORK CHANNELS...", brief: "Synchronizing Trade..." },
      { log: "SYSTEM SYNCHRONIZATION COMPLETE. Welcome Explorer.", brief: "Welcome Explorer. The Civilization Operating System is online." }
    ];

    if (bootProgress < bootSteps.length) {
      const timer = setTimeout(() => {
        const step = bootSteps[bootProgress];
        addLog(step.log);
        setAiBriefing(step.brief);
        // Synthesize high-pass audio tick for loading logs feedback
        cosAudio.playHoverTick();
        setBootProgress(prev => prev + 1);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [bootProgress]);

  // Dynamic economy tick loop (Fluctuates around timeline values)
  useEffect(() => {
    if (bootProgress < 7) return;

    const timer = setInterval(() => {
      setEconomy(prev => {
        const shipDelta = Math.random() > 0.5 ? 1 : -1;
        const energyDelta = (Math.random() - 0.5) * 0.15;
        const popDelta = Math.floor(Math.random() * 5) + 1;
        const miningDelta = Math.random() * 1.5;

        return {
          cargoShips: Math.max(12, Math.min(600, prev.cargoShips + shipDelta)),
          energyGrid: Math.max(0.5, parseFloat((prev.energyGrid + energyDelta).toFixed(2))),
          population: prev.population + popDelta,
          miningYield: parseFloat((prev.miningYield + miningDelta).toFixed(1))
        };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [bootProgress]);

  // Lock body scroll when Explorer Mode is active
  useEffect(() => {
    if (explorerMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [explorerMode]);

  // Handle timeline years comments from the AI Advisor
  const [aiBriefing, setAiBriefing] = useState<string>("COS INITIALIZING...");

  // Auto-scroll terminal log to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  // Decades-based timeline alerts utilizing Versioned World Data
  useEffect(() => {
    if (bootProgress < 7) return;

    const milestone = getMilestoneForYear(year);
    
    // Update economy base stats based on target decade
    setEconomy({
      cargoShips: milestone.stats.cargoShips,
      energyGrid: milestone.stats.energyGrid,
      population: milestone.stats.population,
      miningYield: milestone.stats.miningYield
    });

    if (!explorerMode) {
      setAiBriefing(`Advisor Log [${year}]: ${milestone.subtitle} - ${milestone.description}`);
    }
  }, [year, explorerMode, bootProgress]);

  // Update advisor briefing upon hovering/selecting items in Explorer Mode
  useEffect(() => {
    if (hoveredAsset) {
      setAiBriefing(`Scanning Sol-Telemetry: ${hoveredAsset.name} [Sector ID: ${hoveredAsset.id.toUpperCase()}]. Faction: ${hoveredAsset.faction}. Threat classification: NONE.`);
    }
  }, [hoveredAsset]);

  useEffect(() => {
    if (selectedAsset) {
      setAiBriefing(`Scan report locked on ${selectedAsset.name}. population: ${selectedAsset.population.toLocaleString()} citizens, Power Draw: ${selectedAsset.powerDraw} GW. Core materials: ${selectedAsset.materials.join(", ")}.`);
    }
  }, [selectedAsset]);

  // Sound toggle button callback
  const handleToggleSound = () => {
    const muted = cosAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      cosAudio.playClickChime();
    }
  };

  // COS Event Loop (Trigger events every 22 seconds)
  useEffect(() => {
    if (bootProgress < 7) return;

    const events = [
      {
        name: "Solar Flare Warning",
        state: "Emergency",
        log: "ALERT: High energy solar flare sweep detected. Magnetospheric shields charging to maximum load.",
        action: () => {
          setIsGlitching(true);
          cosAudio.playEmergencyAlarm(); // Trigger sweep alarm frequency siren
          setTimeout(() => setIsGlitching(false), 3000);
          setAiBriefing("Tactical Anomaly: High radiation solar sweep. Temporary deflectors capacity peaking at 92.4%.");
        }
      },
      {
        name: "Mining Node Cleared",
        state: "Construction",
        log: "HELIOS MINING: Platinum ore block fully mined at Asteroid Vesta. Drones returning to depot.",
        action: () => {
          cosAudio.playRadioChatterBurst();
        }
      },
      {
        name: "Warp Core Test Ignition",
        state: "High Demand",
        log: "WARP GATEWAY: Ignition pulses recorded. Magnetic containment rings charging (98.5%).",
        action: () => {
          cosAudio.playWarpChargeSweep();
        }
      },
      {
        name: "Research Achievement",
        state: "Research Boost",
        log: "RESEARCH NET: Antimatter acceleration stability benchmark achieved. Shield efficiency boosted by 15%.",
        action: () => {
          cosAudio.playRadioChatterBurst();
        }
      }
    ];

    const eventInterval = setInterval(() => {
      const ev = events[Math.floor(Math.random() * events.length)];
      setCosState(ev.state);
      addLog(ev.log);
      ev.action();
    }, 22000);

    return () => clearInterval(eventInterval);
  }, [bootProgress]);

  // Command submit logic for terminal
  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.toLowerCase().trim();
    addLog(`explorer@cos:~$ ${terminalInput}`);
    setTerminalInput("");

    if (cmd === "help") {
      addLog("DIRECTIVE COMMANDS: help, scan, diagnostic, flare, warp test, clear");
    } else if (cmd === "scan") {
      addLog("ORBITAL BLUEPRINT SCAN ACTIVE... SECTOR LINKS SYNCED.");
      setAiBriefing("System scan lock active. Select any 3D asset or network route to query telemetry metrics.");
    } else if (cmd === "diagnostic") {
      addLog(`SYSTEM LOG: STATE=${cosState.toUpperCase()} // TELEMETRY CORRIDORS NOMINAL // ACTIVE GRID DRAW=${economy.energyGrid} TW`);
    } else if (cmd === "flare") {
      addLog("WARNING: DIRECTIVE FLUX FLUID FLUID FLIGHT ANOMALY TRIGGERED.");
      setCosState("Emergency");
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 3000);
      setAiBriefing("Warning: Radiation solar sweep triggered. Energy grids switching to containment mode.");
    } else if (cmd === "warp test") {
      addLog("INITIATING WARP CORE INITIATION PATTERNS... LOCKING CORRIDORS.");
      setCosState("High Demand");
      setAiBriefing("Warp Core Ignition: Containment fields locked. Transit ships coordinates updating.");
    } else if (cmd === "clear") {
      setTerminalLogs([]);
    } else {
      addLog(`ERR: CODE INSTRUCTION '${cmd}' NOT REGISTERED. TYPE 'help' FOR LIST.`);
    }
  };

  const handleDescend = () => {
    document.getElementById("earth-orbit")?.scrollIntoView({ behavior: "smooth" });
  };

  // Available visualization layers matching project specs
  const layerList = [
    { id: "normal", label: "Normal Spectrum" },
    { id: "infrastructure", label: "Infrastructure Grid" },
    { id: "energy", label: "Energy Flux Grid" },
    { id: "transportation", label: "Transit Routes" },
    { id: "research", label: "Research Nodes" },
    { id: "mining", label: "Helios Mining" },
    { id: "trade", label: "MMINT Shipyards" },
    { id: "population", label: "Colony Hubs" }
  ];

  return (
    <main className={`min-h-screen bg-black text-white relative transition-all duration-300 ${isGlitching ? "cos-glitch-active" : ""}`}>
      
      {/* ── PERSISTENT HUD NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto backdrop-blur-sm border-b border-white/5">
        <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity" onClick={(e) => { e.preventDefault(); setExplorerMode(false); }}>
          <NavLogo />
        </a>
        
        {/* Right Nav Options */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex nav-links">
            <a href="/about" className="text-xs tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">ABOUT</a>
            <a href="/planet/genesis" className="text-xs tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">PLANETS</a>
            <a href="/roadmap" className="text-xs tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">ROADMAP</a>
            <a href="/token" className="text-xs tracking-widest text-zinc-400 hover:text-white uppercase transition-colors">TOKEN</a>
            <a href="/whitepaper" className="text-xs tracking-widest text-zinc-400 hover:text-white uppercase transition-colors font-mono">WHITEPAPER</a>
          </div>

          {/* Mode Switcher pill */}
          <div className="flex border border-[#00ffc8]/30 rounded-full p-1 bg-black/60 backdrop-blur-md items-center gap-1">
            <button
              onClick={() => setExplorerMode(false)}
              className={`px-3 py-1 text-[9px] tracking-widest font-mono uppercase rounded-full transition-all duration-300 ${!explorerMode ? "bg-[#00ffc8] text-black font-bold shadow-md shadow-[#00ffc8]/20" : "text-[#00ffc8] hover:bg-[#00ffc8]/10"}`}
            >
              Cruise
            </button>
            <button
              onClick={() => {
                setExplorerMode(true);
                addLog("EXPLORER MODE INITIALIZED. MOUSE AND RAYCAST TARGETING SYSTEM ENGAGED.");
              }}
              className={`px-3 py-1 text-[9px] tracking-widest font-mono uppercase rounded-full transition-all duration-300 ${explorerMode ? "bg-[#00ffc8] text-black font-bold shadow-md shadow-[#00ffc8]/20" : "text-[#00ffc8] hover:bg-[#00ffc8]/10"}`}
            >
              Explorer
            </button>
          </div>

          {/* Sound Toggle Widget */}
          <button
            onClick={handleToggleSound}
            className="cos-interactive p-1.5 border border-[#00ffc8]/20 hover:border-[#00ffc8]/40 hover:bg-[#00ffc8]/5 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v6a3 3 0 0 0 3 3h1.586a1 1 0 0 0 .707-.293l5.414-5.414A1 1 0 0 0 19 11.586V4.414a1 1 0 0 0-1.707-.707L14 7"></path>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ffc8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── EXCLUSIVE EXPLORER MODE OPERATION HUD OVERLAY ── */}
      {explorerMode && (
        <div className="cos-overlay pointer-events-none">
          
          {/* Target lock bounding box overlay */}
          {hoveredAsset && !hoveredAsset.behind && (
            <div
              className="scan-locked-box"
              style={{
                left: `${hoveredAsset.screenX}px`,
                top: `${hoveredAsset.screenY}px`
              }}
            >
              <div className="scan-locked-label">
                {hoveredAsset.name}
              </div>
            </div>
          )}

          {/* 1. TOP STATUS / STATS TICKER HUD */}
          <div className="fixed top-20 left-6 right-6 z-40 flex flex-wrap justify-between items-start gap-4">
            
            {/* Year & Anomaly Status */}
            <div className="cos-interactive bg-black/85 border border-white/5 backdrop-blur-md px-4 py-2 rounded font-mono flex items-center gap-6 shadow-2xl">
              <div>
                <span className="text-[9px] text-zinc-500 block leading-none">TIMELINE SYNCHRONIZER</span>
                <span className="text-lg font-bold text-white tracking-widest">YEAR {year}</span>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div>
                <span className="text-[9px] text-zinc-500 block leading-none">SYSTEM STATUS</span>
                <span className="text-xs font-semibold text-[#00ffc8] flex items-center gap-1.5 mt-0.5 uppercase">
                  <span className={`status-indicator ${cosState === "Emergency" ? "status-alert" : cosState === "Nominal" ? "status-nominal" : "status-warning"}`} />
                  {cosState}
                </span>
              </div>
            </div>

            {/* Simulated Live Ticking stats */}
            <div className="cos-interactive bg-black/85 border border-white/5 backdrop-blur-md px-4 py-2 rounded font-mono grid grid-cols-4 gap-6 shadow-2xl">
              <div>
                <span className="text-[9px] text-zinc-500 block">CARGO SHIPS</span>
                <span className="text-xs font-bold text-white">{economy.cargoShips}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block">GRID LOAD</span>
                <span className="text-xs font-bold text-white">{economy.energyGrid} TW</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block">POPULATION</span>
                <span className="text-xs font-bold text-white">{economy.population.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 block">MINING YIELD</span>
                <span className="text-xs font-bold text-[#00ffc8]">{economy.miningYield} t/d</span>
              </div>
            </div>
          </div>

          {/* 2. LEFT SIDE LAYER SELECTOR PANEL */}
          <div className="fixed left-6 top-[150px] z-40 w-[240px] hidden md:block">
            <div className="cos-layer-selector cos-interactive">
              <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase mb-2 block">Civilization Layers</span>
              <div className="flex flex-col gap-1.5">
                {layerList.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setActiveLayer(layer.id);
                      addLog(`VISUALIZATION LAYER SWITCHED: ${layer.label.toUpperCase()}`);
                    }}
                    className={`cos-layer-btn ${activeLayer === layer.id ? "active" : ""}`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. RIGHT SIDE OPERATIONAL SIDEBAR PANEL */}
          <div className="fixed right-6 top-[150px] z-40 hidden md:block">
            <div className="cos-sidebar cos-interactive shadow-2xl">
              
              <div className="cos-sidebar-header">
                <span className="text-[10px] text-[#00ffc8] font-bold tracking-[2px] block font-mono">NODE TELEMETRY REPORT</span>
                <h3 className="cos-sidebar-title text-white mt-1">
                  {selectedAsset ? selectedAsset.name : hoveredAsset ? hoveredAsset.name : "Digital Twin Telemetry"}
                </h3>
              </div>

              <div className="cos-sidebar-content font-mono">
                {/* Default text if no asset selected */}
                {!selectedAsset && !hoveredAsset ? (
                  <div className="flex flex-col gap-4 text-xs text-zinc-400 leading-relaxed py-10 text-center">
                    <svg className="w-12 h-12 text-[#00ffc8]/30 mx-auto animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p>SYSTEM ARMED AND READY FOR TARGET SCANNING.</p>
                    <p className="text-[10px] text-zinc-500">HOVER AND CLICK ON SPACE SHIPS, PLANETS, SATELLITES, OR DOCKS IN THE CANVAS ENVIRONMENT TO LOCK-ON TELEMETRY STATIONS.</p>
                  </div>
                ) : (
                  <>
                    {/* Render specific selected asset telemetry */}
                    {(() => {
                      const data = selectedAsset || hoveredAsset;
                      if (!data) return null;
                      return (
                        <div className="flex flex-col gap-3">
                          <div className="cos-data-row">
                            <span className="cos-data-label">Classification</span>
                            <span className="cos-data-value text-[#00ffc8]">{data.type}</span>
                          </div>
                          <div className="cos-data-row">
                            <span className="cos-data-label">Faction Control</span>
                            <span className="cos-data-value">{data.faction}</span>
                          </div>
                          <div className="cos-data-row">
                            <span className="cos-data-label">Power Draw</span>
                            <span className="cos-data-value">{data.powerDraw} GW</span>
                          </div>
                          <div className="cos-data-row">
                            <span className="cos-data-label">Active population</span>
                            <span className="cos-data-value">{data.population.toLocaleString()}</span>
                          </div>
                          <div className="cos-data-row">
                            <span className="cos-data-label">Docked Shuttles</span>
                            <span className="cos-data-value">{data.dockedShips}</span>
                          </div>
                          
                          {/* Materials */}
                          <div className="mt-2">
                            <span className="text-[10px] text-zinc-500 block mb-1">REGISTERED CORE MATERIALS</span>
                            <div className="flex flex-wrap gap-1">
                              {data.materials.map((mat, idx) => (
                                <span key={idx} className="bg-white/5 border border-white/10 text-[9px] px-2 py-0.5 rounded text-zinc-300">
                                  {mat}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Custom Telemetry properties */}
                          <div className="mt-2 border-t border-white/5 pt-3">
                            <span className="text-[10px] text-zinc-500 block mb-1">SPECIFIC TELEMETRY READINGS</span>
                            <div className="flex flex-col gap-1.5 mt-2">
                              {Object.entries(data.telemetry).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-[10px]">
                                  <span className="text-zinc-500 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className="text-white font-semibold">{String(val)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Direct quick action buttons */}
                {selectedAsset && (
                  <button 
                    onClick={() => {
                      setSelectedAsset(null);
                      addLog("TACTICAL LOCK CLEARED.");
                    }}
                    className="cos-interactive mt-6 w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold text-center tracking-widest text-[#00ffc8] transition-colors rounded"
                  >
                    DISMISS SCAN DATA
                  </button>
                )}

              </div>
            </div>
          </div>

          {/* 4. BOTTOM LEFT COMMAND LOG TERMINAL */}
          <div className="fixed left-6 bottom-6 z-40 w-[360px] pointer-events-auto hidden md:block">
            <div className="cos-interactive bg-black/90 border border-white/5 rounded backdrop-blur-md p-4 shadow-2xl flex flex-col gap-3">
              <span className="text-[9px] text-[#ffd080] font-bold tracking-[1.5px] font-mono">COS COMMAND OVERRIDE DIRECTIVES</span>
              
              {/* Monospace Log Outputs */}
              <div className="cos-terminal-log font-mono flex flex-col gap-1">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight break-all">
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              {/* Console command Form */}
              <form onSubmit={handleCommand} className="flex items-center gap-2 border-t border-white/5 pt-2">
                <span className="font-mono text-zinc-500 text-xs select-none">$</span>
                <input
                  type="text"
                  placeholder="type 'help' for instructions..."
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="cos-ai-input flex-1"
                />
              </form>
            </div>
          </div>

          {/* 5. BOTTOM CENTER FLOATING AI COMPANION */}
          <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-40 w-auto md:w-[440px] pointer-events-auto">
            <div className="cos-ai-advisor cos-interactive shadow-2xl">
              
              <div className="cos-ai-header">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffc8] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ffc8]"></span>
                  </span>
                  <span className="text-[10px] tracking-[2px] font-bold font-mono text-white">MILLION MINT AI PARTNER</span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500">LINK: STABLE</span>
              </div>

              {/* AI Brief text stream */}
              <p className="text-[11px] leading-relaxed text-zinc-300 font-mono italic">
                &ldquo;{aiBriefing}&rdquo;
              </p>

              {/* Mobile Drawer Trigger Button */}
              <div className="md:hidden mt-2">
                <button
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="w-full py-1.5 bg-[#00ffc8]/10 hover:bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30 rounded text-[9px] font-bold tracking-widest uppercase transition-colors"
                >
                  {selectedAsset || hoveredAsset ? `Analyze Telemetry: ${(selectedAsset || hoveredAsset)?.name}` : "Open Telemetry Drawer"}
                </button>
              </div>

            </div>
          </div>

          {/* 6. MOBILE EXPANDABLE TELEMETRY DRAWER SHEET */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-x-0 bottom-0 z-50 bg-[#030306]/95 border-t border-white/10 backdrop-blur-xl p-6 rounded-t-xl font-mono md:hidden pointer-events-auto max-h-[75vh] overflow-y-auto shadow-2xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                <span className="text-[10px] text-[#00ffc8] font-bold tracking-[2px]">ORBITAL SYSTEM DRAWER</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white uppercase font-bold"
                >
                  Close
                </button>
              </div>

              <h3 className="text-sm font-bold text-white uppercase">
                {selectedAsset ? selectedAsset.name : hoveredAsset ? hoveredAsset.name : "System Database"}
              </h3>

              {!selectedAsset && !hoveredAsset ? (
                <div className="flex flex-col gap-2 text-xs text-zinc-400 py-6 text-center leading-relaxed">
                  <p>NO SCAN TARGET LOCKED IN GRID.</p>
                  <p className="text-[10px] text-zinc-500">TAP ON SHIPS OR PLANETS IN THE CANVAS BACKGROUND TO INITIATE NODAL ANALYSIS DOCK DIRECTIVES.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 text-xs text-zinc-300">
                  {(() => {
                    const data = selectedAsset || hoveredAsset;
                    if (!data) return null;
                    return (
                      <>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-500 uppercase">Class</span>
                          <span className="text-[#00ffc8] font-bold">{data.type}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-500 uppercase">Faction</span>
                          <span className="text-white">{data.faction}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-500 uppercase">Grid Draw</span>
                          <span className="text-white">{data.powerDraw} GW</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-zinc-500 uppercase">population</span>
                          <span className="text-white">{data.population.toLocaleString()}</span>
                        </div>

                        <div className="mt-1">
                          <span className="text-[9px] text-zinc-500 block uppercase mb-1">Materials</span>
                          <div className="flex flex-wrap gap-1">
                            {data.materials.map((mat, idx) => (
                              <span key={idx} className="bg-white/5 border border-white/10 text-[9px] px-1.5 py-0.5 rounded text-zinc-400">
                                {mat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-1 border-t border-white/5 pt-2 flex flex-col gap-1.5">
                          <span className="text-[9px] text-zinc-500 block uppercase">Telemetry Parameters</span>
                          {Object.entries(data.telemetry).map(([key, val]) => (
                            <div key={key} className="flex justify-between text-[10px] text-zinc-400">
                              <span className="uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-white font-semibold">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {selectedAsset && (
                <button 
                  onClick={() => {
                    setSelectedAsset(null);
                    setIsMobileDrawerOpen(false);
                    addLog("TACTICAL LOCK CLEARED.");
                  }}
                  className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-bold tracking-widest text-[#00ffc8] transition-colors rounded uppercase"
                >
                  Clear scan target
                </button>
              )}

            </div>
          )}
        </div>
      )}

      {/* ── STANDARD NARRATIVE CHAPTER SCROLLING CONTENT (CRUISE MODE) ── */}
      <div className={`scroll-wrapper relative z-10 transition-all duration-700 ${explorerMode ? "opacity-0 pointer-events-none scale-95" : "opacity-100 pointer-events-auto"}`}>
        
        {/* Cruise Floating Indicators */}
        <div className="fixed top-24 right-6 z-30 pointer-events-none font-mono text-right hidden md:block">
          <div className="text-zinc-600 text-[9px] tracking-widest leading-none">ORBITAL CHRONOMETER</div>
          <div className="text-white text-lg font-bold tracking-widest mt-1">YEAR {year}</div>
          <div className="text-[#00ffc8] text-[9px] tracking-[1.5px] mt-1 uppercase">
            {year >= 2200 ? "FUTURE HORIZON" : year >= 2100 ? "GATEWAY DEPLOYED" : year >= 2070 ? "SHIPYARD ACTIVE" : "COLONIZATION START"}
          </div>
        </div>

        {/* HERO SECTION */}
        <section id="hero" className="min-h-screen flex items-center justify-center pt-24">
          <div className="w-full flex justify-center text-center pointer-events-auto px-4">
            <div className="max-w-[900px] flex flex-col items-center">
              {/* Circuit "M" Vector logo */}
              <div className="mb-8 hover:scale-105 transition-transform duration-500">
                <MillionMintLogo size={190} />
              </div>

              {/* Title & Slogan */}
              <div className="eyebrow uppercase tracking-[6px] text-xs text-[#00ffc8] font-bold mb-4 font-mono">
                The First Digital Civilization
              </div>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase">
                Million Mint
              </h1>
              
              <p className="description text-center max-w-[650px] text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
                Million Mint is the browser-native operating system for humanity's first digital civilization. It is where infrastructure, economy, governance, exploration, and creators converge into a living digital twin world.
              </p>

              {/* Interaction Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={() => setIsWaitlistOpen(true)}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#00ffc8] to-[#0088ff] text-black font-bold tracking-widest text-xs uppercase rounded hover:scale-105 transition-all duration-300 shadow-lg shadow-[#00ffc8]/10"
                >
                  Request Genesis Credentials
                </button>
                <button
                  onClick={handleDescend}
                  className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono tracking-widest text-xs uppercase rounded transition-all duration-300"
                >
                  Initiate Orbital Cruise
                </button>
              </div>

              {/* Decade anchor tags preview */}
              <div className="mt-16 flex gap-6 text-[10px] font-mono tracking-widest text-zinc-500">
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => document.getElementById("earth-orbit")?.scrollIntoView({ behavior: "smooth" })}>2035 SEC-1</span>
                <span>/</span>
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => document.getElementById("moon-orbit")?.scrollIntoView({ behavior: "smooth" })}>2045 SEC-2</span>
                <span>/</span>
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => document.getElementById("asteroid-belt")?.scrollIntoView({ behavior: "smooth" })}>2055 SEC-3</span>
                <span>/</span>
                <span className="hover:text-white transition-colors cursor-pointer" onClick={() => document.getElementById("shipyard")?.scrollIntoView({ behavior: "smooth" })}>2070 SEC-4</span>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 1: Space Elevator close up */}
        <section id="earth-orbit" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-start pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-01 // ANCHOR STRUCTURE</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Sol-1 Space Elevator
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                Anchored directly on Earth, this Carbon Nanotube structure rises 45,000 kilometers into geosynchronous orbit. It forms the core umbilical link transporting raw planetary assets, workers, and heavy fuels into the orbital grids.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">STABILITY RATIO</span>
                  <span className="text-white text-xs font-bold">99.8%</span>
                </div>
                <div>
                  <span className="block text-zinc-600">CLIMBERS ACTIVE</span>
                  <span className="text-[#00ffc8] text-xs font-bold">4 / ACTIVE</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 2: Moon orbit & research arrays */}
        <section id="moon-orbit" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-end pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-02 // SCIENCE CORRIDOR</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Aegis Research Campus
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                Orbiting the Moon, the Aegis arrays conduct critical deep spectral tracking and thermonuclear fusion calculations. The labs anchor our quantum node network, establishing secure high-fidelity data channels to remote sectors.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">FUSION TEMPERATURE</span>
                  <span className="text-white text-xs font-bold">142,000,000 K</span>
                </div>
                <div>
                  <span className="block text-zinc-600">QUANTUM NODES</span>
                  <span className="text-[#0088ff] text-xs font-bold">1,024 QUANTUM</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 3: Resource extraction / Asteroid Belt */}
        <section id="asteroid-belt" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-start pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-03 // INDUSTRIAL INFRASTRUCTURE</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Helios Refinement Depot
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                Stationed at the edge of the Vesta Alpha asteroid corridor. High-energy industrial lasers extract deposits of Helium-3 and platinum ores, processing hundreds of metric tons daily to fuel the interstellar commercial fleeters.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">YIELD RATIO</span>
                  <span className="text-white text-xs font-bold">1,420 KG/S</span>
                </div>
                <div>
                  <span className="block text-zinc-600">REFINING UNITS</span>
                  <span className="text-[#ffd080] text-xs font-bold">VESTA ALPHA</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 4: MMINT Trade shipyard */}
        <section id="shipyard" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-end pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-04 // COMMERCE OPERATIONS</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Genesis Orbital Shipyard
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                The shipyard constructs high-fidelity merchant freighters, civilian cruisers, and tactical exploration drones. Operating under automated AI supervision, it supports a population of 31,420 engineers and builders.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">MANUFACTURING YIELD</span>
                  <span className="text-white text-xs font-bold">2.8 MT/DAY</span>
                </div>
                <div>
                  <span className="block text-zinc-600">SHIPS IN BUILD</span>
                  <span className="text-[#7a22ff] text-xs font-bold">14 ENROUTE</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 5: Habitat Ring Gateway */}
        <section id="habitat-gateway" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-start pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-05 // CIVILIAN GATEWAY</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Vanguard Habitat Ring
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                A massive orbital ring structure spinning to simulate a stable 0.85g environment. Home to 42,000 citizens, this gateway serves as the primary trade node linking Earth and the deep Genesis outer systems.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">GRAVITY INDEX</span>
                  <span className="text-white text-xs font-bold">0.85g SPIN</span>
                </div>
                <div>
                  <span className="block text-zinc-600">WARP ENGINE STATUS</span>
                  <span className="text-[#00ffc8] text-xs font-bold">98.5% CHARGING</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 6: Genesis planet closeup */}
        <section id="genesis-outpost" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-end pointer-events-auto">
            <GlassModule className="max-w-[550px] flex flex-col items-start text-left">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">SEC-06 // NEW CIVILIZATION</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase">
                Genesis Prime Outpost
              </h2>
              <p className="description text-zinc-400 text-sm leading-relaxed mb-6">
                The terminal frontier of human civilization. Genesis Prime represents our first permanent extra-solar outpost, supporting over 1.2 million citizens across high-elevation vertical farming modules and terraformed grids.
              </p>
              <div className="grid grid-cols-2 gap-4 w-full font-mono text-[10px] border-t border-white/5 pt-4 text-zinc-500">
                <div>
                  <span className="block text-zinc-600">POPULATION CAPACITY</span>
                  <span className="text-white text-xs font-bold">1,250,000 RESIDENTS</span>
                </div>
                <div>
                  <span className="block text-zinc-600">TERRAFORM STATUS</span>
                  <span className="text-[#00ffc8] text-xs font-bold">STAGE 4 - VEGETATIVE</span>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* SECTION 7: Roadmap list info */}
        <section id="roadmap" className="min-h-screen flex items-center py-20">
          <div className="px-6 md:px-12 w-full flex justify-center pointer-events-auto">
            <GlassModule className="max-w-[800px] w-full text-center">
              <div className="eyebrow text-[#00ffc8] font-mono text-[10px] tracking-widest font-bold mb-2">ROADMAP DIRECTIVES</div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 uppercase">
                Civilization Expansion Phases
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="data-card border border-white/5 bg-white/5 p-5 rounded">
                  <h3 className="text-[#00ffc8] font-bold text-sm mb-2 font-mono">PHASE 1: LEO ORBIT</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">Establish the space elevator, LEO logistics corridors, and communications relays.</p>
                </div>
                <div className="data-card border border-white/5 bg-white/5 p-5 rounded">
                  <h3 className="text-[#0088ff] font-bold text-sm mb-2 font-mono">PHASE 2: DEEP MINING</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">Deploy extraction refiners at the Asteroid Belts and secure research networks at lunar orbits.</p>
                </div>
                <div className="data-card border border-white/5 bg-white/5 p-5 rounded">
                  <h3 className="text-[#7a22ff] font-bold text-sm mb-2 font-mono">PHASE 3: WARP GATEWAY</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">Power up the Vanguard Habitat Ring and fire the Warp Gateways for deep-space civilization expansion.</p>
                </div>
              </div>
            </GlassModule>
          </div>
        </section>

        {/* FINAL SECTION (Solar Horizon Lookback) */}
        <section id="founder" className="min-h-screen flex items-center py-20">
          <div className="px-4 w-full flex justify-center pointer-events-auto">
            <GlassModule className="text-center max-w-[800px] flex flex-col items-center">
              <div className="eyebrow text-zinc-500 font-mono text-[10px] tracking-[4px] mb-2">Deep Space Horizon</div>
              <h2 className="section-title font-bold text-white mb-6 animate-pulse uppercase" style={{ fontSize: "clamp(32px, 5vw, 55px)", lineHeight: 1.1 }}>
                The Future Belongs To Builders
              </h2>
              <p className="description text-zinc-400 text-sm max-w-[600px] leading-relaxed mb-6">
                The next generation of digital civilizations will be created by visionaries. Not spectators.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 text-zinc-500 font-mono text-[10px] tracking-[3px] uppercase mb-8">
                <span>Builders //</span>
                <span>Creators //</span>
                <span>Explorers</span>
              </div>

              <p className="text-[#00ffc8] font-semibold text-lg font-mono">
                Welcome to Million Mint.
              </p>
              
              {/* Founder Signature card */}
              <div className="mt-10 flex flex-col items-center border-t border-white/5 pt-8 w-full">
                <div className="text-2xl font-bold font-['Outfit'] tracking-[2px] text-white">Kalyan Chowdary</div>
                <div className="font-mono text-[#f5c842] tracking-[5px] text-[10px] font-bold uppercase mt-1">
                  Founder | Million Mint
                </div>
                <p className="mt-3 text-xs font-mono text-zinc-400 max-w-[500px] leading-relaxed">
                  Building high-fidelity decentralized virtual environments and economic primitives for creator-owned space civilizations.
                </p>
                <div className="flex gap-4 mt-5 font-mono text-[10px] text-[#00ffc8]">
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
        <footer className="w-full py-12 px-6 border-t border-white/5 bg-black/60 backdrop-blur-md flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-auto">
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
          </div>
        </footer>

      </div>

      {/* Cruise Mode Floating Companion advisor bubble */}
      {!explorerMode && (
        <div className="fixed right-6 bottom-6 z-40 max-w-[340px] pointer-events-auto hidden md:block">
          <div className="bg-black/85 border border-[#00ffc8]/20 backdrop-blur-md rounded p-4 font-mono shadow-2xl flex flex-col gap-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-[9px] text-[#00ffc8] font-bold tracking-[1.5px] uppercase">Advisor Link</span>
              <span className="text-[8px] text-zinc-500 uppercase">Year {year}</span>
            </div>
            <p className="text-[10px] text-zinc-300 italic leading-relaxed">
              &ldquo;{aiBriefing}&rdquo;
            </p>
            <button
              onClick={() => {
                setExplorerMode(true);
                addLog("EXPLORER MODE INITIALIZED. ENGAGING ORBITAL TELEMETRY SYSTEM.");
              }}
              className="w-full mt-2 py-1 bg-[#00ffc8]/10 hover:bg-[#00ffc8]/20 text-[#00ffc8] border border-[#00ffc8]/30 rounded text-[9px] font-bold tracking-widest uppercase transition-colors"
            >
              Analyze Active Systems
            </button>
          </div>
        </div>
      )}

      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </main>
  );
}
