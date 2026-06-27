"""
risk_manager.py

Calculates Stop-Loss levels, Take-Profit targets (1R, 2R, 3R), and tiered position sizes
(capital sizes: $15, $50, $100, $1000) for trading signals.
"""

class RiskManager:
    @staticmethod
    def calculate_trade_risk(
        entry: float,
        direction: str,
        atr: float,
        capital_tiers: list[float] = [15.0, 50.0, 100.0, 1000.0]
    ) -> dict:
        """
        Returns Stop Loss, Take Profit targets, and position sizing details for different account tiers.
        """
        # Stop loss is defined as 2 * ATR from entry
        sl_dist = 2.0 * atr
        
        if direction == "LONG":
            sl = entry - sl_dist
            tp_1r = entry + sl_dist
            tp_2r = entry + 2.0 * sl_dist
            tp_3r = entry + 3.0 * sl_dist
        else:
            sl = entry + sl_dist
            tp_1r = entry - sl_dist
            tp_2r = entry - 2.0 * sl_dist
            tp_3r = entry - 3.0 * sl_dist
            
        tiers_metrics = {}
        
        for capital in capital_tiers:
            # 1% risk per trade
            risk_amount = capital * 0.01
            
            # Position size (contract units) = risk_amount / price_distance_to_sl
            if sl_dist > 0:
                raw_size = risk_amount / sl_dist
            else:
                raw_size = 0.0
                
            # Leverage = (position_size * entry_price) / account_capital
            notional_value = raw_size * entry
            required_leverage = notional_value / capital if capital > 0 else 0.0
            
            # Cap leverage at 20x
            capped_size = raw_size
            leverage = required_leverage
            is_leverage_capped = False
            
            if required_leverage > 20.0:
                capped_size = (capital * 20.0) / entry
                leverage = 20.0
                is_leverage_capped = True
                
            tiers_metrics[f"${int(capital)}"] = {
                "risk_amount": round(risk_amount, 2),
                "position_size": round(capped_size, 6),
                "notional_value": round(capped_size * entry, 2),
                "leverage": round(leverage, 1),
                "is_leverage_capped": is_leverage_capped
            }
            
        return {
            "entry": round(entry, 4),
            "direction": direction,
            "atr_stop": round(sl_dist, 4),
            "stop_loss": round(sl, 4),
            "tp_1r": round(tp_1r, 4),
            "tp_2r": round(tp_2r, 4),
            "tp_3r": round(tp_3r, 4),
            "position_sizing": tiers_metrics
        }
