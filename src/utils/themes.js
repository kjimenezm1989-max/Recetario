export const THEMES = {
  classico: {
    id: 'classico',
    name: 'Clásico Pastel',
    colors: {
      chocolate: '#4A2C2A',
      rosa_pastel: '#F5B7C5',
      crema: '#FFF4E6',
      verde_menta: '#CFE8D5',
      beige: '#F0E3D8'
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Pastel',
    colors: {
      chocolate: '#C97963',
      rosa_pastel: '#F5A9B8',
      crema: '#FFF9E6',
      verde_menta: '#FFD4A3',
      beige: '#FFE8D6'
    }
  },
  botanical: {
    id: 'botanical',
    name: 'Botanical',
    colors: {
      chocolate: '#6B8E6F',
      rosa_pastel: '#D4A5D4',
      crema: '#F5F9F0',
      verde_menta: '#A8D8BA',
      beige: '#E8F0E5'
    }
  },
  berry: {
    id: 'berry',
    name: 'Berry Sweet',
    colors: {
      chocolate: '#9B6B7F',
      rosa_pastel: '#E8A8C8',
      crema: '#FFF9F5',
      verde_menta: '#D4B8E8',
      beige: '#F0E8F5'
    }
  }
}

export const getTheme = (themeId = 'classico') => {
  return THEMES[themeId] || THEMES.classico
}

export const getAllThemes = () => {
  return Object.values(THEMES)
}

export const applyTheme = (themeId) => {
  const theme = getTheme(themeId)
  const root = document.documentElement
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = `--${key.replace(/_/g, '-')}`
    root.style.setProperty(cssVar, value)
  })
}
