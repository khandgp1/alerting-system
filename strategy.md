Identify Downtrends:
- Uses 1h closed candles (BTC/USDT)
- previous candle is red (close < open)
- triggers on every candle following a red candle

Confirm Uptrend:
- Evaluate the 1h candle that triggered the downtrend signal
- If this signal candle closes green (close > open), record its closing price as the "indicator" baseline
- The next candle must close above the indicator to confirm the uptrend
- Once confirmed, the trend remains valid for subsequent 1h candles as long as their closing price stays above the indicator

