const CURRENCIES = {
  COP: { symbol: '$', decimal: ',', thousands: '.', decimals: 0 },
  USD: { symbol: '$', decimal: '.', thousands: ',', decimals: 2 },
  EUR: { symbol: '€', decimal: ',', thousands: '.', decimals: 2 },
  MXN: { symbol: '$', decimal: '.', thousands: ',', decimals: 2 }
}

export const getCurrencyConfig = (currencyCode) => {
  return CURRENCIES[currencyCode] || CURRENCIES.USD
}

export const formatCurrency = (value, currencyCode, symbol = true) => {
  const config = getCurrencyConfig(currencyCode)
  const numValue = parseFloat(value)
  
  if (isNaN(numValue)) return '0'
  
  const parts = numValue.toFixed(config.decimals).split('.')
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Format integer part with thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands)
  
  // Combine parts
  let formatted = decimalPart !== undefined && config.decimals > 0 
    ? `${formattedInteger}${config.decimal}${decimalPart}`
    : formattedInteger
  
  return symbol ? `${config.symbol} ${formatted}` : formatted
}

export const parseCurrency = (value) => {
  // Remove spaces and common currency symbols
  const cleaned = value.trim()
    .replace(/[\$€]/g, '')
    .replace(/[.,]/g, match => match === ',' ? '.' : '')
    .trim()
  
  return parseFloat(cleaned)
}

export const calculateUnitCost = (price, quantity) => {
  if (!price || !quantity || quantity === 0) return 0
  return price / quantity
}

export const getCurrencies = () => Object.keys(CURRENCIES)
