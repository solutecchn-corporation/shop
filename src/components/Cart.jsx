import React from "react";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/formatters";

export default function Cart({
  items,
  onRemove,
  onChangeQty,
  onCheckout,
  onRequireLogin,
  user,
}) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  function handleCheckoutClick() {
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (onCheckout) onCheckout();
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
                  <ProductImage
                    image={it.image}
                    title={it.title}
                    imgClassName="product-img"
                    fallbackClassName="product-placeholder"
                  />
                </div>
                <div className="cart-info">
                  <div className="cart-title">{it.title}</div>
                  <div className="muted small">{it.description}</div>
                  <div className="cart-controls">
                    <label className="qty-label">Cantidad</label>
                    <input
                      className="qty-input"
                      type="number"
                      min="1"
                      value={it.qty}
                      onChange={(e) =>
                        onChangeQty(it.id, Math.max(1, Number(e.target.value)))
                      }
                    />
                    <div className="cart-price">
                      {formatPrice(it.price * it.qty)}
                    </div>
                    <button
                      className="btn small"
                      onClick={() => onRemove(it.id)}
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <div className="summary-row">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <button
                className="btn primary full"
                onClick={handleCheckoutClick}
              >
                Realizar pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
