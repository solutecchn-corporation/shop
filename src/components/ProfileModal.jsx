import React, { useState, useEffect } from "react";
import { isStrongPassword } from "../lib/auth";

export default function ProfileModal({
  open,
  onClose,
  onLogin,
  onRegister,
  user,
  onLogout,
  onViewOrders,
}) {
  const [mode, setMode] = useState("choice"); // 'choice' | 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      setEmail("");
      setPassword("");
      setName("");
      setMode("choice");
    } else setMode("choice");
  }, [open]);

  if (!open) return null;

  async function handleLogin() {
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Completa email y contraseña");
      return;
    }
    setLoading(true);
    try {
      const res = await Promise.resolve(onLogin({ email, password }));
      if (!res || !res.ok) {
        setError(res && res.message ? res.message : "Credenciales incorrectas");
      } else {
        setSuccess("Has iniciado sesión correctamente");
        // small delay so user sees success
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 600);
        return;
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    }
    setLoading(false);
  }

  async function handleRegister() {
    setError("");
    setSuccess("");
    if (!email || !password || !name) {
      setError("Completa todos los campos");
      return;
    }
    // basic validations
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      setError("Email no válido");
      return;
    }
    if (!isStrongPassword(password)) {
      setError(
        "La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un signo.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await Promise.resolve(onRegister({ name, email, password }));
      if (!res || !res.ok) {
        setError(res && res.message ? res.message : "Error al registrar");
      } else {
        setSuccess("Registro correcto. Has iniciado sesión.");
        setTimeout(() => {
          setLoading(false);
          onClose();
        }, 700);
        return;
      }
    } catch (err) {
      setError("Error al registrar");
    }
    setLoading(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-body auth-modal-body">
          <div className="auth-aside">
            <div className="modal-section-kicker">Mi cuenta</div>
            <h3>Compra, monitorea y administra tus pedidos.</h3>
            <p>
              Inicia sesión para ver tus pedidos, recibir actualizaciones y
              completar tus compras más rápido.
            </p>
            <ul className="auth-benefits">
              <li>Seguimiento de estados en tiempo real</li>
              <li>Proceso de compra más rápido</li>
              <li>Historial de pedidos desde tu perfil</li>
            </ul>
          </div>

          <div className="auth-panel">
            {user ? (
              <div className="account-state">
                <div className="modal-section-kicker">Sesión activa</div>
                <h3>{user.name}</h3>
                <p className="muted">{user.email}</p>
                <div className="account-pills">
                  <span className="account-pill">Pedidos activos</span>
                  <span className="account-pill">
                    Cuenta {user.status || "activa"}
                  </span>
                </div>
                <div className="order-actions auth-actions-left">
                  <button
                    className="btn primary"
                    onClick={() => {
                      if (onViewOrders) onViewOrders();
                      onClose();
                    }}
                  >
                    Mis pedidos
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            ) : (
              <>
                {mode === "choice" && (
                  <div className="auth-choice-wrap">
                    <div className="modal-section-kicker">Bienvenido</div>
                    <h3>Accede a tu cuenta</h3>
                    <p className="muted">Elige cómo quieres continuar.</p>
                    <div className="auth-choice-grid">
                      <button
                        className="auth-choice-card primary"
                        onClick={() => setMode("login")}
                      >
                        <strong>Iniciar sesión</strong>
                        <span>Consulta pedidos y continúa tus compras.</span>
                      </button>
                      <button
                        className="auth-choice-card"
                        onClick={() => setMode("register")}
                      >
                        <strong>Registrarse</strong>
                        <span>Crea tu cuenta para guardar tu historial.</span>
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="auth-form-wrap">
                    <div className="auth-back-row">
                      <button className="btn" onClick={() => setMode("choice")}>
                        ← Volver
                      </button>
                    </div>
                    <div className="modal-section-kicker">Login</div>
                    <h3>Inicia sesión</h3>
                    <p className="muted">
                      Usa tu correo y contraseña para entrar.
                    </p>
                    <input
                      className="filter-input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className="filter-input"
                      placeholder="Contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    <div className="auth-password-hint muted">
                      Mínimo 6 caracteres, incluyendo una mayúscula, un número y un signo.
                    </div>
                    {error && <div className="empty">{error}</div>}
                    {success && (
                      <div className="success-message">{success}</div>
                    )}
                    <div className="auth-submit-row">
                      <button
                        className="btn primary"
                        onClick={handleLogin}
                        disabled={loading}
                      >
                        {loading ? "Procesando..." : "Entrar"}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "register" && (
                  <div className="auth-form-wrap">
                    <div className="auth-back-row">
                      <button className="btn" onClick={() => setMode("choice")}>
                        ← Volver
                      </button>
                    </div>
                    <div className="modal-section-kicker">Registro</div>
                    <h3>Crea tu cuenta</h3>
                    <p className="muted">
                      Regístrate para ver tus pedidos y comprar más rápido.
                    </p>
                    <input
                      className="filter-input"
                      placeholder="Nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className="filter-input"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    <input
                      className="filter-input"
                      placeholder="Contraseña"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    {error && <div className="empty">{error}</div>}
                    {success && (
                      <div className="success-message">{success}</div>
                    )}
                    <div className="auth-submit-row">
                      <button
                        className="btn primary"
                        onClick={handleRegister}
                        disabled={loading}
                      >
                        {loading ? "Procesando..." : "Crear cuenta"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
