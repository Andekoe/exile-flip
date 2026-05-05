# exile-flip — Path of Exile Divination Card Flipper

## Project Goal
A lightweight browser-based tool that identifies profitable divination card flipping opportunities in Path of Exile. Users can view a ranked list of all profitable cards or search for individual ones, seeing full set cost vs reward item value to know immediately if a flip is worth it.

Live at: **https://exile-flip.vercel.app/**
Repo: **https://github.com/Andekoe/exile-flip**

---

## Current Status: Phase 2 Complete ✅

Phase 1 (MVP) and Phase 2 (data quality + UX) are live.

---

## Architecture

### Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- **Backend:** Vercel serverless function (`/api/proxy.js`) — required to bypass poe.ninja CORS
- **Hosting:** Vercel (free tier)
- **Storage:** localStorage only (history, league preference)
- **Data Sources:**
  - poe.ninja — live card prices, item prices, divine exchange rate
  - `api/cards.json` — comprehensive local card DB (422 cards, stack sizes + rewards), sourced from poewiki
  - `src/data.js` CARD_FALLBACK — manual overrides for any cards missing from cards.json

### File Structure
```
/exile-flip
├── index.html              # Single-page app shell
├── styles/
│   └── main.css            # Dark theme, CSS variables, mobile-first
├── src/
│   ├── app.js              # UI logic, event handlers, autocomplete
│   ├── api.js              # poe.ninja API calls, price parsing, profit calc
│   ├── data.js             # League list, CARD_FALLBACK overrides
│   └── utils.js            # Formatting, localStorage helpers
├── api/
│   ├── proxy.js            # Vercel serverless proxy (fetches poe.ninja + loads card DB)
│   └── cards.json          # Local card DB: 422 cards with stack sizes + reward names
├── project_specs.md        # This file
├── CLAUDE.md               # Agent rules
└── README.md
```

### Data Flow
```
Page load
  → loadCardSuggestions() fetches all card names silently
  → Populates custom autocomplete dropdown

User clicks "View All Flips"
  → Vercel proxy (/api/proxy) fetches all card + price data
  → Frontend sorts by profit descending
  → Displays only profitable cards (profit > 0), most profitable first

User types card name + clicks "Check Prices"
  → Same proxy call, filtered by search term
  → Displays matching cards

Proxy logic (on every request):
  → Fetches poe.ninja divination card data (prices, divine rate)
  → Loads api/cards.json (local, no network request)
  → Fetches item prices: Currency, UniqueWeapon, UniqueArmour,
    UniqueAccessory, UniqueFlask, UniqueJewel, UniqueMap,
    SkillGem, Fragment, Scarab, Invitation
  → Combines all data, returns enriched response
      → Price per card (chaos + divine)
      → Full set cost = card price × stack size
      → Reward value lookup:
          - Direct name match in item prices
          - Strips "Corrupted " prefix and retries
          - Falls back to divination card price list
      → Profit = reward value - full set cost
  → Table rendered with all columns
  → Click row → saves to history
```

---

## Key Features (Implemented)

| Feature | Status |
|---|---|
| Real poe.ninja price data | ✅ |
| Vercel proxy (CORS bypass) | ✅ |
| Price per card in chaos and divine | ✅ |
| Stack size per card | ✅ (local cards.json — 422 cards, 100% coverage) |
| Full set cost in chaos and divine | ✅ |
| Reward item name | ✅ |
| Reward item sell price in chaos and divine | ✅ |
| Profit / loss in chaos and divine | ✅ (green = profit, red = loss) |
| Handles corrupted reward names (e.g. Corrupted Headhunter) | ✅ |
| Handles div card rewards (e.g. 9x House of Mirrors) | ✅ |
| Ranked "View All Flips" — most profitable first | ✅ |
| Autocomplete with keyboard nav (↑ ↓ Enter Esc) | ✅ |
| League selector (Mirage, HC Mirage, SSF variants) | ✅ |
| League preference saved in localStorage | ✅ |
| Search history (last 10, click to re-run) | ✅ |
| Mobile responsive (390px+) | ✅ |
| Dark theme | ✅ |

---

## Known Limitations

### Reward Pricing Gaps
Some reward types are not priced by poe.ninja in a way we can look up automatically:
- Random rewards ("Random Unique Item", "Random Currency")
- Generic class rewards ("Jewel", "Body Armour", etc.)
- Very new unique items not yet indexed
- Non-standard rewards (e.g. passive tree nodes, skins)
- Magic item rewards (e.g. The Twins)

These show `?` for sell price and profit.

### League Names
League names change every ~3 months when GGG releases a new expansion. Update `LEAGUES` and `DEFAULT_LEAGUE` in `src/data.js` at league start. Also re-fetch `api/cards.json` if new cards were added (run the poewiki batch fetch script).

### No Buy/Sell Spread
We use poe.ninja's `primaryValue` (market rate) for both cost and reward. Real trades include a spread — actual profit will be slightly lower than shown.

### Async Trade Constraint
The tool is designed for async trading only (no direct player contact):
- **Buy side:** div cards purchased from premium stash listings
- **Sell side:** reward items sold via merchant/premium stash tab
- Currency exchange arbitrage was explored but poe.ninja only exposes aggregate market rates, not live order book data — not actionable enough to implement.

---

## Roadmap

### Phase 3 — UX Polish
- [ ] Sort table by column (click header to sort by profit / cost / name)
- [ ] Filter by min profit threshold
- [ ] Show profit % (not just absolute)
- [ ] Show price trend / 7-day change (poe.ninja sparkline data available)
- [ ] Card image on hover (poe.ninja has image URLs)

### Phase 4 — Data Quality
- [ ] Auto-detect new league names from poe.ninja instead of hardcoding
- [ ] Handle multi-item rewards more accurately (e.g. "6x Chaos Orb" quantity parsing)
- [ ] Script to update cards.json at league start (batch-fetch new cards from poewiki)

### Phase 5 — Scope Expansion
- [ ] Currency flipping (buy X, sell Y) — blocked on needing live order book data, not just aggregate rates
- [ ] Scarab / fossil / essence flip tracking
- [ ] Auto-refresh with configurable interval
- [ ] Export results as CSV

### Phase 6 — Infrastructure (if needed)
- [ ] Cache poe.ninja responses server-side to reduce cold start latency
- [ ] Rate limit protection on the Vercel proxy
- [ ] Add automated tests for profit calculation logic

---

## API Notes

### poe.ninja Endpoint
```
GET https://poe.ninja/poe1/api/economy/exchange/current/overview
  ?league=Mirage
  &type=DivinationCard
```
Response: `{ core: { rates: { divine: 0.00258 } }, lines: [...], items: [...] }`
- `lines[n].primaryValue` = price per card in chaos
- `core.rates.divine` = chaos-to-divine rate (multiply chaos by this to get divines)
- `items[n].name` = card display name matched to lines by `id`

### Reward Lookup
We fetch 10 additional poe.ninja endpoints in parallel (Currency, UniqueWeapon, etc.) and build a name→chaosPrice map. Reward names from cards.json are matched against this map, with fallbacks for corrupted prefixes and divination card rewards.

### Card Metadata Source
`api/cards.json` — 422 cards, sourced once from poewiki via MediaWiki batch API.
Format: `{ "Card Name": { "stackSize": 5, "reward": "Mageblood" } }`
Update this file at league start if new cards are added.

---

## Decisions Log

| Decision | Reason |
|---|---|
| Vercel over GitHub Pages | GitHub Pages can't run server-side code; Vercel needed for CORS proxy |
| Vanilla JS, no framework | CLAUDE.md constraint; no build step keeps deployment trivial |
| Local cards.json over mikifriki community DB | mikifriki was missing 119/280 priced cards (42%); poewiki has complete authoritative data |
| CARD_FALLBACK in data.js | Cards missing from cards.json can be patched without changing architecture |
| localStorage only | No backend, no user accounts, no ops overhead |
| Manual refresh only | Avoids rate limits; user-triggered is good enough for MVP |
| Async trade only (no direct player trade) | User preference; buy from premium stashes, sell via merchant tab |
| Currency exchange arbitrage not implemented | poe.ninja only exposes aggregate rates, not live order book — spread data not actionable |
