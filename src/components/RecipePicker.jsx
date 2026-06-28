import RecipeCard from './RecipeCard.jsx'

export default function RecipePicker({
  candidates,
  onPick,
  label = 'Step 1 of 2',
  title = 'What takes your fancy?',
  hint = 'Pick one to anchor your week around.',
  onBack = null,
}) {
  return (
    <div className="step">
      <div className="step-header">
        <p className="step-label">{label}</p>
        <h2>{title}</h2>
        <p className="step-hint">{hint}</p>
      </div>
      {candidates.length === 0 && (
        <p className="empty-state">No recipes found for that choice — try another.</p>
      )}
      <div className="card-grid">
        {candidates.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={onPick}
          />
        ))}
      </div>
      {onBack && (
        <button className="btn btn--ghost" style={{ marginTop: '1.5rem' }} onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  )
}
