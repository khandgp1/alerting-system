# Implementation Plan 25: Dynamic Uptrend Charting (`chart_uptrend.js`)

## Goal

Update `scripts/chart_uptrend.js` to remove hardcoded candle data and trend ranges. The script will dynamically read market data from `data/btc_hourly_candles.md` and confirmed uptrend ranges from `data/confirmed_uptrend.md`, generating a separate SVG plot for each confirmed uptrend range found. Each plot will include the trend duration plus 3 candles before and after for contextual analysis.

---

## Context & Requirements

Currently, `scripts/chart_uptrend.js` contains a hardcoded array of 2026-05-13 hourly candles and hardcoded `startIndex`, `endIndex`, and `indicator` values. 

The alerting system now identifies multiple confirmed uptrends across different strategies (e.g., Three Consecutive Green Candles, Close Above Previous High, Close Above Post-Signal Peak) and records them in `data/confirmed_uptrend.md`.

To make the charting tool fully dynamic and robust:
1. **Input Data Parsing:**
   - Parse `data/btc_hourly_candles.md` to build a complete array of hourly candles (`openTime`, `open`, `high`, `low`, `close`).
   - Parse `data/confirmed_uptrend.md` to extract all confirmed uptrend records (`start`, `end`, `rule`, `indicator`).
2. **Dynamic Chart Generation:**
   - For each confirmed uptrend range, locate the start and end candles in the full candle array.
   - Extract a subset of candles covering `[start - 3 hours … end + 3 hours]` (clamped to available data boundaries) to provide clear context before and after the trend.
   - Determine the relative `startIndex` and `endIndex` within this subset.
   - Generate the SVG chart with dynamic title (e.g., `BTC/USDT — ${rule} | ${start}–${end} EST`), shaded trend region, indicator line, and hourly x-axis labels.
3. **Output Files:**
   - Save each generated chart to `data/charts/` with a descriptive, unique filename based on the rule and start time (e.g., `uptrend_${ruleSlug}_${startSlug}.svg`).

---

## Proposed Changes

### `scripts/chart_uptrend.js`
#### [MODIFY] [chart_uptrend.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/chart_uptrend.js)
- Import `fs` and `path`.
- Define helper functions to parse `data/btc_hourly_candles.md` (matching the parsing logic in `detect_confirmed_uptrends.js`) and `data/confirmed_uptrend.md`.
- Iterate over each parsed uptrend record:
  - Find matching start/end indices in the candles array.
  - Slice the array `Math.max(0, startIndex - 3)` to `Math.min(candles.length - 1, endIndex + 3)`.
  - Calculate relative start/end indices for the shaded rectangle and vertical dashed boundary lines.
  - Compute dynamic `minPrice`, `maxPrice`, `priceRange`, and Y-axis grid lines.
  - Construct the SVG string.
  - Generate a clean filename: `const ruleSlug = r.rule.toLowerCase().replace(/\s+/g, '_'); const startSlug = r.start.replace(/[: ]/g, '-'); const outputPath = path.join(__dirname, '../data/charts/uptrend_${ruleSlug}_${startSlug}.svg');`
  - Write the SVG file and log the output path.

---

## Verification Plan

### Automated Verification
- Run the updated script:
  ```bash
  node scripts/chart_uptrend.js
  ```
- Verify that the script successfully executes without errors and outputs confirmation messages for each generated chart.

### Manual Verification
- Check the `data/charts/` directory to ensure all expected SVG files are created corresponding to the entries in `data/confirmed_uptrend.md`.
- Open/inspect the generated SVG files to verify:
  - Correct chart title reflecting the rule, start time, and end time.
  - Proper placement of the horizontal indicator line and label.
  - Correct shaded background region aligning with the trend start and end candles.
  - 3 context candles visible before the start line and after the end line.
  - Proper hourly x-axis labels for each candle.

---

## Checklist

- [x] Create implementation plan `25_IMPLEMENTATION_.md`
- [x] Review and approve implementation plan
- [x] Refactor `scripts/chart_uptrend.js` to parse `btc_hourly_candles.md` and `confirmed_uptrend.md`
- [x] Implement dynamic candle slicing (±3 candles context) and relative index calculation
- [x] Implement dynamic SVG generation and unique file naming per confirmed uptrend
- [x] Run `node scripts/chart_uptrend.js` to generate all plots
- [x] Verify generated SVG files in `data/charts/` for correctness and visual accuracy
