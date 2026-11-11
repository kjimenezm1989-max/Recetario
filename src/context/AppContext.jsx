import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { storage } from '../utils/storage'
import { chooseAutomaticBackupFile, createBackup, getAutomaticBackupHandle, getLocalBackup, saveLocalBackup, validateBackup, writeBackupFile } from '../utils/backup'
import { t } from '../utils/i18n'
import { applyTheme } from '../utils/themes'
import { licenseService } from '../utils/license'
import { calculateIngredientCost } from '../utils/unitConversion'
import {
  appendItem,
  updateById,
  removeById,
  replaceByRecipeId,
  createEntityId
} from '../utils/state'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    return storage.getAppConfig() || {
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
    }
  })

  const [materials, setMaterials] = useState(() => storage.getMaterials())
  const [recipes, setRecipes] = useState(() => storage.getRecipes())
  const [recipeMaterials, setRecipeMaterials] = useState(() => storage.getRecipeMaterials())
  const [configCosts, setConfigCosts] = useState(() => storage.getConfigCosts())
  const [quotes, setQuotes] = useState(() => storage.getQuotes())
  const [licenseStatus, setLicenseStatus] = useState(licenseService.getStatus())
  const [autoBackupStatus, setAutoBackupStatus] = useState('disabled')
  const [autoBackupReady, setAutoBackupReady] = useState(false)
  const backupHandleRef = useRef(null)



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

  // Always keep a local backup snapshot to recover data after browser resets or accidental deletion
  useEffect(() => {
    saveLocalBackup({ config, materials, recipes, recipeMaterials, configCosts, quotes })
  }, [config, materials, recipes, recipeMaterials, configCosts, quotes])

  useEffect(() => {
    let active = true
    const restoreOrEnableBackup = async () => {
      try {
        const handle = await getAutomaticBackupHandle()
        if (!active) return
        backupHandleRef.current = handle
        if (!handle) {
          setAutoBackupReady(true)
          return
        }

        const permission = await handle.queryPermission({ mode: 'readwrite' })
        if (!active) return
        if (permission !== 'granted') {
          setAutoBackupStatus('permission')
          setAutoBackupReady(true)
          return
        }

        const file = await handle.getFile()
        const data = validateBackup(JSON.parse(await file.text()))
        const localBackup = getLocalBackup()
        const localIsEmpty = materials.length === 0 && recipes.length === 0 && recipeMaterials.length === 0 && quotes.length === 0
        const localBackupHasData = localBackup && (localBackup.materials.length > 0 || localBackup.recipes.length > 0 || localBackup.recipeMaterials.length > 0 || localBackup.quotes.length > 0)
        const backupHasData = data.materials.length > 0 || data.recipes.length > 0 || data.recipeMaterials.length > 0 || data.quotes.length > 0

        if (localIsEmpty && localBackupHasData) {
          setConfig(localBackup.config)
          setMaterials(localBackup.materials)
          setRecipes(localBackup.recipes)
          setRecipeMaterials(localBackup.recipeMaterials)
          setConfigCosts(localBackup.configCosts)
          setQuotes(localBackup.quotes)
          setAutoBackupStatus('restored')
        } else if (localIsEmpty && backupHasData) {
          setConfig(data.config)
          setMaterials(data.materials)
          setRecipes(data.recipes)
          setRecipeMaterials(data.recipeMaterials)
          setConfigCosts(data.configCosts)
          setQuotes(data.quotes)
          setAutoBackupStatus('restored')
        } else {
          setAutoBackupStatus('active')
        }
      } catch (error) {
        if (active) {
          backupHandleRef.current = null
          setAutoBackupStatus('error')
        }
      } finally {
        if (active) setAutoBackupReady(true)
      }
    }

    restoreOrEnableBackup()
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!autoBackupReady || !backupHandleRef.current) return undefined

    const backup = createBackup({ config, materials, recipes, recipeMaterials, configCosts, quotes })
    const timeout = setTimeout(async () => {
      try {
        await writeBackupFile(backupHandleRef.current, backup)
        setAutoBackupStatus('active')
      } catch (error) {
        setAutoBackupStatus('permission')
      }
    }, 700)

    return () => clearTimeout(timeout)
  }, [autoBackupReady, config, materials, recipes, recipeMaterials, configCosts, quotes])

  // Translation function
  const translate = (key) => t(key, config.idioma)

  // Material operations
  const addMaterial = (material) => {
    const newMaterial = { ...material, id: createEntityId('material') }
    setMaterials(prev => appendItem(prev, newMaterial))
    return newMaterial
  }

  const updateMaterial = (id, material) => {
    setMaterials(prev => updateById(prev, id, item => ({ ...item, ...material })))
  }

  const deleteMaterial = (id) => {
    setMaterials(prev => removeById(prev, id))
    setRecipeMaterials(prev => prev.filter(rm => rm.material_id !== id))
  }

  // Recipe operations
  const addRecipe = (recipe) => {
    const newRecipe = { ...recipe, id: recipe?.id || createEntityId('recipe') }
    setRecipes(prev => appendItem(prev, newRecipe))
    return newRecipe
  }

  const updateRecipe = (id, recipe) => {
    setRecipes(prev => updateById(prev, id, item => ({ ...item, ...recipe })))
  }

  const deleteRecipe = (id) => {
    setRecipes(prev => removeById(prev, id))
    setRecipeMaterials(prev => prev.filter(rm => rm.recipe_id !== id))
  }

  // Recipe Material operations
  const addRecipeMaterial = (recipeMaterial) => {
    const newRecipeMaterial = { ...recipeMaterial, id: createEntityId('recipe-material') }
    setRecipeMaterials(prev => appendItem(prev, newRecipeMaterial))
    return newRecipeMaterial
  }

  const addMultipleRecipeMaterials = (recipeMaterials) => {
    const newRecipeMaterials = recipeMaterials.map(rm => ({
      ...rm,
      id: createEntityId('recipe-material')
    }))
    setRecipeMaterials(prev => [...prev, ...newRecipeMaterials])
    return newRecipeMaterials
  }

  const replaceRecipeMaterials = (recipeId, recipeMaterials) => {
    const newRecipeMaterials = recipeMaterials.map(rm => ({
      ...rm,
      id: createEntityId('recipe-material'),
      recipe_id: recipeId
    }))
    setRecipeMaterials(prev => replaceByRecipeId(prev, recipeId, newRecipeMaterials))
    return newRecipeMaterials
  }

  const deleteRecipeMaterial = (id) => {
    setRecipeMaterials(prev => prev.filter(rm => rm.id !== id))
  }

  const getRecipeMaterialsByRecipeId = (recipeId) => {
    return recipeMaterials.filter(rm => rm.recipe_id === recipeId)
  }

  const refreshRecipeCosts = () => {
    setRecipeMaterials(prev => prev.map(rm => {
      const material = materials.find(m => m.id === rm.material_id)
      if (!material) return rm

      const cantidadPresentacion = parseFloat(material.cantidad_presentacion) || 1
      const presentacionString = `${cantidadPresentacion}${material.presentacion}`
      let newCost = 0

      if (rm.cantidad_valor && rm.unidad_medida) {
        newCost = calculateIngredientCost(
          parseFloat(material.precio),
          presentacionString,
          parseFloat(rm.cantidad_valor),
          rm.unidad_medida
        )
      } else {
        const unitCost = parseFloat(material.precio) / cantidadPresentacion
        const materialCost = parseFloat(rm.cantidad) * unitCost
        newCost = isFinite(materialCost) ? materialCost : 0
      }

      return {
        ...rm,
        costo_ingrediente: newCost
      }
    }))
  }

  // Quote operations
  const addQuote = (quote) => {
    const newQuote = { 
      ...quote, 
      id: createEntityId('quote'), 
      fecha: new Date().toISOString() 
    }
    setQuotes(prev => appendItem(prev, newQuote))
    return newQuote
  }

  const updateQuote = (id, quote) => {
    setQuotes(prev => updateById(prev, id, item => ({ ...item, ...quote })))
  }

  const deleteQuote = (id) => {
    setQuotes(prev => removeById(prev, id))
  }

  const restoreBackup = (backup) => {
    const data = validateBackup(backup)

    setConfig(data.config)
    setMaterials(data.materials)
    setRecipes(data.recipes)
    setRecipeMaterials(data.recipeMaterials)
    setConfigCosts(data.configCosts)
    setQuotes(data.quotes)
    return data
  }

  const enableAutomaticBackup = async () => {
    const backup = createBackup({ config, materials, recipes, recipeMaterials, configCosts, quotes })
    const handle = await chooseAutomaticBackupFile(backup)
    backupHandleRef.current = handle
    setAutoBackupStatus('active')
    setAutoBackupReady(true)
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
    replaceRecipeMaterials,
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
    restoreBackup,
    enableAutomaticBackup,
    autoBackupStatus,

    // License
    licenseStatus,
    activateLicense: async (code) => {
      const result = await licenseService.activateLicense(code)
      if (result.success) {
        setLicenseStatus(licenseService.getStatus())
      }
      return result
    },
    refreshRecipeCosts,
    isPaid: licenseService.isPaid,
    canAddMaterials: () => licenseService.isPaid() || materials.length < 10,
    canAddRecipes: () => licenseService.isPaid() || recipes.length < 2,
    canUploadImages: licenseService.isPaid,
    canCreateQuotes: licenseService.isPaid
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
