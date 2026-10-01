import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRightLeft, ChevronRight, Headphones, Monitor, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { InfoTip } from '@/components/ui/InfoTip'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { Pagination, SortTh, inputSm, thRow, usePaged, useSort } from '@/components/ui/Table'
import { useAuth } from '@/context/AuthContext'
import { fmtDate, fmtDateTime, fmtDuration, useLang, useLoc } from '@/lib/i18n'
import { CURRENT_YEAR } from '@/data/mock'
import { moduleNames, PASS_THRESHOLD, type ModuleId } from '@/data/content'
import {
  addSchoolAudit,
  attemptNumber,
  attemptsStore,
  assignmentsStore,
  classesStore,
  effectiveScore,
  settingsStore,
  studentProgress,
  studentsStore,
} from '@/data/stores'

type SortKey = 'module' | 'n' | 'date' | 'device' | 'duration' | 'score' | 'status'

export function StudentProfile() {
  const { studentId } = useParams<{ studentId: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const { user } = useAuth()
  const students = studentsStore.use()
  const classes = classesStore.use()
  const attempts = attemptsStore.use()
  const assignments = assignmentsStore.use()
  const settings = settingsStore.use()
  const student = students.find((s) => s.id === studentId) ?? students[0]
  const cls = classes.find((c) => c.id === student.classId)
  const progress = studentProgress(student, assignments, attempts)

  const [query, setQuery] = useState('')
  const [exercise, setExercise] = useState<'all' | ModuleId>('all')
  const [device, setDevice] = useState<'all' | 'Web' | 'VR'>('all')
  const [moving, setMoving] = useState(false)
  const [newClass, setNewClass] = useState(student.classId)

  const rows = attempts
    .filter((a) => a.studentId === student.id)
    .map((a) => ({ ...a, n: attemptNumber(attempts, a), name: loc(moduleNames[a.module]), eff: effectiveScore(a) }))
    .filter((a) => (exercise === 'all' || a.module === exercise) && (device === 'all' || a.device === device))
    .filter((a) => !query.trim() || `${a.name} ${a.device} ${fmtDateTime(a.date, lang)}`.toLowerCase().includes(query.trim().toLowerCase()))

  const sort = useSort(rows, 'date' as SortKey, (r, k) =>
    k === 'module' ? r.name : k === 'n' ? r.n : k === 'date' ? r.date : k === 'device' ? r.device : k === 'duration' ? r.durationSec : k === 'score' ? r.eff : r.status,
  false)
  const paged = usePaged(sort.sorted, 10)

  const moveClass = () => {
    if (newClass === student.classId) return setMoving(false)
    const target = classes.find((c) => c.id === newClass)
    studentsStore.set((p) => p.map((s) => (s.id === student.id ? { ...s, classId: newClass } : s)))
    addSchoolAudit({ author: user?.name ?? '', profile: 'teacher', action: 'classChange', target: `${student.name}: ${cls?.name.split(' ')[0]} → ${target?.name.split(' ')[0]}`, screen: 'studentProfile' })
    setMoving(false)
  }

  return (
    <AppShell
      breadcrumb={[
        { label: t('teacher.myClasses'), to: '/teacher' },
        { label: cls?.name.split(' ')[0] ?? '', to: `/teacher/classes/${cls?.id}` },
        { label: student.firstName },
      ]}
    >
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-lg font-bold text-white">{student.initials}</div>
              <div>
                <h1 className="text-2xl font-bold text-ink">{student.name}</h1>
                <p className="mt-1 text-sm text-muted">
                  {cls?.name} · {student.email}
                </p>
                <p className="text-sm text-muted">
                  {t('teacher.lastActivity')}: {fmtDate(student.lastActivity, lang)}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Badge tone={student.finalQuiz === 'Completed' ? 'green' : student.finalQuiz === 'Locked' ? 'gray' : 'blue'}>
                {t('teacher.finalQuizStatus', { status: t(student.finalQuiz === 'Completed' ? 'common.completed' : student.finalQuiz === 'Locked' ? 'common.locked' : 'common.open') })}
              </Badge>
              <div className="flex flex-wrap justify-end gap-2">
                {settings.delegation && (
                  <Button variant="secondary" onClick={() => setMoving(true)}>
                    <ArrowRightLeft className="h-4 w-4" />
                    {t('dash.changeClass')}
                  </Button>
                )}
                <Link to={`/teacher/live/${student.id}`}>
                  <Button variant="secondary">
                    <Monitor className="h-4 w-4" />
                    {t('teacher.viewLive')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={progress} className="max-w-xs flex-1" />
            <span className="text-sm font-semibold">
              {progress}% {t('teacher.overallProgress')}
            </span>
            <InfoTip text={t('kpi.progressRule')} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-ink">{t('dash.allAttempts')}</h2>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
              </div>
              <select value={exercise} onChange={(e) => setExercise(e.target.value as 'all' | ModuleId)} className={inputSm} aria-label={t('teacher.exercise')}>
                <option value="all">{t('dash.allExercises')}</option>
                {(Object.keys(moduleNames) as ModuleId[]).map((m) => (
                  <option key={m} value={m}>
                    {loc(moduleNames[m])}
                  </option>
                ))}
              </select>
              <select value={device} onChange={(e) => setDevice(e.target.value as 'all' | 'Web' | 'VR')} className={inputSm} aria-label={t('dash.device')}>
                <option value="all">{t('dash.allDevices')}</option>
                <option value="Web">Web</option>
                <option value="VR">VR</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('teacher.exercise')} k="module" sort={sort} className="px-6" />
                  <SortTh label={t('teacher.attempt')} k="n" sort={sort} />
                  <SortTh label={t('dash.dateTime')} k="date" sort={sort} />
                  <SortTh label={t('dash.device')} k="device" sort={sort} />
                  <SortTh label={t('teacher.duration')} k="duration" sort={sort} />
                  <SortTh label={t('teacher.score')} k="score" sort={sort} />
                  <SortTh label={t('common.status')} k="status" sort={sort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.slice.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted">
                      {t('teacher.noAttemptsYet')}
                    </td>
                  </tr>
                ) : (
                  paged.slice.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="px-6 py-3.5 font-semibold text-ink">{a.name}</td>
                      <td className="px-4 py-3.5 text-muted">#{a.n}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted">{fmtDateTime(a.date, lang)}</td>
                      <td className="px-4 py-3.5 text-muted">
                        <span className="inline-flex items-center gap-1">
                          {a.device === 'VR' ? <Headphones className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                          {a.device}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted">{fmtDuration(a.durationSec)}</td>
                      <td className="px-4 py-3.5 font-semibold">
                        {a.module === 'tour' ? '—' : `${a.eff}%`}
                        {a.adjustedScore != null && <span className="ml-1 text-xs font-normal text-muted">({t('results.adjusted')})</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {a.status === 'abandoned' ? (
                          <Badge tone="gray">{t('results.abandoned')}</Badge>
                        ) : (
                          <Badge tone={a.module === 'tour' || a.eff >= PASS_THRESHOLD ? 'green' : 'orange'}>
                            {a.module === 'tour' ? t('common.completed') : a.eff >= PASS_THRESHOLD ? t('common.passed') : t('common.needsReview')}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link to={`/teacher/attempts/${a.id}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                          {t('teacher.view')}
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination paged={paged} />
        </Card>
      </div>

      <Modal
        open={moving}
        onClose={() => setMoving(false)}
        title={t('dash.changeClass')}
        subtitle={t('dash.changeClassHint')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setMoving(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={moveClass}>{t('common.save')}</Button>
          </>
        }
      >
        <Field label={t('admin.classCol')}>
          <select value={newClass} onChange={(e) => setNewClass(e.target.value)} className={fieldClass}>
            {classes
              .filter((c) => c.schoolYear === CURRENT_YEAR)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </Field>
      </Modal>
    </AppShell>
  )
}
