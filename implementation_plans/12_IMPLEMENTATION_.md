# Overhaul Confirmed Uptrend Script

This plan overhauls `scripts/detect_confirmed_uptrends.js` to strictly follow the new "Confirm Uptrend (Three Consecutive Green Candles)" definition in `strategy.md`.

## User Review Required

> [!IMPORTANT]
> The script will no longer use `data/downtrends.md` as a trigger. It will instead scan the entire candle history for the three-consecutive-green-candle pattern.

> [!NOTE]
> If a confirmed uptrend is already active, the script will skip searching for new patterns until the current uptrend is invalidated (low <= indicator).

## Proposed Changes

### Scripts

#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- Remove dependency on `data/downtrends.md`.
- Implement logic to find three consecutive green candles (close > open).
- Set the `indicator` as the close of the 1st candle in the sequence.
- Confirm the uptrend at the 3rd candle if its low is strictly above the indicator.
- Track the uptrend until a candle's low is at or below the indicator.
- Update the output header and strategy description in the generated markdown.

### Data

#### [MODIFY] [confirmed_uptrend.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/confirmed_uptrend.md)
- This file will be overwritten with the results of the new logic.

---

## Verification Plan

### Automated Tests
- Run `node scripts/detect_confirmed_uptrends.js` and verify it correctly identifies the range starting at 2026-05-13 14:00 (based on the 12:00, 13:00, 14:00 green candles).

### Manual Verification
- Inspect `data/confirmed_uptrend.md` to ensure the "Indicator" and "Start/End" times align with the manual analysis in `implementation_plans/11_IMPLEMENTATION_.md`.

---

## Progress Checklist

- [x] Remove `downtrends.md` parsing from `detect_confirmed_uptrends.js`
- [x] Implement three-consecutive-green-candle detection logic
- [x] Implement indicator baseline and low-price violation logic
- [x] Update output formatting and strategy description
- [x] Run script and verify output in `data/confirmed_uptrend.md`
