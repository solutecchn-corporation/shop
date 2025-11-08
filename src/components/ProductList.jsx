import React, { useState } from 'react'
import ProductModal from './ProductModal'

export default function ProductList({ products, onAdd }) {
  const [selected, setSelected] = useState(null)

  if (!products.length) return <div className="empty">No se encontraron productos.</div>

  return (
    <>
      <div className="product-list">
        {products.map((p) => (
          <article className="product-card" key={p.id} onClick={() => setSelected(p)}>
            <div className="product-media">
              {p.image ? (
                <img src={p.image} alt={p.title} className="product-img" loading="lazy" />
              ) : (
                <div className="product-placeholder">{p.title.charAt(0)}</div>
              )}
            </div>
            <div className="product-body">
              <div className="product-header">
                <h4>{p.title}</h4>
                <span className="cat-tag">{p.category}</span>
              </div>
              <div className="product-sub">
                {p.brand && <span className="brand">Marca: <strong>{p.brand}</strong></span>}
                {p.model && <span className="model">Modelo: <strong>{p.model}</strong></span>}
              </div>
              <p className="muted small desc">{p.description}</p>
              <div className="product-meta">
                <div className="price">${p.price.toFixed(2)}</div>
                <button className="btn" onClick={(e)=>{e.stopPropagation(); onAdd(p)}}>Agregar</button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <ProductModal product={selected} onClose={()=>setSelected(null)} onAdd={onAdd} />
    </>
  )
}
