import type { Lang } from '@/lib/i18n'

/**
 * School data (tracks, class names) is stored once and shown in the language of the UI,
 * so that the French interface does not mix English labels.
 */
const TRACK_FR: Record<string, string> = {
  Mechanics: 'Mécanique',
  'Marine Mechanics': 'Mécanique marine',
  'Deck Officer': 'Officier pont',
  Electrotechnics: 'Électrotechnique',
  Boilermaking: 'Chaudronnerie',
}

export function trackLabel(track: string, lang: Lang) {
  return lang === 'fr' ? (TRACK_FR[track] ?? track) : track
}

/** "2A — Marine Mechanics" → "2A — Mécanique marine" */
export function classLabel(name: string, lang: Lang) {
  if (lang !== 'fr') return name
  const [code, rest] = name.split(' — ')
  return rest ? `${code} — ${TRACK_FR[rest] ?? rest}` : name
}

/** "2A — Marine Mechanics" → "2A" */
export const classCode = (name: string) => name.split(' ')[0]
