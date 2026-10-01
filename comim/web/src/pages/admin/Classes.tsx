import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Tooltip } from '@/components/ui/InfoTip'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { Pagination, SortTh, inputSm, thRow, usePaged, useSort } from '@/components/ui/Table'
import { useAuth } from '@/context/AuthContext'
import { uid } from '@/lib/store'
import { CURRENT_YEAR, SCHOOL_YEARS } from '@/data/mock'
import {
  addSchoolAudit,
  assignmentsStore,
  attemptsStore,
  classesStore,
  classProgress,
  classStatus,
  settingsStore,
  studentsStore,
  teachersStore,
  type ClassWithTeachers,
} from '@/data/stores'
import { statusKey, statusTone } from '@/pages/teacher/MyClasses'

export function Classes() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const classes = classesStore.use()
  const students = studentsStore.use()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const teachers = teachersStore.use()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [editing, setEditing] = useState<ClassWithTeachers | 'new' | null>(null)

  const rows = classes
    .filter((c) => c.schoolYear === year)
    .map((c) => {
      const progress = classProgress(c.id, students, assignments, attempts)
      return {
        ...c,
        headcount: students.filter((s) => s.classId === c.id).length,
        teacherNames: c.teacherIds.map((id) => teachers.find((x) => x.id === id)?.name).filter(Boolean).join(', '),
        progress,
        status: classStatus(progress),
      }
    })
    .filter((c) => !query.trim() || `${c.name} ${c.track} ${c.teacherNames}`.toLowerCase().includes(query.trim().toLowerCase()))
  const sort = useSort(rows, 'name' as 'name' | 'track' | 'teacherNames' | 'headcount' | 'progress' | 'status', (r, k) => (k === 'headcount' || k === 'progress' ? r[k] : String(r[k])))
  const paged = usePaged(sort.sorted, 10)

  return (
    <AppShell breadcrumb={[{ label: t('admin.classesTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('admin.classesTitle')}</h1>
              <p className="mt-1 text-sm text-muted">{t('admin.manageClassesYear', { year })}</p>
            </div>
            <Button onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" />
              {t('admin.newClass')}
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-6 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
            </div>
            <select value={year} onChange={(e) => setYear(e.target.value)} className={inputSm} aria-label={t('admin.schoolYear')}>
              {SCHOOL_YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('admin.classesTitle')} k="name" sort={sort} className="px-6" />
                  <SortTh label={t('teacher.track')} k="track" sort={sort} />
                  <SortTh label={t('common.teacher')} k="teacherNames" sort={sort} />
                  <SortTh label={t('admin.headcount')} k="headcount" sort={sort} />
                  <SortTh label={t('common.progress')} k="progress" sort={sort} info={t('kpi.progressRule')} />
                  <SortTh label={t('common.status')} k="status" sort={sort} info={t('kpi.statusRule')} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((cls) => (
                  <tr key={cls.id} className="border-b border-slate-100">
                    <td className="px-6 py-3.5 font-semibold text-ink">{cls.name}</td>
                    <td className="px-4 py-3.5 text-muted">{cls.track}</td>
                    <td className="px-4 py-3.5 text-muted">{cls.teacherNames || '—'}</td>
                    <td className="px-4 py-3.5 text-muted">{cls.headcount}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={cls.progress} className="max-w-[100px]" />
                        <span className="text-xs font-semibold">{cls.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Tooltip content={t('kpi.statusRule')}>
                        <Badge tone={statusTone(cls.status)} dot>
                          {t(statusKey(cls.status))}
                        </Badge>
                      </Tooltip>
                    </td>
                    <td className="px-4 py-3.5">
                      <Button variant="ghost" onClick={() => setEditing(cls)} aria-label={`${t('common.edit')} ${cls.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {paged.slice.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted">
                      {t('dash.noMatch')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination paged={paged} />
        </Card>
      </div>
      {editing && <ClassModal key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </AppShell>
  )
}

function ClassModal({ initial, onClose }: { initial: ClassWithTeachers | null; onClose: () => void }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const settings = settingsStore.use()
  const teachers = teachersStore.use()
  const [name, setName] = useState(initial?.name ?? '')
  const [track, setTrack] = useState(initial?.track ?? settings.tracks[0])
  const [teacherIds, setTeacherIds] = useState<string[]>(initial?.teacherIds ?? [])
  const [year, setYear] = useState(initial?.schoolYear ?? CURRENT_YEAR)

  const save = () => {
    const next: ClassWithTeachers = { id: initial?.id ?? uid('c'), name: name.trim(), track, teacherIds, schoolYear: year }
    classesStore.set((p) => (initial ? p.map((c) => (c.id === next.id ? next : c)) : [...p, next]))
    teachersStore.set((p) => p.map((tc) => ({ ...tc, classIds: teacherIds.includes(tc.id) ? Array.from(new Set([...tc.classIds, next.id])) : tc.classIds.filter((x) => x !== next.id) })))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: initial ? 'classUpdate' : 'classCreation', target: `${next.name}, ${year}`, screen: 'classes' })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t('admin.editClass') : t('admin.createClass')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!name.trim()} onClick={save}>
            {initial ? t('common.saveChanges') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label={t('admin.className')}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="2C — Marine Mechanics" className={fieldClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('teacher.track')}>
            <select value={track} onChange={(e) => setTrack(e.target.value)} className={fieldClass}>
              {settings.tracks.map((tr) => (
                <option key={tr}>{tr}</option>
              ))}
            </select>
          </Field>
          <Field label={t('admin.schoolYear')}>
            <select value={year} onChange={(e) => setYear(e.target.value)} className={fieldClass}>
              {SCHOOL_YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </Field>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-muted">{t('dash.classTeachers')}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {teachers.map((tc) => (
              <label key={tc.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={teacherIds.includes(tc.id)} onChange={() => setTeacherIds((p) => (p.includes(tc.id) ? p.filter((x) => x !== tc.id) : [...p, tc.id]))} />
                {tc.name}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </Modal>
  )
}
