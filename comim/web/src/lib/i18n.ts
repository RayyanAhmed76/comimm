import { useTranslation } from 'react-i18next'

/** A bilingual string — used for pedagogical content and demo data. */
export type L = { en: string; fr: string }
export type Lang = 'en' | 'fr'

export function useLang(): Lang {
  const { i18n } = useTranslation()
  return i18n.language?.startsWith('fr') ? 'fr' : 'en'
}

/** Returns a resolver that picks the current-language variant of an `L`. */
export function useLoc() {
  const lang = useLang()
  return (value: L | string | undefined | null) => {
    if (value == null) return ''
    return typeof value === 'string' ? value : value[lang]
  }
}

const locale = (lang: Lang) => (lang === 'fr' ? 'fr-FR' : 'en-GB')

export function fmtDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function fmtDateTime(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(locale(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m >= 60) return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`
  return `${m} min ${String(s).padStart(2, '0')} s`
}

export function fmtNumber(n: number, lang: Lang) {
  return new Intl.NumberFormat(locale(lang)).format(n)
}
