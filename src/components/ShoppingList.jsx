import { generateShoppingList } from '../logic/chaining.js'

function mergeItems(a, b) {
  const map = new Map()
  ;[...a, ...b].forEach(({ name, count }) => {
    const key = name.toLowerCase()
    const existing = map.get(key)
    if (existing) map.set(key, { name: existing.name, count: existing.count + count })
    else map.set(key, { name, count })
  })
  return [...map.values()].sort((x, y) => x.name.localeCompare(y.name))
}

function ListSection({ items }) {
  if (items.length === 0) return null
  return (
    <ul className="shop-list">
      {items.map(item => (
        <li key={item.name} className="shop-list__item">
          <label>
            <input type="checkbox" />
            <span>{item.name}{item.count > 1 ? ` ×${item.count}` : ''}</span>
          </label>
        </li>
      ))}
    </ul>
  )
}

export default function ShoppingList({ weekRecipes, extras = [] }) {
  const weekList = generateShoppingList(weekRecipes)
  const extrasList = generateShoppingList(extras)

  const sainsburys = mergeItems(weekList.sainsburys, extrasList.sainsburys)
  const ocado = mergeItems(weekList.ocado, extrasList.ocado)

  return (
    <div className="shopping-lists">
      <div className="shopping-col">
        <h3 className="shopping-col__heading">
          🛒 Sainsbury's
          <span className="shopping-col__sub">via Deliveroo</span>
        </h3>
        <ListSection items={sainsburys} />
      </div>

      <div className="shopping-col">
        <h3 className="shopping-col__heading">
          📦 Ocado
          <span className="shopping-col__sub">pastes, sauces & specialty</span>
        </h3>
        <ListSection items={ocado} />
      </div>
    </div>
  )
}
