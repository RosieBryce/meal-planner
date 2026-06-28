import { useState, useCallback } from 'react'
import recipes from './data/recipes.json'
import HomeScreen from './components/HomeScreen.jsx'
import QuickMeals from './components/QuickMeals.jsx'
import RecipePicker from './components/RecipePicker.jsx'
import RelatedPicker from './components/RelatedPicker.jsx'
import JarPicker from './components/JarPicker.jsx'
import WeekPlan from './components/WeekPlan.jsx'
import OptionalExtras from './components/OptionalExtras.jsx'
import PlanSummary from './components/PlanSummary.jsx'
import IngredientSearch from './components/IngredientSearch.jsx'
import {
  getRandomCandidates,
  getJarList,
  getRecipesForJar,
  getRelatedCandidates,
  getUnrelatedCandidates,
  assignThirdRecipe,
  getOptionalExtras,
} from './logic/chaining.js'

const STEP = {
  HOME:         'home',
  QUICK:        'quick',
  JAR_PICK:     'jarPick',
  PICK_1:       'pick1',
  PICK_2:       'pick2',
  WEEK_REVIEW:  'weekReview',
  EXTRAS:       'extras',
  SUMMARY:      'summary',
}

function loadRecentIds() {
  try { return JSON.parse(localStorage.getItem('recentRecipeIds')) || [] }
  catch { return [] }
}

export default function App() {
  const [step, setStep] = useState(STEP.HOME)
  const [recentIds, setRecentIds] = useState(loadRecentIds)
  const [searchOpen, setSearchOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Basket — recipes chosen in search before planning
  const [basket, setBasket] = useState([])

  // Pick 1 pool + metadata
  const [pick1Candidates, setPick1Candidates] = useState([])
  const [pick1Label, setPick1Label] = useState('Step 1 of 2')
  const [pick1Title, setPick1Title] = useState('What takes your fancy?')
  const [pick1Hint, setPick1Hint] = useState('Pick one to anchor your week around.')

  // Picks
  const [pick1, setPick1] = useState(null)
  const [pick2Candidates, setPick2Candidates] = useState({ related: [], unrelated: [] })

  // Week plan
  const [week, setWeek] = useState([])
  const [weekActive, setWeekActive] = useState([])

  // Extras
  const [extrasCandidates, setExtrasCandidates] = useState([])
  const [selectedExtras, setSelectedExtras] = useState([])

  // ── Helpers ───────────────────────────────────────────────────────────────

  function buildPick2(recipe) {
    const allExclude = [...recentIds, recipe.id]
    const related = getRelatedCandidates(recipe, recipes, allExclude, 2)
    const relatedIds = related.map(r => r.id)
    const unrelated = getUnrelatedCandidates(recipe, recipes, [...allExclude, ...relatedIds], 2)
    setPick1(recipe)
    setPick2Candidates({ related, unrelated })
    setStep(STEP.PICK_2)
  }

  // ── Basket ────────────────────────────────────────────────────────────────

  function handleBasketToggle(recipe) {
    setBasket(prev => {
      const inBasket = prev.some(r => r.id === recipe.id)
      if (inBasket) return prev.filter(r => r.id !== recipe.id)
      if (prev.length >= 2) return prev
      return [...prev, recipe]
    })
  }

  function handlePlanFromBasket() {
    setSearchOpen(false)
    const [b1, b2] = basket

    if (basket.length === 1) {
      buildPick2(b1)
    } else {
      setPick1(b1)
      const exclude = [...recentIds, b1.id, b2.id]
      const assigned = assignThirdRecipe(b1, b2, recipes, exclude)
      setWeek([b1, b2, assigned].filter(Boolean))
      setStep(STEP.WEEK_REVIEW)
    }

    setBasket([])
  }

  // ── Entry modes ───────────────────────────────────────────────────────────

  function handleQuick() {
    setStep(STEP.QUICK)
  }

  function handleBrowse() {
    setSearchOpen(true)
  }

  function handleJar() {
    setStep(STEP.JAR_PICK)
  }

  function handleChoose() {
    setPick1Candidates(getRandomCandidates(recipes, recentIds))
    setPick1Label('Step 1 of 2')
    setPick1Title('What takes your fancy?')
    setPick1Hint('Pick one to anchor your week around.')
    setStep(STEP.PICK_1)
  }

  function handleJarPick(jarKey) {
    const candidates = getRecipesForJar(jarKey, recipes, recentIds)
    setPick1Candidates(candidates)
    setPick1Label('Finish the jar')
    setPick1Title('Pick your first recipe')
    setPick1Hint('These all use that paste or sauce.')
    setStep(STEP.PICK_1)
  }

  // ── Standard planner flow ─────────────────────────────────────────────────

  function handlePick1(recipe) {
    buildPick2(recipe)
  }

  function handlePick2(recipe) {
    const allExclude = [...recentIds, pick1.id, recipe.id]
    const assigned = assignThirdRecipe(pick1, recipe, recipes, allExclude)
    setWeek([pick1, recipe, assigned].filter(Boolean))
    setStep(STEP.WEEK_REVIEW)
  }

  function handleWeekSwap(index, newRecipe) {
    setWeek(prev => prev.map((r, i) => (i === index ? newRecipe : r)))
  }

  function handleWeekConfirm(activeRecipes) {
    setWeekActive(activeRecipes)
    setExtrasCandidates(getOptionalExtras(activeRecipes, recipes))
    setStep(STEP.EXTRAS)
  }

  function handleExtrasConfirm(chosen) {
    setSelectedExtras(chosen)
    setStep(STEP.SUMMARY)
  }

  function handleStartAgain() {
    const newRecentIds = week.map(r => r.id)
    localStorage.setItem('recentRecipeIds', JSON.stringify(newRecentIds))
    setRecentIds(newRecentIds)
    setPick1(null)
    setWeek([])
    setWeekActive([])
    setSelectedExtras([])
    setBasket([])
    setStep(STEP.HOME)
  }

  const weekIds = week.map(r => r.id)
  const jarList = getJarList(recipes)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rosie Chef</h1>
        <p className="app-header__sub">weekly meal planner</p>
        {step !== STEP.HOME && (
          <div className="app-header__actions">
            <button
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search recipes"
            >
              🔍 browse recipes
            </button>
            {basket.length > 0 && (
              <button
                className="basket-trigger"
                onClick={() => setSearchOpen(true)}
              >
                🧺 {basket.length} saved — plan from these →
              </button>
            )}
          </div>
        )}
      </header>

      {searchOpen && (
        <IngredientSearch
          recipes={recipes}
          basket={basket}
          onBasketToggle={handleBasketToggle}
          onPlanFromBasket={handlePlanFromBasket}
          onClose={closeSearch}
        />
      )}

      <main className="app-main">
        {step === STEP.HOME && (
          <HomeScreen
            onQuick={handleQuick}
            onBrowse={handleBrowse}
            onJar={handleJar}
            onChoose={handleChoose}
          />
        )}

        {step === STEP.QUICK && (
          <QuickMeals onBack={() => setStep(STEP.HOME)} />
        )}

        {step === STEP.JAR_PICK && (
          <JarPicker
            jars={jarList}
            onPick={handleJarPick}
            onBack={() => setStep(STEP.HOME)}
          />
        )}

        {step === STEP.PICK_1 && (
          <RecipePicker
            candidates={pick1Candidates}
            onPick={handlePick1}
            label={pick1Label}
            title={pick1Title}
            hint={pick1Hint}
            onBack={() => setStep(STEP.HOME)}
          />
        )}

        {step === STEP.PICK_2 && (
          <RelatedPicker
            pick1={pick1}
            related={pick2Candidates.related}
            unrelated={pick2Candidates.unrelated}
            onPick={handlePick2}
          />
        )}

        {step === STEP.WEEK_REVIEW && (
          <WeekPlan
            weekNum={1}
            recipes={week}
            swappableIndices={[2]}
            allRecipes={recipes}
            excludeIds={[...recentIds, ...weekIds]}
            onSwap={handleWeekSwap}
            onConfirm={handleWeekConfirm}
            confirmLabel="Looks good →"
          />
        )}

        {step === STEP.EXTRAS && (
          <OptionalExtras
            candidates={extrasCandidates}
            onConfirm={handleExtrasConfirm}
          />
        )}

        {step === STEP.SUMMARY && (
          <PlanSummary
            week={week}
            weekActive={weekActive}
            extras={selectedExtras}
            onStartAgain={handleStartAgain}
          />
        )}
      </main>
    </div>
  )
}
