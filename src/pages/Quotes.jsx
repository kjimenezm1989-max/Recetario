import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { generateQuotePDF } from '../utils/quotePdf'
import { QuoteForm } from '../components/QuoteForm'
import './Quotes.css'

export function Quotes() {
  const { translate, config, quotes, addQuote, updateQuote, deleteQuote, recipes, canCreateQuotes } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Keyboard shortcut: Alt+Q to add quote
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'q') {
        e.preventDefault()
        setEditingId(null)
        setShowForm(!showForm)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showForm])

  const filteredQuotes = quotes.filter(quote =>
    (quote.cliente && quote.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (quotes.find(q => q.id === quote.id)?.recipe_id ? 
      recipes.find(r => r.id === quote.recipe_id)?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false)
  )

  const handleAddQuote = (quote) => {
    addQuote(quote)
    setShowForm(false)
  }

  const handleUpdateQuote = (quote) => {
    updateQuote(editingId, quote)
    setEditingId(null)
  }

  const handleEditClick = (quote) => {
    setEditingId(quote.id)
    setShowForm(true)
  }

  const handleDeleteClick = (id) => {
    if (confirm(translate('confirm'))) {
      deleteQuote(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingQuote = quotes.find(q => q.id === editingId)

  const getRecipeName = (recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId)
    return recipe ? recipe.nombre : 'Sin receta'
  }

  return (
    <div className="quotes-container">
      <div className="section-header">
        <h2>{translate('quotes')}</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null)
            setShowForm(!showForm)
          }}
          disabled={!canCreateQuotes()}
          title="Alt+Q para agregar cotización"
        >
          {translate('add')} {translate('quotes')}
        </button>
      </div>

      {!canCreateQuotes() && (
        <div className="license-banner">
          <p>🔒 <strong>Función de Cotizaciones Bloqueada</strong></p>
          <p>Las cotizaciones solo están disponibles con una licencia de pago. Activa tu licencia en Configuración.</p>
        </div>
      )}

      {showForm && canCreateQuotes() && (
        <div className="form-section">
          <QuoteForm
            quote={editingQuote}
            onSubmit={editingId ? handleUpdateQuote : handleAddQuote}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {filteredQuotes.length > 0 && (
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

      {filteredQuotes.length === 0 ? (
        <div className="empty-state">
          <p>📋</p>
          <p>{translate('noData')}</p>
        </div>
      ) : (
        <div className="quotes-grid">
          {filteredQuotes.map(quote => {
            const recipe = recipes.find(r => r.id === quote.recipe_id)
            
            return (
            <div key={quote.id} className="quote-card">
              {recipe?.imagen && (
                <div className="quote-image-section">
                  <img src={recipe.imagen} alt={recipe?.nombre} className="quote-image" />
                </div>
              )}
              
              <div className="quote-content">
                <h3 className="quote-client">{quote.cliente || translate('noData')}</h3>
                
                <div className="quote-details">
                  <div className="detail-row">
                    <span className="label">{translate('selectRecipe')}:</span>
                    <span className="value">{getRecipeName(quote.recipe_id)}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">{translate('date')}:</span>
                    <span className="value">{new Date(quote.fecha).toLocaleDateString()}</span>
                  </div>
                  
                  {recipe?.tiene_obsequio && (
                    <div className="detail-row gift-row">
                      <span className="label">🎁 {translate('hasGift')}:</span>
                      <span className="value">{recipe?.nombre_obsequio || 'Obsequio especial'}</span>
                    </div>
                  )}
                  
                  {recipe?.tiene_obsequio && recipe?.imagen_obsequio && (
                    <div className="gift-image-container">
                      <img src={recipe.imagen_obsequio} alt={recipe.nombre_obsequio} className="gift-image" />
                    </div>
                  )}
                  
                  <div className="detail-row highlight">
                    <span className="label">{translate('finalPrice')}:</span>
                    <span className="value">{formatCurrency(quote.precio_final, config.moneda)}</span>
                  </div>
                </div>
              </div>
              
              <div className="quote-actions">
                <button
                  className="btn btn-small btn-secondary"
                  onClick={() => handleEditClick(quote)}
                  title="Clickea para editar esta cotización"
                >
                  {translate('edit')}
                </button>
                <button
                  className="btn btn-small btn-success"
                  onClick={() => generateQuotePDF(quote, recipe, config, formatCurrency)}
                  title="Descargar cotización en PDF"
                >
                  📥 PDF
                </button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => handleDeleteClick(quote.id)}
                  title="Clickea para eliminar esta cotización"
                >
                  {translate('delete')}
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
