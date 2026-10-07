import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SlidersHorizontal, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/i18n'
import { estimateSeconds, muteStore, setMuted, speak, stopSpeaking, volumeStore } from '@/lib/audio'

/** Play / Replay button for a question, hint or explanation. */
export function SpeakButton({ text, className, dark = false, auto = false }: { text: string; className?: string; dark?: boolean; auto?: boolean }) {
  const { t } = useTranslation()
  const lang = useLang()
  const muted = muteStore.use()
  const [played, setPlayed] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const play = () => {
    setPlayed(true)
    setSpeaking(true)
    const ok = speak(text, lang, { onEnd: () => setSpeaking(false) })
    if (!ok) window.setTimeout(() => setSpeaking(false), estimateSeconds(text) * 1000)
  }

  useEffect(() => {
    if (auto && !muted) play()
    return () => stopSpeaking()
    // play when the text changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, auto])

  return (
    <button
      type="button"
      onClick={() => {
        if (muted) setMuted(false)
        play()
      }}
      title={muted ? t('audio.mutedHint') : played ? t('audio.replay') : t('audio.play')}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition',
        dark ? 'bg-white/10 text-sky-200 ring-1 ring-white/15 hover:bg-white/15' : 'bg-sky-50 text-brand-700 ring-1 ring-sky-200 hover:bg-sky-100',
        speaking && 'animate-pulse',
        className,
      )}
    >
      {muted ? <VolumeX className="h-3.5 w-3.5" /> : played ? <RotateCcw className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {muted ? t('audio.muted') : played ? t('audio.replay') : t('audio.play')}
    </button>
  )
}

/**
 * Narration driven by a timer (the audio track), with speech synthesis on top when not muted.
 * Returns progress 0..1, current char index (for subtitle highlight) and controls.
 */
export function useNarration(text: string) {
  const lang = useLang()
  const muted = muteStore.use()
  const duration = estimateSeconds(text)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [ended, setEnded] = useState(false)
  const [charIndex, setCharIndex] = useState(0)
  const timer = useRef<number | null>(null)
  const boundaryRef = useRef(false)
  const charRef = useRef(0)
  charRef.current = charIndex
  const wasMuted = useRef(muted)

  /** Speaks the narration from the sentence that contains `from` (speech synthesis cannot seek). */
  const voice = (from = 0) => {
    const head = text.slice(0, Math.max(0, from))
    const cut = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '))
    const start = cut < 0 ? 0 : cut + 2
    boundaryRef.current = false
    speak(text.slice(start), lang, {
      onBoundary: (i) => {
        boundaryRef.current = true
        setCharIndex(start + i)
      },
    })
  }

  const stopTimer = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
  }

  const play = (from = 0) => {
    stopTimer()
    setEnded(false)
    setPlaying(true)
    setElapsed(from)
    voice(Math.floor((from / duration) * text.length))
    const start = Date.now() - from * 1000
    timer.current = window.setInterval(() => {
      const e = (Date.now() - start) / 1000
      if (e >= duration) {
        stopTimer()
        setElapsed(duration)
        setPlaying(false)
        setEnded(true)
        setCharIndex(text.length)
        return
      }
      setElapsed(e)
      if (!boundaryRef.current) setCharIndex(Math.floor((e / duration) * text.length))
    }, 120)
  }

  const pause = () => {
    stopTimer()
    stopSpeaking()
    setPlaying(false)
  }
  // Resume where the track was paused (Replay once it has ended)
  const resume = () => play(ended || elapsed >= duration ? 0 : elapsed)

  // auto-play each new segment
  useEffect(() => {
    setCharIndex(0)
    play(0)
    return () => {
      stopTimer()
      stopSpeaking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, lang])

  useEffect(() => {
    if (muted) stopSpeaking()
    // Unmuted while the narration is still running: bring the voice back
    else if (wasMuted.current && playing) voice(charRef.current)
    wasMuted.current = muted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted])

  return { progress: Math.min(1, elapsed / duration), elapsed, duration, playing, ended, charIndex, play: () => play(0), resume, pause }
}

/** Subtitle-style text: the part already narrated is highlighted. */
export function SubtitleText({ text, charIndex }: { text: string; charIndex: number }) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text]
  let pos = 0
  return (
    <p className="mt-4 text-[15px] leading-relaxed">
      {sentences.map((s, i) => {
        const start = pos
        pos += s.length
        const state = charIndex >= pos ? 'done' : charIndex >= start ? 'current' : 'todo'
        return (
          <span
            key={i}
            className={cn(
              'rounded px-0.5 transition-colors',
              state === 'done' && 'text-slate-300',
              state === 'current' && 'bg-sky-400/20 text-white',
              state === 'todo' && 'text-slate-500',
            )}
          >
            {s}
          </span>
        )
      })}
    </p>
  )
}

/** Separate voice / ambience levels (the header button stays the global mute). */
export function VolumeControls() {
  const { t } = useTranslation()
  const volume = volumeStore.use()
  const muted = muteStore.use()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const slider = (key: 'voice' | 'ambience') => (
    <label className="block text-xs font-semibold normal-case tracking-normal text-slate-200">
      <span className="flex justify-between">
        {t(`audio.${key}`)}
        <span className="tabular-nums text-slate-400">{Math.round(volume[key] * 100)} %</span>
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={Math.round(volume[key] * 100)}
        onChange={(e) => volumeStore.set((v) => ({ ...v, [key]: Number(e.target.value) / 100 }))}
        className="mt-1 w-full accent-sky-400"
      />
    </label>
  )
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        title={t('audio.levels')}
        aria-label={t('audio.levels')}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-200 ring-1 ring-white/15 hover:bg-white/15"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 space-y-3 rounded-xl border border-white/15 bg-navy-900 p-3 shadow-xl">
          {slider('voice')}
          {slider('ambience')}
          <button type="button" onClick={() => setMuted(!muted)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-semibold normal-case tracking-normal text-slate-100 hover:bg-white/15">
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? t('audio.unmute') : t('audio.mute')}
          </button>
        </div>
      )}
    </div>
  )
}

/** Visible audio state: playing / paused / muted. */
export function AudioState({ muted, playing, ended = false, className }: { muted: boolean; playing: boolean; ended?: boolean; className?: string }) {
  const { t } = useTranslation()
  const state = muted ? 'muted' : playing ? 'playing' : ended ? 'ended' : 'paused'
  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        state === 'muted' && 'bg-orange-500/20 text-orange-200',
        state === 'playing' && 'bg-emerald-500/20 text-emerald-200',
        (state === 'paused' || state === 'ended') && 'bg-white/10 text-slate-300',
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', state === 'muted' ? 'bg-orange-400' : state === 'playing' ? 'animate-pulse bg-emerald-400' : 'bg-slate-400')} />
      {t(`audio.state.${state}`)}
    </span>
  )
}

export function AudioTrack({ narration, dark = true }: { narration: ReturnType<typeof useNarration>; dark?: boolean }) {
  const { t } = useTranslation()
  const muted = muteStore.use()
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl px-3 py-2.5', dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200')}>
      <button
        type="button"
        onClick={narration.playing ? narration.pause : narration.resume}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5BA3E8] text-white hover:bg-[#4a92d6]"
        aria-label={narration.playing ? t('audio.pause') : narration.ended ? t('audio.replay') : t('audio.play')}
        title={narration.playing ? t('audio.pause') : narration.ended ? t('audio.replay') : t('audio.play')}
      >
        {narration.playing ? <Pause className="h-4 w-4" /> : narration.ended ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label={t('audio.track')} aria-valuenow={Math.round(narration.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-sky-400 transition-[width] duration-150" style={{ width: `${narration.progress * 100}%` }} />
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>
            {fmt(narration.elapsed)} / {fmt(narration.duration)}
          </span>
          <AudioState muted={muted} playing={narration.playing} ended={narration.ended} />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setMuted(!muted)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-200 ring-1 ring-white/15 hover:bg-white/15"
        aria-label={muted ? t('audio.unmute') : t('audio.mute')}
        aria-pressed={muted}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
