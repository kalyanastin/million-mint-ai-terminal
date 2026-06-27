# Quantitative Backtesting & Evaluation Framework

This document outlines the systematic backtesting, validation, and statistical validation framework used to evaluate algorithmic trading systems inside the Million Mint Strategy Research Lab.

---

## 1. Key Performance Metrics

To ensure consistency, survivability, and high risk-adjusted performance rather than raw profit, we track the following metrics:

### Win Rate ($WR$)
The ratio of winning trades to total trades executed:
$$WR = \frac{\text{Number of Winning Trades}}{\text{Total Number of Trades}}$$
*   *Note:* Win rate alone is insufficient. A high win rate with a massive average loss is a common failure mode.

### Profit Factor ($PF$)
The ratio of gross profits to gross losses:
$$PF = \frac{\sum \text{Profits of Winning Trades}}{\sum |\text{Losses of Losing Trades}|}$$
*   *Interpretation:* A $PF < 1.0$ indicates a losing system. A robust system target is between $1.3$ and $2.0$. Values above $2.5$ in backtesting often indicate lookahead bias or overfitting.

### Sharpe Ratio ($SR$)
Measures excess return per unit of total risk (standard deviation of daily returns):
$$SR = \frac{R_p - R_f}{\sigma_p}$$
Where $R_p$ is the annualized portfolio return, $R_f$ is the risk-free rate, and $\sigma_p$ is the standard deviation of annualized returns.
*   *Target:* $> 1.5$ is acceptable, $> 2.0$ is excellent.

### Sortino Ratio
A variation of the Sharpe ratio that only penalizes downside volatility:
$$\text{Sortino} = \frac{R_p - R_f}{\sigma_d}$$
Where $\sigma_d$ is the standard deviation of negative asset returns (downside deviation). This is more appropriate for trend-following strategies which have positive right-skewed return distributions (infrequent large wins).

### Maximum Drawdown ($MaxDD$)
The largest peak-to-trough decline in portfolio equity, expressed as a percentage:
$$MaxDD = \frac{\text{Peak Value} - \text{Trough Value}}{\text{Peak Value}}$$
*   *Target:* Must be kept under $15\%$ in backtests to survive market transitions.

### Calmar Ratio
The ratio of annualized return to maximum drawdown:
$$\text{Calmar} = \frac{\text{Annualized Return}}{MaxDD}$$
*   *Interpretation:* A high Calmar ratio (e.g., $> 2.0$) indicates the strategy achieves its return with minimal drawdown risk.

### Expectancy ($E$)
The average amount expected to be won or lost per trade, in terms of R (risk unit):
$$E = (WR \times \text{Average Win in R}) - ((1 - WR) \times \text{Average Loss in R})$$
*   *Interpretation:* A positive expectancy (e.g., $> 0.2R$) is required for long-term survivability.

### Average R-Multiple
The average profit/loss of trades expressed as a multiple of the initial risk (distance to Stop-Loss).
*   *Target:* Target $> 0.3R$ to ensure transaction costs do not erode capital.

---

## 2. Walk-Forward Testing Methodology

To prevent overfitting (parameter fitting to a specific market period), the system implements a strict **Walk-Forward Analysis (WFA)**.

```
Time Horizon ───────────────────────────────────────────────►
[    Train 1    ][ Val 1 ][ Out-of-Sample 1 ]
     [    Train 2    ][ Val 2 ][ Out-of-Sample 2 ]
          [    Train 3    ][ Val 3 ][ Out-of-Sample 3 ]
```

1.  **Training Set (60%):** Used to optimize strategy parameters (e.g., Donchian window length, ATR multiplier, volume thresholds) over a specific historical regime.
2.  **Validation Set (20%):** Used to select the best-performing parameter sets that display stability and prevent selection of outlier results.
3.  **Out-of-Sample Set (20%):** A strictly blind test set. The chosen strategy parameters are run on this data *exactly once* to verify real-world consistency.

---

## 3. Monte Carlo Simulation Mechanics

Backtest equity curves are deterministic and assume perfect execution. To assess the true range of risk, we run a **1,000-path Monte Carlo Simulation** by randomizing:

*   **Trade Order Sequence:** Shuffles the sequence of historical trades to test the probability of consecutive losses (consecutive losses lead to account-wide risk circuit breakers triggering).
*   **Slippage Injection:** Randomly subtracts $0.05\%$ to $0.20\%$ from entry prices and adds it to exit prices on every trade to simulate low-liquidity slippage.
*   **Execution Latency Drag:** Artificially delays orders by a random number of seconds, simulating price slippage on fast breakout candles (dragging prices higher on longs and lower on shorts).

### Key Monte Carlo Outputs:
1.  **Expected Drawdown (95% & 99% Confidence Interval):** The maximum drawdown that only $5\%$ (or $1\%$) of the simulated runs exceeded.
2.  **Probability of Ruin ($PoR$):** The percentage of paths where the account equity falls below a defined liquidation threshold (e.g., $50\%$ drawdown).
3.  **Confidence Bands:** Plots the median, 10th, and 90th percentile equity paths to visualize potential performance variance.

---

## 4. Bias Prevention Checklist

| Bias | Description | Prevention Mechanism |
| :--- | :--- | :--- |
| **Lookahead Bias** | Using future data to make trading decisions (e.g., calculating indicators using the close of the current candle before it closes). | All indicator calculations are shifted by 1 candle (`shift(1)`) so that signals are generated strictly using completed candles. |
| **Survivorship Bias**| Backtesting only on assets that exist today, omitting those that went bankrupt or got delisted. | We evaluate historical segments including coins that experienced extreme volatility. In production, we scan a dynamically refreshed basket. |
| **Overfitting (Curve Fitting)** | Adjusting strategy inputs until the backtest looks perfect for a specific period, rendering it useless on live data. | WFA partitioning, simple indicator choices, ADX trend filters, and keeping parameter count $< 5$. |
| **Slippage Neglect** | Assuming limit/market orders fill exactly at the candle close. | Incorporating slippage model ($0.05\%$-$0.20\%$) and latency price drag directly into the backtest engine. |
