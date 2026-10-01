import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, ChevronRight, LogOut, Search, Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { useLoc, useLang, fmtDateTime } from '@/lib/i18n'
import { muteStore, setMuted } from '@/lib/audio'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Modal } from '@/components/ui/Modal'
import { buildNotifications, contactRequestsStore } from '@/data/notifications'
import { buildSearchIndex, type SearchGroup } from '@/data/search'
import {
  assignmentsStore,
  attemptsStore,
  classesStore,
  establishmentsStore,
  headsetsStore,
  notificationsReadStore,
  platformAuditStore,
  schoolAuditStore,
  settingsStore,
  studentsStore,
} from '@/data/stores'

type Variant = 'light' | 'dark'

function useOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut()
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [ref, onOut, active])
}

const iconBtn = (variant: Variant) =>
  cn(
    'relative inline-flex h-9 w-9 items-center justify-center rounded-full border transition',
    variant === 'light'
      ? 'border-slate-200 bg-white text-muted hover:bg-slate-50'
      : 'border-white/15 bg-white/10 text-slate-200 hover:bg-white/15',
  )

/** User badge — identity + EN/FR + Log out in one dropdown (all roles). */
export function UserMenu({ variant = 'light', onLogout, subtitle }: { variant?: Variant; onLogout?: () => void; subtitle?: string }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false), open)
  const classes = classesStore.use()
  if (!user) return null

  const studentClass = user.role === 'student' ? classes.find((c) => c.id === user.classIds?.[0]) : undefined
  const sub = subtitle ?? (studentClass ? studentClass.name : t(`roles.${user.role}`))

  const doLogout = () => {
    setOpen(false)
    if (onLogout) return onLogout()
    logout()
    navigate('/')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2 rounded-full border py-1 pr-2 pl-1 text-left sm:gap-2.5 sm:pr-3',
          variant === 'light' ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-white/15 bg-white/10 hover:bg-white/15',
        )}
      >
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold', variant === 'light' ? 'bg-navy-900 text-white' : 'bg-white text-navy-900')}>
          {user.initials}
        </span>
        <span className="hidden min-w-0 leading-tight min-[480px]:block">
          <span className={cn('block max-w-[150px] truncate text-sm font-semibold', variant === 'light' ? 'text-ink' : 'text-white')}>
            {user.firstName} {user.lastName}
          </span>
          <span className={cn('block max-w-[150px] truncate text-xs', variant === 'light' ? 'text-muted' : 'text-slate-300')}>{sub}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0', variant === 'light' ? 'text-muted' : 'text-slate-300')} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white text-ink shadow-xl">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="font-semibold">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.email}</div>
            <div className="mt-1 text-xs font-medium text-brand-600">{sub}</div>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-sm text-muted">{t('common.language')}</span>
            <LanguageSwitch variant="light" />
          </div>
          <button type="button" role="menuitem" onClick={doLogout} className="flex w-full items-center gap-2 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-warning-600 hover:bg-warning-50">
            <LogOut className="h-4 w-4" />
            {t('common.logOut')}
          </button>
        </div>
      )}
    </div>
  )
}

/** Global Mute — applies to every audio of the app. */
export function MuteButton({ variant = 'dark' }: { variant?: Variant }) {
  const muted = muteStore.use()
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={() => setMuted(!muted)}
      aria-pressed={muted}
      title={muted ? t('audio.unmute') : t('audio.mute')}
      aria-label={muted ? t('audio.unmute') : t('audio.mute')}
      className={iconBtn(variant)}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  )
}

export function NotificationBell({ variant = 'light' }: { variant?: Variant }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutside(ref, () => setOpen(false), open)
  const read = notificationsReadStore.use()
  // re-render when any source changes
  attemptsStore.use()
  assignmentsStore.use()
  studentsStore.use()
  schoolAuditStore.use()
  platformAuditStore.use()
  establishmentsStore.use()
  headsetsStore.use()
  contactRequestsStore.use()
  classesStore.use()

  if (!user) return null
  const items = buildNotifications(user.role, user.id, user.studentId)
  const unread = items.filter((n) => !read.includes(n.id)).length

  const openItem = (id: string, to: string) => {
    if (!read.includes(id)) notificationsReadStore.set((p) => [...p, id])
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" className={iconBtn(variant)} onClick={() => setOpen((v) => !v)} aria-label={t('notif.title')} aria-expanded={open}>
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning-600 px-1 text-[10px] font-bold text-white" aria-label={t('notif.unread', { count: unread })}>
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(360px,90vw)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-ink shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="font-semibold">{t('notif.title')}</span>
            <button
              type="button"
              disabled={unread === 0}
              onClick={() => notificationsReadStore.set((p) => Array.from(new Set([...p, ...items.map((n) => n.id)])))}
              className="text-xs font-semibold text-brand-600 hover:underline disabled:text-slate-300 disabled:no-underline"
            >
              {t('notif.markAll')}
            </button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">{t('notif.empty')}</li>}
            {items.map((n) => {
              const isUnread = !read.includes(n.id)
              return (
                <li key={n.id}>
                  <button type="button" onClick={() => openItem(n.id, n.to)} className={cn('flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50', isUnread && 'bg-sky-50/60')}>
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', isUnread ? 'bg-brand-600' : 'bg-transparent')} />
                    <span className="min-w-0 flex-1">
                      <span className={cn('block text-sm', isUnread ? 'font-semibold' : 'font-medium')}>{loc(n.title)}</span>
                      <span className="block truncate text-xs text-muted">{loc(n.body)}</span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">{fmtDateTime(n.date, lang)}</span>
                    </span>
                    {isUnread && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          notificationsReadStore.set((p) => [...p, n.id])
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation()
                            notificationsReadStore.set((p) => [...p, n.id])
                          }
                        }}
                        className="self-start text-[11px] font-semibold whitespace-nowrap text-brand-600 hover:underline"
                      >
                        {t('notif.markRead')}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

/** Header search — global, limited to what the role may see. */
export function GlobalSearch({ variant = 'light' }: { variant?: Variant }) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const loc = useLoc()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const index = useMemo(() => (open && user ? buildSearchIndex(user) : []), [open, user])
  const q = query.trim().toLowerCase()
  const results = q.length < 2 ? [] : index.filter((h) => `${loc(h.label)} ${loc(h.sub)}`.toLowerCase().includes(q)).slice(0, 40)
  const groups = Array.from(new Set(results.map((r) => r.group))) as SearchGroup[]

  if (!user) return null
  return (
    <>
      <button type="button" className={iconBtn(variant)} onClick={() => setOpen(true)} aria-label={t('search.title')} title={`${t('search.title')} (Ctrl+K)`}>
        <Search className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t('search.title')} subtitle={t(`search.scope.${user.role}`)} size="lg">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-11 w-full rounded-xl border border-slate-200 pr-3 pl-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="mt-4 space-y-4">
          {q.length >= 2 && results.length === 0 && <p className="py-6 text-center text-sm text-muted">{t('search.noResults')}</p>}
          {q.length < 2 && <p className="py-6 text-center text-sm text-muted">{t('search.hint')}</p>}
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{t(`search.groups.${g}`)}</div>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                {results
                  .filter((r) => r.group === g)
                  .map((r, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false)
                          setQuery('')
                          navigate(r.to)
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{loc(r.label)}</span>
                          {r.sub && <span className="block truncate text-xs text-muted">{loc(r.sub)}</span>}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}

export type Crumb = { label: string; to?: string; onClick?: () => void }

export function Breadcrumbs({ items, variant = 'light' }: { items: Crumb[]; variant?: Variant }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1
          return (
            <li key={i} className="flex min-w-0 items-center gap-1">
              {c.onClick && !last ? (
                <button type="button" onClick={c.onClick} className={cn('truncate font-semibold hover:underline', variant === 'light' ? 'text-brand-600' : 'text-sky-300')}>
                  {c.label}
                </button>
              ) : c.to && !last ? (
                <Link to={c.to} className={cn('truncate font-semibold hover:underline', variant === 'light' ? 'text-brand-600' : 'text-sky-300')}>
                  {c.label}
                </Link>
              ) : (
                <span className={cn('truncate font-bold', variant === 'light' ? 'text-ink' : 'text-white')} aria-current={last ? 'page' : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <ChevronRight className={cn('h-4 w-4 shrink-0', variant === 'light' ? 'text-slate-300' : 'text-slate-500')} />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** School logo uploaded in Settings — shown in the header for the school's users. */
export function SchoolLogo({ className }: { className?: string }) {
  const settings = settingsStore.use()
  const { user } = useAuth()
  if (!settings.logo || !user || user.role === 'platform') return null
  return <img src={settings.logo} alt={settings.name} className={cn('h-8 max-w-[110px] rounded bg-white object-contain p-0.5', className)} />
}
