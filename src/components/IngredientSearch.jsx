import { useState, useRef, useEffect } from 'react'
import { getRecipeUrl } from '../data/recipe-urls.js'

const CUISINES = ['Thai', 'Indian', 'Fish', 'Mexican', 'Asian', 'Italian', 'Mediterranean', 'Malaysian', 'Veggie']
const TAGS = [
  { key: 'quick',    label: 'Quick' },
  { key: 'involved', label: 'Involved' },
  { key: 'comfort',  label: 'Comfort food' },
]

export default function IngredientSearch({ recipes, basket, onBasketToggle, onPlanFromBasket, onClose }) {
  const [query, setQuery]     = useState('')
  const [cuisine, setCuisine] = useState(null)
  const [tag, setTag]         = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const trimmed = query.trim().toLowerCase()
  const hasFilters = cuisine || tag || trimmed.length >= 2

  const results = hasFilters ? recipes.filter(r => {
    if (r.mealType !== 'dinner') return false  // only dinner recipes in browse
    if (cuisine && r.cuisine !== cuisine) return false
    if (tag && !r.tags?.includes(tag)) return false
    if (trimmed.length >= 2 && !r.ingredients.some(ing => ing.name.toLowerCase().includes(trimmed))) return false
    return true
  }) : []

  function toggleCuisine(c) { setCuisine(prev => prev === c ? null : c) }
  function toggleTag(t)     { setTag(prev => prev === t ? null : t) }

  const inBasket = (id) => basket.some(r => r.id === id)
  const basketFull = basket.length >= 2

  return (
    <div className="search-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="search-modal">

        <div className="search-modal__header">
          <h2 className="search-modal__title">Find a recipe</h2>
          <button className="search-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Cuisine chips */}
        <div className="filter-group">
          <span className="filter-group__label">Cuisine</span>
          <div className="chip-row">
            {CUISINES.map(c => (
              <button
                key={c}
                className={`chip ${cuisine === c ? 'chip--active' : ''}`}
                onClick={() => toggleCuisine(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Tag chips */}
        <div className="filter-group">
          <span className="filter-group__label">Type</span>
          <div className="chip-row">
            {TAGS.map(t => (
              <button
                key={t.key}
                className={`chip ${tag === t.key ? 'chip--active' : ''}`}
                onClick={() => toggleTag(t.key)}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Ingredient search */}
        <div className="filter-group">
          <span className="filter-group__label">Ingredient</span>
          <input
            ref={inputRef}
            className="search-modal__input"
            type="text"
            placeholder="e.g. courgette, feta, avocado…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        {/* Results */}
        {hasFilters && (
          <div className="search-results">
            {results.length === 0 ? (
              <p className="search-results__empty">No recipes match — try fewer filters.</p>
            ) : (
              <>
                <p className="search-results__count">{results.length} recipe{results.length !== 1 ? 's' : ''}</p>
                <ul className="search-results__list">
                  {results.map(recipe => {
                    const url = getRecipeUrl(recipe)
                    const matches = trimmed.length >= 2
                      ? recipe.ingredients.filter(ing => ing.name.toLowerCase().includes(trimmed))
                      : []
                    const saved = inBasket(recipe.id)
                    const disabled = !saved && basketFull

                    return (
                      <li key={recipe.id} className={`search-result-card ${saved ? 'search-result-card--saved' : ''}`}>
                        <div className="search-result-card__top">
                          <span className="search-result-card__name">
                            {url
                              ? <a href={url} target="_blank" rel="noreferrer">{recipe.name}</a>
                              : recipe.name}
                          </span>
                          <div className="search-result-card__right">
                            <span className="search-result-card__meta">{recipe.cuisine} · {recipe.protein}</span>
                            <button
                              className={`basket-btn ${saved ? 'basket-btn--saved' : ''} ${disabled ? 'basket-btn--disabled' : ''}`}
                              onClick={() => onBasketToggle(recipe)}
                              disabled={disabled}
                              title={disabled ? 'Basket full (max 2)' : saved ? 'Remove from basket' : 'Save to basket'}
                            >
                              {saved ? '✓ saved' : '+ save'}
                            </button>
                          </div>
                        </div>
                        {!recipe.glutenFree && (
                          <span className="badge badge--red">⚠️ GF check needed</span>
                        )}
                        {recipe.glutenFree && recipe.glutenNote && (
                          <span className="badge badge--yellow">⚠️ {recipe.glutenNote}</span>
                        )}
                        {matches.length > 0 && (
                          <ul className="search-result-card__ings">
                            {matches.map((ing, i) => (
                              <li key={i} className="search-result-card__ing--match">{ing.name}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        )}

        {!hasFilters && (
          <p className="search-modal__hint">Pick a cuisine, a type, or type an ingredient — or combine all three.</p>
        )}

        {/* Basket panel */}
        {basket.length > 0 && (
          <div className="basket-panel">
            <div className="basket-panel__header">
              <span className="basket-panel__title">🧺 Your basket</span>
              <span className="basket-panel__hint">{basket.length === 1 ? 'Add one more or plan around this one' : 'Ready to plan'}</span>
            </div>
            <ul className="basket-panel__list">
              {basket.map(r => (
                <li key={r.id} className="basket-panel__item">
                  <span>{r.name}</span>
                  <button className="basket-panel__remove" onClick={() => onBasketToggle(r)}>✕</button>
                </li>
              ))}
            </ul>
            <button className="btn btn--primary basket-panel__plan" onClick={onPlanFromBasket}>
              {basket.length === 1
                ? 'Plan around this recipe →'
                : 'Plan around these two →'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
