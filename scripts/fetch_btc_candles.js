const fs = require('fs');
const path = require('path');

async function fetchBtcCandles() {
  const configPath = path.join(__dirname, '../config/fetch_params.json');
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found at:', configPath);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const { startTime, endTime } = config;

  // Convert EST strings to UTC milliseconds
  // We assume the input strings are in the project's local timezone (America/New_York)
  const startTs = new Date(startTime).getTime();
  const endTs = new Date(endTime).getTime();

  if (isNaN(startTs) || isNaN(endTs)) {
    console.error('Invalid date format in config. Expected YYYY-MM-DD HH:mm');
    process.exit(1);
  }

  const symbol = 'BTCUSDT';
  const interval = '1h';
  // Binance API supports startTime and endTime parameters
  const url = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTs}&endTime=${endTs}&limit=1000`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const rawData = await response.json();

    if (rawData.length === 0) {
      console.log('No candles found for the specified range.');
      return;
    }

    const formattedCandles = rawData.map((candle, index) => {
      const openTime = new Date(candle[0]).toLocaleString('sv-SE', { timeZone: 'America/New_York' });
      return {
        index: index + 1,
        openTime: openTime,
        open: parseFloat(candle[1]).toFixed(2),
        high: parseFloat(candle[2]).toFixed(2),
        low: parseFloat(candle[3]).toFixed(2),
        close: parseFloat(candle[4]).toFixed(2),
        volume: parseFloat(candle[5]).toFixed(4)
      };
    });

    const timestamp = new Date().toLocaleString('sv-SE', { timeZone: 'America/New_York' });

    let markdown = `# BTC/USDT Hourly Candles\n\n`;
    markdown += `**Source:** Binance Public API\n`;
    markdown += `**Interval:** ${interval}\n`;
    markdown += `**Range:** ${startTime} to ${endTime} (EST)\n`;
    markdown += `**Generated At:** ${timestamp} EST\n\n`;
    markdown += `| # | Open Time (EST) | Open | High | Low | Close | Volume (BTC) |\n`;
    markdown += `|---|---|---|---|---|---|---|\n`;

    formattedCandles.forEach(c => {
      markdown += `| ${c.index} | ${c.openTime} | ${c.open} | ${c.high} | ${c.low} | ${c.close} | ${c.volume} |\n`;
    });

    const outputPath = path.join(__dirname, '../data/btc_hourly_candles.md');
    fs.writeFileSync(outputPath, markdown);

    console.log(`Successfully wrote ${formattedCandles.length} candles to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

fetchBtcCandles();
