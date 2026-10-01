import { useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Student } from '@/data/mock'

/** Checklist of students with search and "select all". */
export function StudentPicker({ students, value, onChange }: { students: Student[]; value: string[]; onChange: (ids: string[]) => void }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const visible = students.filter((s) => !q || s.name.toLowerCase().includes(q))
  const allOn = visible.length > 0 && visible.every((s) => value.includes(s.id))

  return (
    <div className="rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-2">
        <div className="relative min-w-[160px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('teacher.searchStudent')} className="h-9 w-full rounded-lg border border-slate-200 pr-2 pl-8 text-sm" />
        </div>
        <label className="flex items-center gap-2 px-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={allOn}
            onChange={() => onChange(allOn ? value.filter((id) => !visible.some((s) => s.id === id)) : Array.from(new Set([...value, ...visible.map((s) => s.id)])))}
          />
          {t('dash.selectAll')}
        </label>
      </div>
      <ul className="max-h-56 divide-y divide-slate-50 overflow-y-auto">
        {visible.map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50">
              <input type="checkbox" checked={value.includes(s.id)} onChange={() => onChange(value.includes(s.id) ? value.filter((x) => x !== s.id) : [...value, s.id])} />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-[10px] font-bold text-white">{s.initials}</span>
              <span className="text-ink">{s.name}</span>
            </label>
          </li>
        ))}
        {visible.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">{t('search.noResults')}</li>}
      </ul>
      <div className="border-t border-slate-100 px-3 py-2 text-xs font-semibold text-brand-600">{t('dash.selectedCount', { count: value.length })}</div>
    </div>
  )
}
