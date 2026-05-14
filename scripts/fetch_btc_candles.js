const fs = require('fs');
const path = require('path');

async function fetchBtcCandles() {
  const symbol = 'BTCUSDT';
  const interval = '1h';
  const limit = 25; // Fetch 25 to get 24 closed candles
  const url = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const rawData = await response.json();

    // Binance kline data format:
    // [
    //   [
    //     1499040000000,      // Kline open time
    //     "0.01634790",       // Open price
    //     "0.80000000",       // High price
    //     "0.01575800",       // Low price
    //     "0.01577100",       // Close price
    //     "148976.11427815",  // Volume
    //     1499644799999,      // Kline Close time
    //     "2434.19055334",    // Quote asset volume
    //     308,                // Number of trades
    //     "1756.87402397",    // Taker buy base asset volume
    //     "28.46694368",      // Taker buy quote asset volume
    //     "0"                 // Unused field, ignore.
    //   ]
    // ]

    // Drop the last candle as it's still open
    const closedCandles = rawData.slice(0, 24);

    const formattedCandles = closedCandles.map((candle, index) => {
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
    markdown += `**Generated At:** ${timestamp} EST\n\n`;
    markdown += `| # | Open Time (EST) | Open | High | Low | Close | Volume (BTC) |\n`;
    markdown += `|---|---|---|---|---|---|---|\n`;

    formattedCandles.forEach(c => {
      markdown += `| ${c.index} | ${c.openTime} | ${c.open} | ${c.high} | ${c.low} | ${c.close} | ${c.volume} |\n`;
    });

    const outputPath = path.join(__dirname, '../data/btc_hourly_candles.md');
    fs.writeFileSync(outputPath, markdown);

    console.log(`Successfully wrote 24 candles to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching data:', error);
    process.exit(1);
  }
}

fetchBtcCandles();
