# exile-flip — Path of Exile Divination Card Flipper

## Project Goal
A lightweight browser-based tool that identifies profitable divination card flipping opportunities in Path of Exile. Users search for cards, see the full set cost vs reward item value, and immediately know if a flip is profitable.

Live at: **https://exile-flip.vercel.app/**
Repo: **https://github.com/Andekoe/exile-flip**

---

## Current Status: Phase 1 Complete ✅

Phase 1 (MVP) is live. The app fetches real data from poe.ninja, shows full set costs, reward items, and profit/loss in both chaos and divine.

---

## Architecture

### Stack
- **Frontend:** Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- **Backend:** Vercel serverless function (`/api/proxy.js`) — required to bypass poe.ninja CORS
- **Hosting:** Vercel (free tier)
- **Storage:** localStorage only (history, league preference)
- **Data Sources:**
  - poe.ninja — live card prices, item prices, divine exchange rate
  - mikifriki/Divination-Cards (GitHub raw JSON) — stack sizes and reward names
  - `src/data.js` CARD_FALLBACK — manual overrides for cards missing from the DB

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
│   └── proxy.js            # Vercel serverless proxy (fetches poe.ninja + card DB)
├── project_specs.md        # This file
├── CLAUDE.md               # Agent rules
└── README.md
```

### Data Flow
```
Page load
  → loadCardSuggestions() fetches all card names silently
  → Populates custom autocomplete dropdown

User types card name
  → Filtered suggestions appear (arrow keys / Enter / click to select)

User clicks "Check Prices"
  → Vercel proxy (/api/proxy) called with league + type
      → Fetches poe.ninja divination card data (prices, divine rate)
      → Fetches mikifriki card DB (stack sizes, reward names)
      → Fetches item prices: Currency, UniqueWeapon, UniqueArmour,
        UniqueAccessory, UniqueFlask, UniqueJewel, UniqueMap,
        SkillGem, Fragment, Scarab, Invitation
      → Combines all data, returns enriched response
  → Frontend parses response
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
| Stack size per card | ✅ (community DB + fallback map) |
| Full set cost in chaos and divine | ✅ |
| Reward item name | ✅ |
| Profit / loss in chaos and divine | ✅ (green = profit, red = loss) |
| Handles corrupted reward names (e.g. Corrupted Headhunter) | ✅ |
| Handles div card rewards (e.g. 9x House of Mirrors) | ✅ |
| Autocomplete with keyboard nav (↑ ↓ Enter Esc) | ✅ |
| League selector (Mirage, HC Mirage, SSF variants) | ✅ |
| League preference saved in localStorage | ✅ |
| Search history (last 10, click to re-run) | ✅ |
| Mobile responsive (390px+) | ✅ |
| Dark theme | ✅ |

---

## Known Limitations

### Card Data Gaps
The community card DB (mikifriki/Divination-Cards) is not always up to date. Cards added in recent leagues may be missing stack size or reward data. Workaround: add to `CARD_FALLBACK` in `src/data.js`.

### Reward Pricing Gaps
Some reward types are not priced by poe.ninja in a way we can look up automatically:
- Random rewards ("Random Unique Item", "Random Currency")
- Very new unique items not yet indexed
- Non-standard rewards (e.g. passive tree nodes, skins)

These show `?` for profit.

### League Names
League names change every ~3 months when GGG releases a new expansion. Update `LEAGUES` and `DEFAULT_LEAGUE` in `src/data.js` at league start.

### No Buy/Sell Spread
We use poe.ninja's `primaryValue` (market rate) for both cost and reward. Real trades include a spread — actual profit will be slightly lower than shown.

---

## Roadmap

### Phase 2 — Data Quality
- [ ] Find or build a more complete, maintained card DB (stack sizes + rewards for all ~325 cards)
- [ ] Auto-detect new league names from poe.ninja instead of hardcoding
- [ ] Show reward item price alongside reward name so user can cross-check
- [ ] Handle multi-item rewards more accurately (e.g. "6x Chaos Orb" quantity parsing)

### Phase 3 — UX Polish
- [ ] Sort table by profit / set cost / card name
- [ ] Filter by min profit threshold
- [ ] Show profit % (not just absolute)
- [ ] Highlight cards where full set cost < reward value (profitable flips only mode)
- [ ] Show price trend / 7-day change (poe.ninja sparkline data available)
- [ ] Card image on hover (poe.ninja has image URLs)

### Phase 4 — Scope Expansion
- [ ] Currency flipping (buy X, sell Y)
- [ ] Scarab / fossil / essence flip tracking
- [ ] Other item types (bases, gems)
- [ ] Auto-refresh with configurable interval
- [ ] Export results as CSV

### Phase 5 — Infrastructure (if needed)
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
We fetch 10 additional poe.ninja endpoints in parallel (Currency, UniqueWeapon, etc.) and build a name→chaosPrice map. Reward names from the card DB are matched against this map, with fallbacks for corrupted prefixes and divination card rewards.

### Card Metadata Source
```
GET https://raw.githubusercontent.com/mikifriki/Divination-Cards/master/db.json
```
Fields used: `name`, `amount` (stack size), `item` (reward name)

---

## Decisions Log

| Decision | Reason |
|---|---|
| Vercel over GitHub Pages | GitHub Pages can't run server-side code; Vercel needed for CORS proxy |
| Vanilla JS, no framework | CLAUDE.md constraint; no build step keeps deployment trivial |
| Community card DB over hardcoded | 325+ cards — hardcoding is unmaintainable |
| CARD_FALLBACK in data.js | Cards missing from community DB can be patched without changing architecture |
| localStorage only | No backend, no user accounts, no ops overhead |
| Manual refresh only | Avoids rate limits; user-triggered is good enough for MVP |
