const fs = require('fs');
const path = require('path');

const candles = [
  { time: '10:00', open: 79585.64, high: 79842.26, low: 79500.00, close: 79778.47 },
  { time: '11:00', open: 79844.36, high: 79865.72, low: 78831.90, close: 78834.30 },
  { time: '12:00', open: 78843.19, high: 79221.77, low: 78776.88, close: 79074.10 },
  { time: '13:00', open: 79213.22, high: 79537.17, low: 79180.15, close: 79537.17 },
  { time: '14:00', open: 79515.45, high: 79822.62, low: 79515.45, close: 79643.72 },
  { time: '15:00', open: 79629.55, high: 79647.37, low: 79455.34, close: 79643.15 },
  { time: '16:00', open: 79652.81, high: 79748.13, low: 79636.55, close: 79708.84 },
  { time: '17:00', open: 79711.71, high: 79719.22, low: 79385.23, close: 79390.60 },
  { time: '18:00', open: 79391.19, high: 79478.11, low: 79245.79, close: 79444.04 },
  { time: '19:00', open: 79426.17, high: 79488.82, low: 79266.11, close: 79329.71 },
  { time: '20:00', open: 79335.34, high: 79688.69, low: 79335.34, close: 79597.03 },
  { time: '21:00', open: 79578.29, high: 79679.90, low: 79433.20, close: 79632.92 },
  { time: '22:00', open: 79607.27, high: 79669.45, low: 79244.33, close: 79359.62 },
  { time: '23:00', open: 79364.47, high: 79457.48, low: 78954.14, close: 79031.64 },
  { time: '00:00', open: 79029.52, high: 79463.21, low: 79013.00, close: 79450.27 },
  { time: '01:00', open: 79432.42, high: 79979.48, low: 79409.17, close: 79822.66 },
];

const indicator = 79074.10;
const startIndex = 3; // 13:00
const endIndex = 12; // 22:00

const width = 800;
const height = 500;
const margin = { top: 60, right: 60, bottom: 60, left: 80 };

const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

// Calculate price range
const prices = candles.flatMap(c => [c.open, c.close, c.high, c.low]);
prices.push(indicator);
const minPrice = Math.min(...prices) * 0.999;
const maxPrice = Math.max(...prices) * 1.001;
const priceRange = maxPrice - minPrice;

function getX(index) {
  return margin.left + (index + 0.5) * (chartWidth / candles.length);
}

function getY(price) {
  return margin.top + (1 - (price - minPrice) / priceRange) * chartHeight;
}

const candleWidth = (chartWidth / candles.length) * 0.7;

let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="background: #1e1e1e; font-family: sans-serif;">`;

// Title
svg += `<text x="${width / 2}" y="35" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold">BTC/USDT — Close Above Prev High | 2026-05-13 13:00–22:00 EST</text>`;

// Shaded Trend Region
svg += `<rect x="${getX(startIndex) - (chartWidth / candles.length) / 2}" y="${margin.top}" width="${(endIndex - startIndex + 1) * (chartWidth / candles.length)}" height="${chartHeight}" fill="#4facfe" fill-opacity="0.1" />`;

// Axis Grid Lines (Price)
const stepCount = 6;
for (let i = 0; i <= stepCount; i++) {
  const price = minPrice + (priceRange * i) / stepCount;
  const y = getY(price);
  svg += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#333333" stroke-width="1" />`;
  svg += `<text x="${margin.left - 10}" y="${y + 4}" text-anchor="end" fill="#999999" font-size="12">${price.toFixed(2)}</text>`;
}

// Vertical Grid Lines
candles.forEach((_, i) => {
  const x = getX(i);
  svg += `<line x1="${x}" y1="${margin.top}" x2="${x}" y2="${height - margin.bottom}" stroke="#333333" stroke-width="1" opacity="0.5" />`;
});

// Indicator Line
const indicatorY = getY(indicator);
svg += `<line x1="${margin.left}" y1="${indicatorY}" x2="${width - margin.right}" y2="${indicatorY}" stroke="#4facfe" stroke-width="2" stroke-dasharray="5,5" />`;
svg += `<text x="${width - margin.right + 5}" y="${indicatorY + 4}" fill="#4facfe" font-size="12" font-weight="bold">${indicator.toFixed(2)}</text>`;

// Vertical Lines
svg += `<line x1="${getX(startIndex) - (chartWidth / candles.length) / 2}" y1="${margin.top}" x2="${getX(startIndex) - (chartWidth / candles.length) / 2}" y2="${height - margin.bottom}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />`;
svg += `<line x1="${getX(endIndex) + (chartWidth / candles.length) / 2}" y1="${margin.top}" x2="${getX(endIndex) + (chartWidth / candles.length) / 2}" y2="${height - margin.bottom}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.5" />`;

// Candlesticks
candles.forEach((c, i) => {
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
  const hourLabel = c.time.split(':')[0];
  svg += `<text x="${x}" y="${height - margin.bottom + 25}" text-anchor="middle" fill="#999999" font-size="11">${hourLabel}</text>`;
});

svg += `</svg>`;

const outputPath = path.join(__dirname, '../data/charts/uptrend_close_above_prev_high_2026-05-13-13.svg');
fs.writeFileSync(outputPath, svg);
console.log(`Chart saved to ${outputPath}`);
