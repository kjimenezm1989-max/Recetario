/**
 * Sistema de gestión de licencias para Recetario
 * - 15 días de prueba gratis
 * - Licencia pagada con código
 * - Limitaciones sin licencia válida
 */

const LICENSE_KEY = 'recetario_license'
const INSTALL_DATE_KEY = 'recetario_install_date'
const TRIAL_DAYS = 15

// Códigos de licencia válidos (administrador los gestiona)
const VALID_LICENSE_CODES = {
  'RECETARIO-2026-PRO': { type: 'lifetime', name: 'Licencia PRO Permanente' },
  'RECETARIO-ANNUAL-2026': { type: 'annual', name: 'Licencia Anual', expiryDate: new Date('2027-04-06') }
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
   * Activar licencia con código
   */
  activateLicense: (code) => {
    code = code.trim().toUpperCase()
    
    if (!VALID_LICENSE_CODES[code]) {
      return { success: false, message: 'Código de licencia inválido' }
    }

    const license = VALID_LICENSE_CODES[code]
    
    // Verificar expiración si es aplicable
    if (license.expiryDate && new Date() > license.expiryDate) {
      return { success: false, message: 'Código de licencia expirado' }
    }

    localStorage.setItem(LICENSE_KEY, JSON.stringify({
      code,
      type: license.type,
      name: license.name,
      activatedDate: new Date().toISOString(),
      expiryDate: license.expiryDate?.toISOString() || null
    }))

    return { success: true, message: 'Licencia activada correctamente', license }
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
