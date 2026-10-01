import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { COURSE_NAME } from '@/data/content'
import { Breadcrumbs, GlobalSearch, MuteButton, NotificationBell, SchoolLogo, UserMenu, type Crumb } from '@/components/layout/HeaderParts'
import { useAuth } from '@/context/AuthContext'

/**
 * Student web chrome. Header: COMIM logo (→ main menu, or Exit choice inside an exercise),
 * course badge, global Mute, search, notifications and the user badge (EN/FR + Log out inside).
 */
export function TrainingShell({
  children,
  crumbs,
  dark = true,
  onLogoClick,
  actions,
  preview = false,
  onLogout,
}: {
  children: React.ReactNode
  crumbs?: Crumb[]
  dark?: boolean
  /** Inside an exercise the logo triggers the Exit choice instead of navigating */
  onLogoClick?: () => void
  /** Right side of the breadcrumb bar (e.g. Exit button) */
  actions?: React.ReactNode
  preview?: boolean
  onLogout?: () => void
}) {
  const { t } = useTranslation()
  const loc = useLoc()
  const navigate = useNavigate()
  const { user } = useAuth()
  const home = preview || user?.role === 'teacher' ? '/teacher/preview' : '/student'

  return (
    <div className={cn('flex min-h-screen flex-col overflow-x-hidden', dark ? 'grid-blueprint text-white' : 'bg-[#F4F7F9] text-ink')}>
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0A1633] px-3 py-2.5 text-white sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => (onLogoClick ? onLogoClick() : navigate(home))}
            aria-label={t('ui.mainMenu')}
            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Logo compact light />
          </button>
          <div className="hidden h-6 w-px bg-white/20 sm:block" />
          <span className="inline-flex max-w-[200px] items-center gap-1.5 truncate rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-white/15 sm:max-w-none">
            <BookOpen className="h-3.5 w-3.5 shrink-0 text-sky-300" />
            <span className="truncate">{t('ui.coursePrefix', { name: loc(COURSE_NAME) })}</span>
          </span>
          <SchoolLogo className="hidden md:block" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MuteButton variant="dark" />
          {!preview && user?.role === 'student' && <GlobalSearch variant="dark" />}
          {!preview && user?.role === 'student' && <NotificationBell variant="dark" />}
          <UserMenu variant="dark" onLogout={onLogout} />
        </div>
      </header>

      {preview && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-400 px-4 py-2 text-sm font-semibold text-navy-950">
          <span className="inline-flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t('preview.banner')}
          </span>
          <Link to="/teacher/preview" className="underline">
            {t('preview.back')}
          </Link>
        </div>
      )}

      {(crumbs || actions) && (
        <div className={cn('flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 sm:px-6', dark ? 'border-white/10 bg-navy-950/60' : 'border-slate-200 bg-white')}>
          {crumbs ? <Breadcrumbs items={crumbs} variant={dark ? 'dark' : 'light'} /> : <span />}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
