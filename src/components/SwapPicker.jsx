import RecipeCard from './RecipeCard.jsx'

export default function SwapPicker({ candidates, onSwap, onCancel }) {
  return (
    <div className="swap-picker">
      <div className="swap-picker__header">
        <p>Pick a replacement:</p>
        <button className="btn btn--ghost" onClick={onCancel}>Cancel</button>
      </div>
      <div className="card-grid card-grid--compact">
        {candidates.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={onSwap}
            compact
          />
        ))}
      </div>
    </div>
  )
}
