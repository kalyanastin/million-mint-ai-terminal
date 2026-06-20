"""
Pydantic models for Million Mint AI Terminal.

Defines all request/response schemas used across the API.
All fields that come from external market data are Optional with
defaults to handle partial or missing upstream data gracefully.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ─── Auth / User Context ────────────────────────────────────────────────────

class UserContext(BaseModel):
    """Authenticated user identity and subscription tier."""
    user_id: str
    tier: str = Field(..., pattern=r"^(free|pro|premium)$")


# ─── Market Data ─────────────────────────────────────────────────────────────

class CryptoAsset(BaseModel):
    """Single cryptocurrency asset with market data from CoinGecko."""
    id: str | None = None
    symbol: str | None = None
    name: str | None = None
    image: str | None = None
    current_price: float | None = None
    market_cap: float | None = None
    market_cap_rank: int | None = None
    total_volume: float | None = None
    high_24h: float | None = None
    low_24h: float | None = None
    price_change_percentage_1h_in_currency: float | None = None
    price_change_percentage_24h: float | None = None
    price_change_percentage_7d_in_currency: float | None = None
    sparkline_in_7d: dict | None = None
    sector: str | None = None


class MarketDataResponse(BaseModel):
    """Paginated market data response with tier-aware data fidelity flag."""
    coins: list[CryptoAsset]
    delayed: bool
    timestamp: str


# ─── AI Query ────────────────────────────────────────────────────────────────

class AIQueryRequest(BaseModel):
    """Request body for the general-purpose AI query endpoint."""
    prompt: str
    watchlist: list[str] | None = None
    sentiment_params: dict | None = None


class AIQueryResponse(BaseModel):
    """AI-generated response with optional usage metadata."""
    response_text: str
    tokens_used: int | None = None
    grounded_context_summary: str | None = None


# ─── Trade Setup ─────────────────────────────────────────────────────────────

class TradeSetupRequest(BaseModel):
    """Request body for AI-generated trade setup."""
    coin_id: str


class TradeSetupResponse(BaseModel):
    """AI-generated trade setup with entry, targets, and risk assessment."""
    coin_id: str
    coin_name: str | None = None
    entry: str | None = None
    stop_loss: str | None = None
    targets: list[str] = Field(default_factory=list)
    risk_reward: str | None = None
    confidence: str | None = None
    reasoning: str | None = None


# ─── Content Generation ─────────────────────────────────────────────────────

class ContentGenRequest(BaseModel):
    """Request body for AI content generation (threads, alpha calls, etc.)."""
    topic: str
    content_type: str = Field(
        default="thread",
        pattern=r"^(thread|alpha_call|market_update|educational)$",
    )
    coin_id: str | None = None


class ContentGenResponse(BaseModel):
    """AI-generated content ready for social publishing."""
    content: str
    format: str
    hashtags: list[str] = Field(default_factory=list)


# ─── Narratives / Sectors ───────────────────────────────────────────────────

class NarrativeSector(BaseModel):
    """Sector-level narrative aggregation with trend metadata."""
    sector: str | None = None
    avg_change: float | None = None
    coin_count: int | None = None
    coins: list[str] = Field(default_factory=list)
    trend_direction: str | None = None


# ─── Whale Tracking ─────────────────────────────────────────────────────────

class WhaleAlert(BaseModel):
    """On-chain whale transaction alert."""
    tx_hash: str | None = None
    coin: str | None = None
    amount_usd: float | None = None
    from_wallet: str | None = None
    to_wallet: str | None = None
    tx_type: str | None = None
    timestamp: str | None = None


class ExchangeFlow(BaseModel):
    """Exchange inflow/outflow event."""
    exchange: str | None = None
    coin: str | None = None
    amount_usd: float | None = None
    direction: str | None = None
    timestamp: str | None = None


# ─── Trending ────────────────────────────────────────────────────────────────

class TrendingCoin(BaseModel):
    """Trending cryptocurrency from CoinGecko trending endpoint."""
    id: str | None = None
    name: str | None = None
    symbol: str | None = None
    market_cap_rank: int | None = None
    thumb: str | None = None
    price_btc: float | None = None
    score: int | None = None
