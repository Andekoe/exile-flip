# exile-flip

A lightweight Path of Exile currency flipping tracker. Identify profitable divination card flips and other arbitrage opportunities using real-time poe.ninja pricing.

## Quick Start

1. **Open the app:** Visit the hosted site (or open `index.html` locally)
2. **Click "Check Prices"** to fetch current divination card prices
3. **View opportunities** sorted by profitability
4. **Filter by profit threshold** to hide low-margin flips
5. **Click a flip** to get more details or find the listing

## How It Works

- **Divination Cards:** Buy cards from currency exchange (instant buyout)
- **Sell Results:** Identify what each card produces and sell the item for profit
- **Profit Calculation:** `(Result Price - Card Price) / Card Price * 100%`

Example:
- Buy "The Wrath" card for 10c
- Open cards → get Wrath gem worth 40c
- Profit: 30c (300%)

## Features

- 🔍 Real-time price data from poe.ninja
- 🎯 Automatic league detection (Softcore)
- 💾 Local history tracking
- 🔥 Filter by profit threshold
- 📱 Responsive design (desktop & mobile)
- 🚀 Zero backend, runs entirely in browser

## Technical Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Data:** poe.ninja API
- **Storage:** Browser localStorage
- **Hosting:** GitHub Pages

## Development

### File Structure
```
src/
├── app.js       - Main UI logic
├── api.js       - poe.ninja API calls
├── data.js      - Divination card mappings
└── utils.js     - Helpers & formatting

styles/
└── main.css     - Styling

index.html       - Single-page app
```

### Running Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/exile-flip.git
cd exile-flip

# Open in browser (no build needed)
open index.html
```

## Known Limitations

- **Manual refresh only** (auto-check coming in Phase 2)
- **Divination cards only** in MVP (fossils/essences later)
- **Softcore only** (other leagues in Phase 2)
- **Data staleness:** Refresh frequently for best results

## Roadmap

- [ ] **Phase 1 (MVP):** Div card flipping, manual refresh
- [ ] **Phase 2:** Other flip types, auto-refresh, notifications
- [ ] **Phase 3:** League switching, trend charts, community features

## Contributing

Found a profitable flip we missed? Open an issue or PR to add it to `src/data.js`.

## License

MIT

---

**Built for PoE players who love the market game.**
