import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Clock, Lock, SkipForward } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { ModuleShell, useModuleEnv } from '@/components/training/ModuleShell'
import { ResultsView } from '@/components/training/ResultsView'
import { activeBank, bankStateStore, drawQuiz, quizBankStore, quizInProgressStore, quizSettingsFor, quizSettingsStore, studentsStore } from '@/data/stores'
import type { Attempt, AttemptItem } from '@/data/mock'
import { QUIZ_LENGTH, type QuizQuestion } from '@/data/content'
import type { L } from '@/lib/i18n'

const join = (ls: L[]): L => ({ en: ls.map((l) => l.en).join(' + '), fr: ls.map((l) => l.fr).join(' + ') })

export default function FinalQuizModule() {
  const env = useModuleEnv('finalQuiz')
  const { t } = useTranslation()
  const loc = useLoc()
  const students = studentsStore.use()
  const bank = quizBankStore.use()
  const allSettings = quizSettingsStore.use()
  const me = students.find((s) => s.id === env.studentId)
  const settings = quizSettingsFor(allSettings, me?.classId ?? '2a')

  // Drawn from the questions ACTIVE for the student's class
  const [questions] = useState<QuizQuestion[]>(() => drawQuiz(activeBank(bank, bankStateStore.get(), me?.classId ?? '2a'), settings))
  const [queue, setQueue] = useState<number[]>(() => questions.map((_, i) => i))
  const [answers, setAnswers] = useState<(number[] | null)[]>(() => questions.map(() => null))
  const [selected, setSelected] = useState<number[]>([])
  const [secondsLeft, setSecondsLeft] = useState(settings.timeLimit * 60)
  const [result, setResult] = useState<Omit<Attempt, 'id' | 'studentId'> | null>(null)

  const locked = !env.preview && me && me.finalQuiz !== 'Open'

  // While an attempt is running the component catalogue is closed for this student
  const sid = env.preview || locked ? undefined : env.studentId
  useEffect(() => {
    if (!sid) return
    quizInProgressStore.set((p) => (p.includes(sid) ? p : [...p, sid]))
  }, [sid])

  const finish = (ans: (number[] | null)[], status: 'completed' | 'abandoned') => {
    const items: AttemptItem[] = questions.map((q, i) => {
      const a = ans[i]
      const ok = !!a && a.length === q.correct.length && a.every((x) => q.correct.includes(x))
      return {
        label: q.q,
        given: a ? join(a.map((x) => q.options[x])) : { en: '— (no answer)', fr: '— (sans réponse)' },
        expected: join(q.correct.map((x) => q.options[x])),
        correct: ok,
        explanation: q.explanation,
        part: q.media?.kind === 'part' ? q.media.part : undefined,
      }
    })
    const correct = items.filter((i) => i.correct).length
    const data = { correct, total: questions.length, score: Math.round((correct / questions.length) * 100), status, items }
    env.record(data)
    quizInProgressStore.set((p) => p.filter((x) => x !== env.studentId))
    if (!env.preview && env.studentId) studentsStore.set((p) => p.map((s) => (s.id === env.studentId ? { ...s, finalQuiz: 'Completed' } : s)))
    return { ...data, module: 'finalQuiz' as const, date: new Date().toISOString(), device: env.device, durationSec: env.elapsed() }
  }

  // Time limit set by the teacher
  useEffect(() => {
    if (result || locked) return
    if (secondsLeft <= 0) {
      setResult(finish(answers, 'completed'))
      return
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, result, locked])

  const current = queue[0]
  const q = questions[current]
  const answeredCount = answers.filter(Boolean).length
  const safetyCount = useMemo(() => questions.filter((x) => x.topic === 'Safety').length, [questions])

  if (locked) {
    return (
      <ModuleShell env={env} dark={false}>
        <div className="mx-auto max-w-md px-6 py-16 text-center text-ink">
          <Lock className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold">{me?.finalQuiz === 'Completed' ? t('quiz.alreadyDone') : t('quiz.lockedTitle')}</h1>
          <p className="mt-2 text-sm text-muted">{me?.finalQuiz === 'Completed' ? t('quiz.alreadyDoneHint') : t('quiz.lockedHint')}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to={env.menuPath} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">{t('results.backToMenu')}</Link>
            {env.device === 'Web' && <Link to="/student/results" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">{t('student.myResults')}</Link>}
          </div>
        </div>
      </ModuleShell>
    )
  }

  if (result) {
    return (
      <ModuleShell env={env} dark={env.device === 'VR'}>
        <div className={env.device === 'VR' ? '' : 'bg-[#F4F7F9] text-ink'}>
          <ResultsView attempt={result} menuPath={env.menuPath} showResultsLink={!env.preview && env.device === 'Web'} compact={env.device === 'VR'} retryPath={env.preview ? env.retryPath : undefined} />
        </div>
      </ModuleShell>
    )
  }

  const toggle = (idx: number) => {
    if (q.multi) setSelected((p) => (p.includes(idx) ? p.filter((i) => i !== idx) : [...p, idx]))
    else setSelected([idx])
  }

  const confirm = () => {
    const nextAnswers = answers.map((a, i) => (i === current ? selected : a))
    setAnswers(nextAnswers)
    setSelected([])
    const rest = queue.slice(1)
    if (rest.length === 0) {
      setResult(finish(nextAnswers, 'completed'))
      return
    }
    setQueue(rest)
  }

  const skip = () => {
    setSelected([])
    setQueue((qq) => [...qq.slice(1), qq[0]])
  }

  const topicTone = q.topic === 'Safety' ? 'text-red-600' : q.topic === 'Procedure' ? 'text-brand-600' : 'text-sky-700'
  const dark = env.device === 'VR'
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')

  return (
    <ModuleShell env={env} dark={dark} exit={{ kind: 'quiz', onDiscard: () => finish(answers, 'abandoned') }} vrHints={[t('vr.pinchSelect'), t('vr.menuForControls')]}>
      <div className={cn('flex-1', !dark && 'bg-[#F4F7F9] text-ink')}>
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className={cn('text-sm font-medium', dark ? 'text-slate-300' : 'text-[#718096]')}>
                {t('student.questionProgress', { current: answeredCount + 1 > QUIZ_LENGTH ? QUIZ_LENGTH : answeredCount + 1, total: questions.length })}
                <span className="ml-2 text-xs">· {t('quiz.safetyCount', { count: safetyCount })}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {questions.map((_, i) => (
                  <span key={i} className={cn('h-1.5 w-4 rounded-full sm:w-5', answers[i] ? (dark ? 'bg-sky-400' : 'bg-[#0A1633]') : i === current ? 'bg-brand-500' : dark ? 'bg-white/20' : 'bg-slate-200')} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', topicTone)}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {t(`quiz.topic.${q.topic}`)}
              </span>
              <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums', secondsLeft < 120 ? 'bg-red-100 text-red-700' : dark ? 'bg-white/10' : 'bg-white ring-1 ring-slate-200')}>
                <Clock className="h-4 w-4" />
                {mm}:{ss}
              </span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-ink shadow-sm">
              <div className="flex items-start gap-3">
                <h2 className="flex-1 text-xl font-bold text-[#0A1633]">{loc(q.q)}</h2>
                <SpeakButton key={q.id} text={loc(q.q)} />
              </div>
              <p className="mt-1 text-sm text-[#718096]">{q.multi ? t('student.oneOrMore') : t('student.selectOne')}</p>
              <div className="mt-5 space-y-3">
                {q.options.map((opt, idx) => {
                  const on = selected.includes(idx)
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggle(idx)}
                      aria-pressed={on}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition',
                        on ? 'border-brand-600 bg-sky-50 text-[#0A1633]' : 'border-slate-200 bg-white text-[#1A202C] hover:border-slate-300',
                      )}
                    >
                      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center border-2', q.multi ? 'rounded-md' : 'rounded-full', on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300')}>
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      {loc(opt)}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid-blueprint min-h-[260px] overflow-hidden rounded-2xl">
              {q.media?.kind === 'part' ? (
                <MachineView highlight={[q.media.part]} focus={q.media.part} showLabels={false} dimOthers wheelZoom={false} className="p-2" />
              ) : q.media?.kind === 'image' ? (
                <img src={q.media.dataUrl} alt={q.media.name} className="h-full w-full bg-white object-contain" />
              ) : (
                <MachineView showLabels={false} wheelZoom={false} className="p-2" />
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            {settings.allowSkip && queue.length > 1 && (
              <Button variant="secondary" className="rounded-full px-5" onClick={skip}>
                <SkipForward className="h-4 w-4" />
                {t('quiz.skip')}
              </Button>
            )}
            <Button className="rounded-full px-6" disabled={selected.length === 0} onClick={confirm}>
              {queue.length === 1 ? t('quiz.submit') : t('common.confirm')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}
