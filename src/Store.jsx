import React, { useMemo, useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import FilterBar from "./components/FilterBar";
import ProfileModal from "./components/ProfileModal";
import Sidebar from "./components/Sidebar";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import MyOrders from "./components/MyOrders";
import OrderModal from "./components/OrderModal";
import OrderSuccessModal from "./components/OrderSuccessModal";
import useProducts from "./hooks/useProducts";
import usePromotions from "./hooks/usePromotions";
import PromoBanner from "./components/PromoBanner";
import { loginWebUser, registerWebUser } from "./lib/auth";
import { createWebOrder, listUserOrders } from "./lib/orders";

export default function Store() {
  const toastTimeoutRef = useRef(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        const ck = `cart_${u.email || "guest"}`;
        const raw = localStorage.getItem(ck);
        return raw ? JSON.parse(raw) : [];
      }
      const rawGuest = localStorage.getItem("cart_guest");
      return rawGuest ? JSON.parse(rawGuest) : [];
    } catch (e) {
      return [];
    }
  });
  const [view, setView] = useState("catalog"); // 'catalog' | 'cart' | 'orders'
  const [profileOpen, setProfileOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [successOrderNumber, setSuccessOrderNumber] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  async function loadOrders(userId) {
    if (!userId) {
      setOrders([]);
      setOrdersError("");
      return;
    }

    setOrdersLoading(true);
    setOrdersError("");
    try {
      const result = await listUserOrders(userId);
      setOrders(result);
    } catch (error) {
      setOrdersError(error?.message || "No se pudieron cargar los pedidos");
    } finally {
      setOrdersLoading(false);
    }
  }

  async function handleRegister({ name, email, password }) {
    try {
      const res = await registerWebUser({ name, email, password });
      if (res.ok) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      return res;
    } catch (error) {
      return {
        ok: false,
        message: error?.message || "No se pudo registrar la cuenta",
      };
    }
  }

  async function handleLogin({ email, password }) {
    try {
      const res = await loginWebUser({ email, password });
      if (res.ok) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      return res;
    } catch (error) {
      return {
        ok: false,
        message: error?.message || "No se pudo iniciar sesión",
      };
    }
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem("user");
    setOrders([]);
    setView("catalog");
  }

  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProducts();

  const { promoMap } = usePromotions();

  const categories = useMemo(() => {
    const s = new Set((products || []).map((p) => p.category));
    return Array.from(s);
  }, [products]);

  const filtered = (products || []).filter((p) => {
    const matchCat = category ? p.category === category : true;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    const matchBrand =
      !brand ||
      (p.brand && p.brand.toLowerCase().includes(brand.trim().toLowerCase()));
    const matchModel =
      !model ||
      (p.model && p.model.toLowerCase().includes(model.trim().toLowerCase()));
    return matchCat && matchSearch && matchBrand && matchModel;
  });

  function playAddToCartSound() {
    if (typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        980,
        audioContext.currentTime + 0.12,
      );

      gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.08,
        audioContext.currentTime + 0.02,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.22,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.24);
      oscillator.onended = () => {
        audioContext.close().catch(() => {});
      };
    } catch (error) {
      // ignore audio errors
    }
  }

  function showCartNotice(productName) {
    const message = `${String(productName || "Producto").trim()} agregado al carrito`;

    setCartNotice(message);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setCartNotice("");
      toastTimeoutRef.current = null;
    }, 2200);
  }

  function handleAdd(product) {
    setCart((cur) => {
      const exists = cur.find((i) => i.id === product.id);
      if (exists) {
        return cur.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...cur, { ...product, qty: 1 }];
    });

    showCartNotice(product?.title);
    playAddToCartSound();
  }

  function handleRemove(id) {
    setCart((c) => c.filter((i) => i.id !== id));
  }

  function handleQty(id, qty) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  // persist cart to localStorage whenever cart or user changes
  useEffect(() => {
    try {
      const key = user ? `cart_${user.email}` : "cart_guest";
      localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
      // ignore storage errors
    }
  }, [cart, user]);

  // when user logs in, merge guest cart into user cart and clear guest cart
  useEffect(() => {
    try {
      if (user) {
        const userKey = `cart_${user.email}`;
        const rawUserCart = localStorage.getItem(userKey);
        const userCart = rawUserCart ? JSON.parse(rawUserCart) : [];
        const rawGuest = localStorage.getItem("cart_guest");
        const guestCart = rawGuest ? JSON.parse(rawGuest) : [];
        // merge guestCart into userCart (sum quantities)
        const map = new Map();
        userCart.forEach((i) => map.set(i.id, { ...i }));
        guestCart.forEach((i) => {
          if (map.has(i.id))
            map.set(i.id, { ...map.get(i.id), qty: map.get(i.id).qty + i.qty });
          else map.set(i.id, { ...i });
        });
        const merged = Array.from(map.values());
        setCart(merged);
        localStorage.setItem(userKey, JSON.stringify(merged));
        localStorage.removeItem("cart_guest");
      } else {
        // user logged out -> load guest cart
        const rawGuest = localStorage.getItem("cart_guest");
        setCart(rawGuest ? JSON.parse(rawGuest) : []);
      }
    } catch (e) {
      /* ignore */
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadOrders(user.id);
      return;
    }

    setOrders([]);
    setOrdersError("");
  }, [user?.id]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  function handleCheckout() {
    if (!cart.length) {
      return;
    }

    setOrderError("");
    setOrderOpen(true);
  }

  async function handleSubmitOrder(customer, onGenericError) {
    setOrderSubmitting(true);
    setOrderError("");

    try {
      const result = await createWebOrder({
        customer,
        items: cart,
        currentUser: user,
      });
      const key = user ? `cart_${user.email}` : "cart_guest";

      setCart([]);
      localStorage.setItem(key, JSON.stringify([]));
      setOrderOpen(false);
      setSuccessOrderNumber(result.orderNumber);
      if (result.customer?.id) {
        setUser(result.customer);
        localStorage.setItem("user", JSON.stringify(result.customer));
        await loadOrders(result.customer.id);
      }
      setSuccessOpen(true);
      setView("catalog");
    } catch (error) {
      const message = error?.message || "No se pudo registrar el pedido.";
      setOrderError(message);
      if (onGenericError) onGenericError();
    } finally {
      setOrderSubmitting(false);
    }
  }

  return (
    <div className="store-app">
      <Header
        search={search}
        setSearch={setSearch}
        cartCount={cart.reduce((s, i) => s + i.qty, 0)}
        onCartClick={() => setView("cart")}
        onProfileClick={() => setProfileOpen(true)}
        onHomeClick={() => setView("catalog")}
        onOrdersClick={() => setView("orders")}
        activeView={view}
        user={user}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        user={user}
        onLogout={handleLogout}
        onViewOrders={() => setView("orders")}
      />
      <OrderModal
        open={orderOpen}
        onClose={() => {
          if (!orderSubmitting) {
            setOrderOpen(false);
            setOrderError("");
          }
        }}
        onSubmit={handleSubmitOrder}
        items={cart}
        submitting={orderSubmitting}
        submitError={orderError}
        defaultName={user?.name || ""}
        defaultPhone={user?.phone || ""}
        defaultAddress={user?.address || ""}
      />
      <OrderSuccessModal
        open={successOpen}
        orderNumber={successOrderNumber}
        onClose={() => setSuccessOpen(false)}
      />
      <div className="filter-row">
        <FilterBar
          brand={brand}
          setBrand={setBrand}
          model={model}
          setModel={setModel}
          onClear={() => {
            setBrand("");
            setModel("");
          }}
        />
      </div>
      <PromoBanner />

      <div className="store-content-wrap">
        <div
          className={`store-body ${view === "catalog" ? "with-sidebar" : "no-sidebar"}`}
        >
          {view === "catalog" && (
            <Sidebar
              categories={categories}
              selected={category}
              onSelect={setCategory}
            />
          )}
          <main className="store-main">
            {view === "catalog" && (
              <>
                <section className="catalog">
                  <h3 className="catalog-title">Productos y Servicios</h3>
                  {productsLoading ? (
                    <div className="empty">Cargando productos...</div>
                  ) : productsError ? (
                    <div className="empty">Error cargando productos.</div>
                  ) : (
                    <ProductList
                      products={filtered}
                      onAdd={handleAdd}
                      promoMap={promoMap}
                    />
                  )}
                </section>
              </>
            )}

            {view === "cart" && (
              <section className="cart-view">
                <div className="cart-header">
                  <button className="btn" onClick={() => setView("catalog")}>
                    ← Volver
                  </button>
                  <h3>Detalle del Carrito</h3>
                </div>
                <Cart
                  items={cart}
                  onRemove={handleRemove}
                  onChangeQty={handleQty}
                  onCheckout={handleCheckout}
                  onRequireLogin={() => setProfileOpen(true)}
                  user={user}
                />
              </section>
            )}

            {view === "orders" && user && (
              <MyOrders
                orders={orders}
                loading={ordersLoading}
                error={ordersError}
                onRefresh={() => loadOrders(user.id)}
              />
            )}

            {view === "orders" && !user && (
              <section className="orders-empty">
                <h3>Inicia sesión para ver tus pedidos</h3>
                <p className="muted">
                  Accede desde el ícono de perfil para monitorear el estado de
                  tus compras.
                </p>
                <button
                  className="btn primary"
                  onClick={() => setProfileOpen(true)}
                >
                  Abrir acceso
                </button>
              </section>
            )}
          </main>
        </div>
        <footer className="store-footer">
          <p>
            © {new Date().getFullYear()}{" "}
            <strong>Repuestos & Servicios Solutecc</strong>
          </p>

          <p>
            📞 Teléfono: <a href="tel:98436513">9843-6513</a> | 📧 Correo:{" "}
            <a href="mailto:solutecc2@gmail.com">solutecc2@gmail.com</a>
          </p>

          <p>
            📍 Dirección: Coxen Hole, entrada a Mantrapp, frente a Escuela
            ESBIR, Roatán, Islas de la Bahía
          </p>
        </footer>
      </div>
      {/* /store-content-wrap */}
      <div
        className={`cart-toast ${cartNotice ? "show" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="cart-toast-icon">✓</span>
        <span className="cart-toast-text">{cartNotice}</span>
      </div>
      {/* Botón flotante de WhatsApp */}
      <a
        href="https://wa.me/50498436513"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="WhatsApp"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .01 5.37.01 12c0 2.11.55 4.14 1.6 5.93L0 24l6.34-1.65A11.96 11.96 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52z"
            fill="#25D366"
          />
          <path
            d="M17.5 14.2c-.3-.15-1.76-.86-2.03-.96-.27-.1-.47-.15-.67.15s-.77.96-.95 1.16c-.18.2-.36.22-.66.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2 0-.38-.02-.53-.02-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51-.17-.02-.37-.02-.57-.02-.2 0-.53.07-.8.36-.27.29-1.03 1.01-1.03 2.46 0 1.44 1.05 2.83 1.2 3.03.15.2 2.07 3.33 5.02 4.67 2.95 1.34 2.95.89 3.48.83.53-.06 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.18-.57-.33z"
            fill="#fff"
          />
        </svg>
      </a>
    </div>
  );
}
