import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Box, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { SortTh, useSort, thRow } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { catalogue, type Component } from '@/data/content'

const QUERY_KEY = 'comim:catalog-query'

function readQuery() {
  try {
    return sessionStorage.getItem(QUERY_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function Catalog() {
  const { t } = useTranslation()
  const loc = useLoc()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const focusId = params.get('focus')
  const [query, setQuery] = useState(readQuery)

  useEffect(() => {
    try {
      sessionStorage.setItem(QUERY_KEY, query)
    } catch {
      /* ignore */
    }
  }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalogue
    return catalogue.filter((c) => `${loc(c.name)} ${loc(c.definition)} ${loc(c.hint)}`.toLowerCase().includes(q))
  }, [query, loc])

  const sort = useSort<Component, 'name' | 'definition'>(filtered, 'name', (c, k) => loc(k === 'name' ? c.name : c.definition))

  // Back from the 3D view: return to the same position in the list
  useEffect(() => {
    if (!focusId) return
    const el = document.getElementById(`row-${focusId}`)
    el?.scrollIntoView({ block: 'center' })
  }, [focusId])

  return (
    <TrainingShell dark={false} crumbs={[{ label: t('student.courseMenu'), to: '/student' }, { label: t('student.catalog') }]}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h1 className="text-xl font-bold text-ink">{t('student.catalog')}</h1>
              <p className="text-sm text-muted">{t('catalog.count', { count: catalogue.length })}</p>
            </div>
            <div className="relative w-full min-w-[240px] sm:w-auto">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('student.searchComponent')}
                className="w-full rounded-xl border border-slate-200 py-2.5 pr-3 pl-10 text-sm text-ink placeholder:text-muted"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('student.name')} k="name" sort={sort} className="px-6" />
                  <SortTh label={t('student.definition')} k="definition" sort={sort} />
                  <th className="px-4 py-3">{t('student.technicalNote')}</th>
                  <th className="px-4 py-3">{t('student.view3d')}</th>
                </tr>
              </thead>
              <tbody>
                {sort.sorted.map((c) => (
                  <tr key={c.id} id={`row-${c.id}`} className={cn('border-b border-slate-100 last:border-0', focusId === c.id && 'bg-sky-50')}>
                    <td className="px-6 py-4 font-bold text-ink">{loc(c.name)}</td>
                    <td className="px-4 py-4 text-slate-700">{loc(c.definition)}</td>
                    <td className="px-4 py-4 text-muted">{loc(c.hint)}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => navigate(`/student/catalog/${c.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Box className="h-3.5 w-3.5" />
                        3D
                      </button>
                    </td>
                  </tr>
                ))}
                {sort.sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted">
                      {t('search.noResults')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TrainingShell>
  )
}

export function ComponentView() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const location = useLocation()
  const c = catalogue.find((x) => x.id === id) ?? catalogue[0]
  const sameAssembly = catalogue.filter((x) => x.part === c.part && x.id !== c.id)
  const back = `/student/catalog?focus=${c.id}`
  void location

  return (
    <TrainingShell
      crumbs={[
        { label: t('student.courseMenu'), to: '/student' },
        { label: t('student.catalog'), to: back },
        { label: loc(c.name) },
      ]}
      actions={
        <Link to={back} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('catalog.back')}
        </Link>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[340px] flex-1 p-2 sm:p-4 lg:min-h-0">
          <MachineView key={c.id} highlight={[c.part]} focus={c.part} initialZoom={2} showLabels dimOthers />
        </div>
        <aside className="w-full border-t border-white/10 bg-[#0c1a2e]/95 p-5 lg:w-[380px] lg:border-t-0 lg:border-l">
          <div className="rounded-2xl bg-white p-5 text-ink shadow-xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">{t('catalog.card')}</div>
            <div className="mt-1 flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold">{loc(c.name)}</h1>
              <SpeakButton text={`${loc(c.name)}. ${loc(c.definition)} ${loc(c.hint)}`} />
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('student.definition')}</div>
            <p className="mt-1 text-sm">{loc(c.definition)}</p>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('catalog.hint')}</div>
            <p className="mt-1 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">{loc(c.hint)}</p>
            {sameAssembly.length > 0 && (
              <>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('catalog.sameAssembly')}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sameAssembly.map((o) => (
                    <Link key={o.id} to={`/student/catalog/${o.id}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink hover:bg-slate-200">
                      {loc(o.name)}
                    </Link>
                  ))}
                </div>
              </>
            )}
            <Link to={back} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
              <ArrowLeft className="h-4 w-4" />
              {t('catalog.back')}
            </Link>
          </div>
        </aside>
      </div>
    </TrainingShell>
  )
}
