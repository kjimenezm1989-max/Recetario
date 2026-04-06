import React from 'react'
import { useAppContext } from '../context/AppContext'
import './Header.css'

export function Header() {
  const { config } = useAppContext()

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          {config.logo && (
            <img src={config.logo} alt={config.nombre_negocio} className="header-logo" />
          )}
          <h1 className="header-title">{config.nombre_negocio}</h1>
        </div>
        <div className="header-subtitle">
          SweetCost Studio
        </div>
      </div>
    </header>
  )
}
