import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, ChevronDown, ClipboardList, LayoutList, Monitor, Headphones, RotateCcw, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { fmtDateTime, fmtDuration, useLang, useLoc } from '@/lib/i18n'
import { catalogue, moduleNames, PASS_THRESHOLD, type PartId } from '@/data/content'
import type { Attempt, AttemptItem } from '@/data/mock'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { effectiveScore } from '@/data/stores'

/** Lines to review shown before "see all" */
const MAX_SHOWN = 4

type Props = {
  attempt: Omit<Attempt, 'id' | 'studentId'> & { id?: string }
  attemptNo?: number
  retryPath?: string
  menuPath: string
  menuLabel?: string
  showResultsLink?: boolean
  compact?: boolean
}

/**
 * Shared results layout (student + teacher, every exercise): score card, then the machine
 * in a fixed sticky panel next to the question-by-question correction. The parts to review
 * are the wrong lines of the correction — a click highlights the part on the machine.
 */
export function ResultsView({ attempt, attemptNo, retryPath, menuPath, menuLabel, showResultsLink = true, compact = false }: Props) {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const score = effectiveScore(attempt as Attempt)
  const passed = score >= PASS_THRESHOLD
  const indexed = attempt.items.map((it, i) => ({ it, i }))
  const wrong = indexed.filter((x) => !x.it.correct)
  const right = indexed.filter((x) => x.it.correct)
  const wrongParts = Array.from(new Set(wrong.map((x) => x.it.part).filter(Boolean))) as PartId[]
  const hasParts = attempt.items.some((i) => i.part)
  const [active, setActive] = useState<number | null>(() => wrong.find((x) => x.it.part)?.i ?? null)
  const [allWrong, setAllWrong] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const activePart = active != null ? (attempt.items[active]?.part ?? null) : null
  const isId = attempt.module === 'identification'
  const split = isId
    ? (['name', 'function'] as const).map((k) => {
        const list = attempt.items.filter((i) => i.kind === k)
        return { k, ok: list.filter((i) => i.correct).length, total: list.length }
      })
    : []

  const actions = (
    <div className="flex flex-wrap justify-center gap-2">
      {retryPath && (
        <Link to={retryPath} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <RotateCcw className="h-4 w-4" />
          {t('results.retry')}
        </Link>
      )}
      <Link to={menuPath} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50">
        <LayoutList className="h-4 w-4" />
        {menuLabel ?? t('results.backToMenu')}
      </Link>
      {showResultsLink && (
        <Link to="/student/results" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50">
          <ClipboardList className="h-4 w-4" />
          {t('student.backToMyResults')}
        </Link>
      )}
    </div>
  )

  const scoreBlock = (
    <div className="text-center">
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-sky-600">
        {loc(moduleNames[attempt.module])} · {t('results.title')}
        {attemptNo ? ` · ${t('teacher.attempt')} ${attemptNo}` : ''}
      </div>
      <div className="mt-3 text-5xl font-bold tracking-tight text-ink">
        {attempt.correct}/{attempt.total}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span className={cn('rounded-full px-3 py-1 font-bold', passed ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600')}>
          {score}%{attempt.adjustedScore != null && ` (${t('results.adjusted')})`}
        </span>
        {attempt.status === 'abandoned' ? (
          <span className="rounded-full bg-slate-200 px-3 py-1 font-bold text-slate-700">{t('results.abandoned')}</span>
        ) : (
          <span className={cn('rounded-full px-3 py-1 font-bold', passed ? 'bg-success-50 text-success-600' : 'bg-warning-50 text-warning-600')}>{passed ? t('common.passed') : t('common.needsReview')}</span>
        )}
        <span className="text-muted">{t('results.threshold', { pct: PASS_THRESHOLD })}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-muted">
        <span>{fmtDateTime(attempt.date, lang)}</span>
        <span className="inline-flex items-center gap-1">
          {attempt.device === 'VR' ? <Headphones className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
          {attempt.device}
        </span>
        <span>{fmtDuration(attempt.durationSec)}</span>
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl">
          {scoreBlock}
          {wrong.length > 0 && (
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">{t('results.mainErrors')}</div>
              <ul className="mt-2 space-y-2">
                {wrong.slice(0, 3).map(({ it, i }) => (
                  <li key={i} className="rounded-xl bg-orange-50 px-3 py-2 text-sm">
                    <span className="font-semibold">{loc(it.label)}</span>
                    {it.expected && <span className="block text-xs text-muted">{t('teacher.expectedAnswer')}: {loc(it.expected)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-5 rounded-xl bg-sky-50 px-3 py-2 text-center text-sm text-brand-700">{t('results.fullOnWeb')}</p>
          <div className="mt-5">{actions}</div>
        </div>
      </div>
    )
  }

  const row = ({ it, i }: { it: AttemptItem; i: number }) => {
    const comp = it.part ? catalogue.find((c) => c.part === it.part) : undefined
    const on = active === i
    return (
      <li key={i}>
        <div
          role={it.part ? 'button' : undefined}
          tabIndex={it.part ? 0 : undefined}
          aria-pressed={it.part ? on : undefined}
          onClick={it.part ? () => setActive(i) : undefined}
          onKeyDown={it.part ? (e) => (e.key === 'Enter' || e.key === ' ') && setActive(i) : undefined}
          className={cn('px-5 py-4 transition', it.part && 'cursor-pointer hover:bg-slate-50', on && 'bg-sky-50/70 ring-1 ring-brand-500/40 ring-inset')}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{i + 1}</span>
              <div className="min-w-0">
                {it.kind && (
                  <div className="text-[11px] font-bold uppercase tracking-wide text-sky-600">
                    {t(`results.kind.${it.kind}`)}
                    {comp ? ` · ${loc(comp.name)}` : ''}
                  </div>
                )}
                <div className="font-semibold text-ink">{loc(it.label)}</div>
              </div>
            </div>
            <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', it.correct ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600')}>
              {it.correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {it.correct ? t('common.correct') : t('common.incorrect')}
            </span>
          </div>
          {(it.given || it.expected || it.errors != null) && (
            <div className="mt-2 ml-9 space-y-1 text-sm">
              {it.given && (
                <div className="text-muted">
                  {t('teacher.answerGiven')}: <span className="font-medium text-ink">{loc(it.given)}</span>
                </div>
              )}
              {!it.correct && it.expected && (
                <div className="text-muted">
                  {t('teacher.expectedAnswer')}: <span className="font-medium text-success-600">{loc(it.expected)}</span>
                </div>
              )}
              {it.errors != null && it.errors > 0 && <div className="text-muted">{t('results.errorsCount', { count: it.errors })}</div>}
            </div>
          )}
          {it.explanation && (
            <div className="mt-2 ml-9 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
              <span className="flex-1">{loc(it.explanation)}</span>
              <span onClick={(e) => e.stopPropagation()}>
                <SpeakButton text={loc(it.explanation)} />
              </span>
            </div>
          )}
          {/* "Parts to review" lives in the correction itself */}
          {!it.correct && comp && (
            <Link to={`/student/catalog/${comp.id}`} onClick={(e) => e.stopPropagation()} className="mt-2 ml-9 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
              <BookOpen className="h-3.5 w-3.5" />
              {t('results.openCard', { name: loc(comp.name) })}
            </Link>
          )}
        </div>
      </li>
    )
  }

  const shownWrong = allWrong ? wrong : wrong.slice(0, MAX_SHOWN)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {scoreBlock}
        {isId && (
          <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3">
            {split.map((s) => (
              <div key={s.k} className="rounded-xl border border-slate-200 px-4 py-3 text-center">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">{t(`results.kind.${s.k}`)}</div>
                <div className="mt-1 text-2xl font-bold text-ink">
                  {s.ok}/{s.total}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6">{actions}</div>
      </div>

      {attempt.items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center text-sm text-muted shadow-sm">{t('results.noItems')}</div>
      ) : (
        <div className={cn('grid items-start gap-5', hasParts && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]')}>
          {hasParts && (
            // Fixed-height machine panel that stays in view while the correction scrolls
            <div className="lg:sticky lg:top-[76px]">
              <div className="grid-blueprint h-[300px] overflow-hidden rounded-2xl p-2 sm:h-[380px]">
                <MachineView wrong={wrongParts.filter((p) => p !== activePart)} highlight={activePart ? [activePart] : []} focus={activePart} showLabels wheelZoom={false} />
              </div>
              <p className="mt-2 text-center text-xs text-muted">{t('results.clickToLocate')}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h3 className="border-b border-slate-100 px-5 py-4 font-bold text-ink">{t('results.correction')}</h3>

            <div className="bg-red-50/60 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-red-700">{t('results.toReviewCount', { count: wrong.length })}</div>
            {wrong.length === 0 ? <p className="px-5 py-5 text-sm text-muted">{t('results.allCorrect')}</p> : <ol className="divide-y divide-slate-100">{shownWrong.map(row)}</ol>}
            {wrong.length > MAX_SHOWN && (
              <button type="button" onClick={() => setAllWrong((v) => !v)} className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-sm font-semibold text-brand-600 hover:bg-slate-50">
                <ChevronDown className={cn('h-4 w-4 transition-transform', allWrong && 'rotate-180')} />
                {allWrong ? t('results.seeLess') : t('results.seeAll', { count: wrong.length })}
              </button>
            )}

            {/* Correct answers are collapsed */}
            {right.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowRight((v) => !v)}
                  aria-expanded={showRight}
                  className="flex w-full items-center justify-between gap-2 border-t border-slate-200 bg-success-50/60 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-success-600 hover:bg-success-50"
                >
                  {t('results.correctCount', { count: right.length })}
                  <ChevronDown className={cn('h-4 w-4 transition-transform', showRight && 'rotate-180')} />
                </button>
                {showRight && <ol className="divide-y divide-slate-100">{right.map(row)}</ol>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
