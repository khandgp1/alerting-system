# Implementation Plan - Update Chart X-Axis Labels

The goal is to modify `scripts/chart_uptrend.js` to display every hour on the x-axis. To prevent overlap, the time format will be simplified to a 2-digit hour number if necessary.

## User Review Required

> [!NOTE]
> I will update the logic to show labels for every candle. To ensure readability, I'll use only the hour digits (e.g., "13" instead of "13:00") as suggested.

## Proposed Changes

### Scripts

#### [MODIFY] [chart_uptrend.js](file:///Users/khandpv1/Desktop/.AntiGrav/alerting-system/scripts/chart_uptrend.js)
- Remove the `if (i % 2 === 0)` condition that skips every other label.
- Transform the `c.time` string (e.g., "13:00") to just the hour (e.g., "13") to save space and ensure all labels fit without overlapping.

## Verification Plan

### Automated Tests
- Run `node scripts/chart_uptrend.js` and inspect the generated SVG file `data/charts/uptrend_close_above_prev_high_2026-05-13-13.svg` to ensure labels are correct and legible.

### Manual Verification
- View the SVG in a browser or image viewer to confirm all hours are visible and properly aligned.

## Checklist
- [x] Modify `scripts/chart_uptrend.js` to remove label skipping.
- [x] Update label formatting to show only the 2-digit hour.
- [x] Execute the script to generate the updated chart.
- [x] Verify the output SVG.
