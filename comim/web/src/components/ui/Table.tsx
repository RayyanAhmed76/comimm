import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { InfoTip } from '@/components/ui/InfoTip'

export function useSort<T, K extends string>(rows: T[], initialKey: K, getValue: (row: T, key: K) => string | number, initialAsc = true) {
  const [key, setKey] = useState<K>(initialKey)
  const [asc, setAsc] = useState(initialAsc)
  const sorted = useMemo(() => {
    const list = [...rows]
    list.sort((a, b) => {
      const av = getValue(a, key)
      const bv = getValue(b, key)
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
      return asc ? cmp : -cmp
    })
    return list
    // getValue is a stable inline accessor in callers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, key, asc])
  const toggle = (k: K) => {
    if (k === key) setAsc((v) => !v)
    else {
      setKey(k)
      setAsc(true)
    }
  }
  return { sorted, key, asc, toggle }
}

export function SortTh<K extends string>({
  label,
  k,
  sort,
  className,
  info,
}: {
  label: string
  k: K
  sort: { key: K; asc: boolean; toggle: (k: K) => void }
  className?: string
  info?: string
}) {
  const active = sort.key === k
  const Icon = !active ? ChevronsUpDown : sort.asc ? ChevronUp : ChevronDown
  return (
    <th className={cn('px-4 py-3', className)} aria-sort={active ? (sort.asc ? 'ascending' : 'descending') : 'none'}>
      <span className="inline-flex items-center gap-1">
        <button type="button" onClick={() => sort.toggle(k)} className="inline-flex items-center gap-1 uppercase hover:text-ink">
          {label}
          <Icon className={cn('h-3.5 w-3.5', active ? 'text-brand-600' : 'text-slate-300')} />
        </button>
        {info && <InfoTip text={info} />}
      </span>
    </th>
  )
}

export function usePaged<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(1)
  const pages = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pages)
  const slice = rows.slice((current - 1) * pageSize, current * pageSize)
  return { slice, page: current, pages, setPage, from: rows.length ? (current - 1) * pageSize + 1 : 0, to: Math.min(current * pageSize, rows.length), total: rows.length }
}

export function Pagination({ paged }: { paged: ReturnType<typeof usePaged<unknown>> }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 text-sm text-muted">
      <span>{t('ui.showingRange', { from: paged.from, to: paged.to, total: paged.total })}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={t('ui.prevPage')}
          disabled={paged.page <= 1}
          onClick={() => paged.setPage(paged.page - 1)}
          className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: paged.pages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => paged.setPage(n)}
            className={cn(
              'min-w-8 rounded-lg border px-2.5 py-1',
              n === paged.page ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-200 hover:bg-slate-50',
            )}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label={t('ui.nextPage')}
          disabled={paged.page >= paged.pages}
          onClick={() => paged.setPage(paged.page + 1)}
          className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export const thRow = 'border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-muted'
export const inputSm =
  'h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'
