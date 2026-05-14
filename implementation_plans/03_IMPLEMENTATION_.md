# Refine Downtrend Signal Logic

## Overview

Update the downtrend detection logic to be more specific. Currently, the script identifies *every* candle that follows any red candle. The user wants to limit this so that if there is a sequence of red candles (a downtrend), only the **first** candle after the **first** red candle in that sequence is recorded.

Basically, we want to signal the *start* of the downtrend detection, not every subsequent step of it.

### Logic Change

**Current:**
- Candle `i-1` is Red -> Signal at Candle `i`.

**Proposed:**
- Candle `i-1` is Red **AND** Candle `i-2` was NOT Red (or does not exist) -> Signal at Candle `i`.

This ensures that for a streak of Red, Red, Red, Green, only the candle after the first Red is logged.

---

## Proposed Changes

### Script Update

#### [MODIFY] `scripts/detect_downtrends.js`(file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_downtrends.js)

- Update the loop logic to check the state of the candle *before* the previous candle.
- Ensure the first candle in the data is handled correctly (if it's red, the second candle is a signal).

---

## Verification Plan

### Automated
- Run `node scripts/detect_downtrends.js` and verify `data/downtrends.md` has fewer entries than before.

### Manual Spot Check
- Check `data/btc_hourly_candles.md`.
- 11:00 is Red. 12:00 follows it. (Signal)
- 12:00 is Red. 13:00 follows it. (No Signal - previous-previous was also Red).
- Verify the output matches this logic.

---

## Checklist

- [x] Modify `scripts/detect_downtrends.js` with the "first red" logic
- [x] Run the script
- [x] Verify `data/downtrends.md` output:
  - [x] 2026-05-13 12:00 should be present
  - [x] 2026-05-13 13:00 should be REMOVED
  - [x] 2026-05-13 14:00 should be REMOVED
- [x] Confirm no regressions in file formatting
