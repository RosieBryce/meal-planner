export default function JarPicker({ jars, onPick, onBack }) {
  return (
    <div className="step">
      <div className="step-header">
        <p className="step-label">Finish a jar</p>
        <h2>What have you got open?</h2>
        <p className="step-hint">I'll find recipes that use it up.</p>
      </div>
      <div className="jar-list">
        {jars.map(({ key, label }) => (
          <button key={key} className="jar-btn" onClick={() => onPick(key)}>
            <span className="jar-btn__icon">🫙</span> {label}
          </button>
        ))}
      </div>
      <button className="btn btn--ghost" style={{ marginTop: '1.5rem' }} onClick={onBack}>
        ← Back
      </button>
    </div>
  )
}
