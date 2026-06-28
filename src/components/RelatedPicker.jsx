import RecipeCard from './RecipeCard.jsx'

export default function RelatedPicker({ pick1, related, unrelated, onPick }) {
  return (
    <div className="step">
      <div className="step-header">
        <p className="step-label">Step 2 of 2</p>
        <h2>Pick your second recipe</h2>
        <p className="step-hint">
          Based on <strong>{pick1.name}</strong>.
        </p>
      </div>

      {related.length > 0 && (
        <section className="picker-section">
          <h3 className="picker-section__label">Uses up the same jars</h3>
          <div className="card-grid">
            {related.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={onPick} />
            ))}
          </div>
        </section>
      )}

      {unrelated.length > 0 && (
        <section className="picker-section">
          <h3 className="picker-section__label">Something different</h3>
          <div className="card-grid">
            {unrelated.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onClick={onPick} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
