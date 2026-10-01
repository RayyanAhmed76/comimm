import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { ResultsView } from '@/components/training/ResultsView'
import { useAuth } from '@/context/AuthContext'
import { useLoc } from '@/lib/i18n'
import { moduleNames } from '@/data/content'
import { attemptNumber, attemptsStore } from '@/data/stores'

const modulePath = { tour: 'guided-tour', identification: 'identification', startup: 'startup', repair: 'repair', finalQuiz: 'final-quiz' } as const

export default function AttemptDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { t } = useTranslation()
  const loc = useLoc()
  const attempts = attemptsStore.use()
  const attempt = attempts.find((a) => a.id === id && a.studentId === user?.studentId)
  if (!attempt) return <Navigate to="/student/results" replace />
  const n = attemptNumber(attempts, attempt)

  return (
    <TrainingShell
      dark={false}
      crumbs={[
        { label: t('student.courseMenu'), to: '/student' },
        { label: t('student.myResults'), to: '/student/results' },
        { label: `${loc(moduleNames[attempt.module])} · ${t('teacher.attempt')} ${n}` },
      ]}
    >
      <ResultsView
        attempt={attempt}
        attemptNo={n}
        menuPath="/student"
        retryPath={attempt.module === 'finalQuiz' ? undefined : `/student/${modulePath[attempt.module]}`}
      />
    </TrainingShell>
  )
}
