"""
Authentication module for Million Mint AI Terminal.

Provides token-based authentication with tier-based access control.
In production, replace the static TOKEN_TIER_MAP with JWT validation
or an external auth provider.
"""

from fastapi import HTTPException, Request

from models import UserContext

# Static token map for development/demo purposes.
# In production, replace with JWT validation or database lookup.
TOKEN_TIER_MAP: dict[str, dict[str, str]] = {
    "free_token": {"tier": "free", "user_id": "user_free_001"},
    "pro_token": {"tier": "pro", "user_id": "user_pro_001"},
    "premium_token": {"tier": "premium", "user_id": "user_premium_001"},
}


async def get_current_user(request: Request) -> UserContext:
    """
    Extract and validate the Bearer token from the Authorization header.

    Returns a UserContext with the user's ID and subscription tier.

    Raises:
        HTTPException 401: If the token is missing, malformed, or invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Authorization header",
        )
    token = auth_header.replace("Bearer ", "")
    user_data = TOKEN_TIER_MAP.get(token)
    if not user_data:
        raise HTTPException(status_code=401, detail="Invalid token")
    return UserContext(**user_data)
