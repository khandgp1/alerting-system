# Implementation Plan - Detect Confirmed Uptrend Ranges

This plan outlines the steps to create a script that identifies confirmed uptrend ranges based on the rules in `strategy.md`.

## User Review Required

> [!IMPORTANT]
> The "Confirmed Uptrend" logic assumes that "price action stays above the indicator" refers to the **Close** price of the candle. If it should refer to the **Low** price or any other metric, please clarify.

## Proposed Changes

### Scripts

#### [NEW] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- A Node.js script that:
    - Reads `data/downtrends.md` to get the list of downtrend signal timestamps.
    - Reads `data/btc_hourly_candles.md` for the candle data.
    - For each downtrend signal:
        - Validates if the signal candle is green (Close > Open).
        - If green, sets the Close price as the "indicator".
        - Iterates through subsequent candles until a candle closes below the indicator.
        - Records the start and end of the confirmed uptrend range.
    - Saves the results to `data/confirmed_uptrend.md`.

### Data

#### [NEW] [confirmed_uptrend.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/confirmed_uptrend.md)
- Stores the detected confirmed uptrend ranges in a readable markdown format.

---

## Checklist

- [x] Create `scripts/detect_confirmed_uptrends.js`
- [x] Implement candle data parsing (handling Markdown table format)
- [x] Implement downtrend signal parsing
- [x] Implement confirmed uptrend detection logic
- [x] Test the script with existing data
- [x] Verify results in `data/confirmed_uptrend.md`
- [x] Ensure EST timestamps are used consistently

## Verification Plan

### Manual Verification
- Run `node scripts/detect_confirmed_uptrends.js`.
- Check `data/confirmed_uptrend.md` to ensure the range for `2026-05-13 12:00` is correctly identified (expected: `2026-05-13 12:00` to `2026-05-13 22:00`).
