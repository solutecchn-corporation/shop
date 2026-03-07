import React from "react";
import { formatPrice } from "../lib/formatters";
import ProductImage from "./ProductImage";

const STATUS_LABELS = {
  pendiente: "Pendiente",
  pagado: "Pagado",
  cancelado: "Cancelado",
  enviado: "Enviado",
};

function getStatusLabel(status) {
  return STATUS_LABELS[status] || status || "Pendiente";
}

export default function MyOrders({ orders, loading, error, onRefresh }) {
  if (loading) {
    return <div className="orders-empty">Cargando tus pedidos...</div>;
  }

  if (error) {
    return (
      <div className="orders-empty orders-error-card">
        <p>No se pudieron cargar tus pedidos.</p>
        <button className="btn" onClick={onRefresh}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="orders-empty">
        <h3>Aún no tienes pedidos</h3>
        <p className="muted">
          Cuando realices tu primer pedido, podrás monitorear aquí su estado.
        </p>
      </div>
    );
  }

  return (
    <section className="orders-section">
      <div className="orders-header-row">
        <div>
          <h2>Mis pedidos</h2>
          <p className="muted">
            Consulta pedidos pendientes, enviados, pagados o cancelados.
          </p>
        </div>
        <button className="btn" onClick={onRefresh}>
          Actualizar
        </button>
      </div>

      <div className="orders-grid">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card-head">
              <div>
                <span className="order-number">
                  Pedido #{order.displayNumber}
                </span>
                <div className="muted small">{order.dateLabel}</div>
              </div>
              <span
                className={`order-status status-${order.estado || "pendiente"}`}
              >
                {getStatusLabel(order.estado)}
              </span>
            </div>

            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div
                  className="order-line"
                  key={`${order.id}-${item.productId || index}`}
                >
                  <div className="order-line-media">
                    <ProductImage
                      image={item.image}
                      title={item.name}
                      imgClassName="product-img"
                      fallbackClassName="product-placeholder"
                    />
                  </div>
                  <div className="order-line-content">
                    <strong>{item.name}</strong>
                    <div className="muted small">Cantidad: {item.quantity}</div>
                  </div>
                  <strong className="order-line-total">
                    {formatPrice(item.total)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span className="muted">Total</span>
              <strong>{formatPrice(order.total)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
