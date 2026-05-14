# Convert Timezone from UTC to Eastern Time (ET)

Convert all timestamps across the project from UTC to Eastern Time (ET/EST/EDT) for better readability.

## User Review Required

> [!NOTE]
> The conversion will use the `America/New_York` timezone, which automatically handles the transition between EST and EDT (Daylight Savings).

## Proposed Changes

### Scripts

#### [MODIFY] [fetch_btc_candles.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/fetch_btc_candles.js)
- Update timestamp formatting to use `America/New_York` timezone.
- Change table headers from `(UTC)` to `(EST)`.
- Update `Generated At` metadata to reflect EST.

#### [MODIFY] [detect_downtrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_downtrends.js)
- Update `Generated At` metadata to reflect EST.

---

### Data Files

#### [MODIFY] [btc_hourly_candles.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/btc_hourly_candles.md)
- Convert all existing open times to Eastern Time.
- Update `Generated At` and table headers.

#### [MODIFY] [downtrends.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/downtrends.md)
- Convert all signal timestamps and `Generated At` to Eastern Time.

## Verification Plan

### Automated Tests
- Run `node scripts/fetch_btc_candles.js` and verify the output markdown uses Eastern Time.
- Run `node scripts/detect_downtrends.js` and verify the signals and generation time use Eastern Time.

### Manual Verification
- Compare the new timestamps in `data/btc_hourly_candles.md` with the old UTC timestamps to ensure a correct -4h (or -5h depending on date) shift.

## Checklist
- [x] Update `scripts/fetch_btc_candles.js` logic
- [x] Update `scripts/detect_downtrends.js` logic
- [x] Run `node scripts/fetch_btc_candles.js` to refresh data in EST
- [x] Run `node scripts/detect_downtrends.js` to refresh signals in EST
- [x] Manually verify `data/btc_hourly_candles.md`
- [x] Manually verify `data/downtrends.md`
