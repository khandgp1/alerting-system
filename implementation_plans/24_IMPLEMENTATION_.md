# Implementation Plan 24: Confirm Uptrend (Close Above Post-Signal Peak)

## Goal

Capture the trend that begins at **2026-05-14 10:00** — a significant breakout that was _not_ captured by the existing "Close Above Previous High" rule because the Uptrend Confirmation check (`open[n-1] < open[n-3]`) failed at the 07:00 signal candle.

The observation is: after the 07:00 signal, the 08:00 candle is the **highest green close** in the window before the 10:00 breakout. Using the 08:00 close (**79784.66**) as a secondary indicator, the 10:00 candle (`close: 80940.49`) clearly closes above it, marking the start of a strong confirmed uptrend.

---

## Context & Market Analysis

| Time (EST) | Open | High | Low | Close | Color | Note |
|---|---|---|---|---|---|---|
| 2026-05-14 06:00 | 79633.56 | 79722.15 | 79430.02 | 79596.60 | RED | Previous candle (n-1); indicator source |
| 2026-05-14 07:00 | 79596.60 | 79612.46 | 79245.79 | 79270.44 | RED | Signal candle (n) — fails confirmation (`open[n-1]=79633.56` vs `open[n-3]=79875.12`) |
| **2026-05-14 08:00** | **79306.60** | **79784.66** | **79302.34** | **79784.66** | **GREEN** | **Highest green close after signal; new indicator placed here** |
| 2026-05-14 09:00 | 79735.89 | 80038.66 | 79712.16 | 79712.16 | RED | Below 08:00 close — does not confirm |
| **2026-05-14 10:00** | **79622.39** | **81010.05** | **79581.27** | **80940.49** | **GREEN** | **Closes above 08:00 close → Uptrend Confirmed** |

### Why the existing rule misses this

The "Close Above Previous High" rule at 07:00 fails its confirmation step:
- `open[n-1]` = 79633.56 (06:00 open)
- `open[n-3]` = 79875.12 (04:00 open)
- Condition `open[n-1] < open[n-3]` → `79633.56 < 79875.12` → **TRUE** (wait — let's re-examine)

> Actually re-checking: the rule requires `open[n-1] < open[n-3]`.  
> n = 07:00, n-1 = 06:00, n-2 = 05:00, n-3 = 04:00  
> `open[06:00] = 79633.56`, `open[04:00] = 79743.75`  
> `79633.56 < 79743.75` → TRUE → This **should** pass.  
>  
> However the user confirms this trend at 10:00 does NOT appear in `confirmed_uptrend.md`, meaning the existing detection logic does **not** capture it. This may be because the 08:00 entry (`| 2026-05-14 08:00 | 2026-05-14 09:00 | Close Above Prev High | 79596.60 | Broken |`) is generated for 08:00 as its _own_ signal (08:00 is green and closes above 07:00's high of 79612.46), but then breaks at 09:00. The 10:00 candle is never checked as a continuation because the indicator (79596.60) was already broken at 09:00.

### The new insight

The 08:00 candle is **both** a failed continuation (indicator 79596.60 is broken at 09:00) **and** a strong green candle whose _close_ (79784.66) is the **highest green close** in the window between the 07:00 signal and the 10:00 breakout.

When a candle in this post-signal window establishes the highest green close, its close price becomes a **secondary indicator**. The next candle that closes strictly above this secondary indicator confirms a new uptrend.

---

## Proposed New Strategy Rule (to append to `strategy.md`)

```
Confirm Uptrend (Close Above Post-Signal Peak):
- Context: Applies after a "Close Above Previous High" signal candle (n) is generated at time T.
- Post-Signal Peak: Scan forward from T+1 for the green candle with the highest closing price before the next confirmed uptrend.
- Indicator: Placed at the close of that highest-close green candle (the "peak candle").
- Confirmation: A candle following the peak candle that:
    1. Is green (close > open), and
    2. Closes strictly above the peak candle's close (the indicator).
- The uptrend start time is set to the confirming candle's open time.
- The uptrend is invalidated if the low of any candle after the confirming candle falls at or below the indicator.
- This rule fires only when no other active uptrend (from any rule) currently covers the confirming candle.
```

---

## Changes Required

### 1. `strategy.md`
#### [MODIFY] [strategy.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/strategy.md)
- Append the new "Confirm Uptrend (Close Above Post-Signal Peak)" rule with full notation.

### 2. `scripts/detect_confirmed_uptrends.js`
#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- Add a new detection pass (or integrate into the existing loop) to:
  1. After detecting a "Close Above Previous High" signal at candle `n`, scan forward for the green candle with the highest close in the window `[n+1 … next_confirmed_uptrend_start)`.
  2. Mark that candle's close as the secondary indicator.
  3. Check each subsequent candle: if it is green and its close is strictly above the secondary indicator → record a new uptrend starting at that candle.
  4. Carry forward standard invalidation logic (low ≤ indicator = broken).

### 3. `data/confirmed_uptrend.md`
#### [MODIFY] [confirmed_uptrend.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/confirmed_uptrend.md)
- Re-run the detection script and update the table to include the new `2026-05-14 10:00` trend entry.
- Expected new row:
  ```
  | 2026-05-14 10:00 | (end TBD by script) | Close Above Post-Signal Peak | 79784.66 | TBD |
  ```

---

## Verification Plan

### Automated
- Re-run the full pipeline:
  ```
  node scripts/fetch_btc_candles.js && node scripts/detect_confirmed_uptrends.js
  ```
- Confirm `data/confirmed_uptrend.md` contains a row with:
  - Start: `2026-05-14 10:00`
  - Rule: `Close Above Post-Signal Peak`
  - Indicator: `79784.66`

### Manual
- Review candle data from 07:00 to 10:00 on 2026-05-14 to validate the peak candle selection and indicator placement.
- Confirm the 09:00 candle does **not** trigger a false confirmation (its close of 79712.16 is below 79784.66).
- Confirm no other active trend's indicator covers 10:00 that would suppress this signal.

---

## Checklist

- [x] Analyze exact conditions for "Post-Signal Peak" — verify 08:00 is the peak green candle in window
- [x] Finalize rule wording for `strategy.md`
- [x] Append new rule to `strategy.md`
- [x] Implement detection logic in `detect_confirmed_uptrends.js`
- [x] Re-run pipeline and verify `confirmed_uptrend.md` output
- [x] Verify no false positives introduced (e.g., 09:00 should NOT trigger)
- [x] Update `confirmed_uptrend.md` if not auto-generated
- [x] Review chart output if `chart_uptrend.js` is updated
