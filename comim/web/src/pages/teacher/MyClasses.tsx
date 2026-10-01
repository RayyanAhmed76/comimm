import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronRight, LayoutGrid, Search, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Card, StatCard } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Pagination, SortTh, inputSm, thRow, usePaged, useSort } from '@/components/ui/Table'
import { Tooltip } from '@/components/ui/InfoTip'
import { useAuth } from '@/context/AuthContext'
import { useLoc } from '@/lib/i18n'
import { CURRENT_YEAR, SCHOOL_YEARS } from '@/data/mock'
import { moduleNames } from '@/data/content'
import {
  assignmentsStore,
  attemptsStore,
  classesStore,
  classProgress,
  classStatus,
  studentProgress,
  studentsStore,
  type ClassStatus,
} from '@/data/stores'

export function statusTone(status: ClassStatus): 'blue' | 'green' | 'gray' {
  if (status === 'Advanced') return 'green'
  if (status === 'Starting') return 'gray'
  return 'blue'
}

export function statusKey(status: ClassStatus) {
  if (status === 'Advanced') return 'common.advanced'
  if (status === 'Starting') return 'common.starting'
  return 'common.inProgress'
}

type KpiFilter = 'all' | 'belowAvg' | 'quizToOpen'

export function MyClasses() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loc = useLoc()
  const { user } = useAuth()
  const classes = classesStore.use()
  const students = studentsStore.use()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [track, setTrack] = useState('all')
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [kpi, setKpi] = useState<KpiFilter>('all')

  const mine = classes.filter((c) => c.teacherIds.includes(user?.id ?? '') && c.schoolYear === year)
  const rows = useMemo(
    () =>
      mine.map((c) => {
        const list = students.filter((s) => s.classId === c.id)
        const progress = classProgress(c.id, students, assignments, attempts)
        const readyForQuiz = list.filter((s) => s.finalQuiz === 'Locked' && studentProgress(s, assignments, attempts) === 100).length
        const mods = Array.from(new Set(assignments.filter((a) => a.classId === c.id).map((a) => a.module)))
        return { ...c, headcount: list.length, progress, status: classStatus(progress), readyForQuiz, content: mods.map((m) => loc(moduleNames[m])).join(' · ') }
      }),
    [mine, students, assignments, attempts, loc],
  )

  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0
  const totalStudents = rows.reduce((s, r) => s + r.headcount, 0)
  const quizzesToOpen = rows.reduce((s, r) => s + r.readyForQuiz, 0)
  const tracks = Array.from(new Set(rows.map((r) => r.track)))

  const filtered = rows.filter((r) => {
    if (track !== 'all' && r.track !== track) return false
    if (status !== 'all' && r.status !== status) return false
    if (kpi === 'belowAvg' && r.progress >= avg) return false
    if (kpi === 'quizToOpen' && r.readyForQuiz === 0) return false
    const q = query.trim().toLowerCase()
    return !q || `${r.name} ${r.track}`.toLowerCase().includes(q)
  })
  const sort = useSort(filtered, 'name' as 'name' | 'track' | 'headcount' | 'progress' | 'status', (r, k) => (k === 'headcount' || k === 'progress' ? r[k] : String(r[k])))
  const paged = usePaged(sort.sorted, 8)
  const anyFilter = track !== 'all' || status !== 'all' || query || kpi !== 'all'

  return (
    <AppShell breadcrumb={[{ label: t('teacher.myClasses') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('teacher.myClasses')}</h1>
              <p className="mt-1 text-sm text-muted">{t('teacher.myClassesSubtitle')}</p>
            </div>
            <label className="relative">
              <span className="sr-only">{t('admin.schoolYear')}</span>
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select value={year} onChange={(e) => setYear(e.target.value)} className={`${inputSm} appearance-none pr-8 pl-9 font-semibold`}>
                {SCHOOL_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {t('teacher.year', { year: y })}
                    {y === CURRENT_YEAR ? ` (${t('dash.current')})` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('teacher.activeClasses')} value={rows.length} info={t('kpi.activeClasses')} onClick={() => setKpi('all')} active={kpi === 'all'} />
          <StatCard label={t('teacher.studentsTracked')} value={totalStudents} info={t('kpi.studentsTracked')} onClick={() => setKpi('all')} />
          <StatCard label={t('teacher.averageProgress')} value={`${avg}%`} info={t('kpi.averageProgress')} onClick={() => setKpi('belowAvg')} active={kpi === 'belowAvg'} />
          <StatCard label={t('teacher.quizzesToOpen')} value={quizzesToOpen} info={t('kpi.quizzesToOpen')} onClick={() => setKpi('quizToOpen')} active={kpi === 'quizToOpen'} valueClassName={quizzesToOpen ? 'text-brand-600' : undefined} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink">{t('teacher.classes')}</h2>
              {kpi !== 'all' && <Badge tone="blue">{t(kpi === 'belowAvg' ? 'dash.filterBelowAvg' : 'dash.filterQuizToOpen')}</Badge>}
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={track} onChange={(e) => setTrack(e.target.value)} className={inputSm} aria-label={t('teacher.track')}>
                <option value="all">{t('dash.allTracks')}</option>
                {tracks.map((tr) => (
                  <option key={tr}>{tr}</option>
                ))}
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputSm} aria-label={t('common.status')}>
                <option value="all">{t('dash.allStatuses')}</option>
                {(['Starting', 'In Progress', 'Advanced'] as ClassStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {t(statusKey(s))}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
              </div>
              {anyFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setTrack('all')
                    setStatus('all')
                    setQuery('')
                    setKpi('all')
                  }}
                  className="inline-flex items-center gap-1 rounded-xl px-3 text-sm font-semibold text-muted hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                  {t('dash.clearFilters')}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('teacher.className')} k="name" sort={sort} className="px-6" />
                  <SortTh label={t('teacher.track')} k="track" sort={sort} />
                  <SortTh label={t('teacher.headcount')} k="headcount" sort={sort} />
                  <th className="px-4 py-3">{t('teacher.assignedContent')}</th>
                  <SortTh label={t('common.progress')} k="progress" sort={sort} info={t('kpi.progressRule')} />
                  <SortTh label={t('common.status')} k="status" sort={sort} info={t('kpi.statusRule')} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((cls) => (
                  <tr key={cls.id} onClick={() => navigate(`/teacher/classes/${cls.id}`)} className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-navy-800">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-ink">{cls.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">{cls.track}</td>
                    <td className="px-4 py-4 text-muted">
                      {cls.headcount} {t('common.students').toLowerCase()}
                    </td>
                    <td className="px-4 py-4 text-muted">{cls.content || '—'}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={cls.progress} className="max-w-[120px]" />
                        <span className="text-xs font-semibold text-muted">{cls.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Tooltip content={t('kpi.statusRule')}>
                        <Badge tone={statusTone(cls.status)} dot>
                          {t(statusKey(cls.status))}
                        </Badge>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="h-4 w-4 text-muted" />
                    </td>
                  </tr>
                ))}
                {paged.slice.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted">
                      {t('dash.noMatch')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination paged={paged} />
        </Card>
      </div>
    </AppShell>
  )
}
