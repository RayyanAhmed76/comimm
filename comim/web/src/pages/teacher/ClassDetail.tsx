import { useEffect, useState } from 'react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowRightLeft, BookOpen, Check, CheckCircle2, ChevronDown, ChevronRight, Download, MoreHorizontal, Pencil, Plus, RotateCcw, Search, Trash2, Unlock, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { InfoTip, Tooltip } from '@/components/ui/InfoTip'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { StudentPicker } from '@/components/ui/StudentPicker'
import { SortTh, inputSm, thRow, useSort } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/store'
import { fmtDate, useLang, useLoc } from '@/lib/i18n'
import { downloadCsv } from '@/lib/csv'
import { classCode, classLabel, trackLabel } from '@/lib/labels'
import { defaultWeights, type Assignment, type Student } from '@/data/mock'
import {
  MIN_SAFETY,
  PASS_THRESHOLD,
  QUIZ_LENGTH,
  moduleNames,
  repairProcedure,
  startupProcedure,
  type ModuleId,
  type Topic,
} from '@/data/content'
import {
  activeBank,
  addSchoolAudit,
  assignmentsStore,
  attemptsFor,
  attemptsStore,
  bankStateStore,
  classesStore,
  classProgress,
  classStatus,
  effectiveScore,
  MIN_ACTIVE,
  quizBankStore,
  quizClasses,
  quizSettingsFor,
  quizSettingsStore,
  rubricStore,
  settingsStore,
  studentProgress,
  studentsStore,
  teachersStore,
  type QuizSettings,
} from '@/data/stores'
import { statusKey, statusTone } from '@/pages/teacher/MyClasses'

type Tab = 'students' | 'assignments' | 'rubric' | 'quiz'
type AssignableModule = Exclude<ModuleId, 'finalQuiz'>
const ASSIGNABLE: AssignableModule[] = ['tour', 'identification', 'startup', 'repair']

export function ClassDetail() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const classes = classesStore.use()
  const students = studentsStore.use()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const teachers = teachersStore.use()
  const cls = classes.find((c) => c.id === id) ?? classes[0]
  const tab = (params.get('tab') as Tab) ?? 'students'
  const classStudents = students.filter((s) => s.classId === cls.id)
  const progress = classProgress(cls.id, students, assignments, attempts)
  const status = classStatus(progress)
  const shortName = cls.name.split(' ')[0]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'students', label: t('teacher.studentsTab') },
    { id: 'assignments', label: t('teacher.assignmentsTab') },
    { id: 'rubric', label: t('teacher.rubricTab') },
    { id: 'quiz', label: t('teacher.finalQuizTab') },
  ]

  return (
    <AppShell breadcrumb={[{ label: t('teacher.myClasses'), to: '/teacher' }, { label: shortName }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{classLabel(cls.name, lang)}</h1>
              <p className="mt-1 text-sm text-muted">
                {trackLabel(cls.track, lang)} · {t('teacher.headcountStudents', { count: classStudents.length })} · {cls.schoolYear} ·{' '}
                {cls.teacherIds.map((tid) => teachers.find((x) => x.id === tid)?.name).filter(Boolean).join(', ')}
              </p>
            </div>
            <Tooltip content={t('kpi.statusRule')} align="right">
              <span tabIndex={0}>
                <Badge tone={statusTone(status)} dot>
                  {t(statusKey(status))}
                </Badge>
              </span>
            </Tooltip>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ProgressBar value={progress} className="max-w-xs flex-1" />
            <Tooltip content={t('kpi.classProgress')}>
              <span tabIndex={0} className="text-sm font-semibold underline decoration-dotted underline-offset-4">
                {progress}%
              </span>
            </Tooltip>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1" role="tablist">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              role="tab"
              aria-selected={tab === tabItem.id}
              onClick={() => setParams({ tab: tabItem.id })}
              className={cn('rounded-xl px-4 py-2 text-sm font-semibold transition', tab === tabItem.id ? 'bg-navy-900 text-white' : 'text-muted hover:bg-slate-100')}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'students' && <StudentsTab classId={cls.id} classStudents={classStudents} author={user?.name ?? ''} />}
        {tab === 'assignments' && <AssignmentsTab classId={cls.id} classStudents={classStudents} author={user?.name ?? ''} />}
        {tab === 'rubric' && <RubricTab />}
        {tab === 'quiz' && <QuizTab classId={cls.id} classStudents={classStudents} author={user?.name ?? ''} onShowStudents={() => setParams({ tab: 'students' })} />}
      </div>
    </AppShell>
  )
}

function quizTone(s: Student['finalQuiz']) {
  return s === 'Completed' ? 'green' : s === 'Locked' ? 'gray' : 'blue'
}
/** Teacher wording: a quiz that was never opened is "Not opened" (not "Locked"). */
function quizLabel(s: Student['finalQuiz']) {
  return s === 'Completed' ? 'common.completed' : s === 'Locked' ? 'dash.quizNotOpen' : 'common.open'
}

/** Row menu rendered in a fixed layer so that the scrolling table never clips it. */
function RowMenu({ label, items }: { label: string; items: { label: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }[] }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  useEffect(() => {
    if (!pos) return
    const close = () => setPos(null)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [pos])
  return (
    <>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={!!pos}
        aria-label={label}
        title={label}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setPos(pos ? null : { top: r.bottom + 6, right: window.innerWidth - r.right })
        }}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {pos && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close" onClick={() => setPos(null)} />
          <div role="menu" style={{ top: pos.top, right: pos.right }} className="fixed z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-xl">
            {items.map((it) => {
              const Icon = it.icon
              return (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setPos(null)
                    it.onClick()
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-medium text-ink hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  {it.label}
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

function StudentsTab({ classId, classStudents, author }: { classId: string; classStudents: Student[]; author: string }) {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const classes = classesStore.use()
  const settings = settingsStore.use()
  const [query, setQuery] = useState('')
  const [quiz, setQuiz] = useState<'all' | Student['finalQuiz']>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const [moving, setMoving] = useState<Student | null>(null)

  const cls = classes.find((c) => c.id === classId)
  const code = classCode(cls?.name ?? classId)
  const otherClasses = quizClasses(classes).filter((c) => c.id !== classId && c.teacherIds.includes(user?.id ?? ''))

  const rows = classStudents.map((s) => {
    const quizAttempts = attemptsFor(attempts, s.id, 'finalQuiz')
    const last = quizAttempts.filter((a) => a.status === 'completed').pop()
    return { ...s, progress: studentProgress(s, assignments, attempts), quizScore: last ? effectiveScore(last) : -1, quizAttempts: quizAttempts.length }
  })
  const q = query.trim().toLowerCase()
  const filtered = rows.filter((r) => (quiz === 'all' || r.finalQuiz === quiz) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)))
  const sort = useSort(filtered, 'name' as 'name' | 'lastActivity' | 'progress' | 'finalQuiz' | 'quizScore' | 'quizAttempts', (r, k) => (k === 'progress' || k === 'quizScore' || k === 'quizAttempts' ? r[k] : String(r[k])))
  const allOn = filtered.length > 0 && filtered.every((r) => selected.includes(r.id))
  const openable = rows.filter((r) => selected.includes(r.id) && r.finalQuiz === 'Locked')

  const audit = (action: 'finalQuizOpened' | 'quizRetryAllowed', s: Student, before: string) =>
    addSchoolAudit({ author, profile: 'teacher', action, target: `Class ${code} · ${s.name}`, ref: { kind: 'student', id: s.id, label: s.name, sub: code }, changes: [{ field: 'quizStatus', before: { code: before }, after: { code: 'quizOpen' } }], screen: 'classDetail' })

  const openQuiz = (list: Student[]) => {
    const ids = list.filter((s) => s.finalQuiz === 'Locked').map((s) => s.id)
    if (!ids.length) return
    studentsStore.set((p) => p.map((s) => (ids.includes(s.id) ? { ...s, finalQuiz: 'Open' } : s)))
    list.filter((s) => ids.includes(s.id)).forEach((s) => audit('finalQuizOpened', s, 'quizNotOpen'))
    toast(t('dash.quizOpenedFor', { count: ids.length }))
    setSelected([])
  }
  const allowRetry = (s: Student) => {
    studentsStore.set((p) => p.map((x) => (x.id === s.id ? { ...x, finalQuiz: 'Open' } : x)))
    audit('quizRetryAllowed', s, 'quizCompleted')
    toast(t('dash.retryAllowedFor', { name: s.name }))
  }

  const exportCsv = () =>
    downloadCsv(`class-${code}-students.csv`, [
      [t('common.student'), t('admin.email'), t('teacher.lastActivity'), t('common.progress'), t('teacher.finalQuiz'), t('dash.quizScore'), t('dash.quizAttempts')],
      ...sort.sorted.map((r) => [r.name, r.email, fmtDate(r.lastActivity, lang), `${r.progress} %`, t(quizLabel(r.finalQuiz)), r.quizScore >= 0 ? `${r.quizScore} %` : '', r.quizAttempts]),
    ])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
          {t('common.search')}
          <span className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('teacher.searchStudent')} className={cn(inputSm, 'w-full pl-9')} />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
          {t('teacher.finalQuiz')}
          <select value={quiz} onChange={(e) => setQuiz(e.target.value as 'all' | Student['finalQuiz'])} className={inputSm}>
            <option value="all">{t('dash.allQuizStatuses')}</option>
            <option value="Locked">{t('dash.quizNotOpen')}</option>
            <option value="Open">{t('common.open')}</option>
            <option value="Completed">{t('common.completed')}</option>
          </select>
        </label>
        <Button variant="secondary" className="h-10 py-0" disabled={openable.length === 0} onClick={() => openQuiz(openable)}>
          <Unlock className="h-4 w-4" />
          {t('dash.openQuizBulk', { count: openable.length })}
        </Button>
        <Button variant="secondary" className="h-10 py-0" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          {t('audit.exportCsv')}
        </Button>
        {/* Only when the school has delegated account creation to teachers */}
        {settings.delegation && (
          <Button className="h-10 py-0" onClick={() => setAdding(true)}>
            <UserPlus className="h-4 w-4" />
            {t('dash.addStudent')}
          </Button>
        )}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className={thRow}>
                <th className="py-3 pr-1 pl-5">
                  <input type="checkbox" checked={allOn} onChange={() => setSelected(allOn ? [] : filtered.map((r) => r.id))} aria-label={t('dash.selectAll')} />
                </th>
                <SortTh label={t('common.student')} k="name" sort={sort} />
                <SortTh label={t('teacher.lastActivity')} k="lastActivity" sort={sort} />
                <SortTh label={t('common.progress')} k="progress" sort={sort} info={t('kpi.progressRule')} />
                <SortTh label={t('teacher.finalQuiz')} k="finalQuiz" sort={sort} info={t('kpi.finalQuizStatus')} />
                <SortTh label={t('dash.quizScore')} k="quizScore" sort={sort} />
                <SortTh label={t('dash.quizAttempts')} k="quizAttempts" sort={sort} />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sort.sorted.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3.5 pr-1 pl-5">
                    <input type="checkbox" checked={selected.includes(student.id)} onChange={() => setSelected((p) => (p.includes(student.id) ? p.filter((x) => x !== student.id) : [...p, student.id]))} aria-label={student.name} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link to={`/teacher/students/${student.id}`} className="flex items-center gap-3 font-semibold text-ink hover:text-brand-600">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{student.initials}</span>
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{fmtDate(student.lastActivity, lang)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={student.progress} className="max-w-[90px]" />
                      <span className="text-xs font-semibold">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge tone={quizTone(student.finalQuiz)}>{t(quizLabel(student.finalQuiz))}</Badge>
                  </td>
                  <td className="px-4 py-3.5">
                    {student.quizScore >= 0 ? (
                      <span className="font-semibold text-ink">
                        {student.quizScore} % · <span className={student.quizScore >= PASS_THRESHOLD ? 'text-success-600' : 'text-warning-600'}>{student.quizScore >= PASS_THRESHOLD ? t('common.passed') : t('common.needsReview')}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">{student.quizAttempts}</td>
                  <td className="px-2 py-2 text-right">
                    <RowMenu
                      label={t('dash.rowActions', { name: student.name })}
                      items={[
                        ...(student.finalQuiz === 'Locked' ? [{ label: t('dash.openQuiz'), icon: Unlock, onClick: () => openQuiz([student]) }] : []),
                        ...(student.finalQuiz === 'Completed' ? [{ label: t('dash.allowRetry'), icon: RotateCcw, onClick: () => allowRetry(student) }] : []),
                        { label: t('dash.changeClass'), icon: ArrowRightLeft, onClick: () => setMoving(student) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {sort.sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted">
                    {t('dash.noMatch')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-2.5 text-xs text-muted">{t('dash.studentsShown', { count: sort.sorted.length, total: classStudents.length })}</div>
      </Card>

      {adding && <AddStudentModal classId={classId} code={code} author={author} onClose={() => setAdding(false)} />}
      {moving && <MoveStudentModal student={moving} from={code} options={otherClasses} author={author} onClose={() => setMoving(null)} />}
    </div>
  )
}

function AddStudentModal({ classId, code, author, onClose }: { classId: string; code: string; author: string; onClose: () => void }) {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const valid = firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email)

  const save = () => {
    const f = firstName.trim()
    const l = lastName.trim()
    const s: Student = { id: uid('s'), firstName: f, lastName: l, name: `${f} ${l}`, initials: `${f[0]}${l[0]}`.toUpperCase(), email: email.trim(), classId, finalQuiz: 'Locked', lastActivity: new Date().toISOString() }
    studentsStore.set((p) => [...p, s])
    addSchoolAudit({ author, profile: 'teacher', action: 'userCreation', target: `Student · ${f[0]}. ${l} (${code})`, ref: { kind: 'student', id: s.id, label: s.name, sub: { code: 'student' } }, changes: [{ field: 'class', before: { code: 'none' }, after: code }], screen: 'classDetail' })
    toast(t('dash.studentAdded', { name: s.name, code }))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={t('dash.addStudent')}
      subtitle={t('dash.addStudentHint', { code })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!valid} onClick={save}>
            {t('common.add')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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
      </div>
    </Modal>
  )
}

function MoveStudentModal({ student, from, options, author, onClose }: { student: Student; from: string; options: { id: string; name: string }[]; author: string; onClose: () => void }) {
  const { t } = useTranslation()
  const lang = useLang()
  const [to, setTo] = useState(options[0]?.id ?? '')
  const target = options.find((c) => c.id === to)

  const save = () => {
    if (!target) return
    const code = classCode(target.name)
    studentsStore.set((p) => p.map((s) => (s.id === student.id ? { ...s, classId: target.id } : s)))
    addSchoolAudit({ author, profile: 'teacher', action: 'classChange', target: `${student.name}: ${from} → ${code}`, ref: { kind: 'student', id: student.id, label: student.name, sub: { code: 'student' } }, changes: [{ field: 'class', before: from, after: code }], screen: 'classDetail' })
    toast(t('dash.classChanged', { name: student.name, code }))
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
      {options.length === 0 ? (
        <p className="text-sm text-muted">{t('dash.noOtherClass')}</p>
      ) : (
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
      )}
    </Modal>
  )
}

function AssignmentsTab({ classId, classStudents, author }: { classId: string; classStudents: Student[]; author: string }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const list = assignments.filter((a) => a.classId === classId)
  const [editing, setEditing] = useState<Assignment | 'new' | null>(null)

  const targeted = (a: Assignment) => (a.target === 'class' ? classStudents : classStudents.filter((s) => a.studentIds.includes(s.id)))
  const doneCount = (a: Assignment) => targeted(a).filter((s) => attempts.some((x) => x.studentId === s.id && x.module === a.module && x.status === 'completed')).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{t('dash.assignmentsHint')}</p>
        <Button onClick={() => setEditing('new')}>
          <Plus className="h-4 w-4" />
          {t('teacher.newAssignment')}
        </Button>
      </div>
      <Card className="divide-y divide-slate-100">
        {list.length === 0 && <p className="px-6 py-8 text-center text-sm text-muted">{t('dash.noAssignments')}</p>}
        {list.map((a) => {
          const tg = targeted(a)
          return (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
              <div>
                <div className="font-semibold text-ink">{loc(moduleNames[a.module])}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <Tooltip content={tg.map((s) => s.name).join(', ')}>
                    <Badge tone={a.target === 'class' ? 'gray' : 'blue'}>
                      {a.target === 'class' ? t('dash.wholeClassN', { count: tg.length }) : t('dash.selectedN', { count: tg.length })}
                    </Badge>
                  </Tooltip>
                  <span>{t('teacher.due', { date: fmtDate(a.dueDate, lang) })}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">{t('dash.completedOf', { done: doneCount(a), total: tg.length })}</span>
                <Button variant="secondary" onClick={() => setEditing(a)}>
                  <Pencil className="h-4 w-4" />
                  {t('common.edit')}
                </Button>
              </div>
            </div>
          )
        })}
      </Card>
      {editing && (
        <AssignmentModal
          key={editing === 'new' ? 'new' : editing.id}
          classId={classId}
          classStudents={classStudents}
          initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onEditExisting={(a) => setEditing(a)}
          author={author}
        />
      )}
    </div>
  )
}

function AssignmentModal({
  classId,
  classStudents,
  initial,
  onClose,
  onEditExisting,
  author,
}: {
  classId: string
  classStudents: Student[]
  initial: Assignment | null
  onClose: () => void
  onEditExisting: (a: Assignment) => void
  author: string
}) {
  const { t } = useTranslation()
  const loc = useLoc()
  const assignments = assignmentsStore.use()
  const [module, setModule] = useState<AssignableModule>(initial?.module ?? 'tour')
  const [target, setTarget] = useState<'class' | 'students'>(initial?.target ?? 'class')
  const [ids, setIds] = useState<string[]>(initial?.studentIds ?? [])
  const [due, setDue] = useState(initial?.dueDate ?? '')
  const [conflict, setConflict] = useState<Assignment | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const targetIds = target === 'class' ? classStudents.map((s) => s.id) : ids
  const valid = !!due && targetIds.length > 0

  const save = () => {
    // Block duplicates: same module with an overlapping target
    const dup = assignments.find(
      (a) =>
        a.classId === classId &&
        a.id !== initial?.id &&
        a.module === module &&
        (a.target === 'class' || target === 'class' || a.studentIds.some((x) => ids.includes(x))),
    )
    if (dup) {
      setConflict(dup)
      return
    }
    const next: Assignment = { id: initial?.id ?? uid('as'), classId, module, target, studentIds: target === 'class' ? [] : ids, dueDate: due }
    assignmentsStore.set((p) => (initial ? p.map((a) => (a.id === initial.id ? next : a)) : [...p, next]))
    addSchoolAudit({
      author,
      profile: 'teacher',
      action: initial ? 'assignmentUpdated' : 'assignmentCreated',
      target: `${classId.toUpperCase()} · ${moduleNames[module].en} · ${targetIds.length} students`,
      ref: { kind: 'class', id: classId, label: classId.toUpperCase().split('-')[0], sub: moduleNames[module] },
      changes: [
        { field: 'target', before: initial ? { code: 'nStudents', n: initial.target === 'class' ? classStudents.length : initial.studentIds.length } : { code: 'none' }, after: { code: 'nStudents', n: targetIds.length } },
        { field: 'dueDate', before: initial ? { date: initial.dueDate } : { code: 'none' }, after: { date: due } },
      ],
      screen: 'classDetail',
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t('teacher.editAssignment') : t('teacher.newAssignment')}
      subtitle={t('teacher.newAssignmentHint')}
      footer={
        <>
          {initial &&
            (confirmDelete ? (
              <Button
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  assignmentsStore.set((p) => p.filter((a) => a.id !== initial.id))
                  onClose()
                }}
              >
                {t('dash.confirmUnassign')}
              </Button>
            ) : (
              <Button variant="ghost" className="mr-auto text-warning-600" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
                {t('teacher.unassign')}
              </Button>
            ))}
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!valid} onClick={save}>
            {initial ? t('common.saveChanges') : t('teacher.addAssignment')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {conflict && (
          <div role="alert" className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{t('dash.duplicateAssignment', { module: loc(moduleNames[conflict.module]) })}</span>
            </div>
            <Button variant="secondary" className="mt-2 py-1.5 text-xs" onClick={() => onEditExisting(conflict)}>
              {t('dash.editExisting')}
            </Button>
          </div>
        )}
        <Field label={t('teacher.content')}>
          <select
            value={module}
            onChange={(e) => {
              setModule(e.target.value as AssignableModule)
              setConflict(null)
            }}
            className={fieldClass}
          >
            {ASSIGNABLE.map((m) => (
              <option key={m} value={m}>
                {loc(moduleNames[m])}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-muted">{t('dash.finalQuizNotHere')}</span>
        </Field>
        <fieldset>
          <legend className="text-sm font-medium text-muted">{t('teacher.target')}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['class', 'students'] as const).map((v) => (
              <label key={v} className={cn('flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm', target === v ? 'border-brand-500 bg-sky-50 font-semibold' : 'border-slate-200')}>
                <input
                  type="radio"
                  name="target"
                  checked={target === v}
                  onChange={() => {
                    setTarget(v)
                    setConflict(null)
                  }}
                />
                {v === 'class' ? t('dash.wholeClassN', { count: classStudents.length }) : t('teacher.selectedStudents')}
              </label>
            ))}
          </div>
          {target === 'students' && (
            <div className="mt-3">
              <StudentPicker students={classStudents} value={ids} onChange={(v) => { setIds(v); setConflict(null) }} />
            </div>
          )}
        </fieldset>
        <Field label={t('teacher.dueDate')}>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={fieldClass} required />
        </Field>
      </div>
    </Modal>
  )
}

function RubricTab() {
  const { t } = useTranslation()
  const loc = useLoc()
  const rubric = rubricStore.use()

  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 p-5 text-sm text-muted">
        <InfoTip text={t('dash.identificationFixed')} />
        <span>{t('dash.identificationFixed')}</span>
      </Card>
      <RubricCard title={t('dash.rubricStartup')} steps={startupProcedure.map((s) => loc(s.label))} saved={rubric.startup} onSave={(w) => rubricStore.set((r) => ({ ...r, startup: w }))} />
      <RubricCard title={t('dash.rubricRepair')} steps={repairProcedure.map((s) => loc(s.label))} saved={rubric.repair} onSave={(w) => rubricStore.set((r) => ({ ...r, repair: w }))} />
    </div>
  )
}

function RubricCard({ title, steps, saved, onSave }: { title: string; steps: string[]; saved: number[]; onSave: (w: number[]) => void }) {
  const { t } = useTranslation()
  const [weights, setWeights] = useState(saved)
  const [flash, setFlash] = useState(false)
  const total = weights.reduce((s, w) => s + (Number.isFinite(w) ? w : 0), 0)
  const dirty = weights.some((w, i) => w !== saved[i])

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{title}</h3>
          <p className="text-sm text-muted">{t('teacher.weightSteps', { count: steps.length })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-sm font-semibold', total === 100 ? 'text-success-600' : 'text-warning-600')}>
            {t('teacher.total')}: {total}%
          </span>
          {total !== 100 && <Badge tone="orange">{t('teacher.weightsMustTotal')}</Badge>}
          <Button variant="secondary" onClick={() => setWeights(defaultWeights(steps.length))}>
            <RotateCcw className="h-4 w-4" />
            {t('dash.resetDefault')}
          </Button>
          <Button
            disabled={total !== 100 || !dirty}
            onClick={() => {
              onSave(weights)
              setFlash(true)
              window.setTimeout(() => setFlash(false), 2000)
            }}
          >
            <Check className="h-4 w-4" />
            {t('common.save')}
          </Button>
          {flash && <span className="text-sm font-semibold text-success-600">{t('platform.saved')}</span>}
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {steps.map((step, i) => (
          <label key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-2.5">
            <span className="flex-1 text-sm font-medium text-ink">
              {i + 1}. {step}
            </span>
            <input
              type="number"
              min={0}
              max={100}
              value={weights[i]}
              onChange={(e) => {
                const next = [...weights]
                next[i] = Number(e.target.value)
                setWeights(next)
              }}
              className="w-20 rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
              aria-label={step}
            />
            <span className="text-sm text-muted">%</span>
          </label>
        ))}
      </div>
    </Card>
  )
}

const TOPICS: Topic[] = ['Safety', 'Procedure', 'Components']

/**
 * Final Quiz tab — single column: "Quiz settings" first (one row + open button), then a
 * summary of the class question bank (the full list lives on the Question bank page).
 */
function QuizTab({ classId, classStudents, author, onShowStudents }: { classId: string; classStudents: Student[]; author: string; onShowStudents: () => void }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const { user } = useAuth()
  const fullBank = quizBankStore.use()
  const bankState = bankStateStore.use()
  const classes = classesStore.use()
  const all = quizSettingsStore.use()
  // Only the questions ACTIVE for this class can be drawn
  const bank = activeBank(fullBank, bankState, classId)
  const [s, setS] = useState<QuizSettings>(quizSettingsFor(all, classId))
  const [opened, setOpened] = useState<number | null>(null)
  const [showQuestions, setShowQuestions] = useState(false)
  const code = classCode(classes.find((c) => c.id === classId)?.name ?? classId)
  const counts = TOPICS.map((tp) => ({ tp, n: bank.filter((q) => q.topic === tp).length }))
  const safetyInBank = counts[0].n
  const fixedIds = s.fixedIds.filter((id) => bank.some((q) => q.id === id))
  const fixedSafety = fixedIds.filter((id) => bank.find((q) => q.id === id)?.topic === 'Safety').length
  const needsStudents = s.scope !== 'class'
  const pickable = s.scope === 'retry' ? classStudents.filter((st) => st.finalQuiz === 'Completed') : classStudents
  const listOpen = showQuestions || s.mode === 'fixed'

  // The Safety minimum is NOT blocking: only the number of questions is
  const valid = (s.mode === 'random' ? bank.length >= QUIZ_LENGTH : fixedIds.length === QUIZ_LENGTH) && (!needsStudents || s.studentIds.length > 0)
  const lowSafety = s.mode === 'random' ? safetyInBank < MIN_SAFETY : fixedSafety < MIN_SAFETY

  const save = () => {
    quizSettingsStore.set((p) => ({ ...p, [classId]: { ...s, fixedIds } }))
    // Applying the settings opens the quiz for the targeted students
    const target = s.scope === 'class' ? classStudents.map((x) => x.id) : s.studentIds
    studentsStore.set((p) => p.map((st) => (target.includes(st.id) && (st.finalQuiz === 'Locked' || s.scope === 'retry') ? { ...st, finalQuiz: 'Open' } : st)))
    addSchoolAudit({
      author,
      profile: 'teacher',
      action: s.scope === 'retry' ? 'quizRetryAllowed' : 'finalQuizOpened',
      target: `Class ${code} · ${s.scope === 'class' ? 'whole class' : `${target.length} student(s)`}`,
      ref: { kind: 'class', id: classId, label: code, sub: s.scope === 'class' ? { code: 'wholeClass' } : { code: 'nStudents', n: target.length } },
      changes: [{ field: 'quizStatus', before: { code: s.scope === 'retry' ? 'quizCompleted' : 'quizNotOpen' }, after: { code: 'quizOpen' } }],
      screen: 'classDetail',
    })
    setOpened(target.length)
  }

  const set = (patch: Partial<QuizSettings>) => {
    setS((p) => ({ ...p, ...patch }))
    setOpened(null)
  }

  return (
    <div className="space-y-5">
      {opened != null && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-green-200 bg-success-50 px-5 py-3.5 text-sm font-semibold text-success-600">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {t('dash.quizOpenedFor', { count: opened })}
          </span>
          <button type="button" onClick={onShowStudents} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-brand-600 hover:underline">
            {t('dash.seeStudentsTab')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-bold text-ink">{t('dash.quizSettings')}</h3>
        <p className="mt-0.5 text-sm text-muted">{t('dash.quizSettingsHint')}</p>

        <div className="mt-5 grid items-end gap-4 md:grid-cols-2 xl:grid-cols-[1.1fr_1.5fr_0.7fr_1fr]">
          <Field label={t('teacher.scope')}>
            <select value={s.scope} onChange={(e) => set({ scope: e.target.value as QuizSettings['scope'], studentIds: [] })} className={fieldClass}>
              <option value="class">{t('dash.wholeClassN', { count: classStudents.length })}</option>
              <option value="students">{t('teacher.selectedStudents')}</option>
              <option value="retry">{t('teacher.individualRetry')}</option>
            </select>
          </Field>
          <Field label={t('dash.drawMode')}>
            <select value={s.mode} onChange={(e) => set({ mode: e.target.value as QuizSettings['mode'] })} className={fieldClass}>
              <option value="random">{t('dash.modeRandom', { count: QUIZ_LENGTH, min: MIN_SAFETY })}</option>
              <option value="fixed">{t('dash.modeFixed', { count: QUIZ_LENGTH })}</option>
            </select>
          </Field>
          <Field label={t('dash.timeLimitMin')}>
            <input type="number" min={5} max={120} value={s.timeLimit} onChange={(e) => set({ timeLimit: Number(e.target.value) })} className={fieldClass} />
          </Field>
          <div>
            <div className="text-sm font-medium text-muted">{t('teacher.allowSkipQuestions')}</div>
            <button
              type="button"
              role="switch"
              aria-checked={s.allowSkip}
              onClick={() => set({ allowSkip: !s.allowSkip })}
              className={cn('mt-1.5 flex h-[42px] w-full items-center gap-3 rounded-xl border px-3 text-sm font-semibold', s.allowSkip ? 'border-green-200 bg-success-50 text-success-600' : 'border-slate-200 bg-white text-slate-600')}
            >
              <span className={cn('relative h-5 w-9 shrink-0 rounded-full transition', s.allowSkip ? 'bg-success-600' : 'bg-slate-300')}>
                <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', s.allowSkip ? 'left-[18px]' : 'left-0.5')} />
              </span>
              {s.allowSkip ? t('admin.enabled') : t('admin.disabled')}
            </button>
          </div>
        </div>

        {needsStudents && (
          <div className="mt-5">
            <div className="mb-1.5 text-sm font-medium text-muted">{s.scope === 'retry' ? t('dash.retryPick') : t('dash.studentsPick')}</div>
            <StudentPicker students={pickable} value={s.studentIds} onChange={(v) => set({ studentIds: v })} />
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <Button disabled={!valid} onClick={save}>
            <Unlock className="h-4 w-4" />
            {t('dash.saveAndOpen')}
          </Button>
          {!valid && (
            <span className="text-sm text-warning-600">
              {needsStudents && s.studentIds.length === 0 ? t('dash.pickStudentsFirst') : s.mode === 'fixed' ? t('dash.fixedPicked', { count: fixedIds.length, total: QUIZ_LENGTH }) : t('dash.notEnoughActive', { min: QUIZ_LENGTH })}
            </span>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <h3 className="font-bold text-ink">{t('teacher.questionBank')}</h3>
            <p className="text-xs text-muted">{t('dash.bankForClass', { code })}</p>
          </div>
          <Link to={user?.role === 'admin' ? '/admin/questions' : '/teacher/question-bank'} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
            <BookOpen className="h-4 w-4" />
            {t('dash.manageBank')}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 px-6 pb-3">
          <Badge tone={bank.length >= MIN_ACTIVE ? 'green' : 'orange'}>{t('bank.activeCounter', { active: bank.length, total: fullBank.length, min: MIN_ACTIVE })}</Badge>
          {counts.map(({ tp, n }) => (
            <Badge key={tp} tone={tp === 'Safety' ? 'orange' : 'blue'}>
              {t(`quiz.topic.${tp}`)}: {n}
            </Badge>
          ))}
          {s.mode === 'fixed' && <Badge tone={fixedIds.length === QUIZ_LENGTH ? 'green' : 'gray'}>{t('dash.fixedPicked', { count: fixedIds.length, total: QUIZ_LENGTH })}</Badge>}
        </div>
        {lowSafety && (
          <p className="mx-6 mb-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {t('bank.safetyNonBlocking', { min: MIN_SAFETY })}
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowQuestions((v) => !v)}
          aria-expanded={listOpen}
          disabled={s.mode === 'fixed'}
          className="flex w-full items-center justify-between gap-2 border-t border-slate-200 px-6 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-slate-50 disabled:text-ink disabled:hover:bg-white"
        >
          {s.mode === 'fixed' ? t('dash.pickFixed', { count: QUIZ_LENGTH }) : t('dash.seeQuestions', { count: bank.length })}
          {s.mode !== 'fixed' && <ChevronDown className={cn('h-4 w-4 transition-transform', listOpen && 'rotate-180')} />}
        </button>
        {listOpen && (
          <ul className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto border-t border-slate-100">
            {bank.map((q) => {
              const on = fixedIds.includes(q.id)
              return (
                <li key={q.id} className="flex items-start gap-3 px-6 py-3">
                  {s.mode === 'fixed' && (
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={on}
                      disabled={!on && fixedIds.length >= QUIZ_LENGTH}
                      onChange={() => set({ fixedIds: on ? fixedIds.filter((x) => x !== q.id) : [...fixedIds, q.id] })}
                      aria-label={loc(q.q)}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap gap-1.5">
                      <Badge tone={q.topic === 'Safety' ? 'orange' : 'blue'}>{t(`quiz.topic.${q.topic}`)}</Badge>
                      <Badge tone="gray">{q.source === 'COMIM' ? t('bank.default') : `${t('bank.school')}${q.authorName ? ` · ${q.authorName}` : ''}`}</Badge>
                      {q.multi && <Badge tone="gray">{t('dash.multiAnswer')}</Badge>}
                    </div>
                    <p className="text-sm text-ink">{loc(q.q)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
