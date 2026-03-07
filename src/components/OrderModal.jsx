import React, { useEffect, useState } from "react";
import { formatPrice } from "../lib/formatters";

const INITIAL_FORM = {
  name: "",
  phone: "",
  identity: "",
  address: "",
};

export default function OrderModal({
  open,
  onClose,
  onSubmit,
  items,
  submitting,
  submitError = "",
  defaultName = "",
  defaultPhone = "",
  defaultAddress = "",
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setError("");
      return;
    }

    setForm((current) => ({
      ...INITIAL_FORM,
      ...current,
      name: defaultName || current.name || "",
      phone: defaultPhone || current.phone || "",
      address: defaultAddress || current.address || "",
    }));
    setError("");
  }, [open, defaultAddress, defaultName, defaultPhone]);

  if (!open) return null;

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.identity.trim() ||
      !form.address.trim()
    ) {
      setError("Completa nombre, celular, identidad y dirección.");
      return;
    }

    if (items.length === 0) {
      setError("El carrito está vacío.");
      return;
    }

    await onSubmit(
      {
        name: form.name,
        phone: form.phone,
        identity: form.identity,
        address: form.address,
      },
      () => setError("No se pudo registrar el pedido."),
    );
  }

  return (
    <div className="modal-backdrop" onClick={submitting ? undefined : onClose}>
      <div className="modal order-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={submitting}>
          ×
        </button>
        <div className="modal-body order-modal-body">
          <div className="modal-content order-form-wrap glass-panel">
            <div className="modal-section-kicker">Checkout</div>
            <h3>Finaliza tu pedido</h3>
            <p className="muted">
              Completa tus datos para que el administrador confirme tu
              solicitud.
            </p>

            <form className="order-form" onSubmit={handleSubmit}>
              <input
                className="filter-input"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                disabled={submitting}
              />
              <input
                className="filter-input"
                placeholder="Celular"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                disabled={submitting}
              />
              <input
                className="filter-input"
                placeholder="Identidad"
                value={form.identity}
                onChange={(e) => updateField("identity", e.target.value)}
                disabled={submitting}
              />
              <textarea
                className="filter-input order-textarea"
                placeholder="Dirección"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                disabled={submitting}
              />

              {(error || submitError) && (
                <div className="empty">{error || submitError}</div>
              )}

              <div className="order-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Realizar pedido"}
                </button>
              </div>
            </form>
          </div>

          <div className="order-summary-panel">
            <div className="modal-section-kicker">Resumen</div>
            <h4>Tu compra</h4>
            <div className="order-summary-list">
              {items.map((item) => (
                <div className="order-summary-item" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <div className="muted small">Cantidad: {item.qty}</div>
                  </div>
                  <strong>{formatPrice(item.price * item.qty)}</strong>
                </div>
              ))}
            </div>
            <div className="summary-row order-total-row">
              <span>Total</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
