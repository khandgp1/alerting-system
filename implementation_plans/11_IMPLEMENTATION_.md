# Confirm Uptrend — Three Consecutive Green Candles Rule

## Background

Analysis of `data/btc_hourly_candles.md` reveals three consecutive green candles between
**2026-05-13 12:00 and 2026-05-13 14:00 (EST)**:

| # | Time (EST) | Open | Close | Color |
|---|---|---|---|---|
| 8 | 2026-05-13 12:00 | 78843.19 | 79074.10 | 🟢 Green |
| 9 | 2026-05-13 13:00 | 79213.22 | 79537.17 | 🟢 Green |
| 10 | 2026-05-13 14:00 | 79515.45 | 79643.72 | 🟢 Green |

This pattern suggests a potential uptrend. The new rule codifies how to detect this setup and
confirm (or invalidate) the uptrend using a price-action baseline called the **indicator**.

---

## New Rule: Confirm Uptrend (Three Consecutive Green Candles)

### Detection Conditions
1. Three **consecutive** green candles must occur (close > open for each).
2. Green candles must be on the **1h BTC/USDT** timeframe.

### Indicator Baseline
- The **close price of the 1st green candle** in the three-candle sequence is recorded as the
  **indicator** (e.g., 79074.10 in the example above).

### Confirmation Logic (starting at the 3rd green candle)
- The uptrend is **confirmed** and remains valid on any subsequent candle as long as:
  - The **low of that candle is strictly above the indicator**.
- The uptrend is **invalidated** on any subsequent candle where:
  - The **low of that candle is at or below the indicator**.

### Scope
- Evaluation begins at the **3rd green candle** (the candle at 2026-05-13 14:00 in this example).
- Each new 1h candle is checked against the indicator; the first violation ends the uptrend.

---

## Proposed Changes

### `strategy.md`
Append the new "Confirm Uptrend (Three Consecutive Green Candles)" section that precisely
documents the detection conditions, indicator definition, and confirmation/invalidation logic
described above.

---

## Verification Plan

### Manual Verification
- Confirm that the three candles at 12:00, 13:00, and 14:00 on 2026-05-13 are all green in
  `data/btc_hourly_candles.md`. ✅ (verified above)
- Trace the indicator value (79074.10) against all subsequent candle lows to confirm the rule
  behaves as expected.
- Review `strategy.md` after the append to ensure phrasing is clear and unambiguous.

### Future Script Work
- A detection script (`detect_green_uptrends.js` or similar) will apply this rule to the full
  candle dataset and output results to `data/green_uptrends.md`.

---

## Progress Checklist

- [x] Append "Confirm Uptrend (Three Consecutive Green Candles)" rule to `strategy.md`
- [x] Verify the appended rule language is accurate and complete
- [ ] (Future) Create detection script to automate this rule against candle data
- [ ] (Future) Output confirmed uptrend ranges to `data/green_uptrends.md`
- [ ] (Future) Add unit/integration tests for the detection script
