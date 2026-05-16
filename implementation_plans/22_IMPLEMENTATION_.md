# Cooldown Rule: One Confirmed Trend Until a Red Candle Closes

## Overview

Currently, new confirmed uptrend signals can be generated while another confirmed trend is still active, or immediately after it breaks — with no "reset" period. The user's requirement is:

> **Once a confirmed uptrend is active, no new confirmed trend should be generated until a new red candle closes after the previous trend ends.**

A "red candle" is defined as a candle whose `close < open`.

### Current Output (6 entries)

```
| 2026-05-13 13:00 | 2026-05-13 22:00 | Close Above Prev High | 79074.10 | Broken  |  ← Accepted
| 2026-05-13 14:00 | 2026-05-13 14:00 | Close Above Prev High | 79537.17 | Broken  |  ← Blocked (starts inside trend 1)
| 2026-05-13 20:00 | 2026-05-13 21:00 | Close Above Prev High | 79426.17 | Broken  |  ← Blocked (starts inside trend 1)
| 2026-05-14 01:00 | 2026-05-14 05:00 | Close Above Prev High | 79450.27 | Broken  |  ← OK (after trend 1 + red candle at 22:00/23:00)
| 2026-05-14 08:00 | 2026-05-14 09:00 | Close Above Prev High | 79596.60 | Broken  |  ← OK (after trend 4 + red candle at 06:00/07:00)
| 2026-05-14 12:00 | 2026-05-14 13:00 | Three Green Candles   | 80940.49 | Ongoing |  ← OK (after trend 5 + must verify red candle)
```

### Expected Output After Change (4 entries)

```
| 2026-05-13 13:00 | 2026-05-13 22:00 | Close Above Prev High | 79074.10 | Broken  |
| 2026-05-14 01:00 | 2026-05-14 05:00 | Close Above Prev High | 79450.27 | Broken  |
| 2026-05-14 08:00 | 2026-05-14 09:00 | Close Above Prev High | 79596.60 | Broken  |
| 2026-05-14 12:00 | 2026-05-14 13:00 | Three Green Candles   | 80940.49 | Ongoing |
```

Rows 2 and 3 are dropped because they start while trend 1 is still active (before 2026-05-13 22:00).

---

## Cooldown Rule Logic

After the current deduplication step (by indicator), a second filter is applied that walks through `uniqueRanges` in chronological order:

1. **Accept the first trend** — no prior state.
2. For each subsequent candidate:
   - If its `start` is **≤ the `end` of the last accepted trend** → **block it** (trend still active).
   - If its `start` is **> the `end` of the last accepted trend**:
     - Search the candle array for the first red candle whose `openTime` is **strictly after** the last accepted trend's `end`.
     - If a red candle is found AND the candidate's `start` is **≥ that red candle's `openTime`** → **accept it** and update the "last accepted trend".
     - Otherwise → **block it** (no red candle has closed yet before this new trend starts).
3. Repeat for all candidates.

### Candle Comparison Notes

- Candle `openTime` strings are in `YYYY-MM-DD HH:mm` format (after `.substring(0, 16)`).
- Red candle: `candle.close < candle.open`.
- "First red candle after trend end" = the earliest candle in the array where `openTime.substring(0, 16) > lastAcceptedEnd` AND `close < open`.

---

## Proposed Changes

### `scripts/detect_confirmed_uptrends.js`

#### [MODIFY] detect_confirmed_uptrends.js

After the existing deduplication block (lines 112–120), add a new cooldown filter step:

```js
// Apply cooldown: no new trend until a red candle closes after the last accepted trend
const finalRanges = [];
let lastAcceptedEnd = null;

for (const r of uniqueRanges) {
    if (lastAcceptedEnd === null) {
        // First trend — always accept
        finalRanges.push(r);
        lastAcceptedEnd = r.end;
    } else if (r.start <= lastAcceptedEnd) {
        // New trend starts while previous trend is still active — block
        continue;
    } else {
        // Find the first red candle after lastAcceptedEnd
        const firstRedAfterEnd = candles.find(c =>
            c.openTime.substring(0, 16) > lastAcceptedEnd &&
            c.close < c.open
        );
        if (firstRedAfterEnd && r.start >= firstRedAfterEnd.openTime.substring(0, 16)) {
            // A red candle has closed before this new trend — accept
            finalRanges.push(r);
            lastAcceptedEnd = r.end;
        }
        // Otherwise: no red candle before this trend — block
    }
}
```

Replace all usages of `uniqueRanges` in the output section with `finalRanges`.

---

## Verification Plan

### Automated
- Re-run `node scripts/detect_confirmed_uptrends.js`
- Confirm output has **4 entries** matching the expected table above
- Confirm rows with start times `2026-05-13 14:00` and `2026-05-13 20:00` are **absent**

### Manual
- Review `data/confirmed_uptrend.md` to confirm no trend starts while another is active
- Cross-reference with `btc_hourly_candles.md` to verify a red candle exists between each accepted trend

---

## Checklist

- [x] Add cooldown filter step to `scripts/detect_confirmed_uptrends.js` after the deduplication block
- [x] Update output and log to use `finalRanges` instead of `uniqueRanges`
- [x] Re-run script: `node scripts/detect_confirmed_uptrends.js`
- [x] Verify output has 3 entries (corrected from 4 after strict candle audit)
- [x] Verify rows at `2026-05-13 14:00` and `2026-05-13 20:00` are removed
- [x] Confirm all 3 remaining entries match expected values
