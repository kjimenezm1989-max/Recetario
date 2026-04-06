import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { validateMaterial } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { PRESENTACIONES } from '../utils/presentaciones'
import './MaterialForm.css'

export function MaterialForm({ material, onSubmit, onCancel }) {
  const { translate, config, canAddMaterials, canUploadImages } = useAppContext()
  const [formData, setFormData] = useState(material || {
    nombre: '',
    precio: '',
    presentacion: '',
    cantidad_presentacion: '',
    imagen: null
  })

  const [errors, setErrors] = useState({})
  const [imageMode, setImageMode] = useState('file')
  const [imageUrl, setImageUrl] = useState('')
  const fileInputRef = React.useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imagen: event.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    if (url.trim()) {
      setFormData(prev => ({
        ...prev,
        imagen: url.trim()
      }))
    }
  }

  const handleImageModeChange = (mode) => {
    setImageMode(mode)
    setImageUrl('')
    setFormData(prev => ({
      ...prev,
      imagen: null
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Verificar licencia para agregar nuevos materiales
    if (!material && !canAddMaterials()) {
      alert('Límite de 10 artículos alcanzado. Requiere licencia de pago.')
      return
    }
    
    const validation = validateMaterial(formData)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const submissionData = {
      ...formData,
      precio: parseFloat(formData.precio),
      cantidad_presentacion: parseFloat(formData.cantidad_presentacion)
    }

    onSubmit(submissionData)
    setFormData({
      nombre: '',
      precio: '',
      presentacion: '',
      cantidad_presentacion: '',
      imagen: null
    })
  }

  return (
    <div className="material-form">
      <h3>{material ? translate('editMaterial') : translate('createMaterial')}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="nombre">{translate('materialName')} *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="precio">{translate('price')} * ({translate('totalUnit') || 'valor total'})</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={errors.precio ? 'input-error' : ''}
            />
            {errors.precio && <span className="error-message">{errors.precio}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="presentacion">{translate('presentation')} *</label>
            <select
              id="presentacion"
              name="presentacion"
              value={formData.presentacion}
              onChange={handleChange}
              className={errors.presentacion ? 'input-error' : ''}
            >
              <option value="">{translate('selectRecipe') || 'Seleccionar...'}</option>
              {PRESENTACIONES.map(pres => (
                <option key={pres.value} value={pres.value}>
                  {pres.label}
                </option>
              ))}
            </select>
            {errors.presentacion && <span className="error-message">{errors.presentacion}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="cantidad_presentacion">{translate('quantity')} * ({translate('packageContent') || 'contenido del envase'})</label>
            <input
              type="number"
              id="cantidad_presentacion"
              name="cantidad_presentacion"
              value={formData.cantidad_presentacion}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={errors.cantidad_presentacion ? 'input-error' : ''}
            />
            {errors.cantidad_presentacion && (
              <span className="error-message">{errors.cantidad_presentacion}</span>
            )}
          </div>
        </div>

        <div className="image-section">
          <label>{translate('image')}</label>
          {!canUploadImages() && (
            <div className="license-notice">
              ⚠️ Requiere licencia de pago para cargar imágenes
            </div>
          )}
          <div className="image-mode-tabs">
            <button
              type="button"
              className={`image-mode-btn ${imageMode === 'file' ? 'active' : ''}`}
              onClick={() => handleImageModeChange('file')}
              disabled={!canUploadImages()}
            >
              📤 {translate('uploadFile') || 'Subir archivo'}
            </button>
            <button
              type="button"
              className={`image-mode-btn ${imageMode === 'url' ? 'active' : ''}`}
              onClick={() => handleImageModeChange('url')}
              disabled={!canUploadImages()}
            >
              🔗 {translate('useUrl') || 'Usar URL'}
            </button>
          </div>

          {imageMode === 'file' && (
            <input
              type="file"
              id="imagen"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="file-input"
              disabled={!canUploadImages()}
            />
          )}

          {imageMode === 'url' && (
            <input
              type="text"
              placeholder={translate('imagePlaceholder') || 'https://ejemplo.com/imagen.jpg'}
              value={imageUrl}
              onChange={handleImageUrlChange}
              className="url-input"
              disabled={!canUploadImages()}
            />
          )}

          {formData.imagen && (
            <div className="image-preview">
              <img src={formData.imagen} alt="preview" />
              <button
                type="button"
                className="btn-remove-image"
                onClick={() => {
                  setFormData(prev => ({ ...prev, imagen: null }))
                  setImageUrl('')
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {translate('cancel')}
          </button>
          <button type="submit" className="btn btn-primary">
            {translate('save')}
          </button>
        </div>
      </form>
    </div>
  )
}

