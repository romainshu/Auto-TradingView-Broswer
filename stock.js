// ============================================================================
// stocks.js
// ----------------------------------------------------------------------------
// Ticker list consumed by review.html.
//
// Edit this array to load a different watchlist / scanner output / sector
// pool / Top Gainers list / etc. Order matters: review.html walks through
// this array from index 0 to the end.
//
// Accepted formats per entry:
//   "NVDA"            -> TradingView will auto-resolve the exchange
//   "NASDAQ:NVDA"      -> explicit exchange (use this if auto-resolution
//                         ever picks the wrong listing, e.g. for tickers
//                         that exist on multiple exchanges)
// ============================================================================

const STOCKS = [
    "NVDA",
    "PLTR",
    "TSLA",
    "APP",
    "CRWD"
];
