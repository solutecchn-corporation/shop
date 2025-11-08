import React from 'react'
import logo from '../../log.jpeg'

export default function Header({ search, setSearch, cartCount, onCartClick, onProfileClick, user }) {
  return (
    <header className="store-header">
      <div className="brand">
        <img src={logo} alt="solutecc" className="brand-logo" />
        <span className="brand-text">solutecc</span>
      </div>
      <div className="search-area">
        <input
          className="search-input"
          placeholder="Buscar producto o servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="header-actions">
        <button className="cart-indicator" onClick={onCartClick} aria-label="Ver carrito">
          Carrito ({cartCount})
        </button>
        <button
          className="profile-btn"
          onClick={onProfileClick}
          aria-label={user ? `Cuenta de ${user.name}` : 'Iniciar o registrarse'}
          title={user ? `Cuenta de ${user.name}` : 'Iniciar o registrarse'}
        >
          <svg className="profile-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#fff" opacity="0.95"/>
            <path d="M3 21c0-3.866 3.582-7 9-7s9 3.134 9 7v1H3v-1z" fill="#fff" opacity="0.9"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
