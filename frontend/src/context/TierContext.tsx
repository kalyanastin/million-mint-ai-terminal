"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import type { Tier } from "@/lib/types";
import { TIER_CONFIGS } from "@/lib/types";

interface TierContextValue {
  tier: Tier;
  token: string;
  setTier: (tier: Tier) => void;
}

export const TierContext = createContext<TierContextValue>({
  tier: "free",
  token: "free_token",
  setTier: () => {},
});

export function TierProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<Tier>("free");

  // Load persisted tier from localStorage on mount
  useEffect(() => {
    const savedTier = localStorage.getItem("mm_tier") as Tier | null;
    if (savedTier && savedTier in TIER_CONFIGS) {
      setTierState(savedTier);
    }
  }, []);

  const setTier = useCallback((newTier: Tier) => {
    setTierState(newTier);
    localStorage.setItem("mm_tier", newTier);
  }, []);

  const token = TIER_CONFIGS[tier].token;

  return (
    <TierContext.Provider value={{ tier, token, setTier }}>
      {children}
    </TierContext.Provider>
  );
}
