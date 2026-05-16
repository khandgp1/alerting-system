const fs = require('fs');
const path = require('path');

const candlesPath = path.join(__dirname, '../data/btc_hourly_candles.md');
const uptrendsPath = path.join(__dirname, '../data/confirmed_uptrend.md');

if (!fs.existsSync(candlesPath)) {
  console.error(`Candles file not found: ${candlesPath}`);
  process.exit(1);
}

if (!fs.existsSync(uptrendsPath)) {
  console.error(`Confirmed uptrends file not found: ${uptrendsPath}`);
  process.exit(1);
}

// Ensure charts directory exists
const chartsDir = path.join(__dirname, '../data/charts');
if (!fs.existsSync(chartsDir)) {
  fs.mkdirSync(chartsDir, { recursive: true });
}

// Parse Candles
const candleContent = fs.readFileSync(candlesPath, 'utf8');
const candles = [];
const candleLines = candleContent.split('\n');
for (const line of candleLines) {
  if (line.trim().startsWith('|') && !line.includes('---|') && !line.includes('Open Time')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
    if (parts.length >= 6) {
      candles.push({
        openTime: parts[1], // e.g. '2026-05-13 05:00:00'
        open: parseFloat(parts[2]),
        high: parseFloat(parts[3]),
        low: parseFloat(parts[4]),
        close: parseFloat(parts[5])
      });
    }
  }
}

// Parse Confirmed Uptrends
const uptrendContent = fs.readFileSync(uptrendsPath, 'utf8');
const uptrends = [];
const uptrendLines = uptrendContent.split('\n');
for (const line of uptrendLines) {
  if (line.trim().startsWith('|') && !line.includes('---|') && !line.includes('Start (EST)')) {
    const parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
    if (parts.length >= 4) {
      uptrends.push({
        start: parts[0], // e.g. '2026-05-13 13:00'
        end: parts[1],   // e.g. '2026-05-13 22:00'
        rule: parts[2],  // e.g. 'Close Above Prev High'
        indicator: parseFloat(parts[3]), // e.g. 79074.10
        status: parts[4] || ''
      });
    }
  }
}

if (uptrends.length === 0) {
  console.log('No confirmed uptrends found to chart.');
  process.exit(0);
}

console.log(`Found ${uptrends.length} confirmed uptrends. Generating charts...`);

uptrends.forEach(r => {
  // Find start and end indices in candles
  const fullStartIndex = candles.findIndex(c => c.openTime.substring(0, 16) === r.start);
  const fullEndIndex = candles.findIndex(c => c.openTime.substring(0, 16) === r.end);

  if (fullStartIndex === -1 || fullEndIndex === -1) {
    console.warn(`Could not find matching candles for uptrend range: ${r.start} to ${r.end}`);
    return;
  }

  // Slice candles to include 3 candles before and 3 candles after
  const sliceStart = Math.max(0, fullStartIndex - 3);
  const sliceEnd = Math.min(candles.length - 1, fullEndIndex + 3);
  const chartCandles = candles.slice(sliceStart, sliceEnd + 1);

  // Relative start and end indices within chartCandles
  const startIndex = fullStartIndex - sliceStart;
  const endIndex = fullEndIndex - sliceStart;
  const indicator = r.indicator;

  const width = 800;
  const height = 500;
  const margin = { top: 60, right: 60, bottom: 60, left: 80 };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Calculate price range
  const prices = chartCandles.flatMap(c => [c.open, c.close, c.high, c.low]);
  prices.push(indicator);
  const minPrice = Math.min(...prices) * 0.999;
  const maxPrice = Math.max(...prices) * 1.001;
  const priceRange = maxPrice - minPrice;

  function getX(index) {
    return margin.left + (index + 0.5) * (chartWidth / chartCandles.length);
  }

  function getY(price) {
    return margin.top + (1 - (price - minPrice) / priceRange) * chartHeight;
  }

  const candleWidth = (chartWidth / chartCandles.length) * 0.7;

  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: #1e1e1e; font-family: sans-serif;">`;

  // Title formatting
  const startDateStr = r.start.substring(0, 10);
  const endDateStr = r.end.substring(0, 10);
  const timeRangeStr = startDateStr === endDateStr 
    ? `${r.start}–${r.end.substring(11)} EST` 
    : `${r.start} to ${r.end} EST`;

  svg += `<text x="${width / 2}" y="35" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold">BTC/USDT — ${r.rule} | ${timeRangeStr}</text>`;

  // Shaded Trend Region
  svg += `<rect x="${getX(startIndex) - (chartWidth / chartCandles.length) / 2}" y="${margin.top}" width="${(endIndex - startIndex + 1) * (chartWidth / chartCandles.length)}" height="${chartHeight}" fill="#4facfe" fill-opacity="0.1" />`;

  // Axis Grid Lines (Price)
  const stepCount = 6;
  for (let i = 0; i <= stepCount; i++) {
    const price = minPrice + (priceRange * i) / stepCount;
    const y = getY(price);
    svg += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#333333" stroke-width="1" />`;
    svg += `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" fill="#999999" font-size="12">${price.toFixed(2)}</text>`;
  }

  // Vertical Grid Lines
  chartCandles.forEach((_, i) => {
    const x = getX(i);
    svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#333333" stroke-width="1" opacity="0.5" />`;
  });

  // Indicator Line
  const indicatorY = getY(indicator);
  svg += `<line x1="${margin.left}" y1="${indicatorY}" x2="${width - margin.right}" y2="${indicatorY}" stroke="#4facfe" stroke-width="2" stroke-dasharray="5,5" />`;
  svg += `<text x="${width - margin.right + 5}" y="${indicatorY + 4}" fill="#4facfe" font-size="12" font-weight="bold">${indicator.toFixed(2)}</text>`;

  // Vertical Lines
  svg += `<line x1="${getX(startIndex) - (chartWidth / chartCandles.length) / 2}" y1="${margin.top}" x2="${getX(startIndex) - (chartWidth / chartCandles.length) / 2}" y2="${height - margin.bottom}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />`;
  svg += `<line x1="${getX(endIndex) + (chartWidth / chartCandles.length) / 2}" y1="${margin.top}" x2="${getX(endIndex) + (chartWidth / chartCandles.length) / 2}" y2="${height - margin.bottom}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />`;

  // Candlesticks
  chartCandles.forEach((c, i) => {
    const x = getX(i);
    const color = c.close >= c.open ? '#26a69a' : '#ef5350';
    
    // Wick
    svg += `<line x1="${x}" y1="${getY(c.high)}" x2="${x}" y2="${getY(c.low)}" stroke="${color}" stroke-width="1.5" />`;
    
    // Body
    const yOpen = getY(c.open);
    const yClose = getY(c.close);
    const bodyY = Math.min(yOpen, yClose);
    const bodyHeight = Math.abs(yOpen - yClose) || 1; // Ensure some height even if flat
    
    svg += `<rect x="${x - candleWidth / 2}" y="${bodyY}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" />`;

    // Time labels (every hour)
    const hourLabel = c.openTime.substring(11, 16);
    svg += `<text x="${x}" y="${height - margin.bottom + 25}" text-anchor="middle" fill="#999999" font-size="11">${hourLabel}</text>`;
  });

  svg += `</svg>`;

  const ruleSlug = r.rule.toLowerCase().replace(/\s+/g, '_');
  const startSlug = r.start.replace(/[: ]/g, '-');
  const outputPath = path.join(chartsDir, `uptrend_${ruleSlug}_${startSlug}.svg`);
  fs.writeFileSync(outputPath, svg);
  console.log(`Chart saved to ${outputPath}`);
});
