import React, { useState, useEffect } from 'react'

export default function ProfileModal({ open, onClose, onLogin, onRegister, user, onLogout }){
  const [mode, setMode] = useState('choice') // 'choice' | 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(()=>{
    if(!open){ setError(''); setEmail(''); setPassword(''); setName(''); setMode('choice') }
    else setMode('choice')
  },[open])

  if(!open) return null

  async function handleLogin(){
    setError('')
    setSuccess('')
    if(!email||!password){ setError('Completa email y contraseña'); return }
    setLoading(true)
    try{
      const res = await Promise.resolve(onLogin({email,password}))
      if(!res || !res.ok){
        setError(res && res.message ? res.message : 'Credenciales incorrectas')
      } else {
        setSuccess('Has iniciado sesión correctamente')
        // small delay so user sees success
        setTimeout(()=>{ setLoading(false); onClose() }, 600)
        return
      }
    }catch(err){
      setError('Error al iniciar sesión')
    }
    setLoading(false)
  }

  async function handleRegister(){
    setError('')
    setSuccess('')
    if(!email||!password||!name){ setError('Completa todos los campos'); return }
    // basic validations
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if(!emailRegex.test(email)) { setError('Email no válido'); return }
    if(password.length < 6){ setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try{
      const res = await Promise.resolve(onRegister({name,email,password}))
      if(!res || !res.ok){
        setError(res && res.message ? res.message : 'Error al registrar')
      } else {
        setSuccess('Registro correcto. Has iniciado sesión.')
        setTimeout(()=>{ setLoading(false); onClose() }, 700)
        return
      }
    }catch(err){
      setError('Error al registrar')
    }
    setLoading(false)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <div style={{padding:18}}>
            {user ? (
              <div style={{marginBottom:12}}>
                <strong>Conectado como {user.name} ({user.email})</strong>
                <div style={{marginTop:8}}>
                  <button className="btn" onClick={()=>{onLogout(); onClose()}}>Cerrar sesión</button>
                </div>
              </div>
            ) : (
              <>
                {mode === 'choice' && (
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <button className="btn primary" onClick={()=>setMode('login')}>Iniciar sesión</button>
                    <button className="btn" onClick={()=>setMode('register')}>Registrarse</button>
                  </div>
                )}

                {mode === 'login' && (
                  <div>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      <button className="btn" onClick={()=>setMode('choice')}>← Volver</button>
                    </div>
                    <input className="filter-input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={loading} />
                    <input className="filter-input" placeholder="Contraseña" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={loading} />
                    {error && <div className="empty">{error}</div>}
                    {success && <div style={{color:'green',paddingTop:8}}>{success}</div>}
                    <div style={{marginTop:12}}>
                      <button className="btn primary" onClick={handleLogin} disabled={loading}>{loading? 'Procesando...':'Entrar'}</button>
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <div style={{display:'flex',gap:8,marginBottom:12}}>
                      <button className="btn" onClick={()=>setMode('choice')}>← Volver</button>
                    </div>
                    <input className="filter-input" placeholder="Nombre" value={name} onChange={(e)=>setName(e.target.value)} disabled={loading} />
                    <input className="filter-input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} disabled={loading} />
                    <input className="filter-input" placeholder="Contraseña" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} disabled={loading} />
                    {error && <div className="empty">{error}</div>}
                    {success && <div style={{color:'green',paddingTop:8}}>{success}</div>}
                    <div style={{marginTop:12}}>
                      <button className="btn primary" onClick={handleRegister} disabled={loading}>{loading? 'Procesando...':'Crear cuenta'}</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
