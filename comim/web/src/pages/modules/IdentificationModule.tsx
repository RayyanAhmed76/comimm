import { useState } from 'react'
import { Check, Lightbulb, Volume2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { ModuleShell, useModuleEnv } from '@/components/training/ModuleShell'
import { ResultsView } from '@/components/training/ResultsView'
import { drawIdentification, type IdQuestion } from '@/data/content'
import type { Attempt, AttemptItem } from '@/data/mock'

type Saved = { index: number; answers: number[]; questions?: IdQuestion[] }

export default function IdentificationModule() {
  const env = useModuleEnv('identification')
  const { t } = useTranslation()
  const loc = useLoc()
  const saved = env.saved?.state as Saved | undefined
  // 8 different parts drawn for this attempt (kept when the exercise is saved and resumed)
  const [questions] = useState<IdQuestion[]>(() => saved?.questions ?? drawIdentification())
  const [index, setIndex] = useState(saved?.questions ? saved.index : 0)
  const [answers, setAnswers] = useState<number[]>(saved?.questions ? saved.answers : [])
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [hint, setHint] = useState(false)
  const [result, setResult] = useState<Omit<Attempt, 'id' | 'studentId'> | null>(null)

  const total = questions.length
  const q = questions[index]

  const items = (ans: number[]): AttemptItem[] =>
    questions.slice(0, ans.length).map((iq, i) => ({
      label: iq.question,
      kind: iq.kind,
      part: iq.part,
      given: iq.options[ans[i]],
      expected: iq.options[iq.correct],
      correct: ans[i] === iq.correct,
      explanation: iq.explanation,
    }))

  const finish = (ans: number[], status: 'completed' | 'abandoned') => {
    const its = items(ans)
    const correct = its.filter((i) => i.correct).length
    const data = { correct, total, score: Math.round((correct / total) * 100), status, items: its }
    env.record(data)
    return { ...data, module: 'identification' as const, date: new Date().toISOString(), device: env.device, durationSec: env.elapsed() }
  }

  const confirm = () => {
    if (selected == null) return
    setAnswers((a) => [...a, selected])
    setConfirmed(true)
  }

  const next = () => {
    if (index >= total - 1) {
      setResult(finish(answers, 'completed'))
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setConfirmed(false)
    setHint(false)
  }

  if (result) {
    return (
      <ModuleShell env={env} dark={env.device === 'VR'}>
        <div className={env.device === 'VR' ? '' : 'bg-[#F4F7F9] text-ink'}>
          <ResultsView attempt={result} retryPath={env.retryPath} menuPath={env.menuPath} showResultsLink={!env.preview && env.device === 'Web'} compact={env.device === 'VR'} />
        </div>
      </ModuleShell>
    )
  }

  const isCorrect = confirmed && answers[index] === q.correct
  const progress = ((index + (confirmed ? 1 : 0)) / total) * 100

  return (
    <ModuleShell
      env={env}
      exit={{
        kind: 'exercise',
        onSave: () => env.save({ index: confirmed ? index + 1 : index, answers, questions }),
        onDiscard: () => finish(answers, 'abandoned'),
      }}
      vrHints={[t('vr.pinchSelect'), t('vr.menuForControls')]}
      vrMenuItems={[{ label: t('ex.hint'), icon: Lightbulb, onClick: () => setHint(true) }, { label: t('audio.play'), icon: Volume2, onClick: () => (document.querySelector('#q-audio-wrap button') as HTMLButtonElement | null)?.click() }]}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[320px] flex-1 p-3 sm:p-4 lg:min-h-0">
          {/* The highlighted part is framed automatically for each question */}
          <MachineView highlight={[q.part]} focus={q.part} showLabels={confirmed} guide={env.device === 'VR' && hint ? q.part : null} dimOthers />
        </div>

        <aside className="w-full shrink-0 p-3 sm:p-4 lg:min-h-0 lg:w-[45%] lg:max-w-[560px] lg:min-w-[440px] lg:overflow-y-auto lg:py-6 lg:pr-6 lg:pl-2">
          <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white text-[#0A1633] shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-slate-200/80">
            {/* Thin progress bar at the very top of the card */}
            <div className="h-1.5 w-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
              <div className="h-full bg-[#1d5ed8] transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>

            <div className="px-6 pt-5 pb-5">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1d5ed8]">{t(`results.kind.${q.kind}`)}</div>
                <span className="text-xs font-semibold text-slate-500">{t('ex.questionOf', { current: index + 1, total })}</span>
              </div>
              <h2 className="mt-3 text-xl leading-snug font-bold">{loc(q.question)}</h2>

              {/* Audio and hint on their own row, under the question */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span id="q-audio-wrap">
                  <SpeakButton key={q.id} text={loc(q.question)} className="px-3 py-1.5" />
                </span>
                {!confirmed && !hint && (
                  <button type="button" onClick={() => setHint(true)} className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50">
                    <Lightbulb className="h-3.5 w-3.5" />
                    {t('common.showHint')}
                  </button>
                )}
              </div>
              {!confirmed && hint && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-800">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="flex-1">{loc(q.hint)}</span>
                  <SpeakButton text={loc(q.hint)} auto />
                </div>
              )}
            </div>

            <div className="space-y-3.5 px-6">
              {q.options.map((opt, i) => {
                const on = selected === i
                const showCorrect = confirmed && i === q.correct
                const showWrong = confirmed && on && i !== q.correct
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={confirmed}
                    onClick={() => setSelected(i)}
                    aria-pressed={on}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-sm leading-snug font-medium transition',
                      showCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-800',
                      showWrong && 'border-red-400 bg-red-50 text-red-700',
                      !confirmed && on && 'border-[#1d5ed8] bg-sky-50 text-[#0A1633] ring-2 ring-[#1d5ed8]/20',
                      !confirmed && !on && 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                      confirmed && !showCorrect && !showWrong && 'border-slate-200 opacity-60',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        showCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : showWrong ? 'border-red-400 bg-red-400 text-white' : on ? 'border-[#1d5ed8] bg-[#1d5ed8]' : 'border-slate-300',
                      )}
                    >
                      {showCorrect && <Check className="h-3 w-3" />}
                      {showWrong && <X className="h-3 w-3" />}
                    </span>
                    {loc(opt)}
                  </button>
                )
              })}
            </div>

            {confirmed && (
              <div className={cn('mx-6 mt-4 rounded-xl px-4 py-3 text-sm', isCorrect ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-900')}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{isCorrect ? t('ex.rightAnswer') : t('ex.wrongAnswer')}</span>
                  <SpeakButton text={loc(q.explanation)} auto />
                </div>
                <p className="mt-1">{loc(q.explanation)}</p>
              </div>
            )}

            <div className="px-6 pt-6 pb-6">
              {!confirmed ? (
                <Button className="w-full rounded-xl py-3" disabled={selected == null} onClick={confirm}>
                  {t('ex.validate')}
                </Button>
              ) : (
                <Button className="w-full rounded-xl py-3" onClick={next}>
                  {index >= total - 1 ? t('ex.seeResults') : t('ex.nextQuestion')}
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </ModuleShell>
  )
}
