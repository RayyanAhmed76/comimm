import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { fr } from './fr'

const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('comim-lang') : null

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: saved === 'fr' || saved === 'en' ? saved : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('comim-lang', lng)
  document.documentElement.lang = lng
})

document.documentElement.lang = i18n.language

export default i18n
