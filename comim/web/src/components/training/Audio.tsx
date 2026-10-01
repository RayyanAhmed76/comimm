import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLang } from '@/lib/i18n'
import { estimateSeconds, muteStore, setMuted, speak, stopSpeaking } from '@/lib/audio'

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
      onClick={muted ? () => setMuted(false) : play}
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

  const stopTimer = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
  }

  const play = (from = 0) => {
    stopTimer()
    setEnded(false)
    setPlaying(true)
    setElapsed(from)
    boundaryRef.current = false
    speak(text, lang, {
      onBoundary: (i) => {
        boundaryRef.current = true
        setCharIndex(i)
      },
    })
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
  }, [muted])

  return { progress: Math.min(1, elapsed / duration), elapsed, duration, playing, ended, charIndex, play: () => play(0), pause }
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

export function AudioTrack({ narration, dark = true }: { narration: ReturnType<typeof useNarration>; dark?: boolean }) {
  const { t } = useTranslation()
  const muted = muteStore.use()
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl px-3 py-2.5', dark ? 'bg-white/5 ring-1 ring-white/10' : 'bg-slate-50 ring-1 ring-slate-200')}>
      <button
        type="button"
        onClick={narration.playing ? narration.pause : narration.play}
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
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{fmt(narration.elapsed)}</span>
          <span>{muted ? t('audio.mutedSubtitles') : fmt(narration.duration)}</span>
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
