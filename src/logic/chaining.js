// Pure functions — no side effects, no React imports.

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Returns `count` random dinner recipes, excluding recentIds.
 * Favourites get a slight 1.5x boost (1 extra copy in the bag).
 */
export function getRandomCandidates(recipesData, excludeIds = [], count = 4) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && !excludeIds.includes(r.id)
  )
  if (pool.length === 0) return []
  if (pool.length <= count) return shuffle(pool)

  // 1.5x weight: every other favourite draw gets an extra entry
  const bag = pool.flatMap(r => (r.favourite ? [r, r] : [r]))
  const shuffled = shuffle(bag)

  const seen = new Set()
  const result = []
  for (const r of shuffled) {
    if (!seen.has(r.id)) {
      seen.add(r.id)
      result.push(r)
      if (result.length === count) break
    }
  }
  return result
}

// Points per chaining key — scored by how quickly the ingredient goes off
// and how strongly we want to force a pairing. Spices = 0 (last forever).
const CHAIN_SCORES = {
  'creme-fraiche':        10,
  'sweet-potato':         10,
  'hummus':               10,
  'zhoug-paste':           8,
  'ketjap-manis':          8,
  'rose-harissa-paste':    8,
  'baby-spinach':          6,
  'rogan-josh-paste':      6,
  'ginger-garlic-paste':   6,
  'vanilla-bean-paste':    6,
  'chermoula-spice':       6,
  'miso-paste':            6,
  'red-thai-paste':        6,
  'cashew-butter':         6,
  'gochujang-paste':       6,
  'sambal-paste':          6,
  'yellow-thai-paste':     7,
  'green-thai-paste':      7,
  'wild-mushroom-paste':   7,
  'tikka-paste':           7,
  'roasted-peppers-jar':   7,
  'tamarind-paste':        7,
  'harissa-paste':         7,
  'red-onion-marmalade':   7,
  'mango-chutney':         7,
  'double-cream':          5,
  'smokey-paste':          5,
  'korma-paste':           5,
  'fresh-coriander':       4,
  'yoghurt':               4,
  'tomato-sauce-jar':      4,
  'sun-dried-tomato-paste': 3,
  'north-indian-spice':    0,
  'mexican-spice':         0,
  'tandoori-spice':        0,
  'cajun-spice':           0,
}

/**
 * Scores a recipe's relatedness to a reference recipe.
 * Each shared chaining key contributes its own point value.
 * Keys not in CHAIN_SCORES fall back to 5.
 */
function jarScore(recipe, reference) {
  const referenceJars = new Set([...reference.opens, ...reference.closes])
  const candidateJars = new Set([...recipe.opens, ...recipe.closes])
  let score = 0
  for (const j of candidateJars) {
    if (referenceJars.has(j)) score += (CHAIN_SCORES[j] ?? 5)
  }
  if (recipe.cuisine === reference.cuisine) score += 2
  if (recipe.favourite) score += 1
  return score
}

/**
 * Returns top `count` related recipes (by jar/paste chaining) to a reference recipe.
 */
export function getRelatedCandidates(reference, recipesData, excludeIds = [], count = 2) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner'
      && r.id !== reference.id
      && !excludeIds.includes(r.id)
  )

  const scored = shuffle(pool)
    .map(r => ({ recipe: r, score: jarScore(r, reference) }))
    .sort((a, b) => b.score - a.score || (a.recipe.favourite === b.recipe.favourite ? 0 : a.recipe.favourite ? -1 : 1))

  return scored.slice(0, count).map(s => s.recipe)
}

/**
 * Returns top `count` unrelated recipes (minimal jar/paste overlap).
 */
export function getUnrelatedCandidates(reference, recipesData, excludeIds = [], count = 2) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner'
      && r.id !== reference.id
      && !excludeIds.includes(r.id)
  )

  // Shuffle first so equal-score ties are random, not alphabetical
  const scored = shuffle(pool)
    .map(r => ({ recipe: r, score: jarScore(r, reference) }))
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score
      if (a.recipe.favourite !== b.recipe.favourite) return a.recipe.favourite ? -1 : 1
      return 0
    })

  return scored.slice(0, count).map(s => s.recipe)
}

/**
 * App-assigns the third recipe for a week.
 * Maximises closure of jars opened by recipe1 + recipe2.
 * Falls back to a favourite or random dinner if no jar-closer found.
 */
export function assignThirdRecipe(recipe1, recipe2, recipesData, excludeIds = []) {
  const openedSet = new Set([...recipe1.opens, ...recipe2.opens])
  const trulyClosed = new Set()
  for (const r of [recipe1, recipe2]) {
    for (const j of r.closes) {
      if (!r.opens.includes(j)) trulyClosed.add(j)
    }
  }
  const netOpen = [...openedSet].filter(j => !trulyClosed.has(j))

  const pool = recipesData.filter(
    r => r.mealType === 'dinner'
      && r.id !== recipe1.id
      && r.id !== recipe2.id
      && !excludeIds.includes(r.id)
  )

  if (pool.length === 0) return null

  const scored = shuffle(pool).map(r => ({
    recipe: r,
    // +10 per net-open jar this recipe closes; -3 per fresh jar it would open
    score: r.closes.filter(j => netOpen.includes(j)).length * 10
      - r.opens.filter(j => !netOpen.includes(j)).length * 3,
  }))
  scored.sort((a, b) => b.score - a.score)

  return scored[0].recipe
}

/**
 * Plans week 2 by assigning 3 recipes that best close jars left open after week 1.
 * Returns an array of 3 recipes.
 */
export function planWeekTwo(week1Recipes, recipesData, excludeIds = []) {
  const week1Ids = week1Recipes.map(r => r.id)
  const allExclude = [...week1Ids, ...excludeIds]

  // Jar state after week 1.
  // "Truly closed" = a recipe closes it WITHOUT also opening it (avoids self-cancelling
  // when a recipe has the same key in both opens and closes).
  const openedSet = new Set(week1Recipes.flatMap(r => r.opens))
  const trulyClosed = new Set()
  for (const r of week1Recipes) {
    for (const j of r.closes) {
      if (!r.opens.includes(j)) trulyClosed.add(j)
    }
  }
  const stillOpen = [...openedSet].filter(j => !trulyClosed.has(j))

  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && !allExclude.includes(r.id)
  )

  if (pool.length === 0) return []

  // Score: closing still-open week-1 jars is top priority; penalise opening fresh ones.
  // Shuffle first so ties are random.
  const scored = shuffle(pool)
    .map(r => ({
      recipe: r,
      score: r.closes.filter(j => stillOpen.includes(j)).length * 10
        - r.opens.filter(j => !stillOpen.includes(j)).length * 3,
    }))
    .sort((a, b) => b.score - a.score)

  const pick1 = scored[0].recipe
  const remaining = scored.filter(s => s.recipe.id !== pick1.id)
  const pick2 = remaining[0]?.recipe
  if (!pick2) return [pick1]

  const pick3 = assignThirdRecipe(
    pick1,
    pick2,
    recipesData,
    [...allExclude, pick1.id, pick2.id]
  )

  return [pick1, pick2, pick3].filter(Boolean)
}

// Known ingredient name aliases — maps variant → canonical display name.
// Add new entries here whenever the shopping list shows duplicates that should be one item.
const INGREDIENT_ALIASES = {
  'shallots': 'shallot',
  'tomatoes': 'tomato',
  'baking potatoes': 'baking potato',
  'lemon or lime': 'lemon or lime',
  'steamed brown basmati rice pouch': 'brown basmati rice pouch',
}

function normalizeKey(name) {
  const lower = name.toLowerCase().trim()
  return INGREDIENT_ALIASES[lower] ?? lower
}

/**
 * Generates split shopping lists from an array of recipes.
 * Returns:
 *   sainsburys: Array<{ name: string, count: number }>
 *   ocado:      Array<{ name: string, count: number }>
 * Items with count > 1 mean you need that many across your planned recipes (e.g. aubergine ×2).
 * Both arrays are alphabetically sorted.
 */
export function generateShoppingList(recipes) {
  const sainsburysMap = new Map()
  const ocadoMap = new Map()

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(({ name, shop }) => {
      const key = normalizeKey(name)
      const map = shop === 'ocado' ? ocadoMap : sainsburysMap
      const existing = map.get(key)
      if (existing) {
        map.set(key, { name: existing.name, count: existing.count + 1 })
      } else {
        // Use the alias canonical name if available, otherwise use as-is
        const canonical = INGREDIENT_ALIASES[name.toLowerCase().trim()] ?? name
        map.set(key, { name: canonical, count: 1 })
      }
    })
  })

  const sort = arr => arr.sort((a, b) => a.name.localeCompare(b.name))
  return {
    sainsburys: sort([...sainsburysMap.values()]),
    ocado: sort([...ocadoMap.values()]),
  }
}

/**
 * Returns jar/paste summary across all planned recipes.
 * Used to show what needs buying for the fortnight (Ocado).
 */
export function getJarsSummary(allRecipes) {
  const opens = [...new Set(allRecipes.flatMap(r => r.opens))]
  const closes = [...new Set(allRecipes.flatMap(r => r.closes))]
  const netNew = opens.filter(j => !closes.includes(j))
  return { opens, closes, netNew }
}

/**
 * Returns non-dinner recipes that share ingredients with the planned meals.
 * Sorted by ingredient overlap (most overlap first) — surfaces recipes you can
 * make without a special shop.
 */
export function getOptionalExtras(plannedRecipes, recipesData) {
  const plannedIngredients = new Set(
    plannedRecipes.flatMap(r => r.ingredients.map(i => i.name.toLowerCase()))
  )

  return recipesData
    .filter(r => r.mealType !== 'dinner')
    .map(r => ({
      recipe: r,
      overlap: r.ingredients.filter(i => plannedIngredients.has(i.name.toLowerCase())).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .map(s => s.recipe)
}

/**
 * Returns up to `count` swap alternatives for a recipe.
 * Uses the same related-scoring logic, excluding already-planned recipes.
 */
export function getSwapCandidates(recipe, recipesData, excludeIds = [], count = 4) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner'
      && r.id !== recipe.id
      && !excludeIds.includes(r.id)
  )
  return shuffle(pool).slice(0, count)
}

export function jarKeyToLabel(key) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Returns all jar/paste keys that appear in at least one dinner recipe,
 * as { key, label } objects sorted alphabetically by label.
 */
export function getJarList(recipesData) {
  const jarSet = new Set(
    recipesData
      .filter(r => r.mealType === 'dinner')
      .flatMap(r => [...r.opens, ...r.closes])
  )
  return [...jarSet]
    .map(key => ({ key, label: jarKeyToLabel(key) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Returns dinner recipes that open or close the given jar key, shuffled.
 */
export function getRecipesForJar(jarKey, recipesData, excludeIds = []) {
  return shuffle(
    recipesData.filter(
      r => r.mealType === 'dinner'
        && !excludeIds.includes(r.id)
        && (r.opens.includes(jarKey) || r.closes.includes(jarKey))
    )
  )
}

/**
 * Returns dinner recipes tagged 'quick', excluding recent ones, shuffled.
 */
export function getQuickRecipes(recipesData, excludeIds = []) {
  return shuffle(
    recipesData.filter(
      r => r.mealType === 'dinner'
        && !excludeIds.includes(r.id)
        && r.tags?.includes('quick')
    )
  )
}
