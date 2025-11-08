import React from 'react'

export default function FilterBar({ brand, setBrand, model, setModel, onClear }){
  return (
    <div className="filter-bar">
      <div className="filter-inner">
        <input
          className="filter-input"
          placeholder="Filtrar por marca"
          value={brand}
          onChange={(e)=>setBrand(e.target.value)}
        />
        <input
          className="filter-input"
          placeholder="Filtrar por modelo"
          value={model}
          onChange={(e)=>setModel(e.target.value)}
        />
        <button className="btn" onClick={onClear}>Limpiar</button>
      </div>
    </div>
  )
}
