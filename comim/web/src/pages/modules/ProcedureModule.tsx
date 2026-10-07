import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, BookOpen, Check, CheckCircle2, Eye, Flashlight, Gauge, Hand, HelpCircle, Lightbulb, Lock, Stethoscope, Wrench, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tooltip } from '@/components/ui/InfoTip'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton, VolumeControls } from '@/components/training/Audio'
import { ModuleShell, useModuleEnv } from '@/components/training/ModuleShell'
import { ResultsView } from '@/components/training/ResultsView'
import {
  instrumentReadings,
  partName,
  referenceSheet,
  REPAIR_ALARM_DELAY_MS,
  repairDiagnosis,
  repairProcedure,
  repairScenario,
  startupProcedure,
  tools,
  type PartId,
  type PlantState,
  type ProcStep,
  type ToolId,
} from '@/data/content'
import { rubricStore } from '@/data/stores'
import type { Attempt, AttemptItem } from '@/data/mock'
import { playSfx, setPlantRunning, startAmbience, stopAmbience, type Sfx } from '@/lib/sfx'

type IconProps = { className?: string }

const ScrewdriverIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M14.5 3.5l6 6-3.5 3.5-6-6z" />
    <path d="M12.8 11.2L5 19" />
    <path d="M3 21l2-2" />
  </svg>
)
const PliersIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M7 2.5l4 8" />
    <path d="M17 2.5l-4 8" />
    <circle cx="12" cy="12" r="1.6" />
    <path d="M11 13.5L7.5 21.5" />
    <path d="M13 13.5l3.5 8" />
  </svg>
)

const toolIcons: Record<ToolId, React.ComponentType<IconProps>> = {
  inspect: Eye,
  hand: Hand,
  flashlight: Flashlight,
  padlock: Lock,
  wrench: Wrench,
  screwdriver: ScrewdriverIcon,
  torqueWrench: Gauge,
  pliers: PliersIcon,
}

const VACUUM = ['0 %', '0 %', '0 %', '0 %', '35 %', '63 %', '91 %', '92 %', '94 %', '95 %', '95 %', '95 %', '95 %', '95 %']

const REPAIR_SFX: Record<string, Sfx> = { r3: 'pumpStop', r4: 'lock', r5: 'valve', r6: 'wrench', r8: 'wrench', r9: 'wrench', r10: 'pumpStart' }
/** Event sound of a step — state-dependent (valve, pump start / stop, vacuum, wrench…). */
function stepSfx(kind: 'startup' | 'repair', s: ProcStep): Sfx | null {
  if (kind === 'repair') return REPAIR_SFX[s.id] ?? null
  if (s.target === 'ejectorPump' || s.target === 'freshwaterPump') return 'pumpStart'
  if (s.target === 'vacuumGauge') return 'vacuum'
  if (/Valve|jacket|seawaterFeed|airVent/.test(s.target)) return 'valve'
  return null
}

type Diag = { done: boolean; errors: number }
type Saved = { stepIndex: number; errors: number[]; hints: number[]; diag?: Diag }

export default function ProcedureModule({ kind }: { kind: 'startup' | 'repair' }) {
  const env = useModuleEnv(kind)
  const { t } = useTranslation()
  const loc = useLoc()
  const steps = kind === 'startup' ? startupProcedure : repairProcedure
  const weights = rubricStore.use()[kind]
  const saved = env.saved?.state as Saved | undefined
  const repair = kind === 'repair'

  const [stepIndex, setStepIndex] = useState(saved?.stepIndex ?? 0)
  const [errors, setErrors] = useState<number[]>(saved?.errors ?? steps.map(() => 0))
  const [hints, setHints] = useState<number[]>(saved?.hints ?? steps.map(() => 0))
  const [tool, setTool] = useState<ToolId | null>(repair ? null : 'hand')
  const [feedback, setFeedback] = useState<{ tone: 'ok' | 'ko' | 'info'; text: string } | null>(null)
  const [done, setDone] = useState(false)
  const [flash, setFlash] = useState<{ part: PartId; ok: boolean } | null>(null)
  const [sheet, setSheet] = useState(false)
  const [result, setResult] = useState<Omit<Attempt, 'id' | 'studentId'> | null>(null)
  // Repair starts in normal operation: the alarm trips a few seconds later
  const [alarm, setAlarm] = useState(!repair || !!saved)
  const [briefing, setBriefing] = useState(false)
  const [diag, setDiag] = useState<Diag>(saved?.diag ?? { done: false, errors: 0 })
  const [diagPick, setDiagPick] = useState<string | null>(null)
  const [reading, setReading] = useState<PartId | null>(null)

  const listRef = useRef<HTMLOListElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  const step = steps[stepIndex]
  const hintLevel = hints[stepIndex]
  const stepErrors = errors[stepIndex]
  const needDiag = repair && alarm && stepIndex === repairDiagnosis.afterStep && !diag.done
  const lastDone = stepIndex >= steps.length - 1 && done
  const plant: PlantState = !repair || !alarm || lastDone ? 'normal' : stepIndex < 2 || (stepIndex === 2 && !done) ? 'fault' : 'stopped'

  useEffect(() => {
    if (alarm) return
    const id = window.setTimeout(() => {
      setAlarm(true)
      setBriefing(true)
      playSfx('alarm')
    }, REPAIR_ALARM_DELAY_MS[env.device])
    return () => window.clearTimeout(id)
  }, [alarm, env.device])

  // Engine-room ambience (Repair) — follows the plant state
  useEffect(() => {
    if (!repair) return
    startAmbience()
    return () => stopAmbience()
  }, [repair])
  useEffect(() => {
    if (repair) setPlantRunning(plant !== 'stopped')
  }, [repair, plant])

  // The step list follows the current step
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [stepIndex, done, needDiag])

  const diagItem = (): AttemptItem => {
    const right = repairDiagnosis.options.find((o) => o.correct)!
    return { label: repairDiagnosis.question, kind: 'diagnosis', expected: right.label, correct: diag.errors === 0, errors: diag.errors, explanation: right.feedback }
  }

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
    const stepItems = buildItems(upTo)
    const correct = stepItems.filter((i) => i.correct).length
    // Score = sum of the rubric weights of the steps done right (teacher Scoring Rubric)
    const score = Math.round(stepItems.reduce((s, it, i) => s + (it.correct ? weights[i] : 0), 0))
    // The diagnosis is shown in the correction, between the observation and the repair steps
    const items = repair && diag.done ? [...stepItems.slice(0, repairDiagnosis.afterStep), diagItem(), ...stepItems.slice(repairDiagnosis.afterStep)] : stepItems
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

  const readingText = (part: PartId) => {
    const r = instrumentReadings[part]
    return r ? `${loc(r.label)} : ${loc(r[plant])}` : ''
  }

  const onPart = (part: PartId) => {
    if (done) return
    if (!alarm) {
      setFeedback({ tone: 'info', text: t('ex.normalOperation') })
      return
    }
    if (needDiag) {
      setFeedback({ tone: 'info', text: t('ex.diagnoseFirst') })
      return
    }
    if (!tool) {
      setFeedback({ tone: 'info', text: t('ex.pickToolFirst') })
      return
    }
    const isTarget = part === step.target && (!repair || !step.tool || tool === step.tool)
    // Visual check: pointing an instrument shows its reading — observing is never an error
    if (repair && tool === 'inspect' && !isTarget) {
      if (instrumentReadings[part]) {
        setReading(part)
        setFeedback({ tone: 'info', text: readingText(part) })
      } else setFeedback({ tone: 'info', text: t('ex.nothingToRead', { part: loc(partName(part)) }) })
      return
    }
    if (part === step.target) {
      if (!isTarget) {
        // Right place, wrong tool: it simply does not work — tool choice is not scored
        setFlash({ part, ok: false })
        setFeedback({ tone: 'info', text: t('ex.toolDoesNotWork', { tool: loc(tools.find((x) => x.id === tool)?.name) }) })
        return
      }
      setFlash({ part, ok: true })
      if (instrumentReadings[part] && repair) setReading(part)
      setFeedback({ tone: 'ok', text: instrumentReadings[part] && repair ? `${readingText(part)}. ${loc(step.why)}` : loc(step.why) })
      const sfx = stepSfx(kind, step)
      if (sfx) playSfx(sfx)
      if (repair && step.id === 'r10') playSfx('vacuum')
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
    setReading(null)
    if (repair) setTool(null)
  }

  const validateDiag = () => {
    const opt = repairDiagnosis.options.find((o) => o.id === diagPick)
    if (!opt) return
    if (opt.correct) {
      setDiag((d) => ({ ...d, done: true }))
      setFeedback({ tone: 'ok', text: loc(opt.feedback) })
    } else {
      setDiag((d) => ({ ...d, errors: d.errors + 1 }))
      setFeedback({ tone: 'ko', text: loc(opt.feedback) })
    }
    setDiagPick(null)
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
  const ToolCursor = tool ? toolIcons[tool] : null
  const moveCursor = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cursorRef.current
    if (!el) return
    const box = e.currentTarget.getBoundingClientRect()
    el.style.transform = `translate(${e.clientX - box.left + 14}px, ${e.clientY - box.top + 14}px)`
    el.style.opacity = '1'
  }

  return (
    <ModuleShell
      env={env}
      exit={{
        kind: 'exercise',
        onSave: () => env.save({ stepIndex: done ? stepIndex + 1 : stepIndex, errors, hints, diag }),
        onDiscard: () => finish(done ? stepIndex + 1 : stepIndex, 'abandoned'),
      }}
      vrHints={[t('vr.pinchSelect'), repair ? t('vr.pickTool') : t('vr.pointAndPinch'), t('vr.menuForControls')]}
      vrMenuItems={[
        { label: t('ex.hint'), icon: Lightbulb, onClick: () => bumpHint() },
        ...(repair ? [{ label: t('ex.referenceSheet'), icon: BookOpen, onClick: () => setSheet(true) }] : []),
      ]}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div
          className="relative min-h-[340px] flex-1 overflow-hidden p-3 sm:p-4 lg:min-h-0"
          onPointerMove={repair ? moveCursor : undefined}
          onPointerLeave={() => cursorRef.current && (cursorRef.current.style.opacity = '0')}
        >
          <MachineView
            onPartClick={onPart}
            flash={flash}
            showLabels
            guide={hintLevel >= 2 && !done && !needDiag ? step.target : null}
            tags={reading ? [{ part: reading, text: loc(instrumentReadings[reading]![plant]), tone: plant === 'normal' ? 'ok' : 'warn' }] : []}
            gauges={
              !repair ? (
                <div className="rounded-xl border border-white/10 bg-navy-950/80 px-3 py-1.5 text-center text-xs text-white backdrop-blur">
                  <div className="text-slate-400">{t('student.vacuumLevel')}</div>
                  <div className="font-bold">{VACUUM[stepIndex + (done ? 1 : 0)]}</div>
                </div>
              ) : plant === 'fault' ? (
                <div role="alert" className="flex animate-pulse items-center gap-2 rounded-xl border border-red-400/50 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-100 backdrop-blur">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t('ex.brineRising')}
                </div>
              ) : plant === 'stopped' ? (
                <div className="flex items-center gap-2 rounded-xl border border-orange-400/40 bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-200 backdrop-blur">
                  <Lock className="h-3.5 w-3.5" />
                  {t('ex.plantStopped')}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {lastDone ? t('ex.brineNormal') : t('ex.normalOperationBadge')}
                </div>
              )
            }
          />
          {/* Selected tool shown on the cursor */}
          {repair && ToolCursor && (
            <div ref={cursorRef} className="pointer-events-none absolute top-0 left-0 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white opacity-0 shadow-lg ring-2 ring-white/40 transition-opacity">
              <ToolCursor className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Three zones: header / step list (scrolls, follows the current step) / pinned footer */}
        <aside className="flex w-full flex-col border-t border-white/10 bg-[#0c1a2e]/95 text-white lg:min-h-0 lg:w-[400px] lg:border-t-0 lg:border-l">
          <div className="shrink-0 border-b border-white/10 px-5 py-3.5">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
              <span>{t('student.stepOf', { current: stepIndex + 1, total: steps.length })}</span>
              <span className="flex items-center gap-2 text-slate-400">
                {Math.round(progress)}%
                {repair && <VolumeControls />}
              </span>
            </div>
            <ProgressBar value={progress} className="mt-2 h-2.5 bg-white/15" fillClassName="bg-[#5BA3E8]" />
          </div>

          {repair && briefing && (
            <div className="shrink-0 border-b border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                <span className="flex-1 leading-snug">{loc(repairScenario)}</span>
                <button type="button" onClick={() => setBriefing(false)} aria-label={t('ex.closeBriefing')} className="rounded-lg p-1 text-red-200 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-2 pl-6">
                <SpeakButton text={loc(repairScenario)} dark auto />
              </div>
            </div>
          )}

          <ol ref={listRef} className="max-h-[220px] min-h-[64px] flex-1 space-y-1 overflow-y-auto px-4 py-3 lg:max-h-none">
            {steps.slice(0, stepIndex).map((s, i) => (
              <li key={s.id} className="flex items-start gap-3 rounded-xl px-2 py-1.5 text-sm text-slate-300">
                <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', errors[i] === 0 && hints[i] < 2 ? 'bg-success-600' : 'bg-orange-500')}>
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="leading-snug">{loc(s.label)}</span>
              </li>
            ))}
            {!alarm ? (
              <li className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300">{t('ex.normalOperation')}</li>
            ) : needDiag ? (
              <li className="flex items-start gap-3 rounded-xl bg-white/5 px-2 py-2 text-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold">
                  <Stethoscope className="h-3.5 w-3.5" />
                </span>
                <span className="leading-snug font-semibold">{loc(repairDiagnosis.question)}</span>
              </li>
            ) : (
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
            )}
          </ol>

          <div className="flex shrink-0 flex-col border-t border-white/10 lg:max-h-[68%]">
            <div className="min-h-0 space-y-3 overflow-y-auto px-4 pt-3">
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

              {needDiag && (
                <div className="space-y-2">
                  {repairDiagnosis.options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setDiagPick(o.id)}
                      aria-pressed={diagPick === o.id}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium',
                        diagPick === o.id ? 'border-sky-400 bg-sky-500/20 text-white ring-1 ring-sky-400' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                      )}
                    >
                      <span className={cn('h-4 w-4 shrink-0 rounded-full border-2', diagPick === o.id ? 'border-sky-300 bg-sky-400' : 'border-slate-400')} />
                      {loc(o.label)}
                    </button>
                  ))}
                </div>
              )}

              {!done && !needDiag && alarm && hintLevel > 0 && (
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

              {repair && !needDiag && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{t('student.toolkit')}</span>
                    <button type="button" onClick={() => setSheet(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-sky-300 hover:text-white">
                      <BookOpen className="h-3.5 w-3.5" />
                      {t('ex.referenceSheet')}
                    </button>
                  </div>
                  {/* Equal icon tiles: name below, tooltip = name + when to use */}
                  <div className="grid grid-cols-4 gap-2">
                    {tools.map((tl, i) => {
                      const Icon = toolIcons[tl.id]
                      const on = tool === tl.id
                      return (
                        <Tooltip
                          key={tl.id}
                          side="top"
                          align={i % 4 === 0 ? 'left' : i % 4 === 3 ? 'right' : 'center'}
                          className="flex"
                          content={
                            <>
                              <span className="block font-bold">{loc(tl.name)}</span>
                              {loc(tl.use)}
                            </>
                          }
                        >
                          <button
                            type="button"
                            onClick={() => setTool(tl.id)}
                            aria-pressed={on}
                            aria-label={`${loc(tl.name)} — ${loc(tl.use)}`}
                            className={cn(
                              'flex h-[84px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border px-1 text-center',
                              on ? 'border-sky-400 bg-sky-500/25 text-white ring-2 ring-sky-400' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                            )}
                          >
                            <Icon className={cn('h-7 w-7 shrink-0', on ? 'text-white' : 'text-sky-300')} />
                            <span className="line-clamp-2 text-[11px] leading-tight font-medium">{loc(tl.name)}</span>
                          </button>
                        </Tooltip>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">{tool ? t('ex.toolSelected', { tool: loc(tools.find((x) => x.id === tool)?.name) }) : t('ex.pickToolFirst')}</p>
                </div>
              )}

              {!repair && !done && <p className="text-xs text-slate-400">{t('ex.clickPartInstruction')}</p>}
            </div>

            {/* Always visible: next step / diagnosis validation and the hint button */}
            <div className="flex shrink-0 items-center gap-2 px-4 py-3">
              {!done && !needDiag && alarm && (
                <button
                  type="button"
                  onClick={() => bumpHint()}
                  disabled={hintLevel >= 2}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-400/70 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10 disabled:opacity-40"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  {hintLevel === 0 ? t('ex.hintLevel1') : t('ex.hintLevel2')}
                </button>
              )}
              {needDiag && (
                <Button className="flex-1 bg-[#5BA3E8] hover:bg-[#4a92d6]" disabled={!diagPick} onClick={validateDiag}>
                  {t('ex.validateDiagnosis')}
                </Button>
              )}
              {done && (
                <Button className="flex-1 bg-[#5BA3E8] hover:bg-[#4a92d6]" onClick={nextStep}>
                  {stepIndex >= steps.length - 1 ? t('ex.seeResults') : t('ex.nextStep')}
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Modal open={sheet} onClose={() => setSheet(false)} title={loc(referenceSheet.title)} subtitle={loc(referenceSheet.draft)} size="lg">
        <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
          <div className="grid-blueprint h-64 overflow-hidden rounded-xl p-2">
            <MachineView highlight={['ejector', 'ejectorPump', 'ejectorGauge']} focus="ejector" wheelZoom={false} />
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
