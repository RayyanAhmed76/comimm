import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Gamepad2, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { VrStatusBar } from '@/pages/vr/VrChrome'
import { useAuth } from '@/context/AuthContext'
import { vrOnboardedStore } from '@/data/stores'
import { cn } from '@/lib/cn'

type Gesture = 'look' | 'point' | 'pinch' | 'grab' | 'palm'

/** Animated hand — one per onboarding step. */
function HandAnim({ gesture }: { gesture: Gesture }) {
  return (
    <svg viewBox="0 0 200 160" className="mx-auto h-40 w-52" aria-hidden>
      <style>{`
        @keyframes pinch { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(28deg) } }
        @keyframes thumb { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(-30deg) } }
        @keyframes grab { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(0.45) } }
        @keyframes point { 0%,100% { transform: translateX(0) } 50% { transform: translateX(14px) } }
        @keyframes look { 0%,100% { transform: translateX(-18px) } 50% { transform: translateX(18px) } }
        @keyframes palm { 0%,100% { transform: rotate(0deg) } 50% { transform: rotate(-180deg) } }
        .idx { transform-origin: 108px 78px; animation: ${gesture === 'pinch' ? 'pinch 1.6s ease-in-out infinite' : 'none'} }
        .thb { transform-origin: 80px 96px; animation: ${gesture === 'pinch' ? 'thumb 1.6s ease-in-out infinite' : 'none'} }
        .fing { transform-origin: 100px 82px; animation: ${gesture === 'grab' ? 'grab 1.6s ease-in-out infinite' : 'none'} }
        .hand { transform-origin: 100px 100px; animation: ${gesture === 'point' ? 'point 1.6s ease-in-out infinite' : gesture === 'look' ? 'look 2.4s ease-in-out infinite' : gesture === 'palm' ? 'palm 2.4s ease-in-out infinite' : 'none'} }
      `}</style>
      <g className="hand" fill="#fcd7b6" stroke="#0e1e38" strokeWidth="3" strokeLinejoin="round">
        <rect x="76" y="82" width="56" height="56" rx="18" />
        <g className="fing">
          <rect className="idx" x="100" y="22" width="14" height="62" rx="7" />
          <rect x="116" y="30" width="13" height="54" rx="6.5" />
          <rect x="84" y="28" width="13" height="56" rx="6.5" />
        </g>
        <rect className="thb" x="56" y="84" width="34" height="14" rx="7" />
      </g>
      {gesture === 'pinch' && <circle cx="98" cy="40" r="6" fill="#38bdf8"><animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" /></circle>}
      {gesture === 'look' && <text x="100" y="155" textAnchor="middle" fontSize="12" fill="#7dd3fc">⟵ ⟶</text>}
    </svg>
  )
}

/** Mini practice: hold the target (≈ pinch) to continue. */
function PinchTarget({ label, onDone }: { label: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0)
  const timer = useRef<number | null>(null)
  const start = () => {
    const t0 = Date.now()
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 700)
      setProgress(p)
      if (p >= 1) {
        stop()
        onDone()
      }
    }, 30)
  }
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current)
    timer.current = null
    setProgress((p) => (p >= 1 ? 1 : 0))
  }
  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onKeyDown={(e) => e.key === 'Enter' && onDone()}
      className="relative mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-sky-400 bg-sky-400/10 text-xs font-bold text-sky-200 select-none"
    >
      <span className="absolute inset-0 rounded-full bg-sky-400/40" style={{ transform: `scale(${progress})`, transition: 'transform 60ms' }} />
      <span className="relative px-1 text-center leading-tight">{label}</span>
    </button>
  )
}

function VrSignIn() {
  const { t } = useTranslation()
  const { loginCode } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)
  return (
    <div className="mt-10 w-full rounded-2xl border border-white/10 bg-navy-900/70 p-8">
      <QrCode className="mx-auto h-24 w-24 text-white" />
      <h2 className="mt-4 text-xl font-bold">{t('vr.signInTitle')}</h2>
      <p className="mt-2 text-sm text-slate-300">{t('vr.signInHint')}</p>
      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (!loginCode(code)) setError(true)
        }}
      >
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setError(false)
          }}
          placeholder={t('vr.codePlaceholder')}
          className="h-12 w-full rounded-xl border border-white/15 bg-navy-950/80 px-4 text-center text-lg tracking-[0.3em] text-white"
          aria-label={t('vr.codePlaceholder')}
        />
        {error && <p className="text-sm text-orange-300">{t('auth.wrongCredentials')}</p>}
        <Button type="submit" className="w-full">
          {t('vr.signIn')}
        </Button>
        <button type="button" onClick={() => setCode('2468')} className="text-xs text-sky-300 hover:text-white">
          {t('vr.fillDemoCode')}
        </button>
      </form>
    </div>
  )
}

export default function VrOnboarding() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const onboarded = vrOnboardedStore.use()
  const [step, setStep] = useState(0)
  const [practiced, setPracticed] = useState<Record<number, boolean>>({})

  const steps: { title: string; text: string; gesture: Gesture; practice?: string }[] = [
    { title: t('vr.lookAround'), text: t('vr.lookAroundDesc'), gesture: 'look' },
    { title: t('vr.handsTitle'), text: t('vr.handsDesc'), gesture: 'palm' },
    { title: t('vr.selectConfirm'), text: t('vr.selectConfirmDesc'), gesture: 'pinch', practice: t('vr.pinchToContinue') },
    { title: t('vr.pickUp'), text: t('vr.pickUpDesc'), gesture: 'grab', practice: t('vr.grabToContinue') },
    { title: t('vr.menuTitle'), text: t('vr.menuDesc'), gesture: 'point' },
  ]

  if (!user || user.role !== 'student') {
    return (
      <div className="grid-blueprint min-h-screen text-white">
        <VrStatusBar />
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <Logo />
          <LanguageSwitch variant="dark" />
        </header>
        <main className="mx-auto flex max-w-md flex-col items-center px-6 py-10 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{t('vr.vrTraining')}</div>
          <VrSignIn />
        </main>
      </div>
    )
  }

  const firstTime = !onboarded.includes(user.id)
  const replay = params.get('replay') === '1'
  const s = steps[step]
  const isLast = step >= steps.length - 1
  const blocked = !!s.practice && !practiced[step]

  const finish = () => {
    vrOnboardedStore.set((p) => Array.from(new Set([...p, user.id])))
    navigate('/vr/menu')
  }

  return (
    <div className="grid-blueprint min-h-screen text-white">
      <VrStatusBar />
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Logo />
        {!firstTime && (
          <Button variant="dark" onClick={() => navigate('/vr/menu')}>
            {t('vr.skip')}
          </Button>
        )}
      </header>

      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-10 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">{replay ? t('vr.replayGestures') : t('vr.gettingStarted')}</div>
        {firstTime && <p className="mt-2 text-xs text-slate-400">{t('vr.mandatoryFirst')}</p>}

        <div className="mt-6 w-full rounded-2xl border border-white/10 bg-navy-900/70 p-6">
          <div className="mb-4 flex justify-center gap-2">
            {steps.map((_, i) => (
              <span key={i} className={cn('h-2 w-8 rounded-full transition', i <= step ? 'bg-brand-500' : 'bg-white/15')} />
            ))}
          </div>
          <HandAnim gesture={s.gesture} />
          <h2 className="mt-2 text-xl font-bold">{s.title}</h2>
          <p className="mt-3 text-slate-300">{s.text}</p>
          {s.practice &&
            (practiced[step] ? (
              <p className="mt-4 text-sm font-semibold text-emerald-300">✓ {t('vr.wellDone')}</p>
            ) : (
              <PinchTarget label={s.practice} onDone={() => setPracticed((p) => ({ ...p, [step]: true }))} />
            ))}
          <div className="mt-5 flex items-start gap-2 rounded-xl bg-white/5 px-3 py-2 text-left text-xs text-slate-300">
            <Gamepad2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
            <span>
              <span className="font-semibold text-white">{t('vr.controllersFallback')}</span> {t(`vr.controllerEq.${s.gesture}`)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <Button variant="dark" onClick={() => setStep((x) => x - 1)}>
              {t('common.back')}
            </Button>
          )}
          <Button disabled={blocked} onClick={() => (isLast ? finish() : setStep((x) => x + 1))}>
            {isLast ? t('vr.start') : t('common.next')}
          </Button>
        </div>
      </main>
    </div>
  )
}
