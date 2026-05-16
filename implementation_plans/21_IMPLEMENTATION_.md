# One Confirmed Trend Per Indicator (First Match Only)

## Overview

Currently, `scripts/detect_confirmed_uptrends.js` can emit **multiple confirmed uptrend entries that share the same indicator value** — for example, when both Rule 1 (Three Green Candles) and Rule 2 (Close Above Prev High) trigger on overlapping candle windows with identical indicators, or when the same rule fires multiple times with the same indicator level.

The objective is to enforce that **only one confirmed trend is recorded per unique indicator value**, and that one entry is the **first confirmed trend detected** (earliest start time). All subsequent entries sharing the same indicator value should be discarded.

## Current Data (confirmed_uptrend.md)

Looking at the existing output:

| Start (EST)      | End (EST)        | Rule                | Indicator | Status  |
|------------------|------------------|---------------------|-----------|---------|
| 2026-05-13 13:00 | 2026-05-13 22:00 | Close Above Prev High | 79074.10 | Broken |
| 2026-05-13 14:00 | 2026-05-13 22:00 | Three Green Candles | 79074.10 | Broken |  ← duplicate indicator
| 2026-05-13 14:00 | 2026-05-13 14:00 | Close Above Prev High | 79537.17 | Broken |
| 2026-05-13 20:00 | 2026-05-13 21:00 | Close Above Prev High | 79426.17 | Broken |
| 2026-05-14 01:00 | 2026-05-14 05:00 | Close Above Prev High | 79450.27 | Broken |
| 2026-05-14 08:00 | 2026-05-14 09:00 | Close Above Prev High | 79596.60 | Broken |
| 2026-05-14 12:00 | 2026-05-14 13:00 | Three Green Candles | 80940.49 | Ongoing |

Rows 1 and 2 share indicator `79074.10`. After deduplication, only the **first** (earliest start time = `2026-05-13 13:00`) should remain.

## Proposed Changes

### `scripts/detect_confirmed_uptrends.js`

#### [MODIFY] detect_confirmed_uptrends.js

After sorting `ranges` by start time (line 110), add a deduplication step that:
1. Iterates through the sorted ranges.
2. Tracks which indicator values have already been seen.
3. Keeps only the **first** range entry for each unique indicator value.
4. Discards any subsequent entries with the same indicator.

**Logic (pseudocode):**
```js
const seenIndicators = new Set();
const dedupedRanges = [];
for (const r of ranges) {
    if (!seenIndicators.has(r.indicator)) {
        seenIndicators.add(r.indicator);
        dedupedRanges.push(r);
    }
}
// replace ranges with dedupedRanges for output
```

This is inserted **after** `ranges.sort(...)` and **before** building the output string.

## Expected Output After Change

| Start (EST)      | End (EST)        | Rule                  | Indicator | Status  |
|------------------|------------------|-----------------------|-----------|---------|
| 2026-05-13 13:00 | 2026-05-13 22:00 | Close Above Prev High | 79074.10  | Broken  |
| 2026-05-13 14:00 | 2026-05-13 14:00 | Close Above Prev High | 79537.17  | Broken  |
| 2026-05-13 20:00 | 2026-05-13 21:00 | Close Above Prev High | 79426.17  | Broken  |
| 2026-05-14 01:00 | 2026-05-14 05:00 | Close Above Prev High | 79450.27  | Broken  |
| 2026-05-14 08:00 | 2026-05-14 09:00 | Close Above Prev High | 79596.60  | Broken  |
| 2026-05-14 12:00 | 2026-05-14 13:00 | Three Green Candles   | 80940.49  | Ongoing |

The duplicate `79074.10` Three Green Candles row (start: 2026-05-13 14:00) is removed.

## Verification Plan

### Automated
- Re-run `node scripts/detect_confirmed_uptrends.js`
- Confirm no two rows share the same Indicator value in the output
- Confirm the retained row for `79074.10` has start time `2026-05-13 13:00` (not `14:00`)

### Manual
- Review `data/confirmed_uptrend.md` to visually confirm the deduplication result matches the expected table above

## Checklist

- [x] Modify `scripts/detect_confirmed_uptrends.js` to add deduplication by indicator after sort
- [x] Re-run script: `node scripts/detect_confirmed_uptrends.js`
- [x] Verify `data/confirmed_uptrend.md` has no duplicate indicator values
- [x] Verify the first confirmed trend (earliest start) is kept for indicator `79074.10`
- [x] Confirm all other unique indicator entries are unchanged
