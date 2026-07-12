"use client";

export interface TimelineMilestone {
  year: number;
  title: string;
  subtitle: string;
  description: string;
  focusId: string;
  stats: {
    cargoShips: number;
    energyGrid: number;
    population: number;
    miningYield: number;
  };
  advisorLogs: string[];
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: 2035,
    title: "Orbital Infrastructure",
    subtitle: "Umbilical Elevator Anchor",
    description: "Sol-1 Space Elevator constructed. low earth orbit logistics routes operational under Earth Federation control.",
    focusId: "space-elevator",
    stats: {
      cargoShips: 12,
      energyGrid: 1.2,
      population: 180,
      miningYield: 0.0
    },
    advisorLogs: [
      "COS Initializing...",
      "Anchoring Sol-1 Space Elevator nanotech core...",
      "LEO telemetry corridors established.",
      "Synchronization Complete: Sol-1 anchor nominal."
    ]
  },
  {
    year: 2045,
    title: "Lunar Research Network",
    subtitle: "Aegis Fusion Arrays",
    description: "Aegis research labs operational orbiting the Moon. Quantum computational arrays synced across the grid.",
    focusId: "research-station",
    stats: {
      cargoShips: 45,
      energyGrid: 2.8,
      population: 1380,
      miningYield: 240.0
    },
    advisorLogs: [
      "Syncing Research Network...",
      "Powering Aegis nuclear fusion reactor...",
      "Quantum node arrays online: 1,024 active channels.",
      "Aegis telemetry streams locked."
    ]
  },
  {
    year: 2055,
    title: "Mining & Resource Extraction",
    subtitle: "Helios Asteroid Depot",
    description: "Laser refiners deployed at Asteroid Vesta Alpha. Shuttles transporting raw platinum ore to LEO terminals.",
    focusId: "mining-depot",
    stats: {
      cargoShips: 94,
      energyGrid: 5.6,
      population: 4120,
      miningYield: 1420.5
    },
    advisorLogs: [
      "Syncing Logistics Simulation...",
      "Refinement lasers locked on Vesta Alpha-433...",
      "Freighter hauling queue registered.",
      "Helios extraction network fully operational."
    ]
  },
  {
    year: 2070,
    title: "Trade & Shipyard Industry",
    subtitle: "Genesis Orbital Shipyard",
    description: "Heavy manufacturing orbital shipyard active. Constructing interplanetary cargo carriers and drones.",
    focusId: "orbital-shipyard",
    stats: {
      cargoShips: 183,
      energyGrid: 8.4,
      population: 31420,
      miningYield: 2800.0
    },
    advisorLogs: [
      "Syncing Trade Nodes...",
      "Igniting Genesis shipyard assembly lines...",
      "Manufacturing queue online: 14 cargo frames.",
      "Industrial shipyard telemetry synchronized."
    ]
  },
  {
    year: 2100,
    title: "The Warp Network",
    subtitle: "Vanguard Ring Gateway",
    description: "Vanguard spin gateway populated, serving as the core jumping gateway to extra-solar sectors.",
    focusId: "habitat-ring",
    stats: {
      cargoShips: 245,
      energyGrid: 15.2,
      population: 42000,
      miningYield: 4100.8
    },
    advisorLogs: [
      "Syncing Warp Gateway coordinates...",
      "Charging Vanguard artificial gravity rings...",
      "Containment magnetic fields locking.",
      "Gateway ignition vectors synced."
    ]
  },
  {
    year: 2150,
    title: "Genesis Prime Colony",
    subtitle: "First Surface Settlement",
    description: "Permanent civilization settlement established on Genesis Prime. Vertical farming and defensive shields fully active.",
    focusId: "genesis-planet",
    stats: {
      cargoShips: 312,
      energyGrid: 48.0,
      population: 1250000,
      miningYield: 9800.5
    },
    advisorLogs: [
      "Syncing Surface Settlements...",
      "Genesis Prime outpost shield generator online...",
      "Vertical agriculture modules harvesting.",
      "Terraforming status: Stage 4 vegetative."
    ]
  },
  {
    year: 2200,
    title: "Deep Space Horizon",
    subtitle: "Interplanetary Future",
    description: "Humanity steps beyond the local sectors. Exploration fleets departure mapping coordinates to remote star portals.",
    focusId: "creator-fleet",
    stats: {
      cargoShips: 520,
      energyGrid: 124.5,
      population: 8520000,
      miningYield: 24500.0
    },
    advisorLogs: [
      "Scan locked on deep space vectors...",
      "Explorer flagship warp engines initialized...",
      "Interplanetary travel coordinates calculated.",
      "COS Terminal Log: Year 2200 Horizon locked."
    ]
  }
];

export function getMilestoneForYear(year: number): TimelineMilestone {
  // Find the closest milestone that is <= current year
  const sorted = [...TIMELINE_MILESTONES].sort((a, b) => b.year - a.year);
  const found = sorted.find(m => year >= m.year);
  return found || TIMELINE_MILESTONES[0];
}
