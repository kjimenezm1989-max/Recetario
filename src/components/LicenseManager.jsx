import React, { useState } from 'react'
import './LicenseManager.css'

export function LicenseManager({ status, onActivate }) {
  const [licenseCode, setLicenseCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleActivate = (e) => {
    e.preventDefault()
    if (!licenseCode.trim()) {
      setMessage('Por favor ingresa un código de licencia')
      return
    }

    setLoading(true)
    // Simular pequeño delay de validación
    setTimeout(() => {
      const result = onActivate(licenseCode.trim())
      if (result.success) {
        setMessage(result.message)
        setLicenseCode('')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message)
      }
      setLoading(false)
    }, 500)
  }

  return (
    <div className="license-manager">
      {status.type === 'licensed' && (
        <div className="license-status licensed">
          <div className="status-icon">✓</div>
          <div className="status-content">
            <h4>Licencia Activa</h4>
            <p>{status.license.name}</p>
            {status.license.expiryDate && (
              <small>Expira: {new Date(status.license.expiryDate).toLocaleDateString()}</small>
            )}
          </div>
        </div>
      )}

      {status.type === 'trial' && (
        <div className="license-status trial">
          <div className="status-icon">⏱</div>
          <div className="status-content">
            <h4>Período de Prueba</h4>
            <p>{status.daysRemaining} días restantes</p>
            <small>Funcionalidad completa durante la prueba</small>
          </div>
        </div>
      )}

      {status.type === 'expired' && (
        <div className="license-status expired">
          <div className="status-icon">⚠</div>
          <div className="status-content">
            <h4>Período de Prueba Expirado</h4>
            <p>Limpiaciones aplicadas: máx 2 recetas, máx 10 artículos, sin imágenes ni cotizaciones</p>
          </div>
        </div>
      )}

      {status.type !== 'licensed' && (
        <form onSubmit={handleActivate} className="license-form">
          <input
            type="text"
            placeholder="Ingresa tu código de licencia"
            value={licenseCode}
            onChange={(e) => setLicenseCode(e.target.value)}
            disabled={loading}
            className="license-input"
          />
          <button type="submit" disabled={loading} className="license-button">
            {loading ? 'Validando...' : 'Activar Licencia'}
          </button>
        </form>
      )}

      {message && (
        <div className={`license-message ${message.includes('correctamente') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  )
}
