import { useState } from 'react'
import RecipeCard from './RecipeCard.jsx'

export default function OptionalExtras({ candidates, onConfirm }) {
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedRecipes = candidates.filter(r => selected.has(r.id))

  return (
    <div className="step">
      <div className="step-header">
        <h2>Optional extras</h2>
        <p className="step-hint">
          Add any of these to your shopping list — they share ingredients with what you're already cooking.
        </p>
      </div>

      {candidates.length === 0 ? (
        <p className="empty-state">Nothing to suggest right now.</p>
      ) : (
        <div className="card-grid">
          {candidates.map(recipe => (
            <div key={recipe.id} className="extra-card-wrap">
              <RecipeCard
                recipe={recipe}
                selected={selected.has(recipe.id)}
                onClick={() => toggle(recipe.id)}
              />
              <p className="extra-card-type">{recipe.mealType}</p>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn--primary" onClick={() => onConfirm(selectedRecipes)}>
        {selectedRecipes.length > 0
          ? `Add ${selectedRecipes.length} extra${selectedRecipes.length > 1 ? 's' : ''} & see plan →`
          : 'Skip extras, see plan →'}
      </button>
    </div>
  )
}
