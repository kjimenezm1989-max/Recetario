import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, calculateUnitCost } from '../utils/currency'
import { MaterialForm } from '../components/MaterialForm'
import './Materials.css'

export function Materials() {
  const { translate, config, materials, addMaterial, updateMaterial, deleteMaterial, canAddMaterials } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Keyboard shortcut: Alt+M to add material
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        setEditingId(null)
        setShowForm(!showForm)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showForm])

  const filteredMaterials = materials
    .filter(material =>
      material.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const handleAddMaterial = (material) => {
    addMaterial(material)
    setShowForm(false)
  }

  const handleUpdateMaterial = (material) => {
    updateMaterial(editingId, material)
    setEditingId(null)
  }

  const handleEditClick = (material) => {
    setEditingId(material.id)
    setShowForm(true)
  }

  const handleDeleteClick = (id) => {
    if (confirm(translate('confirm'))) {
      deleteMaterial(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingMaterial = materials.find(m => m.id === editingId)

  return (
    <div className="materials-container">
      <div className="section-header">
        <h2>{translate('materials')}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!canAddMaterials() && !editingId && (
            <span className="license-warning">
              Límite excedido - Require licencia
            </span>
          )}
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingId(null)
              setShowForm(!showForm)
            }}
            disabled={!canAddMaterials() && !editingId}
            title="Alt+M para agregar material"
          >
            {translate('add')} {translate('materials')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <MaterialForm
            material={editingMaterial}
            onSubmit={editingId ? handleUpdateMaterial : handleAddMaterial}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {filteredMaterials.length > 0 && (
        <div className="search-section">
          <input
            type="text"
            placeholder={translate('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {filteredMaterials.length === 0 ? (
        <div className="empty-state">
          <p>📦</p>
          <p>{translate('noData')}</p>
        </div>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map(material => (
            <div key={material.id} className="material-card">
              {material.imagen && (
                <img src={material.imagen} alt={material.nombre} className="material-image" />
              )}
              <div className="material-content">
                <h3>{material.nombre}</h3>
                <div className="material-details">
                  <div className="detail-row">
                    <span className="label">{translate('price')}:</span>
                    <span className="value">
                      {formatCurrency(material.precio, config.moneda)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">{translate('presentation')}:</span>
                    <span className="value">{material.presentacion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">{translate('quantity')}:</span>
                    <span className="value">{material.cantidad_presentacion}</span>
                  </div>
                  <div className="detail-row highlight">
                    <span className="label">{translate('unitCost')}:</span>
                    <span className="value">
                      {formatCurrency(
                        calculateUnitCost(material.precio, material.cantidad_presentacion),
                        config.moneda
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="material-actions">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => handleEditClick(material)}
                  title="Clickea para editar este material"
                >
                  {translate('edit')}
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteClick(material.id)}
                  title="Clickea para eliminar este material"
                >
                  {translate('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
