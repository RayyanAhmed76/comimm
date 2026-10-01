import { useState } from 'react'
import {
  BookOpen,
  Check,
  Flashlight,
  Hand,
  HelpCircle,
  Lightbulb,
  Lock,
  Wrench,
  Hammer,
  Grip,
  Gauge,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { ModuleShell, useModuleEnv } from '@/components/training/ModuleShell'
import { ResultsView } from '@/components/training/ResultsView'
import {
  partName,
  referenceSheet,
  repairProcedure,
  repairScenario,
  startupProcedure,
  tools,
  type PartId,
  type ToolId,
} from '@/data/content'
import { rubricStore } from '@/data/stores'
import type { Attempt, AttemptItem } from '@/data/mock'

const toolIcons: Record<ToolId, React.ComponentType<{ className?: string }>> = {
  hand: Hand,
  flashlight: Flashlight,
  padlock: Lock,
  wrench: Wrench,
  screwdriver: Hammer,
  torqueWrench: Gauge,
  pliers: Grip,
}

const VACUUM = ['0 %', '0 %', '0 %', '0 %', '35 %', '63 %', '91 %', '92 %', '94 %', '95 %', '95 %', '95 %', '95 %', '95 %']

type Saved = { stepIndex: number; errors: number[]; hints: number[] }

export default function ProcedureModule({ kind }: { kind: 'startup' | 'repair' }) {
  const env = useModuleEnv(kind)
  const { t } = useTranslation()
  const loc = useLoc()
  const steps = kind === 'startup' ? startupProcedure : repairProcedure
  const weights = rubricStore.use()[kind]
  const saved = env.saved?.state as Saved | undefined

  const [stepIndex, setStepIndex] = useState(saved?.stepIndex ?? 0)
  const [errors, setErrors] = useState<number[]>(saved?.errors ?? steps.map(() => 0))
  const [hints, setHints] = useState<number[]>(saved?.hints ?? steps.map(() => 0))
  const [tool, setTool] = useState<ToolId | null>(kind === 'repair' ? null : 'hand')
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'ko' | 'info'; text: string } | null>(null)
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState<{ part: PartId; ok: boolean } | null>(null)
  const [sheet, setSheet] = useState(false)
  const [intro, setIntro] = useState(kind === 'repair' && !saved)
  const [result, setResult] = useState<Omit<Attempt, 'id' | 'studentId'> | null>(null)

  const step = steps[stepIndex]
  const hintLevel = hints[stepIndex]
  const stepErrors = errors[stepIndex]

  const buildItems = (upTo: number): AttemptItem[] =>
    steps.slice(0, upTo).map((s, i) => {
      const ok = errors[i] === 0 && hints[i] < 2
      return {
        label: s.label,
        part: s.target,
        correct: ok,
        errors: errors[i],
        explanation: ok ? s.why : { en: `${s.wrong.en} ${s.why.en}`, fr: `${s.wrong.fr} ${s.why.fr}` },
      }
    })

  const finish = (upTo: number, status: 'completed' | 'abandoned') => {
    const items = buildItems(upTo)
    const correct = items.filter((i) => i.correct).length
    // Score = sum of the rubric weights of the steps done right (teacher Scoring Rubric)
    const score = Math.round(items.reduce((s, it, i) => s + (it.correct ? weights[i] : 0), 0))
    const data = { correct, total: steps.length, score, status, items }
    env.record(data)
    return { ...data, module: kind, date: new Date().toISOString(), device: env.device, durationSec: env.elapsed() }
  }

  const bumpHint = (level?: number) =>
    setHints((h) => {
      const n = [...h]
      n[stepIndex] = level ?? Math.min(2, n[stepIndex] + 1)
      return n
    })

  const onPart = (part: PartId) => {
    if (done) return
    if (!tool) {
      setFeedback({ tone: 'info', text: t('ex.pickToolFirst') })
      return
    }
    if (part === step.target) {
      if (kind === 'repair' && step.tool && tool !== step.tool) {
        // Right place, wrong tool: it simply does not work — tool choice is not scored
        setFlash({ part, ok: false })
        setFeedback({ tone: 'info', text: t('ex.toolDoesNotWork', { tool: loc(tools.find((x) => x.id === tool)?.name) }) })
        return
      }
      setFlash({ part, ok: true })
      setFeedback({ tone: 'ok', text: loc(step.why) })
      setDone(true)
      return
    }
    setFlash({ part, ok: false })
    const n = stepErrors + 1
    setErrors((e) => {
      const c = [...e]
      c[stepIndex] = n
      return c
    })
    setFeedback({ tone: 'ko', text: t('ex.wrongPart', { part: loc(partName(part)), why: loc(step.wrong) }) })
    // Offer the hint automatically after 2 wrong attempts
    if (n >= 2 && hintLevel === 0) bumpHint(1)
  }

  const nextStep = () => {
    if (stepIndex >= steps.length - 1) {
      setResult(finish(steps.length, 'completed'))
      return
    }
    setStepIndex((i) => i + 1)
    setDone(false)
    setFeedback(null)
    setFlash(null)
    if (kind === 'repair') setTool(null)
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

  const progress = ((stepIndex + (done ? 1 : 0)) / steps.length) * 100

  return (
    <ModuleShell
      env={env}
      exit={{
        kind: 'exercise',
        onSave: () => env.save({ stepIndex: done ? stepIndex + 1 : stepIndex, errors, hints }),
        onDiscard: () => finish(done ? stepIndex + 1 : stepIndex, 'abandoned'),
      }}
      vrHints={[t('vr.pinchSelect'), kind === 'repair' ? t('vr.pickTool') : t('vr.pointAndPinch'), t('vr.menuForControls')]}
      vrMenuItems={[
        { label: t('ex.hint'), icon: Lightbulb, onClick: () => bumpHint() },
        ...(kind === 'repair' ? [{ label: t('ex.referenceSheet'), icon: BookOpen, onClick: () => setSheet(true) }] : []),
      ]}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[340px] flex-1 p-2 sm:p-4 lg:min-h-0">
          <MachineView
            onPartClick={onPart}
            flash={flash}
            showLabels
            guide={hintLevel >= 2 && !done ? step.target : null}
            gauges={
              kind === 'startup' ? (
                <div className="rounded-xl border border-white/10 bg-navy-950/80 px-3 py-1.5 text-center text-xs text-white backdrop-blur">
                  <div className="text-slate-400">{t('student.vacuumLevel')}</div>
                  <div className="font-bold">{VACUUM[stepIndex + (done ? 1 : 0)]}</div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-orange-400/40 bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-200 backdrop-blur">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {stepIndex < 7 ? t('ex.brineRising') : t('ex.brineNormal')}
                </div>
              )
            }
          />
        </div>

        <aside className="flex w-full flex-col border-t border-white/10 bg-[#0c1a2e]/95 text-white lg:w-[380px] lg:border-t-0 lg:border-l">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
              <span>{t('student.stepOf', { current: stepIndex + 1, total: steps.length })}</span>
              <span className="text-slate-400">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} className="mt-2 h-2.5 bg-white/15" fillClassName="bg-[#5BA3E8]" />
          </div>

          <ol className="max-h-[260px] min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-3 lg:max-h-none">
            {steps.slice(0, stepIndex).map((s, i) => (
              <li key={s.id} className="flex items-start gap-3 rounded-xl px-2 py-2 text-sm text-slate-300">
                <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', errors[i] === 0 && hints[i] < 2 ? 'bg-success-600' : 'bg-orange-500')}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="leading-snug">{loc(s.label)}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 rounded-xl bg-white/5 px-2 py-2 text-sm">
              <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', done ? 'bg-success-600' : 'bg-brand-600')}>
                {done ? <Check className="h-3.5 w-3.5" /> : stepIndex + 1}
              </span>
              <span className="leading-snug font-semibold">
                {done ? loc(step.label) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-300">
                    <HelpCircle className="h-4 w-4" /> {t('ex.nextActionUnknown')}
                  </span>
                )}
              </span>
            </li>
          </ol>

          <div className="space-y-3 border-t border-white/10 px-4 py-3">
            {feedback && (
              <div
                className={cn(
                  'rounded-xl px-3 py-2.5 text-sm',
                  feedback.tone === 'ok' && 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
                  feedback.tone === 'ko' && 'border border-red-400/40 bg-red-500/15 text-red-100',
                  feedback.tone === 'info' && 'border border-sky-400/40 bg-sky-500/10 text-sky-100',
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-1">
                    {feedback.tone === 'ok' && <span className="font-bold">{t('ex.rightStep')} </span>}
                    {feedback.text}
                  </span>
                  <SpeakButton text={feedback.text} dark auto={feedback.tone !== 'info'} />
                </div>
              </div>
            )}

            {!done && hintLevel > 0 && (
              <div className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-3 py-2.5 text-sm text-orange-100">
                <div className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />
                  <span className="flex-1">
                    {stepErrors >= 2 && hintLevel === 1 && <span className="block text-xs font-semibold text-orange-300">{t('ex.autoHint')}</span>}
                    {loc(hintLevel >= 2 ? step.hint2 : step.hint1)}
                  </span>
                  <SpeakButton text={loc(hintLevel >= 2 ? step.hint2 : step.hint1)} dark />
                </div>
              </div>
            )}

            {!done && (
              <button
                type="button"
                onClick={() => bumpHint()}
                disabled={hintLevel >= 2}
                className="inline-flex items-center gap-2 rounded-full border border-orange-400/70 px-3 py-1.5 text-xs font-semibold text-orange-300 hover:bg-orange-500/10 disabled:opacity-40"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                {hintLevel === 0 ? t('ex.hintLevel1') : t('ex.hintLevel2')}
              </button>
            )}

            {kind === 'repair' && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{t('student.toolkit')}</span>
                  <button type="button" onClick={() => setSheet(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-white">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t('ex.referenceSheet')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tl) => {
                    const Icon = toolIcons[tl.id]
                    const on = tool === tl.id
                    return (
                      <button
                        key={tl.id}
                        type="button"
                        onClick={() => setTool(tl.id)}
                        aria-pressed={on}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-medium',
                          on ? 'border-sky-400 bg-sky-500/20 text-white ring-1 ring-sky-400' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-sky-300" />
                        <span className="leading-tight">{loc(tl.name)}</span>
                      </button>
                    )
                  })}
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{tool ? t('ex.toolSelected', { tool: loc(tools.find((x) => x.id === tool)?.name) }) : t('ex.pickToolFirst')}</p>
              </div>
            )}

            {kind === 'startup' && !done && <p className="text-xs text-slate-400">{t('ex.clickPartInstruction')}</p>}

            {done && (
              <Button className="w-full bg-[#5BA3E8] hover:bg-[#4a92d6]" onClick={nextStep}>
                {stepIndex >= steps.length - 1 ? t('ex.seeResults') : t('ex.nextStep')}
              </Button>
            )}
          </div>
        </aside>
      </div>

      <Modal open={intro} onClose={() => setIntro(false)} title={t('ex.faultTitle')} size="sm" footer={<Button onClick={() => setIntro(false)}>{t('ex.start')}</Button>}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
          <p className="text-sm leading-relaxed">{loc(repairScenario)}</p>
        </div>
        <div className="mt-3">
          <SpeakButton text={loc(repairScenario)} />
        </div>
      </Modal>

      <Modal open={sheet} onClose={() => setSheet(false)} title={loc(referenceSheet.title)} subtitle={loc(referenceSheet.draft)} size="lg">
        <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
          <div className="grid-blueprint h-56 overflow-hidden rounded-xl">
            <MachineView highlight={['ejector', 'ejectorPump', 'ejectorGauge']} focus="ejector" initialZoom={2} />
          </div>
          <table className="w-full text-sm">
            <tbody>
              {referenceSheet.rows.map(([k, v], i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 pr-3 font-semibold text-ink">{loc(k)}</td>
                  <td className="py-2 text-muted">{loc(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </ModuleShell>
  )
}
