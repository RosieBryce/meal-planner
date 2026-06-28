# App Principles

Ordered from non-negotiable to preferred. These should shape every decision about the algorithm, UI, and what gets built.

---

## Non-negotiable
*The app breaks its promise if these are violated.*

### 1. GF is infrastructure, not a feature
Coeliac safety is a health issue. Warnings are always visible, never hidden behind a toggle, never assumed safe. The app flags — Rosie verifies. If in doubt, flag it.

### 2. Pescatarian, always
No meat in the recipe library, ever. This is a hard constraint on the data, not a UI filter.

### 3. Cooking for one
Quantities are for one person with leftovers for lunch. Wrong quantities mean wasted food and wasted money. Never default to two portions.

---

## Structural
*These shape the algorithm and the architecture.*

### 4. The shopping list is the product
Everything else — the picking flow, the jar logic, the two-week structure — exists to produce a correct, split, actionable list that can go straight to Deliveroo and Ocado without editing.

### 5. Reduce jar waste first
The selection algorithm's primary weight is using up what's already open. Variety comes second. A good plan uses up jars. A great plan is also interesting.

### 6. Variety is structural, not random
The two-week block is designed so the same cuisine doesn't appear back to back. That's achieved through how the algorithm weights unrelated picks — not by luck, not by themes.

---

## Preferred
*Quality of life. These can bend when there's a good reason.*

### 7. Friction is the enemy
Planning two weeks should take under five minutes. Where the app can decide, it should. Rosie swaps if she wants to — not by default.

### 8. The easy option is a first-class citizen
A Morrisons night or a skip isn't a failure state. The app treats it as a valid plan and makes it as easy to include as a cooked recipe.

### 9. Fast to cook
Most recipes target 30 minutes and 6 steps or fewer. This is a curation rule — it's not enforced by the app, but it should inform which recipes get added to the library.
