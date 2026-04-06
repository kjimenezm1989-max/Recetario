import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { validateRecipe, calculateRecipeCost, getIngredientsWithCosts } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { PRESENTACIONES } from '../utils/presentaciones'
import { calculateIngredientCost, calculateQuantityFraction } from '../utils/unitConversion'
import './RecipeForm.css'

export function RecipeForm({ recipe, onSubmit, onCancel }) {
  const { translate, config, materials, recipeMaterials, getRecipeMaterialsByRecipeId, addRecipeMaterial, deleteRecipeMaterial, canAddRecipes, canUploadImages } = useAppContext()

  const [formData, setFormData] = useState(recipe || {
    nombre: '',
    imagen: null,
    tiene_obsequio: false,
    nombre_obsequio: '',
    imagen_obsequio: null
  })

  const [ingredients, setIngredients] = useState([])
  const [newIngredient, setNewIngredient] = useState({ material_id: '', cantidad_valor: '', unidad_medida: 'ml' })
  const [imageMode, setImageMode] = useState('file')
  const [imageUrl, setImageUrl] = useState('')
  const [giftImageMode, setGiftImageMode] = useState('file')
  const [giftImageUrl, setGiftImageUrl] = useState('')
  const [errors, setErrors] = useState({})
  const [totalCost, setTotalCost] = useState(0)

  // Load existing ingredients if editing
  useEffect(() => {
    if (recipe) {
      const existing = getRecipeMaterialsByRecipeId(recipe.id)
      setIngredients(existing)
    }
  }, [recipe, getRecipeMaterialsByRecipeId])

  // Calculate total cost whenever ingredients change
  useEffect(() => {
    const cost = calculateRecipeCost(ingredients, materials)
    setTotalCost(cost)
  }, [ingredients, materials])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: event.target.result
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

  const handleGiftImageUrlChange = (e) => {
    const url = e.target.value
    setGiftImageUrl(url)
    if (url.trim()) {
      setFormData(prev => ({
        ...prev,
        imagen_obsequio: url.trim()
      }))
    }
  }

  const handleGiftImageModeChange = (mode) => {
    setGiftImageMode(mode)
    setGiftImageUrl('')
    setFormData(prev => ({
      ...prev,
      imagen_obsequio: null
    }))
  }

  const handleAddIngredient = () => {
    if (!newIngredient.material_id || !newIngredient.cantidad_valor || !newIngredient.unidad_medida) {
      alert(translate('errorRequired'))
      return
    }

    const cantidadValor = parseFloat(newIngredient.cantidad_valor)
    if (isNaN(cantidadValor) || cantidadValor <= 0) {
      alert(translate('errorInvalid'))
      return
    }

    // Obtener el material
    const material = materials.find(m => m.id === newIngredient.material_id)
    if (!material) {
      alert('Material no encontrado')
      return
    }

    /**
     * Calcular:
     * 1. El costo del ingrediente basado en la cantidad exacta necesaria
     * 2. La fracción de presentación para cálculos posteriores
     */
    console.log('🔍 DEBUG handleAddIngredient:', {
      material_id: newIngredient.material_id,
      material_nombre: material.nombre,
      material_precio: material.precio,
      material_presentacion: material.presentacion,
      material_cantidad_presentacion: material.cantidad_presentacion,
      cantidadValor,
      unidad_medida: newIngredient.unidad_medida
    })

    // Asegurar que cantidad_presentacion es un número válido
    const cantidadPresentacion = parseFloat(material.cantidad_presentacion) || 1
    const presentacionString = `${cantidadPresentacion}${material.presentacion}`
    
    const ingredientCost = calculateIngredientCost(
      material.precio,
      presentacionString,
      cantidadValor,
      newIngredient.unidad_medida
    )

    console.log('💰 Costo calculado:', ingredientCost)

    const quantityFraction = calculateQuantityFraction(
      cantidadValor,
      newIngredient.unidad_medida,
      presentacionString
    )

    console.log('📊 Fracción de presentación:', quantityFraction)

    const newRecipeIngredient = {
      id: Date.now().toString(),
      recipe_id: recipe?.id || Date.now().toString(),
      material_id: newIngredient.material_id,
      cantidad: quantityFraction,  // Fracción de presentación para cálculos
      cantidad_valor: cantidadValor,
      unidad_medida: newIngredient.unidad_medida,
      costo_ingrediente: ingredientCost  // Costo calculado directamente
    }

    setIngredients([...ingredients, newRecipeIngredient])
    setNewIngredient({ material_id: '', cantidad_valor: '', unidad_medida: 'ml' })
  }

  const handleRemoveIngredient = (id) => {
    if (recipe) {
      deleteRecipeMaterial(id)
    }
    setIngredients(ingredients.filter(ing => ing.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Verificar licencia para agregar nuevas recetas
    if (!recipe && !canAddRecipes()) {
      alert('Límite de 2 recetas alcanzado. Requiere licencia de pago.')
      return
    }

    const validation = validateRecipe({ ...formData, ingredientes: ingredients })
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    const submissionData = {
      ...formData,
      costo_total: totalCost,
      ingredientes: ingredients  // Pasar los ingredientes en los datos a enviar
    }

    onSubmit(submissionData)
  }

  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId)
    return material?.nombre || ''
  }

  const getMaterialUnitCost = (materialId) => {
    const material = materials.find(m => m.id === materialId)
    if (!material) return 0
    return material.precio / material.cantidad_presentacion
  }

  return (
    <div className="recipe-form">
      <h3>{recipe ? translate('editRecipe') : translate('createRecipe')}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section-group">
          <h4>{translate('recipeName')}</h4>
          
          <div className="form-grid">
            <div className="input-group">
              <label htmlFor="nombre">{translate('recipeName')} *</label>
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
              <label>{translate('recipeImage')}</label>
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
                  onChange={(e) => handleImageChange(e, 'imagen')}
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
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="tiene_obsequio"
              name="tiene_obsequio"
              checked={formData.tiene_obsequio}
              onChange={handleChange}
            />
            <label htmlFor="tiene_obsequio">{translate('hasGift')}</label>
          </div>

          {formData.tiene_obsequio && (
            <div className="gift-section">
              <div className="input-group">
                <label htmlFor="nombre_obsequio">{translate('giftName') || 'Nombre del Obsequio'}</label>
                <input
                  type="text"
                  id="nombre_obsequio"
                  name="nombre_obsequio"
                  value={formData.nombre_obsequio}
                  onChange={handleChange}
                  placeholder="ej: Chocolates, Bombones, etc."
                />
              </div>

              <div className="input-group">
                <label>{translate('giftImage')}</label>
                {!canUploadImages() && (
                  <div className="license-notice">
                    ⚠️ Requiere licencia de pago para cargar imágenes
                  </div>
                )}
                <div className="image-mode-tabs">
                  <button
                    type="button"
                    className={`image-mode-btn ${giftImageMode === 'file' ? 'active' : ''}`}
                    onClick={() => handleGiftImageModeChange('file')}
                    disabled={!canUploadImages()}
                  >
                    📤 {translate('uploadFile') || 'Subir archivo'}
                  </button>
                  <button
                    type="button"
                    className={`image-mode-btn ${giftImageMode === 'url' ? 'active' : ''}`}
                    onClick={() => handleGiftImageModeChange('url')}
                    disabled={!canUploadImages()}
                  >
                    🔗 {translate('useUrl') || 'Usar URL'}
                  </button>
                </div>

                {giftImageMode === 'file' && (
                  <input
                    type="file"
                    id="imagen_obsequio"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'imagen_obsequio')}
                    className="file-input"
                    disabled={!canUploadImages()}
                  />
                )}

                {giftImageMode === 'url' && (
                  <input
                    type="text"
                    placeholder={translate('imagePlaceholder') || 'https://ejemplo.com/imagen.jpg'}
                    value={giftImageUrl}
                    onChange={handleGiftImageUrlChange}
                    className="url-input"
                  />
                )}

                {formData.imagen_obsequio && (
                  <div className="image-preview">
                    <img src={formData.imagen_obsequio} alt="gift preview" />
                    <button
                      type="button"
                      className="btn-remove-image"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imagen_obsequio: null }))
                        setGiftImageUrl('')
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="form-section-group">
          <h4>{translate('ingredients')}</h4>
          
          <div className="ingredients-input">
            <select
              value={newIngredient.material_id}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, material_id: e.target.value }))}
              className="form-select"
            >
              <option value="">{translate('selectRecipe')}</option>
              {materials.sort((a, b) => a.nombre.localeCompare(b.nombre)).map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombre} ({material.presentacion})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder={translate('quantity')}
              value={newIngredient.cantidad_valor}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, cantidad_valor: e.target.value }))}
              step="0.01"
              min="0"
              className="form-input"
            />

            <select
              value={newIngredient.unidad_medida}
              onChange={(e) => setNewIngredient(prev => ({ ...prev, unidad_medida: e.target.value }))}
              className="form-select"
            >
              {PRESENTACIONES.map(pres => (
                <option key={pres.value} value={pres.value}>
                  {pres.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddIngredient}
            >
              {translate('addIngredient')}
            </button>
          </div>

          {ingredients.length === 0 && (
            <div className="empty-ingredients">
              {translate('noData')}
            </div>
          )}

          {ingredients.length > 0 && (
            <div className="ingredients-list">
              {ingredients.map(ingredient => {
                const material = materials.find(m => m.id === ingredient.material_id)
                
                // Calcular costo del ingrediente
                let totalIngredientCost = 0
                if (ingredient.costo_ingrediente !== undefined && ingredient.costo_ingrediente !== null) {
                  totalIngredientCost = parseFloat(ingredient.costo_ingrediente) || 0
                } else if (material && ingredient.cantidad) {
                  // Fallback para ingredientes antiguos
                  const costoUnitario = material.precio / material.cantidad_presentacion
                  totalIngredientCost = ingredient.cantidad * costoUnitario
                }
                
                // Preparar valores para mostrar
                const displayCantidad = ingredient.cantidad_valor !== undefined ? ingredient.cantidad_valor : ingredient.cantidad
                const displayUnidad = ingredient.unidad_medida || 'un.'
                
                // Log para debugging
                if (ingredient.costo_ingrediente !== undefined) {
                  console.log(`${material?.nombre}: ${displayCantidad}${displayUnidad} = $${totalIngredientCost}`)
                }
                
                return (
                  <div key={ingredient.id} className="ingredient-item">
                    <div className="ingredient-info">
                      <div className="ingredient-details">
                        <span className="ingredient-name">{getMaterialName(ingredient.material_id)}</span>
                        <span className="ingredient-qty">
                          {typeof displayCantidad === 'number' ? displayCantidad.toFixed(2) : displayCantidad} {displayUnidad}
                        </span>
                        {ingredient.cantidad_valor !== undefined && material && (
                          <span className="ingredient-presentation">
                            (≈ {ingredient.cantidad.toFixed(3)} de {material?.presentacion || ''})
                          </span>
                        )}
                      </div>
                      <div className="ingredient-cost-breakdown">
                        <div className="cost-item">
                          <span className="cost-label">Costo:</span>
                          <span className="cost-value">
                            {totalIngredientCost > 0 
                              ? formatCurrency(totalIngredientCost, config?.moneda || 'USD')
                              : formatCurrency(0, config?.moneda || 'USD')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-small btn-danger"
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                    >
                      {translate('delete')}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {errors.ingredientes && (
            <span className="error-message">{errors.ingredientes}</span>
          )}
        </div>

        <div className="total-cost-section">
          <div className="total-cost-box">
            <span className="label">{translate('totalCost')}:</span>
            <span className="value">{formatCurrency(totalCost, config.moneda)}</span>
          </div>
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
