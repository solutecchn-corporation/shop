import React, { useState } from "react";
import ProductModal from "./ProductModal";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/formatters";

export default function ProductList({ products, onAdd, promoMap = {} }) {
  const [selected, setSelected] = useState(null);

  if (!products.length)
    return <div className="empty">No se encontraron productos.</div>;

  return (
    <>
      <div className="product-list">
        {products.map((p) => {
          const promoKey = p.category ? p.category.toLowerCase() : null;
          const promo = promoKey ? promoMap[promoKey] : null;
          const discountedPrice = promo
            ? p.price * (1 - promo.porcentaje_descuento / 100)
            : null;

          return (
            <article
              className="product-card"
              key={p.id}
              onClick={() => setSelected(p)}
            >
              <div className="product-media">
                {promo && (
                  <div className="promo-badge">
                    <span className="promo-badge-pct">
                      -{promo.porcentaje_descuento}%
                    </span>
                    {promo.nombre && (
                      <span className="promo-badge-name">{promo.nombre}</span>
                    )}
                  </div>
                )}
                <ProductImage
                  image={p.image}
                  title={p.title}
                  imgClassName="product-img"
                />
              </div>
              <div className="product-body">
                <div className="product-header">
                  <h4>{p.title}</h4>
                  <span className="cat-tag">{p.category}</span>
                </div>
                <div className="product-sub">
                  {p.brand && (
                    <span className="brand">
                      Marca: <strong>{p.brand}</strong>
                    </span>
                  )}
                  {p.model && (
                    <span className="model">
                      Modelo: <strong>{p.model}</strong>
                    </span>
                  )}
                </div>
                <p className="muted small desc">{p.description}</p>
                <div className="product-meta">
                  <div className="price-block">
                    {promo ? (
                      <>
                        <span className="price-original">
                          {formatPrice(p.price)}
                        </span>
                        <span className="price-discounted">
                          {formatPrice(discountedPrice)}
                        </span>
                      </>
                    ) : (
                      <div className="price">{formatPrice(p.price)}</div>
                    )}
                  </div>
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd(promo ? { ...p, price: discountedPrice } : p);
                    }}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={onAdd}
        promoMap={promoMap}
      />
    </>
  );
}
