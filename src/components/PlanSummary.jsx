import RecipeCard from './RecipeCard.jsx'
import ShoppingList from './ShoppingList.jsx'
import easyBuys from '../data/easy-buys.json'
import { generateShoppingList } from '../logic/chaining.js'
import { getRecipeUrl, getSourceLabel } from '../data/recipe-urls.js'

const STAPLES = [
  'Basmati rice (dry)', 'Risotto rice', 'Tinned chickpeas', 'Tinned black beans',
  'Tinned kidney beans', 'Coconut milk', 'Passata', 'Tinned chopped tomatoes',
  'Olive oil', 'Honey', 'Cider vinegar', 'Balsamic glaze', 'Tamari',
  'Dijon mustard', 'Wholegrain mustard', 'Chilli flakes', 'Smoked paprika',
  'Ground cumin', 'Ground turmeric', 'Dried basil', 'Mixed herbs', 'Dried thyme',
  'Cashew nuts', 'Pumpkin seeds', 'Flaked almonds', 'Desiccated coconut',
  'Mango chutney', 'Vegetable stock paste (Knorr GF)',
]

function mergeItems(a, b) {
  const map = new Map()
  ;[...a, ...b].forEach(({ name, count }) => {
    const key = name.toLowerCase()
    const existing = map.get(key)
    if (existing) map.set(key, { name: existing.name, count: existing.count + count })
    else map.set(key, { name, count })
  })
  return [...map.values()].sort((x, y) => x.name.localeCompare(y.name))
}

function recipeSource(recipe) {
  const url = getRecipeUrl(recipe)
  if (url) return url
  return getSourceLabel(recipe) ?? ''
}

function buildMarkdown(week, weekActive, extras) {
  const weekActiveIds = new Set(weekActive.map(r => r.id))

  function recipeLines(recipes, activeIds) {
    return recipes.map(r => {
      const skipped = !activeIds.has(r.id)
      const source = recipeSource(r)
      const sourceStr = source ? ` — ${source}` : ''
      const gfStr = r.glutenNote ? ` ⚠️ ${r.glutenNote}` : (!r.glutenFree ? ' 🚨 Contains gluten' : '')
      return `- ${skipped ? '~~' : ''}**${r.name}**${skipped ? '~~ *(skipped)*' : ''}${sourceStr}${gfStr}`
    }).join('\n')
  }

  const weekList = generateShoppingList(weekActive)
  const extList = generateShoppingList(extras)
  const sainsburys = mergeItems(weekList.sainsburys, extList.sainsburys)
  const ocado = mergeItems(weekList.ocado, extList.ocado)

  function listLines(items) {
    return items.map(i => `- [ ] ${i.name}${i.count > 1 ? ` ×${i.count}` : ''}`).join('\n')
  }

  const extrasSection = extras.length > 0
    ? `\n## Extras\n\n${extras.map(r => `- **${r.name}** — ${recipeSource(r)}`).join('\n')}\n`
    : ''

  return `# Meal Plan

## This week

${recipeLines(week, weekActiveIds)}
${extrasSection}
## Sainsbury's (Deliveroo)

${listLines(sainsburys)}

## Ocado

${listLines(ocado)}
`
}

function downloadMarkdown(content) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'meal-plan.md'
  a.click()
  URL.revokeObjectURL(url)
}

export default function PlanSummary({ week, weekActive = week, extras = [], onStartAgain }) {
  const anyGFNote = week.some(r => r.glutenNote || !r.glutenFree)
  const weekActiveIds = new Set(weekActive.map(r => r.id))

  return (
    <div className="summary">
      <div className="summary-header">
        <h2>This week's plan</h2>
        {anyGFNote && (
          <div className="gf-banner">
            ⚠️ Some recipes have GF flags — check badges below before you shop.
          </div>
        )}
      </div>

      <section className="summary-week">
        <h3 className="summary-week__title">This week</h3>
        <div className="card-grid card-grid--compact">
          {week.map(r => <RecipeCard key={r.id} recipe={r} compact skipped={!weekActiveIds.has(r.id)} />)}
        </div>
      </section>

      {extras.length > 0 && (
        <section className="summary-extras">
          <h3>Extras</h3>
          <div className="card-grid card-grid--compact">
            {extras.map(r => <RecipeCard key={r.id} recipe={r} compact />)}
          </div>
        </section>
      )}

      <section className="summary-section">
        <h3>Recipe bags</h3>
        <p className="step-hint">Fresh ingredients to bag up on delivery day, plus jars/pastes to dig out of the cupboard.</p>
        <div className="recipe-bags-scroll">
          <table className="recipe-bags-table">
            <thead>
              <tr>
                <th>Recipe</th>
                <th>Fresh (Sainsbury's)</th>
                <th>Cupboard (Ocado)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...weekActive.map(r => ({ recipe: r })),
                ...extras.map(r => ({ recipe: r, isExtra: true })),
              ].map(({ recipe: r, isExtra }) => (
                <tr key={r.id}>
                  <td className="recipe-bags-table__name">
                    {isExtra && <span className="recipe-bags-table__week-label">Extra</span>}
                    {r.name}
                  </td>
                  <td>{r.ingredients.filter(i => i.shop !== 'ocado').map(i => i.name).join(', ')}</td>
                  <td>{r.ingredients.filter(i => i.shop === 'ocado').map(i => i.name).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="summary-section">
        <h3>Shopping lists</h3>
        <ShoppingList weekRecipes={weekActive} extras={extras} />
      </section>

      <section className="staples-banner">
        <h4>Check your cupboards</h4>
        <p className="staples-banner__hint">These are assumed in stock — top up if running low.</p>
        <ul className="staples-list">
          {STAPLES.map(s => <li key={s}>{s}</li>)}
        </ul>
      </section>

      <section className="summary-section">
        <h3>Morrisons easy meals</h3>
        <p className="step-hint">For when you don't want to cook — order via Deliveroo.</p>
        {easyBuys.map(cat => (
          <div key={cat.category} className="easy-buys-cat">
            <h4>{cat.category}</h4>
            <ul className="easy-buys-list">
              {cat.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <button
        className="btn btn--ghost btn--full"
        onClick={() => downloadMarkdown(buildMarkdown(week, weekActive, extras))}
      >
        Download plan as .md
      </button>

      <button className="btn btn--primary btn--full" onClick={onStartAgain}>
        Plan next week →
      </button>
    </div>
  )
}
