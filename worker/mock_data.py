"""
mock_data.py — Realistic mock crypto data generators for fallback scenarios.

Every generator produces data matching CoinGecko API response schemas so
downstream consumers never need to know the data is synthetic.
"""

import random
import string
from datetime import datetime, timezone
from typing import Optional

# ---------------------------------------------------------------------------
# Base crypto catalogue — 25 major coins with realistic reference prices
# ---------------------------------------------------------------------------
BASE_COINS: list[dict] = [
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

# Trending-eligible meme / hype coins
TRENDING_COINS: list[dict] = [
    {"id": "pepe",      "symbol": "pepe",  "name": "Pepe",                "base_price": 0.0000125,  "market_cap_rank": 30},
    {"id": "dogwifcoin","symbol": "wif",   "name": "dogwifhat",           "base_price": 2.80,       "market_cap_rank": 45},
    {"id": "bonk",      "symbol": "bonk",  "name": "Bonk",               "base_price": 0.0000280,  "market_cap_rank": 55},
    {"id": "floki",     "symbol": "floki", "name": "FLOKI",              "base_price": 0.000210,   "market_cap_rank": 60},
    {"id": "brett",     "symbol": "brett", "name": "Brett",              "base_price": 0.15,       "market_cap_rank": 85},
    {"id": "mog-coin",  "symbol": "mog",   "name": "Mog Coin",           "base_price": 0.0000022,  "market_cap_rank": 120},
    {"id": "popcat",    "symbol": "popcat","name": "Popcat",             "base_price": 0.85,       "market_cap_rank": 100},
    {"id": "pendle",    "symbol": "pendle","name": "Pendle",             "base_price": 6.20,       "market_cap_rank": 70},
    {"id": "ondo",      "symbol": "ondo",  "name": "Ondo Finance",       "base_price": 1.05,       "market_cap_rank": 65},
    {"id": "turbo",     "symbol": "turbo", "name": "Turbo",              "base_price": 0.0085,     "market_cap_rank": 130},
]


def _jitter(value: float, pct: float = 0.02) -> float:
    """Apply ±pct random jitter to a numeric value."""
    return value * (1.0 + random.uniform(-pct, pct))


def _random_hex(length: int) -> str:
    """Generate a random hex string of the given length."""
    return ''.join(random.choices(string.hexdigits[:16], k=length))


def _iso_now() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def _generate_sparkline(base_price: float, points: int = 168) -> list[float]:
    """Generate a realistic 7-day sparkline (168 hourly points) with a random walk."""
    prices: list[float] = []
    price = base_price * random.uniform(0.92, 1.02)  # Start near base
    for _ in range(points):
        price *= 1.0 + random.gauss(0, 0.005)  # Small random walk
        prices.append(round(price, 8))
    return prices


# ---------------------------------------------------------------------------
# Public generators
# ---------------------------------------------------------------------------

def generate_mock_market_data(last_known: Optional[list[dict]] = None) -> list[dict]:
    """
    Generate mock market data for 25 major cryptocurrencies.

    If *last_known* is provided, applies ±2 % jitter to its numeric fields so
    the data evolves smoothly between poll cycles.  Otherwise generates fresh
    data from the hardcoded base catalogue.
    """

    if last_known:
        result: list[dict] = []
        for coin in last_known:
            price = _jitter(coin.get("current_price", 1.0))
            market_cap = _jitter(coin.get("market_cap", 1_000_000))
            total_volume = _jitter(coin.get("total_volume", 500_000))
            pct_1h = round(random.uniform(-1.5, 1.5), 2)
            pct_24h = round(random.uniform(-5.0, 5.0), 2)
            pct_7d = round(random.uniform(-10.0, 10.0), 2)
            price_change_24h = price * (pct_24h / 100.0)

            result.append({
                "id": coin["id"],
                "symbol": coin["symbol"],
                "name": coin["name"],
                "image": coin.get("image", ""),
                "current_price": round(price, 8),
                "market_cap": round(market_cap),
                "market_cap_rank": coin.get("market_cap_rank", 0),
                "total_volume": round(total_volume),
                "high_24h": round(price * random.uniform(1.01, 1.05), 8),
                "low_24h": round(price * random.uniform(0.95, 0.99), 8),
                "price_change_24h": round(price_change_24h, 8),
                "price_change_percentage_24h": pct_24h,
                "price_change_percentage_1h_in_currency": pct_1h,
                "price_change_percentage_7d_in_currency": pct_7d,
                "sparkline_in_7d": {"price": _generate_sparkline(price)},
                "last_updated": _iso_now(),
            })
        return result

    # --- Fresh generation from base catalogue ---
    result = []
    for rank, coin in enumerate(BASE_COINS, start=1):
        price = _jitter(coin["base_price"])
        market_cap = _jitter(coin["market_cap"])
        total_volume = market_cap * random.uniform(0.02, 0.08)
        pct_1h = round(random.uniform(-1.5, 1.5), 2)
        pct_24h = round(random.uniform(-5.0, 5.0), 2)
        pct_7d = round(random.uniform(-10.0, 10.0), 2)
        price_change_24h = price * (pct_24h / 100.0)

        result.append({
            "id": coin["id"],
            "symbol": coin["symbol"],
            "name": coin["name"],
            "image": "",
            "current_price": round(price, 8),
            "market_cap": round(market_cap),
            "market_cap_rank": rank,
            "total_volume": round(total_volume),
            "high_24h": round(price * random.uniform(1.01, 1.05), 8),
            "low_24h": round(price * random.uniform(0.95, 0.99), 8),
            "price_change_24h": round(price_change_24h, 8),
            "price_change_percentage_24h": pct_24h,
            "price_change_percentage_1h_in_currency": pct_1h,
            "price_change_percentage_7d_in_currency": pct_7d,
            "sparkline_in_7d": {"price": _generate_sparkline(coin["base_price"])},
            "last_updated": _iso_now(),
        })
    return result


def generate_mock_trending() -> dict:
    """
    Generate mock trending data matching the CoinGecko /search/trending schema.

    Returns 7 randomly selected trending coins.
    """
    selected = random.sample(TRENDING_COINS, k=min(7, len(TRENDING_COINS)))
    coins: list[dict] = []

    for coin in selected:
        price = _jitter(coin["base_price"])
        pct_24h = round(random.uniform(-8.0, 25.0), 2)  # Trending coins tend to move more
        coins.append({
            "item": {
                "id": coin["id"],
                "coin_id": random.randint(10000, 99999),
                "name": coin["name"],
                "symbol": coin["symbol"],
                "market_cap_rank": coin["market_cap_rank"],
                "thumb": "",
                "small": "",
                "large": "",
                "slug": coin["id"],
                "price_btc": round(price / 67500.0, 12),
                "score": coins.__len__(),
                "data": {
                    "price": round(price, 8),
                    "price_btc": f"{price / 67500.0:.12f}",
                    "price_change_percentage_24h": {
                        "usd": pct_24h,
                    },
                    "market_cap": f"${round(price * random.uniform(1e8, 1e10)):,}",
                    "market_cap_btc": f"{round(price * random.uniform(1e8, 1e10) / 67500.0, 2)}",
                    "total_volume": f"${round(price * random.uniform(1e7, 1e9)):,}",
                    "total_volume_btc": f"{round(price * random.uniform(1e7, 1e9) / 67500.0, 2)}",
                    "sparkline": "",
                    "content": None,
                },
            }
        })

    return {"coins": coins}


def generate_mock_whale_alert() -> dict:
    """
    Generate a single mock whale alert transaction.
    """
    top_10 = BASE_COINS[:10]
    coin = random.choice(top_10)

    return {
        "coin_id": coin["id"],
        "coin_symbol": coin["symbol"],
        "coin_name": coin["name"],
        "amount_usd": round(random.uniform(500_000, 50_000_000), 2),
        "tx_type": random.choice(["transfer", "buy", "sell"]),
        "tx_hash": _random_hex(64),
        "from_wallet": "0x" + _random_hex(40),
        "to_wallet": "0x" + _random_hex(40),
        "timestamp": _iso_now(),
    }


def generate_mock_exchange_flow() -> dict:
    """
    Generate a single mock exchange flow event.
    """
    exchanges = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit"]
    top_5_coins = [
        {"id": "bitcoin",     "symbol": "btc", "name": "Bitcoin"},
        {"id": "ethereum",    "symbol": "eth", "name": "Ethereum"},
        {"id": "solana",      "symbol": "sol", "name": "Solana"},
        {"id": "binancecoin", "symbol": "bnb", "name": "BNB"},
        {"id": "ripple",      "symbol": "xrp", "name": "XRP"},
    ]

    coin = random.choice(top_5_coins)

    return {
        "exchange": random.choice(exchanges),
        "coin_id": coin["id"],
        "coin_symbol": coin["symbol"],
        "coin_name": coin["name"],
        "amount_usd": round(random.uniform(1_000_000, 100_000_000), 2),
        "direction": random.choice(["inflow", "outflow"]),
        "timestamp": _iso_now(),
    }
