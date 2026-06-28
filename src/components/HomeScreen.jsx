export default function HomeScreen({ onQuick, onBrowse, onJar, onChoose }) {
  return (
    <div className="home">
      <p className="home__sub">What do you want to do?</p>
      <div className="home-options">
        <button className="home-option" onClick={onQuick}>
          <span className="home-option__icon">⚡</span>
          <div className="home-option__text">
            <span className="home-option__title">Show me something quick</span>
            <span className="home-option__desc">Easy meals, no faff</span>
          </div>
        </button>
        <button className="home-option" onClick={onBrowse}>
          <span className="home-option__icon">🔍</span>
          <div className="home-option__text">
            <span className="home-option__title">Let me browse</span>
            <span className="home-option__desc">Search and pick your first recipe</span>
          </div>
        </button>
        <button className="home-option" onClick={onJar}>
          <span className="home-option__icon">🫙</span>
          <div className="home-option__text">
            <span className="home-option__title">Help me finish this jar</span>
            <span className="home-option__desc">Pick a paste or sauce you've got open</span>
          </div>
        </button>
        <button className="home-option" onClick={onChoose}>
          <span className="home-option__icon">🎲</span>
          <div className="home-option__text">
            <span className="home-option__title">Help me choose</span>
            <span className="home-option__desc">Pick from a random shortlist</span>
          </div>
        </button>
      </div>
    </div>
  )
}
