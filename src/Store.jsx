import React, { useMemo, useState, useEffect } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ProfileModal from './components/ProfileModal'
import Sidebar from './components/Sidebar'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import productsData from './data/products'

export default function Store(){
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [cart, setCart] = useState(()=>{
    try{
      const rawUser = localStorage.getItem('user')
      if(rawUser){
        const u = JSON.parse(rawUser)
        const ck = `cart_${u.email}`
        const raw = localStorage.getItem(ck)
        return raw? JSON.parse(raw): []
      }
      const rawGuest = localStorage.getItem('cart_guest')
      return rawGuest? JSON.parse(rawGuest): []
    }catch(e){
      return []
    }
  })
  const [view, setView] = useState('catalog') // 'catalog' | 'cart'
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState(()=>{
    try{ const raw = localStorage.getItem('user'); return raw? JSON.parse(raw): null }catch(e){return null}
  })

  // simple accounts storage in localStorage
  function getAccounts(){
    try{ const raw = localStorage.getItem('accounts'); return raw? JSON.parse(raw): [] }catch(e){return []}
  }

  function saveAccounts(acc){ localStorage.setItem('accounts', JSON.stringify(acc)) }

  function handleRegister({name,email,password}){
    const acc = getAccounts()
    if(acc.find(a=>a.email===email)) return { ok: false, message: 'El email ya está registrado' }
    acc.push({name,email,password})
    saveAccounts(acc)
    setUser({name,email})
    localStorage.setItem('user', JSON.stringify({name,email}))
    return { ok: true }
  }

  function handleLogin({email,password}){
    const acc = getAccounts()
    const found = acc.find(a=>a.email===email && a.password===password)
    if(!found) return { ok: false, message: 'Credenciales incorrectas' }
    setUser({name:found.name,email:found.email})
    localStorage.setItem('user', JSON.stringify({name:found.name,email:found.email}))
    return { ok: true }
  }

  function handleLogout(){
    setUser(null)
    localStorage.removeItem('user')
  }

  const categories = useMemo(()=>{
    const s = new Set(productsData.map(p=>p.category))
    return Array.from(s)
  },[])

  const filtered = productsData.filter(p=>{
    const matchCat = category ? p.category === category : true
    const q = search.trim().toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    const matchBrand = !brand || (p.brand && p.brand.toLowerCase().includes(brand.trim().toLowerCase()))
    const matchModel = !model || (p.model && p.model.toLowerCase().includes(model.trim().toLowerCase()))
    return matchCat && matchSearch && matchBrand && matchModel
  })

  function handleAdd(product){
    setCart((cur)=>{
      const exists = cur.find(i=>i.id===product.id)
      if(exists){
        return cur.map(i=> i.id===product.id ? {...i, qty: i.qty+1} : i)
      }
      return [...cur, {...product, qty:1}]
    })
  }

  function handleRemove(id){
    setCart(c=>c.filter(i=>i.id!==id))
  }

  function handleQty(id, qty){
    setCart(c=>c.map(i=>i.id===id ? {...i, qty} : i))
  }

  // persist cart to localStorage whenever cart or user changes
  useEffect(()=>{
    try{
      const key = user ? `cart_${user.email}` : 'cart_guest'
      localStorage.setItem(key, JSON.stringify(cart))
    }catch(e){
      // ignore storage errors
    }
  },[cart, user])

  // when user logs in, merge guest cart into user cart and clear guest cart
  useEffect(()=>{
    try{
      if(user){
        const userKey = `cart_${user.email}`
        const rawUserCart = localStorage.getItem(userKey)
        const userCart = rawUserCart? JSON.parse(rawUserCart): []
        const rawGuest = localStorage.getItem('cart_guest')
        const guestCart = rawGuest? JSON.parse(rawGuest): []
        // merge guestCart into userCart (sum quantities)
        const map = new Map()
        userCart.forEach(i=> map.set(i.id, {...i}))
        guestCart.forEach(i=>{
          if(map.has(i.id)) map.set(i.id, {...map.get(i.id), qty: map.get(i.id).qty + i.qty})
          else map.set(i.id, {...i})
        })
        const merged = Array.from(map.values())
        setCart(merged)
        localStorage.setItem(userKey, JSON.stringify(merged))
        localStorage.removeItem('cart_guest')
      } else {
        // user logged out -> load guest cart
        const rawGuest = localStorage.getItem('cart_guest')
        setCart(rawGuest? JSON.parse(rawGuest): [])
      }
    }catch(e){/* ignore */}
  },[user])

  function handleCheckout(){
    // simulate order: require user (should be logged in)
    if(!user){
      setProfileOpen(true)
      return
    }
    // simple simulated checkout: clear cart and store empty cart
    const key = `cart_${user.email}`
    setCart([])
    localStorage.setItem(key, JSON.stringify([]))
    // basic confirmation
    try{ window.alert('Pedido realizado. Nos pondremos en contacto al email proporcionado.') }catch(e){}
    setView('catalog')
  }

  return (
    <div className="store-app">
      <Header
        search={search}
        setSearch={setSearch}
        cartCount={cart.reduce((s,i)=>s+i.qty,0)}
        onCartClick={() => setView('cart')}
        onProfileClick={() => setProfileOpen(true)}
        user={user}
      />
      <ProfileModal open={profileOpen} onClose={()=>setProfileOpen(false)} onLogin={handleLogin} onRegister={handleRegister} user={user} onLogout={handleLogout} />
      {/* Filter bar debajo del header */}
      <div className="filter-row">
        <FilterBar brand={brand} setBrand={setBrand} model={model} setModel={setModel} onClear={()=>{setBrand(''); setModel('')}} />
      </div>
      <div className={`store-body ${view === 'catalog' ? 'with-sidebar' : 'no-sidebar'}`}>
        {view === 'catalog' && (
          <Sidebar categories={categories} selected={category} onSelect={setCategory} />
        )}
        <main className="store-main">
          {view === 'catalog' && (
            <>
              <section className="hero">
                <h2>Tienda de Repuestos y Servicios</h2>
                <p className="muted">Repuestos y servicios para refrigeración, estufas y mantenimiento técnico.</p>
              </section>

              <section className="catalog">
                <h3>Productos y Servicios</h3>
                <ProductList products={filtered} onAdd={handleAdd} />
              </section>
            </>
          )}

          {view === 'cart' && (
            <section className="cart-view">
              <div className="cart-header">
                <button className="btn" onClick={()=>setView('catalog')}>← Volver</button>
                <h3>Detalle del Carrito</h3>
              </div>
              <Cart items={cart} onRemove={handleRemove} onChangeQty={handleQty} />
            </section>
          )}
        </main>
      </div>
      <footer className="store-footer">&copy; {new Date().getFullYear()} Repuestos & Servicios — Contacto: demo@tienda.local</footer>
    </div>
  )
}
