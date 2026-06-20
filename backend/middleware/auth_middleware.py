"""
Auth middleware for tier-gated endpoints.

Provides a ``require_tier`` dependency factory that ensures the
authenticated user meets a minimum subscription level before the
route handler executes.
"""

from __future__ import annotations

from fastapi import Depends, HTTPException

from auth import get_current_user
from models import UserContext
from services.tier_service import has_minimum_tier

# Human-readable upgrade prompts keyed by the tier the user needs.
_UPGRADE_MESSAGES: dict[str, str] = {
    "pro": "This feature requires a Pro subscription ($3/mo). Upgrade to unlock.",
    "premium": "This feature requires a Premium subscription ($9/mo). Upgrade to unlock.",
}


def require_tier(minimum_tier: str):
    """
    FastAPI dependency factory that enforces a minimum subscription tier.

    Usage::

        @router.post("/premium-feature")
        async def premium_feature(
            user: UserContext = Depends(require_tier("premium")),
        ):
            ...

    Args:
        minimum_tier: The lowest tier that should be granted access
            (``"free"``, ``"pro"``, or ``"premium"``).

    Returns:
        A dependency callable that resolves to :class:`UserContext` or
        raises ``HTTPException(403)``.
    """

    async def _check_tier(
        user: UserContext = Depends(get_current_user),
    ) -> UserContext:
        if not has_minimum_tier(user.tier, minimum_tier):
            detail = _UPGRADE_MESSAGES.get(
                minimum_tier,
                f"Upgrade required: minimum tier is '{minimum_tier}'.",
            )
            raise HTTPException(status_code=403, detail=detail)
        return user

    return _check_tier
