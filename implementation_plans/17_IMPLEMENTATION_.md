# Implementation Plan 17 — Report Every Valid Signal Independently

## Goal

Update `scripts/detect_confirmed_uptrends.js` so that:

1. **Rule 2 ("Close Above Previous High")**: Every valid signal candle is reported as its own confirmed uptrend entry, even if it falls within the window of a previously detected trend.
2. **Rule 1 ("Three Consecutive Green Candles")**: Only the **3rd** green candle in a consecutive unbroken run triggers a signal. The 4th, 5th, etc. consecutive green candles should **not** start new signals. However, if the green streak is **broken by one or more non-green candles** and then a **new set of 3 consecutive green candles** forms — even while the original trend's indicator is still valid — that new 3-candle pattern **should** generate a new signal.

## Background

Currently, both rules use `i = lastGoodIndex` after recording a trend range, which causes the scan loop to skip forward to the end of the entire trend window (which can extend far beyond the initial green streak). This means:

- **Rule 2**: If a signal at 13:00 produces a range ending at 22:00, a valid new signal at 20:00 is silently skipped.
- **Rule 1**: The loop jumps past the *entire trend window*, so if within that window the greens break and restart (e.g. `G G G R R G G G`), the second `G G G` group is never evaluated.

## Proposed Changes

### `scripts/detect_confirmed_uptrends.js`

#### Rule 1 — Change Skip Behavior

Instead of skipping to `lastGoodIndex` (end of trend), skip only to the **end of the initial consecutive green streak**. This prevents 4th/5th+ consecutive greens from re-triggering, but allows a fresh 3-candle pattern to be detected after any break.

**Before:**
```js
i = lastGoodIndex; // skips entire trend window
```

**After:**
```js
// Skip only past the initial consecutive green streak
// so a new 3-green pattern can form after a break
let greenEnd = i + 2;
while (greenEnd + 1 < candles.length && candles[greenEnd + 1].close > candles[greenEnd + 1].open) {
    greenEnd++;
}
i = greenEnd;
```

**Example behavior:**
- `G G G G G R G G G` → signal at index 2 (3rd candle), skip to index 4 (end of 5-green streak), then re-evaluate from index 5. Index 5 is red, so the loop tries index 5, 6, 7 as a new `[c1, c2, c3]` — at index 6 we have `G G G` → new signal.
- `G G G G G G G` → signal at index 2, skip to index 6, no further trigger.

#### Rule 2 — Remove the Skip

**Before:**
```js
ranges.push({ ... });
i = lastGoodIndex; // skips over all candles in the trend window
```

**After:**
```js
ranges.push({ ... });
// Do NOT advance i — allow every subsequent valid signal to be independently evaluated
```

By removing `i = lastGoodIndex` in Rule 2's loop, every candle is independently evaluated for the "Close Above Previous High" signal conditions. Each valid signal gets its own row in the output, even if they overlap in time.

---

## Checklist

- [x] Update `strategy.md` to document new Rule 1 behavior (no new signal on 4th+ consecutive greens; new signal allowed after a break)
- [x] Update Rule 1 in `detect_confirmed_uptrends.js` to skip to end of consecutive green streak (not `lastGoodIndex`)
- [x] Remove `i = lastGoodIndex` from Rule 2 in `detect_confirmed_uptrends.js`
- [x] Re-run `detect_confirmed_uptrends.js`
- [x] Confirm 2026-05-13 20:00 now appears as its own row (Rule 2)
- [x] Confirm no duplicate/spurious 3-green-candle entries are produced for 4th+ consecutive green candles (Rule 1)
- [x] Confirm a new 3-green signal is captured after a red-candle break within an existing trend window (Rule 1)
- [x] Update this checklist to mark all items complete
