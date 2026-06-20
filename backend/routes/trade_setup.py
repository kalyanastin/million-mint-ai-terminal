"""
AI trade-setup route.

POST /api/ai/trade-setup — generates an AI-powered trade setup
for a specific coin.  Requires at least Pro tier.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import TradeSetupRequest, TradeSetupResponse, UserContext
from services.gemini_service import gemini_service
from services.redis_service import get_json, get_redis
from services.tier_service import check_rate_limit, has_minimum_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["AI"])

_TRADE_RATE_LIMITS = {"pro": 10}  # premium → unlimited


@router.post("/ai/trade-setup", response_model=TradeSetupResponse)
async def ai_trade_setup(
    body: TradeSetupRequest,
    user: UserContext = Depends(get_current_user),
) -> TradeSetupResponse:
    """
    Generate an AI-powered trade setup (entry, targets, stop-loss).

    - **Free tier**: 403 — upgrade to Pro required.
    - **Pro tier**: 10 setups per 24 hours.
    - **Premium tier**: Unlimited.
    """
    # ── Tier gate ────────────────────────────────────────────────────
    if not has_minimum_tier(user.tier, "pro"):
        raise HTTPException(
            status_code=403,
            detail="Upgrade to Pro ($3/mo) to unlock AI trade setups.",
        )

    # ── Rate limiting (Pro only) ─────────────────────────────────────
    redis = get_redis()
    allowed, remaining, message = await check_rate_limit(
        redis, user.user_id, "trade_setups", user.tier, _TRADE_RATE_LIMITS
    )
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=(
                "Pro tier limit reached (10/10 trade setups today). "
                "Upgrade to Premium ($9/mo) for unlimited setups."
            ),
        )

    # ── Gemini availability check ────────────────────────────────────
    if gemini_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set GEMINI_API_KEY.",
        )

    # ── Find coin data in pooled market data ─────────────────────────
    raw_data = await get_json("pooled_crypto_data")
    coin_data: dict | None = None

    if raw_data:
        coins = raw_data if isinstance(raw_data, list) else raw_data.get("coins", [])
        for coin in coins:
            if coin.get("id") == body.coin_id:
                coin_data = coin
                break

    if coin_data is None:
        raise HTTPException(
            status_code=404,
            detail=f"Coin '{body.coin_id}' not found in current market data.",
        )

    # ── Generate trade setup ─────────────────────────────────────────
    setup = await gemini_service.generate_trade_setup(coin_data)

    return TradeSetupResponse(
        coin_id=body.coin_id,
        coin_name=coin_data.get("name", body.coin_id),
        entry=setup.get("entry"),
        stop_loss=setup.get("stop_loss"),
        targets=setup.get("targets", []),
        risk_reward=setup.get("risk_reward"),
        confidence=setup.get("confidence"),
        reasoning=setup.get("reasoning"),
    )
