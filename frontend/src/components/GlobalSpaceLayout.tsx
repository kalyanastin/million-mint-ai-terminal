"use client";

import React, { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const SpaceUniverse = dynamic(
  () => import("./SpaceUniverse").then((mod) => mod.SpaceUniverse),
  { ssr: false }
);

export function GlobalSpaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);

  // Sync route path to background progress
  useEffect(() => {
    if (pathname === "/about") {
      setProgress(2.0); // Section 02: Orbital Research Network
    } else if (pathname === "/founder") {
      setProgress(8.0); // Cinematic Lookback / Final
    } else if (pathname === "/planet/genesis") {
      setProgress(6.0); // Section 06: Genesis Planet
    } else if (pathname === "/roadmap") {
      setProgress(7.0); // Section 07: Future Civilizations
    } else if (pathname === "/token") {
      setProgress(4.0); // Section 04: MMINT Trade Hub
    } else if (pathname === "/whitepaper") {
      setProgress(5.0); // Section 05: MMINT Orbital Gateway
    }
  }, [pathname]);

  // Track window scroll coordinates for the Home page
  useEffect(() => {
    if (pathname !== "/") return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      
      const scrollFrac = scrolled / maxScroll;
      // Interpolate between 0 (Hero) and 8 (Observatory lookback)
      setProgress(scrollFrac * 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Trigger initial
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <>
      {/* Persistent global space universe WebGL background */}
      <div className="fixed inset-0 -z-10 bg-black pointer-events-none">
        <Suspense fallback={
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 font-mono text-xs text-[#00ffc8]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ffc8] mb-4"></div>
            CONNECTING ORBITAL TELEMETRY...
          </div>
        }>
          <SpaceUniverse scrollProgress={progress} />
        </Suspense>
      </div>
      
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </>
  );
}
