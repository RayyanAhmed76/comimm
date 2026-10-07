import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Headphones, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { fmtDateTime, fmtDuration, useLang, useLoc } from '@/lib/i18n'
import { moduleNames, PASS_THRESHOLD, type ModuleId } from '@/data/content'
import { attemptsFor, attemptsStore, effectiveScore, progressKey, progressStore } from '@/data/stores'

const ORDER: ModuleId[] = ['tour', 'identification', 'startup', 'repair', 'finalQuiz']
/** Attempts shown per exercise before "See all" */
const SHOWN = 3

const select = 'h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-ink shadow-sm focus:border-brand-500 focus:outline-none'

export default function MyResults() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const attempts = attemptsStore.use()
  const saved = progressStore.use()
  const studentId = user?.studentId ?? ''
  const [exercise, setExercise] = useState<ModuleId | 'all'>('all')
  const [device, setDevice] = useState<'all' | 'Web' | 'VR'>('all')
  const [expanded, setExpanded] = useState<ModuleId[]>([])

  const badge = (tone: 'pass' | 'review' | 'abandoned' | 'done', label: string) => (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-[11px] font-bold',
        tone === 'pass' && 'bg-[#E8F5E9] text-[#2E7D32]',
        tone === 'done' && 'bg-[#E8F5E9] text-[#2E7D32]',
        tone === 'review' && 'bg-[#FFF3E0] text-[#E65100]',
        tone === 'abandoned' && 'bg-slate-200 text-slate-700',
      )}
    >
      {label}
    </span>
  )

  return (
    <TrainingShell dark={false} crumbs={[{ label: t('student.courseMenu'), to: '/student' }, { label: t('student.myResults') }]}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-center text-3xl font-bold text-[#0A1633]">{t('student.myResultsTitle')}</h1>
        <p className="mt-2 text-center text-sm text-[#718096]">{t('results.allAttemptsHint')}</p>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('results.exerciseLabel')}
              <select value={exercise} onChange={(e) => setExercise(e.target.value as ModuleId | 'all')} className={select}>
                <option value="all">{t('results.filterExercise')}</option>
                {ORDER.map((m) => (
                  <option key={m} value={m}>
                    {loc(moduleNames[m])}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('results.deviceLabel')}
              <select value={device} onChange={(e) => setDevice(e.target.value as 'all' | 'Web' | 'VR')} className={select}>
                <option value="all">{t('results.filterDevice')}</option>
                <option value="Web">Web</option>
                <option value="VR">VR</option>
              </select>
            </label>
          </div>
          <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-brand-700">{t('results.passMark', { pct: PASS_THRESHOLD })}</span>
        </div>

        <div className="mt-5 space-y-5">
          {ORDER.filter((m) => exercise === 'all' || m === exercise).map((m) => {
            // Attempt numbers follow the chronological order; the list shows the newest first
            const all = attemptsFor(attempts, studentId, m).map((a, i) => ({ a, n: i + 1 }))
            const list = all.filter(({ a }) => device === 'all' || a.device === device).reverse()
            const completed = all.filter(({ a }) => a.status === 'completed')
            const best = completed.length ? Math.max(...completed.map(({ a }) => effectiveScore(a))) : null
            const last = completed.length ? effectiveScore(completed[completed.length - 1].a) : null
            const sp = saved[progressKey(studentId, m)]
            const open = expanded.includes(m)
            const shown = open ? list : list.slice(0, SHOWN)
            return (
              <section key={m} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#0A1633]">{loc(moduleNames[m])}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {m !== 'tour' && best != null && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                        {t('results.best')} <span className="font-bold text-ink">{best} %</span>
                      </span>
                    )}
                    {m !== 'tour' && last != null && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                        {t('results.last')} <span className="font-bold text-ink">{last} %</span>
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{t('results.attemptsCount', { count: all.length })}</span>
                  </div>
                </div>

                {all.length === 0 && !sp && <p className="mt-3 text-sm text-muted">{t('results.noAttempt')}</p>}
                {all.length > 0 && list.length === 0 && <p className="mt-3 text-sm text-muted">{t('results.noMatch')}</p>}
                <ul className="mt-2 divide-y divide-slate-100">
                  {sp && (
                    <li className="flex items-center justify-between gap-3 px-2 py-3 text-sm">
                      <span className="text-sky-800">{t('menu.savedOn', { date: fmtDateTime(sp.savedAt, lang) })}</span>
                      <Link to={`/student/${m === 'tour' ? 'guided-tour' : m === 'finalQuiz' ? 'final-quiz' : m}`} className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                        {t('menu.resume')}
                      </Link>
                    </li>
                  )}
                  {shown.map(({ a, n }) => {
                    const score = effectiveScore(a)
                    const passed = score >= PASS_THRESHOLD
                    return (
                      <li key={a.id}>
                        <Link to={`/student/attempt/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1A202C]">
                              {t('teacher.attempt')} {n}
                              {a.status === 'abandoned'
                                ? badge('abandoned', t('results.abandoned'))
                                : m === 'tour'
                                  ? badge('done', t('common.completed'))
                                  : passed
                                    ? badge('pass', t('common.passed'))
                                    : badge('review', t('common.needsReview'))}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                              <span>{fmtDateTime(a.date, lang)}</span>
                              <span className="inline-flex items-center gap-1">
                                {a.device === 'VR' ? <Headphones className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                                {a.device}
                              </span>
                              <span>{fmtDuration(a.durationSec)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {m !== 'tour' && (
                              <span className="text-sm font-bold text-[#1A202C]">
                                {a.correct}/{a.total} · {score} %
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-[#A0AEC0]" />
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                {list.length > SHOWN && (
                  <button
                    type="button"
                    onClick={() => setExpanded((p) => (open ? p.filter((x) => x !== m) : [...p, m]))}
                    aria-expanded={open}
                    className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-slate-50"
                  >
                    <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                    {open ? t('results.seeLess') : t('results.seeAll', { count: list.length })}
                  </button>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </TrainingShell>
  )
}
