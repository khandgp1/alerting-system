# Implementation Plan 10: Specific Range BTC Candle Fetching

Update `scripts/fetch_btc_candles.js` to fetch BTC hourly data for a specific, configurable date range instead of just the last 30 candles.

## User Review Required

> [!IMPORTANT]
> The date/time range is currently hardcoded in the proposed `config/fetch_params.json`. Any future changes to the range should be made in that file.
> The timestamps are assumed to be in **EST** (America/New_York) to match the project's timezone convention.

## Proposed Changes

### Configuration

#### [NEW] [fetch_params.json](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/config/fetch_params.json)
Create a new configuration file to store the fetch parameters.

```json
{
  "startTime": "2026-05-13 05:00",
  "endTime": "2026-05-14 13:00"
}
```

---

### Scripts

#### [MODIFY] [fetch_btc_candles.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/fetch_btc_candles.js)
- Import `fs` and `path` (already present).
- Read and parse `config/fetch_params.json`.
- Convert the EST date strings into UTC timestamps (milliseconds) for the Binance API.
- Use `startTime` and `endTime` query parameters in the API request.
- Update the formatting logic to handle all returned candles.
- Update the output markdown generation to reflect the fetched range.

## Verification Plan

### Automated Tests
- None (script is a utility).

### Manual Verification
1. Run the updated script: `node scripts/fetch_btc_candles.js`.
2. Open `data/btc_hourly_candles.md`.
3. Verify that the first entry has an "Open Time (EST)" of `2026-05-13 05:00:00`.
4. Verify that the last entry has an "Open Time (EST)" of `2026-05-14 13:00:00`.
5. Verify that the total number of candles matches the expected count (33 candles for this range: 19 on the 13th from 05:00-23:00, and 14 on the 14th from 00:00-13:00).

## Checklist
- [x] Create `config` directory
- [x] Create `config/fetch_params.json` with the requested range
- [x] Modify `scripts/fetch_btc_candles.js` to load config and use `startTime`/`endTime`
- [x] Verify the output in `data/btc_hourly_candles.md`
