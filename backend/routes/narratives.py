"""
Narrative / sector analysis route.

GET /api/narratives — returns sector-level narrative data with
tier-based filtering (free sees top 3, pro/premium sees all).
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from models import NarrativeSector, UserContext
from services.redis_service import get_json
from services.tier_service import has_minimum_tier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Narratives"])


@router.get("/narratives", response_model=list[NarrativeSector])
async def get_narratives(
    user: UserContext = Depends(get_current_user),
) -> list[NarrativeSector]:
    """
    Retrieve sector narrative data.

    - **Free tier**: Returns only the top 3 sectors sorted by
      absolute average price change.
    - **Pro / Premium**: Returns all available sectors.

    Data is sourced from the ``pooled_narrative_data`` Redis key,
    populated by the background data worker.
    """
    raw_data = await get_json("pooled_narrative_data")

    if raw_data is None:
        raise HTTPException(
            status_code=503,
            detail="Narrative data temporarily unavailable. Please try again shortly.",
        )

    sectors = raw_data if isinstance(raw_data, list) else []

    # Free tier: limit to top 3 sectors by absolute avg change
    if not has_minimum_tier(user.tier, "pro"):
        sectors = sorted(
            sectors,
            key=lambda s: abs(s.get("avg_change", 0) or 0),
            reverse=True,
        )[:3]

    return [NarrativeSector(**s) for s in sectors]
