import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Download, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { SortTh, inputSm, useSort } from '@/components/ui/Table'
import { downloadCsv } from '@/lib/csv'
import { fmtNumber, useLang } from '@/lib/i18n'
import { usageSeed, type Period } from '@/data/mock'
import { establishmentsStore } from '@/data/stores'

type SortKey = 'name' | 'status' | 'users' | 'sessions' | 'exercises' | 'passRate'

export default function Usage() {
  const { t } = useTranslation()
  const lang = useLang()
  const establishments = establishmentsStore.use()
  const [period, setPeriod] = useState<Period>('thisMonth')

  const rows = establishments.map((e) => ({ id: e.id, name: e.name, status: e.status, ...(usageSeed[period][e.id] ?? { users: 0, sessions: 0, exercises: 0, passRate: 0 }) }))
  const sort = useSort(rows, 'name' as SortKey, (r, k) => r[k])
  const sum = (k: 'users' | 'sessions' | 'exercises') => rows.reduce((s, r) => s + r[k], 0)
  const weightedPass = Math.round(rows.reduce((s, r) => s + r.passRate * r.exercises, 0) / Math.max(1, sum('exercises')))
  const periodLabel = t(`platform.periods.${period}`)

  const exportCsv = () =>
    downloadCsv(`usage-${period}.csv`, [
      [t('platform.establishmentCol'), t('common.status'), t('platform.usersCol'), t('platform.sessions'), t('platform.exercisesCol'), t('platform.quizPassRate')],
      ...sort.sorted.map((r) => [r.name, r.status === 'Active' ? t('common.active') : t('common.suspended'), r.users, r.sessions, r.exercises, `${r.passRate}%`]),
    ])

  return (
    <AppShell breadcrumb={[{ label: t('platform.usageTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('platform.usageTitle')}</h1>
              <p className="mt-1 text-sm text-muted">
                {t('platform.usageSubtitle')} · {periodLabel}
              </p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <label className="relative">
                <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className={`${inputSm} appearance-none pr-8 pl-9 font-semibold`} aria-label={t('platform.period')}>
                  {(['thisMonth', 'lastMonth', 'last90', 'thisYear'] as Period[]).map((p) => (
                    <option key={p} value={p}>
                      {t(`platform.periods.${p}`)}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="secondary" onClick={exportCsv}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button variant="secondary" onClick={() => window.print()}>
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('platform.activeUsers')} value={fmtNumber(sum('users'), lang)} info={t('kpi.activeUsers')} />
          <StatCard label={t('platform.sessions')} value={fmtNumber(sum('sessions'), lang)} valueClassName="text-brand-600" info={t('kpi.sessions')} />
          <StatCard label={t('platform.exercisesCompleted')} value={fmtNumber(sum('exercises'), lang)} info={t('kpi.exercisesCompleted')} />
          <StatCard label={t('platform.quizPassRate')} value={`${weightedPass}%`} info={t('kpi.quizPassRate')} />
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold text-ink">{t('platform.detailByEstablishment')}</h2>
            <p className="mt-1 text-sm text-muted">{t('platform.detailByEstablishmentHint')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-muted">
                  <SortTh label={t('platform.establishmentCol')} k="name" sort={sort} className="px-6" />
                  <SortTh label={t('common.status')} k="status" sort={sort} />
                  <SortTh label={t('platform.usersCol')} k="users" sort={sort} />
                  <SortTh label={t('platform.sessions')} k="sessions" sort={sort} />
                  <SortTh label={t('platform.exercisesCol')} k="exercises" sort={sort} />
                  <SortTh label={t('platform.quizPassRate')} k="passRate" sort={sort} />
                  <th className="w-10 px-4 py-3" aria-hidden />
                </tr>
              </thead>
              <tbody>
                {sort.sorted.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <Link to={`/platform/establishments/${row.id}`} className="font-semibold text-ink hover:text-brand-600">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={row.status === 'Active' ? 'green' : 'orange'} dot>
                        {row.status === 'Active' ? t('common.active') : t('common.suspended')}
                      </Badge>
                      {row.status === 'Suspended' && period === 'thisMonth' && <div className="mt-1 text-xs text-muted">{t('platform.suspendedSince')}</div>}
                    </td>
                    <td className="px-4 py-4 font-medium text-ink">{fmtNumber(row.users, lang)}</td>
                    <td className="px-4 py-4 font-medium text-ink">{fmtNumber(row.sessions, lang)}</td>
                    <td className="px-4 py-4 font-medium text-ink">{fmtNumber(row.exercises, lang)}</td>
                    <td className="px-4 py-4 font-medium text-ink">{row.passRate}%</td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/platform/establishments/${row.id}`} className="inline-flex text-slate-300 hover:text-brand-600" aria-label={t('platform.detail')}>
                        <ChevronRight className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
