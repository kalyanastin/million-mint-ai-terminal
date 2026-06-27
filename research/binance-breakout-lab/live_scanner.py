"""
live_scanner.py

Entrypoint script for the Binance USDT-M Perpetual Live Breakout Scanner.
Queries symbols dynamically, applies liquidity filters, fetches multi-timeframe candles,
calculates confidence scores, risk parameters, updates LIVE_BREAKOUTS.md and SIGNAL_HISTORY.csv.
"""

import os
import sys
import json
import time
import urllib.request
from datetime import datetime

from signal_engine import SignalEngine
from risk_manager import RiskManager

# ===========================================================================
# HTTP REQUEST HELPER
# ===========================================================================

def binance_api_get(path: str) -> dict | list:
    url = f"https://fapi.binance.com{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"[ERROR] API request failed for {url}: {e}")
        return []

# ===========================================================================
# CANDLE PARSING
# ===========================================================================

def parse_klines(klines_raw: list) -> list[dict]:
    """Converts raw list kline formats to dictionaries."""
    parsed = []
    for k in klines_raw:
        parsed.append({
            "timestamp": datetime.fromtimestamp(k[0] / 1000.0),
            "open": float(k[1]),
            "high": float(k[2]),
            "low": float(k[3]),
            "close": float(k[4]),
            "volume": float(k[5])
        })
    return parsed

# ===========================================================================
# SCANS SWEEP LIFE-CYCLE
# ===========================================================================

def run_scan_sweep(interval: str = "15m", limit_scan: int = 0):
    print(f"[{datetime.now().isoformat()}] Starting scan sweep for USDS-M perpetuals (Interval: {interval})...")
    
    # 1. Fetch Tickers for Liquidity Screening
    print("Fetching active symbol tickers for volume filtering...")
    tickers = binance_api_get("/fapi/v1/ticker/24hr")
    if not tickers:
        print("[FATAL] Could not retrieve ticker information.")
        return
        
    print("Fetching active order books for spread filtering...")
    book_tickers = binance_api_get("/fapi/v1/ticker/bookTicker")
    if not book_tickers:
        print("[FATAL] Could not retrieve order book information.")
        return
        
    # Build maps
    ticker_map = {t["symbol"]: t for t in tickers}
    book_map = {b["symbol"]: b for b in book_tickers}
    
    # 2. Retrieve exchange information dynamically
    print("Retrieving exchange information...")
    exch_info = binance_api_get("/fapi/v1/exchangeInfo")
    if not exch_info or "symbols" not in exch_info:
        print("[FATAL] Could not retrieve exchange information.")
        return
        
    eligible_symbols = []
    
    # Filter for active trading USDT perpetuals with volume >= 5M and spread <= 0.20%
    for sym_info in exch_info["symbols"]:
        symbol = sym_info["symbol"]
        status = sym_info["status"]
        contract_type = sym_info["contractType"]
        quote_asset = sym_info["quoteAsset"]
        
        if quote_asset == "USDT" and status == "TRADING" and contract_type == "PERPETUAL":
            ticker = ticker_map.get(symbol)
            book = book_map.get(symbol)
            if not ticker or not book:
                continue
                
            quote_vol = float(ticker["quoteVolume"])
            bid = float(book["bidPrice"])
            ask = float(book["askPrice"])
            
            # Liquidity Filter checks
            if quote_vol < 5000000.0:  # 5 Million USDT threshold
                continue
                
            if bid <= 0:
                continue
                
            spread = (ask - bid) / bid
            if spread > 0.0020:  # 0.20% spread threshold
                continue
                
            eligible_symbols.append((symbol, quote_vol))
            
    # Sort eligible symbols by 24h volume descending
    eligible_symbols.sort(key=lambda x: x[1], reverse=True)
    
    # Limit scans for dry-run validation if specified
    if limit_scan > 0:
        eligible_symbols = eligible_symbols[:limit_scan]
        print(f"Restricting scan to top {limit_scan} symbols by volume.")
        
    print(f"Found {len(eligible_symbols)} symbols passing the liquidity filters.")
    
    raw_signals = []
    scanned_count = 0
    
    for symbol, vol in eligible_symbols:
        scanned_count += 1
        log_str = f"[{scanned_count}/{len(eligible_symbols)}] Evaluating {symbol} (Vol: ${vol:,.0f})..."
        try:
            print(log_str, end="\r")
            sys.stdout.flush()
        except UnicodeEncodeError:
            print(log_str.encode('ascii', 'ignore').decode('ascii'), end="\r")
            sys.stdout.flush()
        
        # Throttling to prevent IP rate-limiting (25ms)
        time.sleep(0.025)
        
        # Fetch candles
        # Execution timeframe: fetch 50 candles
        exec_klines_raw = binance_api_get(f"/fapi/v1/klines?symbol={symbol}&interval={interval}&limit=50")
        if not exec_klines_raw:
            continue
        exec_klines = parse_klines(exec_klines_raw)
        
        # 4H trend timeframe: fetch 250 candles
        trend_4h_raw = binance_api_get(f"/fapi/v1/klines?symbol={symbol}&interval=4h&limit=250")
        if not trend_4h_raw:
            continue
        trend_4h = parse_klines(trend_4h_raw)
        
        # 1D trend timeframe: fetch 250 candles
        trend_1d_raw = binance_api_get(f"/fapi/v1/klines?symbol={symbol}&interval=1d&limit=250")
        if not trend_1d_raw:
            continue
        trend_1d = parse_klines(trend_1d_raw)
        
        # Evaluate signal conditions
        sig = SignalEngine.evaluate_symbol(symbol, exec_klines, trend_4h, trend_1d)
        if sig.get("eligible"):
            raw_signals.append(sig)
            
    print(f"\nCompleted analysis. Scanned: {scanned_count} symbols. Breakouts found: {len(raw_signals)}")
    
    # Calculate confidence scores (integrating Relative Strength rank)
    scored_signals = SignalEngine.calculate_confidence_scores(raw_signals)
    
    # Filter for dashboard display: Confidence >= 80
    dashboard_signals = [s for s in scored_signals if s["confidence"] >= 80.0]
    
    # Sort by confidence score descending
    dashboard_signals.sort(key=lambda x: x["confidence"], reverse=True)
    
    # Risk calculation for signals
    long_signals = []
    short_signals = []
    
    for s in dashboard_signals:
        risk_metrics = RiskManager.calculate_trade_risk(s["entry"], s["direction"], s["atr"])
        s["risk"] = risk_metrics
        
        # Categorize
        if s["direction"] == "LONG" and len(long_signals) < 10:
            long_signals.append(s)
        elif s["direction"] == "SHORT" and len(short_signals) < 10:
            short_signals.append(s)
            
        # Write Alerts to console
        if s["confidence"] > 85.0:
            print(f"\n[ALERT] High Confidence Breakout: {s['symbol']} | Direction: {s['direction']} | Confidence: {s['confidence']}% | Volume Mult: {s['volume_multiple']}x")
            
    # Write to LIVE_BREAKOUTS.md
    write_dashboard(long_signals, short_signals, interval, scanned_count)
    
    # Append to SIGNAL_HISTORY.csv
    append_history(long_signals + short_signals)
    
    print("\nScan sweep finished. Results updated in LIVE_BREAKOUTS.md and SIGNAL_HISTORY.csv.")

# ===========================================================================
# STORAGE FUNCTIONS
# ===========================================================================

def write_dashboard(longs: list[dict], shorts: list[dict], interval: str, total_scanned: int):
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    md = f"""# Binance USDT Perpetual Live Breakout Scanner - Dashboard

**Last Scan Sweep:** {timestamp_str}  
**Execution Interval:** `{interval}` | **Active Liquid Symbols Scanned:** {total_scanned}

This dashboard ranks and displays real-time breakout signals on Binance USDT-M Perpetual contracts with a **Confidence Score >= 80**.

---

## 1. Top 10 Long Breakout Signals

| Rank | Symbol | Confidence | Entry Price | Breakout Level | Volume Mult | ATR Exp % | Score Breakdown |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
"""
    if not longs:
        md += "| - | No Long breakout signals found | - | - | - | - | - | - |\n"
    else:
        for idx, s in enumerate(longs):
            b = s["score_breakdown"]
            breakdown_str = f"Trend: {b['trend_25']} | Vol: {b['volume_25']} | Breakout: {b['breakout_20']} | ATR: {b['atr_15']} | RS: {b['rel_strength_15']}"
            md += f"| {idx+1} | **{s['symbol']}** | {s['confidence']}% | {s['entry']} | {s['breakout_level']} | {s['volume_multiple']}x | {s['atr_expansion_pct']}% | {breakdown_str} |\n"

    md += """
---

## 2. Top 10 Short Breakout Signals

| Rank | Symbol | Confidence | Entry Price | Breakout Level | Volume Mult | ATR Exp % | Score Breakdown |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
"""
    if not shorts:
        md += "| - | No Short breakout signals found | - | - | - | - | - | - |\n"
    else:
        for idx, s in enumerate(shorts):
            b = s["score_breakdown"]
            breakdown_str = f"Trend: {b['trend_25']} | Vol: {b['volume_25']} | Breakout: {b['breakout_20']} | ATR: {b['atr_15']} | RS: {b['rel_strength_15']}"
            md += f"| {idx+1} | **{s['symbol']}** | {s['confidence']}% | {s['entry']} | {s['breakout_level']} | {s['volume_multiple']}x | {s['atr_expansion_pct']}% | {breakdown_str} |\n"

    md += """
---

## 3. Tiered Position Sizing & Stop Loss Risk Parameters

Detailed metrics for the identified breakout candidates. All position sizing targets a strict **1% risk parameters** per trade.

"""
    
    all_signals = longs + shorts
    if not all_signals:
        md += "_No active signals to display risk metrics._\n"
    else:
        for s in all_signals:
            r = s["risk"]
            sizes = r["position_sizing"]
            
            md += f"""### {s['symbol']} ({s['direction']} - Confidence: {s['confidence']}%)

*   **Entry Price:** {r['entry']} | **Stop Loss (ATR):** {r['stop_loss']} | **ATR Stop Distance:** {r['atr_stop']}
*   **Profit Target Multiples:**
    *   **1R Target:** {r['tp_1r']}
    *   **2R Target:** {r['tp_2r']}
    *   **3R Target:** {r['tp_3r']}

#### Capital-Tiered Position Sizes & Leverage

| Account Capital | Risk Amount | Position Size (Contracts) | Notional Value | Leverage | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **$15** | ${sizes['$15']['risk_amount']:.2f} | {sizes['$15']['position_size']} | ${sizes['$15']['notional_value']} | {sizes['$15']['leverage']}x | {"Leverage Capped (20x)" if sizes['$15']['is_leverage_capped'] else "Optimal Sizing"} |
| **$50** | ${sizes['$50']['risk_amount']:.2f} | {sizes['$50']['position_size']} | ${sizes['$50']['notional_value']} | {sizes['$50']['leverage']}x | {"Leverage Capped (20x)" if sizes['$50']['is_leverage_capped'] else "Optimal Sizing"} |
| **$100** | ${sizes['$100']['risk_amount']:.2f} | {sizes['$100']['position_size']} | ${sizes['$100']['notional_value']} | {sizes['$100']['leverage']}x | {"Leverage Capped (20x)" if sizes['$100']['is_leverage_capped'] else "Optimal Sizing"} |
| **$1000** | ${sizes['$1000']['risk_amount']:.2f} | {sizes['$1000']['position_size']} | ${sizes['$1000']['notional_value']} | {sizes['$1000']['leverage']}x | {"Leverage Capped (20x)" if sizes['$1000']['is_leverage_capped'] else "Optimal Sizing"} |

---
"""
            
    md_path = "research/binance-breakout-lab/LIVE_BREAKOUTS.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md)

def append_history(signals: list[dict]):
    csv_path = "research/binance-breakout-lab/SIGNAL_HISTORY.csv"
    
    # Initialize file with headers if it does not exist
    if not os.path.exists(csv_path):
        with open(csv_path, "w", encoding="utf-8") as f:
            f.write("Timestamp,Symbol,Direction,Confidence,Entry,StopLoss,TakeProfit,VolumeMultiple,ATRExpansionPct\n")
            
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    with open(csv_path, "a", encoding="utf-8") as f:
        for s in signals:
            r = s["risk"]
            f.write(f"{timestamp_str},{s['symbol']},{s['direction']},{s['confidence']},{s['entry']},{r['stop_loss']},{r['tp_2r']},{s['volume_multiple']},{s['atr_expansion_pct']}\n")

# ===========================================================================
# COMMAND LINE INTERFACE
# ===========================================================================

if __name__ == "__main__":
    interval = "15m"
    limit_scan = 0
    
    # Parse basic arguments
    for arg in sys.argv[1:]:
        if arg.startswith("--interval="):
            interval = arg.split("=")[1]
        elif arg.startswith("--limit-scan="):
            limit_scan = int(arg.split("=")[1])
            
    run_scan_sweep(interval, limit_scan)
