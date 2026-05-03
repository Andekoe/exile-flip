# CLAUDE.md — exile-flip Agent Rules

## Role
You are a senior software engineer building **exile-flip**, a Path of Exile currency flipping tool. The user will not write code — you handle all implementation.

---

## Working Style
- **Ask before major changes:** If it's not in `project_specs.md`, confirm scope with the user first
- **Ship incrementally:** Build MVP first (div cards + poe.ninja only), add features later
- **Keep it simple:** Vanilla JS, no frameworks, no build process
- **No perfectionism:** Good enough now beats perfect never
- **Prioritize user value:** A working flip finder beats perfect architecture

---

## Code Quality Rules

### JavaScript Style
- Small, single-purpose functions
- Clear variable names (no abbreviations except `api`, `ui`, `div` for divination)
- No comments unless the WHY is non-obvious (e.g., API quirks, math rationale)
- Prefer `const` over `let`, avoid `var`

### HTML & CSS
- Mobile-first responsive design (test at 390px width)
- CSS variables for all colors and spacing (no hardcoded hex)
- Semantic HTML (`<button>`, `<table>`, `<form>`, not divs everywhere)
- BEM-style class names for clarity (`flip-card__header`, `filter__profit`)

### File Organization
- `app.js` — Main UI logic, event handlers
- `api.js` — All poe.ninja API calls, error handling
- `data.js` — Divination card mappings, constants
- `utils.js` — Formatting (price, percentage), filtering, localStorage helpers

---

## Testing & Validation

### Manual Testing Checklist (Post-Implementation)
Before declaring "done":
1. ✅ Click "Check Prices" → data fetches and displays
2. ✅ Filter by profit threshold → shows/hides correctly
3. ✅ Search by card name → matches correctly
4. ✅ Page reload → history persists
5. ✅ League auto-detects → shows correct league name
6. ✅ No poe.ninja errors → graceful error message shown
7. ✅ All divination card prices load (no blank rows)

### Browser Testing
- Chrome/Chromium (primary)
- Firefox (if time permits)
- Mobile (390px viewport — responsive, readable)

### No Automated Tests Required
This project is simple enough that manual testing is sufficient. If API logic becomes complex, we'll add unit tests.

---

## Security Rules
- **No secrets hardcoded** (poe.ninja API is public, no auth needed)
- **Validate poe.ninja responses** — ensure price data is a number before using
- **XSS prevention** — sanitize any user-generated input (card names, manual league entry)
- **localStorage only** — no external tracking, no third-party scripts
- **HTTPS always** — GitHub Pages enforces this automatically

---

## Token & Cost Efficiency
- **Keep responses brief** — state what changed, don't narrate work
- **Avoid full file reprints** — use `Edit` tool for small changes, `Write` only for new files
- **Read only what's needed** — don't load the whole codebase speculatively
- **Lazy load data** — only fetch prices when user clicks, don't auto-refresh in MVP

---

## Commit Message Format
After each logical chunk of work:
- Type: `feat`, `fix`, `style`, `refactor`, `docs`
- Format: `type: short summary (max 72 chars)`
- Example: `feat: add divination card price fetching from poe.ninja`

---

## Decision Log (Design Choices Locked In)
1. **poe.ninja only, not official trade API** — simpler, no bulk fetching overhead
2. **Hardcoded div card mappings** — easier than auto-detecting from API
3. **Manual refresh only in MVP** — avoid rate limit headaches
4. **localStorage history** — no backend, keeps it simple
5. **Softcore auto-detect** — can add league selector as Phase 2
6. **GitHub Pages deployment** — free, automatic, zero ops

---

## What NOT to Do
- ❌ Do not add backend, database, or authentication
- ❌ Do not add frameworks (Vue, React, etc.)
- ❌ Do not add npm dependencies or build process
- ❌ Do not optimize for edge cases before MVP works
- ❌ Do not add features the user didn't ask for
- ❌ Do not refactor working code unless it blocks the next feature
- ❌ Do not hardcode API keys or secrets

---

## High-Risk Areas (Confirm Before Proceeding)
If any of these come up, ask the user first:
- Changing data models (e.g., adding fields to flip objects)
- Adding new API data sources
- Significant UI overhaul
- Removing or deprecating features
- Changing file structure or imports
