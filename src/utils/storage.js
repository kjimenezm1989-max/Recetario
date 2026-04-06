const STORAGE_KEYS = {
  APP_CONFIG: 'app_config',
  MATERIALS: 'materials',
  RECIPES: 'recipes',
  RECIPE_MATERIALS: 'recipe_materials',
  CONFIG_COSTS: 'config_costs',
  QUOTES: 'quotes'
}

export const storage = {
  // App Config
  getAppConfig: () => {
    const data = localStorage.getItem(STORAGE_KEYS.APP_CONFIG)
    return data ? JSON.parse(data) : null
  },
  setAppConfig: (config) => {
    localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config))
  },

  // Materials
  getMaterials: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MATERIALS)
    return data ? JSON.parse(data) : []
  },
  setMaterials: (materials) => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials))
  },
  addMaterial: (material) => {
    const materials = storage.getMaterials()
    const newMaterial = { ...material, id: Date.now().toString() }
    storage.setMaterials([...materials, newMaterial])
    return newMaterial
  },
  updateMaterial: (id, material) => {
    const materials = storage.getMaterials()
    const index = materials.findIndex(m => m.id === id)
    if (index !== -1) {
      materials[index] = { ...materials[index], ...material }
      storage.setMaterials(materials)
    }
  },
  deleteMaterial: (id) => {
    const materials = storage.getMaterials()
    storage.setMaterials(materials.filter(m => m.id !== id))
  },

  // Recipes
  getRecipes: () => {
    const data = localStorage.getItem(STORAGE_KEYS.RECIPES)
    return data ? JSON.parse(data) : []
  },
  setRecipes: (recipes) => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes))
  },
  addRecipe: (recipe) => {
    const recipes = storage.getRecipes()
    const newRecipe = { ...recipe, id: Date.now().toString() }
    storage.setRecipes([...recipes, newRecipe])
    return newRecipe
  },
  updateRecipe: (id, recipe) => {
    const recipes = storage.getRecipes()
    const index = recipes.findIndex(r => r.id === id)
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...recipe }
      storage.setRecipes(recipes)
    }
  },
  deleteRecipe: (id) => {
    const recipes = storage.getRecipes()
    storage.setRecipes(recipes.filter(r => r.id !== id))
  },

  // Recipe Materials
  getRecipeMaterials: () => {
    const data = localStorage.getItem(STORAGE_KEYS.RECIPE_MATERIALS)
    return data ? JSON.parse(data) : []
  },
  setRecipeMaterials: (recipeMaterials) => {
    localStorage.setItem(STORAGE_KEYS.RECIPE_MATERIALS, JSON.stringify(recipeMaterials))
  },
  addRecipeMaterial: (recipeMaterial) => {
    const materials = storage.getRecipeMaterials()
    const newRecipeMaterial = { ...recipeMaterial, id: Date.now().toString() }
    storage.setRecipeMaterials([...materials, newRecipeMaterial])
    return newRecipeMaterial
  },
  deleteRecipeMaterial: (id) => {
    const materials = storage.getRecipeMaterials()
    storage.setRecipeMaterials(materials.filter(m => m.id !== id))
  },
  getRecipeMaterialsByRecipeId: (recipeId) => {
    const materials = storage.getRecipeMaterials()
    return materials.filter(m => m.recipe_id === recipeId)
  },

  // Config Costs
  getConfigCosts: () => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG_COSTS)
    return data ? JSON.parse(data) : { ganancia: 0, gastos: 0, empaque: 0 }
  },
  setConfigCosts: (config) => {
    localStorage.setItem(STORAGE_KEYS.CONFIG_COSTS, JSON.stringify(config))
  },

  // Quotes
  getQuotes: () => {
    const data = localStorage.getItem(STORAGE_KEYS.QUOTES)
    return data ? JSON.parse(data) : []
  },
  setQuotes: (quotes) => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes))
  },
  addQuote: (quote) => {
    const quotes = storage.getQuotes()
    const newQuote = { ...quote, id: Date.now().toString(), fecha: new Date().toISOString() }
    storage.setQuotes([...quotes, newQuote])
    return newQuote
  },
  updateQuote: (id, quote) => {
    const quotes = storage.getQuotes()
    const index = quotes.findIndex(q => q.id === id)
    if (index !== -1) {
      quotes[index] = { ...quotes[index], ...quote }
      storage.setQuotes(quotes)
    }
  },
  deleteQuote: (id) => {
    const quotes = storage.getQuotes()
    storage.setQuotes(quotes.filter(q => q.id !== id))
  },

  // Clear all
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
