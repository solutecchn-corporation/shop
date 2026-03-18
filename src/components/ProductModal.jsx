import React from "react";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/formatters";

export default function ProductModal({
  product,
  onClose,
  onAdd,
  promoMap = {},
}) {
  if (!product) return null;

  const promoKey = product.category ? product.category.toLowerCase() : null;
  const promo = promoKey ? promoMap[promoKey] : null;
  const discountedPrice = promo
    ? product.price * (1 - promo.porcentaje_descuento / 100)
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          <div className="modal-media" style={{ position: "relative" }}>
            {promo && (
              <div className="promo-badge promo-badge-lg">
                <span className="promo-badge-pct">
                  -{promo.porcentaje_descuento}%
                </span>
                {promo.nombre && (
                  <span className="promo-badge-name">{promo.nombre}</span>
                )}
              </div>
            )}
            <ProductImage
              image={product.image}
              title={product.title}
              imgClassName="product-img"
              fallbackClassName="product-placeholder modal-placeholder"
            />
          </div>
          <div className="modal-content">
            <h3>{product.title}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div className="cat-tag">{product.category}</div>
              {product.brand && (
                <div className="chip">Marca: {product.brand}</div>
              )}
              {product.model && (
                <div className="chip">Modelo: {product.model}</div>
              )}
            </div>
            <p className="muted">{product.description}</p>
            <div className="modal-footer">
              <div className="price-block">
                {promo ? (
                  <>
                    <span className="price-original">
                      {formatPrice(product.price)}
                    </span>
                    <span className="price-discounted">
                      {formatPrice(discountedPrice)}
                    </span>
                  </>
                ) : (
                  <div className="price">{formatPrice(product.price)}</div>
                )}
              </div>
              <button
                className="btn primary"
                onClick={() => {
                  onAdd(
                    promo ? { ...product, price: discountedPrice } : product,
                  );
                  onClose();
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
