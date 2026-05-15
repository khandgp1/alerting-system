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
                    status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken'
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
                status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken'
            });

            // Do NOT advance i — allow every subsequent valid signal to be independently evaluated
        }
    }

    // Sort ranges by start time
    ranges.sort((a, b) => a.start.localeCompare(b.start));

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });
    let output = `# Confirmed Uptrend Ranges\n\n`;
    output += `**Source:** data/btc_hourly_candles.md\n`;
    output += `**Strategies:**\n`;
    output += `1. Three Consecutive Green Candles (Indicator: 1st Candle Close)\n`;
    output += `2. Close Above Previous High (Indicator: Prev Candle Close/Open)\n\n`;
    output += `**Generated At:** ${timestamp} EST\n\n`;

    if (ranges.length === 0) {
        output += `No confirmed uptrend ranges found.\n`;
    } else {
        output += `| Start (EST) | End (EST) | Rule | Indicator | Status |\n`;
        output += `|---|---|---|---|---|\n`;
        ranges.forEach(r => {
            output += `| ${r.start} | ${r.end} | ${r.rule} | ${r.indicator} | ${r.status} |\n`;
        });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Successfully identified ${ranges.length} confirmed uptrend ranges and wrote to ${outputPath}`);

}

detectConfirmedUptrends();
