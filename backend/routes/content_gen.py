"""
AI content-generation route.

POST /api/ai/content-gen — creates viral crypto content for Binance
Square, X threads, alpha calls, and educational posts.
Requires Premium tier.
"""

from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import ContentGenRequest, ContentGenResponse, UserContext
from services.gemini_service import gemini_service
from services.redis_service import get_json
from services.tier_service import has_minimum_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["AI"])


@router.post("/ai/content-gen", response_model=ContentGenResponse)
async def ai_content_gen(
    body: ContentGenRequest,
    user: UserContext = Depends(get_current_user),
) -> ContentGenResponse:
    """
    Generate publication-ready crypto content.

    - **Free / Pro tier**: 403 — upgrade to Premium required.
    - **Premium tier**: Unlimited content generation.

    Supports ``thread``, ``alpha_call``, ``market_update``, and
    ``educational`` content types.
    """
    # ── Tier gate — Premium only ─────────────────────────────────────
    if not has_minimum_tier(user.tier, "premium"):
        raise HTTPException(
            status_code=403,
            detail="Upgrade to Premium ($9/mo) to unlock AI content generation.",
        )

    # ── Gemini availability check ────────────────────────────────────
    if gemini_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set GEMINI_API_KEY.",
        )

    # ── Build market + narrative context ─────────────────────────────
    context_parts: list[str] = []

    raw_market = await get_json("pooled_crypto_data")
    if raw_market:
        coins = raw_market if isinstance(raw_market, list) else raw_market.get("coins", [])
        top_coins = coins[:10]
        context_parts.append(
            "Current top-10 market data:\n" + json.dumps(top_coins, indent=2)
        )

    narrative_data = await get_json("pooled_narrative_data")
    if narrative_data:
        context_parts.append(
            "Sector narratives:\n" + json.dumps(narrative_data, indent=2)
        )

    # If a specific coin is referenced, include its data
    if body.coin_id and raw_market:
        coins = raw_market if isinstance(raw_market, list) else raw_market.get("coins", [])
        for coin in coins:
            if coin.get("id") == body.coin_id:
                context_parts.append(
                    f"Focus coin data:\n{json.dumps(coin, indent=2)}"
                )
                break

    context = "\n\n".join(context_parts) if context_parts else ""

    # ── Generate content ─────────────────────────────────────────────
    result = await gemini_service.generate_content_post(
        topic=body.topic,
        content_type=body.content_type,
        context=context,
    )

    return ContentGenResponse(
        content=result.get("content", ""),
        format=result.get("format", body.content_type),
        hashtags=result.get("hashtags", []),
    )
