import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { getCurrencies } from '../utils/currency'
import { getAllThemes } from '../utils/themes'
import { LicenseManager } from '../components/LicenseManager'
import './Settings.css'

export function Settings() {
  const { translate, config, setConfig, setConfigCosts, configCosts, licenseStatus, activateLicense } = useAppContext()

  const [formData, setFormData] = useState(config)
  const [costData, setCostData] = useState(configCosts)
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          logo: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCostChange = (e) => {
    const { name, value } = e.target
    setCostData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setConfig(formData)
    setConfigCosts(costData)
    setSuccess(translate('configurationSaved'))
    setTimeout(() => setSuccess(''), 3000)
  }

  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' }
  ]

  const currencies = getCurrencies()

  return (
    <div className="settings-container">
      <h2>{translate('configuration')}</h2>

      {success && (
        <div className="alert alert-success">
          ✓ {success}
        </div>
      )}

      <LicenseManager status={licenseStatus} onActivate={activateLicense} />

      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <h3>👤 {translate('businessName')}</h3>
          
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="nombre_negocio">{translate('businessName')}</label>
              <input
                type="text"
                id="nombre_negocio"
                name="nombre_negocio"
                value={formData.nombre_negocio}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label htmlFor="nombre_administrador">{translate('adminName') || 'Nombre del Administrador'}</label>
              <input
                type="text"
                id="nombre_administrador"
                name="nombre_administrador"
                value={formData.nombre_administrador}
                onChange={handleChange}
                placeholder="Tu nombre"
              />
            </div>

            <div className="input-group">
              <label htmlFor="logo">{translate('logo')}</label>
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="descripcion_negocio">Descripción del Negocio</label>
            <textarea
              id="descripcion_negocio"
              name="descripcion_negocio"
              value={formData.descripcion_negocio}
              onChange={handleChange}
              placeholder="Describe tu negocio, tu propuesta de valor, etc."
              rows="3"
            />
          </div>

          {formData.logo && (
            <div className="logo-preview">
              <img src={formData.logo} alt="logo" />
              <button
                type="button"
                className="btn-remove"
                onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
              >
                ✕ {translate('delete')}
              </button>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h3>📱 Redes Sociales</h3>
          
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="instagram">📷 Instagram</label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram || ''}
                onChange={handleChange}
                placeholder="@usuario o enlace"
              />
            </div>

            <div className="input-group">
              <label htmlFor="facebook">📘 Facebook</label>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.facebook || ''}
                onChange={handleChange}
                placeholder="usuario o enlace"
              />
            </div>

            <div className="input-group">
              <label htmlFor="whatsapp">💬 WhatsApp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp || ''}
                onChange={handleChange}
                placeholder="número con código de país"
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>🌍 {translate('language')}</h3>
          
          <div className="input-group">
            <label htmlFor="idioma">{translate('language')}</label>
            <select
              id="idioma"
              name="idioma"
              value={formData.idioma}
              onChange={handleChange}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>💱 {translate('currency')}</h3>
          
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="moneda">{translate('currency')}</label>
              <select
                id="moneda"
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="simbolo_moneda">{translate('currencySymbol')}</label>
              <input
                type="text"
                id="simbolo_moneda"
                name="simbolo_moneda"
                value={formData.simbolo_moneda}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3>🎨 {translate('theme') || 'Tema'}</h3>
          
          <div className="themes-grid">
            {getAllThemes().map(theme => (
              <div
                key={theme.id}
                className={`theme-card ${formData.tema === theme.id ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, tema: theme.id }))}
              >
                <div className="theme-colors">
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: theme.colors.chocolate }}
                    title="Chocolate"
                  />
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: theme.colors.rosa_pastel }}
                    title="Rosa"
                  />
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: theme.colors.crema }}
                    title="Crema"
                  />
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: theme.colors.verde_menta }}
                    title="Verde"
                  />
                </div>
                <p className="theme-name">{theme.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <h3>💰 {translate('profitMargin')} {translate('configuration')}</h3>
          
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="ganancia">
                {translate('profitMargin')} (%)
                <span className="value-badge">{costData.ganancia}%</span>
              </label>
              <input
                type="number"
                id="ganancia"
                name="ganancia"
                value={costData.ganancia}
                onChange={handleCostChange}
                step="0.5"
                min="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="gastos">
                {translate('expenses')} (%)
                <span className="value-badge">{costData.gastos}%</span>
              </label>
              <input
                type="number"
                id="gastos"
                name="gastos"
                value={costData.gastos}
                onChange={handleCostChange}
                step="0.5"
                min="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="empaque">
                {translate('packaging')} (%)
                <span className="value-badge">{costData.empaque}%</span>
              </label>
              <input
                type="number"
                id="empaque"
                name="empaque"
                value={costData.empaque}
                onChange={handleCostChange}
                step="0.5"
                min="0"
              />
            </div>
          </div>

          <div className="cost-summary">
            <p>
              {translate('expenses')} + {translate('packaging')}: 
              <strong>{costData.gastos + costData.empaque}%</strong>
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-large">
            {translate('updateConfig')}
          </button>
        </div>
      </form>

      <div className="settings-info">
        <h3>ℹ️ {translate('information')}</h3>
        <div className="info-box">
          <p><strong>{formData.nombre_negocio || 'Mi Negocio'}</strong></p>
          <p>{formData.descripcion_negocio || 'Solución completa para gestión de recetas, costos y cotizaciones en repostería y cocina artesanal.'}</p>
          <ul>
            <li>✅ Gestión de materiales y costos</li>
            <li>✅ Cálculo automático de precios</li>
            <li>✅ Generación de cotizaciones profesionales</li>
            <li>✅ Disponible sin conexión (PWA)</li>
            <li>✅ Sincronización automática de datos</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
