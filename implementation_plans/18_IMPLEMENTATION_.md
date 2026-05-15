# Candlestick Chart Image — Close Above Prev High Trend

## Goal

Generate a static PNG image that visually represents the confirmed uptrend entry:

```
2026-05-13 13:00 | 2026-05-13 22:00 | Close Above Prev High | 79074.10 | Broken
```

The chart uses BTC hourly candle data from `data/btc_hourly_candles.md` and renders:
- Green/red candlesticks for each candle
- A blue horizontal line at the indicator level (79074.10)
- Vertical dashed lines marking the trend start (13:00) and end (22:00)
- 3 candles before the trend start and 3 candles after the trend end for context

---

## Candle Window

| # | Open Time (EST)        | Open     | High     | Low      | Close    | Color |
|---|------------------------|----------|----------|----------|----------|-------|
| 6 | 2026-05-13 10:00 (−3) | 79585.64 | 79842.26 | 79500.00 | 79778.47 | 🟢 Green |
| 7 | 2026-05-13 11:00 (−2) | 79844.36 | 79865.72 | 78831.90 | 78834.30 | 🔴 Red |
| 8 | 2026-05-13 12:00 (−1) | 78843.19 | 79221.77 | 78776.88 | 79074.10 | 🟢 Green |
| **9** | **2026-05-13 13:00 ← START** | 79213.22 | 79537.17 | 79180.15 | 79537.17 | 🟢 Green |
| 10 | 2026-05-13 14:00      | 79515.45 | 79822.62 | 79515.45 | 79643.72 | 🟢 Green |
| 11 | 2026-05-13 15:00      | 79629.55 | 79647.37 | 79455.34 | 79643.15 | 🟢 Green |
| 12 | 2026-05-13 16:00      | 79652.81 | 79748.13 | 79636.55 | 79708.84 | 🟢 Green |
| 13 | 2026-05-13 17:00      | 79711.71 | 79719.22 | 79385.23 | 79390.60 | 🔴 Red |
| 14 | 2026-05-13 18:00      | 79391.19 | 79478.11 | 79245.79 | 79444.04 | 🟢 Green |
| 15 | 2026-05-13 19:00      | 79426.17 | 79488.82 | 79266.11 | 79329.71 | 🔴 Red |
| 16 | 2026-05-13 20:00      | 79335.34 | 79688.69 | 79335.34 | 79597.03 | 🟢 Green |
| 17 | 2026-05-13 21:00      | 79578.29 | 79679.90 | 79433.20 | 79632.92 | 🟢 Green |
| **18** | **2026-05-13 22:00 ← END** | 79607.27 | 79669.45 | 79244.33 | 79359.62 | 🔴 Red |
| 19 | 2026-05-13 23:00 (+1) | 79364.47 | 79457.48 | 78954.14 | 79031.64 | 🔴 Red |
| 20 | 2026-05-14 00:00 (+2) | 79029.52 | 79463.21 | 79013.00 | 79450.27 | 🟢 Green |
| 21 | 2026-05-14 01:00 (+3) | 79432.42 | 79979.48 | 79409.17 | 79822.66 | 🟢 Green |

---

## Visual Elements

| Element | Description |
|---|---|
| Candlesticks | Green if Close ≥ Open, Red if Close < Open |
| Blue horizontal line | At y = 79074.10 (indicator level), spanning full chart width |
| Left vertical dashed line | At x = 2026-05-13 13:00 (trend START) |
| Right vertical dashed line | At x = 2026-05-13 22:00 (trend END) |
| Shaded region (optional) | Light blue/teal fill between the two vertical lines |
| X-axis | Hour labels (EST) for each candle |
| Y-axis | Price range covering all candles in window |
| Title | "BTC/USDT — Close Above Prev High | 2026-05-13 13:00–22:00 EST" |

---

## Implementation Approach

A Node.js script will build the chart as an **SVG file** using only standard string/template literals — zero new npm dependencies. The candle data is hardcoded from the table above.

Each candlestick is composed of:
- A `<rect>` for the body (green/red fill)
- A `<line>` for the upper and lower wick

Overlay elements use standard SVG primitives (`<line>`, `<rect>`, `<text>`).

### Output File
`data/charts/uptrend_close_above_prev_high_2026-05-13-13.svg`

---

## Checklist

- [x] Create `data/charts/` directory if it does not exist
- [x] Create `scripts/chart_uptrend.js` with hardcoded candle data (no npm deps)
- [x] Implement price-to-pixel coordinate helper (map price range → SVG y-axis)
- [x] Render green/red candlestick bodies (`<rect>`) and wicks (`<line>`)
- [x] Draw blue horizontal indicator line at 79074.10 (`<line>`)
- [x] Draw left vertical dashed line at candle index 3 (13:00 = trend start)
- [x] Draw right vertical dashed line at candle index 12 (22:00 = trend end)
- [x] Add light shaded region between start/end verticals (`<rect>` with low opacity)
- [x] Add x-axis hour labels and y-axis price labels (`<text>`)
- [x] Add chart title
- [x] Write SVG string to `data/charts/uptrend_close_above_prev_high_2026-05-13-13.svg` using `fs.writeFileSync`
- [x] Run `node scripts/chart_uptrend.js` and verify SVG opens correctly in browser
