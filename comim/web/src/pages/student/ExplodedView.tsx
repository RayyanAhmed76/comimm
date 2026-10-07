import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Boxes, Combine, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { MachineView, PartThumb } from '@/components/training/MachineView'
import { TrainingShell } from '@/components/training/TrainingShell'
import { VrShell } from '@/pages/vr/VrChrome'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { catalogue, type PartId } from '@/data/content'

/** Exploded View — same model as the Guided Tour. Student course menu, course preview and VR menu. */
export default function ExplodedView() {
  const { t } = useTranslation()
  const loc = useLoc()
  const location = useLocation()
  const vr = location.pathname.startsWith('/vr')
  const preview = location.pathname.startsWith('/teacher')
  const [exploded, setExploded] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const comp = catalogue.find((c) => c.id === activeId) ?? null

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalogue.filter((c) => !q || loc(c.name).toLowerCase().includes(q)).sort((a, b) => loc(a.name).localeCompare(loc(b.name)))
  }, [query, loc])

  // A click on the scene opens the card of the first component of that part
  const pickPart = (part: PartId) => setActiveId(catalogue.find((c) => c.part === part)?.id ?? null)

  const body = (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <div className="relative min-h-[360px] flex-1 p-3 sm:p-4 lg:min-h-0">
        <MachineView
          exploded={exploded}
          highlight={comp ? [comp.part] : []}
          onPartClick={pickPart}
          showLabels
          controls={
            <Button variant="dark" className="rounded-full py-2" onClick={() => setExploded((v) => !v)}>
              {exploded ? <Combine className="h-4 w-4" /> : <Boxes className="h-4 w-4" />}
              {exploded ? t('student.reassemble') : t('exploded.explode')}
            </Button>
          }
        />
      </div>
      <aside className="flex w-full flex-col border-t border-white/10 bg-[#0c1a2e]/95 text-white lg:min-h-0 lg:w-[360px] lg:border-t-0 lg:border-l">
        {comp && (
          <div className="shrink-0 border-b border-white/10 p-4">
            <div className="rounded-2xl bg-white p-4 text-ink">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">{t(`catalog.types.${comp.type}`)}</div>
              <h2 className="mt-0.5 text-lg font-bold">{loc(comp.name)}</h2>
              <p className="mt-2 text-sm">{loc(comp.definition)}</p>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">{t('catalog.note')}</div>
              <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{loc(comp.note)}</p>
            </div>
          </div>
        )}
        <div className="shrink-0 px-4 pt-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-300">{t('exploded.partsList', { count: list.length })}</div>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('exploded.searchPart')}
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pr-3 pl-9 text-sm text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none"
            />
          </div>
          {!comp && <p className="mt-2 text-xs text-slate-400">{t('exploded.pickPart')}</p>}
        </div>
        <ul className="max-h-[320px] min-h-0 flex-1 space-y-1 overflow-y-auto p-4 lg:max-h-none">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                aria-pressed={activeId === c.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left text-sm',
                  activeId === c.id ? 'border-sky-400 bg-sky-500/20 font-semibold text-white' : 'border-transparent text-slate-200 hover:bg-white/10',
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950/60 ring-1 ring-white/10">
                  <PartThumb part={c.part} className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1 truncate">{loc(c.name)}</span>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-6 text-center text-sm text-slate-400">{t('search.noResults')}</li>}
        </ul>
      </aside>
    </div>
  )

  if (vr) {
    return (
      <VrShell fit badge={t('student.explodedView')} hints={[t('vr.pinchSelect'), t('vr.menuForControls')]}>
        {body}
      </VrShell>
    )
  }
  return (
    <TrainingShell
      fit
      preview={preview}
      crumbs={[preview ? { label: t('nav.lessonPreview'), to: '/teacher/preview' } : { label: t('student.courseMenu'), to: '/student' }, { label: t('student.explodedView') }]}
    >
      {body}
    </TrainingShell>
  )
}
