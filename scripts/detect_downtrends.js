const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/btc_hourly_candles.md');
const outputPath = path.join(__dirname, '../data/downtrends.md');

function detectDowntrends() {
    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(inputPath, 'utf8');
    const lines = content.split('\n');
    
    const candles = [];
    
    for (const line of lines) {
        // Match table rows: | # | Open Time | Open | ...
        if (line.trim().startsWith('|') && !line.includes('---|') && !line.includes('Open Time')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
            // parts[0] is #, parts[1] is Open Time, parts[2] is Open, parts[5] is Close
            if (parts.length >= 6) {
                candles.push({
                    index: parts[0],
                    openTime: parts[1],
                    open: parseFloat(parts[2]),
                    close: parseFloat(parts[5])
                });
            }
        }
    }
    
    const signals = [];
    for (let i = 1; i < candles.length; i++) {
        const prev = candles[i-1];
        const curr = candles[i];
        // Strategy: previous candle is red (close < open)
        const isPrevRed = prev.close < prev.open;

        if (isPrevRed) {
            // Keep date and hour/minute (strip seconds if present)
            const hourOnly = curr.openTime.substring(0, 16);
            signals.push(hourOnly);
        }
    }
    
    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });
    let output = `# Downtrend Signals — Every Candle After Red\n\n`;
    output += `**Source:** data/btc_hourly_candles.md\n`;
    output += `**Strategy:** Previous candle is red (close < open)\n`;
    output += `**Generated At:** ${timestamp} EST\n\n`;
    
    if (signals.length === 0) {
        output += `No signals found.\n`;
    } else {
        signals.forEach(s => {
            output += `- ${s}\n`;
        });
    }
    
    fs.writeFileSync(outputPath, output);
    console.log(`Successfully identified ${signals.length} signals and wrote to ${outputPath}`);
}

detectDowntrends();
