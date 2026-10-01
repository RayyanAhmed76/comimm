import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Boxes, Combine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { MachineView } from '@/components/training/MachineView'
import { TrainingShell } from '@/components/training/TrainingShell'
import { VrShell } from '@/pages/vr/VrChrome'
import { useLoc } from '@/lib/i18n'
import { catalogue, partName, type PartId } from '@/data/content'

/** Exploded View — same 3D model as the Guided Tour. Used by Lesson Preview and the VR menu. */
export default function ExplodedView() {
  const { t } = useTranslation()
  const loc = useLoc()
  const location = useLocation()
  const vr = location.pathname.startsWith('/vr')
  const [exploded, setExploded] = useState(true)
  const [active, setActive] = useState<PartId | null>(null)
  const comp = active ? catalogue.find((c) => c.part === active) : null

  const body = (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[360px] flex-1 p-2 sm:p-4 lg:min-h-0">
        <MachineView
          exploded={exploded}
          highlight={active ? [active] : []}
          onPartClick={setActive}
          showLabels
          controls={
            <Button variant="dark" onClick={() => setExploded((v) => !v)}>
              {exploded ? <Combine className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}
              {exploded ? t('student.reassemble') : t('exploded.explode')}
            </Button>
          }
        />
      </div>
      <aside className="w-full border-t border-white/10 bg-[#0c1a2e]/95 p-5 text-white lg:w-[340px] lg:border-t-0 lg:border-l">
        {comp && active ? (
          <div className="rounded-2xl bg-white p-5 text-ink">
            <h2 className="text-lg font-bold">{loc(partName(active))}</h2>
            <p className="mt-2 text-sm">{loc(comp.definition)}</p>
            <p className="mt-3 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">{loc(comp.hint)}</p>
          </div>
        ) : (
          <p className="text-sm text-slate-300">{t('exploded.pickPart')}</p>
        )}
      </aside>
    </div>
  )

  if (vr) {
    return (
      <VrShell badge={t('student.explodedView')} hints={[t('vr.pinchSelect'), t('vr.menuForControls')]}>
        {body}
      </VrShell>
    )
  }
  return (
    <TrainingShell preview crumbs={[{ label: t('nav.lessonPreview'), to: '/teacher/preview' }, { label: t('student.explodedView') }]}>
      {body}
    </TrainingShell>
  )
}
