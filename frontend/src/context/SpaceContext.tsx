"use client";

import React, { createContext, useContext, useState } from "react";

export interface HoveredAsset {
  id: string;
  name: string;
  type: string;
  faction: string;
  powerDraw: number;
  population: number;
  dockedShips: number;
  materials: string[];
  telemetry: Record<string, any>;
  screenX: number;
  screenY: number;
  behind?: boolean;
}

export interface SelectedAsset {
  id: string;
  name: string;
  type: string;
  faction: string;
  powerDraw: number;
  population: number;
  dockedShips: number;
  materials: string[];
  telemetry: Record<string, any>;
}

interface SpaceContextType {
  explorerMode: boolean;
  setExplorerMode: (mode: boolean) => void;
  activeLayer: string;
  setActiveLayer: (layer: string) => void;
  hoveredAsset: HoveredAsset | null;
  setHoveredAsset: (asset: HoveredAsset | null) => void;
  selectedAsset: SelectedAsset | null;
  setSelectedAsset: (asset: SelectedAsset | null) => void;
  year: number;
  setYear: (year: number) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [explorerMode, setExplorerMode] = useState(false);
  const [activeLayer, setActiveLayer] = useState("normal");
  const [hoveredAsset, setHoveredAsset] = useState<HoveredAsset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [year, setYear] = useState(2035);

  return (
    <SpaceContext.Provider
      value={{
        explorerMode,
        setExplorerMode,
        activeLayer,
        setActiveLayer,
        hoveredAsset,
        setHoveredAsset,
        selectedAsset,
        setSelectedAsset,
        year,
        setYear
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error("useSpace must be used within a SpaceProvider");
  }
  return context;
}
