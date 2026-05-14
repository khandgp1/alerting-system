# Implementation Plan - Simplify Downtrend Detection

The goal is to modify the downtrend detection logic in `scripts/detect_downtrends.js` to trigger a signal whenever the preceding candle is red, removing the requirement that the candle before that must be green (not red).

## Proposed Changes

### [scripts/detect_downtrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_downtrends.js)

- Update the loop logic to remove the `isPrevPrevRed` check.
- Update the strategy description in the output file header.

### [data/downtrends.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/downtrends.md)

- The file will be overwritten by the script with the new list of signals.

## Checklist

- [x] Modify `scripts/detect_downtrends.js` to remove `isPrevPrevRed` condition.
- [x] Update header in `scripts/detect_downtrends.js` to reflect "Every Candle After Red".
- [x] Run `node scripts/detect_downtrends.js`.
- [x] Verify `data/downtrends.md` contains more signals (including consecutive ones).
- [x] Verify `2026-05-14 00:00:00` is now included.
