"use client";

import { useContext } from "react";
import { TierContext } from "@/context/TierContext";
import type { Tier } from "@/lib/types";

export function useTier() {
  const context = useContext(TierContext);

  const isPro = context.tier === "pro" || context.tier === "premium";
  const isPremium = context.tier === "premium";

  const canAccess = (requiredTier: Tier): boolean => {
    const hierarchy: Record<Tier, number> = {
      free: 0,
      pro: 1,
      premium: 2,
    };
    return hierarchy[context.tier] >= hierarchy[requiredTier];
  };

  return {
    ...context,
    isPro,
    isPremium,
    canAccess,
  };
}
