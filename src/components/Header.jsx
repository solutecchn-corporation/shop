import React from "react";
import logo from "../../log.jpeg";

export default function Header({
  search,
  setSearch,
  cartCount,
  onCartClick,
  onProfileClick,
  onHomeClick,
  onOrdersClick,
  activeView,
  user,
}) {
  return (
    <header className="store-header">
      <div className="brand brand-clickable" onClick={onHomeClick}>
        <img src={logo} alt="solutecc" className="brand-logo" />
        <div className="brand-info">
          <span className="brand-text">Solutecc</span>
          <div className="brand-subtitle">Tienda de repuestos</div>
        </div>
      </div>

      <div className="search-area">
        <div className="search-wrapper">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
            />
            <path
              d="m16.5 16.5 4 4"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="search-input"
            placeholder="Buscar producto, repuesto o servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <nav className="header-nav">
        <button
          type="button"
          className={`header-link ${activeView === "catalog" ? "active" : ""}`}
          onClick={onHomeClick}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span>Inicio</span>
        </button>
        {user && (
          <button
            type="button"
            className={`header-link ${activeView === "orders" ? "active" : ""}`}
            onClick={onOrdersClick}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Mis pedidos</span>
          </button>
        )}
      </nav>

      <div className="header-actions">
        <button
          type="button"
          className="cart-indicator"
          onClick={onCartClick}
          aria-label="Ver carrito"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
          <span>Carrito</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>

        <button
          type="button"
          className="profile-btn"
          onClick={onProfileClick}
          aria-label={user ? `Cuenta de ${user.name}` : "Iniciar o registrarse"}
          title={user ? `Cuenta de ${user.name}` : "Iniciar o registrarse"}
        >
          <svg
            className="profile-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
          >
            <path
              d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z"
              fill="#fff"
              opacity="0.95"
            />
            <path
              d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z"
              fill="#fff"
              opacity="0.9"
            />
          </svg>
          <span className="profile-label">
            {user ? user.name?.split(" ")[0] : "Acceder"}
          </span>
        </button>
      </div>
    </header>
  );
}
