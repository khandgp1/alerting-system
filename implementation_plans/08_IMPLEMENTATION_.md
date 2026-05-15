# Implementation Plan - Update Confirmed Uptrend Rules

The goal is to update the confirmed uptrend detection logic in `scripts/detect_confirmed_uptrends.js` to match the updated rules in `strategy.md`.

## User Review Required

> [!IMPORTANT]
> The new rule states: "The next candle must close above the indicator to confirm the uptrend AND if the low of the candle is below the indicator the close then the confirmed trend can't start until the next candle".
> 
> I have interpreted this as:
> 1. We look for the first candle after the signal candle.
> 2. This candle must have `close > indicator`.
> 3. If it also has `low >= indicator`, the trend is confirmed starting at this candle.
> 4. If it has `low < indicator` (but still `close > indicator`), we wait for the next candle to confirm.
> 5. If any candle in this sequence has `close <= indicator`, the confirmation fails.

## Proposed Changes

### Scripts

#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)

- Update the candle parsing loop to extract the `low` price from `parts[4]`.
- Update the confirmation logic (around line 60-65) to:
    - Loop through subsequent candles.
    - Check for `close > indicator`.
    - Check for `low >= indicator` to start the range.
    - Handle the delay if `low < indicator`.

## Verification Plan

### Automated Tests
- Run `node scripts/detect_confirmed_uptrends.js` and verify the output in `data/confirmed_uptrend.md`.
- Compare the new results with existing data to ensure the "low below indicator" rule is correctly filtering out or delaying starts.

### Manual Verification
- Inspect `data/btc_hourly_candles.md` for specific cases where a candle closed above the indicator but dipped below it (low < indicator) to confirm the logic handles it correctly.

## Checklist

- [x] Update `scripts/detect_confirmed_uptrends.js` candle parsing to include `low`.
- [x] Implement the new confirmation logic with the `low >= indicator` check.
- [x] Run the script to regenerate `data/confirmed_uptrend.md`.
- [x] Verify the results against the candle data.
