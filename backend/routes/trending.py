"""
Trending coins route.

GET /api/trending — returns trending coins from CoinGecko enriched
with synthetic signal items derived from notable market movers.
No tier restriction — available to all authenticated users.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from models import TrendingCoin
from services.redis_service import get_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Trending"])


@router.get("/trending")
async def get_trending() -> list[dict]:
    """
    Retrieve trending coins and synthetic market signals.

    Combines CoinGecko trending data with coins that have moved
    more than 5% in the last 24 hours as additional signal items.

    This endpoint does not require authentication.
    """
    # ── CoinGecko trending data ──────────────────────────────────────
    raw_trending = await get_json("pooled_trending_data")
    trending_items: list[dict] = []

    if raw_trending:
        items = raw_trending if isinstance(raw_trending, list) else []
        for item in items:
            try:
                trending_items.append(TrendingCoin(**item).model_dump())
            except Exception:
                trending_items.append(item)

    # ── Synthetic signals from market movers ─────────────────────────
    raw_market = await get_json("pooled_crypto_data")
    if raw_market:
        coins = raw_market if isinstance(raw_market, list) else raw_market.get("coins", [])
        existing_ids = {t.get("id") for t in trending_items}

        for coin in coins:
            coin_id = coin.get("id")
            if coin_id in existing_ids:
                continue

            change_24h = coin.get("price_change_percentage_24h")
            if change_24h is not None and abs(change_24h) > 5:
                trending_items.append({
                    "id": coin_id,
                    "name": coin.get("name"),
                    "symbol": coin.get("symbol"),
                    "market_cap_rank": coin.get("market_cap_rank"),
                    "thumb": coin.get("image"),
                    "price_btc": None,
                    "score": None,
                    "signal": "big_mover",
                    "price_change_24h": round(change_24h, 2),
                })

    if not trending_items:
        raise HTTPException(
            status_code=503,
            detail="Trending data temporarily unavailable.",
        )

    return trending_items
