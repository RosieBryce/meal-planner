// Pure functions — no side effects, no React imports.

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getRandomCandidates(recipesData, excludeIds = [], count = 4) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && !excludeIds.includes(r.id)
  )
  if (pool.length === 0) return []
  if (pool.length <= count) return shuffle(pool)

  // 1.5x weight for favourites
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

export function getRelatedCandidates(reference, recipesData, excludeIds = [], count = 2) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && r.id !== reference.id && !excludeIds.includes(r.id)
  )
  const same = shuffle(pool.filter(r => r.cuisine === reference.cuisine))
  const rest = shuffle(pool.filter(r => r.cuisine !== reference.cuisine))
  return [...same, ...rest].slice(0, count)
}

export function getUnrelatedCandidates(reference, recipesData, excludeIds = [], count = 2) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && r.id !== reference.id && !excludeIds.includes(r.id)
  )
  const different = shuffle(pool.filter(r => r.cuisine !== reference.cuisine))
  const rest = shuffle(pool.filter(r => r.cuisine === reference.cuisine))
  return [...different, ...rest].slice(0, count)
}

export function assignThirdRecipe(recipe1, recipe2, recipesData, excludeIds = []) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner'
      && r.id !== recipe1.id
      && r.id !== recipe2.id
      && !excludeIds.includes(r.id)
  )
  if (pool.length === 0) return null
  return shuffle(pool)[0]
}

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

export function getSwapCandidates(recipe, recipesData, excludeIds = [], count = 4) {
  const pool = recipesData.filter(
    r => r.mealType === 'dinner' && r.id !== recipe.id && !excludeIds.includes(r.id)
  )
  return shuffle(pool).slice(0, count)
}

export function jarKeyToLabel(key) {
  return key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function jarKeyToIngredientName(key) {
  return key.replace(/-/g, ' ').toLowerCase()
}

// Known jar/paste ingredient slugs — source of truth for the jar picker list.
// Add new entries here when adding recipes that use a new paste or sauce.
const JAR_KEYS = [
  { key: 'baby-spinach',         match: 'baby spinach' },
  { key: 'cashew-butter',        match: 'cashew butter' },
  { key: 'creme-fraiche',        match: 'crème fraîche' },
  { key: 'chermoula-spice',      match: 'chermoula' },
  { key: 'double-cream',         match: 'double cream' },
  { key: 'ginger-garlic-paste',  match: 'ginger & garlic paste' },
  { key: 'gochujang-paste',      match: 'gochujang' },
  { key: 'green-thai-paste',     match: 'thai green paste' },
  { key: 'harissa-paste',        match: 'harissa' },
  { key: 'hummus',               match: 'hummus' },
  { key: 'ketjap-manis',         match: 'ketjap manis' },
  { key: 'korma-paste',          match: 'korma paste' },
  { key: 'mango-chutney',        match: 'mango chutney' },
  { key: 'miso-paste',           match: 'miso' },
  { key: 'red-onion-marmalade',  match: 'red onion marmalade' },
  { key: 'red-thai-paste',       match: 'red thai paste' },
  { key: 'rogan-josh-paste',     match: 'rogan josh' },
  { key: 'rose-harissa-paste',   match: 'rose harissa' },
  { key: 'sambal-paste',         match: 'sambal' },
  { key: 'smokey-paste',         match: 'smokey base paste' },
  { key: 'sun-dried-tomato-paste', match: 'sun-dried tomato paste' },
  { key: 'tamarind-paste',       match: 'tamarind' },
  { key: 'tomato-sauce-jar',     match: 'tomato sauce' },
  { key: 'tikka-paste',          match: 'tikka' },
  { key: 'wild-mushroom-paste',  match: 'wild mushroom' },
  { key: 'yellow-thai-paste',    match: 'yellow thai paste' },
  { key: 'yoghurt',              match: 'yoghurt' },
  { key: 'zhoug-paste',          match: 'zhoug' },
]

function recipeUsesJar(recipe, jarKey) {
  const entry = JAR_KEYS.find(j => j.key === jarKey)
  const matchStr = entry ? entry.match : jarKeyToIngredientName(jarKey)
  return recipe.ingredients.some(i => i.name.toLowerCase().includes(matchStr))
}

export function getJarList(recipesData) {
  const dinners = recipesData.filter(r => r.mealType === 'dinner')
  return JAR_KEYS
    .filter(({ key }) => dinners.some(r => recipeUsesJar(r, key)))
    .map(({ key }) => ({ key, label: jarKeyToLabel(key) }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function getRecipesForJar(jarKey, recipesData, excludeIds = []) {
  return shuffle(
    recipesData.filter(
      r => r.mealType === 'dinner'
        && !excludeIds.includes(r.id)
        && recipeUsesJar(r, jarKey)
    )
  )
}

export function getQuickRecipes(recipesData, excludeIds = []) {
  return shuffle(
    recipesData.filter(
      r => r.mealType === 'dinner'
        && !excludeIds.includes(r.id)
        && r.tags?.includes('quick')
    )
  )
}
