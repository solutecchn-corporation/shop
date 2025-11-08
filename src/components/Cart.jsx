import React from 'react'

export default function Cart({ items, onRemove, onChangeQty, onCheckout, onRequireLogin, user }) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)

  function handleCheckoutClick(){
    if(!user){
      if(onRequireLogin) onRequireLogin()
      return
    }
    if(onCheckout) onCheckout()
  }

  return (
    <aside className="store-cart">
      <h3>Carrito</h3>
      {items.length === 0 ? (
        <div className="empty">El carrito está vacío</div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((it) => (
              <div className="cart-item" key={it.id}>
                <div className="cart-media">
                  {it.image ? <img src={it.image} alt={it.title} /> : <div className="product-placeholder">{it.title.charAt(0)}</div>}
                </div>
                <div className="cart-info">
                  <div className="cart-title">{it.title}</div>
                  <div className="muted small">{it.description}</div>
                  <div className="cart-controls">
                    <label className="qty-label">Cantidad</label>
                    <input className="qty-input" type="number" min="1" value={it.qty} onChange={(e)=>onChangeQty(it.id, Math.max(1, Number(e.target.value)))} />
                    <div className="cart-price">${(it.price * it.qty).toFixed(2)}</div>
                    <button className="btn small" onClick={() => onRemove(it.id)}>Quitar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <div className="summary-row">
                <span>Subtotal</span>
                <strong>${total.toFixed(2)}</strong>
              </div>
              <div className="summary-note muted">Impuestos y envío calculados al confirmar</div>
              <button className="btn primary full" onClick={handleCheckoutClick}>{user ? 'Pagar / Solicitar servicio' : 'Iniciar sesión para pagar'}</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
