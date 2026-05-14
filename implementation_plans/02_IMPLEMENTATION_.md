# Detect First Candle After a Downtrend

## Overview

Using the strategy defined in `strategy.md`, scan the hourly BTC candle data in `data/btc_hourly_candles.md` to identify every candle that immediately follows a **red candle** (close < open = downtrend signal). Output the UTC hour of each such candle to `data/downtrends.md`.

**Strategy rule (from `strategy.md`):**
> Identify Downtrends: previous candle is red

A "first candle after a downtrend" is any candle at index `i` where candle `i-1` has `close < open`.

---

## Proposed Changes

### New Script

#### [NEW] `scripts/detect_downtrends.js`

A Node.js script that:
1. Reads `data/btc_hourly_candles.md` and parses the markdown table row by row
2. For each candle (starting at index 2), checks if the **previous candle** is red (`close < open`)
3. If true, records the **Open Time hour** of the current candle (e.g. `2026-05-13 14:00`)
4. Writes all matches to `data/downtrends.md` as a simple list of hours

### Output File

#### [NEW] `data/downtrends.md`

Generated output file. Format:

```
# Downtrend Signals — First Candle After Red

**Source:** data/btc_hourly_candles.md
**Strategy:** Previous candle is red (close < open)
**Generated At:** <timestamp>

- 2026-05-13 14:00
- 2026-05-14 03:00
...
```

---

## Verification Plan

### Automated
- Run `node scripts/detect_downtrends.js` and confirm `data/downtrends.md` is created with no errors.

### Manual Spot Check
- Cross-reference 2–3 output hours against the candle table in `data/btc_hourly_candles.md` to confirm each listed hour is preceded by a red candle.

---

## Checklist

- [ ] Create `scripts/detect_downtrends.js`
  - [ ] Parse markdown table from `data/btc_hourly_candles.md`
  - [ ] Loop through candles and apply red-candle detection logic
  - [ ] Collect matching open times (hour only)
  - [ ] Write results to `data/downtrends.md`
- [ ] Run the script and verify output file is generated
- [ ] Spot-check at least 2 results against source candle data
- [ ] Confirm `data/downtrends.md` is committed to the repo
