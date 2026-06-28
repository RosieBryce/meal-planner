import easyBuys from '../data/easy-buys.json'

export default function QuickMeals({ onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <p className="step-label">Quick meals</p>
        <h2>Brain melted? Here you go.</h2>
        <p className="step-hint">Order via Deliveroo from Morrisons.</p>
      </div>
      {easyBuys.map(cat => (
        <div key={cat.category} className="easy-buys-cat">
          <h4>{cat.category}</h4>
          <ul className="easy-buys-list">
            {cat.items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      ))}
      <button className="btn btn--ghost" style={{ marginTop: '1.5rem' }} onClick={onBack}>
        ← Back
      </button>
    </div>
  )
}
