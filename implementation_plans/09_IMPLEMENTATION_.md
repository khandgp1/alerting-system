# Implementation Plan 09 - Remove Green Candle Requirement for Uptrend Confirmation

This plan details the changes required to allow any signal candle (regardless of whether it closed green or red) to initiate the "Confirm Uptrend" sequence, using its closing price as the indicator baseline.

## User Review Required

> [!IMPORTANT]
> This change will likely increase the number of confirmed uptrend ranges, as signals that were previously ignored due to being red candles (like the 2026-05-14 07:00 signal) will now be evaluated.

## Proposed Changes

### Strategy Documentation

#### [MODIFY] [strategy.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/strategy.md)
- Update the "Confirm Uptrend" rule to remove the requirement that the signal candle must be green.
- Specify that the signal candle's closing price is used as the indicator regardless of color.

### Detection Script

#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- Remove the `if (signalCandle.close > signalCandle.open)` conditional check.
- Ensure the `indicator` is always set to `signalCandle.close` for every signal.

## Verification Plan

### Automated Tests
- Run `node scripts/detect_confirmed_uptrends.js` and verify that new ranges are detected for signals that were previously ignored (e.g., the 07:00 signal on 2026-05-14).
- Inspect `data/confirmed_uptrend.md` to ensure the "Indicator (Close)" column matches the closing price of the corresponding signal candles.

### Manual Verification
- Manually calculate the expected confirmation for the `2026-05-14 07:00` signal:
    - Signal Close (Indicator): 79270.44
    - Next candle (08:00): Close 79784.66, Low 79302.34.
    - Result: Since both Close and Low are > 79270.44, the uptrend should confirm at 08:00.

## Progress Checklist
- [x] Update `strategy.md`
- [x] Update `scripts/detect_confirmed_uptrends.js`
- [x] Run detection script
- [x] Verify `data/confirmed_uptrend.md` output
