# Phase 2 - Validation Report

This report presents concrete mathematical evidence and parameter sweeps validating the Million Mint Breakout Strategy Architecture. All trading data is exported for independent verification.

---

## 1. Sensitivity Analysis & Parameter Sweeps

A grid search was executed over the validation period across all 4 coins:
*   **ATR Multiplier:** 1.5, 2.0, 2.5
*   **EMA Spans (4H/1D filters):** (200, 1200), (400, 2400)
*   **Volume Ratio Filters:** 1.0, 1.5, 2.0

### Grid Search Outcomes

| ATR Multiplier | EMA Spans (4H, 1D) | Volume Filter | Avg Sharpe | Sharpe Var | Portfolio Net Profit | Total Trades |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 2.5 | (400, 2400) | 1.5 | 4.04 | 28.5222 | 8.51% | 35 |
| 2.0 | (400, 2400) | 1.5 | 2.97 | 7.7837 | 5.90% | 37 |
| 2.5 | (200, 1200) | 1.5 | 2.42 | 9.5814 | 5.25% | 35 |
| 2.0 | (200, 1200) | 1.5 | 1.55 | 3.7467 | 3.26% | 37 |
| 2.0 | (400, 2400) | 1.0 | 1.29 | 12.3484 | 3.43% | 52 |
| 2.5 | (400, 2400) | 2.0 | 1.06 | 122.1627 | 3.23% | 13 |
| 2.5 | (400, 2400) | 1.0 | 1.00 | 23.5839 | 4.25% | 50 |
| 1.5 | (400, 2400) | 1.5 | 0.69 | 7.1628 | -0.46% | 39 |
| 2.0 | (200, 1200) | 1.0 | 0.35 | 5.0540 | 0.22% | 54 |
| 1.5 | (400, 2400) | 1.0 | 0.08 | 9.6732 | -0.60% | 55 |
| 2.5 | (200, 1200) | 1.0 | -0.00 | 11.0229 | 0.78% | 52 |
| 1.5 | (200, 1200) | 1.0 | -0.89 | 2.4113 | -3.78% | 57 |
| 1.5 | (200, 1200) | 1.5 | -2.65 | 19.2843 | -2.95% | 39 |
| 1.5 | (400, 2400) | 2.0 | -4.49 | 215.1484 | 2.07% | 14 |
| 2.5 | (200, 1200) | 2.0 | -15.10 | 1318.3075 | 2.41% | 13 |
| 2.0 | (400, 2400) | 2.0 | -17.61 | 1576.2865 | 1.71% | 13 |
| 2.0 | (200, 1200) | 2.0 | -30.84 | 1760.8614 | 1.42% | 13 |
| 1.5 | (200, 1200) | 2.0 | -43.18 | 6053.4149 | 1.84% | 14 |


### Parameter Set Classifications

*   **Best Parameter Set (Highest Sharpe):**
    *   ATR Multiplier: `2.5`
    *   EMA Spans: `(400, 2400)`
    *   Volume Filter: `1.5`
    *   Avg Portfolio Sharpe: `4.0450`
    *   Portfolio Net Profit: `8.51%`
*   **Worst Parameter Set (Lowest Sharpe):**
    *   ATR Multiplier: `1.5`
    *   EMA Spans: `(200, 1200)`
    *   Volume Filter: `2.0`
    *   Avg Portfolio Sharpe: `-43.1759`
    *   Portfolio Net Profit: `1.84%`
*   **Most Stable Parameter Set (Lowest Sharpe Variance & Positive Profit):**
    *   ATR Multiplier: `2.0`
    *   EMA Spans: `(200, 1200)`
    *   Volume Filter: `1.5`
    *   Sharpe Variance: `3.746663`
    *   Portfolio Net Profit: `3.26%`

---

## 2. Monthly Returns Breakdown

Table representing combined net PnL and percentage returns for the portfolio ($100,000 baseline per coin, total $400,000):

| Month | BTCUSDT | ETHUSDT | SOLUSDT | BNBUSDT | Portfolio Total PnL ($) | Return (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 2026-01 | $0.00 | $-430.40 | $0.00 | $-2,007.95 | $-2,438.35 | -0.61% |
| 2026-02 | $1,992.59 | $-1,005.15 | $196.38 | $208.24 | $1,392.07 | 0.35% |
| 2026-03 | $-900.76 | $-393.82 | $1,993.13 | $2,061.80 | $2,760.36 | 0.69% |
| 2026-04 | $-869.19 | $-9.68 | $-1,031.15 | $2,093.01 | $182.99 | 0.05% |
| 2026-05 | $0.00 | $386.46 | $1,998.41 | $-1,030.82 | $1,354.05 | 0.34% |
| 2026-06 | $0.00 | $2,111.00 | $-148.74 | $-1,611.75 | $350.51 | 0.09% |


---

## 3. Equity Curve & Drawdown Visualizations

### BTCUSDT

#### Equity Curve
```text
101984.39 |             █████                                           
101763.90 |                         █                                   
101543.41 |                  ███████                                    
101322.93 |                                                             
101102.44 |                                                             
100881.95 |                          ██████████████                     
100661.46 |                                                             
100440.98 |            █                                                
100220.49 |                                                             
100000.00 | ███████████                            █████████████████████
         ------------------------------------------------------------
```

#### Drawdown Curve
```text
    0.02 |                                        █████████████████████
    0.02 |                                                             
    0.02 |                                                             
    0.02 |                                    ████                     
    0.01 |                          ██████████                         
    0.01 |                                                             
    0.01 |                  ███████                                    
    0.01 |                         █                                   
    0.00 |            █                                                
    0.00 | ███████████ █████                                           
         ------------------------------------------------------------
```

---

### ETHUSDT

#### Equity Curve
```text
100584.35 |                                                        █████
100309.62 |                                                             
100034.90 |                                                             
99760.18 | █                                                           
99485.46 |  ██████                                                     
99210.74 |                                                             
98936.02 |                                                       █     
98661.29 |                                                             
98386.57 |        ████████████████████   ██████          ████████      
98111.85 |                            ███      ██████████              
         ------------------------------------------------------------
```

#### Drawdown Curve
```text
    0.02 |                                     ██████████              
    0.02 |                            ███                              
    0.02 |        ████████████████████   ██████          ████████      
    0.02 |                                                             
    0.01 |                                                       █     
    0.01 |                                                             
    0.01 |  ██████                                                     
    0.01 |                                                             
    0.00 |                                                             
    0.00 | █                                                      █████
         ------------------------------------------------------------
```

---

### SOLUSDT

#### Equity Curve
```text
103073.16 |                                             █████████████   
102731.69 |                                                          ███
102390.23 |                                                             
102048.77 |                    ███████████            ██                
101707.31 |       █████                              █                  
101365.85 |                                                             
101024.39 |            ██                 ███████████                   
100682.92 |                                                             
100341.46 |      █                                                      
100000.00 | █████        ██████                                         
         ------------------------------------------------------------
```

#### Drawdown Curve
```text
    0.02 |              ██████                                         
    0.02 |                                                             
    0.01 |                                                             
    0.01 |                                                             
    0.01 |                               ███████████  █             ███
    0.01 |                                             █████████████   
    0.01 |            ██                            ██                 
    0.00 |                                                             
    0.00 |                                                             
    0.00 | ███████████        ███████████                              
         ------------------------------------------------------------
```

---

### BNBUSDT

#### Equity Curve
```text
102273.82 |                                █████████████████████        
101796.06 |                                                             
101318.29 |                                                             
100840.52 |                                                     ███████ 
100362.76 |                  ████████                                  █
99884.99 | █              ██        ██████                             
99407.23 |                                                             
98929.46 |  █  ███                                                     
98451.69 |                                                             
97973.93 |   ██   ████████                                             
         ------------------------------------------------------------
```

#### Drawdown Curve
```text
    0.02 |   ██                                                        
    0.02 |        ████████                                             
    0.02 |                                                            █
    0.01 |                          ███                          ███   
    0.01 |                             ███                          ██ 
    0.01 |  █   ██          ████████                           ██      
    0.01 |                                                             
    0.00 |     █                                                       
    0.00 |                                                             
    0.00 | █              ██              █████████████████████        
         ------------------------------------------------------------
```

---

## 4. Verification Check

All raw trades generated during this validation process have been exported to:
[raw_trade_log.csv](file:///c:/Users/ADMIN%20PC/.gemini/antigravity-ide/scratch/million-mint-ai-terminal/research/binance-breakout-lab/raw_trade_log.csv)

The workspace structure remains untouched, and only the isolated files in `/research/binance-breakout-lab/` have been updated.
