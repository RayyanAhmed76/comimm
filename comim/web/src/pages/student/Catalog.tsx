import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, Box, Lock, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TrainingShell } from '@/components/training/TrainingShell'
import { MachineView, PartThumb } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { catalogue, COMPONENT_TYPES, type ComponentType } from '@/data/content'
import { quizInProgressStore } from '@/data/stores'

const QUERY_KEY = 'comim:catalog-query'

function readQuery() {
  try {
    return sessionStorage.getItem(QUERY_KEY) ?? ''
  } catch {
    return ''
  }
}

/** Students reach the catalogue from the course menu, teachers from the course preview. */
function useCatalogChrome() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const preview = user?.role === 'teacher'
  const inQuiz = quizInProgressStore.use().includes(user?.studentId ?? '-')
  const home = preview ? { label: t('nav.lessonPreview'), to: '/teacher/preview' } : { label: t('student.courseMenu'), to: '/student' }
  return { preview, inQuiz, home }
}

/** The catalogue is not reachable during a Final Quiz attempt. */
function QuizLock({ home }: { home: { label: string; to: string } }) {
  const { t } = useTranslation()
  return (
    <TrainingShell dark={false} lockNav crumbs={[home, { label: t('student.catalog') }]}>
      <div className="mx-auto max-w-md px-6 py-16 text-center text-ink">
        <Lock className="mx-auto h-10 w-10 text-slate-400" />
        <h1 className="mt-4 text-xl font-bold">{t('catalog.lockedTitle')}</h1>
        <p className="mt-2 text-sm text-muted">{t('catalog.lockedHint')}</p>
        <Link to="/student/final-quiz" className="mt-6 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {t('catalog.backToQuiz')}
        </Link>
      </div>
    </TrainingShell>
  )
}

export default function Catalog() {
  const { t } = useTranslation()
  const loc = useLoc()
  const { preview, inQuiz, home } = useCatalogChrome()
  const [params] = useSearchParams()
  const focusId = params.get('focus')
  const [query, setQuery] = useState(readQuery)
  const [type, setType] = useState<ComponentType | 'all'>('all')
  const [asc, setAsc] = useState(true)

  useEffect(() => {
    try {
      sessionStorage.setItem(QUERY_KEY, query)
    } catch {
      /* ignore */
    }
  }, [query])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalogue
      .filter((c) => type === 'all' || c.type === type)
      .filter((c) => !q || `${loc(c.name)} ${loc(c.definition)} ${loc(c.note)}`.toLowerCase().includes(q))
      .sort((a, b) => loc(a.name).localeCompare(loc(b.name)) * (asc ? 1 : -1))
  }, [query, type, asc, loc])

  // Back from the 3D view: return to the same position in the list
  useEffect(() => {
    if (!focusId) return
    document.getElementById(`row-${focusId}`)?.scrollIntoView({ block: 'center' })
  }, [focusId])

  if (inQuiz) return <QuizLock home={home} />

  const chip = (value: ComponentType | 'all') => {
    const count = value === 'all' ? catalogue.length : catalogue.filter((c) => c.type === value).length
    return (
      <button
        key={value}
        type="button"
        onClick={() => setType(value)}
        aria-pressed={type === value}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
          type === value ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        )}
      >
        {t(`catalog.types.${value}`)}
        <span className={cn('rounded-full px-1.5 text-[10px]', type === value ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>{count}</span>
      </button>
    )
  }

  return (
    <TrainingShell dark={false} preview={preview} crumbs={[home, { label: t('student.catalog') }]}>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-ink">{t('student.catalog')}</h1>
              <p className="text-sm text-muted">
                {t('catalog.count', { count: catalogue.length })}
                {filtered.length !== catalogue.length && ` · ${t('catalog.shown', { count: filtered.length })}`}
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-72">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('student.searchComponent')}
                  className="h-11 w-full rounded-xl border border-slate-200 pr-3 pl-10 text-sm text-ink placeholder:text-muted"
                />
              </div>
              <button
                type="button"
                onClick={() => setAsc((v) => !v)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ink hover:bg-slate-50"
              >
                {asc ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />}
                <span className="hidden sm:inline">{t(asc ? 'catalog.sortAZ' : 'catalog.sortZA')}</span>
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{(['all', ...COMPONENT_TYPES] as const).map(chip)}</div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-muted">{t('search.noResults')}</p>
        ) : (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <li key={c.id} id={`row-${c.id}`}>
                <Link
                  to={`/student/catalog/${c.id}`}
                  className={cn(
                    'flex h-full gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:border-sky-300 hover:shadow-md',
                    focusId === c.id ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200',
                  )}
                >
                  <div className="grid-blueprint flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                    <PartThumb part={c.part} className="h-16 w-16" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-bold leading-snug text-ink">{loc(c.name)}</h2>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        <Box className="h-3 w-3" />
                        3D
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-600">{t(`catalog.types.${c.type}`)}</div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-700">{loc(c.definition)}</p>
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted">
                      <span className="font-semibold">{t('catalog.note')} · </span>
                      {loc(c.note)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </TrainingShell>
  )
}

export function ComponentView() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const { preview, inQuiz, home } = useCatalogChrome()
  const c = catalogue.find((x) => x.id === id) ?? catalogue[0]
  const sameAssembly = catalogue.filter((x) => x.part === c.part && x.id !== c.id)
  const back = `/student/catalog?focus=${c.id}`

  if (inQuiz) return <QuizLock home={home} />

  return (
    <TrainingShell
      fit
      preview={preview}
      crumbs={[home, { label: t('student.catalog'), to: back }, { label: loc(c.name) }]}
      actions={
        <Link to={back} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t('catalog.back')}
        </Link>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-[340px] flex-1 p-3 sm:p-4 lg:min-h-0">
          <MachineView highlight={[c.part]} focus={c.part} showLabels dimOthers />
        </div>
        <aside className="w-full border-t border-white/10 bg-[#0c1a2e]/95 p-5 lg:min-h-0 lg:w-[380px] lg:overflow-y-auto lg:border-t-0 lg:border-l">
          <div className="rounded-2xl bg-white p-5 text-ink shadow-xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">
              {t('catalog.card')} · {t(`catalog.types.${c.type}`)}
            </div>
            <div className="mt-1 flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold">{loc(c.name)}</h1>
              <SpeakButton text={`${loc(c.name)}. ${loc(c.definition)} ${loc(c.note)}`} />
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('student.definition')}</div>
            <p className="mt-1 text-sm">{loc(c.definition)}</p>
            {/* Same label as in the list — a note, not a hint */}
            <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">{t('catalog.note')}</div>
            <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{loc(c.note)}</p>
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
