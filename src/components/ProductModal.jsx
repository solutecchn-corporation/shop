import React from "react";
import ProductImage from "./ProductImage";
import { formatPrice } from "../lib/formatters";

export default function ProductModal({ product, onClose, onAdd }) {
  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          <div className="modal-media">
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
              <div className="price">{formatPrice(product.price)}</div>
              <button
                className="btn primary"
                onClick={() => {
                  onAdd(product);
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
