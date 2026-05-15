# Implementation Plan 16 — Clarify Invalidation Rule for "Close Above Previous High"

## Goal

Update `strategy.md` and `scripts/detect_confirmed_uptrends.js` to correctly reflect that for the **"Confirm Uptrend (Close Above Previous High)"** rule, the uptrend invalidation condition applies only to candles **following** the signal candle — not to the signal candle itself.

## Background

Currently, line 12 of `strategy.md` reads:
> "The uptrend is invalidated if the low of any candle is at or below the indicator."

This phrasing is ambiguous — it could be interpreted as including the signal candle `n` itself. The correct intent is:

- The uptrend is **confirmed** at candle `n` (the signal candle), regardless of its low.
- The uptrend is **invalidated** only if the low of a **subsequent** candle (n+1, n+2, …) is at or below the indicator.

The script currently enforces `n.low > indicator` as a precondition before recording the uptrend (line 82), which is incorrect per the user's clarification.

## Proposed Changes

### 1. `strategy.md`

**Modify line 12** to make clear invalidation applies only to candles after the signal:

**Before:**
```
- The uptrend is invalidated if the low of any candle is at or below the indicator.
```

**After:**
```
- The uptrend is confirmed at the signal candle (n). It is invalidated only if the low of a candle following the signal candle is at or below the indicator.
```

---

### 2. `scripts/detect_confirmed_uptrends.js` — Rule 2

**Remove** the `n.low > indicator` guard check (currently line 82) so the uptrend is always recorded when the signal conditions are met.

**The uptrend start is `candle n`**, and the invalidation scan should begin from `candle n+1`.

**Before:**
```js
if (n.low > indicator) {
    let lastGoodIndex = i;
    for (let j = i + 1; j < candles.length; j++) {
        ...
    }
    ...
}
```

**After:**
```js
// Uptrend confirmed at candle n — invalidation only checked on subsequent candles
let lastGoodIndex = i;
for (let j = i + 1; j < candles.length; j++) {
    if (candles[j].low > indicator) {
        lastGoodIndex = j;
    } else {
        break;
    }
}
ranges.push({ ... });
i = lastGoodIndex;
```

---

## Checklist

- [x] Update `strategy.md` line 12 to scope invalidation to post-signal candles only
- [x] Remove `n.low > indicator` guard in Rule 2 of `detect_confirmed_uptrends.js`
- [x] Re-run `detect_confirmed_uptrends.js` and verify 2026-05-13 20:00 now appears as a confirmed uptrend
- [x] Confirm `confirmed_uptrend.md` output is correct
- [x] Update this checklist to mark all items complete
