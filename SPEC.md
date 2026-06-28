# Meal Planner — Project Spec

**Owner:** Rosie Bryce
**Last updated:** April 2026
**Stack:** Vite + React
**Target deployment:** rosiebryce.github.io
**Status:** Ready to build

---

## What this is

A personal weekly meal planning app. It takes a library of recipes — originally from a Green Chef subscription, now extended with BBC Good Food recipes — and plans two weeks at a time, with jar/paste chaining logic built in so that opened jars get used up across both weeks.

**User constraints baked into the design:**
- Pescatarian — no meat, ever
- Coeliac — GF warnings surfaced prominently; key swaps documented in recipe data
- Cooking for one — quantities are for 1 person with leftovers for lunch, not 2 portions
- Shops weekly — planning is two-week blocks, fresh ingredients bought separately each week
- Three shops: **Sainsbury's** (Deliveroo) for weekly fresh; **Ocado** for pastes, sauces, specialty dry goods; **Morrisons** (Deliveroo) for easy/free-from meals
- Recipes target ≤30 mins, hard max 45 mins, ≤6 steps

---

## Folder structure

```
meal-planner/
├── public/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── RecipePicker.jsx       ← step 1: random 4, pick 1
│   │   ├── RelatedPicker.jsx      ← step 2: 2 related + 2 unrelated, pick 1
│   │   ├── PlanSummary.jsx        ← shows full 2-week plan + shopping lists
│   │   ├── OptionalExtras.jsx     ← non-dinner recipes to opt into
│   │   └── ShoppingList.jsx       ← split week 1 / week 2 fresh + combined jars
│   ├── data/
│   │   ├── recipes.json           ← single source of truth; edit to add recipes
│   │   └── easy-buys.json         ← maintained list of simple fallback dinners ⚠️ TBD
│   ├── logic/
│   │   └── chaining.js            ← pure functions only, no side effects
│   └── main.jsx
├── package.json
├── vite.config.js
└── SPEC.md                        ← this file
```

---

## recipes.json — schema

Every recipe follows this structure exactly. Do not hardcode recipe data in components.

```json
{
  "id": 1,
  "name": "Thai Yellow Curry Bowl",
  "cuisine": "Thai",
  "mealType": "dinner",
  "protein": "Tofu",
  "glutenFree": true,
  "glutenNote": null,
  "favourite": false,
  "source": "green-chef",
  "opens": ["yellow-thai-paste", "coconut-milk"],
  "closes": [],
  "ingredients": [
    { "name": "pak choi", "shop": "sainsburys" },
    { "name": "shallots", "shop": "sainsburys" },
    { "name": "bell pepper", "shop": "sainsburys" },
    { "name": "fresh coriander", "shop": "sainsburys" },
    { "name": "baby spinach", "shop": "sainsburys" },
    { "name": "lime", "shop": "sainsburys" },
    { "name": "garlic", "shop": "sainsburys" },
    { "name": "yellow Thai paste", "shop": "ocado" },
    { "name": "coconut milk", "shop": "sainsburys" },
    { "name": "steamed brown basmati rice pouch", "shop": "sainsburys" }
  ]
}
```

### Field reference

| Field | Type | Notes |
|---|---|---|
| `id` | number | Unique, sequential |
| `name` | string | Display name |
| `cuisine` | string | "Thai", "Indian", "Fish", "Mexican", "Mediterranean", "Malaysian", "Veggie", "Italian" |
| `mealType` | string | `"dinner"`, `"bake"`, `"dessert"`, `"snack"` |
| `protein` | string | "Fish", "Tofu", "Paneer", "Halloumi", "Quorn", "Egg", "Veg" |
| `glutenFree` | boolean | true = safe as written |
| `glutenNote` | string or null | Warning badge text. null if no issue |
| `favourite` | boolean | Surfaces first in selection candidates |
| `source` | string | `"green-chef"`, `"bbc-good-food"`, or full URL |
| `image` | string or null | Path to square image, e.g. `"/images/recipes/thai-yellow-curry.png"`. null shows placeholder. |
| `opens` | string[] | Jar/paste keys this recipe opens |
| `closes` | string[] | Jar/paste keys this recipe uses up |
| `ingredients` | object[] | `{ name: string, shop: "sainsburys" \| "ocado" }` |

### Shop assignment rule
- Default to `"sainsburys"` for anything fresh, dairy, standard dry goods
- Use `"ocado"` for: specialty pastes, spice mixes, GF specialist items, and anything noted as "ocado" in the ingredient draft
- Staples (oils, tinned goods, dried herbs, spices) are not in `ingredients` — assumed in cupboard, listed in the static staples banner
- Morrisons is a separate static list (`easy-buys.json`) — never in recipe ingredients

**Removed fields from old spec:** `theme`, `wildcard`, `freshIngredients` — no longer used.

### Coeliac notes — always check these ingredients

The following require verified GF versions or label checks. Document in `glutenNote` on any recipe that uses them:

- Soy sauce → always swap to tamari
- Miso paste → check label (most are GF but not all)
- Stock paste → use Knorr GF range
- Gnocchi → requires specifically GF gnocchi
- Ketjap manis → check label; some contain wheat
- Pesto → check label
- Sun-dried tomato paste → check label
- Cornbread/polenta-based recipes → usually GF but verify baking powder

### Recipe assumptions

- "Chickpeas" always means tinned, never dried
- Fresh herbs means fresh unless the recipe says "mixed herbs" — that means dried packet
- "Steamed brown basmati rice" and "basmati rice" are interchangeable

---

## chaining.js — functions required

All functions are pure — no side effects, no imports from React, no state.

### getRandomCandidates(recipesData, excludeIds = [], count = 4)
Returns `count` random dinner recipes from the pool, excluding any ids in `excludeIds` (used to avoid repeating recent picks). Favourites get a weighted boost but are not guaranteed.

### getRelatedCandidates(recipe, recipesData, jarState, count = 2)
Returns recipes sorted by jar/paste overlap with `recipe`. Specifically:
1. Recipes that close jars `recipe` opens (highest priority — reduces waste)
2. Recipes that share the same cuisine
3. Favourites as tiebreaker
4. Alphabetical as final tiebreaker

Returns top `count`.

### getUnrelatedCandidates(recipe, recipesData, excludeIds, count = 2)
Returns recipes with minimal jar/paste overlap with `recipe`, excluding `excludeIds`. Sorted by favourites then alphabetical. Returns top `count`.

### assignThirdRecipe(recipe1, recipe2, recipesData, jarState)
Assigns a third dinner recipe automatically. Selects the recipe that maximises closure of jars opened by recipe1 + recipe2. Excludes recipe1 and recipe2. If no jar-closing candidate exists, picks a favourite or random dinner.

### planWeekTwo(week1Recipes, recipesData)
Takes the 3 confirmed week 1 recipes. Computes the jar state after week 1 (what's been opened but not closed). Returns `{ related: [], unrelated: [] }` candidates for week 2, weighted toward closing open jars. Week 2 follows the same 3-recipe structure but is fully assigned by the app — user can swap individual recipes.

### generateShoppingList(recipes)
Takes an array of recipe objects. Returns two deduplicated, alphabetically sorted arrays:
```js
{
  sainsburys: ["asparagus", "basa fillets", "bell pepper", ...],
  ocado: ["yellow Thai paste", "miso paste", ...]
}
```
Called twice — once per week. Sainsbury's list goes to Deliveroo. Ocado list is combined across both weeks (jars don't go off).

### getJarsSummary(allRecipes)
Takes all 6 recipes (both weeks combined). Returns:
```js
{
  opens: ["yellow-thai-paste", "coconut-milk"],
  closes: ["miso-paste"],
  netNew: ["yellow-thai-paste", "coconut-milk"]  // opens minus closes
}
```
`netNew` is what needs buying — drives the fortnight Ocado order.

### getOptionalExtras(week1Recipes, week2Recipes, recipesData)
Returns non-dinner recipes (`mealType !== "dinner"`) that share fresh ingredients with the planned meals — i.e. you'd already have the ingredients. Sorted by ingredient overlap descending.

---

## UI flow

Two-week block planning. Everything planned upfront in one session to reduce friction.

```
Step 1 — Pick your first recipe
  App shows 4 random dinner recipes
  → You pick 1

Step 2 — Shape the week
  App shows 2 related (jar-chaining priority) + 2 unrelated
  → You pick 1

Step 3 — Recipe 3 assigned
  App assigns the best jar-closing third recipe
  → You can swap it (shows next best alternatives)

Week 1 confirmed (3 dinners)

Week 2 — App assigns 3 dinners
  Seeded by what jars are open after week 1
  → You can swap any of the 3

Plan summary
  - Week 1: 3 dinners listed with GF warnings
  - Week 2: 3 dinners listed with GF warnings
  - Optional extras panel (non-dinner recipes, opt-in)
  - Week 1 fresh shopping list (Sainsbury's / Deliveroo)
  - Week 2 fresh shopping list (Sainsbury's / Deliveroo)
  - Jars & pastes list, combined for fortnight (Ocado / Waitrose)
  - Easy buys panel ⚠️ TBD
  - "Plan again" to start a new fortnight
```

### Selection rules
- Never repeat a recipe from the previous fortnight (carry recent ids in local state)
- Step 2 must always show exactly 2 related + 2 unrelated — never fewer
- If the pool is too small to find 2 unrelated, relax the "unrelated" constraint and show best available
- App-assigned recipes (step 3, week 2) always show a "swap" option

### GF warnings
- Always visible — never hidden behind a toggle
- Yellow badge: `⚠️` + glutenNote text (GF swap required)
- Red badge: recipe contains gluten (`glutenFree: false`) — show the swap instruction

### Optional extras
Shown after the plan is confirmed. These are non-dinner recipes (`mealType !== "dinner"`). They surface when you've hit all 3 recipe picks — the idea is "you're cooking this week anyway, here's a breakfast / bake / dessert that uses the same ingredients." If you opt in, their fresh ingredients merge into the relevant week's shopping list.

### Easy buys ⚠️ TBD
A fallback panel for nights you don't want to cook. Rosie to research and define format. Likely: a maintained list of known-good Sainsbury's ready meals / simple products, shown alongside the plan so you can mentally sub one in and skip a recipe.

---

## Visual design

Preserve the aesthetic from the original artifact exactly:

| Token | Value |
|---|---|
| Background | `#faf7f2` (warm cream) |
| Header background | `#1a1a2e` (dark navy) |
| Accent / gold | `#e9c46a` |
| Body font | Georgia, Times New Roman, serif |
| Border radius | 10–12px on cards |
| Card borders | 2px solid, cuisine colour |

Do not use Inter, Roboto, or system-ui. Do not use purple gradients. The aesthetic is warm editorial — like a well-loved cookbook.

**Cuisine colour map** (replaces theme colours from old spec):

| Cuisine | Colour | Background |
|---|---|---|
| Thai | `#2d6a4f` | `#d8f3dc` |
| Indian | `#c77dff` | `#f3e8ff` |
| Fish / Mediterranean | `#0077b6` | `#caf0f8` |
| Mexican | `#e76f51` | `#fde8d8` |
| Risotto / Veggie | `#b5838d` | `#ffe8ec` |
| Malaysian / Asian | `#e9a84c` | `#fff3e0` |

---

## Staples — not in shopping list generation

These are assumed to always be in the cupboard. Show as a static reminder banner only:

- Basmati rice (white and brown)
- Risotto rice
- Tinned chickpeas, black beans, kidney beans
- Coconut milk
- Passata, tinned chopped tomatoes with onion & garlic
- Olive oil, honey, cider vinegar, balsamic glaze
- Tamari (GF soy swap — always use this)
- Dijon mustard, wholegrain mustard
- Ground turmeric, cumin, smoked paprika, chilli flakes
- Dried basil, mixed herbs, dried thyme
- Cashew nuts, pumpkin seeds, flaked almonds, desiccated coconut
- Mango chutney (once opened, treat as staple)
- Vegetable stock paste (Knorr GF)

---

## Current recipe library

### Original Green Chef recipes (IDs 1–31)

IDs are sequential — gaps are fine, don't renumber.

#### Thai (5)
| id | Name | Favourite |
|---|---|---|
| 1 | Thai Yellow Curry Bowl (tofu) | |
| 2 | Yellow Thai Basa Curry | |
| 3 | Ginger & Peanut Sweet Potato Curry | **Yes** |
| 4 | Green Thai Sweet Potato Curry | |
| 5 | Super Green Thai Chickpea Curry | |

#### Indian (10)
| id | Name | GF note |
|---|---|---|
| 6 | Spicy Paneer Tikka Curry | — |
| 7 | Paneer Butter Masala | — |
| 8 | Tandoori Paneer Rice Bowl | — |
| 9 | Ginger Paneer & Caramelised Onion Curry | — |
| 10 | Aubergine & Spinach Curry | — |
| 12 | One Pan Smokey Chickpea Curry | — |
| 13 | Creamy Tomato & Chickpea Curry | — |
| 36 | Masala Fish (cod) | — |
| 45 | Dum Aloo | — |
| 50 | Palak Paneer | — |

#### Fish & Mediterranean (12)
| id | Name | GF note |
|---|---|---|
| 14 | Spicy Zhoug Sea Bream | — |
| 15 | Miso-Glazed Salmon | GF miso + tamari |
| 16 | Confit Garlic & Rosemary Basa | — |
| 17 | Honey & Ginger Glazed Basa | Check ketjap manis |
| 18 | Salmon Gremolata Butter | — |
| 19 | Sea Bream in Chive & Garlic Butter | — |
| 20 | Italian Sea Bass Tray Bake | Check pesto + sun-dried tomato paste |
| 21 | Salmon & Herbed Smashed Potatoes | — |
| 34 | Baked Salmon & Leek Parcel | — |
| 35 | GF Salmon Pasta | GF pasta |
| 41 | GF Fish & Chips | Gram flour batter |
| 44 | Honey & Orange Sea Bass with Lentils | — |

#### Mexican (6)
| id | Name | GF note |
|---|---|---|
| 22 | Mexican Black Bean Bowl | — |
| 23 | Kidney Bean Jacket Potato | — |
| 24 | Cajun Halloumi & Black Bean Burrito Bowl | — |
| 32 | Lemon Sea Bream with Pesto Drizzle | Check pesto |
| 33 | Sweet Potato Jackets with Guacamole & Kidney Beans | — |
| 38 | Mexican-Style Stuffed Peppers | — |

#### Mediterranean & Other (8)
| id | Name | GF note |
|---|---|---|
| 39 | Spicy Harissa Aubergine Pie | — |
| 42 | Katsu Curry (Quorn) | GF breadcrumbs |
| 43 | Quinoa Salad with Grilled Halloumi | — |
| 46 | Malaysian Fish Curry (Kari Ikan) | — |
| 51 | Aubergine Pizzas | — |
| 52 | Stir Fry (peanut butter / tamari) | Tamari |
| 53 | Roast Veg with Halloumi | — |

#### Risotto, Pasta & Veggie (15)
| id | Name | GF note |
|---|---|---|
| 25 | Speciality Mushroom Risotto | — |
| 26 | Chermoula Chickpea & Turmeric Rice Bowl | — |
| 27 | Leek, Mushroom & Blue Cheese Risotto | — |
| 28 | Oven-Baked Pesto Risotto | Check pesto |
| 29 | Mediterranean Risotto | Check pesto |
| 30 | West African Halloumi in Spiced Tomato Sauce | — |
| 31 | Gochujang Glazed Paneer | — |
| 33 | Cheddar & Wholegrain Mustard Gnocchi Bake | GF gnocchi only |
| 34 | Mozzarella Topped Pesto Gnocchi | GF gnocchi + check pesto |
| 35 | Aubergine Parmigiana Traybake | — |
| 54 | Bolognaise (Quorn) | GF spaghetti |
| 55 | Pesto Pasta | GF pasta + check pesto |
| 56 | Mushroom Pasta | GF tagliatelle |

#### Easy / Quick dinners (not recipe-based)
| id | Name | GF note |
|---|---|---|
| 57 | Baked Eggs with Potatoes, Mushrooms & Cheese | — |
| 58 | Oven-Baked Egg & Chips | — |

#### Optional extras (non-dinner)
| id | Name | mealType |
|---|---|---|
| 60 | Cheese, Cumin & Onion Seed Cornbread Muffins | bake |
| 61 | Strawberry, Almond & Polenta Skillet Cake | bake |
| 62 | Kanelbullar (Cinnamon Balls) | bake |
| 63 | Dark Chocolate Orange Creams | dessert |

---

## Chaining map — key jar/paste identifiers

These are the `opens`/`closes` key strings used across recipes.json:

```
yellow-thai-paste
red-thai-paste
green-thai-paste
north-indian-spice
tikka-paste
korma-paste
rogan-josh-paste
curry-powder
smokey-paste
gochujang-paste
sambal-paste
chermoula-spice
zhoug-paste
wild-mushroom-paste
miso-paste
harissa-paste
cashew-butter
ginger-puree
dijon-mustard
mexican-spice
cajun-spice
coconut-milk
mango-chutney
katsu-sauce
tamarind-paste
rose-harissa-paste
ginger-garlic-paste
vanilla-bean-paste
```

When adding new recipes, use keys from this list where possible. Add new keys here if genuinely new.

---

## Roadmap

### Phase 1 — Local planner *(ready to build)*
- [ ] recipes.json — populate all dinner recipes with `ingredients` (name + shop)
- [ ] easy-buys.json — Morrisons list (static, no ingredients needed)
- [ ] optional-extras.json — bakes, desserts with ingredients
- [ ] chaining.js — all pure functions (see above)
- [ ] RecipePicker component (step 1: random 4)
- [ ] RelatedPicker component (step 2: 2 related + 2 unrelated)
- [ ] Week 2 plan screen (app-assigned + swappable)
- [ ] PlanSummary with GF warnings inline
- [ ] OptionalExtras panel (opt-in, merges into shopping list)
- [ ] ShoppingList: week 1 Sainsbury's / week 2 Sainsbury's / combined Ocado
- [ ] Morrisons easy buys panel (static list, shown alongside plan)
- [ ] Static staples banner
- [ ] Visual design

### Phase 2 — Ocado tracking & ratings
- [ ] Track which Ocado items appear across fortnights
- [ ] Monthly "you may have run out of" Ocado list
- [ ] 1–5 star rating per meal, stored locally
- [ ] Ratings feed back into selection weighting

### Phase 3 — Grocery integration
- [ ] Deliveroo / Sainsbury's list export (copy-to-clipboard or share)
- [ ] Ocado list export

### Phase 4 — Intelligence layer
- [ ] Proactive suggestions based on ratings + jar state
- [ ] Flags jars open too long

---

## Deployment

Vite builds to `/dist`. Deploy to rosiebryce.github.io via GitHub Pages.

```bash
npm run build
# push /dist to gh-pages branch
```

Set `base: '/meal-planner/'` in vite.config.js if deploying to a subdirectory.

---

## How to add a new recipe

1. Open `src/data/recipes.json`
2. Add a new object following the schema above
3. Use the next available id number
4. Set `mealType` correctly — only `"dinner"` recipes enter the main selection pool
5. Use existing jar/paste keys from the chaining map above where possible
6. Save — hot reload will pick it up in dev mode

---

*This spec is the source of truth for the project. Update it when the roadmap changes.*
