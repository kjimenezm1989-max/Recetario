import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../utils/storage'
import { t } from '../utils/i18n'
import { applyTheme } from '../utils/themes'
import { licenseService } from '../utils/license'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [config, setConfig] = useState({
    nombre_negocio: 'Mi Repostería',
    descripcion_negocio: 'Transforma tus ideas en deliciosas creaciones',
    nombre_administrador: '',
    logo: null,
    idioma: 'es',
    moneda: 'USD',
    simbolo_moneda: '$',
    tema: 'classico',
    instagram: '',
    facebook: '',
    whatsapp: ''
  })

  const [materials, setMaterials] = useState([])
  const [recipes, setRecipes] = useState([])
  const [recipeMaterials, setRecipeMaterials] = useState([])
  const [configCosts, setConfigCosts] = useState({ ganancia: 20, gastos: 5, empaque: 3 })
  const [quotes, setQuotes] = useState([])
  const [licenseStatus, setLicenseStatus] = useState(licenseService.getStatus())

  // Load data from localStorage on mount
  useEffect(() => {
    const savedConfig = storage.getAppConfig()
    if (savedConfig) {
      setConfig(savedConfig)
    }
    
    setMaterials(storage.getMaterials())
    setRecipes(storage.getRecipes())
    setRecipeMaterials(storage.getRecipeMaterials())
    setConfigCosts(storage.getConfigCosts())
    setQuotes(storage.getQuotes())
  }, [])

  // Save config to localStorage whenever it changes
  useEffect(() => {
    storage.setAppConfig(config)
  }, [config])

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(config.tema)
  }, [config.tema])

  // Save materials to localStorage whenever they change
  useEffect(() => {
    storage.setMaterials(materials)
  }, [materials])

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    storage.setRecipes(recipes)
  }, [recipes])

  // Save recipe materials to localStorage whenever they change
  useEffect(() => {
    storage.setRecipeMaterials(recipeMaterials)
  }, [recipeMaterials])

  // Save config costs to localStorage whenever they change
  useEffect(() => {
    storage.setConfigCosts(configCosts)
  }, [configCosts])

  // Save quotes to localStorage whenever they change
  useEffect(() => {
    storage.setQuotes(quotes)
  }, [quotes])

  // Translation function
  const translate = (key) => t(key, config.idioma)

  // Material operations
  const addMaterial = (material) => {
    const newMaterial = { ...material, id: Date.now().toString() }
    setMaterials([...materials, newMaterial])
    return newMaterial
  }

  const updateMaterial = (id, material) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, ...material } : m))
  }

  const deleteMaterial = (id) => {
    setMaterials(materials.filter(m => m.id !== id))
    // Also delete recipe materials that use this material
    setRecipeMaterials(recipeMaterials.filter(rm => rm.material_id !== id))
  }

  // Recipe operations
  const addRecipe = (recipe) => {
    const newRecipe = { ...recipe, id: Date.now().toString() }
    setRecipes([...recipes, newRecipe])
    return newRecipe
  }

  const updateRecipe = (id, recipe) => {
    setRecipes(recipes.map(r => r.id === id ? { ...r, ...recipe } : r))
  }

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id))
    // Also delete recipe materials for this recipe
    setRecipeMaterials(recipeMaterials.filter(rm => rm.recipe_id !== id))
  }

  // Recipe Material operations
  const addRecipeMaterial = (recipeMaterial) => {
    const newRecipeMaterial = { ...recipeMaterial, id: Date.now().toString() }
    setRecipeMaterials([...recipeMaterials, newRecipeMaterial])
    return newRecipeMaterial
  }

  const addMultipleRecipeMaterials = (recipeMaterials) => {
    const newRecipeMaterials = recipeMaterials.map(rm => ({
      ...rm,
      id: Date.now().toString() + Math.random()
    }))
    setRecipeMaterials(prev => [...prev, ...newRecipeMaterials])
    return newRecipeMaterials
  }

  const deleteRecipeMaterial = (id) => {
    setRecipeMaterials(recipeMaterials.filter(rm => rm.id !== id))
  }

  const getRecipeMaterialsByRecipeId = (recipeId) => {
    return recipeMaterials.filter(rm => rm.recipe_id === recipeId)
  }

  // Quote operations
  const addQuote = (quote) => {
    const newQuote = { 
      ...quote, 
      id: Date.now().toString(), 
      fecha: new Date().toISOString() 
    }
    setQuotes([...quotes, newQuote])
    return newQuote
  }

  const updateQuote = (id, quote) => {
    setQuotes(quotes.map(q => q.id === id ? { ...q, ...quote } : q))
  }

  const deleteQuote = (id) => {
    setQuotes(quotes.filter(q => q.id !== id))
  }

  const value = {
    // Config
    config,
    setConfig,
    translate,

    // Materials
    materials,
    addMaterial,
    updateMaterial,
    deleteMaterial,

    // Recipes
    recipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,

    // Recipe Materials
    recipeMaterials,
    addRecipeMaterial,
    addMultipleRecipeMaterials,
    deleteRecipeMaterial,
    getRecipeMaterialsByRecipeId,

    // Config Costs
    configCosts,
    setConfigCosts,

    // Quotes
    quotes,
    addQuote,
    updateQuote,
    deleteQuote,

    // License
    licenseStatus,
    activateLicense: (code) => {
      const result = licenseService.activateLicense(code)
      if (result.success) {
        setLicenseStatus(licenseService.getStatus())
      }
      return result
    },
    isPaid: licenseService.isPaid,
    canAddMaterials: () => licenseService.isPaid() || materials.length < 10,
    canAddRecipes: () => licenseService.isPaid() || recipes.length < 2,
    canUploadImages: licenseService.isPaid,
    canCreateQuotes: licenseService.isPaid
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
