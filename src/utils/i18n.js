import es from '../translations/es.json'
import en from '../translations/en.json'
import pt from '../translations/pt.json'

const translations = {
  es,
  en,
  pt
}

export const getTranslation = (lang) => translations[lang] || translations.es

export const t = (key, lang = 'es') => {
  const translation = getTranslation(lang)
  return translation[key] || key
}
