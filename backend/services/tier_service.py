"""
Tier-based access control and data transformation service.

Handles:
- Tier hierarchy comparisons
- Market data precision reduction for free-tier users
- Rate-limit checking against Redis counters
"""

from __future__ import annotations

import logging

import redis.asyncio as aioredis

from services.redis_service import increment_with_ttl

logger = logging.getLogger(__name__)

# Numeric tier hierarchy — higher is more privileged.
TIER_HIERARCHY: dict[str, int] = {
    "free": 0,
    "pro": 1,
    "premium": 2,
}

# Fields that get rounded for free-tier users.
_ROUND_FIELDS = ("current_price", "market_cap", "total_volume", "high_24h", "low_24h")


def has_minimum_tier(user_tier: str, required_tier: str) -> bool:
    """
    Check whether *user_tier* meets or exceeds *required_tier*.

    >>> has_minimum_tier('pro', 'free')
    True
    >>> has_minimum_tier('free', 'pro')
    False
    """
    return TIER_HIERARCHY.get(user_tier, 0) >= TIER_HIERARCHY.get(required_tier, 0)


def transform_market_data(
    coins: list[dict],
    tier: str,
) -> tuple[list[dict], bool]:
    """
    Apply tier-specific transformations to raw market data.

    Free-tier users receive rounded numbers and a ``delayed=True`` flag
    to indicate reduced precision.  Pro/Premium users get full-fidelity data.

    Args:
        coins: Raw coin dicts from the data pool.
        tier: User's subscription tier.

    Returns:
        A tuple of ``(transformed_coins, delayed)``.
    """
    if tier == "free":
        rounded: list[dict] = []
        for coin in coins:
            c = dict(coin)
            for field in _ROUND_FIELDS:
                val = c.get(field)
                if val is not None:
                    try:
                        c[field] = round(float(val), 1)
                    except (TypeError, ValueError):
                        pass
            rounded.append(c)
        return rounded, True

    return coins, False


async def check_rate_limit(
    redis: aioredis.Redis,  # noqa: ARG001 – kept for interface compat
    user_id: str,
    feature: str,
    tier: str,
    limits: dict[str, int],
) -> tuple[bool, int, str]:
    """
    Check and increment a per-user, per-feature daily rate-limit counter.

    The underlying Redis key is ``user:{user_id}:{feature}`` with a 24-hour
    TTL that resets the counter automatically.

    Args:
        redis: (unused) Async Redis client — the function uses the singleton.
        user_id: Unique user identifier.
        feature: Feature slug, e.g. ``"ai_queries"``.
        tier: User's tier (used to look up the limit).
        limits: Mapping of tier → max allowed count per window.

    Returns:
        A tuple ``(allowed, remaining, message)``.
        - ``allowed``: ``True`` if the request should proceed.
        - ``remaining``: How many requests are left after this one.
        - ``message``: Human-readable status or denial reason.
    """
    max_count = limits.get(tier)
    if max_count is None:
        # Tier not in limits → unlimited
        return True, -1, "Unlimited"

    key = f"user:{user_id}:{feature}"
    count = await increment_with_ttl(key, ttl=86400)

    if count > max_count:
        return (
            False,
            0,
            f"Free tier limit reached ({max_count}/{max_count}). "
            "Upgrade to Pro ($3/mo) for unlimited AI queries.",
        )

    remaining = max_count - count
    return True, remaining, f"{remaining} requests remaining today"
