import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Archive, Check, KeyRound, PauseCircle, Play, PlayCircle, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CustomKpiChart, DailyExercisesChart, ThresholdBarChart } from '@/components/charts/KpiCharts'
import { fmtDate, fmtNumber, useLang } from '@/lib/i18n'
import { FEATURES, usageSeed } from '@/data/mock'
import { addPlatformAudit, establishmentsStore } from '@/data/stores'
import { cn } from '@/lib/cn'

const dailyExercises = [
  { day: 'mon', value: 112 },
  { day: 'tue', value: 145 },
  { day: 'wed', value: 98 },
  { day: 'thu', value: 167 },
  { day: 'fri', value: 203 },
  { day: 'sat', value: 54 },
  { day: 'sun', value: 21 },
]
const byClass = [
  { label: '2A — Marine Mech.', value: 48 },
  { label: '2B — Deck Off.', value: 55 },
  { label: '3A — Electrotech.', value: 82 },
  { label: '3B — Boilermaking', value: 28 },
]
const byTeacher = [
  { label: 'Mounia Ferhat', value: 58 },
  { label: 'Karim Alaoui', value: 52 },
]
const byYear = [
  { label: '2026–2027', value: 61 },
  { label: '2025–2026', value: 74 },
]

const DEFAULT_SQL = `SELECT date_trunc('week', completed_at) AS week, count(*) AS attempts
FROM exercise_attempts WHERE establishment_id = :id
GROUP BY 1 ORDER BY 1;`

export default function EstablishmentDetail() {
  const { t } = useTranslation()
  const lang = useLang()
  const { id } = useParams<{ id: string }>()
  const establishments = establishmentsStore.use()
  const est = establishments.find((e) => e.id === id) ?? establishments[0]
  const usage = usageSeed.thisMonth[est.id] ?? { users: 0, sessions: 0, exercises: 0, passRate: 0 }
  const [showSql, setShowSql] = useState(false)
  const [sql, setSql] = useState(DEFAULT_SQL)
  const [customChart, setCustomChart] = useState<number[] | null>(null)

  const toggleStatus = () => {
    const next = est.status === 'Active' ? 'Suspended' : 'Active'
    establishmentsStore.set((p) => p.map((e) => (e.id === est.id ? { ...e, status: next } : e)))
    addPlatformAudit({ author: 'Rania Amrani', action: next === 'Suspended' ? 'establishmentSuspension' : 'establishmentReactivation', target: est.name, establishmentId: est.id })
  }

  return (
    <AppShell breadcrumb={[{ label: t('platform.establishments'), to: '/platform/establishments' }, { label: est.name }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{est.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span>{est.city}</span>
                <span>·</span>
                <span>{est.plan}</span>
                <Badge tone={est.status === 'Active' ? 'green' : 'orange'} dot>
                  {est.status === 'Active' ? t('common.active') : t('common.suspended')}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="orange" className="rounded-full" onClick={toggleStatus}>
                {est.status === 'Active' ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                {est.status === 'Active' ? t('platform.suspend') : t('platform.reactivate')}
              </Button>
              <Button variant="danger" className="rounded-full border-red-300 text-red-600 hover:bg-red-50">
                <Archive className="h-4 w-4" />
                {t('platform.archive')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('platform.activeUsers')} value={usage.users} info={t('kpi.activeUsers')} />
          <StatCard label={t('platform.sessions')} value={fmtNumber(usage.sessions, lang)} valueClassName="text-brand-600" info={t('kpi.sessions')} />
          <StatCard label={t('platform.exercisesCompleted')} value={fmtNumber(usage.exercises, lang)} info={t('kpi.exercisesCompleted')} />
          <StatCard label={t('platform.quizPassRate')} value={`${usage.passRate}%`} info={t('kpi.quizPassRate')} />
        </div>
        {est.status === 'Suspended' && <p className="rounded-xl bg-orange-50 px-4 py-2 text-sm text-orange-800">{t('platform.suspendedNote')}</p>}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">{t('platform.planLicense')}</h2>
                <p className="mt-1 text-sm text-muted">{t('platform.readOnlyHere')}</p>
              </div>
              <Link to={`/platform/licenses?q=${encodeURIComponent(est.name)}`}>
                <Button variant="secondary">
                  <KeyRound className="h-4 w-4" />
                  {t('platform.editInLicences')}
                </Button>
              </Link>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              {[
                [t('platform.plan'), est.plan],
                [t('platform.numberOfSeats'), `${est.usedSeats} / ${est.seats}`],
                [t('platform.licenseExpiry'), fmtDate(est.expiry, lang)],
                [t('platform.firstClientAdminLabel'), est.admin],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-200 px-4 py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="mt-1 font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-ink">{t('platform.enabledFeatures')}</h2>
            <p className="mt-1 text-sm text-muted">{t('platform.readOnlyHere')}</p>
            <ul className="mt-5 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-ink">{t(`platform.features.${f}`)}</span>
                  <Badge tone={est.features[f] ? 'green' : 'gray'}>
                    {est.features[f] ? <Check className="mr-1 inline h-3 w-3" /> : <X className="mr-1 inline h-3 w-3" />}
                    {est.features[f] ? t('admin.enabled') : t('admin.disabled')}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">{t('platform.establishmentKpis')}</h2>
              <p className="mt-1 text-sm text-muted">{t('platform.establishmentKpisHint')}</p>
            </div>
            <Button variant="secondary" onClick={() => setShowSql((v) => !v)} aria-expanded={showSql}>
              <Plus className={cn('h-4 w-4 transition', showSql && 'rotate-45')} />
              {t('platform.customKpi')}
            </Button>
          </div>

          {showSql && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t('platform.newCustomKpi')}</h3>
                <Button onClick={() => setCustomChart([42, 58, 61, 73, 69, 80, 77])}>
                  <Play className="h-3.5 w-3.5" />
                  {t('platform.run')}
                </Button>
              </div>
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                rows={4}
                spellCheck={false}
                className="w-full rounded-xl border border-slate-700 bg-[#0A1633] px-4 py-3 font-mono text-sm leading-relaxed text-sky-100 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
              <p className="mt-3 text-sm text-muted">{t('platform.customKpiNote')}</p>
            </div>
          )}

          {customChart && (
            <div className="mt-8">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t('platform.customKpiResult')}</h3>
              <div className="mt-4">
                <CustomKpiChart values={customChart} />
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{t('platform.exercisesPerDay')}</h3>
            <div className="mt-4">
              <DailyExercisesChart labels={dailyExercises.map((d) => t(`platform.days.${d.day}`))} values={dailyExercises.map((d) => d.value)} highlightIndex={4} />
            </div>
          </div>

          <div className="mt-10 grid gap-8 sm:gap-6 lg:grid-cols-3">
            <ThresholdBarChart title={t('platform.byClass')} labels={byClass.map((i) => i.label)} values={byClass.map((i) => i.value)} />
            <ThresholdBarChart title={t('platform.byTeacher')} labels={byTeacher.map((i) => i.label)} values={byTeacher.map((i) => i.value)} />
            <ThresholdBarChart title={t('platform.bySchoolYear')} labels={byYear.map((i) => i.label)} values={byYear.map((i) => i.value)} />
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
