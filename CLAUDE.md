# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Green Chef** — a personal weekly meal planner for Rosie Bryce. Pescatarian + coeliac-friendly. Takes a library of 31 recipes and plans one week at a time with ingredient-chaining logic (so jars/pastes opened for one meal get used up across the same week).

**Status:** Spec is draft and still being refined. No source code yet — SPEC.md is the source of truth.

**Stack:** Vite + React SPA
**Deploy target:** rosiebryce.github.io/meal-planner/ (GitHub Pages)

## Planned folder structure

```
src/
├── App.jsx
├── components/
│   ├── ThemePicker.jsx
│   ├── WildcardPicker.jsx
│   ├── PlanSummary.jsx
│   └── ShoppingList.jsx
├── data/
│   ├── recipes.json        ← single source of truth for recipe data
│   └── themes.js           ← theme config (id, label, colour, bg)
├── logic/
│   └── chaining.js         ← pure functions only, no side effects
└── main.jsx
```

## Commands (once scaffolded)

```bash
npm run dev       # Vite dev server with hot reload
npm run build     # Build to /dist for deployment
```

No test framework is defined yet.

## Architecture

**Data layer:** All recipe data lives in `recipes.json`. Never hardcode recipe data in components. The `themes.js` config is separate from recipes. See SPEC.md for the full schema.

**Logic layer (`chaining.js`):** Pure functions — no React imports, no side effects, easy to unit test independently:
- `getFixedMeals(themeId, recipesData)` — returns the 2 fixed recipes for a theme
- `getWildcardOptions(themeId, recipesData, pantryState)` — returns sorted wildcard pool (favourites → closes most open jars → alphabetical)
- `generateShoppingList(selectedRecipes)` — flat, deduplicated, alphabetically sorted fresh ingredients
- `getJarsSummary(selectedRecipes)` — returns `{ opens, closes, netNew }` jar/paste keys

**Key UI rules:**
- Theme picker: never show the same theme twice in a row (carry previous in local state)
- Wildcard picker: max 5 options shown; if Mexican pool is size 1, auto-select and skip choice screen
- GF warnings: always visible, never behind a toggle — yellow badge for `glutenNote`, red badge if `glutenFree: false`
- Shopping list: fresh ingredients only; staples are a static reminder banner (see SPEC.md for the full list)

## Visual design (do not deviate)

| Token | Value |
|---|---|
| Background | `#faf7f2` warm cream |
| Header bg | `#1a1a2e` dark navy |
| Accent | `#e9c46a` gold |
| Body font | Georgia, Times New Roman, serif |
| Card border radius | 10–12px |
| Card borders | 2px solid, theme colour |

Do not use Inter, Roboto, system-ui, or purple gradients.

## Coeliac rule

Always use tamari (never soy sauce). Flag miso, stock paste, gnocchi, ketjap manis, pesto, and sun-dried tomato paste for GF verification. Document swaps in `glutenNote`. See SPEC.md for full list.

## Adding recipes

Use the next sequential id. Use existing jar/paste keys from the chaining map in SPEC.md where possible. Max 2 fixed recipes per theme (`wildcard: false`). IDs 32–46 are reserved for Mediterranean recipes TBC.

## Deployment

Set `base: '/meal-planner/'` in `vite.config.js`. Build to `/dist`, push to `gh-pages` branch.
