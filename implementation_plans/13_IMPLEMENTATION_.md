# Add Second Confirm Uptrend Method to strategy.md

## Overview

Add a second "Confirm Uptrend" detection method to `strategy.md`. This method uses a two-candle close-above-high pattern followed by a confirmation rule based on the opens of two prior candles.

---

## New Rule Definition

**Confirm Uptrend (Close Above Previous High)**

**Step 1 — Possible Uptrend Signal:**
A possible uptrend is detected when a green candle (close > open) closes **strictly above** the high of the candle immediately before it.

**Step 2 — Uptrend Confirmation:**
The uptrend is confirmed when the **open of the candle immediately before the signal candle** is **lower than** the **open of the candle three candles before the signal candle**.

In other words, given candles at positions `[n-3, n-2, n-1, n]`:
- Candle `n` is green and `close[n] > high[n-1]` → possible uptrend
- Uptrend confirmed if `open[n-1] < open[n-3]`

---

## Proposed Changes

### `strategy.md`

- Append the new "Confirm Uptrend (Close Above Previous High)" method section below the existing method.

---

## Progress Checklist

- [x] Append the new rule to `strategy.md` with clear, consistent formatting matching the existing method

---

## Notes

- This is a documentation-only change; no script changes are required in this plan.
- A follow-up plan should implement a detection script (e.g., `detect_confirmed_uptrends_v2.js`) that applies this rule to candle data.
