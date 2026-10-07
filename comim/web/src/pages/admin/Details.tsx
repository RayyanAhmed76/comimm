import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Archive, ArrowRightLeft, CalendarPlus, Eye, Headphones, KeyRound, Link2Off, Monitor, Pencil, Power, UserPlus, Users as UsersIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { useAuditFmt } from '@/components/AuditTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { thRow } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { fmtDate, fmtDateTime, fmtDuration, useLang, useLoc } from '@/lib/i18n'
import { classCode, classLabel, trackLabel } from '@/lib/labels'
import { uid } from '@/lib/store'
import { moduleNames, PASS_THRESHOLD, type ModuleId } from '@/data/content'
import { liveSessions, type AuditEntry, type Student } from '@/data/mock'
import {
  addSchoolAudit,
  assignmentsStore,
  attemptsFor,
  attemptsStore,
  classesStore,
  classProgress,
  classStatus,
  effectiveScore,
  headsetsStore,
  quizClasses,
  schoolAuditStore,
  settingsStore,
  studentProgress,
  studentsStore,
  teachersStore,
} from '@/data/stores'
import { statusKey, statusTone } from '@/pages/teacher/MyClasses'
import { UserModal, type UserRow } from '@/pages/admin/Users'
import { ClassModal } from '@/pages/admin/Classes'
import { HeadsetModal } from '@/pages/admin/Headsets'

const MODULES: ModuleId[] = ['tour', 'identification', 'startup', 'repair', 'finalQuiz']

function Section({ title, hint, action, children }: { title: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{children}</div>
    </div>
  )
}

const empty = (text: string) => <p className="px-6 py-6 text-sm text-muted">{text}</p>
const link = 'font-semibold text-brand-600 hover:underline'

/** Recent audit entries about an entity. */
function Activity({ entries }: { entries: AuditEntry[] }) {
  const { t } = useTranslation()
  const lang = useLang()
  const fmt = useAuditFmt()
  if (entries.length === 0) return empty(t('detail.noActivity'))
  return (
    <ul className="divide-y divide-slate-100">
      {entries.slice(0, 6).map((e) => (
        <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-6 py-3 text-sm">
          <span className="min-w-0">
            <span className="font-semibold text-ink">{t(`audit.actions.${e.action}`)}</span>
            <span className="text-muted">
              {' '}
              · {e.author}
              {e.changes?.length ? ` · ${e.changes.map((c) => `${fmt.field(c.field)} : ${fmt.val(c.before)} → ${fmt.val(c.after)}`).join(' ; ')}` : ''}
            </span>
          </span>
          <span className="shrink-0 text-xs text-muted">{fmtDateTime(e.date, lang)}</span>
        </li>
      ))}
    </ul>
  )
}

function Confirm({ title, text, confirm, onClose, onConfirm, children }: { title: string; text: string; confirm: string; onClose: () => void; onConfirm: () => void; children?: React.ReactNode }) {
  const { t } = useTranslation()
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirm}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed">{text}</p>
      {children}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  User — /admin/users/:id                                            */
/* ------------------------------------------------------------------ */

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const { user } = useAuth()
  const students = studentsStore.use()
  const teachers = teachersStore.use()
  const classes = classesStore.use()
  const attempts = attemptsStore.use()
  const assignments = assignmentsStore.use()
  const audit = schoolAuditStore.use()
  const settings = settingsStore.use()
  const [editing, setEditing] = useState(false)
  const [moving, setMoving] = useState(false)
  const [toggling, setToggling] = useState(false)

  const student = students.find((s) => s.id === id)
  const teacher = teachers.find((x) => x.id === id)
  const person = student ?? teacher
  if (!person) return <Navigate to="/admin/users" replace />
  const active = person.active !== false
  const kind = student ? 'student' : 'teacher'
  const row: UserRow = { id: person.id, kind, name: person.name, firstName: person.firstName, lastName: person.lastName, email: person.email, initials: person.initials, classes: '' }

  const setActive = () => {
    if (student) studentsStore.set((p) => p.map((s) => (s.id === student.id ? { ...s, active: !active } : s)))
    else teachersStore.set((p) => p.map((x) => (x.id === person.id ? { ...x, active: !active } : x)))
    addSchoolAudit({
      author: user?.name ?? '',
      profile: 'admin',
      action: active ? 'userDeactivated' : 'userReactivated',
      target: person.name,
      ref: { kind, id: person.id, label: person.name, sub: { code: kind } },
      changes: [{ field: 'status', before: { code: active ? 'active' : 'disabled' }, after: { code: active ? 'disabled' : 'active' } }],
      screen: 'users',
    })
    toast(t(active ? 'detail.userDeactivated' : 'detail.userReactivated', { name: person.name }))
    setToggling(false)
  }

  const header = (sub: React.ReactNode, actions: React.ReactNode) => (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-lg font-bold text-white">{person.initials}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{person.name}</h1>
              <Badge tone={kind === 'teacher' ? 'green' : 'gray'}>{t(`common.${kind}`)}</Badge>
              <Badge tone={active ? 'green' : 'orange'} dot>
                {active ? t('common.active') : t('detail.deactivated')}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{person.email}</p>
            {sub}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            {t('common.edit')}
          </Button>
          {actions}
          <Button variant={active ? 'danger' : 'secondary'} onClick={() => setToggling(true)}>
            <Power className="h-4 w-4" />
            {active ? t('detail.deactivate') : t('detail.reactivate')}
          </Button>
        </div>
      </div>
    </Card>
  )

  const modals = (
    <>
      {editing && <UserModal initial={row} onClose={() => setEditing(false)} />}
      {toggling && (
        <Confirm
          title={active ? t('detail.deactivateTitle', { name: person.name }) : t('detail.reactivateTitle', { name: person.name })}
          text={active ? t('detail.deactivateText') : t('detail.reactivateText')}
          confirm={active ? t('detail.deactivate') : t('detail.reactivate')}
          onClose={() => setToggling(false)}
          onConfirm={setActive}
        />
      )}
    </>
  )

  if (student) {
    const cls = classes.find((c) => c.id === student.classId)
    const clsTeachers = teachers.filter((x) => cls?.teacherIds.includes(x.id))
    const mine = attempts.filter((a) => a.studentId === student.id)
    const progress = studentProgress(student, assignments, attempts)
    const recent = [...mine].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
    return (
      <AppShell breadcrumb={[{ label: t('admin.users'), to: '/admin/users' }, { label: person.name }]}>
        <div className="space-y-6">
          {header(
            <p className="mt-1 text-sm text-muted">
              {cls ? (
                <Link to={`/admin/classes/${cls.id}`} className={link}>
                  {classLabel(cls.name, lang)}
                </Link>
              ) : (
                '—'
              )}
              {cls && ` · ${trackLabel(cls.track, lang)}`} · {t('teacher.lastActivity')}: {fmtDate(student.lastActivity, lang)}
            </p>,
            <Button variant="secondary" onClick={() => setMoving(true)}>
              <ArrowRightLeft className="h-4 w-4" />
              {t('dash.changeClass')}
            </Button>,
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Info label={t('admin.classCol')}>
              {cls ? (
                <Link to={`/admin/classes/${cls.id}`} className={link}>
                  {classCode(cls.name)}
                </Link>
              ) : (
                '—'
              )}
              {cls && <span className="font-normal text-muted"> · {trackLabel(cls.track, lang)}</span>}
            </Info>
            <Info label={t('admin.teachers')}>
              {clsTeachers.length
                ? clsTeachers.map((x, i) => (
                    <span key={x.id}>
                      {i > 0 && ', '}
                      <Link to={`/admin/users/${x.id}`} className={link}>
                        {x.name}
                      </Link>
                    </span>
                  ))
                : '—'}
            </Info>
            <Info label={t('common.progress')}>
              <span className="flex items-center gap-2">
                <ProgressBar value={progress} className="max-w-[120px] flex-1" />
                {progress} %
              </span>
            </Info>
            <Info label={t('detail.devices')}>
              <span className="inline-flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" /> Web {mine.filter((a) => a.device === 'Web').length}
              </span>
              <span className="ml-3 inline-flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5" /> VR {mine.filter((a) => a.device === 'VR').length}
              </span>
            </Info>
          </div>

          <Section title={t('detail.progressByExercise')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className={thRow}>
                    <th className="px-6 py-3">{t('teacher.exercise')}</th>
                    <th className="px-4 py-3">{t('common.status')}</th>
                    <th className="px-4 py-3">{t('results.best')}</th>
                    <th className="px-4 py-3">{t('results.last')}</th>
                    <th className="px-4 py-3">{t('dash.quizAttempts')}</th>
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((m) => {
                    const list = attemptsFor(attempts, student.id, m)
                    const done = list.filter((a) => a.status === 'completed')
                    const best = done.length ? Math.max(...done.map(effectiveScore)) : null
                    const last = done.length ? effectiveScore(done[done.length - 1]) : null
                    const status =
                      m === 'finalQuiz'
                        ? { label: t(student.finalQuiz === 'Completed' ? 'common.completed' : student.finalQuiz === 'Open' ? 'common.open' : 'dash.quizNotOpen'), tone: student.finalQuiz === 'Completed' ? 'green' : student.finalQuiz === 'Open' ? 'blue' : 'gray' }
                        : done.length
                          ? { label: t('common.completed'), tone: 'green' }
                          : list.length
                            ? { label: t('common.inProgress'), tone: 'blue' }
                            : { label: t('detail.notStarted'), tone: 'gray' }
                    const score = (v: number | null) => (v == null || m === 'tour' ? '—' : <span className={v >= PASS_THRESHOLD ? 'text-success-600' : 'text-warning-600'}>{v} %</span>)
                    return (
                      <tr key={m} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-3 font-semibold text-ink">{loc(moduleNames[m])}</td>
                        <td className="px-4 py-3">
                          <Badge tone={status.tone as 'green' | 'blue' | 'gray'}>{status.label}</Badge>
                        </td>
                        <td className="px-4 py-3 font-semibold">{score(best)}</td>
                        <td className="px-4 py-3 font-semibold">{score(last)}</td>
                        <td className="px-4 py-3 text-muted">{list.length}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Section>

          <div className="grid gap-6 xl:grid-cols-2">
            <Section title={t('detail.recentAttempts')}>
              {recent.length === 0
                ? empty(t('results.noAttempt'))
                : (
                    <ul className="divide-y divide-slate-100">
                      {recent.map((a) => (
                        <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
                          <span>
                            <span className="font-semibold text-ink">{loc(moduleNames[a.module])}</span>
                            <span className="block text-xs text-muted">
                              {fmtDateTime(a.date, lang)} · {a.device} · {fmtDuration(a.durationSec)}
                            </span>
                          </span>
                          {a.status === 'abandoned' ? (
                            <Badge tone="gray">{t('results.abandoned')}</Badge>
                          ) : a.module === 'tour' ? (
                            <Badge tone="green">{t('common.completed')}</Badge>
                          ) : (
                            <span className={`font-bold ${effectiveScore(a) >= PASS_THRESHOLD ? 'text-success-600' : 'text-warning-600'}`}>{effectiveScore(a)} %</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
            </Section>
            <Section title={t('detail.recentActivity')}>
              <Activity entries={audit.filter((e) => e.ref?.id === student.id)} />
            </Section>
          </div>
        </div>
        {modals}
        {moving && <MoveStudent student={student} onClose={() => setMoving(false)} />}
      </AppShell>
    )
  }

  // Teacher
  const tc = teacher!
  const taught = classes.filter((c) => c.teacherIds.includes(tc.id))
  return (
    <AppShell breadcrumb={[{ label: t('admin.users'), to: '/admin/users' }, { label: person.name }]}>
      <div className="space-y-6">
        {header(
          <p className="mt-1 text-sm text-muted">
            {t('detail.lastLogin')}: {tc.lastLogin ? fmtDateTime(tc.lastLogin, lang) : t('detail.never')}
          </p>,
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <UsersIcon className="h-4 w-4" />
            {t('detail.assignClasses')}
          </Button>,
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Info label={t('detail.classesTaught')}>{quizClasses(taught).length}</Info>
          <Info label={t('detail.lastLogin')}>{tc.lastLogin ? fmtDateTime(tc.lastLogin, lang) : t('detail.never')}</Info>
          <Info label={t('settings.delegation')}>
            <Badge tone={settings.delegation ? 'green' : 'gray'}>{settings.delegation ? t('admin.enabled') : t('admin.disabled')}</Badge>
            <Link to="/admin/settings" className={`ml-2 text-xs ${link}`}>
              {t('nav.settings')}
            </Link>
          </Info>
        </div>

        <Section title={t('detail.classesTaught')}>
          {taught.length === 0 ? (
            empty(t('detail.noClass'))
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className={thRow}>
                    <th className="px-6 py-3">{t('admin.classCol')}</th>
                    <th className="px-4 py-3">{t('admin.schoolYear')}</th>
                    <th className="px-4 py-3">{t('admin.headcount')}</th>
                    <th className="px-4 py-3">{t('common.progress')}</th>
                    <th className="px-4 py-3">{t('detail.quizOpened')}</th>
                  </tr>
                </thead>
                <tbody>
                  {taught.map((c) => {
                    const list = students.filter((s) => s.classId === c.id)
                    const progress = classProgress(c.id, students, assignments, attempts)
                    return (
                      <tr key={c.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-3">
                          <Link to={`/admin/classes/${c.id}`} className={link}>
                            {classLabel(c.name, lang)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted">{c.schoolYear}</td>
                        <td className="px-4 py-3 text-muted">{list.length}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <ProgressBar value={progress} className="max-w-[100px]" />
                            <span className="text-xs font-semibold">{progress}%</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {list.filter((s) => s.finalQuiz !== 'Locked').length} / {list.length}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title={t('detail.recentActions')}>
          <Activity entries={audit.filter((e) => e.author === tc.name || e.ref?.id === tc.id)} />
        </Section>
      </div>
      {modals}
    </AppShell>
  )
}

/** Change of class by the Client Admin — always logged. */
function MoveStudent({ student, onClose }: { student: Student; onClose: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const classes = classesStore.use()
  const options = quizClasses(classes).filter((c) => c.id !== student.classId)
  const from = classes.find((c) => c.id === student.classId)
  const [to, setTo] = useState(options[0]?.id ?? '')
  const target = options.find((c) => c.id === to)

  const save = () => {
    if (!target) return
    studentsStore.set((p) => p.map((s) => (s.id === student.id ? { ...s, classId: target.id } : s)))
    addSchoolAudit({
      author: user?.name ?? '',
      profile: 'admin',
      action: 'classChange',
      target: `${student.name}: ${classCode(from?.name ?? '')} → ${classCode(target.name)}`,
      ref: { kind: 'student', id: student.id, label: student.name, sub: { code: 'student' } },
      changes: [
        { field: 'class', before: classCode(from?.name ?? '—'), after: classCode(target.name) },
        ...(from && from.track !== target.track ? [{ field: 'track', before: { code: `track.${from.track}` }, after: { code: `track.${target.track}` } }] : []),
      ],
      screen: 'users',
    })
    toast(t('dash.classChanged', { name: student.name, code: classCode(target.name) }))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={t('dash.changeClass')}
      subtitle={student.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!target} onClick={save}>
            {t('common.confirm')}
          </Button>
        </>
      }
    >
      <Field label={t('dash.newClass')}>
        <select value={to} onChange={(e) => setTo(e.target.value)} className={fieldClass}>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {classLabel(c.name, lang)}
            </option>
          ))}
        </select>
        <span className="mt-1.5 block text-xs font-normal text-muted">{t('dash.changeClassLogged')}</span>
      </Field>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */
/*  Class — /admin/classes/:id                                         */
/* ------------------------------------------------------------------ */

const nextYear = (y: string) => {
  const [a, b] = y.split('–').map(Number)
  return `${a + 1}–${b + 1}`
}

export function AdminClassDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const navigate = useNavigate()
  const { user } = useAuth()
  const classes = classesStore.use()
  const students = studentsStore.use()
  const teachers = teachersStore.use()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const headsets = headsetsStore.use()
  const audit = schoolAuditStore.use()
  const [editing, setEditing] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [transferring, setTransferring] = useState(false)
  const [moving, setMoving] = useState<Student | null>(null)
  const [adding, setAdding] = useState(false)

  const cls = classes.find((c) => c.id === id)
  if (!cls) return <Navigate to="/admin/classes" replace />
  const code = classCode(cls.name)
  const list = students.filter((s) => s.classId === cls.id)
  const progress = classProgress(cls.id, students, assignments, attempts)
  const status = classStatus(progress)
  const clsTeachers = teachers.filter((x) => cls.teacherIds.includes(x.id))
  const clsAssignments = assignments.filter((a) => a.classId === cls.id)
  const clsHeadsets = headsets.filter((h) => h.classIds.includes(cls.id))
  const quizScores = list.map((s) => attemptsFor(attempts, s.id, 'finalQuiz').filter((a) => a.status === 'completed').pop()).filter((a) => !!a).map((a) => effectiveScore(a!))
  const ref = { kind: 'class' as const, id: cls.id, label: code, sub: cls.schoolYear }

  const archive = () => {
    classesStore.set((p) => p.map((c) => (c.id === cls.id ? { ...c, archived: !c.archived } : c)))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'classArchived', target: `${cls.name}, ${cls.schoolYear}`, ref, changes: [{ field: 'status', before: { code: cls.archived ? 'archived' : 'active' }, after: { code: cls.archived ? 'active' : 'archived' } }], screen: 'classes' })
    toast(t(cls.archived ? 'detail.classRestored' : 'detail.classArchived', { code }))
    setArchiving(false)
  }

  // Next year: a new class with the same teachers receives the students; this one is archived
  const transfer = () => {
    const year = nextYear(cls.schoolYear)
    const next = { ...cls, id: uid('c'), schoolYear: year, archived: false }
    classesStore.set((p) => [...p.map((c) => (c.id === cls.id ? { ...c, archived: true } : c)), next])
    teachersStore.set((p) => p.map((x) => (cls.teacherIds.includes(x.id) ? { ...x, classIds: [...x.classIds, next.id] } : x)))
    studentsStore.set((p) => p.map((s) => (s.classId === cls.id ? { ...s, classId: next.id, finalQuiz: 'Locked' } : s)))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'classTransferred', target: `${cls.name}: ${cls.schoolYear} → ${year}`, ref, changes: [{ field: 'schoolYear', before: cls.schoolYear, after: year }, { field: 'target', before: { code: 'none' }, after: { code: 'nStudents', n: list.length } }], screen: 'classes' })
    toast(t('detail.classTransferred', { code, year }))
    navigate(`/admin/classes/${next.id}`)
  }

  return (
    <AppShell breadcrumb={[{ label: t('admin.classesTitle'), to: '/admin/classes' }, { label: code }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-ink">{classLabel(cls.name, lang)}</h1>
                {cls.archived ? (
                  <Badge tone="gray">{t('detail.archived')}</Badge>
                ) : (
                  <Badge tone={statusTone(status)} dot>
                    {t(statusKey(status))}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">
                {trackLabel(cls.track, lang)} · {cls.schoolYear} · {t('teacher.headcountStudents', { count: list.length })}
              </p>
              <p className="mt-1 text-sm text-muted">
                {t('admin.teachers')} :{' '}
                {clsTeachers.length
                  ? clsTeachers.map((x, i) => (
                      <span key={x.id}>
                        {i > 0 && ', '}
                        <Link to={`/admin/users/${x.id}`} className={link}>
                          {x.name}
                        </Link>
                      </span>
                    ))
                  : '—'}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={progress} className="w-48" />
                <span className="text-sm font-semibold">{progress} %</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <UsersIcon className="h-4 w-4" />
                {t('detail.assignTeachers')}
              </Button>
              <Button variant="secondary" onClick={() => setTransferring(true)} disabled={cls.archived}>
                <CalendarPlus className="h-4 w-4" />
                {t('detail.transferNextYear')}
              </Button>
              <Button variant={cls.archived ? 'secondary' : 'danger'} onClick={() => setArchiving(true)}>
                <Archive className="h-4 w-4" />
                {cls.archived ? t('detail.restore') : t('detail.archive')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label={t('detail.quizOpened')}>
            {list.filter((s) => s.finalQuiz !== 'Locked').length} / {list.length}
          </Info>
          <Info label={t('detail.quizCompleted')}>
            {list.filter((s) => s.finalQuiz === 'Completed').length} / {list.length}
          </Info>
          <Info label={t('detail.quizAverage')}>{quizScores.length ? `${Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)} %` : '—'}</Info>
          <Info label={t('detail.quizPassRate')}>{quizScores.length ? `${Math.round((quizScores.filter((x) => x >= PASS_THRESHOLD).length / quizScores.length) * 100)} %` : '—'}</Info>
        </div>

        <Section
          title={t('common.students')}
          hint={t('teacher.headcountStudents', { count: list.length })}
          action={
            <Button variant="secondary" onClick={() => setAdding(true)} disabled={cls.archived}>
              <UserPlus className="h-4 w-4" />
              {t('dash.addStudent')}
            </Button>
          }
        >
          {list.length === 0 ? (
            empty(t('detail.noStudent'))
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className={thRow}>
                    <th className="px-6 py-3">{t('common.student')}</th>
                    <th className="px-4 py-3">{t('common.progress')}</th>
                    <th className="px-4 py-3">{t('teacher.finalQuiz')}</th>
                    <th className="px-4 py-3">{t('teacher.lastActivity')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => {
                    const p = studentProgress(s, assignments, attempts)
                    return (
                      <tr key={s.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-3">
                          <Link to={`/admin/users/${s.id}`} className={link}>
                            {s.name}
                          </Link>
                          {s.active === false && <Badge tone="orange" className="ml-2">{t('detail.deactivated')}</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <ProgressBar value={p} className="max-w-[100px]" />
                            <span className="text-xs font-semibold">{p}%</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={s.finalQuiz === 'Completed' ? 'green' : s.finalQuiz === 'Open' ? 'blue' : 'gray'}>{t(s.finalQuiz === 'Completed' ? 'common.completed' : s.finalQuiz === 'Open' ? 'common.open' : 'dash.quizNotOpen')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted">{fmtDate(s.lastActivity, lang)}</td>
                        <td className="px-4 py-2 text-right">
                          <Button variant="ghost" className="py-1.5 text-xs" onClick={() => setMoving(s)}>
                            <ArrowRightLeft className="h-3.5 w-3.5" />
                            {t('detail.move')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title={t('detail.assignedContent')}>
            {clsAssignments.length === 0 ? (
              empty(t('dash.noAssignments'))
            ) : (
              <ul className="divide-y divide-slate-100">
                {clsAssignments.map((a) => {
                  const targeted = a.target === 'class' ? list : list.filter((s) => a.studentIds.includes(s.id))
                  const done = targeted.filter((s) => attempts.some((x) => x.studentId === s.id && x.module === a.module && x.status === 'completed')).length
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
                      <span>
                        <span className="font-semibold text-ink">{loc(moduleNames[a.module])}</span>
                        <span className="block text-xs text-muted">{t('teacher.due', { date: fmtDate(a.dueDate, lang) })}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <ProgressBar value={targeted.length ? (done / targeted.length) * 100 : 0} className="w-24" />
                        <span className="text-xs font-semibold text-muted">{t('dash.completedOf', { done, total: targeted.length })}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>
          <Section title={t('detail.assignedHeadsets')}>
            {clsHeadsets.length === 0 ? (
              empty(t('headsets.noClass'))
            ) : (
              <ul className="divide-y divide-slate-100">
                {clsHeadsets.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                    <span>
                      <Link to={`/admin/headsets/${encodeURIComponent(h.id)}`} className={link}>
                        {h.id}
                      </Link>
                      <span className="block text-xs text-muted">{h.location}</span>
                    </span>
                    <Badge tone={h.online ? 'green' : 'gray'} dot>
                      {!h.paired ? t('headsets.unpaired') : h.online ? t('common.connected') : t('common.offline')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <Section title={t('detail.recentActivity')}>
          <Activity entries={audit.filter((e) => e.ref?.id === cls.id || list.some((s) => s.id === e.ref?.id))} />
        </Section>
      </div>

      {editing && <ClassModal initial={cls} onClose={() => setEditing(false)} />}
      {adding && <UserModal initial={null} presetClassId={cls.id} onClose={() => setAdding(false)} />}
      {moving && <MoveStudent student={moving} onClose={() => setMoving(null)} />}
      {archiving && (
        <Confirm
          title={cls.archived ? t('detail.restoreTitle', { code }) : t('detail.archiveTitle', { code })}
          text={cls.archived ? t('detail.restoreText') : t('detail.archiveText')}
          confirm={cls.archived ? t('detail.restore') : t('detail.archive')}
          onClose={() => setArchiving(false)}
          onConfirm={archive}
        />
      )}
      {transferring && (
        <Confirm
          title={t('detail.transferTitle', { code, year: nextYear(cls.schoolYear) })}
          text={t('detail.transferText', { count: list.length, year: nextYear(cls.schoolYear) })}
          confirm={t('detail.transferNextYear')}
          onClose={() => setTransferring(false)}
          onConfirm={transfer}
        />
      )}
    </AppShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Headset — /admin/headsets/:id                                      */
/* ------------------------------------------------------------------ */

export function HeadsetDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const { user } = useAuth()
  const headsets = headsetsStore.use()
  const classes = classesStore.use()
  const students = studentsStore.use()
  const attempts = attemptsStore.use()
  const [editing, setEditing] = useState(false)
  const [unpairing, setUnpairing] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const h = headsets.find((x) => x.id === id)
  if (!h) return <Navigate to="/admin/headsets" replace />
  const live = liveSessions.find((s) => s.headsetId === h.id)
  const hClasses = classes.filter((c) => h.classIds.includes(c.id))
  // Sessions played on this headset: VR attempts of its classes (demo data)
  const sessions = attempts
    .filter((a) => a.device === 'VR' && students.some((s) => s.id === a.studentId && h.classIds.includes(s.classId)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
  const ref = { kind: 'headset' as const, id: h.id, label: h.id, sub: h.location }

  const unpair = () => {
    headsetsStore.set((p) => p.map((x) => (x.id === h.id ? { ...x, paired: false, online: false, classIds: [], history: [...x.history, { date: new Date().toISOString(), event: { en: 'Unpaired', fr: 'Désappairé' } }] } : x)))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'headsetUnpaired', target: h.id, ref, changes: [{ field: 'pairing', before: { code: 'paired' }, after: { code: 'unpaired' } }], screen: 'headsets' })
    toast(t('detail.headsetUnpaired', { id: h.id }))
    setUnpairing(false)
  }
  const regenerate = () => {
    const code = String(1000 + Math.floor(Math.random() * 9000))
    headsetsStore.set((p) => p.map((x) => (x.id === h.id ? { ...x, signInCode: code, paired: true, history: [...x.history, { date: new Date().toISOString(), event: { en: 'Pairing code regenerated', fr: 'Code d’appairage régénéré' } }] } : x)))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'headsetCodeRegenerated', target: h.id, ref, changes: [{ field: 'pairingCode', before: '••••', after: { code: 'regenerated' } }], screen: 'headsets' })
    toast(t('detail.codeRegenerated', { id: h.id }))
    setRegenerating(false)
  }

  return (
    <AppShell breadcrumb={[{ label: t('admin.headsetsTitle'), to: '/admin/headsets' }, { label: h.id }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white">
                <Headphones className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-ink">{h.id}</h1>
                  <Badge tone={h.online ? 'green' : 'gray'} dot>
                    {!h.paired ? t('headsets.unpaired') : h.online ? t('common.connected') : t('common.offline')}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {h.location} · {t('admin.lastConnected')}: {fmtDateTime(h.lastSeen, lang)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                {t('common.edit')}
              </Button>
              <Button variant="secondary" onClick={() => setRegenerating(true)}>
                <KeyRound className="h-4 w-4" />
                {t('detail.regenerateCode')}
              </Button>
              <Button variant="danger" disabled={!h.paired} onClick={() => setUnpairing(true)}>
                <Link2Off className="h-4 w-4" />
                {t('headsets.unpair')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Info label={t('detail.currentUse')}>
            {h.online && (live || h.currentStudent) ? (
              <span className="flex flex-wrap items-center gap-2">
                {live?.studentName ?? h.currentStudent}
                {live && (
                  <Link to={`/admin/live/${live.studentId}`} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                    <Eye className="h-3.5 w-3.5" />
                    {t('live.watch')}
                  </Link>
                )}
              </span>
            ) : (
              <span className="font-normal text-muted">{t('detail.notInUse')}</span>
            )}
          </Info>
          <Info label={t('headsets.classes')}>
            {hClasses.length
              ? hClasses.map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ', '}
                    <Link to={`/admin/classes/${c.id}`} className={link}>
                      {classCode(c.name)}
                    </Link>
                  </span>
                ))
              : <span className="font-normal text-muted">{t('headsets.noClass')}</span>}
          </Info>
          <Info label={t('detail.pairingCode')}>
            <span className="font-mono tracking-[0.3em]">{h.paired ? h.signInCode : '—'}</span>
          </Info>
          <Info label={t('detail.usage')}>
            {t('detail.sessionsCount', { count: sessions.length })} · {fmtDuration(sessions.reduce((s, a) => s + a.durationSec, 0))}
          </Info>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title={t('detail.sessionHistory')}>
            {sessions.length === 0 ? (
              empty(t('detail.noSession'))
            ) : (
              <ul className="divide-y divide-slate-100">
                {sessions.map((a) => {
                  const s = students.find((x) => x.id === a.studentId)
                  return (
                    <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 text-sm">
                      <span>
                        {s ? (
                          <Link to={`/admin/users/${s.id}`} className={link}>
                            {s.name}
                          </Link>
                        ) : (
                          '—'
                        )}
                        <span className="block text-xs text-muted">
                          {loc(moduleNames[a.module])} · {fmtDuration(a.durationSec)}
                        </span>
                      </span>
                      <span className="text-xs text-muted">{fmtDateTime(a.date, lang)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Section>
          <Section title={t('detail.pairingHistory')}>
            <ul className="divide-y divide-slate-100">
              {[...h.history].reverse().map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                  <span className="font-semibold text-ink">{loc(e.event)}</span>
                  <span className="text-xs text-muted">{fmtDateTime(e.date, lang)}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      {editing && <HeadsetModal headset={h} onClose={() => setEditing(false)} />}
      {unpairing && <Confirm title={t('detail.unpairTitle', { id: h.id })} text={t('detail.unpairText')} confirm={t('headsets.unpair')} onClose={() => setUnpairing(false)} onConfirm={unpair} />}
      {regenerating && <Confirm title={t('detail.regenerateTitle', { id: h.id })} text={t('detail.regenerateText')} confirm={t('detail.regenerateCode')} onClose={() => setRegenerating(false)} onConfirm={regenerate} />}
    </AppShell>
  )
}
