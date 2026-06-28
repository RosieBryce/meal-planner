import { getCuisineStyle } from '../data/cuisines.js'
import { getRecipeUrl, getSourceLabel } from '../data/recipe-urls.js'

export default function RecipeCard({ recipe, onClick, selected, compact = false, skipped = false }) {
  const { colour, bg } = getCuisineStyle(recipe.cuisine)
  const url = getRecipeUrl(recipe)
  const sourceLabel = getSourceLabel(recipe)

  return (
    <div
      className={`recipe-card ${selected ? 'recipe-card--selected' : ''} ${compact ? 'recipe-card--compact' : ''} ${skipped ? 'recipe-card--skipped' : ''}`}
      style={{ borderColor: colour }}
      onClick={() => !skipped && onClick?.(recipe)}
      role={onClick && !skipped ? 'button' : undefined}
      tabIndex={onClick && !skipped ? 0 : undefined}
      onKeyDown={e => e.key === 'Enter' && !skipped && onClick?.(recipe)}
    >
      <div className="recipe-card__image-wrap">
        {recipe.image ? (
          <img className="recipe-card__image" src={recipe.image} alt={recipe.name} />
        ) : (
          <div className="recipe-card__image-placeholder" style={{ backgroundColor: bg }}>
            🌿
          </div>
        )}
      </div>

      <div className="recipe-card__content">
        <span className="recipe-card__tag" style={{ backgroundColor: colour }}>
          {recipe.cuisine}
        </span>
        <h3 className="recipe-card__name">{recipe.name}</h3>
        {!compact && (
          <p className="recipe-card__protein">{recipe.protein}</p>
        )}
        {recipe.glutenNote && (
          <div className="gf-badge gf-badge--warn">⚠️ {recipe.glutenNote}</div>
        )}
        {!recipe.glutenFree && !recipe.glutenNote && (
          <div className="gf-badge gf-badge--danger">🚨 Contains gluten</div>
        )}
        <div className="recipe-card__source">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="recipe-source-link"
              onClick={e => e.stopPropagation()}
            >
              View recipe ↗
            </a>
          ) : sourceLabel ? (
            <span className="recipe-source-label">{sourceLabel}</span>
          ) : null}
        </div>
      </div>
      {skipped && <div className="recipe-card__skipped-overlay">Skipped</div>}
    </div>
  )
}
