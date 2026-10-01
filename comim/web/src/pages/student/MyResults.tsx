import { Link } from 'react-router-dom'
import { ChevronRight, Headphones, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { fmtDateTime, fmtDuration, useLang, useLoc } from '@/lib/i18n'
import { moduleNames, PASS_THRESHOLD, type ModuleId } from '@/data/content'
import { attemptsFor, attemptsStore, effectiveScore, progressKey, progressStore } from '@/data/stores'

const ORDER: ModuleId[] = ['tour', 'identification', 'startup', 'repair', 'finalQuiz']

export default function MyResults() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const attempts = attemptsStore.use()
  const saved = progressStore.use()
  const studentId = user?.studentId ?? ''

  return (
    <TrainingShell dark={false} crumbs={[{ label: t('student.courseMenu'), to: '/student' }, { label: t('student.myResults') }]}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-center text-3xl font-bold text-[#0A1633]">{t('student.myResultsTitle')}</h1>
        <p className="mt-2 text-center text-sm text-[#718096]">{t('results.allAttemptsHint')}</p>

        <div className="mt-8 space-y-5">
          {ORDER.map((m) => {
            const list = attemptsFor(attempts, studentId, m)
            const sp = saved[progressKey(studentId, m)]
            return (
              <section key={m} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#A0AEC0]">{loc(moduleNames[m])}</h2>
                {list.length === 0 && !sp && <p className="mt-3 text-sm text-muted">{t('results.noAttempt')}</p>}
                <ul className="mt-2 divide-y divide-slate-100">
                  {list.map((a, i) => {
                    const score = effectiveScore(a)
                    return (
                      <li key={a.id}>
                        <Link to={`/student/attempt/${a.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-[#1A202C]">
                              {t('teacher.attempt')} {i + 1}
                              {a.status === 'abandoned' && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">{t('results.abandoned')}</span>}
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
                              <span className={cn('text-sm font-bold', score >= PASS_THRESHOLD ? 'text-[#2E7D32]' : 'text-[#E65100]')}>
                                {a.correct}/{a.total} · {score}%
                              </span>
                            )}
                            {m === 'tour' && <span className="text-sm font-bold text-[#2E7D32]">{a.status === 'completed' ? t('common.completed') : ''}</span>}
                            <ChevronRight className="h-4 w-4 text-[#A0AEC0]" />
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                  {sp && (
                    <li className="flex items-center justify-between gap-3 px-2 py-3 text-sm">
                      <span className="text-sky-800">{t('menu.savedOn', { date: fmtDateTime(sp.savedAt, lang) })}</span>
                      <Link to={`/student/${m === 'tour' ? 'guided-tour' : m === 'finalQuiz' ? 'final-quiz' : m}`} className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                        {t('menu.resume')}
                      </Link>
                    </li>
                  )}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </TrainingShell>
  )
}
