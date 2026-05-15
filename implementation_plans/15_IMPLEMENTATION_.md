# Implementation Plan - Include "Close Above Previous High" Uptrend Rule

This plan outlines the updates to `scripts/detect_confirmed_uptrends.js` to include the second uptrend confirmation rule: **Close Above Previous High**.

## User Review Required

> [!IMPORTANT]
> The script will now detect uptrends using two different rules. If a period is confirmed by both rules, they will be listed separately in the output table to show which rule triggered the confirmation.

## Proposed Changes

### [scripts/](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts)

#### [MODIFY] [detect_confirmed_uptrends.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/detect_confirmed_uptrends.js)
- Update the candle parser to extract the `high` price from the markdown table.
- Implement the "Close Above Previous High" logic:
    - **Signal**: Current candle `n` is green and its close is strictly above the high of candle `n-1`.
    - **Confirmation**: The open of candle `n-1` is lower than the open of candle `n-3`.
    - **Indicator**: Set at candle `n-1` (close if green, open if red).
    - **Duration**: Confirmed starting at candle `n` and remains valid as long as the low of subsequent candles stays strictly above the indicator.
- Refactor the detection loop to handle multiple rules.
- Update the output format in `data/confirmed_uptrend.md` to include a "Rule" column.

### [data/](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data)

#### [MODIFY] [confirmed_uptrend.md](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/data/confirmed_uptrend.md)
- The structure will be updated to include a "Rule" column to distinguish between "Three Consecutive Green" and "Close Above Previous High".

## Verification Plan

### Automated Tests
- Run `node scripts/detect_confirmed_uptrends.js` and verify the output in `data/confirmed_uptrend.md`.
- Manually check the detected ranges against the raw data in `data/btc_hourly_candles.md` for both rules.

### Checklist
- [x] Update candle parser in `scripts/detect_confirmed_uptrends.js` to include `high`.
- [x] Implement Rule 1 (Three Consecutive Green Candles) as a reusable function or block.
- [x] Implement Rule 2 (Close Above Previous High) logic.
- [x] Update `ranges` collection to include rule names.
- [x] Update markdown table generation to include the "Rule" column.
- [x] Run the script and verify the output.
