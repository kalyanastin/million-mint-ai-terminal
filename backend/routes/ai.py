"""
AI query route.

POST /api/ai/query — general-purpose AI query with market grounding,
tier-based rate limiting, and optional watchlist context.
"""

from __future__ import annotations

import json
import logging

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import AIQueryRequest, AIQueryResponse, UserContext
from services.gemini_service import gemini_service
from services.redis_service import get_json, get_redis
from services.tier_service import check_rate_limit, has_minimum_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["AI"])

_AI_RATE_LIMITS = {"free": 5}  # pro/premium → unlimited (absent key)

_SYSTEM_INSTRUCTION = (
    "You are the Million Mint AI Terminal — a professional crypto research "
    "assistant. Use the provided market data to ground your responses in "
    "real numbers. Be concise, data-driven, and actionable. Never provide "
    "financial advice — always remind users to DYOR."
)


@router.post("/ai/query", response_model=AIQueryResponse)
async def ai_query(
    body: AIQueryRequest,
    user: UserContext = Depends(get_current_user),
) -> AIQueryResponse:
    """
    Submit a natural-language AI query grounded in live market data.

    - **Free tier**: 5 queries per 24 hours.
    - **Pro / Premium**: Unlimited queries; watchlist and sentiment
      params are injected as additional context.
    """
    # ── Rate limiting (free tier only) ───────────────────────────────
    redis = get_redis()
    allowed, remaining, message = await check_rate_limit(
        redis, user.user_id, "ai_queries", user.tier, _AI_RATE_LIMITS
    )
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail=(
                "Free tier limit reached (5/5). Upgrade to Pro ($3/mo) "
                "for unlimited AI queries."
            ),
        )

    # ── Gemini availability check ────────────────────────────────────
    if gemini_service is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not configured. Please set GEMINI_API_KEY.",
        )

    # ── Build grounding context from pooled market data ──────────────
    raw_data = await get_json("pooled_crypto_data")
    context_parts: list[str] = []

    if raw_data:
        coins = raw_data if isinstance(raw_data, list) else raw_data.get("coins", [])
        # Summarise top-10 for context window efficiency
        top_coins = coins[:10]
        context_parts.append(
            "Current top-10 crypto market data:\n"
            + json.dumps(top_coins, indent=2)
        )

    # Pro/Premium: inject watchlist + sentiment context
    if has_minimum_tier(user.tier, "pro"):
        if body.watchlist:
            context_parts.append(f"User's watchlist: {', '.join(body.watchlist)}")
        if body.sentiment_params:
            context_parts.append(
                f"Sentiment parameters: {json.dumps(body.sentiment_params)}"
            )

    context = "\n\n".join(context_parts) if context_parts else ""

    # ── Generate response ────────────────────────────────────────────
    response_text = await gemini_service.generate_response(
        prompt=body.prompt,
        system_instruction=_SYSTEM_INSTRUCTION,
        context=context,
        temperature=0.2,
    )

    grounding_summary = (
        f"Grounded on {len(raw_data) if isinstance(raw_data, list) else 0} coins"
        if raw_data
        else None
    )

    return AIQueryResponse(
        response_text=response_text,
        grounded_context_summary=grounding_summary,
    )
