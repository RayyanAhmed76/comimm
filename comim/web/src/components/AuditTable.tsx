import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CalendarDays, Download, MessageSquareQuote, Monitor, Search, Settings2, Shield, Tag, UserRound, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination, SortTh, usePaged, useSort } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { downloadCsv } from '@/lib/csv'
import { fmtDateTime, useLang } from '@/lib/i18n'
import { DEMO_NOW, type AuditEntry } from '@/data/mock'
import { establishmentsStore } from '@/data/stores'

const pill =
  'inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-ink shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

type SortKey = 'author' | 'origin' | 'action' | 'target' | 'date'

function FilterSelect({ icon, value, onChange, label, options }: { icon: React.ReactNode; value: string; onChange: (v: string) => void; label: string; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">{icon}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(pill, 'min-w-[8rem] appearance-none pr-6 pl-8', value !== 'all' && 'border-brand-500 bg-sky-50')} aria-label={label}>
        <option value="all">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * Audit log table shared by the Client Admin (establishment log) and the Platform Admin
 * (unified COMIM + tenant log).
 */
export function AuditTable({ rows, platform = false, filename }: { rows: AuditEntry[]; platform?: boolean; filename: string }) {
  const { t } = useTranslation()
  const lang = useLang()
  const [params] = useSearchParams()
  const establishments = establishmentsStore.use()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [user, setUser] = useState('all')
  const [profile, setProfile] = useState('all')
  const [action, setAction] = useState('all')
  const [screen, setScreen] = useState('all')
  const [origin, setOrigin] = useState('all')
  const [est, setEst] = useState('all')
  const [range, setRange] = useState('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const uniq = (f: (r: AuditEntry) => string) => Array.from(new Set(rows.map(f))).sort()
  const actionLabel = (a: string) => t(`audit.actions.${a}`)
  const profileLabel = (p: string) => t(`audit.profiles.${p}`)
  const screenLabel = (s: string) => t(`audit.screens.${s}`)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const daysAgo = (n: number) => new Date(new Date(DEMO_NOW).getTime() - n * 86400000).toISOString().slice(0, 10)
    const min = range === 'custom' ? from : range === '7d' ? daysAgo(7) : range === '30d' ? daysAgo(30) : range === '90d' ? daysAgo(90) : ''
    const max = range === 'custom' ? to : ''
    return rows.filter((r) => {
      const d = r.date.slice(0, 10)
      if (min && d < min) return false
      if (max && d > max) return false
      if (user !== 'all' && r.author !== user) return false
      if (profile !== 'all' && r.profile !== profile) return false
      if (action !== 'all' && r.action !== action) return false
      if (screen !== 'all' && r.screen !== screen) return false
      if (origin !== 'all' && r.origin !== origin) return false
      // Platform: the school selector keeps COMIM actions on that school visible too
      if (est !== 'all' && r.establishmentId !== est) return false
      if (!q) return true
      return `${r.author} ${actionLabel(r.action)} ${r.target} ${r.justification ?? ''}`.toLowerCase().includes(q)
    })
    // labels depend on language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, user, profile, action, screen, origin, est, range, from, to, lang])

  const sort = useSort(filtered, 'date' as SortKey, (r, k) => (k === 'action' ? actionLabel(r.action) : r[k]), false)
  const paged = usePaged(sort.sorted, 10)
  const any = query || [user, profile, action, screen, origin, est, range].some((v) => v !== 'all')

  const exportCsv = () => {
    downloadCsv(filename, [
      [t('admin.timestamp'), t('admin.author'), t('platform.filterProfile'), ...(platform ? [t('platform.origin'), t('platform.establishmentCol')] : []), t('admin.action'), t('admin.target'), t('platform.filterScreen'), t('dash.justification')],
      ...sort.sorted.map((r) => [
        fmtDateTime(r.date, lang),
        r.author,
        profileLabel(r.profile),
        ...(platform ? [r.origin === 'COMIM' ? 'COMIM' : t('platform.originSchool'), establishments.find((e) => e.id === r.establishmentId)?.name ?? ''] : []),
        actionLabel(r.action),
        r.target,
        screenLabel(r.screen),
        r.justification ?? '',
      ]),
    ])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={cn(pill, 'w-[170px] pl-8')} />
        </div>
        {platform && (
          <FilterSelect icon={<Building2 className="h-3.5 w-3.5 text-slate-400" />} value={est} onChange={setEst} label={t('platform.allEstablishmentsFilter')} options={establishments.map((e) => ({ value: e.id, label: e.name }))} />
        )}
        <FilterSelect icon={<Tag className="h-3.5 w-3.5 text-slate-400" />} value={action} onChange={setAction} label={t('audit.actionType')} options={uniq((r) => r.action).map((a) => ({ value: a, label: actionLabel(a) }))} />
        <FilterSelect icon={<UserRound className="h-3.5 w-3.5 text-slate-400" />} value={user} onChange={setUser} label={t('platform.filterUser')} options={uniq((r) => r.author).map((a) => ({ value: a, label: a }))} />
        <FilterSelect icon={<Shield className="h-3.5 w-3.5 text-slate-400" />} value={profile} onChange={setProfile} label={t('platform.filterProfile')} options={uniq((r) => r.profile).map((p) => ({ value: p, label: profileLabel(p) }))} />
        {platform && (
          <FilterSelect
            icon={<Settings2 className="h-3.5 w-3.5 text-slate-400" />}
            value={origin}
            onChange={setOrigin}
            label={t('platform.origin')}
            options={[
              { value: 'COMIM', label: t('platform.originComim') },
              { value: 'School', label: t('platform.originSchool') },
            ]}
          />
        )}
        <FilterSelect icon={<Monitor className="h-3.5 w-3.5 text-slate-400" />} value={screen} onChange={setScreen} label={t('platform.filterScreen')} options={uniq((r) => r.screen).map((s) => ({ value: s, label: screenLabel(s) }))} />
        <FilterSelect
          icon={<CalendarDays className="h-3.5 w-3.5 text-slate-400" />}
          value={range}
          onChange={setRange}
          label={t('platform.allTime')}
          options={[
            { value: '7d', label: t('platform.last7Days') },
            { value: '30d', label: t('platform.last30Days') },
            { value: '90d', label: t('platform.last90Days') },
            { value: 'custom', label: t('audit.customRange') },
          ]}
        />
        {range === 'custom' && (
          <span className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={pill} aria-label={t('audit.from')} />
            <span>→</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={pill} aria-label={t('audit.to')} />
            <span className="text-xs">{t('audit.exactHint')}</span>
          </span>
        )}
        {any && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              ;[setUser, setProfile, setAction, setScreen, setOrigin, setEst, setRange].forEach((f) => f('all'))
            }}
            className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-muted hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
            {t('dash.clearFilters')}
          </button>
        )}
        <Button variant="secondary" className="ml-auto rounded-full py-2" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          {t('audit.exportCsv')}
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-muted">
                <SortTh label={t('admin.author')} k="author" sort={sort} className="px-5" />
                {platform && <SortTh label={t('platform.origin')} k="origin" sort={sort} />}
                <SortTh label={t('admin.action')} k="action" sort={sort} />
                <SortTh label={t('admin.target')} k="target" sort={sort} />
                <SortTh label={t('admin.timestamp')} k="date" sort={sort} />
              </tr>
            </thead>
            <tbody>
              {paged.slice.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted">
                    {t('platform.noAuditMatches')}
                  </td>
                </tr>
              ) : (
                paged.slice.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 align-top last:border-0">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-ink">{r.author}</div>
                      <div className="text-xs text-muted">
                        {profileLabel(r.profile)} · {screenLabel(r.screen)}
                      </div>
                    </td>
                    {platform && (
                      <td className="px-4 py-3.5">
                        <Badge tone={r.origin === 'COMIM' ? 'blue' : 'gray'}>{r.origin === 'COMIM' ? t('platform.originComim') : t('platform.originSchool')}</Badge>
                      </td>
                    )}
                    <td className="px-4 py-3.5 font-semibold text-ink">{actionLabel(r.action)}</td>
                    <td className="px-4 py-3.5 text-muted">
                      {r.target}
                      {r.justification && (
                        <div className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                          <MessageSquareQuote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>
                            <span className="font-semibold">{t('dash.justification')}:</span> {r.justification}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-muted">{fmtDateTime(r.date, lang)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination paged={paged} />
      </Card>
    </div>
  )
}
