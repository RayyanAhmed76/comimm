import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Box, ChevronRight, ClipboardList, Lock, Map, Search, Wrench, Boxes, PlayCircle, RotateCcw, PlayIcon, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
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

type Icon = React.ComponentType<{ className?: string }>

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
  const [confirmRestart, setConfirmRestart] = useState<{ id: ModuleId; to: string } | null>(null)

  const exercises: { id: ModuleId; desc: string; to: string; icon: Icon }[] = [
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
    setConfirmRestart(null)
    navigate(to)
  }

  const row = (IconC: Icon, label: string, desc: string, right: React.ReactNode) => (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EBF2FF]">
        <IconC className="h-5 w-5 text-[#4A90E2]" />
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

  const tile = 'block overflow-hidden rounded-2xl border border-[#E0E4E8] bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md'

  return (
    <TrainingShell dark={false}>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0A1633]">{t('student.hello', { name: user?.firstName ?? '' })}</h1>
          <p className="mt-2 text-sm text-[#718096]">{t('menu.subtitle')}</p>
        </div>

        {/* One flex column: the same gap between ALL tiles */}
        <div className="flex flex-col gap-3">
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

            // The saved block is part of its tile: same card, same width, a divider in between
            return (
              <div key={m.id} className={cn(tile, sp && 'border-sky-300')}>
                <Link to={m.to} className="block">
                  {row(m.icon, loc(moduleNames[m.id]), m.desc, badge)}
                </Link>
                {sp && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-sky-200 bg-sky-50 px-5 py-3 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-sky-900">
                      <Save className="h-4 w-4" />
                      {t('menu.savedOn', { date: fmtDateTime(sp.savedAt, lang) })}
                    </span>
                    <span className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRestart({ id: m.id, to: m.to })}
                        className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        {t('menu.restart')}
                      </button>
                      <Link to={m.to} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                        <PlayIcon className="h-3.5 w-3.5" />
                        {t('menu.resume')}
                      </Link>
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          <Link to="/student/exploded" className={tile}>
            {row(Box, t('student.explodedView'), t('exploded.desc'), null)}
          </Link>
          <Link to="/student/results" className={tile}>
            {row(BookOpen, t('student.myResults'), t('student.myResultsDesc'), null)}
          </Link>
          <Link to="/student/catalog" className={tile}>
            {row(Boxes, t('student.catalog'), t('student.catalogDesc'), null)}
          </Link>
        </div>
      </div>

      <Modal
        open={!!confirmRestart}
        onClose={() => setConfirmRestart(null)}
        size="sm"
        title={t('menu.restartTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRestart(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={() => confirmRestart && restart(confirmRestart.id, confirmRestart.to)}>
              <RotateCcw className="h-4 w-4" />
              {t('menu.restart')}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed">{t('menu.restartWarning', { name: confirmRestart ? loc(moduleNames[confirmRestart.id]) : '' })}</p>
      </Modal>
    </TrainingShell>
  )
}
