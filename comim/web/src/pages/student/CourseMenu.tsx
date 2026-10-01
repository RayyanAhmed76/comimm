import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, ClipboardList, Lock, Map, Search, Wrench, Boxes, PlayCircle, RotateCcw, PlayIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { Tooltip } from '@/components/ui/InfoTip'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { fmtDateTime, useLang, useLoc } from '@/lib/i18n'
import { moduleNames, type ModuleId } from '@/data/content'
import { attemptsFor, attemptsStore, effectiveScore, progressKey, progressStore, studentsStore } from '@/data/stores'

function scoreTone(score: number) {
  if (score >= 85) return 'bg-[#E8F5E9] text-[#2E7D32]'
  if (score >= 70) return 'bg-[#E3F2FD] text-[#1565C0]'
  return 'bg-[#FFF3E0] text-[#E65100]'
}

export default function CourseMenu() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const attempts = attemptsStore.use()
  const saved = progressStore.use()
  const students = studentsStore.use()
  const studentId = user?.studentId ?? ''
  const me = students.find((s) => s.id === studentId)

  const exercises: { id: ModuleId; desc: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'tour', desc: t('student.guidedTourDesc'), to: '/student/guided-tour', icon: Map },
    { id: 'identification', desc: t('student.identificationDesc'), to: '/student/identification', icon: Search },
    { id: 'startup', desc: t('student.startupDesc'), to: '/student/startup', icon: PlayCircle },
    { id: 'repair', desc: t('student.repairDesc'), to: '/student/repair', icon: Wrench },
    { id: 'finalQuiz', desc: t('student.finalQuizDesc'), to: '/student/final-quiz', icon: ClipboardList },
  ]

  const restart = (m: ModuleId, to: string) => {
    progressStore.set((p) => {
      const n = { ...p }
      delete n[progressKey(studentId, m)]
      return n
    })
    navigate(to)
  }

  const row = (icon: React.ComponentType<{ className?: string }>, label: string, desc: string, right: React.ReactNode) => {
    const Icon = icon
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-[#E0E4E8] bg-white px-5 py-4 shadow-sm transition hover:border-sky-300 hover:shadow-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF2FF]">
          <Icon className="h-5 w-5 text-[#4A90E2]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-[#1A202C]">{label}</div>
          <div className="text-sm text-[#718096]">{desc}</div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {right}
          <ChevronRight className="h-4 w-4 text-[#A0AEC0]" />
        </div>
      </div>
    )
  }

  return (
    <TrainingShell dark={false}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0A1633]">{t('student.hello', { name: user?.firstName ?? '' })}</h1>
          <p className="mt-2 text-sm text-[#718096]">{t('menu.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {exercises.map((m) => {
            const list = attemptsFor(attempts, studentId, m.id).filter((a) => a.status === 'completed')
            const last = list[list.length - 1]
            const sp = saved[progressKey(studentId, m.id)]
            let badge: React.ReactNode = null

            if (m.id === 'finalQuiz') {
              const st = me?.finalQuiz ?? 'Locked'
              badge =
                st === 'Locked' ? (
                  <Tooltip content={t('menu.quizLockedTip')}>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEEEEE] px-3 py-1 text-xs font-bold text-[#757575]">
                      <Lock className="h-3 w-3" />
                      {t('common.locked')}
                    </span>
                  </Tooltip>
                ) : st === 'Open' ? (
                  <Tooltip content={t('menu.quizOpenTip')}>
                    <span className="rounded-full bg-[#E3F2FD] px-3 py-1 text-xs font-bold text-[#1565C0]">{t('common.open')}</span>
                  </Tooltip>
                ) : (
                  <Tooltip content={last ? t('menu.lastScoreTip', { score: effectiveScore(last), count: list.length }) : ''}>
                    <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#2E7D32]">{t('common.completed')}</span>
                  </Tooltip>
                )
            } else if (m.id === 'tour') {
              badge = last ? <span className="rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-bold text-[#2E7D32]">{t('common.completed')}</span> : null
            } else if (last) {
              badge = (
                <Tooltip content={t('menu.lastScoreTip', { score: effectiveScore(last), count: list.length })}>
                  <span tabIndex={0} className={cn('rounded-full px-3 py-1 text-xs font-bold', scoreTone(effectiveScore(last)))}>
                    {effectiveScore(last)}%
                  </span>
                </Tooltip>
              )
            }

            return (
              <div key={m.id}>
                <Link to={m.to}>{row(m.icon, loc(moduleNames[m.id]), m.desc, badge)}</Link>
                {sp && (
                  <div className="mx-3 -mt-1 flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border border-t-0 border-sky-200 bg-sky-50 px-4 py-2.5 text-sm">
                    <span className="text-sky-900">{t('menu.savedOn', { date: fmtDateTime(sp.savedAt, lang) })}</span>
                    <span className="flex gap-2">
                      <button type="button" onClick={() => restart(m.id, m.to)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted hover:bg-white">
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t('menu.restart')}
                      </button>
                      <Link to={m.to} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                        <PlayIcon className="h-3.5 w-3.5" />
                        {t('menu.resume')}
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          <Link to="/student/results">{row(BookOpen, t('student.myResults'), t('student.myResultsDesc'), null)}</Link>
          <Link to="/student/catalog">{row(Boxes, t('student.catalog'), t('student.catalogDesc'), null)}</Link>
        </div>
      </div>
    </TrainingShell>
  )
}
