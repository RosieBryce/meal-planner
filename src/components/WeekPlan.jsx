import { useState } from 'react'
import RecipeCard from './RecipeCard.jsx'
import SwapPicker from './SwapPicker.jsx'
import { getSwapCandidates } from '../logic/chaining.js'

export default function WeekPlan({
  weekNum,
  recipes,
  swappableIndices = [],
  allRecipes,
  excludeIds = [],
  onSwap,
  onConfirm,
  confirmLabel = 'Confirm →',
  isLoading = false,
}) {
  const [swappingIndex, setSwappingIndex] = useState(null)
  const [swapCandidates, setSwapCandidates] = useState([])
  const [skippedIndices, setSkippedIndices] = useState(new Set())

  function handleSwapClick(index) {
    const others = recipes.map(r => r.id)
    const candidates = getSwapCandidates(recipes[index], allRecipes, [...excludeIds, ...others])
    setSwapCandidates(candidates)
    setSwappingIndex(index)
  }

  function handleSwapConfirm(newRecipe) {
    onSwap(swappingIndex, newRecipe)
    setSwappingIndex(null)
  }

  function toggleSkip(index) {
    setSkippedIndices(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
    if (swappingIndex === index) setSwappingIndex(null)
  }

  function handleConfirm() {
    const active = recipes.filter((_, i) => !skippedIndices.has(i))
    onConfirm(active)
  }

  const labels = ['First pick', 'Second pick', 'Chosen for you']

  return (
    <div className="week-plan">
      <h2 className="week-plan__title">Week {weekNum}</h2>

      <div className="week-plan__recipes">
        {recipes.map((recipe, i) => {
          const isSkipped = skippedIndices.has(i)
          return (
            <div key={recipe.id} className="week-plan__slot">
              <div className="week-plan__slot-header">
                <p className="week-plan__slot-label">{labels[i] ?? `Meal ${i + 1}`}</p>
                <button
                  className={`btn btn--ghost btn--small week-plan__skip-btn ${isSkipped ? 'week-plan__skip-btn--skipped' : ''}`}
                  onClick={() => toggleSkip(i)}
                >
                  {isSkipped ? 'Restore' : 'Skip'}
                </button>
              </div>
              <RecipeCard recipe={recipe} skipped={isSkipped} />
              {!isSkipped && swappableIndices.includes(i) && swappingIndex !== i && (
                <button
                  className="btn btn--ghost btn--small"
                  onClick={() => handleSwapClick(i)}
                >
                  Not feeling it? Swap →
                </button>
              )}
              {!isSkipped && swappingIndex === i && (
                <SwapPicker
                  candidates={swapCandidates}
                  onSwap={handleSwapConfirm}
                  onCancel={() => setSwappingIndex(null)}
                />
              )}
            </div>
          )
        })}
      </div>

      {!isLoading && (
        <button className="btn btn--primary" onClick={handleConfirm}>
          {confirmLabel}
        </button>
      )}
    </div>
  )
}
