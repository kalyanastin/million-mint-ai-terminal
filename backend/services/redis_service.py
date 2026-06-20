"""
Async Redis service for Million Mint AI Terminal with robust in-memory/mock fallback.
"""

from __future__ import annotations

import json
import logging
import random
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

# Module-level variables
_redis_client: aioredis.Redis | None = None
_redis_working: bool = False
_in_memory_cache: dict[str, Any] = {}
_in_memory_lists: dict[str, list[Any]] = {}
_in_memory_counters: dict[str, int] = {}

# --- Base crypto catalogue ---
BASE_COINS = [
    {"id": "bitcoin",              "symbol": "btc",   "name": "Bitcoin",              "base_price": 67500.00,  "market_cap": 1_330_000_000_000},
    {"id": "ethereum",             "symbol": "eth",   "name": "Ethereum",             "base_price": 3750.00,   "market_cap": 450_000_000_000},
    {"id": "binancecoin",          "symbol": "bnb",   "name": "BNB",                  "base_price": 610.00,    "market_cap": 94_000_000_000},
    {"id": "solana",               "symbol": "sol",   "name": "Solana",               "base_price": 172.00,    "market_cap": 78_000_000_000},
    {"id": "ripple",               "symbol": "xrp",   "name": "XRP",                  "base_price": 0.52,      "market_cap": 28_000_000_000},
    {"id": "cardano",              "symbol": "ada",   "name": "Cardano",              "base_price": 0.46,      "market_cap": 16_500_000_000},
    {"id": "dogecoin",             "symbol": "doge",  "name": "Dogecoin",             "base_price": 0.155,     "market_cap": 22_000_000_000},
    {"id": "avalanche-2",          "symbol": "avax",  "name": "Avalanche",            "base_price": 36.50,     "market_cap": 14_000_000_000},
    {"id": "polkadot",             "symbol": "dot",   "name": "Polkadot",             "base_price": 7.20,      "market_cap": 10_000_000_000},
    {"id": "matic-network",        "symbol": "matic", "name": "Polygon",              "base_price": 0.72,      "market_cap": 7_200_000_000},
    {"id": "chainlink",            "symbol": "link",  "name": "Chainlink",            "base_price": 17.80,     "market_cap": 10_500_000_000},
    {"id": "shiba-inu",            "symbol": "shib",  "name": "Shiba Inu",            "base_price": 0.0000255, "market_cap": 15_000_000_000},
    {"id": "uniswap",              "symbol": "uni",   "name": "Uniswap",              "base_price": 11.40,     "market_cap": 6_800_000_000},
    {"id": "litecoin",             "symbol": "ltc",   "name": "Litecoin",             "base_price": 83.00,     "market_cap": 6_200_000_000},
    {"id": "cosmos",               "symbol": "atom",  "name": "Cosmos",               "base_price": 9.10,      "market_cap": 3_500_000_000},
    {"id": "filecoin",             "symbol": "fil",   "name": "Filecoin",             "base_price": 5.90,      "market_cap": 3_200_000_000},
    {"id": "aptos",                "symbol": "apt",   "name": "Aptos",                "base_price": 8.70,      "market_cap": 3_800_000_000},
    {"id": "arbitrum",             "symbol": "arb",   "name": "Arbitrum",             "base_price": 1.15,      "market_cap": 3_600_000_000},
    {"id": "optimism",             "symbol": "op",    "name": "Optimism",             "base_price": 2.50,      "market_cap": 2_900_000_000},
    {"id": "near",                 "symbol": "near",  "name": "NEAR Protocol",        "base_price": 7.40,      "market_cap": 8_100_000_000},
    {"id": "internet-computer",    "symbol": "icp",   "name": "Internet Computer",    "base_price": 12.50,     "market_cap": 5_800_000_000},
    {"id": "render-token",         "symbol": "rndr",  "name": "Render",               "base_price": 10.20,     "market_cap": 4_000_000_000},
    {"id": "fetch-ai",             "symbol": "fet",   "name": "Fetch.ai",             "base_price": 2.30,      "market_cap": 1_900_000_000},
    {"id": "render-token-2",       "symbol": "rndr2", "name": "RNDR (alt)",           "base_price": 10.20,     "market_cap": 4_000_000_000},
    {"id": "injective-protocol",   "symbol": "inj",   "name": "Injective",            "base_price": 26.50,     "market_cap": 2_500_000_000},
]

SECTOR_MAP = {
    "AI": ["render-token", "fetch-ai", "injective-protocol", "near"],
    "DeFi": ["uniswap", "chainlink", "aave"],
    "Gaming": ["immutable-x", "gala", "axie-infinity"],
    "Memecoins": ["dogecoin", "shiba-inu", "pepe", "bonk", "floki"],
    "L1/L2": ["ethereum", "solana", "cardano", "avalanche-2", "polkadot", "arbitrum", "optimism"],
    "RWA": ["ondo-finance", "centrifuge"],
    "Infrastructure": ["filecoin", "internet-computer", "cosmos", "litecoin"],
}

def _generate_mock_coins() -> list[dict]:
    result = []
    for rank, coin in enumerate(BASE_COINS, start=1):
        price = coin["base_price"] * random.uniform(0.98, 1.02)
        pct_1h = round(random.uniform(-1.5, 1.5), 2)
        pct_24h = round(random.uniform(-5.0, 5.0), 2)
        pct_7d = round(random.uniform(-10.0, 10.0), 2)
        result.append({
            "id": coin["id"],
            "symbol": coin["symbol"],
            "name": coin["name"],
            "image": f"https://assets.coingecko.com/coins/images/{coin['id']}.png",
            "current_price": round(price, 8),
            "market_cap": coin["market_cap"],
            "market_cap_rank": rank,
            "total_volume": coin["market_cap"] * 0.05,
            "high_24h": round(price * 1.03, 8),
            "low_24h": round(price * 0.97, 8),
            "price_change_percentage_24h": pct_24h,
            "price_change_percentage_1h_in_currency": pct_1h,
            "price_change_percentage_7d_in_currency": pct_7d,
            "sparkline_in_7d": {"price": [round(price * (1 + 0.01 * random.gauss(0, 1)), 2) for _ in range(168)]},
            "last_updated": datetime.now(timezone.utc).isoformat()
        })
    return result

def _generate_mock_trending() -> list[dict]:
    return [
        {"id": "pepe", "name": "Pepe", "symbol": "pepe", "market_cap_rank": 30, "thumb": "", "price_btc": 0.00000000018, "score": 0},
        {"id": "dogwifcoin", "name": "dogwifhat", "symbol": "wif", "market_cap_rank": 45, "thumb": "", "price_btc": 0.000041, "score": 1},
        {"id": "bonk", "name": "Bonk", "symbol": "bonk", "market_cap_rank": 55, "thumb": "", "price_btc": 0.00000000041, "score": 2},
        {"id": "floki", "name": "FLOKI", "symbol": "floki", "market_cap_rank": 60, "thumb": "", "price_btc": 0.0000031, "score": 3},
    ]

def _generate_mock_narratives(coins_list: list[dict]) -> list[dict]:
    lookup = {c["id"]: c for c in coins_list}
    sectors = []
    for sector, coin_ids in SECTOR_MAP.items():
        changes = []
        names = []
        for cid in coin_ids:
            c = lookup.get(cid)
            if c:
                changes.append(c.get("price_change_percentage_24h", 0.0))
                names.append(c.get("name", cid))
        avg_change = round(sum(changes) / len(changes), 2) if changes else 0.0
        sectors.append({
            "sector": sector,
            "avg_change": avg_change,
            "coin_count": len(names),
            "coins": names,
            "trend_direction": "up" if avg_change > 1.0 else ("down" if avg_change < -1.0 else "neutral")
        })
    return sectors

def _populate_mock_data():
    coins = _generate_mock_coins()
    _in_memory_cache["pooled_crypto_data"] = coins
    _in_memory_cache["pooled_trending_data"] = _generate_mock_trending()
    _in_memory_cache["pooled_narrative_data"] = _generate_mock_narratives(coins)

    # Prepopulate lists
    _in_memory_lists["pooled_whale_alerts"] = [
        {
            "tx_hash": "".join(random.choices("0123456789abcdef", k=64)),
            "coin": "BTC",
            "amount_usd": 15000000.0,
            "from_wallet": "0xWhaleFromAddress",
            "to_wallet": "0xWhaleToAddress",
            "tx_type": "transfer",
            "timestamp": datetime.now(timezone.utc).isoformat()
        } for _ in range(20)
    ]
    _in_memory_lists["pooled_exchange_flows"] = [
        {
            "exchange": "Binance",
            "coin": "ETH",
            "amount_usd": 8000000.0,
            "direction": "inflow",
            "timestamp": datetime.now(timezone.utc).isoformat()
        } for _ in range(10)
    ]

# Populate mock data initially
_populate_mock_data()


async def init_redis(url: str) -> None:
    """Initialize the async Redis connection pool."""
    global _redis_client, _redis_working
    _redis_client = aioredis.from_url(
        url,
        decode_responses=True,
        max_connections=20,
    )
    # Verify connectivity
    try:
        await _redis_client.ping()
        _redis_working = True
        logger.info("Redis connection established: %s", url)
    except Exception as exc:
        _redis_working = False
        logger.warning("Redis ping failed (falling back to memory mode): %s", exc)


async def close_redis() -> None:
    """Close the Redis connection pool gracefully."""
    global _redis_client, _redis_working
    if _redis_client is not None:
        await _redis_client.aclose()
        _redis_client = None
        _redis_working = False
        logger.info("Redis connection closed")


def get_redis() -> aioredis.Redis:
    """Return the singleton Redis client."""
    if _redis_client is None:
        raise RuntimeError("Redis client not initialized. Call init_redis() first.")
    return _redis_client


def _normalize_key_data(key: str, data: Any) -> Any:
    if data is None:
        return None
        
    if key == "pooled_trending_data":
        # If it's a dict like {"coins": [{"item": {...}}, ...]}, flatten it to list of items
        if isinstance(data, dict) and "coins" in data:
            flat_list = []
            for idx, c in enumerate(data["coins"]):
                item = c.get("item", {})
                flat_list.append({
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "symbol": item.get("symbol"),
                    "market_cap_rank": item.get("market_cap_rank"),
                    "thumb": item.get("thumb"),
                    "price_btc": item.get("price_btc"),
                    "score": item.get("score", idx),
                })
            return flat_list
        return data
        
    if key == "pooled_narrative_data":
        # If it's a dict (like worker writes: {sector_name: sector_info, ...}), convert to list of dicts
        if isinstance(data, dict):
            narratives_list = []
            for sector_name, info in data.items():
                avg_chg = info.get("avg_change")
                if avg_chg is None:
                    avg_chg = info.get("avg_price_change_24h", 0.0)
                narratives_list.append({
                    "sector": info.get("sector", sector_name),
                    "avg_change": avg_chg,
                    "coin_count": info.get("coin_count", 0),
                    "coins": info.get("coins", []),
                    "trend_direction": info.get("trend_direction", "neutral")
                })
            return narratives_list
        return data
        
    return data


def _normalize_list_item(key: str, item: Any) -> Any:
    if not isinstance(item, dict):
        return item
        
    if key == "pooled_whale_alerts":
        # Map worker's fields (coin_symbol, coin_name) to model's fields (coin)
        if "coin" not in item:
            item["coin"] = item.get("coin_symbol", "").upper()
            
    if key == "pooled_exchange_flows":
        # Map worker's fields (coin_symbol, coin_name) to model's fields (coin)
        if "coin" not in item:
            item["coin"] = item.get("coin_symbol", "").upper()
            
    return item


async def get_json(key: str) -> dict | list | None:
    """GET a key from Redis and deserialize as JSON with memory fallback."""
    global _redis_working
    if _redis_working and _redis_client is not None:
        try:
            raw = await _redis_client.get(key)
            if raw is not None:
                val = json.loads(raw)
                return _normalize_key_data(key, val)
        except Exception as exc:
            logger.warning("Redis GET failed, falling back to in-memory: %s", exc)
            _redis_working = False
            
    val = _in_memory_cache.get(key)
    return _normalize_key_data(key, val)


async def set_json(key: str, data: Any, ttl: int = 90) -> None:
    """Serialize data as JSON and SET in Redis/Memory."""
    global _redis_working
    # Write to memory first
    _in_memory_cache[key] = data
    
    if _redis_working and _redis_client is not None:
        try:
            await _redis_client.set(key, json.dumps(data), ex=ttl)
        except Exception as exc:
            logger.warning("Redis SET failed, switching to memory-only: %s", exc)
            _redis_working = False


async def get_list(key: str, count: int = 20) -> list:
    """LRANGE a Redis list and deserialize each element as JSON with memory fallback."""
    global _redis_working
    if _redis_working and _redis_client is not None:
        try:
            raw_items = await _redis_client.lrange(key, 0, count - 1)
            results = []
            for item in raw_items:
                try:
                    val = json.loads(item)
                    results.append(_normalize_list_item(key, val))
                except json.JSONDecodeError:
                    results.append(item)
            return results
        except Exception as exc:
            logger.warning("Redis LRANGE failed, falling back to in-memory: %s", exc)
            _redis_working = False
            
    raw_items = _in_memory_lists.get(key, [])[:count]
    results = []
    for item in raw_items:
        if isinstance(item, str):
            try:
                val = json.loads(item)
                results.append(_normalize_list_item(key, val))
            except json.JSONDecodeError:
                results.append(item)
        else:
            results.append(_normalize_list_item(key, item))
    return results


async def increment_with_ttl(key: str, ttl: int = 86400) -> int:
    """Atomically INCR a counter key in Redis/Memory."""
    global _redis_working
    if _redis_working and _redis_client is not None:
        try:
            count = await _redis_client.incr(key)
            if count == 1:
                await _redis_client.expire(key, ttl)
            return count
        except Exception as exc:
            logger.warning("Redis INCR failed, falling back to in-memory: %s", exc)
            _redis_working = False
            
    _in_memory_counters[key] = _in_memory_counters.get(key, 0) + 1
    return _in_memory_counters[key]
