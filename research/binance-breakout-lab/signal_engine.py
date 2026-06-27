"""
signal_engine.py

Calculates indicators (EMA, Donchian, Volume SMA, ATR) and evaluates breakout confidence
from raw candles data fetched from Binance Futures. Uses standard libraries for zero dependency.
"""

import math

def calculate_ema(prices: list[float], period: int) -> float:
    if not prices:
        return 0.0
    if len(prices) < period:
        return prices[-1]
    alpha = 2.0 / (period + 1)
    ema = prices[0]
    for p in prices[1:]:
        ema = (p * alpha) + (ema * (1.0 - alpha))
    return ema

def calculate_sma(values: list[float], period: int) -> float:
    if not values:
        return 0.0
    slice_vals = values[-period:]
    return sum(slice_vals) / len(slice_vals)

def calculate_atr(highs: list[float], lows: list[float], closes: list[float], period: int = 14) -> tuple[float, float]:
    """Returns (current_atr, previous_atr) in pure Python."""
    if len(closes) < period + 1:
        return 0.0, 0.0
    
    tr_values = []
    for i in range(1, len(closes)):
        h = highs[i]
        l = lows[i]
        pc = closes[i-1]
        tr = max(h - l, abs(h - pc), abs(l - pc))
        tr_values.append(tr)
        
    current_atr = sum(tr_values[-period:]) / period
    prev_atr = sum(tr_values[-period-1:-1]) / period
    return current_atr, prev_atr

class SignalEngine:
    @staticmethod
    def evaluate_symbol(
        symbol: str,
        exec_klines: list[dict],  # list of dict with keys: open, high, low, close, volume, timestamp
        trend_4h_klines: list[dict],
        trend_1d_klines: list[dict]
    ) -> dict:
        """
        Evaluates breakout conditions for a symbol and returns scoring details.
        """
        # Ensure we have enough data
        if len(exec_klines) < 30 or len(trend_4h_klines) < 200 or len(trend_1d_klines) < 200:
            return {"symbol": symbol, "eligible": False, "reason": "Insufficient data length"}

        # Extract execution candles values
        closes = [c["close"] for c in exec_klines]
        highs = [c["high"] for c in exec_klines]
        lows = [c["low"] for c in exec_klines]
        volumes = [c["volume"] for c in exec_klines]
        
        # Last completed candle is at index -2
        current_close = closes[-2]
        current_high = highs[-2]
        current_low = lows[-2]
        current_volume = volumes[-2]
        
        # 1. Donchian Breakout
        # Previous 20 candle range bounds (index -22 to -3)
        prev_highs = highs[-22:-2]
        prev_lows = lows[-22:-2]
        donchian_high = max(prev_highs)
        donchian_low = min(prev_lows)
        
        long_breakout = current_close > donchian_high
        short_breakout = current_close < donchian_low
        
        if not long_breakout and not short_breakout:
            return {"symbol": symbol, "eligible": False, "reason": "No breakout detected"}
            
        direction = "LONG" if long_breakout else "SHORT"
        breakout_level = donchian_high if long_breakout else donchian_low
        
        # 2. Multi-Timeframe Trend Confirmation (EMA50 vs EMA200 on 4H and 1D)
        # 4H EMA
        closes_4h = [c["close"] for c in trend_4h_klines]
        ema50_4h = calculate_ema(closes_4h, 50)
        ema200_4h = calculate_ema(closes_4h, 200)
        
        # 1D EMA
        closes_1d = [c["close"] for c in trend_1d_klines]
        ema50_1d = calculate_ema(closes_1d, 50)
        ema200_1d = calculate_ema(closes_1d, 200)
        
        trend_aligned_4h = (direction == "LONG" and ema50_4h > ema200_4h) or (direction == "SHORT" and ema50_4h < ema200_4h)
        trend_aligned_1d = (direction == "LONG" and ema50_1d > ema200_1d) or (direction == "SHORT" and ema50_1d < ema200_1d)
        
        # Reject if trend is not aligned on both higher timeframes
        if not trend_aligned_4h or not trend_aligned_1d:
            return {"symbol": symbol, "eligible": False, "reason": f"Trend not aligned on 4H/1D for {direction}"}
            
        # 3. Volume SMA (20 period on execution timeframe)
        volume_sma = calculate_sma(volumes[:-2], 20)
        vol_multiple = current_volume / volume_sma if volume_sma > 0 else 0.0
        
        # 4. ATR calculations (14 period on execution timeframe)
        current_atr, prev_atr = calculate_atr(highs[:-1], lows[:-1], closes[:-1], 14)
        # Verify ATR SMA over last 20 ATRs
        atr_tr_buf = []
        for i in range(1, len(closes) - 1):
            h = highs[i]
            l = lows[i]
            pc = closes[i-1]
            tr = max(h - l, abs(h - pc), abs(l - pc))
            atr_tr_buf.append(tr)
            
        # Calculate trailing ATRs for SMA
        atr_history = []
        for idx in range(14, len(atr_tr_buf)):
            atr_history.append(sum(atr_tr_buf[idx-14:idx]) / 14.0)
            
        atr_sma = sum(atr_history[-20:]) / 20.0 if atr_history else current_atr
        atr_expansion_pct = (current_atr - atr_sma) / atr_sma if atr_sma > 0 else 0.0
        
        # 5. Momentum/ROC (last 20 candles of execution timeframe)
        roc = (closes[-2] - closes[-22]) / closes[-22] if len(closes) >= 22 else 0.0
        momentum_score = abs(roc)
        
        return {
            "symbol": symbol,
            "eligible": True,
            "direction": direction,
            "entry_price": closes[-1],  # Price at the close of breakout/start of next candle
            "breakout_level": breakout_level,
            "volume_multiple": vol_multiple,
            "atr_expansion_pct": atr_expansion_pct,
            "atr": current_atr,
            "momentum_score": momentum_score,
            "trend_score_4h": abs(ema50_4h - ema200_4h) / ema200_4h,
            "trend_score_1d": abs(ema50_1d - ema200_1d) / ema200_1d
        }
        
    @staticmethod
    def calculate_confidence_scores(signals: list[dict]) -> list[dict]:
        """
        Takes raw signal evaluations, shuffles/ranks them for relative strength, and returns the confidence score.
        Confidence Score Model:
        - 25% Trend Strength: (Aligned on 4H/1D is pre-required for eligible. Score based on EMA slope & spacing).
        - 25% Volume Expansion: volume > 2x SMA (gives 20 pts, up to 25 pts for 4x volume).
        - 20% Breakout Strength: distance closed past the channel bound relative to ATR.
        - 15% ATR Expansion: ATR ratio above average.
        - 15% Relative Strength: Rank-percentile momentum score across all eligible assets.
        """
        if not signals:
            return []
            
        # Rank by momentum_score for Relative Strength (15%)
        sorted_by_momentum = sorted(signals, key=lambda x: x["momentum_score"])
        num_signals = len(sorted_by_momentum)
        
        scored_signals = []
        
        for idx, sig in enumerate(sorted_by_momentum):
            # 1. Trend Strength (25 points max)
            # Alignment gets 15 points. Slope spacing gets up to 10 points.
            trend_val = sig["trend_score_4h"] + sig["trend_score_1d"]
            trend_score = 15.0 + min(10.0, trend_val * 100.0)
            
            # 2. Volume Expansion (25 points max)
            vol_mult = sig["volume_multiple"]
            if vol_mult >= 2.0:
                volume_score = min(25.0, 15.0 + (vol_mult - 2.0) * 5.0)
            else:
                volume_score = max(0.0, vol_mult * 7.5) # Under 2x is penalized
                
            # 3. Breakout Strength (20 points max)
            # Distance of Close from Breakout level / ATR
            breakout_dist = abs(sig["entry_price"] - sig["breakout_level"])
            breakout_ratio = breakout_dist / sig["atr"] if sig["atr"] > 0 else 0.0
            breakout_score = min(20.0, 10.0 + breakout_ratio * 10.0)
            
            # 4. ATR Expansion (15 points max)
            atr_exp = sig["atr_expansion_pct"]
            if atr_exp > 0:
                atr_score = min(15.0, 10.0 + atr_exp * 20.0)
            else:
                atr_score = max(0.0, 10.0 + atr_exp * 10.0)
                
            # 5. Relative Strength (15 points max)
            # Percentile rank
            percentile = (idx + 1) / num_signals if num_signals > 0 else 1.0
            rs_score = percentile * 15.0
            
            # Total Score
            total_confidence = trend_score + volume_score + breakout_score + atr_score + rs_score
            total_confidence = max(0.0, min(100.0, round(total_confidence, 2)))
            
            scored_signals.append({
                "symbol": sig["symbol"],
                "direction": sig["direction"],
                "entry": sig["entry_price"],
                "breakout_level": sig["breakout_level"],
                "volume_multiple": round(vol_mult, 2),
                "atr_expansion_pct": round(atr_exp * 100.0, 2),
                "atr": round(sig["atr"], 4),
                "confidence": total_confidence,
                "score_breakdown": {
                    "trend_25": round(trend_score, 2),
                    "volume_25": round(volume_score, 2),
                    "breakout_20": round(breakout_score, 2),
                    "atr_15": round(atr_score, 2),
                    "rel_strength_15": round(rs_score, 2)
                }
            })
            
        return scored_signals
