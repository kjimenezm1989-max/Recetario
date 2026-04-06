/**
 * Calcular el costo total de una receta basado en sus materiales
 * Siempre recalcula usando los precios ACTUALES de los materiales
 * @param {Array} recipeMaterials - Array de materiales de la receta
 * @param {Array} materials - Array de todos los materiales disponibles
 * @returns {number} Costo total
 */
export const calculateRecipeCost = (recipeMaterials, materials) => {
  return recipeMaterials.reduce((total, recipeMaterial) => {
    // Si el ingrediente tiene un costo guardado, usarlo directamente
    if (recipeMaterial.costo_ingrediente !== undefined && recipeMaterial.costo_ingrediente !== null) {
      return total + (parseFloat(recipeMaterial.costo_ingrediente) || 0)
    }
    
    // Fallback: calcular con precios actuales si no hay costo guardado
    const material = materials.find(m => m.id === recipeMaterial.material_id)
    if (material) {
      const cantidadPresentacion = parseFloat(material.cantidad_presentacion) || 1
      const unitCost = parseFloat(material.precio) / cantidadPresentacion
      const materialCost = parseFloat(recipeMaterial.cantidad) * unitCost
      return total + (isFinite(materialCost) ? materialCost : 0)
    }
    
    return total
  }, 0)
}

/**
 * Obtener detalles de ingredientes con costos calculados (siempre usa precios actuales)
 * @param {Array} recipeMaterials - Array de materiales de la receta
 * @param {Array} materials - Array de todos los materiales disponibles
 * @returns {Array} Array con detalles de ingredientes incluido costo
 */
export const getIngredientsWithCosts = (recipeMaterials, materials) => {
  return recipeMaterials.map(recipeMaterial => {
    const material = materials.find(m => m.id === recipeMaterial.material_id)
    if (material) {
      const cantidadPresentacion = parseFloat(material.cantidad_presentacion) || 1
      const unitCost = parseFloat(material.precio) / cantidadPresentacion
      
      // Siempre recalcular con el precio actual del material
      const materialCost = parseFloat(recipeMaterial.cantidad) * unitCost
      
      return {
        ...recipeMaterial,
        material,
        unitCost: isFinite(unitCost) ? unitCost : 0,
        materialCost: isFinite(materialCost) ? materialCost : 0
      }
    }
    return recipeMaterial
  })
}

/**
 * Calcular el precio final basado en ganancia, gastos y empaque
 * @param {number} baseCost - Costo base de la receta
 * @param {number} profitMargin - Porcentaje de ganancia (0-100)
 * @param {number} expenses - Porcentaje de gastos (0-100)
 * @param {number} packaging - Porcentaje de empaque (0-100)
 * @returns {object} Objeto con costo base, gastos totales y precio final
 */
export const calculateFinalPrice = (baseCost, profitMargin = 0, expenses = 0, packaging = 0) => {
  const basePrice = parseFloat(baseCost) || 0
  const profitPercent = parseFloat(profitMargin) || 0
  const expensesPercent = parseFloat(expenses) || 0
  const packagingPercent = parseFloat(packaging) || 0
  
  const totalExpensesPercent = expensesPercent + packagingPercent
  const totalExpenses = basePrice * (totalExpensesPercent / 100)
  const totalWithExpenses = basePrice + totalExpenses
  const finalPrice = totalWithExpenses * (1 + profitPercent / 100)
  
  return {
    basePrice,
    totalExpenses,
    totalWithExpenses,
    finalPrice: Math.round(finalPrice * 100) / 100,
    profitAmount: finalPrice - totalWithExpenses
  }
}

/**
 * Validar si los datos de una receta son válidos
 * @param {object} recipe - Datos de la receta
 * @returns {object} Objeto con validación y mensajes de error
 */
export const validateRecipe = (recipe) => {
  const errors = {}
  
  if (!recipe.nombre || recipe.nombre.trim() === '') {
    errors.nombre = 'El nombre es requerido'
  }
  
  if (!recipe.ingredientes || recipe.ingredientes.length === 0) {
    errors.ingredientes = 'Debe agregar al menos un ingrediente'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validar si los datos de un material son válidos
 * @param {object} material - Datos del material
 * @returns {object} Objeto con validación y mensajes de error
 */
export const validateMaterial = (material) => {
  const errors = {}
  
  if (!material.nombre || material.nombre.trim() === '') {
    errors.nombre = 'El nombre es requerido'
  }
  
  if (!material.precio || material.precio <= 0) {
    errors.precio = 'El precio debe ser mayor a 0'
  }
  
  if (!material.cantidad_presentacion || material.cantidad_presentacion <= 0) {
    errors.cantidad_presentacion = 'La cantidad debe ser mayor a 0'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
