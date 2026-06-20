"""
Market data route.

GET /api/market — returns tier-transformed cryptocurrency market data
from the Redis-pooled CoinGecko cache.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import CryptoAsset, MarketDataResponse, UserContext
from services.redis_service import get_json
from services.tier_service import transform_market_data

router = APIRouter(prefix="/api", tags=["Market Data"])


@router.get("/market", response_model=MarketDataResponse)
async def get_market_data(
    user: UserContext = Depends(get_current_user),
) -> MarketDataResponse:
    """
    Retrieve current cryptocurrency market data.

    - **Free tier**: prices rounded to 1 decimal, ``delayed=true``.
    - **Pro / Premium**: full-precision data, ``delayed=false``.

    Data is sourced from a background worker that pools CoinGecko
    and writes to the ``pooled_crypto_data`` Redis key.
    """
    raw_data = await get_json("pooled_crypto_data")

    if raw_data is None:
        raise HTTPException(
            status_code=503,
            detail="Market data temporarily unavailable. Please try again shortly.",
        )

    coins = raw_data if isinstance(raw_data, list) else raw_data.get("coins", [])
    transformed_coins, delayed = transform_market_data(coins, user.tier)

    return MarketDataResponse(
        coins=[CryptoAsset(**c) for c in transformed_coins],
        delayed=delayed,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
