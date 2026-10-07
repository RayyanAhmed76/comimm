import { createStore } from '@/lib/store'
import type { Lang } from '@/lib/i18n'

/**
 * Audio for narration, questions, hints and explanations.
 * POC: uses the browser speech synthesis (FR/EN voices). The recorded voice-over
 * prepared by COMIM can replace `speak()` without touching the screens.
 */
export const muteStore = createStore('mute', () => false)

/** Separate levels for the voice and for the ambience / effects (0..1). */
export const volumeStore = createStore('volume', () => ({ voice: 1, ambience: 0.6 }))

/** Notified when the voice starts / stops — the ambience is ducked under it. */
export const voiceListeners = new Set<(speaking: boolean) => void>()
const notify = (speaking: boolean) => voiceListeners.forEach((l) => l(speaking))

export function setMuted(muted: boolean) {
  muteStore.set(muted)
  if (muted) stopSpeaking()
}

export function audioSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking() {
  if (audioSupported()) window.speechSynthesis.cancel()
  notify(false)
}

export function speak(
  text: string,
  lang: Lang,
  opts: { onBoundary?: (charIndex: number) => void; onEnd?: () => void } = {},
) {
  if (!audioSupported() || muteStore.get() || !text) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'fr' ? 'fr-FR' : 'en-GB'
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
  if (voice) u.voice = voice
  u.rate = 1
  u.volume = volumeStore.get().voice
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary?.(e.charIndex)
  u.onstart = () => notify(true)
  u.onend = () => {
    notify(false)
    opts.onEnd?.()
  }
  u.onerror = () => notify(false)
  synth.speak(u)
  return true
}

/** Estimated narration length — drives the audio progress track even when muted. */
export function estimateSeconds(text: string) {
  const words = text.trim().split(/\s+/).length
  return Math.max(3, words / 2.6)
}
