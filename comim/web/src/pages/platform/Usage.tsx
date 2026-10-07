import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, BarChart3, Download, FileText, Play, Save, Table2, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { SortTh, inputSm, thRow, useSort } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { downloadCsv } from '@/lib/csv'
import { fmtDate, fmtNumber, useLang, useLoc } from '@/lib/i18n'
import { createStore, uid } from '@/lib/store'
import { comimQuestionBank, moduleNames, PASS_THRESHOLD, repairProcedure, startupProcedure, type ModuleId } from '@/data/content'
import { DEMO_NOW, usageSeed, type Establishment, type Period } from '@/data/mock'
import { addPlatformAudit, establishmentsStore } from '@/data/stores'

type Tab = 'overview' | 'learning' | 'establishments' | 'sql'
type Plan = 'all' | Establishment['plan']
const TABS: Tab[] = ['overview', 'learning', 'establishments', 'sql']
const PERIODS: Period[] = ['thisMonth', 'lastMonth', 'last90', 'thisYear']
const PERIOD_RANGE: Record<Period, [string, string]> = {
  thisMonth: ['2026-09-01', '2026-09-17'],
  lastMonth: ['2026-08-01', '2026-08-31'],
  last90: ['2026-06-19', '2026-09-17'],
  thisYear: ['2026-01-01', '2026-09-17'],
}

/* Demo figures that are not broken down per period in the seed data */
const MODULE_SHARE: Record<ModuleId, number> = { tour: 0.22, identification: 0.28, startup: 0.24, repair: 0.16, finalQuiz: 0.1 }
const MODULE_PASS: Partial<Record<ModuleId, number>> = { identification: 81, startup: 76, repair: 68 }
const HINTS: { module: ModuleId; perAttempt: number; level2: number }[] = [
  { module: 'identification', perAttempt: 0.6, level2: 0 },
  { module: 'startup', perAttempt: 1.4, level2: 22 },
  { module: 'repair', perAttempt: 2.1, level2: 35 },
]
const HARD_QUESTIONS = [['fq17', 46], ['fq12', 41], ['fq03', 38], ['fq19', 35], ['fq07', 31]] as const
const HARD_STEPS = [['repair', 'r5', 37], ['startup', 's6', 34], ['repair', 'r2', 33], ['startup', 's4', 29]] as const
const FLEET: Record<string, { headsets: number; online: number }> = { imc: { headsets: 7, online: 4 }, lma: { headsets: 5, online: 3 }, imt: { headsets: 0, online: 0 }, cfa: { headsets: 4, online: 0 } }
const TREND = [0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.15, 0.16]

/* ------------------------------ charts ------------------------------ */

function VBars({ data, color = 'bg-brand-600' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="flex h-48 items-end gap-2" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[11px] font-semibold text-ink">{d.value}</span>
          <div className={cn('w-full max-w-[44px] rounded-t-md', color)} style={{ height: `${(d.value / max) * 78}%` }} />
          <span className="w-full truncate text-center text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function HBar({ label, value, max = 100, text, tone = 'bg-brand-600', to }: { label: React.ReactNode; value: number; max?: number; text: string; tone?: string; to?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1.6fr)_auto] items-center gap-3 py-2 text-sm">
      {to ? (
        <Link to={to} className="truncate font-semibold text-brand-600 hover:underline">
          {label}
        </Link>
      ) : (
        <span className="truncate font-medium text-ink">{label}</span>
      )}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full', tone)} style={{ width: `${Math.min(100, (value / Math.max(1, max)) * 100)}%` }} />
      </div>
      <span className="w-24 text-right text-xs font-semibold text-ink tabular-nums">{text}</span>
    </div>
  )
}

function Panel({ title, hint, children, className }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={cn('p-6', className)}>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </Card>
  )
}

/* --------------------------- SQL reports ---------------------------- */

type Report = {
  id: string
  name: string
  scope: 'all' | 'selection'
  establishmentIds: string[]
  sql: string
  schedule: 'manual' | 'weekly' | 'monthly'
  email: string
  visibility: 'me' | 'team'
  owner: string
  lastRun?: string
}

const SQL_DEFAULT = `SELECT e.name AS establishment,
       count(DISTINCT s.id)  AS sessions,
       count(a.id)           AS exercises,
       round(avg((a.score >= 70)::int) * 100) AS pass_rate
FROM establishments e
JOIN sessions s ON s.establishment_id = e.id
JOIN exercise_attempts a ON a.session_id = s.id
WHERE s.started_at BETWEEN :periode_debut AND :periode_fin
GROUP BY 1
ORDER BY 2 DESC;`

const SQL_TABLES = ['establishments', 'licences', 'users', 'classes', 'sessions', 'exercise_attempts', 'quiz_answers', 'hints_used', 'headsets']

const reportsStore = createStore<Report[]>('sql-reports', () => [
  { id: 'rp1', name: 'Sessions et réussite par établissement', scope: 'all', establishmentIds: [], sql: SQL_DEFAULT, schedule: 'monthly', email: 'r.amrani@comim.ma', visibility: 'team', owner: 'Rania Amrani', lastRun: '2026-09-01T07:00:00' },
  { id: 'rp2', name: 'Usage VR — Casablanca et Agadir', scope: 'selection', establishmentIds: ['imc', 'lma'], sql: SQL_DEFAULT.replace('JOIN sessions s ON', "JOIN sessions s ON s.device = 'VR' AND"), schedule: 'manual', email: '', visibility: 'me', owner: 'Rania Amrani' },
])

const blank = (owner: string): Report => ({ id: '', name: '', scope: 'all', establishmentIds: [], sql: SQL_DEFAULT, schedule: 'manual', email: '', visibility: 'me', owner })

function SqlReports({ period }: { period: Period }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const establishments = establishmentsStore.use()
  const reports = reportsStore.use()
  const me = user?.name ?? ''
  const [r, setR] = useState<Report>(() => blank(me))
  const [from, setFrom] = useState(PERIOD_RANGE[period][0])
  const [to, setTo] = useState(PERIOD_RANGE[period][1])
  const [result, setResult] = useState<{ name: string; sessions: number; exercises: number; passRate: number }[] | null>(null)
  const [view, setView] = useState<'table' | 'bars'>('table')
  const [error, setError] = useState('')

  const visible = reports.filter((x) => x.visibility === 'team' || x.owner === me)
  const scopeIds = r.scope === 'all' ? establishments.map((e) => e.id) : r.establishmentIds
  const set = (patch: Partial<Report>) => setR((p) => ({ ...p, ...patch }))

  const run = () => {
    setError('')
    // Read-only: anything that writes or changes the schema is refused
    if (/\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/i.test(r.sql)) return setError(t('usage.sqlReadOnlyError'))
    if (!/^\s*(select|with)\b/i.test(r.sql)) return setError(t('usage.sqlSelectError'))
    if (scopeIds.length === 0) return setError(t('usage.sqlScopeError'))
    const rows = establishments
      .filter((e) => scopeIds.includes(e.id))
      .map((e) => ({ name: e.name, ...(usageSeed[period][e.id] ?? { sessions: 0, exercises: 0, passRate: 0 }) }))
      .map(({ name, sessions, exercises, passRate }) => ({ name, sessions, exercises, passRate }))
      .sort((a, b) => b.sessions - a.sessions)
    setResult(rows)
    if (r.id) reportsStore.set((p) => p.map((x) => (x.id === r.id ? { ...x, lastRun: new Date().toISOString() } : x)))
    // Every run is written to the audit log
    addPlatformAudit({
      author: me,
      action: 'reportRun',
      target: r.name.trim() || t('usage.unsavedReport'),
      ref: { kind: 'report', label: r.name.trim() || t('usage.unsavedReport'), sub: r.scope === 'all' ? { code: 'allEstablishments' } : { code: 'nEstablishments', n: scopeIds.length } },
      changes: [{ field: 'rows', before: { code: 'none' }, after: { code: 'nRows', n: rows.length } }],
      establishmentId: '',
      screen: 'usage',
    })
  }

  const save = () => {
    const next = { ...r, id: r.id || uid('rp'), name: r.name.trim(), owner: r.owner || me }
    reportsStore.set((p) => (r.id ? p.map((x) => (x.id === r.id ? next : x)) : [...p, next]))
    setR(next)
    toast(t('usage.reportSaved'))
  }

  const exportResult = () =>
    result &&
    downloadCsv(`${(r.name.trim() || 'report').replace(/\s+/g, '-').toLowerCase()}.csv`, [['establishment', 'sessions', 'exercises', 'pass_rate'], ...result.map((x) => [x.name, x.sessions, x.exercises, x.passRate])])

  const field = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline-none'
  const lbl = 'block text-xs font-semibold text-slate-600'

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="self-start overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <h2 className="font-bold text-ink">{t('usage.savedReports')}</h2>
          <Button
            variant="secondary"
            className="py-1.5 text-xs"
            onClick={() => {
              setR(blank(me))
              setResult(null)
            }}
          >
            {t('usage.newReport')}
          </Button>
        </div>
        <ul className="divide-y divide-slate-100">
          {visible.length === 0 && <li className="px-5 py-6 text-sm text-muted">{t('usage.noReport')}</li>}
          {visible.map((x) => (
            <li key={x.id} className={cn('flex items-start gap-2 px-5 py-3', r.id === x.id && 'bg-sky-50')}>
              <button
                type="button"
                onClick={() => {
                  setR(x)
                  setResult(null)
                  setError('')
                }}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-semibold text-ink">{x.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {t(`usage.schedule.${x.schedule}`)} · {x.scope === 'all' ? t('usage.scopeAll') : t('usage.scopeN', { count: x.establishmentIds.length })}
                  {x.lastRun && ` · ${fmtDate(x.lastRun, lang)}`}
                </span>
              </button>
              {x.owner === me && (
                <button
                  type="button"
                  aria-label={`${t('bank.delete')} ${x.name}`}
                  title={t('bank.delete')}
                  onClick={() => {
                    reportsStore.set((p) => p.filter((y) => y.id !== x.id))
                    if (r.id === x.id) setR(blank(me))
                  }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-warning-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">{r.id ? t('usage.editReport') : t('usage.newReport')}</h2>
          <p className="mt-0.5 text-sm text-muted">{t('usage.sqlHint')}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className={lbl}>
              {t('usage.reportName')}
              <input value={r.name} onChange={(e) => set({ name: e.target.value })} className={field} />
            </label>
            <label className={lbl}>
              {t('usage.scope')}
              <select value={r.scope} onChange={(e) => set({ scope: e.target.value as Report['scope'] })} className={field}>
                <option value="all">{t('usage.scopeAll')}</option>
                <option value="selection">{t('usage.scopeSelection')}</option>
              </select>
            </label>
          </div>
          {r.scope === 'selection' && (
            <div className="mt-3 flex flex-wrap gap-2">
              {establishments.map((e) => {
                const on = r.establishmentIds.includes(e.id)
                return (
                  <label key={e.id} className={cn('flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm', on ? 'border-brand-500 bg-sky-50 font-semibold' : 'border-slate-200')}>
                    <input type="checkbox" checked={on} onChange={() => set({ establishmentIds: on ? r.establishmentIds.filter((x) => x !== e.id) : [...r.establishmentIds, e.id] })} />
                    {e.name}
                  </label>
                )
              })}
            </div>
          )}

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <label htmlFor="sql-editor" className={lbl}>
                {t('usage.sqlEditor')}
              </label>
              <textarea
                id="sql-editor"
                value={r.sql}
                onChange={(e) => set({ sql: e.target.value })}
                rows={11}
                spellCheck={false}
                className="mt-1.5 w-full rounded-xl border border-slate-700 bg-[#0A1633] px-4 py-3 font-mono text-[13px] leading-relaxed text-sky-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                {['readOnly', 'timeout', 'maxRows'].map((k) => (
                  <span key={k} className="rounded-full bg-slate-100 px-2.5 py-1">
                    {t(`usage.limit.${k}`)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className={lbl}>{t('usage.tables')}</div>
              <ul className="mt-1.5 max-h-[252px] space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                {SQL_TABLES.map((tb) => (
                  <li key={tb}>
                    <button type="button" onClick={() => set({ sql: `${r.sql.trimEnd()}\n-- ${tb}` })} title={t('usage.insertTable')} className="w-full rounded-lg px-2 py-1 text-left font-mono text-xs text-ink hover:bg-slate-100">
                      {tb}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className={lbl}>
              <span className="font-mono">:periode_debut</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={field} />
            </label>
            <label className={lbl}>
              <span className="font-mono">:periode_fin</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={field} />
            </label>
            <label className={lbl}>
              {t('usage.scheduleLabel')}
              <select value={r.schedule} onChange={(e) => set({ schedule: e.target.value as Report['schedule'] })} className={field}>
                {(['manual', 'weekly', 'monthly'] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(`usage.schedule.${s}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className={lbl}>
              {t('usage.visibility')}
              <select value={r.visibility} onChange={(e) => set({ visibility: e.target.value as Report['visibility'] })} className={field}>
                <option value="me">{t('usage.visibilityMe')}</option>
                <option value="team">{t('usage.visibilityTeam')}</option>
              </select>
            </label>
          </div>
          {r.schedule !== 'manual' && (
            <label className={cn(lbl, 'mt-4 max-w-md')}>
              {t('usage.scheduleEmail')}
              <input type="email" value={r.email} onChange={(e) => set({ email: e.target.value })} placeholder="nom@comim.ma" className={field} />
            </label>
          )}

          {error && (
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button onClick={run}>
              <Play className="h-4 w-4" />
              {t('platform.run')}
            </Button>
            <Button variant="secondary" disabled={!r.name.trim() || (r.schedule !== 'manual' && !/\S+@\S+\.\S+/.test(r.email))} onClick={save}>
              <Save className="h-4 w-4" />
              {t('common.save')}
            </Button>
            <span className="self-center text-xs text-muted">{t('usage.runLogged')}</span>
          </div>
        </Card>

        {result && (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="font-bold text-ink">{t('usage.result')}</h2>
                <p className="text-xs text-muted">
                  {t('usage.resultMeta', { count: result.length })} · {fmtDate(from, lang)} → {fmtDate(to, lang)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex rounded-xl border border-slate-200 p-0.5">
                  {(['table', 'bars'] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v} className={cn('inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold', view === v ? 'bg-navy-900 text-white' : 'text-muted')}>
                      {v === 'table' ? <Table2 className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                      {t(`usage.view.${v}`)}
                    </button>
                  ))}
                </div>
                <Button variant="secondary" className="py-1.5 text-xs" onClick={exportResult}>
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
            </div>
            {view === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className={thRow}>
                      {['establishment', 'sessions', 'exercises', 'pass_rate'].map((h) => (
                        <th key={h} className="px-6 py-3 font-mono normal-case">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.map((x) => (
                      <tr key={x.name} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-3 font-semibold text-ink">{x.name}</td>
                        <td className="px-6 py-3 tabular-nums">{fmtNumber(x.sessions, lang)}</td>
                        <td className="px-6 py-3 tabular-nums">{fmtNumber(x.exercises, lang)}</td>
                        <td className="px-6 py-3 tabular-nums">{x.passRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-4">
                {result.map((x) => (
                  <HBar key={x.name} label={x.name} value={x.sessions} max={Math.max(...result.map((y) => y.sessions))} text={fmtNumber(x.sessions, lang)} />
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

/* ------------------------------- page ------------------------------- */

type SortKey = 'name' | 'sessions' | 'users' | 'exercises' | 'passRate' | 'seatPct'

/**
 * Cross-establishment usage dashboard (COMIM Admin). The per-school detail stays in the
 * establishment sheet: this page shows trends, breakdowns and what needs attention.
 */
export default function Usage() {
  const { t } = useTranslation()
  const lang = useLang()
  const loc = useLoc()
  const establishments = establishmentsStore.use()
  const [period, setPeriod] = useState<Period>('thisMonth')
  const [plan, setPlan] = useState<Plan>('all')
  const [tab, setTab] = useState<Tab>('overview')

  const scope = establishments.filter((e) => plan === 'all' || e.plan === plan)
  const rows = scope.map((e) => ({ ...e, seatPct: Math.round((e.usedSeats / e.seats) * 100), ...(usageSeed[period][e.id] ?? { users: 0, sessions: 0, exercises: 0, passRate: 0 }) }))
  const sort = useSort(rows, 'sessions' as SortKey, (r, k) => r[k], false)
  const sum = (k: 'users' | 'sessions' | 'exercises') => rows.reduce((s, r) => s + r[k], 0)
  const weightedPass = Math.round(rows.reduce((s, r) => s + r.passRate * r.exercises, 0) / Math.max(1, sum('exercises')))
  const vrSessions = Math.round(rows.reduce((s, r) => s + (r.features.vr ? r.sessions * 0.38 : 0), 0))
  const webSessions = sum('sessions') - vrSessions
  const trend = TREND.map((w, i) => ({ label: t('usage.bucket', { n: i + 1 }), value: Math.round(sum('sessions') * w) }))
  const days = (iso: string) => Math.round((new Date(iso).getTime() - new Date(DEMO_NOW).getTime()) / 86400000)
  const watch = rows.flatMap((r) => [
    ...(r.status === 'Suspended' ? [{ id: r.id, name: r.name, text: t('usage.watch.suspended') }] : []),
    ...(r.seatPct >= 90 ? [{ id: r.id, name: r.name, text: t('usage.watch.seats', { pct: r.seatPct }) }] : []),
    ...(days(r.expiry) >= 0 && days(r.expiry) <= 30 ? [{ id: r.id, name: r.name, text: t('usage.watch.expiry', { date: fmtDate(r.expiry, lang) }) }] : []),
    ...(r.passRate > 0 && r.passRate < PASS_THRESHOLD ? [{ id: r.id, name: r.name, text: t('usage.watch.passRate', { pct: r.passRate }) }] : []),
  ])
  const modules = (Object.keys(MODULE_SHARE) as ModuleId[]).map((m) => ({ m, n: Math.round(sum('exercises') * MODULE_SHARE[m]), pass: m === 'finalQuiz' ? weightedPass : MODULE_PASS[m] }))
  const fleet = rows.map((r) => ({ ...r, ...(FLEET[r.id] ?? { headsets: 0, online: 0 }) }))

  const exportCsv = () =>
    downloadCsv(`usage-${period}-${plan}.csv`, [
      [t('platform.establishmentCol'), t('usage.plan'), t('common.status'), t('platform.usersCol'), t('platform.sessions'), t('platform.exercisesCol'), t('platform.quizPassRate'), t('usage.seatUsage')],
      ...sort.sorted.map((r) => [r.name, r.plan, r.status === 'Active' ? t('common.active') : t('common.suspended'), r.users, r.sessions, r.exercises, `${r.passRate}%`, `${r.usedSeats}/${r.seats}`]),
    ])

  return (
    <AppShell breadcrumb={[{ label: t('platform.usageTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-ink">{t('platform.usageTitle')}</h1>
              <p className="mt-1 text-sm text-muted">{t('usage.subtitle')}</p>
            </div>
            <div className="no-print flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                {t('platform.period')}
                <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={cn(inputSm, 'font-semibold')}>
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>
                      {t(`platform.periods.${p}`)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
                {t('usage.plan')}
                <select value={plan} onChange={(e) => setPlan(e.target.value as Plan)} className={cn(inputSm, 'font-semibold')}>
                  <option value="all">{t('usage.allPlans')}</option>
                  {(['Discovery', 'Establishment', 'Custom'] as const).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <Button variant="secondary" className="h-10 py-0" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="secondary" className="h-10 py-0" onClick={() => window.print()}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </Card>

        <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 pb-1" role="tablist">
          {TABS.map((x) => (
            <button key={x} type="button" role="tab" aria-selected={tab === x} onClick={() => setTab(x)} className={cn('rounded-xl px-4 py-2 text-sm font-semibold transition', tab === x ? 'bg-navy-900 text-white' : 'text-muted hover:bg-slate-100')}>
              {t(`usage.tabs.${x}`)}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label={t('platform.activeUsers')} value={fmtNumber(sum('users'), lang)} info={t('kpi.activeUsers')} />
              <StatCard label={t('platform.sessions')} value={fmtNumber(sum('sessions'), lang)} valueClassName="text-brand-600" info={t('kpi.sessions')} />
              <StatCard label={t('platform.exercisesCompleted')} value={fmtNumber(sum('exercises'), lang)} info={t('kpi.exercisesCompleted')} />
              <StatCard label={t('platform.quizPassRate')} value={`${weightedPass}%`} info={t('kpi.quizPassRate')} />
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <Panel title={t('usage.sessionsTrend')} hint={t(`platform.periods.${period}`)}>
                <VBars data={trend} />
              </Panel>
              <Panel title={t('usage.webVrSplit')} hint={t('usage.webVrHint')}>
                <div className="flex h-4 overflow-hidden rounded-full bg-slate-100" role="img" aria-label={`Web ${webSessions}, VR ${vrSessions}`}>
                  <div className="bg-brand-600" style={{ width: `${(webSessions / Math.max(1, sum('sessions'))) * 100}%` }} />
                  <div className="bg-sky-400" style={{ width: `${(vrSessions / Math.max(1, sum('sessions'))) * 100}%` }} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  {[
                    ['Web', webSessions, 'bg-brand-600'],
                    ['VR', vrSessions, 'bg-sky-400'],
                  ].map(([k, v, c]) => (
                    <div key={k as string} className="rounded-xl border border-slate-200 px-4 py-3">
                      <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
                        <span className={cn('h-2.5 w-2.5 rounded-full', c as string)} />
                        {k}
                      </dt>
                      <dd className="mt-1 text-2xl font-bold text-ink">
                        {fmtNumber(v as number, lang)} <span className="text-sm font-semibold text-muted">· {Math.round(((v as number) / Math.max(1, sum('sessions'))) * 100)} %</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </div>
            <Panel title={t('usage.toWatch')} hint={t('usage.toWatchHint')}>
              {watch.length === 0 ? (
                <p className="text-sm text-muted">{t('usage.nothingToWatch')}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {watch.map((w, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-warning-600" />
                        <Link to={`/platform/establishments/${w.id}`} className="font-semibold text-brand-600 hover:underline">
                          {w.name}
                        </Link>
                      </span>
                      <span className="text-muted">{w.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
        )}

        {tab === 'learning' && (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title={t('usage.exercisesPerModule')} hint={t(`platform.periods.${period}`)}>
                <VBars data={modules.map((x) => ({ label: loc(moduleNames[x.m]), value: x.n }))} />
              </Panel>
              <Panel title={t('usage.passRatePerModule')} hint={t('results.passMark', { pct: PASS_THRESHOLD })}>
                {modules
                  .filter((x) => x.pass != null)
                  .map((x) => (
                    <HBar key={x.m} label={loc(moduleNames[x.m])} value={x.pass!} text={`${x.pass} %`} tone={x.pass! >= PASS_THRESHOLD ? 'bg-success-600' : 'bg-warning-600'} />
                  ))}
              </Panel>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title={t('usage.hardestQuestions')} hint={t('usage.hardestQuestionsHint')}>
                {HARD_QUESTIONS.map(([id, pct]) => (
                  <HBar key={id} label={loc(comimQuestionBank.find((q) => q.id === id)?.q)} value={pct} text={t('usage.failRate', { pct })} tone="bg-warning-600" />
                ))}
              </Panel>
              <Panel title={t('usage.hardestSteps')} hint={t('usage.hardestStepsHint')}>
                {HARD_STEPS.map(([m, id, pct]) => {
                  const step = (m === 'startup' ? startupProcedure : repairProcedure).find((s) => s.id === id)
                  return <HBar key={id} label={`${loc(moduleNames[m])} · ${loc(step?.label)}`} value={pct} text={t('usage.failRate', { pct })} tone="bg-warning-600" />
                })}
              </Panel>
            </div>
            <Panel title={t('usage.hintUsage')} hint={t('usage.hintUsageHint')}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className={thRow}>
                      <th className="px-4 py-3">{t('teacher.exercise')}</th>
                      <th className="px-4 py-3">{t('usage.hintsPerAttempt')}</th>
                      <th className="px-4 py-3">{t('usage.level2Share')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HINTS.map((h) => (
                      <tr key={h.module} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3 font-semibold text-ink">{loc(moduleNames[h.module])}</td>
                        <td className="px-4 py-3 tabular-nums">{new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: 1 }).format(h.perAttempt)}</td>
                        <td className="px-4 py-3 tabular-nums">{h.level2 ? `${h.level2} %` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}

        {tab === 'establishments' && (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <Panel title={t('usage.seatUsage')} hint={t('usage.seatUsageHint')}>
                {rows.map((r) => (
                  <HBar key={r.id} label={r.name} to={`/platform/establishments/${r.id}`} value={r.seatPct} text={`${r.usedSeats} / ${r.seats}`} tone={r.seatPct >= 90 ? 'bg-warning-600' : 'bg-brand-600'} />
                ))}
              </Panel>
              <Panel title={t('usage.fleet')} hint={t('usage.fleetHint')}>
                {fleet.map((r) => (
                  <HBar key={r.id} label={r.name} to={`/platform/establishments/${r.id}`} value={r.online} max={Math.max(1, r.headsets)} text={r.headsets ? t('usage.fleetValue', { online: r.online, total: r.headsets }) : t('usage.noHeadset')} tone="bg-success-600" />
                ))}
              </Panel>
            </div>
            <Card className="overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="text-lg font-bold text-ink">{t('usage.ranking')}</h2>
                <p className="mt-0.5 text-sm text-muted">{t('usage.rankingHint')}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className={thRow}>
                      <th className="w-12 px-6 py-3">#</th>
                      <SortTh label={t('platform.establishmentCol')} k="name" sort={sort} />
                      <SortTh label={t('platform.usersCol')} k="users" sort={sort} />
                      <SortTh label={t('platform.sessions')} k="sessions" sort={sort} />
                      <SortTh label={t('platform.exercisesCol')} k="exercises" sort={sort} />
                      <SortTh label={t('platform.quizPassRate')} k="passRate" sort={sort} />
                      <SortTh label={t('usage.seatUsage')} k="seatPct" sort={sort} />
                    </tr>
                  </thead>
                  <tbody>
                    {sort.sorted.map((r, i) => (
                      <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                        <td className="px-6 py-3.5 font-bold text-muted">{i + 1}</td>
                        <td className="px-4 py-3.5">
                          <Link to={`/platform/establishments/${r.id}`} className="font-semibold text-brand-600 hover:underline">
                            {r.name}
                          </Link>
                          <span className="ml-2 inline-flex gap-1.5 align-middle">
                            <Badge tone="gray">{r.plan}</Badge>
                            {r.status === 'Suspended' && <Badge tone="orange">{t('common.suspended')}</Badge>}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 tabular-nums">{fmtNumber(r.users, lang)}</td>
                        <td className="px-4 py-3.5 font-semibold tabular-nums">{fmtNumber(r.sessions, lang)}</td>
                        <td className="px-4 py-3.5 tabular-nums">{fmtNumber(r.exercises, lang)}</td>
                        <td className="px-4 py-3.5 tabular-nums">{r.passRate}%</td>
                        <td className="px-4 py-3.5 tabular-nums">{r.seatPct}%</td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-muted">
                          {t('dash.noMatch')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {tab === 'sql' && <SqlReports key={period} period={period} />}
      </div>
    </AppShell>
  )
}
