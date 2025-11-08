import React from 'react'

export default function Sidebar({ categories, selected, onSelect }) {
  return (
    <aside className="store-sidebar">
      <h3>Categorías</h3>
      <ul>
        <li className={!selected ? 'active' : ''} onClick={() => onSelect('')}>Todas</li>
        {categories.map((c) => (
          <li key={c} className={selected === c ? 'active' : ''} onClick={() => onSelect(c)}>
            {c}
          </li>
        ))}
      </ul>
    </aside>
  )
}
