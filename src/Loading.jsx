import React, { useEffect, useState } from 'react'
import logo from '../log.jpeg'
import Store from './Store'

export default function Loading() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <img src={logo} alt="logo" className="loading-logo" />
        <div className="spinner" />
        <p className="loading-text">Cargando...</p>
      </div>
    )
  }

  return <Store />
}


