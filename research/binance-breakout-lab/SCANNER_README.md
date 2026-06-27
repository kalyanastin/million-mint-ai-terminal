# Binance USDT Perpetual Live Breakout Scanner

This directory hosts a standalone, real-time scanning tool designed to screen all active USDS-M perpetual contracts on Binance for high-probability breakouts.

---

## 1. Architecture Files

All modules are completely self-contained with **zero external package dependencies** (utilizing standard library calls):

*   `live_scanner.py`: Manages the API scraping cycle, applies liquidity filters, fetches candles, orchestrates signal scoring, and writes output files.
*   `signal_engine.py`: Handles indicator calculations, multi-timeframe trend checks, and the 0-100 confidence scoring algorithm.
*   `risk_manager.py`: Calculates stop-loss distances, R-multiples targets, and tiered position sizes ($15, $50, $100, $1000).
*   `LIVE_BREAKOUTS.md`: Dashboard file showing ranked breakouts with details and risk cards.
*   `SIGNAL_HISTORY.csv`: Historical log of all signals.

---

## 2. Command Line Arguments

You can run the scanner from the workspace root directory with these optional flags:

### Run with a 15-Minute Candle Interval
```bash
python research/binance-breakout-lab/live_scanner.py --interval=15m
```

### Run with a 5-Minute Candle Interval
```bash
python research/binance-breakout-lab/live_scanner.py --interval=5m
```

### Dry Run / Limited Scan (scan only the top 15 highest-volume symbols)
To perform quick validation without querying the entire exchange:
```bash
python research/binance-breakout-lab/live_scanner.py --interval=15m --limit-scan=15
```

---

## 3. Key Filters & Safety Mechanics

1.  **Dynamic Symbol Listing:** Symbol configurations are fetched directly from `/fapi/v1/exchangeInfo` dynamically (no hardcoded lists). Delisted, suspended, or non-USDT contracts are ignored.
2.  **Liquidity Screening:** Rejects any contract with a 24-hour volume below **5,000,000 USDT** or a bid-ask spread wider than **0.20%** to avoid low-liquidity traps.
3.  **Multi-Timeframe Trend Confirmation:** Breakouts are only considered if they align with the trend on both the **4H** and **1D** timeframes (EMA50 vs EMA200).
4.  **Client-Side Throttling:** Introduces a sleep delay between symbol scans to prevent triggering the Binance IP weight limit (HTTP 429).
5.  **Risk & Capital Constraints:** Calculates risk metrics strictly using 1% capital risk parameters, capping leverage at a maximum of **20x** to protect accounts from liquidation.
