"""
worker.py — Million Mint AI Terminal: Zero-Crash Data-Pooling Daemon

This daemon continuously polls CoinGecko for market & trending data, computes
sector narratives, generates synthetic whale / exchange-flow events, and
publishes everything to Redis so the dashboard API can serve it instantly.

Design invariants:
  • NEVER crashes — every layer is wrapped in try/except
  • 429 rate-limit → amber-log, extend TTL, switch to mock fallback for 120 s
  • All I/O is async (httpx + redis.asyncio)
  • Runs standalone: `python worker.py`
"""

from __future__ import annotations

import asyncio
import json
import random
import signal
import sys
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
import redis.asyncio as aioredis

from config import (
    COINGECKO_API_KEY,
    COINGECKO_BASE_URL,
    POLL_INTERVAL_SECONDS,
    REDIS_URL,
)
from mock_data import (
    generate_mock_exchange_flow,
    generate_mock_market_data,
    generate_mock_trending,
    generate_mock_whale_alert,
)

# ---------------------------------------------------------------------------
# Sector classification map
# ---------------------------------------------------------------------------
SECTOR_MAP: dict[str, list[str]] = {
    "AI": ["render-token", "fetch-ai", "injective-protocol", "near"],
    "DeFi": ["uniswap", "chainlink", "aave"],
    "Gaming": ["immutable-x", "gala", "axie-infinity"],
    "Memecoins": ["dogecoin", "shiba-inu", "pepe", "bonk", "floki"],
    "L1/L2": [
        "ethereum", "solana", "cardano", "avalanche-2",
        "polkadot", "arbitrum", "optimism",
    ],
    "RWA": ["ondo-finance", "centrifuge"],
    "Infrastructure": ["filecoin", "internet-computer", "cosmos", "litecoin"],
}

# Reverse lookup: coin_id → sector name
_COIN_TO_SECTOR: dict[str, str] = {}
for _sector, _coins in SECTOR_MAP.items():
    for _cid in _coins:
        _COIN_TO_SECTOR[_cid] = _sector

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------

def _log(level: str, message: str) -> None:
    """Print a timestamped log line.  Level should be INFO, AMBER, or ERROR."""
    ts = datetime.now(timezone.utc).isoformat()
    print(f"[{ts}] [{level}] {message}", flush=True)


# ---------------------------------------------------------------------------
# Worker class
# ---------------------------------------------------------------------------

class CryptoPoolingWorker:
    """Encapsulates all state for a single worker lifecycle."""

    def __init__(self) -> None:
        self._shutdown_event = asyncio.Event()
        self._redis: Optional[aioredis.Redis] = None
        self._http: Optional[httpx.AsyncClient] = None
        self._last_known_market: Optional[list[dict]] = None

        # 429 back-off state
        self._rate_limited_until: float = 0.0  # epoch timestamp

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    async def start(self) -> None:
        """Main entry-point — runs the infinite poll loop."""

        _log("INFO", "Million Mint AI Terminal — data-pooling worker starting…")

        # --- Redis ---
        try:
            self._redis = aioredis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=10,
            )
            await self._redis.ping()
            _log("INFO", f"Connected to Redis at {REDIS_URL}")
        except Exception as exc:
            _log("ERROR", f"Redis connection failed: {exc} — will retry each cycle")
            self._redis = None

        # --- HTTP client ---
        self._http = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            follow_redirects=True,
        )
        _log("INFO", f"HTTP client initialised (timeout=30 s)")
        _log("INFO", f"CoinGecko base URL: {COINGECKO_BASE_URL}")
        _log("INFO", f"API key configured: {'yes' if COINGECKO_API_KEY else 'no'}")
        _log("INFO", f"Poll interval: {POLL_INTERVAL_SECONDS} s")

        # --- Install signal handlers (best-effort, not all OS support it) ---
        self._install_signal_handlers()

        # --- Poll loop ---
        while not self._shutdown_event.is_set():
            try:
                await self._poll_cycle()
            except Exception as exc:
                _log("ERROR", f"Unhandled error in poll cycle: {exc}")

            _log("INFO", f"Poll cycle complete. Next in {POLL_INTERVAL_SECONDS}s")

            # Interruptible sleep
            try:
                await asyncio.wait_for(
                    self._shutdown_event.wait(),
                    timeout=POLL_INTERVAL_SECONDS,
                )
            except asyncio.TimeoutError:
                pass  # Normal — timeout means it's time to poll again

        # --- Cleanup ---
        await self._cleanup()

    # ------------------------------------------------------------------
    # Signal handling
    # ------------------------------------------------------------------

    def _install_signal_handlers(self) -> None:
        """Register SIGINT / SIGTERM to trigger graceful shutdown."""
        loop = asyncio.get_running_loop()
        for sig_name in ("SIGINT", "SIGTERM"):
            sig = getattr(signal, sig_name, None)
            if sig is None:
                continue
            try:
                loop.add_signal_handler(sig, self._handle_signal, sig_name)
            except NotImplementedError:
                # Windows doesn't support add_signal_handler for all signals
                pass

    def _handle_signal(self, sig_name: str) -> None:
        _log("INFO", f"Received {sig_name} — initiating graceful shutdown…")
        self._shutdown_event.set()

    async def _cleanup(self) -> None:
        """Close Redis & HTTP connections."""
        try:
            if self._http:
                await self._http.aclose()
                _log("INFO", "HTTP client closed")
        except Exception as exc:
            _log("ERROR", f"Error closing HTTP client: {exc}")

        try:
            if self._redis:
                await self._redis.aclose()
                _log("INFO", "Redis connection closed")
        except Exception as exc:
            _log("ERROR", f"Error closing Redis: {exc}")

        _log("INFO", "Worker shutdown complete")

    # ------------------------------------------------------------------
    # Redis helpers (safe — never raises)
    # ------------------------------------------------------------------

    async def _ensure_redis(self) -> bool:
        """Make sure Redis is connected; attempt reconnect if not."""
        if self._redis is not None:
            try:
                await self._redis.ping()
                return True
            except Exception:
                _log("AMBER", "Redis ping failed — attempting reconnect")
                self._redis = None

        try:
            self._redis = aioredis.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=10,
            )
            await self._redis.ping()
            _log("INFO", "Reconnected to Redis")
            return True
        except Exception as exc:
            _log("ERROR", f"Redis reconnect failed: {exc}")
            self._redis = None
            return False

    async def _redis_set(self, key: str, value: str, ttl: int) -> bool:
        """SET a key with TTL.  Returns False on failure (never raises)."""
        try:
            if not await self._ensure_redis():
                return False
            assert self._redis is not None
            await self._redis.set(key, value, ex=ttl)
            return True
        except Exception as exc:
            _log("ERROR", f"Redis SET {key} failed: {exc}")
            return False

    async def _redis_lpush_ltrim(self, key: str, value: str, max_len: int) -> bool:
        """LPUSH then LTRIM to cap the list length."""
        try:
            if not await self._ensure_redis():
                return False
            assert self._redis is not None
            await self._redis.lpush(key, value)
            await self._redis.ltrim(key, 0, max_len - 1)
            return True
        except Exception as exc:
            _log("ERROR", f"Redis LPUSH {key} failed: {exc}")
            return False

    async def _redis_extend_ttl(self, key: str, ttl: int) -> None:
        """Extend the TTL of an existing key (best-effort)."""
        try:
            if self._redis:
                await self._redis.expire(key, ttl)
        except Exception:
            pass

    # ------------------------------------------------------------------
    # CoinGecko HTTP helpers
    # ------------------------------------------------------------------

    def _build_headers(self) -> dict[str, str]:
        headers: dict[str, str] = {"accept": "application/json"}
        if COINGECKO_API_KEY:
            headers["x-cg-demo-api-key"] = COINGECKO_API_KEY
        return headers

    def _is_rate_limited(self) -> bool:
        return time.monotonic() < self._rate_limited_until

    def _set_rate_limited(self, seconds: float = 120.0) -> None:
        self._rate_limited_until = time.monotonic() + seconds

    # ------------------------------------------------------------------
    # Poll cycle — the heart of the worker
    # ------------------------------------------------------------------

    async def _poll_cycle(self) -> None:
        """Execute one full poll cycle (market data, trending, sectors, events)."""

        # ── 1. Market data ──────────────────────────────────────────────
        await self._fetch_market_data()

        # ── 2. Trending ────────────────────────────────────────────────
        await self._fetch_trending_data()

        # ── 3. Sector / narrative analysis ─────────────────────────────
        await self._compute_narratives()

        # ── 4. Whale alerts (0-3 synthetic) ────────────────────────────
        await self._generate_whale_alerts()

        # ── 5. Exchange flows (0-2 synthetic) ──────────────────────────
        await self._generate_exchange_flows()

    # ------------------------------------------------------------------
    # Step 1 — Market data
    # ------------------------------------------------------------------

    async def _fetch_market_data(self) -> None:
        market_data: Optional[list[dict]] = None
        used_mock = False

        if self._is_rate_limited():
            _log("AMBER", "Still in 429 backoff window — using mock market data")
            market_data = generate_mock_market_data(self._last_known_market)
            used_mock = True
        else:
            try:
                url = (
                    f"{COINGECKO_BASE_URL}/coins/markets"
                    "?vs_currency=usd"
                    "&order=market_cap_desc"
                    "&per_page=25"
                    "&page=1"
                    "&sparkline=true"
                    "&price_change_percentage=1h,24h,7d"
                )
                assert self._http is not None
                resp = await self._http.get(url, headers=self._build_headers())

                if resp.status_code == 200:
                    market_data = resp.json()
                    _log("INFO", f"CoinGecko /coins/markets OK — {len(market_data)} coins")
                elif resp.status_code == 429:
                    _log("AMBER", "CoinGecko rate limited (429) — switching to mock fallback")
                    self._set_rate_limited(120.0)
                    await self._redis_extend_ttl("pooled_crypto_data", 120)
                    market_data = generate_mock_market_data(self._last_known_market)
                    used_mock = True
                else:
                    _log("ERROR", f"CoinGecko /coins/markets returned {resp.status_code}: {resp.text[:200]}")
                    market_data = generate_mock_market_data(self._last_known_market)
                    used_mock = True

            except Exception as exc:
                _log("ERROR", f"CoinGecko /coins/markets request failed: {exc}")
                market_data = generate_mock_market_data(self._last_known_market)
                used_mock = True

        if market_data:
            self._last_known_market = market_data
            payload = json.dumps(market_data)
            ttl = 90 if not used_mock else 60
            ok = await self._redis_set("pooled_crypto_data", payload, ttl)
            if ok:
                _log("INFO", f"Stored pooled_crypto_data (TTL={ttl}s, mock={used_mock})")

    # ------------------------------------------------------------------
    # Step 2 — Trending
    # ------------------------------------------------------------------

    async def _fetch_trending_data(self) -> None:
        trending: Optional[dict] = None
        used_mock = False

        if self._is_rate_limited():
            trending = generate_mock_trending()
            used_mock = True
        else:
            try:
                url = f"{COINGECKO_BASE_URL}/search/trending"
                assert self._http is not None
                resp = await self._http.get(url, headers=self._build_headers())

                if resp.status_code == 200:
                    trending = resp.json()
                    _log("INFO", "CoinGecko /search/trending OK")
                elif resp.status_code == 429:
                    _log("AMBER", "CoinGecko trending rate limited (429) — mock fallback")
                    self._set_rate_limited(120.0)
                    trending = generate_mock_trending()
                    used_mock = True
                else:
                    _log("ERROR", f"CoinGecko /search/trending returned {resp.status_code}")
                    trending = generate_mock_trending()
                    used_mock = True

            except Exception as exc:
                _log("ERROR", f"CoinGecko /search/trending failed: {exc}")
                trending = generate_mock_trending()
                used_mock = True

        if trending:
            payload = json.dumps(trending)
            ok = await self._redis_set("pooled_trending_data", payload, 120)
            if ok:
                _log("INFO", f"Stored pooled_trending_data (TTL=120s, mock={used_mock})")

    # ------------------------------------------------------------------
    # Step 3 — Sector / narrative computation
    # ------------------------------------------------------------------

    async def _compute_narratives(self) -> None:
        """Categorise current market data into sector narratives."""
        try:
            if not self._last_known_market:
                _log("AMBER", "No market data available for narrative computation")
                return

            # Build a coin_id → coin dict for quick lookup
            coin_lookup: dict[str, dict] = {
                c["id"]: c for c in self._last_known_market
            }

            sectors: dict[str, dict] = {}

            for sector_name, coin_ids in SECTOR_MAP.items():
                changes: list[float] = []
                names: list[str] = []
                for cid in coin_ids:
                    coin = coin_lookup.get(cid)
                    if coin:
                        pct = coin.get("price_change_percentage_24h")
                        if pct is not None:
                            changes.append(float(pct))
                        names.append(coin.get("name", cid))

                avg_change = round(sum(changes) / len(changes), 2) if changes else 0.0

                if avg_change > 1.0:
                    trend_direction = "up"
                elif avg_change < -1.0:
                    trend_direction = "down"
                else:
                    trend_direction = "neutral"

                sectors[sector_name] = {
                    "sector": sector_name,
                    "avg_price_change_24h": avg_change,
                    "coin_count": len(names),
                    "coins": names,
                    "trend_direction": trend_direction,
                }

            payload = json.dumps(sectors)
            ok = await self._redis_set("pooled_narrative_data", payload, 120)
            if ok:
                _log("INFO", f"Stored pooled_narrative_data ({len(sectors)} sectors)")

        except Exception as exc:
            _log("ERROR", f"Narrative computation failed: {exc}")

    # ------------------------------------------------------------------
    # Step 4 — Whale alerts (synthetic)
    # ------------------------------------------------------------------

    async def _generate_whale_alerts(self) -> None:
        try:
            count = random.randint(0, 3)
            for _ in range(count):
                alert = generate_mock_whale_alert()
                await self._redis_lpush_ltrim(
                    "pooled_whale_alerts",
                    json.dumps(alert),
                    max_len=50,
                )
            if count > 0:
                _log("INFO", f"Pushed {count} whale alert(s) to pooled_whale_alerts")
        except Exception as exc:
            _log("ERROR", f"Whale alert generation failed: {exc}")

    # ------------------------------------------------------------------
    # Step 5 — Exchange flows (synthetic)
    # ------------------------------------------------------------------

    async def _generate_exchange_flows(self) -> None:
        try:
            count = random.randint(0, 2)
            for _ in range(count):
                flow = generate_mock_exchange_flow()
                await self._redis_lpush_ltrim(
                    "pooled_exchange_flows",
                    json.dumps(flow),
                    max_len=30,
                )
            if count > 0:
                _log("INFO", f"Pushed {count} exchange flow(s) to pooled_exchange_flows")
        except Exception as exc:
            _log("ERROR", f"Exchange flow generation failed: {exc}")


# ---------------------------------------------------------------------------
# Entry-point
# ---------------------------------------------------------------------------

async def main() -> None:
    worker = CryptoPoolingWorker()
    await worker.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO] Worker stopped by user")
    except Exception as e:
        print(f"[FATAL] Unexpected error: {e}")
        print("[INFO] Restarting in 10 seconds…")
        time.sleep(10)
        # In production you'd loop or let a process supervisor restart.
        sys.exit(1)
