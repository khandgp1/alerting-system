# 01 — Increase BTC Candle Count to 22

## Goal

Update the data fetching logic to retrieve and display the last **22 closed** hourly BTC candles instead of 10. This provides a nearly full day of data (22 hours) while maintaining the "closed candle" requirement.

---

## Proposed Changes

### Script

#### [MODIFY] `scripts/fetch_btc_candles.js`(file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/fetch_btc_candles.js)
- Increase `limit` constant from `11` to `23` (to fetch 23 candles).
- Update the slice logic from `slice(0, 10)` to `slice(0, 22)` to keep 22 closed candles.
- Update the console log message to reflect that 22 candles were written.

---

## Verification Plan

### Automated
- Run `node scripts/fetch_btc_candles.js` and confirm:
  - Exit code `0`
  - Console output says "Successfully wrote 22 candles..."
  - `data/btc_hourly_candles.md` contains exactly 22 rows in the table.

### Manual
- Open `data/btc_hourly_candles.md` and verify the table has 22 entries numbered 1 through 22.

---

## Checklist

- [x] Modify `scripts/fetch_btc_candles.js`
  - [x] Set `limit = 23`
  - [x] Set `closedCandles = rawData.slice(0, 22)`
  - [x] Update console log to say "22 candles"
- [x] Run the script: `node scripts/fetch_btc_candles.js`
- [x] Verify `data/btc_hourly_candles.md` has 22 rows
