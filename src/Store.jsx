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

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

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
      {/* Filter bar debajo del header */}
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
      {/* Banner de promociones debajo del filtro */}
      <PromoBanner />

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
                Accede desde el ícono de perfil para monitorear el estado de tus
                compras.
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
      <div
        className={`cart-toast ${cartNotice ? "show" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="cart-toast-icon">✓</span>
        <span className="cart-toast-text">{cartNotice}</span>
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
          📍 Dirección: Coxen Hole, entrada a Mantrapp, frente a Escuela ESBIR,
          Roatán, Islas de la Bahía
        </p>
      </footer>
    </div>
  );
}
