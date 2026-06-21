/**
 * Sistema de gestión de licencias para Recetario
 * - 15 días de prueba gratis
 * - Licencia pagada con número válido en Licencias.csv
 * - Limitaciones sin licencia válida
 */

const LICENSE_KEY = 'recetario_license'
const INSTALL_DATE_KEY = 'recetario_install_date'
const TRIAL_DAYS = 15
const LICENSE_CSV_URL = `${import.meta.env.BASE_URL || '/'}Licencias.csv`

let cachedLicenseNumbers = null

const loadLicenseNumbers = async () => {
  if (cachedLicenseNumbers) return cachedLicenseNumbers

  try {
    const response = await fetch(LICENSE_CSV_URL)
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo de licencias')
    }

    const text = await response.text()
    const lines = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const numbers = new Set()
    lines.forEach(line => {
      const delimiter = line.includes(';') ? ';' : ','
      const firstValue = line.split(delimiter)[0]?.trim()
      if (/^\d+$/.test(firstValue)) {
        numbers.add(firstValue)
      }
    })

    cachedLicenseNumbers = numbers
    return numbers
  } catch (error) {
    cachedLicenseNumbers = new Set()
    return cachedLicenseNumbers
  }
}

export const licenseService = {
  /**
   * Obtener fecha de instalación (primera apertura)
   */
  getInstallDate: () => {
    let installDate = localStorage.getItem(INSTALL_DATE_KEY)
    if (!installDate) {
      installDate = new Date().toISOString()
      localStorage.setItem(INSTALL_DATE_KEY, installDate)
    }
    return new Date(installDate)
  },

  /**
   * Verificar si la prueba de 15 días sigue activa
   */
  isTrialActive: () => {
    const installDate = licenseService.getInstallDate()
    const today = new Date()
    const daysElapsed = Math.floor((today - installDate) / (1000 * 60 * 60 * 24))
    return daysElapsed < TRIAL_DAYS
  },

  /**
   * Obtener días restantes de prueba
   */
  getTrialDaysRemaining: () => {
    const installDate = licenseService.getInstallDate()
    const today = new Date()
    const daysElapsed = Math.floor((today - installDate) / (1000 * 60 * 60 * 24))
    const daysRemaining = TRIAL_DAYS - daysElapsed
    return Math.max(0, daysRemaining)
  },

  /**
   * Activar licencia con código comparando el primer valor numérico contra Licencias.csv
   */
  activateLicense: async (code) => {
    code = code.trim()

    if (!code || !/^\d+$/.test(code)) {
      return { success: false, message: 'Licencia no válida' }
    }

    const licenseNumbers = await loadLicenseNumbers()
    if (!licenseNumbers.has(code)) {
      return { success: false, message: 'Licencia no válida' }
    }

    const license = {
      type: 'premium',
      name: 'Servicio Premium',
      activatedDate: new Date().toISOString(),
      code
    }

    localStorage.setItem(LICENSE_KEY, JSON.stringify(license))

    return { success: true, message: 'Bienvenido al servicio Premium', license }
  },

  /**
   * Verificar si hay licencia válida
   */
  hasValidLicense: () => {
    const licenseData = localStorage.getItem(LICENSE_KEY)
    if (!licenseData) return false

    try {
      const license = JSON.parse(licenseData)
      
      // Verificar expiración si es aplicable
      if (license.expiryDate && new Date() > new Date(license.expiryDate)) {
        return false
      }

      return true
    } catch (e) {
      return false
    }
  },

  /**
   * Obtener datos de licencia
   */
  getLicenseData: () => {
    try {
      return JSON.parse(localStorage.getItem(LICENSE_KEY))
    } catch (e) {
      return null
    }
  },

  /**
   * Verificar si está en período de prueba o tiene licencia
   */
  isPaid: () => {
    return licenseService.hasValidLicense() || licenseService.isTrialActive()
  },

  /**
   * Obtener estado actual
   */
  getStatus: () => {
    if (licenseService.hasValidLicense()) {
      const license = licenseService.getLicenseData()
      return {
        type: 'licensed',
        message: `Licencia activa: ${license.name}`,
        license
      }
    }

    if (licenseService.isTrialActive()) {
      const daysRemaining = licenseService.getTrialDaysRemaining()
      return {
        type: 'trial',
        message: `Período de prueba: ${daysRemaining} días restantes`,
        daysRemaining
      }
    }

    return {
      type: 'expired',
      message: 'Período de prueba expirado. Requiere licencia de pago'
    }
  },

  /**
   * Revocar licencia (para testing)
   */
  revokeLicense: () => {
    localStorage.removeItem(LICENSE_KEY)
  }
}
