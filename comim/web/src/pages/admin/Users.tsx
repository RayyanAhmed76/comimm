import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Search, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { Pagination, SortTh, inputSm, thRow, usePaged, useSort } from '@/components/ui/Table'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { fmtDate, useLang } from '@/lib/i18n'
import { classCode, trackLabel } from '@/lib/labels'
import { uid } from '@/lib/store'
import { CURRENT_YEAR, type Student, type Teacher } from '@/data/mock'
import { addSchoolAudit, classesStore, establishmentsStore, schoolAuditStore, settingsStore, studentsStore, teachersStore } from '@/data/stores'

export type UserRow = { id: string; kind: 'teacher' | 'student'; name: string; firstName: string; lastName: string; email: string; initials: string; classes: string; track?: string; active?: boolean; last?: string }
type Row = UserRow

export function Users() {
  const { t } = useTranslation()
  const lang = useLang()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const teachers = teachersStore.use()
  const students = studentsStore.use()
  const classes = classesStore.use()
  const audit = schoolAuditStore.use()
  const est = establishmentsStore.use().find((e) => e.id === 'imc')
  const settings = settingsStore.use()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [role, setRole] = useState<'all' | 'teacher' | 'student'>('all')
  const [editing, setEditing] = useState<Row | 'new' | null>(null)

  const short = (id: string) => classes.find((c) => c.id === id)?.name.split(' ')[0] ?? id
  const rows: Row[] = [
    ...teachers.map((tc) => ({ id: tc.id, kind: 'teacher' as const, name: tc.name, firstName: tc.firstName, lastName: tc.lastName, email: tc.email, initials: tc.initials, classes: tc.classIds.map(short).join(', '), track: '', active: tc.active !== false, last: tc.lastLogin ?? '' })),
    ...students.map((s) => ({ id: s.id, kind: 'student' as const, name: s.name, firstName: s.firstName, lastName: s.lastName, email: s.email, initials: s.initials, classes: short(s.classId), track: classes.find((c) => c.id === s.classId)?.track ?? '', active: s.active !== false, last: s.lastActivity })),
  ]
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => (role === 'all' || r.kind === role) && (!q || `${r.name} ${r.email} ${r.classes}`.toLowerCase().includes(q)))
  const sort = useSort(filtered, 'lastName' as 'lastName' | 'kind' | 'email' | 'classes' | 'track' | 'active' | 'last', (r, k) => String(r[k] ?? ''))
  const paged = usePaged(sort.sorted, 10)
  const createdThisMonth = audit.filter((a) => a.action === 'userCreation' && a.date.startsWith('2026-09')).length

  return (
    <AppShell breadcrumb={[{ label: t('admin.users') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('admin.users')}</h1>
              <p className="mt-1 text-sm text-muted">
                {settings.name} · {t('admin.usersSubtitle')}
              </p>
            </div>
            <Button onClick={() => setEditing('new')}>
              <UserPlus className="h-4 w-4" />
              {t('admin.newUser')}
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('admin.teachers')} value={teachers.length} info={t('kpi.teachers')} onClick={() => setRole('teacher')} active={role === 'teacher'} />
          <StatCard label={t('admin.students')} value={students.length} info={t('kpi.students')} onClick={() => setRole('student')} active={role === 'student'} />
          <StatCard label={t('admin.accountsThisMonth')} value={createdThisMonth} valueClassName="text-brand-600" info={t('kpi.accountsThisMonth')} />
          <StatCard label={t('admin.seatsAvailable')} value={est ? est.seats - est.usedSeats : 0} info={t('kpi.seatsAvailable', { seats: est?.seats, used: est?.usedSeats })} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-ink">{t('admin.allUsers')}</h2>
              <p className="mt-0.5 text-sm text-muted">{t('admin.allUsersHint')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
              </div>
              <select value={role} onChange={(e) => setRole(e.target.value as 'all' | 'teacher' | 'student')} className={inputSm} aria-label={t('admin.role')}>
                <option value="all">{t('dash.allRoles')}</option>
                <option value="teacher">{t('common.teacher')}</option>
                <option value="student">{t('common.student')}</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('admin.name')} k="lastName" sort={sort} className="px-6" />
                  <SortTh label={t('admin.role')} k="kind" sort={sort} />
                  <SortTh label={t('admin.email')} k="email" sort={sort} />
                  <SortTh label={t('admin.classLabel')} k="classes" sort={sort} />
                  <SortTh label={t('teacher.track')} k="track" sort={sort} />
                  <SortTh label={t('common.status')} k="active" sort={sort} />
                  <SortTh label={t('detail.lastLogin')} k="last" sort={sort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((user) => (
                  <tr key={user.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => navigate(`/admin/users/${user.id}`)}>
                    <td className="px-6 py-3.5">
                      <Link to={`/admin/users/${user.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 font-semibold text-ink hover:text-brand-600">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{user.initials}</span>
                        {user.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={user.kind === 'teacher' ? 'green' : 'gray'}>{user.kind === 'teacher' ? t('common.teacher') : t('common.student')}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{user.email}</td>
                    <td className="px-4 py-3.5 font-medium text-ink">{user.classes || '—'}</td>
                    <td className="px-4 py-3.5 text-muted">{user.track ? trackLabel(user.track, lang) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone={user.active ? 'green' : 'orange'} dot>
                        {user.active ? t('common.active') : t('detail.deactivated')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{user.last ? fmtDate(user.last, lang) : '—'}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" onClick={() => setEditing(user)} aria-label={`${t('common.edit')} ${user.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {paged.slice.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted">
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
      {editing && <UserModal key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </AppShell>
  )
}

export function UserModal({ initial, onClose, presetClassId }: { initial: Row | null; onClose: () => void; presetClassId?: string }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const classes = classesStore.use().filter((c) => c.schoolYear === CURRENT_YEAR)
  const settings = settingsStore.use()
  const teachers = teachersStore.use()
  const students = studentsStore.use()
  const existingStudent = initial?.kind === 'student' ? students.find((s) => s.id === initial.id) : undefined
  const existingTeacher = initial?.kind === 'teacher' ? teachers.find((x) => x.id === initial.id) : undefined
  const [kind, setKind] = useState<'student' | 'teacher'>(initial?.kind ?? 'student')
  const [firstName, setFirstName] = useState(initial?.firstName ?? '')
  const [lastName, setLastName] = useState(initial?.lastName ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const startClass = classes.find((c) => c.id === (existingStudent?.classId ?? presetClassId))
  const [track, setTrack] = useState(startClass?.track ?? settings.tracks[0])
  const [classId, setClassId] = useState(existingStudent?.classId ?? startClass?.id ?? '')
  const [teacherClasses, setTeacherClasses] = useState<string[]>(existingTeacher?.classIds ?? [])

  const trackClasses = classes.filter((c) => c.track === track)
  const valid = firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email) && (kind === 'teacher' || classId)

  const save = () => {
    let newId = initial?.id ?? ''
    const base = { firstName: firstName.trim(), lastName: lastName.trim(), name: `${firstName.trim()} ${lastName.trim()}`, initials: `${firstName.trim()[0]}${lastName.trim()[0]}`.toUpperCase(), email: email.trim() }
    if (kind === 'student') {
      const s: Student = { ...existingStudent, id: initial?.id ?? uid('s'), ...base, classId, finalQuiz: existingStudent?.finalQuiz ?? 'Locked', lastActivity: existingStudent?.lastActivity ?? new Date().toISOString() }
      studentsStore.set((p) => (initial ? p.map((x) => (x.id === s.id ? s : x)) : [...p, s]))
      newId = s.id
    } else {
      const tc: Teacher = { ...existingTeacher, id: initial?.id ?? uid('u'), ...base, classIds: teacherClasses }
      newId = tc.id
      teachersStore.set((p) => (initial ? p.map((x) => (x.id === tc.id ? tc : x)) : [...p, tc]))
      classesStore.set((p) => p.map((c) => ({ ...c, teacherIds: teacherClasses.includes(c.id) ? Array.from(new Set([...c.teacherIds, tc.id])) : c.teacherIds.filter((x) => x !== tc.id) })))
    }
    const cls = classes.find((c) => c.id === classId)
    const before = classes.find((c) => c.id === existingStudent?.classId)
    const codes = (ids: string[]) => ids.map((x) => classCode(classes.find((c) => c.id === x)?.name ?? x)).join(', ') || { code: 'none' }
    // Structured before → after values (translated at display time in the audit log)
    const changes = [
      ...(initial && initial.name !== base.name ? [{ field: 'name', before: initial.name, after: base.name }] : []),
      ...(initial && initial.email !== base.email ? [{ field: 'email', before: initial.email, after: base.email }] : []),
      ...(kind === 'student' && cls && before?.id !== cls.id ? [{ field: 'class', before: before ? classCode(before.name) : { code: 'none' }, after: classCode(cls.name) }] : []),
      ...(kind === 'student' && cls && before && before.track !== cls.track ? [{ field: 'track', before: { code: `track.${before.track}` }, after: { code: `track.${cls.track}` } }] : []),
      ...(kind === 'teacher' && codes(existingTeacher?.classIds ?? []) !== codes(teacherClasses) ? [{ field: 'assignedClasses', before: codes(existingTeacher?.classIds ?? []), after: codes(teacherClasses) }] : []),
    ]
    addSchoolAudit({
      author: user?.name ?? '',
      profile: 'admin',
      action: initial ? 'userUpdate' : 'userCreation',
      target: `${kind === 'student' ? 'Student' : 'Teacher'} · ${base.firstName[0]}. ${base.lastName}${kind === 'student' && cls ? ` (${cls.name.split(' ')[0]})` : ''}`,
      ref: { kind, id: newId, label: base.name, sub: { code: kind } },
      changes,
      screen: 'users',
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t('admin.editUser') : t('admin.createUser')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!valid} onClick={save}>
            {initial ? t('common.saveChanges') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!initial && (
          <fieldset>
            <legend className="text-sm font-medium text-muted">{t('admin.role')}</legend>
            <div className="mt-2 flex gap-2">
              {(['student', 'teacher'] as const).map((k) => (
                <label key={k} className={cn('flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm', kind === k ? 'border-brand-500 bg-sky-50 font-semibold' : 'border-slate-200')}>
                  <input type="radio" checked={kind === k} onChange={() => setKind(k)} />
                  {k === 'student' ? t('common.student') : t('common.teacher')}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('admin.firstName')}>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={fieldClass} />
          </Field>
          <Field label={t('admin.lastName')}>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={fieldClass} />
          </Field>
        </div>
        <Field label={t('admin.email')}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </Field>
        {kind === 'student' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('teacher.track')}>
              <select
                value={track}
                onChange={(e) => {
                  setTrack(e.target.value)
                  setClassId('')
                }}
                className={fieldClass}
              >
                {settings.tracks.map((tr) => (
                  <option key={tr} value={tr}>
                    {trackLabel(tr, lang)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('admin.classCol')}>
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className={fieldClass}>
                <option value="">{t('dash.chooseClass')}</option>
                {trackClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {trackClasses.length === 0 && <span className="mt-1 block text-xs text-warning-600">{t('dash.noClassForTrack')}</span>}
            </Field>
          </div>
        ) : (
          <fieldset>
            <legend className="text-sm font-medium text-muted">{t('dash.teacherClasses')}</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <input type="checkbox" checked={teacherClasses.includes(c.id)} onChange={() => setTeacherClasses((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </div>
    </Modal>
  )
}
