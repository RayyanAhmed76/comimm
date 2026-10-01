import { Link } from 'react-router-dom'
import { ChevronRight, Hand, Lock, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { VrShell } from '@/pages/vr/VrChrome'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { moduleNames, type ModuleId } from '@/data/content'
import { attemptsFor, attemptsStore, effectiveScore, progressKey, progressStore, studentsStore } from '@/data/stores'
import { useNavigate } from 'react-router-dom'

export default function VrMenu() {
  const { t } = useTranslation()
  const loc = useLoc()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const attempts = attemptsStore.use()
  const saved = progressStore.use()
  const students = studentsStore.use()
  const studentId = user?.studentId ?? ''
  // Final Quiz status is read from the same source as the Web menu
  const quizStatus = students.find((s) => s.id === studentId)?.finalQuiz ?? 'Locked'

  const modules: { id: ModuleId | 'exploded'; to: string }[] = [
    { id: 'tour', to: '/vr/guided-tour' },
    { id: 'identification', to: '/vr/identification' },
    { id: 'startup', to: '/vr/startup' },
    { id: 'repair', to: '/vr/repair' },
    { id: 'finalQuiz', to: '/vr/final-quiz' },
    { id: 'exploded', to: '/vr/exploded' },
  ]

  return (
    <VrShell
      badge={t('vr.vrCourseMenu')}
      hints={[t('vr.pinchSelect'), t('vr.menuForControls')]}
      menuItems={[
        { label: t('vr.replayGestures'), icon: Hand, onClick: () => navigate('/vr?replay=1') },
        {
          label: t('common.logOut'),
          icon: LogOut,
          onClick: () => {
            logout()
            navigate('/vr')
          },
        },
      ]}
    >
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
        <h1 className="text-3xl font-bold">{t('student.hello', { name: user?.firstName ?? '' })}</h1>
        <p className="mt-1 text-slate-300">{t('vr.vrModulesSubtitle')}</p>

        <div className="mt-8 space-y-3">
          {modules.map((mod) => {
            const isModule = mod.id !== 'exploded'
            const label = isModule ? loc(moduleNames[mod.id as ModuleId]) : t('student.explodedView')
            const list = isModule ? attemptsFor(attempts, studentId, mod.id as ModuleId).filter((a) => a.status === 'completed') : []
            const last = list[list.length - 1]
            const locked = mod.id === 'finalQuiz' && quizStatus !== 'Open'
            const sp = isModule ? saved[progressKey(studentId, mod.id as ModuleId)] : undefined
            return (
              <Link
                key={mod.id}
                to={locked ? '#' : mod.to}
                onClick={(e) => locked && e.preventDefault()}
                aria-disabled={locked}
                className={cn(
                  'flex items-center justify-between rounded-2xl border px-5 py-4 transition',
                  locked ? 'cursor-not-allowed border-white/5 bg-navy-900/40 opacity-60' : 'border-white/10 bg-navy-900/60 hover:border-sky-400/30',
                )}
              >
                <div className="flex items-center gap-3">
                  {locked && <Lock className="h-4 w-4 text-slate-400" />}
                  <span className="font-semibold">{label}</span>
                  {sp && <Badge tone="blue">{t('menu.resume')}</Badge>}
                </div>
                <div className="flex items-center gap-3">
                  {mod.id === 'finalQuiz' ? (
                    <Badge tone={quizStatus === 'Open' ? 'blue' : quizStatus === 'Completed' ? 'green' : 'gray'}>
                      {quizStatus === 'Open' ? t('common.open') : quizStatus === 'Completed' ? t('common.completed') : t('common.locked')}
                    </Badge>
                  ) : mod.id === 'tour' && last ? (
                    <Badge tone="green">{t('common.completed')}</Badge>
                  ) : last ? (
                    <span title={t('menu.lastScoreTip', { score: effectiveScore(last), count: list.length })} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      {effectiveScore(last)}%
                    </span>
                  ) : null}
                  {!locked && <ChevronRight className="h-5 w-5 text-slate-400" />}
                </div>
              </Link>
            )
          })}
        </div>

        <Link to="/vr?replay=1" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/15 hover:bg-white/15">
          <Hand className="h-4 w-4" />
          {t('vr.replayGestures')}
        </Link>
      </div>
    </VrShell>
  )
}
