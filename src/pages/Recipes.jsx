import React, { useState, useEffect } from 'react'
import { useAppContext } from '../context/AppContext'
import { calculateRecipeCost } from '../utils/calculations'
import { formatCurrency } from '../utils/currency'
import { RecipeForm } from '../components/RecipeForm'
import './Recipes.css'

export function Recipes() {
  const { translate, config, recipes, recipeMaterials, materials, addRecipe, updateRecipe, deleteRecipe, addMultipleRecipeMaterials, deleteRecipeMaterial, canAddRecipes } = useAppContext()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Keyboard shortcut: Alt+R to add recipe
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'r') {
        e.preventDefault()
        setEditingId(null)
        setShowForm(!showForm)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showForm])

  const filteredRecipes = recipes
    .filter(recipe =>
      recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const handleAddRecipe = (recipeData) => {
    // Extraer ingredientes del objeto
    const { ingredientes, ...recipeInfo } = recipeData
    
    // Guardar la receta (esto genera el ID)
    const savedRecipe = addRecipe(recipeInfo)
    
    // Guardar los ingredientes con el ID de la receta creada
    if (ingredientes && ingredientes.length > 0) {
      const ingredientesConRecipeId = ingredientes.map(ing => ({
        ...ing,
        recipe_id: savedRecipe.id
      }))
      addMultipleRecipeMaterials(ingredientesConRecipeId)
    }
    
    setShowForm(false)
  }

  const handleUpdateRecipe = (recipeData) => {
    // Extraer ingredientes del objeto
    const { ingredientes, ...recipeInfo } = recipeData
    
    // Actualizar la receta
    updateRecipe(editingId, recipeInfo)
    
    // Eliminar ingredientes antiguos
    const oldIngredients = recipeMaterials.filter(rm => rm.recipe_id === editingId)
    oldIngredients.forEach(ing => {
      deleteRecipeMaterial(ing.id)
    })
    
    // Guardar los nuevos ingredientes
    if (ingredientes && ingredientes.length > 0) {
      const ingredientesConRecipeId = ingredientes.map(ing => ({
        ...ing,
        recipe_id: editingId
      }))
      addMultipleRecipeMaterials(ingredientesConRecipeId)
    }
    
    setEditingId(null)
  }

  const handleEditClick = (recipe) => {
    setEditingId(recipe.id)
    setShowForm(true)
  }

  const handleDeleteClick = (id) => {
    if (confirm(translate('confirm'))) {
      deleteRecipe(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const editingRecipe = recipes.find(r => r.id === editingId)

  const getRecipeCost = (recipeId) => {
    const recipeMats = recipeMaterials.filter(rm => rm.recipe_id === recipeId)
    return calculateRecipeCost(recipeMats, materials)
  }

  return (
    <div className="recipes-container">
      <div className="section-header">
        <h2>{translate('recipes')}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!canAddRecipes() && !editingId && (
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
            disabled={!canAddRecipes() && !editingId}
            title="Alt+R para agregar receta"
          >
            {translate('add')} {translate('recipes')}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-section">
          <RecipeForm
            recipe={editingRecipe}
            onSubmit={editingId ? handleUpdateRecipe : handleAddRecipe}
            onCancel={handleCloseForm}
          />
        </div>
      )}

      {filteredRecipes.length > 0 && (
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

      {filteredRecipes.length === 0 ? (
        <div className="empty-state">
          <p>🍰</p>
          <p>{translate('noData')}</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => {
            const recipeMats = recipeMaterials.filter(rm => rm.recipe_id === recipe.id)
            const totalCost = calculateRecipeCost(recipeMats, materials)

            return (
              <div key={recipe.id} className="recipe-card">
                {recipe.imagen && (
                  <img src={recipe.imagen} alt={recipe.nombre} className="recipe-image" />
                )}
                <div className="recipe-content">
                  <h3>{recipe.nombre}</h3>
                  <div className="recipe-details">
                    <div className="detail-row">
                      <span className="label">{translate('ingredients')}:</span>
                      <span className="value">{recipeMats.length}</span>
                    </div>
                    {recipe.tiene_obsequio && (
                      <div className="detail-row">
                        <span className="label">{translate('hasGift')}:</span>
                        <span className="value">✓</span>
                      </div>
                    )}
                    <div className="detail-row highlight">
                      <span className="label">{translate('totalCost')}:</span>
                      <span className="value">{formatCurrency(totalCost, config.moneda)}</span>
                    </div>
                  </div>
                </div>
                <div className="recipe-actions">
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => handleEditClick(recipe)}
                    title="Clickea para editar esta receta"
                  >
                    {translate('edit')}
                  </button>
                  <button
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteClick(recipe.id)}
                    title="Clickea para eliminar esta receta"
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
