import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { ResultsView } from '@/components/training/ResultsView'
import { useAuth } from '@/context/AuthContext'
import { useLoc } from '@/lib/i18n'
import { moduleNames } from '@/data/content'
import { addSchoolAudit, attemptNumber, attemptsStore, classesStore, effectiveScore, studentsStore } from '@/data/stores'

export function AttemptDetail() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const { user } = useAuth()
  const attempts = attemptsStore.use()
  const students = studentsStore.use()
  const classes = classesStore.use()
  const attempt = attempts.find((a) => a.id === attemptId)
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState(attempt ? effectiveScore(attempt) : 0)
  const [why, setWhy] = useState('')
  if (!attempt) return <Navigate to="/teacher" replace />
  const student = students.find((s) => s.id === attempt.studentId)
  const cls = classes.find((c) => c.id === student?.classId)
  const n = attemptNumber(attempts, attempt)

  const adjust = () => {
    const before = effectiveScore(attempt)
    attemptsStore.set((p) => p.map((a) => (a.id === attempt.id ? { ...a, adjustedScore: score } : a)))
    addSchoolAudit({
      author: user?.name ?? '',
      profile: 'teacher',
      action: 'scoreAdjustment',
      target: `${student?.name} · ${moduleNames[attempt.module].en}: ${before}% → ${score}%`,
      ref: { kind: 'student', id: student?.id, label: student?.name ?? '', sub: moduleNames[attempt.module] },
      changes: [{ field: 'score', before: `${before} %`, after: `${score} %` }],
      screen: 'studentProfile',
      justification: why.trim(),
    })
    setOpen(false)
    setWhy('')
  }

  return (
    <AppShell
      breadcrumb={[
        { label: t('teacher.myClasses'), to: '/teacher' },
        { label: cls?.name.split(' ')[0] ?? '', to: `/teacher/classes/${cls?.id}` },
        { label: student?.firstName ?? '', to: `/teacher/students/${student?.id}` },
        { label: `${loc(moduleNames[attempt.module])} #${n}` },
      ]}
    >
      <div className="-mx-4 -my-4 sm:-mx-6 sm:-my-6">
        {attempt.module !== 'tour' && (
          <div className="mx-auto flex max-w-5xl justify-end px-4 pt-6 sm:px-6">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
              {t('dash.adjustScore')}
            </Button>
          </div>
        )}
        <ResultsView attempt={attempt} attemptNo={n} menuPath={`/teacher/students/${student?.id}`} menuLabel={t('teacher.backToStudentProfile')} showResultsLink={false} />
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('dash.adjustScore')}
        subtitle={t('dash.adjustScoreHint')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button disabled={why.trim().length < 5} onClick={adjust}>
              {t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label={`${t('teacher.score')} (%)`}>
            <input type="number" min={0} max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} className={fieldClass} />
          </Field>
          <Field label={t('dash.justification')}>
            <textarea value={why} onChange={(e) => setWhy(e.target.value)} rows={3} className={fieldClass} placeholder={t('dash.justificationPlaceholder')} />
          </Field>
        </div>
      </Modal>
    </AppShell>
  )
}
