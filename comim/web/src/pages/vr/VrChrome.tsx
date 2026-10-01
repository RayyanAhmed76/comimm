import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Battery, Headphones, LayoutList, LogOut, Volume2, VolumeX, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { muteStore, setMuted } from '@/lib/audio'
import { cn } from '@/lib/cn'
import { useAuth } from '@/context/AuthContext'

export function VrStatusBar() {
  const { t } = useTranslation()
  const { user } = useAuth()
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-navy-950/90 px-3 py-2 text-xs sm:px-5 sm:text-sm">
      <div className="flex items-center gap-2 text-slate-300">
        <Headphones className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {t('vr.headset')} <span className="font-semibold text-white">#A-04</span>
          {user && <span className="ml-2 text-slate-400">· {user.name}</span>}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-300 sm:gap-2">
        <Battery className="h-4 w-4 shrink-0 text-green-400" />
        <span className="hidden min-[400px]:inline">{t('vr.handTracking')}</span>
        <span className="font-semibold text-white">68%</span>
      </div>
    </div>
  )
}

export function VrHintBar({ hints }: { hints: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 border-t border-white/10 bg-navy-950/90 px-3 py-2.5 sm:px-4 sm:py-3">
      {hints.map((h) => (
        <span key={h} className="rounded-full bg-navy-700/80 px-3 py-1.5 text-[11px] font-semibold text-slate-200 ring-1 ring-white/10 sm:px-4 sm:text-xs">
          {h}
        </span>
      ))}
    </div>
  )
}

export type VrMenuItem = { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void; tone?: 'danger' }

/**
 * VR chrome — one Menu button opens every control (Exit, Mute, Play, Hint…): no gesture to learn.
 * The COMIM logo returns to the VR menu (or opens the Exit choice inside an exercise).
 */
export function VrShell({
  badge,
  children,
  hints,
  menuItems = [],
  onLogoClick,
  onExit,
}: {
  badge: string
  children: React.ReactNode
  hints?: string[]
  menuItems?: VrMenuItem[]
  onLogoClick?: () => void
  /** Shown as "Exit" in the menu — inside an exercise it opens the Exit choice */
  onExit?: () => void
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const muted = muteStore.use()
  const [open, setOpen] = useState(false)

  const items: VrMenuItem[] = [
    ...menuItems,
    { label: muted ? t('audio.unmute') : t('audio.mute'), icon: muted ? VolumeX : Volume2, onClick: () => setMuted(!muted) },
    { label: onExit ? t('ex.exit') : t('vr.backToVrMenu'), icon: onExit ? LogOut : LayoutList, onClick: () => (onExit ? onExit() : navigate('/vr/menu')), tone: onExit ? 'danger' : undefined },
  ]

  return (
    <div className="grid-blueprint flex min-h-screen flex-col overflow-x-hidden text-white">
      <VrStatusBar />
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={() => (onLogoClick ? onLogoClick() : navigate('/vr/menu'))} aria-label={t('vr.backToVrMenu')}>
            <Logo compact />
          </button>
          <span className="max-w-[160px] truncate rounded-full bg-navy-700 px-2.5 py-1 text-[11px] font-semibold sm:max-w-none sm:px-3 sm:text-xs">{badge}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold shadow-lg hover:bg-brand-700"
          aria-haspopup="dialog"
        >
          <LayoutList className="h-4 w-4" />
          {t('vr.menuButton')}
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {hints && hints.length > 0 && <VrHintBar hints={hints} />}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={t('vr.menuButton')}>
          <button type="button" className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-white/15 bg-navy-900/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-[0.14em] text-sky-300">{t('vr.menuButton')}</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-slate-300 hover:bg-white/10" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {items.map((it) => {
                const Icon = it.icon
                return (
                  <button
                    key={it.label}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      it.onClick()
                    }}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-center text-sm font-semibold transition',
                      it.tone === 'danger' ? 'border-orange-400/40 bg-orange-500/10 text-orange-200 hover:bg-orange-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    {it.label}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex justify-center">
              <LanguageSwitch variant="dark" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
