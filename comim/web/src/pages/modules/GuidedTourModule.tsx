import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoc } from '@/lib/i18n'
import { Button } from '@/components/ui/Button'
import { MachineView } from '@/components/training/MachineView'
import { AudioTrack, SubtitleText, useNarration } from '@/components/training/Audio'
import { ModuleShell, useModuleEnv } from '@/components/training/ModuleShell'
import { tourSegments } from '@/data/content'
import { tourCompletedStore } from '@/data/stores'

export default function GuidedTourModule() {
  const env = useModuleEnv('tour')
  const { t } = useTranslation()
  const loc = useLoc()
  const completedBy = tourCompletedStore.use()
  const alreadyDone = env.preview || (env.studentId ? completedBy.includes(env.studentId) : false)
  const saved = env.saved?.state as { segment: number } | undefined
  const [segment, setSegment] = useState(saved?.segment ?? 0)
  const [finished, setFinished] = useState(false)

  const seg = tourSegments[segment]
  const text = loc(seg.text)
  const narration = useNarration(text)
  const isLast = segment >= tourSegments.length - 1
  // First run: "Next" waits for the end of the narration
  const canNext = narration.ended || alreadyDone

  const complete = () => {
    env.record({ correct: 1, total: 1, score: 100, status: 'completed', items: [] })
    if (env.studentId && !env.preview) tourCompletedStore.set((p) => Array.from(new Set([...p, env.studentId!])))
    setFinished(true)
  }

  if (finished) {
    return (
      <ModuleShell env={env}>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-navy-900/80 p-8 text-center shadow-2xl">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-bold">{t('tour.completed')}</h1>
            <p className="mt-2 text-sm text-slate-300">{t('tour.completedHint')}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="dark"
                onClick={() => {
                  setSegment(0)
                  setFinished(false)
                }}
              >
                <RotateCcw className="h-4 w-4" />
                {t('tour.replay')}
              </Button>
              <Link to={env.menuPath} className="inline-flex items-center gap-2 rounded-xl bg-[#5BA3E8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4a92d6]">
                {env.device === 'VR' ? t('vr.backToVrMenu') : t('results.backToMenu')}
              </Link>
            </div>
          </div>
        </div>
      </ModuleShell>
    )
  }

  return (
    <ModuleShell
      env={env}
      exit={{ kind: 'tour', onSave: () => env.save({ segment }), onDiscard: () => env.record({ correct: 0, total: 1, score: 0, status: 'abandoned', items: [] }) }}
      vrHints={[t('vr.lookAtHighlighted'), t('vr.menuForControls')]}
      vrMenuItems={[{ label: t('audio.replay'), icon: RotateCcw, onClick: narration.play }]}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[340px] flex-1 p-3 sm:p-4 lg:min-h-0">
          <MachineView highlight={seg.focus} exploded={seg.exploded} showLabels dimOthers={seg.focus.length > 0} />
        </div>
        <aside className="flex w-full flex-col justify-between border-t border-white/10 bg-[#0c1a2e]/95 p-5 text-white lg:min-h-0 lg:w-[400px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">
              <span>{t('student.narration')}</span>
              <span className="text-slate-400">{t('student.segment', { current: segment + 1, total: tourSegments.length })}</span>
            </div>
            <h2 className="mt-2 text-xl font-bold">{loc(seg.title)}</h2>
            <SubtitleText text={text} charIndex={narration.charIndex} />
            <div className="mt-5">
              <AudioTrack narration={narration} />
            </div>
          </div>
          <div className="mt-6">
            {!canNext && <p className="mb-2 text-xs text-slate-400">{t('tour.nextAfterNarration')}</p>}
            <div className="flex items-center justify-between gap-3">
              <Button variant="dark" disabled={segment === 0} onClick={() => setSegment((s) => s - 1)}>
                <ChevronLeft className="h-4 w-4" />
                {t('tour.previous')}
              </Button>
              <Button className="bg-[#5BA3E8] hover:bg-[#4a92d6]" disabled={!canNext} onClick={() => (isLast ? complete() : setSegment((s) => s + 1))}>
                {isLast ? t('student.finish') : t('common.next')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </ModuleShell>
  )
}
