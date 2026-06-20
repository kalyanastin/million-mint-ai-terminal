"""
Whale alerts and exchange flows route.

GET /api/whale-alerts — returns on-chain whale transactions and
exchange inflow/outflow data.  Premium tier only.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import ExchangeFlow, UserContext, WhaleAlert
from services.redis_service import get_list
from services.tier_service import has_minimum_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Whale Tracking"])


@router.get("/whale-alerts")
async def get_whale_alerts(
    user: UserContext = Depends(get_current_user),
) -> dict:
    """
    Retrieve whale alerts and exchange flow data.

    - **Free / Pro tier**: 403 — Premium required.
    - **Premium tier**: Returns the last 20 whale alerts and
      last 10 exchange flow events.
    """
    # ── Tier gate — Premium only ─────────────────────────────────────
    if not has_minimum_tier(user.tier, "premium"):
        raise HTTPException(
            status_code=403,
            detail="Whale alerts require Premium ($9/mo). Upgrade to unlock.",
        )

    # ── Fetch from Redis lists ───────────────────────────────────────
    raw_whale = await get_list("pooled_whale_alerts", count=20)
    raw_flows = await get_list("pooled_exchange_flows", count=10)

    whale_alerts = [WhaleAlert(**w) if isinstance(w, dict) else w for w in raw_whale]
    exchange_flows = [ExchangeFlow(**f) if isinstance(f, dict) else f for f in raw_flows]

    return {
        "whale_alerts": whale_alerts,
        "exchange_flows": exchange_flows,
    }
