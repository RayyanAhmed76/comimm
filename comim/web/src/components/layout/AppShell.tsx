import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Menu,
  Monitor,
  PlaySquare,
  Settings,
  Headphones,
  Users,
  ScrollText,
  Building2,
  KeyRound,
  BarChart3,
  Shield,
  BookOpen,
  X,
} from 'lucide-react'
import { Logo } from '@/components/Logo'
import { homeFor, useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumbs, GlobalSearch, NotificationBell, SchoolLogo, UserMenu, type Crumb } from '@/components/layout/HeaderParts'

type NavItem = { to: string; labelKey: string; icon: React.ComponentType<{ className?: string }> }

const teacherNav: NavItem[] = [
  { to: '/teacher', labelKey: 'nav.myClasses', icon: LayoutGrid },
  { to: '/teacher/live', labelKey: 'nav.liveSessions', icon: Monitor },
  { to: '/teacher/preview', labelKey: 'nav.lessonPreview', icon: PlaySquare },
  { to: '/teacher/question-bank', labelKey: 'nav.questionBank', icon: BookOpen },
]

const adminNav: NavItem[] = [
  { to: '/admin/users', labelKey: 'nav.users', icon: Users },
  { to: '/admin/classes', labelKey: 'nav.classes', icon: LayoutGrid },
  { to: '/admin/audit', labelKey: 'nav.auditLog', icon: ScrollText },
  { to: '/admin/headsets', labelKey: 'nav.headsets', icon: Headphones },
  { to: '/admin/settings', labelKey: 'nav.settings', icon: Settings },
]

const platformNav: NavItem[] = [
  { to: '/platform', labelKey: 'nav.overview', icon: LayoutGrid },
  { to: '/platform/establishments', labelKey: 'nav.establishments', icon: Building2 },
  { to: '/platform/licenses', labelKey: 'nav.licenses', icon: KeyRound },
  { to: '/platform/usage', labelKey: 'nav.usage', icon: BarChart3 },
  { to: '/platform/audit', labelKey: 'nav.auditLog', icon: Shield },
]

function navFor(role: string) {
  if (role === 'teacher') return teacherNav
  if (role === 'admin') return adminNav
  return platformNav
}

export function AppShell({
  children,
  title,
  breadcrumb,
}: {
  children: React.ReactNode
  title?: string
  /** A plain title or a clickable breadcrumb trail */
  breadcrumb?: string | Crumb[]
}) {
  const { user } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const items = navFor(user?.role ?? 'teacher')
  const home = homeFor(user?.role)

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const crumbs: Crumb[] = Array.isArray(breadcrumb) ? breadcrumb : [{ label: breadcrumb ?? title ?? '' }]

  const renderNav = ({ compact, showClose, showCollapse }: { compact: boolean; showClose?: boolean; showCollapse?: boolean }) => (
    <>
      <div className={cn('border-b border-white/10 px-4 py-5', compact && 'px-3')}>
        <div className="flex items-center justify-between gap-2">
          <Link to={home} aria-label={t('ui.mainMenu')}>
            <Logo compact={compact} />
          </Link>
          {showClose && (
            <button type="button" className="rounded-lg p-2 text-slate-300 hover:bg-white/10" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pt-5">
        {!compact && <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{t('nav.fwg')}</div>}
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/teacher' || item.to === '/platform'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive ? 'bg-navy-700 text-white shadow-inner ring-1 ring-white/10' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                    compact && 'justify-center px-2',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!compact && <span>{t(item.labelKey)}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>
      {showCollapse && (
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="mt-auto flex items-center gap-2 border-t border-white/10 px-4 py-4 text-sm text-slate-300 hover:bg-white/5"
        >
          {compact ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!compact && t('common.collapseMenu')}
        </button>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className={cn('sticky top-0 z-30 hidden h-screen shrink-0 flex-col bg-navy-900 text-white transition-all lg:flex', collapsed ? 'w-[76px]' : 'w-[250px]')}>
        {renderNav({ compact: collapsed, showCollapse: true })}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-[min(280px,85vw)] flex-col bg-navy-900 text-white shadow-2xl">{renderNav({ compact: false, showClose: true })}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white/90 px-3 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 text-ink hover:bg-slate-50 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Breadcrumbs items={crumbs} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <SchoolLogo className="hidden md:block" />
            <GlobalSearch />
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
