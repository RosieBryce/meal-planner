// URLs for BBC Good Food recipes and other external sources.
// Green Chef and custom recipes have no URL (instructions in your own memory / the original box).
// Palak Paneer URL is already stored in recipes.json source field.

export const RECIPE_URLS = {
  13: 'https://www.bbcgoodfood.com/recipes/masala-fish',
  14: 'https://www.bbcgoodfood.com/recipes/dum-aloo',
  25: 'https://www.bbcgoodfood.com/recipes/salmon-leek-parcel',
  26: 'https://www.bbcgoodfood.com/recipes/gluten-free-salmon-pasta',
  27: 'https://www.bbcgoodfood.com/recipes/healthy-gluten-free-fish-chips',
  28: 'https://www.bbcgoodfood.com/recipes/honey-orange-roast-sea-bass-lentils',
  32: 'https://www.bbcgoodfood.com/recipes/sweet-potato-jackets-guacamole-kidney-beans',
  33: 'https://www.bbcgoodfood.com/recipes/mexican-style-stuffed-peppers',
  34: 'https://www.bbcgoodfood.com/recipes/spicy-harissa-aubergine-pie',
  35: 'https://www.bbcgoodfood.com/recipes/katsu-curry',
  36: 'https://www.bbcgoodfood.com/recipes/quinoa-salad-grilled-halloumi',
  37: 'https://www.bbcgoodfood.com/recipes/julies-kari-ikan-malaysian-fish-curry',
  54: 'https://www.bbcgoodfood.com/recipes/baked-eggs-potatoes-mushrooms-cheese',
  55: 'https://www.bbcgoodfood.com/recipes/oven-baked-egg-chips',
  56: 'https://www.bbcgoodfood.com/recipes/cheese-cumin-onion-seed-cornbread-muffins',
  57: 'https://www.bbcgoodfood.com/recipes/strawberry-almond-polenta-skillet-cake',
  58: 'https://www.bbcgoodfood.com/recipes/cinnamon-balls',
  59: 'https://www.bbcgoodfood.com/recipes/dark-chocolate-orange-creams',
}

export function getRecipeUrl(recipe) {
  if (recipe.source.startsWith('http')) return recipe.source
  return RECIPE_URLS[recipe.id] ?? null
}

export function getSourceLabel(recipe) {
  if (recipe.source === 'green-chef') return 'Green Chef'
  if (recipe.source === 'custom') return "Rosie's Recipe"
  return null
}
