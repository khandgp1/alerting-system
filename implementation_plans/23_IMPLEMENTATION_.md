# Exclude Same-Hour Confirmed Uptrend Ranges

## Goal

A confirmed uptrend that starts and ends within the **same clock hour** is considered too brief to be meaningful and must be excluded from `data/confirmed_uptrend.md`.

### Example rows to exclude (from current output):

| Start (EST) | End (EST) | Rule | Indicator | Status |
|---|---|---|---|---|
| 2026-05-15 03:00 | 2026-05-15 03:00 | Close Above Prev High | 80596.18 | Broken |
| 2026-05-15 13:00 | 2026-05-15 13:00 | Three Green Candles | 79202.32 | Broken |

Both rows share the same `Start` and `End` timestamp — meaning the trend was only ever confirmed for that one candle and immediately invalidated in the same hour.

---

## Proposed Changes

### `scripts/detect_confirmed_uptrends.js` — [MODIFY]

After the `finalRanges` array is fully assembled (after the cooldown logic, around line 147), add a **filter step** that drops any range where `start === end`.

#### Logic

```js
// Exclude trends that only lasted within a single hour (start === end)
const filteredRanges = finalRanges.filter(r => r.start !== r.end);
```

Then replace all references to `finalRanges` in the output-writing section with `filteredRanges`, and update the console log message accordingly.

---

## Checklist

- [x] Read current script to confirm exact line numbers for insertion point
- [x] Add same-hour filter after the `finalRanges` cooldown block
- [x] Rename output variable from `finalRanges` → `filteredRanges` in:
  - [x] The `forEach` loop that builds the output table
  - [x] The `length === 0` guard check
  - [x] The `console.log` message
- [x] Re-run the script: `node scripts/detect_confirmed_uptrends.js`
- [x] Verify `data/confirmed_uptrend.md` no longer contains same-hour entries
- [x] Confirm all multi-hour trends are still present and unchanged

---

## Verification Plan

Run the script and confirm the output file:
- Does **not** contain `2026-05-15 03:00 | 2026-05-15 03:00`
- Does **not** contain `2026-05-15 13:00 | 2026-05-15 13:00`
- Still contains multi-hour entries like `2026-05-13 13:00 | 2026-05-13 22:00`
