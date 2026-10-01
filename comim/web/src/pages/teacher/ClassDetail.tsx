import { useState } from 'react'
import { Link, useSearchParams, useParams } from 'react-router-dom'
import { AlertTriangle, Check, ChevronRight, Pencil, Plus, RotateCcw, Trash2, Unlock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { InfoTip, Tooltip } from '@/components/ui/InfoTip'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { StudentPicker } from '@/components/ui/StudentPicker'
import { SortTh, thRow, useSort } from '@/components/ui/Table'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/store'
import { fmtDate, useLang, useLoc } from '@/lib/i18n'
import { defaultWeights, type Assignment, type Student } from '@/data/mock'
import {
  MIN_SAFETY,
  QUIZ_LENGTH,
  moduleNames,
  repairProcedure,
  startupProcedure,
  type ModuleId,
  type Topic,
} from '@/data/content'
import {
  addSchoolAudit,
  assignmentsStore,
  attemptsStore,
  classesStore,
  classProgress,
  classStatus,
  quizBankStore,
  quizSettingsFor,
  quizSettingsStore,
  rubricStore,
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
              <h1 className="text-2xl font-bold text-ink">{cls.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {cls.track} · {t('teacher.headcountStudents', { count: classStudents.length })} · {cls.schoolYear} ·{' '}
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

        {tab === 'students' && <StudentsTab classStudents={classStudents} />}
        {tab === 'assignments' && <AssignmentsTab classId={cls.id} classStudents={classStudents} author={user?.name ?? ''} />}
        {tab === 'rubric' && <RubricTab />}
        {tab === 'quiz' && <QuizTab classId={cls.id} classStudents={classStudents} author={user?.name ?? ''} />}
      </div>
    </AppShell>
  )
}

function quizTone(s: Student['finalQuiz']) {
  return s === 'Completed' ? 'green' : s === 'Locked' ? 'gray' : 'blue'
}
function quizLabel(s: Student['finalQuiz']) {
  return s === 'Completed' ? 'common.completed' : s === 'Locked' ? 'common.locked' : 'common.open'
}

function StudentsTab({ classStudents }: { classStudents: Student[] }) {
  const { t } = useTranslation()
  const lang = useLang()
  const assignments = assignmentsStore.use()
  const attempts = attemptsStore.use()
  const rows = classStudents.map((s) => ({ ...s, progress: studentProgress(s, assignments, attempts) }))
  const sort = useSort(rows, 'name' as 'name' | 'lastActivity' | 'progress' | 'finalQuiz', (r, k) => (k === 'progress' ? r.progress : String(r[k])))

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className={thRow}>
              <SortTh label={t('common.student')} k="name" sort={sort} className="px-6" />
              <SortTh label={t('teacher.lastActivity')} k="lastActivity" sort={sort} />
              <SortTh label={t('common.progress')} k="progress" sort={sort} info={t('kpi.progressRule')} />
              <SortTh label={t('teacher.finalQuiz')} k="finalQuiz" sort={sort} info={t('kpi.finalQuizStatus')} />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sort.sorted.map((student) => (
              <tr key={student.id} className="border-b border-slate-100">
                <td className="px-6 py-4">
                  <Link to={`/teacher/students/${student.id}`} className="flex items-center gap-3 font-semibold text-ink hover:text-brand-600">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{student.initials}</span>
                    {student.name}
                  </Link>
                </td>
                <td className="px-4 py-4 text-muted">{fmtDate(student.lastActivity, lang)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={student.progress} className="max-w-[100px]" />
                    <span className="text-xs font-semibold">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={quizTone(student.finalQuiz)}>{t(quizLabel(student.finalQuiz))}</Badge>
                </td>
                <td className="px-4 py-4">
                  <Link to={`/teacher/students/${student.id}`} aria-label={student.name}>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
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
    addSchoolAudit({ author, profile: 'teacher', action: initial ? 'assignmentUpdated' : 'assignmentCreated', target: `${classId.toUpperCase()} · ${moduleNames[module].en} · ${targetIds.length} students`, screen: 'classDetail' })
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

function QuizTab({ classId, classStudents, author }: { classId: string; classStudents: Student[]; author: string }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const bank = quizBankStore.use()
  const all = quizSettingsStore.use()
  const [s, setS] = useState<QuizSettings>(quizSettingsFor(all, classId))
  const [saved, setSaved] = useState(false)
  const counts = TOPICS.map((tp) => ({ tp, n: bank.filter((q) => q.topic === tp).length }))
  const safetyInBank = counts[0].n
  const fixedSafety = s.fixedIds.filter((id) => bank.find((q) => q.id === id)?.topic === 'Safety').length
  const needsStudents = s.scope !== 'class'
  const pickable = s.scope === 'retry' ? classStudents.filter((st) => st.finalQuiz === 'Completed') : classStudents

  const valid =
    (s.mode === 'random' ? bank.length >= QUIZ_LENGTH && safetyInBank >= MIN_SAFETY : s.fixedIds.length === QUIZ_LENGTH && fixedSafety >= MIN_SAFETY) &&
    (!needsStudents || s.studentIds.length > 0)

  const save = () => {
    quizSettingsStore.set((p) => ({ ...p, [classId]: s }))
    // Applying the rule opens the quiz for the targeted students
    const target = s.scope === 'class' ? classStudents.map((x) => x.id) : s.studentIds
    studentsStore.set((p) =>
      p.map((st) => (target.includes(st.id) && (st.finalQuiz === 'Locked' || s.scope === 'retry') ? { ...st, finalQuiz: 'Open' } : st)),
    )
    addSchoolAudit({ author, profile: 'teacher', action: 'finalQuizOpened', target: `Class ${classId.toUpperCase()} · ${s.scope === 'class' ? 'whole class' : `${target.length} student(s)`}`, screen: 'classDetail' })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="font-bold text-ink">{t('teacher.questionBank')}</h3>
            <p className="text-xs text-muted">{t('dash.bankSingleSource', { count: bank.length })}</p>
          </div>
          <Link to="/teacher/question-bank" className="text-sm font-semibold text-brand-600 hover:underline">
            {t('dash.manageBank')} →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-3">
          {counts.map(({ tp, n }) => (
            <Badge key={tp} tone={tp === 'Safety' ? 'orange' : 'blue'}>
              {t(`quiz.topic.${tp}`)}: {n}
            </Badge>
          ))}
          {s.mode === 'fixed' && (
            <Badge tone={s.fixedIds.length === QUIZ_LENGTH ? 'green' : 'gray'}>
              {t('dash.fixedPicked', { count: s.fixedIds.length, total: QUIZ_LENGTH })}
            </Badge>
          )}
        </div>
        {(s.mode === 'random' ? safetyInBank < MIN_SAFETY : fixedSafety < MIN_SAFETY) && (
          <p className="mx-6 mb-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            {t('dash.safetyWarning', { min: MIN_SAFETY })}
          </p>
        )}
        {s.mode === 'random' && (bank.length < 30 || bank.length > 40) && (
          <p className="mx-6 mb-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800">{t('dash.randomBankSize')}</p>
        )}
        <ul className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto">
          {bank.map((q) => {
            const on = s.fixedIds.includes(q.id)
            return (
              <li key={q.id} className="flex items-start gap-3 px-6 py-3">
                {s.mode === 'fixed' && (
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={on}
                    disabled={!on && s.fixedIds.length >= QUIZ_LENGTH}
                    onChange={() => setS((p) => ({ ...p, fixedIds: on ? p.fixedIds.filter((x) => x !== q.id) : [...p.fixedIds, q.id] }))}
                    aria-label={loc(q.q)}
                  />
                )}
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    <Badge tone={q.topic === 'Safety' ? 'orange' : 'blue'}>{t(`quiz.topic.${q.topic}`)}</Badge>
                    <Badge tone="gray">{q.source}</Badge>
                    {q.multi && <Badge tone="gray">{t('dash.multiAnswer')}</Badge>}
                  </div>
                  <p className="text-sm text-ink">{loc(q.q)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold text-ink">{t('teacher.playRules')}</h3>
        <div className="space-y-4">
          <Field label={t('teacher.scope')}>
            <select value={s.scope} onChange={(e) => setS((p) => ({ ...p, scope: e.target.value as QuizSettings['scope'], studentIds: [] }))} className={fieldClass}>
              <option value="class">{t('teacher.wholeClass')}</option>
              <option value="students">{t('teacher.selectedStudents')}</option>
              <option value="retry">{t('teacher.individualRetry')}</option>
            </select>
          </Field>
          {needsStudents && (
            <div>
              <div className="mb-1.5 text-sm font-medium text-muted">{s.scope === 'retry' ? t('dash.retryPick') : t('dash.studentsPick')}</div>
              <StudentPicker students={pickable} value={s.studentIds} onChange={(v) => setS((p) => ({ ...p, studentIds: v }))} />
            </div>
          )}
          <Field label={t('teacher.mode')}>
            <select value={s.mode} onChange={(e) => setS((p) => ({ ...p, mode: e.target.value as QuizSettings['mode'] }))} className={fieldClass}>
              <option value="random">{t('dash.modeRandom', { count: QUIZ_LENGTH, min: MIN_SAFETY })}</option>
              <option value="fixed">{t('dash.modeFixed', { count: QUIZ_LENGTH })}</option>
            </select>
          </Field>
          <Field label={t('dash.timeLimitMin')}>
            <input type="number" min={5} max={120} value={s.timeLimit} onChange={(e) => setS((p) => ({ ...p, timeLimit: Number(e.target.value) }))} className={fieldClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={s.allowSkip} onChange={(e) => setS((p) => ({ ...p, allowSkip: e.target.checked }))} />
            {t('teacher.allowSkipQuestions')}
          </label>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button disabled={!valid} onClick={save}>
              <Unlock className="h-4 w-4" />
              {t('dash.saveAndOpen')}
            </Button>
            {saved && <span className="text-sm font-semibold text-success-600">{t('dash.quizOpened')}</span>}
          </div>
        </div>
      </Card>
    </div>
  )
}
