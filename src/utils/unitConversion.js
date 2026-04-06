/**
 * Mapeo de unidades y sus factores de conversión
 * Todas las conversiones son a unidades base estándar
 */
const UNIT_CONVERSIONS = {
  // Peso
  'kg': 1000,        // 1 kg = 1000 g
  'g': 1,            // Base para peso
  'mg': 0.001,       // 1 mg = 0.001 g

  // Volumen
  'L': 1000,         // 1 L = 1000 ml
  'ml': 1,           // Base para volumen
  'cc': 1,           // 1 cc = 1 ml

  // Unidades contables (sin conversión)
  'unidad': 1,
  'docena': 12,      // 1 docena = 12 unidades
  'paquete': 1,
  'caja': 1,
  'botella': 1,
  'tubo': 1,
  'barra': 1,
  'lata': 1,
  'frasco': 1,
  'bolsa': 1,
  'rollo': 1,
  'metro': 1
}

const UNIT_CATEGORIES = {
  peso: ['kg', 'g', 'mg'],
  volumen: ['L', 'ml', 'cc'],
  contable: ['unidad', 'docena', 'paquete', 'caja', 'botella', 'tubo', 'barra', 'lata', 'frasco', 'bolsa', 'rollo', 'metro']
}

/**
 * Obtiene la categoría de una unidad
 * @param {string} unit - La unidad a categorizar
 * @returns {string|null} - La categoría o null si no existe
 */
export const getUnitCategory = (unit) => {
  for (const [category, units] of Object.entries(UNIT_CATEGORIES)) {
    if (units.includes(unit)) {
      return category
    }
  }
  return null
}

/**
 * Convierte desde una unidad a otra
 * @param {number} valor - Valor a convertir
 * @param {string} unidadOrigen - Unidad origen
 * @param {string} unidadDestino - Unidad destino
 * @returns {number} - Valor convertido o valor original si no es posible la conversión
 */
export const convertUnit = (valor, unidadOrigen, unidadDestino) => {
  if (valor <= 0) return 0
  if (unidadOrigen === unidadDestino) return valor

  // Validar que las unidades existan
  if (!UNIT_CONVERSIONS[unidadOrigen] || !UNIT_CONVERSIONS[unidadDestino]) {
    return valor
  }

  // Validar que sean del mismo tipo (peso, volumen, contable)
  const categoriaOrigen = getUnitCategory(unidadOrigen)
  const categoriaDestino = getUnitCategory(unidadDestino)

  if (categoriaOrigen !== categoriaDestino) {
    // No se puede convertir entre categorías diferentes
    console.warn(`No se puede convertir entre ${categoriaOrigen} y ${categoriaDestino}`)
    return valor
  }

  // Conversión: valor en unidad origen × factor origen = base
  // base ÷ factor destino = valor en unidad destino
  const valueInBase = valor * UNIT_CONVERSIONS[unidadOrigen]
  const valueInDestination = valueInBase / UNIT_CONVERSIONS[unidadDestino]

  return valueInDestination
}

/**
 * Extrae número y unidad de una cadena como "1 L", "900ml", "1kg"
 * @param {string} presentacion - La presentación a parsear
 * @returns {{numero: number, unidad: string}|null} - Objeto con número y unidad o null
 */
export const parsePresentacion = (presentacion) => {
  if (!presentacion || presentacion === '') return null
  
  const match = presentacion.trim().match(/^([\d.]+)\s*([a-zA-Z]+)$/)
  if (!match) return null

  const numero = parseFloat(match[1])
  
  // Validar que el número sea válido e infinito
  if (isNaN(numero) || !isFinite(numero) || numero <= 0) return null

  return {
    numero,
    unidad: match[2]
  }
}

/**
 * Calcula el costo de una cantidad específica basado en precio y presentación
 * @param {number} precio - Precio del material
 * @param {string} presentacionMaterial - Presentación del material (ej: "1L", "900ml")
 * @param {number} cantidadNecesaria - Cantidad necesaria
 * @param {string} unidadNecesaria - Unidad de la cantidad necesaria
 * @returns {number} - Costo calculado
 */
export const calculateIngredientCost = (precio, presentacionMaterial, cantidadNecesaria, unidadNecesaria) => {
  // Validar inputs
  console.log('🧮 calculateIngredientCost INPUT:', {
    precio,
    presentacionMaterial,
    cantidadNecesaria,
    unidadNecesaria
  })

  if (!precio || precio <= 0) {
    console.log('❌ Precio inválido:', precio)
    return 0
  }
  if (!presentacionMaterial || presentacionMaterial === '') {
    console.log('❌ Presentación inválida:', presentacionMaterial)
    return 0
  }
  if (!cantidadNecesaria || cantidadNecesaria <= 0) {
    console.log('❌ Cantidad inválida:', cantidadNecesaria)
    return 0
  }
  if (!unidadNecesaria || unidadNecesaria === '') {
    console.log('❌ Unidad inválida:', unidadNecesaria)
    return 0
  }

  const parsedPresentacion = parsePresentacion(presentacionMaterial)
  console.log('📦 Presentación parseada:', parsedPresentacion)
  
  if (!parsedPresentacion) {
    console.log('❌ No se pudo parsear presentación:', presentacionMaterial)
    return 0
  }

  const { numero: numPresentacion, unidad: unidadPresentacion } = parsedPresentacion

  // Convertir cantidad necesaria a la misma unidad de la presentación
  let cantidadEnUnidadPresentacion = convertUnit(
    cantidadNecesaria,
    unidadNecesaria,
    unidadPresentacion
  )

  console.log('🔄 Conversión de unidades:', {
    de: `${cantidadNecesaria}${unidadNecesaria}`,
    a: `${cantidadEnUnidadPresentacion}${unidadPresentacion}`
  })

  // Si la conversión no fue posible (unidades no compatibles), retornar 0
  if (cantidadEnUnidadPresentacion === cantidadNecesaria && unidadNecesaria !== unidadPresentacion) {
    console.log('❌ Unidades no compatibles')
    return 0
  }

  // Validar que numPresentacion sea válido
  if (!isFinite(numPresentacion) || numPresentacion <= 0) {
    console.log('❌ Número de presentación inválido:', numPresentacion)
    return 0
  }

  // Calcular el costo por unidad de la presentación
  const costoUnitario = precio / numPresentacion
  console.log('💵 Costo unitario:', `${precio} / ${numPresentacion} = ${costoUnitario}`)

  // Calcular el costo total
  const costeTotal = costoUnitario * cantidadEnUnidadPresentacion
  console.log('✅ Costo total:', costeTotal)
  
  return isFinite(costeTotal) ? costeTotal : 0
}

/**
 * Calcula la cantidad en fracciones de presentación
 * @param {number} cantidadNecesaria - Cantidad necesaria
 * @param {string} unidadNecesaria - Unidad de la cantidad necesaria
 * @param {string} presentacionMaterial - Presentación del material
 * @returns {number} - Cantidad en fracciones de presentación
 */
export const calculateQuantityFraction = (cantidadNecesaria, unidadNecesaria, presentacionMaterial) => {
  const parsedPresentacion = parsePresentacion(presentacionMaterial)
  if (!parsedPresentacion) return 0

  const { numero: numPresentacion, unidad: unidadPresentacion } = parsedPresentacion

  // Convertir cantidad necesaria a la misma unidad de la presentación
  const cantidadEnUnidadPresentacion = convertUnit(
    cantidadNecesaria,
    unidadNecesaria,
    unidadPresentacion
  )

  // Retornar la fracción, validando que sea un número finito
  const fraccion = cantidadEnUnidadPresentacion / numPresentacion
  return isFinite(fraccion) && fraccion > 0 ? fraccion : 0
}
