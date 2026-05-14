const fs = require('fs');
const path = require('path');

const candlesPath = path.join(__dirname, '../data/btc_hourly_candles.md');
const signalsPath = path.join(__dirname, '../data/downtrends.md');
const outputPath = path.join(__dirname, '../data/confirmed_uptrend.md');

function detectConfirmedUptrends() {
    if (!fs.existsSync(candlesPath)) {
        console.error(`Candles file not found: ${candlesPath}`);
        process.exit(1);
    }
    if (!fs.existsSync(signalsPath)) {
        console.error(`Signals file not found: ${signalsPath}`);
        process.exit(1);
    }

    const candleContent = fs.readFileSync(candlesPath, 'utf8');
    const signalContent = fs.readFileSync(signalsPath, 'utf8');

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
                    close: parseFloat(parts[5])
                });
            }
        }
    }

    // Parse Signal Timestamps
    const signalTimestamps = [];
    const signalLines = signalContent.split('\n');
    for (const line of signalLines) {
        if (line.trim().startsWith('- ')) {
            const ts = line.replace('- ', '').trim();
            signalTimestamps.push(ts);
        }
    }

    const ranges = [];

    for (const signalTs of signalTimestamps) {
        // Find the index of the signal candle
        const signalIndex = candles.findIndex(c => c.openTime.startsWith(signalTs));
        if (signalIndex === -1) continue;

        const signalCandle = candles[signalIndex];

        // "If the candle closes green, mark the close"
        if (signalCandle.close > signalCandle.open) {
            const indicator = signalCandle.close;
            
            // "The next candle must close above the indicator to confirm the uptrend"
            if (signalIndex + 1 >= candles.length) continue; // Not confirmed yet (ongoing signal candle)
            
            if (candles[signalIndex + 1].close <= indicator) continue; // Failed confirmation

            let lastGoodIndex = signalIndex + 1;

            // "Once confirmed, the trend remains valid for subsequent 1h candles as long as their closing price stays above the indicator"
            for (let j = signalIndex + 2; j < candles.length; j++) {
                if (candles[j].close > indicator) {
                    lastGoodIndex = j;
                } else {
                    break;
                }
            }

            ranges.push({
                start: signalCandle.openTime.substring(0, 16),
                end: candles[lastGoodIndex].openTime.substring(0, 16),
                indicator: indicator.toFixed(2),
                status: lastGoodIndex === candles.length - 1 ? 'Ongoing' : 'Broken'
            });
        }
    }

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });
    let output = `# Confirmed Uptrend Ranges\n\n`;
    output += `**Source:** data/btc_hourly_candles.md, data/downtrends.md\n`;
    output += `**Strategy:** Green signal candle + Next candle closes above its close.\n`;
    output += `**Generated At:** ${timestamp} EST\n\n`;

    if (ranges.length === 0) {
        output += `No confirmed uptrend ranges found.\n`;
    } else {
        output += `| Start (EST) | End (EST) | Indicator (Close) | Status |\n`;
        output += `|---|---|---|---|\n`;
        ranges.forEach(r => {
            output += `| ${r.start} | ${r.end} | ${r.indicator} | ${r.status} |\n`;
        });
    }

    fs.writeFileSync(outputPath, output);
    console.log(`Successfully identified ${ranges.length} confirmed uptrend ranges and wrote to ${outputPath}`);
}

detectConfirmedUptrends();
