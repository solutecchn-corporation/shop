import React from "react";

export default function OrderSuccessModal({ open, orderNumber, onClose }) {
  if (!open) return null;

  const displayNumber = orderNumber || "pendiente";
  const whatsappUrl = `https://wa.me/50498436513?text=${encodeURIComponent(`solicite pedido num: ${displayNumber}`)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal success-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-content success-modal-content">
          <h3>Pedido exitoso</h3>
          <p>El administrador se comunicará contigo.</p>
          <p className="muted">
            Pedido número: <strong>{displayNumber}</strong>
          </p>
          <div className="order-actions">
            <button className="btn" onClick={onClose}>
              Cerrar
            </button>
            <a
              className="btn primary"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Chatear
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
