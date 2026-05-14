# Implementation Plan - Update Confirm Uptrend Logic

Update the `scripts/detect_confirmed_uptrends.js` script to enforce the new confirmation rule: the candle following a green signal candle must close above the "indicator" (the signal candle's close) for the uptrend to be considered confirmed.

## User Review Required

> [!IMPORTANT]
> The current script includes the signal candle in the confirmed range. I will maintain this behavior but only record the range if the *following* candle confirms the trend.

## Proposed Changes

### Alerting System Scripts

#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- Update the detection loop to check the candle at `signalIndex + 1`.
- If the next candle's close is not strictly greater than the `indicator`, the signal is ignored.
- If confirmed, the range will extend from the signal candle's open time until the first candle that closes at or below the indicator.
- Update the script's output header to reflect the "Next candle confirmation" rule.

## Verification Plan

### Automated Tests
- Run `node scripts/detect_confirmed_uptrends.js`.
- Inspect `data/confirmed_uptrend.md` to ensure only ranges with a confirming second candle are present.
- Manually verify a few cases against `data/btc_hourly_candles.md`.

### Manual Verification
- Check the "Ongoing" status for the most recent potential uptrends to see if they are waiting for confirmation or correctly marked as confirmed.

## Progress Checklist

- [x] Modify `scripts/detect_confirmed_uptrends.js` with new confirmation logic
- [x] Update output formatting/description in the generated markdown
- [x] Run the script and verify results in `data/confirmed_uptrend.md`
- [x] Cross-reference results with raw candle data to ensure accuracy
