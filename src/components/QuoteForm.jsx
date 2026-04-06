import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { calculateRecipeCost, calculateFinalPrice } from '../utils/calculations'
import './QuoteForm.css'

export function QuoteForm({ quote, onSubmit, onCancel }) {
  const { translate, config, recipes, materials, configCosts, getRecipeMaterialsByRecipeId, canCreateQuotes } = useAppContext()

  const [formData, setFormData] = useState(quote || {
    recipe_id: '',
    cliente: '',
    ganancia: configCosts?.ganancia || 20,
    gastos: configCosts?.gastos || 5,
    empaque: configCosts?.empaque || 3,
    precio_final: '',
    nota: ''
  })

  const [selectedRecipe, setSelectedRecipe] = useState(quote?.recipe_id || '')
  const [recipeSearch, setRecipeSearch] = useState('')
  const [showRecipeList, setShowRecipeList] = useState(false)
  const [recipeCost, setRecipeCost] = useState(0)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [errors, setErrors] = useState({})

  // Calcular costo de receta y precio final cuando cambian los porcentajes
  useEffect(() => {
    if (selectedRecipe) {
      const recipeItems = getRecipeMaterialsByRecipeId(selectedRecipe)
      const cost = calculateRecipeCost(recipeItems, materials)
      
      console.log('📋 Costo receta calculado:', {
        recipeId: selectedRecipe,
        ingredientes: recipeItems.length,
        costo: cost
      })
      
      setRecipeCost(cost)

      const calculation = calculateFinalPrice(
        cost,
        formData.ganancia,
        formData.gastos,
        formData.empaque
      )
      setCalculatedPrice(calculation)
      
      setFormData(prev => ({
        ...prev,
        precio_final: calculation.finalPrice
      }))
    }
  }, [selectedRecipe, formData.ganancia, formData.gastos, formData.empaque, getRecipeMaterialsByRecipeId, materials])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cliente' ? value : parseFloat(value) || value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRecipeChange = (e) => {
    const recipeId = e.target.value
    setSelectedRecipe(recipeId)
    setFormData(prev => ({
      ...prev,
      recipe_id: recipeId
    }))
  }

  const getFilteredRecipes = () => {
    if (!recipeSearch.trim()) return recipes.sort((a, b) => a.nombre.localeCompare(b.nombre))
    const search = recipeSearch.toLowerCase()
    return recipes
      .filter(recipe => 
        recipe.nombre.toLowerCase().includes(search)
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  const handleRecipeSelect = (recipeId, recipeName) => {
    setSelectedRecipe(recipeId)
    setRecipeSearch(recipeName)
    setShowRecipeList(false)
    setFormData(prev => ({
      ...prev,
      recipe_id: recipeId
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Verificar licencia para crear cotizaciones
    if (!canCreateQuotes()) {
      alert('Las cotizaciones requieren una licencia de pago.')
      return
    }

    const newErrors = {}
    if (!formData.recipe_id) newErrors.recipe_id = translate('errorRequired')
    if (!formData.cliente.trim()) newErrors.cliente = translate('errorRequired')
    if (!formData.precio_final || formData.precio_final <= 0) {
      newErrors.precio_final = translate('errorRequired')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submissionData = {
      recipe_id: formData.recipe_id,
      cliente: formData.cliente,
      ganancia: formData.ganancia,
      gastos: formData.gastos,
      empaque: formData.empaque,
      precio_final: parseFloat(formData.precio_final),
      nota: formData.nota,
      fecha: quote?.fecha || new Date().toISOString()
    }

    onSubmit(submissionData)
    setFormData({
      recipe_id: '',
      cliente: '',
      ganancia: configCosts?.ganancia || 20,
      gastos: configCosts?.gastos || 5,
      empaque: configCosts?.empaque || 3,
      precio_final: '',
      nota: ''
    })
    setSelectedRecipe('')
    setRecipeCost(0)
    setCalculatedPrice(null)
  }

  const selectedRecipeData = recipes.find(r => r.id === selectedRecipe)

  return (
    <div className="quote-form">
      <h3>{quote ? translate('editQuote') : translate('createQuote')}</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group recipe-search-group">
            <label htmlFor="recipe_search">{translate('selectRecipe')} *</label>
            <div className="recipe-search-container">
              <input
                type="text"
                id="recipe_search"
                placeholder={translate('searchRecipe') || 'Buscar receta...'}
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                onFocus={() => setShowRecipeList(true)}
                onBlur={() => setTimeout(() => setShowRecipeList(false), 200)}
                className={errors.recipe_id ? 'input-error' : ''}
              />
              {showRecipeList && getFilteredRecipes().length > 0 && (
                <div className="recipe-dropdown">
                  {getFilteredRecipes().map(recipe => (
                    <div
                      key={recipe.id}
                      className="recipe-option"
                      onClick={() => handleRecipeSelect(recipe.id, recipe.nombre)}
                    >
                      {recipe.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.recipe_id && <span className="error-message">{errors.recipe_id}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="cliente">{translate('client')} *</label>
            <input
              type="text"
              id="cliente"
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              className={errors.cliente ? 'input-error' : ''}
            />
            {errors.cliente && <span className="error-message">{errors.cliente}</span>}
          </div>
        </div>

        {selectedRecipeData && (
          <div className="recipe-preview">
            <div className="preview-card">
              {selectedRecipeData.imagen && (
                <img src={selectedRecipeData.imagen} alt={selectedRecipeData.nombre} />
              )}
              <div className="preview-content">
                <h4>{selectedRecipeData.nombre}</h4>
                <p className="recipe-cost">
                  {translate('totalCost')}: 
                  <strong>{recipeCost > 0 ? formatCurrency(recipeCost, config?.moneda || 'USD') : formatCurrency(0, config?.moneda || 'USD')}</strong>
                </p>
                {selectedRecipeData.tiene_obsequio && (
                  <p className="gift-indicator">🎁 {translate('hasGift')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedRecipe && (
          <div className="pricing-section">
            <h4>{translate('calculate')} {translate('finalPrice')}</h4>
            
            <div className="pricing-inputs">
              <div className="input-group">
                <label htmlFor="ganancia">{translate('profitMargin')} (%)</label>
                <input
                  type="number"
                  id="ganancia"
                  name="ganancia"
                  value={formData.ganancia}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  max="200"
                />
              </div>

              <div className="input-group">
                <label htmlFor="gastos">{translate('expenses')} (%)</label>
                <input
                  type="number"
                  id="gastos"
                  name="gastos"
                  value={formData.gastos}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  max="100"
                />
              </div>

              <div className="input-group">
                <label htmlFor="empaque">{translate('packaging')} (%)</label>
                <input
                  type="number"
                  id="empaque"
                  name="empaque"
                  value={formData.empaque}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {calculatedPrice && (
              <div className="price-breakdown">
                <div className="breakdown-row">
                  <span>{translate('totalCost')}:</span>
                  <strong>{formatCurrency(calculatedPrice.basePrice, config.moneda)}</strong>
                </div>
                <div className="breakdown-row">
                  <span>{translate('expenses')} ({formData.gastos + formData.empaque}%):</span>
                  <strong>{formatCurrency(calculatedPrice.totalExpenses, config.moneda)}</strong>
                </div>
                <div className="breakdown-row highlight">
                  <span>{translate('finalPrice')}:</span>
                  <strong>{formatCurrency(calculatedPrice.finalPrice, config.moneda)}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="input-group">
          <label htmlFor="precio_final">{translate('finalPrice')} *</label>
          <div className="price-input-group">
            <input
              type="number"
              id="precio_final"
              name="precio_final"
              value={formData.precio_final}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={errors.precio_final ? 'input-error' : ''}
            />
            <span className="currency-symbol">{config.simbolo_moneda || '$'}</span>
          </div>
          {errors.precio_final && <span className="error-message">{errors.precio_final}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="nota">{translate('notes')}</label>
          <textarea
            id="nota"
            name="nota"
            value={formData.nota}
            onChange={handleChange}
            placeholder={translate('notes')}
          />
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
