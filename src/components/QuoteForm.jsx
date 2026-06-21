import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { calculateRecipeCost, calculateFinalPrice } from '../utils/calculations'
import { calculateIngredientCost } from '../utils/unitConversion'
import './QuoteForm.css'

export function QuoteForm({ quote, onSubmit, onCancel }) {
  const { translate, config, recipes, materials, configCosts, getRecipeMaterialsByRecipeId, canCreateQuotes } = useAppContext()

  const [formData, setFormData] = useState(quote ? {
    recipe_ids: quote.recipe_ids || (quote.recipe_id ? [quote.recipe_id] : []),
    extraMaterials: quote.extraMaterials || [],
    cliente: quote.cliente || '',
    ganancia: quote.ganancia ?? (configCosts?.ganancia || 20),
    gastos: quote.gastos ?? (configCosts?.gastos || 5),
    empaque: quote.empaque ?? (configCosts?.empaque || 3),
    precio_final: quote.precio_final || '',
    nota: quote.nota || ''
  } : {
    recipe_ids: [],
    extraMaterials: [],
    cliente: '',
    ganancia: configCosts?.ganancia || 20,
    gastos: configCosts?.gastos || 5,
    empaque: configCosts?.empaque || 3,
    precio_final: '',
    nota: ''
  })

  const [recipeSearch, setRecipeSearch] = useState('')
  const [showRecipeList, setShowRecipeList] = useState(false)
  const [selectedRecipes, setSelectedRecipes] = useState(quote?.recipe_ids || (quote?.recipe_id ? [quote.recipe_id] : []))
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [materialQuantity, setMaterialQuantity] = useState('')
  const [extraMaterials, setExtraMaterials] = useState(quote?.extraMaterials || [])
  const [recipeCost, setRecipeCost] = useState(0)
  const [extraMaterialsCost, setExtraMaterialsCost] = useState(0)
  const [calculatedPrice, setCalculatedPrice] = useState(null)
  const [errors, setErrors] = useState({})

  const getFilteredRecipes = () => {
    if (!recipeSearch.trim()) return [...recipes].sort((a, b) => a.nombre.localeCompare(b.nombre))
    const search = recipeSearch.toLowerCase()
    return recipes
      .filter(recipe => recipe.nombre.toLowerCase().includes(search))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  const selectedRecipeItems = selectedRecipes
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean)

  const calculateSelectedRecipeCost = () => {
    return selectedRecipeItems.reduce((total, recipe) => {
      const recipeItems = getRecipeMaterialsByRecipeId(recipe.id)
      return total + calculateRecipeCost(recipeItems, materials)
    }, 0)
  }

  const calculateExtraMaterialsTotal = () => {
    return extraMaterials.reduce((total, material) => total + (parseFloat(material.costo) || 0), 0)
  }

  useEffect(() => {
    const cost = calculateSelectedRecipeCost()
    const extras = calculateExtraMaterialsTotal()
    const baseCost = cost + extras

    setRecipeCost(cost)
    setExtraMaterialsCost(extras)

    const calculation = calculateFinalPrice(
      baseCost,
      formData.ganancia,
      formData.gastos,
      formData.empaque
    )

    setCalculatedPrice(calculation)
    setFormData(prev => ({
      ...prev,
      precio_final: calculation.finalPrice
    }))
  }, [selectedRecipes, extraMaterials, formData.ganancia, formData.gastos, formData.empaque, materials, getRecipeMaterialsByRecipeId])

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

  const handleRecipeSelect = (recipeId, recipeName) => {
    if (selectedRecipes.includes(recipeId)) {
      setRecipeSearch('')
      setShowRecipeList(false)
      return
    }

    if (selectedRecipes.length >= 3) {
      setErrors(prev => ({ ...prev, recipe_ids: 'Máximo 3 recetas por cotización' }))
      setRecipeSearch('')
      setShowRecipeList(false)
      return
    }

    setSelectedRecipes(prev => [...prev, recipeId])
    setFormData(prev => ({ ...prev, recipe_ids: [...prev.recipe_ids, recipeId] }))
    setRecipeSearch('')
    setShowRecipeList(false)
    setErrors(prev => ({ ...prev, recipe_ids: '' }))
  }

  const handleRemoveRecipe = (recipeId) => {
    setSelectedRecipes(prev => prev.filter(id => id !== recipeId))
    setFormData(prev => ({ ...prev, recipe_ids: prev.recipe_ids.filter(id => id !== recipeId) }))
  }

  const handleAddMaterial = () => {
    const material = materials.find(m => m.id === selectedMaterial)
    const quantity = parseFloat(materialQuantity)

    if (!material || !quantity || quantity <= 0) {
      setErrors(prev => ({ ...prev, extraMaterials: 'Selecciona material y cantidad válida' }))
      return
    }

    const presentacionString = `${parseFloat(material.cantidad_presentacion) || 1}${material.presentacion}`
    const cost = calculateIngredientCost(
      parseFloat(material.precio),
      presentacionString,
      quantity,
      material.presentacion
    )

    const newMaterial = {
      id: Date.now().toString(),
      material_id: material.id,
      nombre: material.nombre,
      cantidad: quantity,
      unidad: material.presentacion,
      costo: Math.round(cost * 100) / 100
    }

    setExtraMaterials(prev => [...prev, newMaterial])
    setFormData(prev => ({ ...prev, extraMaterials: [...prev.extraMaterials, newMaterial] }))
    setSelectedMaterial('')
    setMaterialQuantity('')
    setErrors(prev => ({ ...prev, extraMaterials: '' }))
  }

  const handleRemoveExtraMaterial = (id) => {
    setExtraMaterials(prev => prev.filter(item => item.id !== id))
    setFormData(prev => ({ ...prev, extraMaterials: prev.extraMaterials.filter(item => item.id !== id) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!canCreateQuotes()) {
      alert('Las cotizaciones requieren una licencia de pago.')
      return
    }

    const newErrors = {}
    if (!formData.recipe_ids || formData.recipe_ids.length === 0) newErrors.recipe_ids = translate('errorRequired')
    if (!formData.cliente.trim()) newErrors.cliente = translate('errorRequired')
    if (!formData.precio_final || formData.precio_final <= 0) {
      newErrors.precio_final = translate('errorRequired')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const submissionData = {
      recipe_ids: formData.recipe_ids,
      extraMaterials: formData.extraMaterials,
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
      recipe_ids: [],
      extraMaterials: [],
      cliente: '',
      ganancia: configCosts?.ganancia || 20,
      gastos: configCosts?.gastos || 5,
      empaque: configCosts?.empaque || 3,
      precio_final: '',
      nota: ''
    })
    setSelectedRecipes([])
    setExtraMaterials([])
    setRecipeSearch('')
    setRecipeCost(0)
    setExtraMaterialsCost(0)
    setCalculatedPrice(null)
  }

  const selectedRecipeNames = selectedRecipeItems.map(recipe => recipe.nombre || 'Sin nombre')
  const selectedMaterialsLabel = extraMaterials.map(item => `${item.nombre} (${item.cantidad} ${item.unidad})`).join(', ')

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
                className={errors.recipe_ids ? 'input-error' : ''}
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
            {errors.recipe_ids && <span className="error-message">{errors.recipe_ids}</span>}
            <small className="helper-text">Puedes agregar hasta 3 recetas</small>
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

        {selectedRecipeItems.length > 0 && (
          <div className="selected-recipes">
            <h4>Recetas seleccionadas</h4>
            <div className="chip-list">
              {selectedRecipeItems.map(recipe => (
                <div key={recipe.id} className="chip">
                  <span>{recipe.nombre}</span>
                  <button type="button" onClick={() => handleRemoveRecipe(recipe.id)}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="extra-materials-section">
          <h4>Materiales adicionales</h4>
          <div className="materials-row">
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className={errors.extraMaterials ? 'input-error' : ''}
            >
              <option value="">Selecciona un material</option>
              {materials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombre} - {formatCurrency(material.precio, config.moneda)} / {material.cantidad_presentacion}{material.presentacion}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Cantidad"
              value={materialQuantity}
              onChange={(e) => setMaterialQuantity(e.target.value)}
              min="0"
              step="0.01"
            />
            <button type="button" className="btn btn-secondary" onClick={handleAddMaterial}>
              Agregar material
            </button>
          </div>
          {errors.extraMaterials && <span className="error-message">{errors.extraMaterials}</span>}
          {extraMaterials.length > 0 && (
            <div className="materials-table">
              <div className="materials-row header">
                <span>Material</span>
                <span>Cantidad</span>
                <span>Costo</span>
                <span>Acción</span>
              </div>
              {extraMaterials.map(item => (
                <div key={item.id} className="materials-row">
                  <span>{item.nombre}</span>
                  <span>{item.cantidad} {item.unidad}</span>
                  <span>{formatCurrency(item.costo, config.moneda)}</span>
                  <button type="button" className="btn btn-danger btn-small" onClick={() => handleRemoveExtraMaterial(item.id)}>
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pricing-section">
          <h4>{translate('calculate')} {translate('finalPrice')}</h4>
          <div className="cost-summary">
            <div className="cost-item">
              <span>{translate('recipeCost')}:</span>
              <strong>{formatCurrency(recipeCost, config.moneda)}</strong>
            </div>
            <div className="cost-item">
              <span>Materiales adicionales:</span>
              <strong>{formatCurrency(extraMaterialsCost, config.moneda)}</strong>
            </div>
            <div className="cost-item">
              <span>{translate('subtotal')}:</span>
              <strong>{formatCurrency(recipeCost + extraMaterialsCost, config.moneda)}</strong>
            </div>
          </div>

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
