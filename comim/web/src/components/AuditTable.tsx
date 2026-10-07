import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pagination, SortTh, thRow, usePaged, useSort } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { downloadCsv } from '@/lib/csv'
import { fmtDate, useLang, useLoc } from '@/lib/i18n'
import { trackLabel } from '@/lib/labels'
import { DEMO_NOW, type AuditEntry, type AuditVal } from '@/data/mock'
import { establishmentsStore } from '@/data/stores'

type SortKey = 'author' | 'action' | 'target' | 'date'

/** Stored codes / ids are translated at display time. */
export function useAuditFmt() {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const val = (v?: AuditVal): string => {
    if (v == null) return '—'
    if (typeof v === 'string') return v
    if ('date' in v) return fmtDate(v.date, lang)
    if ('code' in v) return v.code.startsWith('track.') ? trackLabel(v.code.slice(6), lang) : t(`audit.values.${v.code}`, { count: v.n })
    return loc(v)
  }
  const field = (f: string) => (f.startsWith('feature.') ? t(`platform.features.${f.slice(8)}`) : t(`audit.fields.${f}`))
  return { val, field }
}

/** Page of the entity an entry applies to (school pages for the Client Admin, the school sheet for COMIM). */
function refLink(r: AuditEntry, platform: boolean): string | null {
  if (platform) return r.establishmentId ? `/platform/establishments/${r.establishmentId}` : null
  const ref = r.ref
  if (!ref) return null
  if ((ref.kind === 'student' || ref.kind === 'teacher') && ref.id) return `/admin/users/${ref.id}`
  if (ref.kind === 'class' && ref.id) return `/admin/classes/${ref.id}`
  if (ref.kind === 'headset' && ref.id) return `/admin/headsets/${encodeURIComponent(ref.id)}`
  if (ref.kind === 'question') return `/admin/questions${ref.id ? `?q=${encodeURIComponent(ref.id)}` : ''}`
  if (ref.kind === 'setting') return '/admin/settings'
  return null
}

const label = 'text-xs font-semibold text-slate-600'
const control = 'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
const beforeChip = 'rounded-lg bg-slate-100 px-2.5 py-0.5 text-slate-500 line-through'
const afterChip = 'rounded-lg bg-[#ebf7ee] px-2.5 py-0.5 font-semibold text-[#1e6b3b]'

function FilterField({ id, text, className, children }: { id: string; text: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {children}
    </div>
  )
}

/**
 * Audit log shared by the Client Admin (establishment log) and the COMIM Admin (unified
 * COMIM + school log): title card with the export, one aligned filter grid, structured rows
 * (date / author / action / target link / before → after).
 */
export function AuditTable({ rows, platform = false, filename, title, subtitle }: { rows: AuditEntry[]; platform?: boolean; filename: string; title: string; subtitle: string }) {
  const { t } = useTranslation()
  const lang = useLang()
  const fmt = useAuditFmt()
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
  const [open, setOpen] = useState<string[]>([])

  const uniq = (f: (r: AuditEntry) => string) => Array.from(new Set(rows.map(f))).sort()
  const actionLabel = (a: string) => t(`audit.actions.${a}`)
  const profileLabel = (p: string) => t(`audit.profiles.${p}`)
  const screenLabel = (s: string) => t(`audit.screens.${s}`)
  const targetText = (r: AuditEntry) => (r.ref ? fmt.val(r.ref.label) : r.target)
  const changesText = (r: AuditEntry) => (r.changes ?? []).map((c) => `${fmt.field(c.field)}: ${fmt.val(c.before)} → ${fmt.val(c.after)}`).join(' | ')

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
      return `${r.author} ${actionLabel(r.action)} ${targetText(r)} ${r.target} ${changesText(r)} ${r.justification ?? ''}`.toLowerCase().includes(q)
    })
    // labels depend on language
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, user, profile, action, screen, origin, est, range, from, to, lang])

  const sort = useSort(filtered, 'date' as SortKey, (r, k) => (k === 'action' ? actionLabel(r.action) : k === 'target' ? targetText(r) : r[k]), false)
  const paged = usePaged(sort.sorted, 10)

  const reset = () => {
    setQuery('')
    ;[setUser, setProfile, setAction, setScreen, setOrigin, setEst, setRange].forEach((f) => f('all'))
    setFrom('')
    setTo('')
  }

  const exportCsv = () => {
    downloadCsv(filename, [
      [t('audit.dateTime'), t('admin.author'), t('platform.filterProfile'), ...(platform ? [t('platform.origin'), t('platform.establishmentCol')] : []), t('admin.action'), t('admin.target'), t('audit.change'), t('platform.filterScreen'), t('dash.justification')],
      ...sort.sorted.map((r) => [
        `${fmtDate(r.date, lang)} ${r.date.slice(11, 16)}`,
        r.author,
        profileLabel(r.profile),
        ...(platform ? [r.origin === 'COMIM' ? 'COMIM' : t('platform.originSchool'), establishments.find((e) => e.id === r.establishmentId)?.name ?? ''] : []),
        actionLabel(r.action),
        [targetText(r), r.ref?.sub ? fmt.val(r.ref.sub) : ''].filter(Boolean).join(' · '),
        changesText(r),
        screenLabel(r.screen),
        r.justification ?? '',
      ]),
    ])
  }

  const select = (id: string, value: string, onChange: (v: string) => void, all: string, options: { value: string; label: string }[]) => (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={control}>
      <option value="all">{all}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )

  return (
    <div className="space-y-5">
      {/* Title card — the export lives here */}
      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted">{subtitle}</p>
        </div>
        <Button variant="secondary" className="h-11 rounded-xl border-slate-300 px-5" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          {t('audit.exportCsv')}
        </Button>
      </Card>

      {/* Filters: one grid, every field labelled, all 44 px high */}
      <Card className="p-5 sm:px-7">
        <div role="search" aria-label={t('audit.filters')} className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] items-end gap-x-4 gap-y-3.5">
          <FilterField id="f-q" text={t('common.search')} className="sm:col-span-2">
            <input id="f-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('audit.searchPlaceholder')} className={control} />
          </FilterField>
          <FilterField id="f-act" text={t('audit.actionType')}>
            {select('f-act', action, setAction, t('audit.allTypes'), uniq((r) => r.action).map((a) => ({ value: a, label: actionLabel(a) })))}
          </FilterField>
          <FilterField id="f-usr" text={t('platform.filterUser')}>
            {select('f-usr', user, setUser, t('audit.allUsers'), uniq((r) => r.author).map((a) => ({ value: a, label: a })))}
          </FilterField>
          <FilterField id="f-prof" text={t('platform.filterProfile')}>
            {select('f-prof', profile, setProfile, t('audit.allProfiles'), uniq((r) => r.profile).map((p) => ({ value: p, label: profileLabel(p) })))}
          </FilterField>
          {platform && (
            <>
              <FilterField id="f-est" text={t('platform.establishmentCol')}>
                {select('f-est', est, setEst, t('platform.allEstablishmentsFilter'), establishments.map((e) => ({ value: e.id, label: e.name })))}
              </FilterField>
              <FilterField id="f-orig" text={t('platform.origin')}>
                {select('f-orig', origin, setOrigin, t('audit.allOrigins'), [
                  { value: 'COMIM', label: t('platform.originComim') },
                  { value: 'School', label: t('platform.originSchool') },
                ])}
              </FilterField>
            </>
          )}
          <FilterField id="f-scr" text={t('platform.filterScreen')}>
            {select('f-scr', screen, setScreen, t('audit.allScreens'), uniq((r) => r.screen).map((s) => ({ value: s, label: screenLabel(s) })))}
          </FilterField>
          <FilterField id="f-per" text={t('audit.period')}>
            {select('f-per', range, setRange, t('platform.allTime'), [
              { value: '7d', label: t('platform.last7Days') },
              { value: '30d', label: t('platform.last30Days') },
              { value: '90d', label: t('platform.last90Days') },
              { value: 'custom', label: t('audit.customRange') },
            ])}
          </FilterField>
          {range === 'custom' && (
            <>
              <FilterField id="f-from" text={t('audit.from')}>
                <input id="f-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={control} />
              </FilterField>
              <FilterField id="f-to" text={t('audit.to')}>
                <input id="f-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className={control} />
              </FilterField>
            </>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3.5">
          <span className="text-[13px] text-muted">{t('audit.shown', { count: filtered.length })}</span>
          <button type="button" onClick={reset} className="rounded-lg px-1 py-1.5 text-sm font-semibold text-brand-600 hover:underline">
            {t('audit.reset')}
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[132px]" />
              <col className="w-[190px]" />
              <col className="w-[190px]" />
              <col className="w-[220px]" />
              <col />
            </colgroup>
            <thead>
              <tr className={thRow}>
                <SortTh label={t('audit.dateTime')} k="date" sort={sort} className="pl-5" />
                <SortTh label={t('admin.author')} k="author" sort={sort} />
                <SortTh label={t('admin.action')} k="action" sort={sort} />
                <SortTh label={t('admin.target')} k="target" sort={sort} />
                <th className="px-4 py-3">{t('audit.changeHeader')}</th>
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
                paged.slice.map((r) => {
                  const changes = r.changes ?? []
                  const multi = changes.length > 1
                  const expanded = multi && open.includes(r.id)
                  const href = refLink(r, platform)
                  const estName = platform ? establishments.find((e) => e.id === r.establishmentId)?.name : undefined
                  const sub = r.ref?.sub ? fmt.val(r.ref.sub) : undefined
                  return (
                    <tr key={r.id} className="border-b border-slate-200 align-top last:border-0">
                      <td className="py-3.5 pr-4 pl-5 text-slate-700">
                        {fmtDate(r.date, lang)}
                        <span className="block text-xs text-muted">{r.date.slice(11, 16)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-ink">{r.author}</span>
                        <span className="block text-xs text-muted">
                          {profileLabel(r.profile)}
                          {platform && ` · ${r.origin === 'COMIM' ? t('platform.originComim') : t('platform.originSchool')}`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[12.5px] font-semibold text-slate-700">{actionLabel(r.action)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {href ? (
                          <Link to={href} className="font-semibold text-brand-600 hover:underline">
                            {targetText(r)}
                          </Link>
                        ) : (
                          <span className="font-semibold text-ink">{targetText(r)}</span>
                        )}
                        {(sub || (estName && estName !== targetText(r))) && <span className="block text-xs text-muted">{[sub, estName !== targetText(r) ? estName : undefined].filter(Boolean).join(' · ')}</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {changes.length === 0 && !r.justification && <span className="text-slate-400">—</span>}
                        {changes.length === 1 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[12.5px] font-semibold text-muted">{fmt.field(changes[0].field)}</span>
                            <span className={beforeChip}>{fmt.val(changes[0].before)}</span>
                            <span aria-hidden="true" className="text-slate-400">
                              →
                            </span>
                            <span className={afterChip}>{fmt.val(changes[0].after)}</span>
                          </div>
                        )}
                        {multi && (
                          <button
                            type="button"
                            onClick={() => setOpen((p) => (p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id]))}
                            aria-expanded={expanded}
                            className="flex items-center gap-1.5 py-0.5 text-sm font-semibold text-brand-600"
                          >
                            <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
                            {t('audit.fieldsChanged', { count: changes.length })}
                          </button>
                        )}
                        {expanded && (
                          <div className="mt-2 rounded-xl bg-slate-50 px-2 py-1">
                            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-x-2 px-1 py-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted">
                              <div>{t('audit.field')}</div>
                              <div>{t('audit.before')}</div>
                              <div>{t('audit.after')}</div>
                            </div>
                            {changes.map((c) => (
                              <div key={c.field} className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-x-2 border-t border-slate-200 px-1 py-2 text-[13.5px]">
                                <div className="font-semibold text-slate-700">{fmt.field(c.field)}</div>
                                <div>
                                  <span className={beforeChip}>{fmt.val(c.before)}</span>
                                </div>
                                <div>
                                  <span className={afterChip}>{fmt.val(c.after)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {r.justification && (
                          <div className="mt-2 text-[13px] text-slate-600 italic">
                            {t('dash.justification')} : {r.justification}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination paged={paged} />
      </Card>
    </div>
  )
}
