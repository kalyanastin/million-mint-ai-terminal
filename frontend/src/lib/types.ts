// ============================================================
// Million Mint AI Terminal — TypeScript Type Definitions
// ============================================================

export type Tier = "free" | "pro" | "premium";

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
  sector?: string;
  last_updated?: string;
}

export interface MarketDataResponse {
  coins: CryptoAsset[];
  delayed: boolean;
  timestamp: string;
}

export interface AIQueryRequest {
  prompt: string;
  watchlist?: string[];
  sentiment_params?: Record<string, string>;
}

export interface AIQueryResponse {
  response_text: string;
  tokens_used?: number;
  grounded_context_summary?: string;
}

export interface TradeSetupRequest {
  coin_id: string;
}

export interface TradeSetupResponse {
  coin_id: string;
  coin_name: string;
  entry: string;
  stop_loss: string;
  targets: string[];
  risk_reward: string;
  confidence: string;
  reasoning: string;
}

export interface ContentGenRequest {
  topic: string;
  content_type: "thread" | "alpha_call" | "market_update" | "educational";
  coin_id?: string;
}

export interface ContentGenResponse {
  content: string;
  format: string;
  hashtags: string[];
}

export interface NarrativeSector {
  sector: string;
  avg_change: number;
  coin_count: number;
  coins: string[];
  trend_direction: string;
}

export interface WhaleAlert {
  tx_hash: string;
  coin: string;
  amount_usd: number;
  from_wallet: string;
  to_wallet: string;
  tx_type: string;
  timestamp: string;
}

export interface ExchangeFlow {
  exchange: string;
  coin: string;
  amount_usd: number;
  direction: string;
  timestamp: string;
}

export interface WhaleAlertsResponse {
  whale_alerts: WhaleAlert[];
  exchange_flows: ExchangeFlow[];
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  price_btc: number;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface TierConfig {
  tier: Tier;
  token: string;
  label: string;
  price: string;
  color: string;
}

export const TIER_CONFIGS: Record<Tier, TierConfig> = {
  free: {
    tier: "free",
    token: "free_token",
    label: "Free",
    price: "$0/mo",
    color: "var(--color-mm-free)",
  },
  pro: {
    tier: "pro",
    token: "pro_token",
    label: "Pro",
    price: "$3/mo",
    color: "var(--color-mm-pro)",
  },
  premium: {
    tier: "premium",
    token: "premium_token",
    label: "Premium",
    price: "$9/mo",
    color: "var(--color-mm-premium)",
  },
};
