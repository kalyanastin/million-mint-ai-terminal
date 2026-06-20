"""
Server-Sent Events (SSE) price streaming route.

GET /api/stream/prices — pushes real-time price updates to clients
every 5 seconds.  Uses a query-param token fallback because the
browser ``EventSource`` API cannot send custom headers.
"""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, Request
from sse_starlette.sse import EventSourceResponse

from auth import TOKEN_TIER_MAP
from models import UserContext
from services.redis_service import get_json
from services.tier_service import transform_market_data

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Streaming"])


def _authenticate_from_query(token: str) -> UserContext:
    """Validate token supplied as a query parameter (SSE fallback)."""
    user_data = TOKEN_TIER_MAP.get(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return UserContext(**user_data)


@router.get("/stream/prices")
async def stream_prices(
    request: Request,
    token: str = Query(..., description="Bearer token passed as query param for SSE"),
):
    """
    Stream market prices via Server-Sent Events.

    The client should connect with:
    ``new EventSource('/api/stream/prices?token=pro_token')``

    Events are emitted every ~5 seconds.  A keep-alive comment is
    sent every 30 seconds to prevent proxy timeouts.
    """
    user = _authenticate_from_query(token)

    async def _event_generator():
        last_keepalive = asyncio.get_event_loop().time()

        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                logger.debug("SSE client disconnected")
                break

            # Fetch latest data
            raw_data = await get_json("pooled_crypto_data")
            if raw_data is not None:
                coins = raw_data if isinstance(raw_data, list) else raw_data.get("coins", [])
                transformed, delayed = transform_market_data(coins, user.tier)
                payload = {
                    "coins": transformed,
                    "delayed": delayed,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                yield {
                    "event": "price_update",
                    "data": json.dumps(payload),
                }

            # Keep-alive comment every 30 seconds
            now = asyncio.get_event_loop().time()
            if now - last_keepalive >= 30:
                yield {"comment": "keep-alive"}
                last_keepalive = now

            await asyncio.sleep(5)

    return EventSourceResponse(_event_generator())
