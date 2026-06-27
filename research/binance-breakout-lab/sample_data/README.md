# Simulated Trading Data

This directory contains simulated asset OHLCV data files used for backtesting.

## Columns Description
*   `timestamp`: Date and time (hourly interval).
*   `open`: Opening price of the hour.
*   `high`: Highest price of the hour.
*   `low`: Lowest price of the hour.
*   `close`: Closing price of the hour.
*   `volume`: Aggregated trading volume.
*   `regime_true`: Ground-truth regime name (TRENDING, LOW_VOLATILITY, VOLATILE, RANGING).
*   `donchian_high`: 20-period upper Donchian bound.
*   `donchian_low`: 20-period lower Donchian bound.
*   `ema_4h`: 4H trend EMA (approx 200 hours).
*   `ema_1d`: 1D trend EMA (approx 1200 hours).
*   `atr`: 14-period Average True Range.
*   `bb_width`: Bollinger Band width (used for regime detection).
