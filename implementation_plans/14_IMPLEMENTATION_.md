# Add Indicator Definition and Invalidation Rule to Confirm Uptrend (Close Above Previous High)

## Overview

This plan covers two additions to the "Confirm Uptrend (Close Above Previous High)" method in `strategy.md`:

1. **Indicator definition** — how the indicator baseline is marked at candle `n-1`:
   - If candle `n-1` is **green** (close > open) → indicator = `close[n-1]`
   - If candle `n-1` is **red** (close < open) → indicator = `open[n-1]`

2. **Invalidation rule** — the uptrend is invalidated if the low of any subsequent candle is at or below the indicator.

---

## Proposed Changes

### `strategy.md`

#### [MODIFY] `strategy.md`

**Change 1 — Add indicator definition bullet** (already completed) after the Possible Uptrend Signal bullet:

```
- Indicator: Marked at candle n-1 — at the close if candle n-1 is green (close > open), or at the open if candle n-1 is red (close < open).
```

**Change 2 — Add invalidation rule bullet** at the end of the section:

```
- The uptrend is invalidated if the low of any candle is at or below the indicator.
```

---

## Progress Checklist

- [x] Add the indicator definition bullet to the "Confirm Uptrend (Close Above Previous High)" section in `strategy.md`
- [x] Add the invalidation rule bullet to the "Confirm Uptrend (Close Above Previous High)" section in `strategy.md`

---

## Notes

- Documentation-only change; no script modifications required in this plan.
- A follow-up plan should update `detect_confirmed_uptrends_v2.js` (or equivalent) to compute the indicator using this rule.
