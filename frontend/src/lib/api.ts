// ============================================================
// Million Mint AI Terminal — API Client
// ============================================================

import type {
  MarketDataResponse,
  AIQueryRequest,
  AIQueryResponse,
  TradeSetupRequest,
  TradeSetupResponse,
  ContentGenRequest,
  ContentGenResponse,
  NarrativeSector,
  WhaleAlertsResponse,
  TrendingCoin,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
    this.name = "APIError";
  }
}

async function apiFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let detail = "An unexpected error occurred";
    try {
      const errorData = await response.json();
      detail = errorData.detail || detail;
    } catch {
      // Response wasn't JSON
    }
    throw new APIError(response.status, detail);
  }

  return response.json();
}

// ============================================================
// Market Data
// ============================================================

export async function fetchMarketData(
  token: string
): Promise<MarketDataResponse> {
  return apiFetch<MarketDataResponse>("/api/market", token);
}

// ============================================================
// AI Research Copilot
// ============================================================

export async function queryAI(
  token: string,
  request: AIQueryRequest
): Promise<AIQueryResponse> {
  return apiFetch<AIQueryResponse>("/api/ai/query", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================================
// Trade Setup Generator
// ============================================================

export async function generateTradeSetup(
  token: string,
  request: TradeSetupRequest
): Promise<TradeSetupResponse> {
  return apiFetch<TradeSetupResponse>("/api/ai/trade-setup", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================================
// Content Generator
// ============================================================

export async function generateContent(
  token: string,
  request: ContentGenRequest
): Promise<ContentGenResponse> {
  return apiFetch<ContentGenResponse>("/api/ai/content-gen", token, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// ============================================================
// Narratives
// ============================================================

export async function fetchNarratives(
  token: string
): Promise<NarrativeSector[]> {
  return apiFetch<NarrativeSector[]>("/api/narratives", token);
}

// ============================================================
// Whale Alerts
// ============================================================

export async function fetchWhaleAlerts(
  token: string
): Promise<WhaleAlertsResponse> {
  return apiFetch<WhaleAlertsResponse>("/api/whale-alerts", token);
}

// ============================================================
// Trending
// ============================================================

export async function fetchTrending(
  token: string
): Promise<TrendingCoin[]> {
  return apiFetch<TrendingCoin[]>("/api/trending", token);
}

// ============================================================
// SSE Stream URL Builder
// ============================================================

export function getSSEStreamUrl(token: string): string {
  return `${API_BASE}/api/stream/prices?token=${encodeURIComponent(token)}`;
}

export { APIError };
