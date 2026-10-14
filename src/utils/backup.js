const DATABASE_NAME = 'recetario-backup-settings'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'automatic-backup-file'

export const createBackup = (data) => ({
  format: 'recetario-backup',
  version: 1,
  exportedAt: new Date().toISOString(),
  data
})

export const validateBackup = (backup) => {
  const data = backup?.data
  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

  if (
    backup?.format !== 'recetario-backup' ||
    backup.version !== 1 ||
    !isObject(data) ||
    !isObject(data.config) ||
    !Array.isArray(data.materials) ||
    !Array.isArray(data.recipes) ||
    !Array.isArray(data.recipeMaterials) ||
    !isObject(data.configCosts) ||
    !Array.isArray(data.quotes)
  ) {
    throw new Error('El archivo no es un respaldo válido de Recetario.')
  }

  return data
}

const openHandleDatabase = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, 1)
  request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME)
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})

export const getAutomaticBackupHandle = async () => {
  const database = await openHandleDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).get(HANDLE_KEY)
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } finally {
    database.close()
  }
}

export const saveAutomaticBackupHandle = async (handle) => {
  const database = await openHandleDatabase()
  try {
    await new Promise((resolve, reject) => {
      const request = database.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put(handle, HANDLE_KEY)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } finally {
    database.close()
  }
}

export const writeBackupFile = async (handle, backup) => {
  const permission = await handle.queryPermission({ mode: 'readwrite' })
  if (permission !== 'granted') {
    throw new Error('Chrome necesita permiso para escribir el respaldo. Pulsa “Reanudar respaldo automático”.')
  }

  const writable = await handle.createWritable()
  try {
    await writable.write(JSON.stringify(backup, null, 2))
  } finally {
    await writable.close()
  }
}

export const chooseAutomaticBackupFile = async (backup) => {
  if (!window.showSaveFilePicker) {
    throw new Error('Esta versión de Chrome no permite elegir un archivo para respaldo automático. Usa “Descargar respaldo”.')
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: 'Recetario-respaldo.json',
    types: [{
      description: 'Respaldo de Recetario',
      accept: { 'application/json': ['.json'] }
    }]
  })
  const permission = await handle.requestPermission({ mode: 'readwrite' })
  if (permission !== 'granted') {
    throw new Error('No se concedió permiso para guardar el respaldo.')
  }

  await handle.createWritable().then(async writable => {
    try {
      await writable.write(JSON.stringify(backup, null, 2))
    } finally {
      await writable.close()
    }
  })
  await saveAutomaticBackupHandle(handle)
  return handle
}