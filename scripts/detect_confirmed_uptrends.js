const fs = require('fs');
const path = require('path');

const candlesPath = path.join(__dirname, '../data/btc_hourly_candles.md');
const outputPath = path.join(__dirname, '../data/confirmed_uptrend.md');

function detectConfirmedUptrends() {
    if (!fs.existsSync(candlesPath)) {
        console.error(`Candles file not found: ${candlesPath}`);
        process.exit(1);
    }

    const candleContent = fs.readFileSync(candlesPath, 'utf8');

    // Parse Candles
    const candles = [];
    const candleLines = candleContent.split('\n');
    for (const line of candleLines) {
        if (line.trim().startsWith('|') && !line.includes('---|') && !line.includes('Open Time')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
            if (parts.length >= 6) {
                candles.push({
                    openTime: parts[1],
                    open: parseFloat(parts[2]),
                    high: parseFloat(parts[3]),
                    low: parseFloat(parts[4]),
                    close: parseFloat(parts[5])
                });
            }
        }
    }

    const ranges = [];

    // Rule 1: Three Consecutive Green Candles
    for (let i = 0; i <= candles.length - 3; i++) {
        const c1 = candles[i];
        const c2 = candles[i + 1];
        const c3 = candles[i + 2];

        // Detection: Three consecutive green candles
        if (c1.close > c1.open && c2.close > c2.open && c3.close > c3.open) {
            const indicator = c1.close;

            // Starting at the 3rd green candle, the uptrend is confirmed if low > indicator
            if (c3.low > indicator) {
                let lastGoodIndex = i + 2;
                for (let j = i + 3; j < candles.length; j++) {
                    if (candles[j].low > indicator) {
                        lastGoodIndex = j;
                    } else {
                        break;
                    }
                }

                ranges.push({
                    start: c3.openTime.substring(0, 16),
                    end: candles[lastGoodIndex].openTime.substring(0, 16),
                    rule: 'Three Green Candles',
                    indicator: indicator.toFixed(2),
                    status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken',
                    indicatorCandleIndex: i
                });

                // Skip only past the initial consecutive green streak
                // so a new 3-green pattern can form after a break
                let greenEnd = i + 2;
                while (greenEnd + 1 < candles.length && candles[greenEnd + 1].close > candles[greenEnd + 1].open) {
                    greenEnd++;
                }
                i = greenEnd;
            }
        }
    }

    // Rule 2: Close Above Previous High
    for (let i = 3; i < candles.length; i++) {
        const n3 = candles[i - 3];
        const n1 = candles[i - 1];
        const n = candles[i];

        // Signal: Candle n is green and close[n] > high[n-1]
        // Confirmation: open[n-1] < open[n-3]
        if (n.close > n.open && n.close > n1.high && n1.open < n3.open) {
            // Indicator: n-1 (close if green, open if red)
            const indicator = n1.close > n1.open ? n1.close : n1.open;

            // Uptrend confirmed at candle n — invalidation only checked on subsequent candles
            let lastGoodIndex = i;
            for (let j = i + 1; j < candles.length; j++) {
                if (candles[j].low > indicator) {
                    lastGoodIndex = j;
                } else {
                    break;
                }
            }

            ranges.push({
                start: n.openTime.substring(0, 16),
                end: candles[lastGoodIndex].openTime.substring(0, 16),
                rule: 'Close Above Prev High',
                indicator: indicator.toFixed(2),
                status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken',
                indicatorCandleIndex: i - 1
            });

            // Do NOT advance i — allow every subsequent valid signal to be independently evaluated
        }
    }

    // Rule 3: Close Above Post-Signal Peak
    for (let i = 3; i < candles.length; i++) {
        const n3 = candles[i - 3];
        const n1 = candles[i - 1];
        const n = candles[i];

        // Signal: Candle n is green and close[n] > high[n-1], but fails open[n-1] < open[n-3]
        if (n.close > n.open && n.close > n1.high && !(n1.open < n3.open)) {
            // Find the most recent confirmed uptrend prior to candle n
            const priorRanges = ranges.filter(r => r.start < n.openTime.substring(0, 16));
            if (priorRanges.length === 0) continue;

            // Get the latest prior range
            priorRanges.sort((a, b) => a.start.localeCompare(b.start));
            const lastRange = priorRanges[priorRanges.length - 1];

            // Scan the window between lastRange.indicatorCandleIndex and i for the green candle with the highest close
            let peakCandle = null;
            let peakIndex = -1;
            for (let k = lastRange.indicatorCandleIndex + 1; k < i; k++) {
                const c = candles[k];
                if (c.close > c.open) {
                    if (!peakCandle || c.close > peakCandle.close) {
                        peakCandle = c;
                        peakIndex = k;
                    }
                }
            }

            if (!peakCandle) continue;

            const indicator = peakCandle.close;

            // Confirmation: n.close > indicator
            if (n.close > indicator) {
                let lastGoodIndex = i;
                for (let j = i + 1; j < candles.length; j++) {
                    if (candles[j].low > indicator) {
                        lastGoodIndex = j;
                    } else {
                        break;
                    }
                }

                ranges.push({
                    start: n.openTime.substring(0, 16),
                    end: candles[lastGoodIndex].openTime.substring(0, 16),
                    rule: 'Close Above Post-Signal Peak',
                    indicator: indicator.toFixed(2),
                    status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken',
                    indicatorCandleIndex: peakIndex
                });
            }
        }
    }

    // Sort ranges by start time
    ranges.sort((a, b) => a.start.localeCompare(b.start));

    // Keep only the first confirmed trend per unique indicator
    const seenIndicators = new Set();
    const uniqueRanges = [];
    for (const r of ranges) {
        if (!seenIndicators.has(r.indicator)) {
            seenIndicators.add(r.indicator);
            uniqueRanges.push(r);
        }
    }

    // Apply cooldown: no new trend until a red candle closes after the last accepted trend
    const finalRanges = [];
    let lastAcceptedEnd = null;

    for (const r of uniqueRanges) {
        if (lastAcceptedEnd === null) {
            // First trend — always accept
            finalRanges.push(r);
            lastAcceptedEnd = r.end;
        } else if (r.start <= lastAcceptedEnd) {
            // New trend starts while previous trend is still active — block
            continue;
        } else {
            // Find the first red candle after lastAcceptedEnd
            const firstRedAfterEnd = candles.find(c =>
                c.openTime.substring(0, 16) >= lastAcceptedEnd &&
                c.close < c.open
            );
            if (firstRedAfterEnd && r.start >= firstRedAfterEnd.openTime.substring(0, 16)) {
                // A red candle has closed before this new trend — accept
                finalRanges.push(r);
                lastAcceptedEnd = r.end;
            }
            // Otherwise: no red candle before this trend — block
        }
    }

    // Exclude trends that only lasted within a single hour (start === end)
    const filteredRanges = finalRanges.filter(r => r.start !== r.end);

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });
    let output = `# Confirmed Uptrend Ranges\n\n`;
    output += `**Source:** data/btc_hourly_candles.md\n`;
    output += `**Strategies:**\n`;
    output += `1. Three Consecutive Green Candles (Indicator: 1st Candle Close)\n`;
    output += `2. Close Above Previous High (Indicator: Prev Candle Close/Open)\n`;
    output += `3. Close Above Post-Signal Peak (Indicator: Peak Candle Close)\n\n`;
    output += `**Generated At:** ${timestamp} EST\n\n`;

    if (filteredRanges.length === 0) {
        output += `No confirmed uptrend ranges found.\n`;
    } else {
        output += `| Start (EST) | End (EST) | Rule | Indicator | Status |\n`;
        output += `|---|---|---|---|---|\n`;
        filteredRanges.forEach(r => {
            output += `| ${r.start} | ${r.end} | ${r.rule} | ${r.indicator} | ${r.status} |\n`;
        });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Successfully identified ${filteredRanges.length} confirmed unique indicator uptrend ranges (with cooldown, same-hour excluded) and wrote to ${outputPath}`);

}

detectConfirmedUptrends();
