# exile-flip — Path of Exile Currency Flipping Tool

## Project Goal
Build a lightweight browser-based tool that identifies profitable currency flipping opportunities in Path of Exile, starting with divination cards. Users manually check prices and see ranked opportunities to buy low and sell high for profit.

---

## Key Features

### MVP (Phase 1)
- **Divination Card Flipping:** Track ~50 popular div cards → match to result items
- **Price Fetching:** Call poe.ninja API to get buy/sell prices
- **League Detection:** Auto-detect current Softcore league
- **Opportunity Ranking:** Show all flips ranked by profit % and absolute profit
- **Manual Refresh:** User clicks button to check latest prices
- **History Storage:** Track past flips in localStorage
- **Filtering:** User can filter by profit threshold (5%, 10%, 20%, etc.)

### Phase 2 (Future, not MVP)
- Add other flip types (fossils, essences, seeds, etc.)
- Auto-refresh with notifications
- League switching (Hardcore, SSF variants)
- Export/share opportunities
- Price trend charts

---

## Non-Goals (Scope Control)
- Real-time market monitoring (manual checking only for MVP)
- Player-to-player trading automation
- Requires authentication or user accounts
- Backend server or database
- Paid hosting or API services
- Mobile app (web-responsive is enough)

---

## Assumptions
1. **poe.ninja API** is always available and has accurate pricing
2. **Divination card outcomes** are deterministic and well-known (hardcoded mapping)
3. **User has PoE knowledge** and understands flipping mechanics (no tutorial needed)
4. **Users only care about instant buyout** (currency tab or player offline listings)
5. **Current league is always Softcore** (auto-detected from poe.ninja)

---

## Architecture Overview

### Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks, no build)
- **Hosting:** GitHub Pages (static site)
- **Storage:** localStorage only
- **API:** poe.ninja (public, no auth, rate-limit friendly)

### File Structure
```
/exile-flip
├── index.html          # Single-page app
├── styles/
│   └── main.css       # All styling
├── src/
│   ├── app.js         # Main app logic
│   ├── api.js         # poe.ninja API calls
│   ├── data.js        # Divination card mappings
│   └── utils.js       # Helpers (formatting, filtering, etc)
├── docs/
│   └── API_NOTES.md   # API behavior & rate limits
├── project_specs.md   # This file
├── CLAUDE.md          # Agent rules
├── README.md          # User guide
└── .gitignore
```

---

## Data Flow

```
User clicks "Check Prices"
    ↓
app.js → api.js fetches poe.ninja data for all div cards
    ↓
app.js → Match card prices against result item prices
    ↓
Calculate profit % and absolute profit
    ↓
Rank by profitability, display table
    ↓
User filters by profit threshold or searches
    ↓
Store results in localStorage for history
```

---

## API Design

### poe.ninja Endpoints Used
1. **`/api/data/ItemOverview`**
   - Fetches prices for a specific item type in a league
   - Params: `type` (e.g., "DivinationCard"), `league` (e.g., "Affliction")
   - Returns: Array of items with prices

### Internal Data Structure
```javascript
// Divination card mapping
{
  "The Wrath": {
    result: "Wrath",
    resultType: "Gem"
  },
  "Struck by Lightning": {
    result: "Lightning Damage",
    resultType: "Modifier"
  }
  // ... ~50 cards
}

// Flip opportunity (calculated)
{
  card: "The Wrath",
  buyPrice: 15,
  resultValue: 40,
  profit: 25,
  profitPercent: 166.67,
  league: "Affliction"
}
```

---

## Critical Paths to Test (Post-Implementation)

1. **League Auto-Detection**
   - App fetches current league from poe.ninja correctly
   - Falls back gracefully if API fails

2. **Price Fetching**
   - Divination card prices fetch correctly
   - Result item prices match correctly
   - Handles missing items (some cards have no valid result)

3. **Profit Calculation**
   - Math is correct: profit = resultPrice - cardPrice
   - profitPercent = (profit / cardPrice) * 100
   - Sorts correctly by both absolute and percentage

4. **Data Persistence**
   - History saves to localStorage without corruption
   - Survives page reload
   - User can clear history

5. **Filtering & Search**
   - Threshold filter works (hide flips below X%)
   - Search by card name works
   - Filters combine correctly

---

## Risks & Unknowns

1. **poe.ninja Rate Limits:** Unknown exact limits; may need caching
   - Mitigation: Cache results for 5-10 minutes, show cache timestamp

2. **Divination Card Mapping Maintenance:** Manual updates needed when cards change
   - Mitigation: Link to community wiki for manual updates if needed

3. **League Names Change:** May need to adjust league detection logic
   - Mitigation: Allow user to manually select league as fallback

4. **Item Pricing Volatility:** Prices change rapidly; data stales fast
   - Mitigation: Show timestamp, encourage frequent refreshes

---

## Future Improvements (Post-MVP)
- Add fossils, essences, seeds, other flip types
- Auto-refresh with browser notifications
- Dark mode
- Profit calculator per flip (quantity needed, profit target)
- Community crowdsourced flip ideas
- Mobile app wrapper
