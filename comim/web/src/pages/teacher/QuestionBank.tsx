import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check, Copy, Eye, ImagePlus, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/InfoTip'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { inputSm } from '@/components/ui/Table'
import { toast } from '@/components/ui/Toast'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { useLang, useLoc } from '@/lib/i18n'
import { classCode, classLabel } from '@/lib/labels'
import { uid } from '@/lib/store'
import { catalogue, MIN_SAFETY, QUIZ_LENGTH, type QuizQuestion, type Topic } from '@/data/content'
import type { AuditAction, AuditChange } from '@/data/mock'
import {
  activeBank,
  addSchoolAudit,
  bankStateStore,
  classesStore,
  classesUnderMinimum,
  isActiveIn,
  MIN_ACTIVE,
  quizBankStore,
  quizClasses,
  withActivation,
  type BankState,
} from '@/data/stores'

const TOPICS: Topic[] = ['Safety', 'Procedure', 'Components']
const MAX_IMAGE = 1024 * 1024

type FormMode = { mode: 'add' } | { mode: 'edit' | 'duplicate'; q: QuizQuestion }

/**
 * Question bank shared by teachers (/teacher/question-bank) and the Client Admin (/admin/questions).
 * Default questions are provided and never editable; school questions belong to their author.
 * A teacher switches questions on / off for their own classes, the admin for the school or a class.
 */
export function QuestionBank() {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const bank = quizBankStore.use()
  const st = bankStateStore.use()
  const classes = classesStore.use()
  const isAdmin = user?.role === 'admin'
  const me = user?.id ?? ''
  const myClasses = quizClasses(classes).filter((c) => isAdmin || c.teacherIds.includes(me))

  const [scope, setScope] = useState<string>(isAdmin ? 'school' : (myClasses[0]?.id ?? ''))
  const [topic, setTopic] = useState<'all' | Topic>('all')
  const [source, setSource] = useState<'all' | 'COMIM' | 'School'>('all')
  const [status, setStatus] = useState<'all' | 'active' | 'disabled'>('all')
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [selected, setSelected] = useState<string[]>([])
  const [form, setForm] = useState<FormMode | null>(null)
  const [preview, setPreview] = useState<QuizQuestion | null>(null)
  const [deleting, setDeleting] = useState<QuizQuestion | null>(null)

  const classId = scope === 'school' ? null : scope
  const scopeLabel = classId ? classCode(classes.find((c) => c.id === classId)?.name ?? '') : t('bank.wholeSchool')
  const activeHere = (q: QuizQuestion) => (classId ? isActiveIn(q, st, classId) : !st.schoolDisabled.includes(q.id))
  const activeCount = bank.filter(activeHere).length
  const enabledIn = (q: QuizQuestion) => quizClasses(classes).filter((c) => isActiveIn(q, st, c.id))
  const mine = (q: QuizQuestion) => q.source === 'School' && q.authorId === me
  const canDelete = (q: QuizQuestion) => q.source === 'School' && (mine(q) || isAdmin)

  const q0 = query.trim().toLowerCase()
  const list = bank.filter(
    (q) =>
      (topic === 'all' || q.topic === topic) &&
      (source === 'all' || q.source === source) &&
      (status === 'all' || (status === 'active') === activeHere(q)) &&
      (!q0 || q.id.toLowerCase() === q0 || loc(q.q).toLowerCase().includes(q0)),
  )
  const counts = TOPICS.map((tp) => ({ tp, n: bank.filter((q) => q.topic === tp).length }))

  const log = (action: AuditAction, q: QuizQuestion, changes?: AuditChange[]) =>
    addSchoolAudit({ author: user?.name ?? '', profile: isAdmin ? 'admin' : 'teacher', action, target: `${q.id} · ${scopeLabel}`, ref: { kind: 'question', id: q.id, label: q.q, sub: classId ? scopeLabel : { code: 'wholeSchool' } }, changes, screen: 'questionBank' })

  /** Would disabling this question push a class under the minimum of active questions? */
  const blocksMinimum = (q: QuizQuestion, state: BankState = st) => classesUnderMinimum(bank, withActivation(state, bank, [q.id], classId, false), classes).length > 0

  const setActive = (ids: string[], on: boolean) => {
    let cur = st
    const done: QuizQuestion[] = []
    for (const id of ids) {
      const q = bank.find((x) => x.id === id)
      if (!q || activeHere(q) === on) continue
      // Bulk disable stops at the limit: never fewer than 20 active questions in a class
      if (!on && blocksMinimum(q, cur)) continue
      cur = withActivation(cur, bank, [id], classId, on)
      done.push(q)
    }
    bankStateStore.set(cur)
    done.forEach((q) => log(on ? 'questionEnabled' : 'questionDisabled', q, [{ field: 'status', before: { code: on ? 'disabled' : 'active' }, after: { code: on ? 'active' : 'disabled' } }]))
    const wanted = ids.filter((id) => {
      const q = bank.find((x) => x.id === id)
      return q && activeHere(q) !== on
    }).length
    if (!on && done.length < wanted) toast(t('bank.stoppedAtMinimum', { done: done.length, kept: wanted - done.length, min: MIN_ACTIVE }), 'warn')
    else if (done.length) toast(t(on ? 'bank.enabledToast' : 'bank.disabledToast', { count: done.length, scope: scopeLabel }))
    setSelected([])
  }

  const remove = (q: QuizQuestion) => {
    quizBankStore.set((p) => p.filter((x) => x.id !== q.id))
    log('questionDeleted', q)
    toast(t('bank.deletedToast'))
    setDeleting(null)
  }
  // Delete is blocked while any class would fall under 20 active questions
  const deleteBlockedBy = (q: QuizQuestion) => classesUnderMinimum(bank.filter((x) => x.id !== q.id), st, classes)

  const allSelected = list.length > 0 && list.every((q) => selected.includes(q.id))

  return (
    <AppShell breadcrumb={[{ label: t('teacher.questionBank') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('teacher.questionBank')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">{t('bank.subtitle', { count: QUIZ_LENGTH, min: MIN_SAFETY })}</p>
            </div>
            <Button onClick={() => setForm({ mode: 'add' })}>
              <Plus className="h-4 w-4" />
              {t('teacher.addQuestion')}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone="navy">{t('bank.total', { count: bank.length })}</Badge>
            <Badge tone={activeCount >= MIN_ACTIVE ? 'green' : 'orange'}>{t('bank.activeCounter', { active: activeCount, total: bank.length, min: MIN_ACTIVE })}</Badge>
            {counts.map(({ tp, n }) => (
              <Badge key={tp} tone={tp === 'Safety' ? 'orange' : 'blue'}>
                {t(`quiz.topic.${tp}`)}: {n}
              </Badge>
            ))}
            <Badge tone="gray">
              {t('bank.default')}: {bank.filter((q) => q.source === 'COMIM').length}
            </Badge>
            <Badge tone="gray">
              {t('bank.school')}: {bank.filter((q) => q.source === 'School').length}
            </Badge>
          </div>
          {/* The Safety minimum never blocks the quiz: warning only */}
          {classId && activeBank(bank, st, classId).filter((q) => q.topic === 'Safety').length < MIN_SAFETY && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {t('bank.safetyNonBlocking', { min: MIN_SAFETY })}
            </p>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 px-6 py-4">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('bank.activationFor')}
              <select
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value)
                  setSelected([])
                }}
                className={cn(inputSm, 'min-w-[11rem] font-semibold')}
              >
                {isAdmin && <option value="school">{t('bank.wholeSchool')}</option>}
                {myClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {classLabel(c.name, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('common.search')}
              <span className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className={cn(inputSm, 'w-full pl-9')} />
              </span>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('teacher.theme')}
              <select value={topic} onChange={(e) => setTopic(e.target.value as 'all' | Topic)} className={inputSm}>
                <option value="all">{t('bank.allTopics')}</option>
                {TOPICS.map((tp) => (
                  <option key={tp} value={tp}>
                    {t(`quiz.topic.${tp}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('bank.source')}
              <select value={source} onChange={(e) => setSource(e.target.value as 'all' | 'COMIM' | 'School')} className={inputSm}>
                <option value="all">{t('bank.allSources')}</option>
                <option value="COMIM">{t('bank.default')}</option>
                <option value="School">{t('bank.school')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
              {t('common.status')}
              <select value={status} onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'disabled')} className={inputSm}>
                <option value="all">{t('bank.allStatuses')}</option>
                <option value="active">{t('bank.statusActive')}</option>
                <option value="disabled">{t('bank.statusDisabled')}</option>
              </select>
            </label>
          </div>

          {/* Bulk actions */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5 text-sm">
            <label className="flex items-center gap-2 font-medium text-ink">
              <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : list.map((q) => q.id))} />
              {t('dash.selectAll')}
            </label>
            <span className="text-muted">{t('dash.selectedCount', { count: selected.length })}</span>
            <span className="ml-auto flex flex-wrap gap-2">
              <Button variant="secondary" className="py-1.5 text-xs" disabled={selected.length === 0 || !scope} onClick={() => setActive(selected, true)}>
                <Check className="h-3.5 w-3.5" />
                {t('bank.enable')}
              </Button>
              <Button variant="secondary" className="py-1.5 text-xs" disabled={selected.length === 0 || !scope} onClick={() => setActive(selected, false)}>
                <Power className="h-3.5 w-3.5" />
                {t('bank.disable')}
              </Button>
            </span>
          </div>

          <ul className="divide-y divide-slate-100">
            {list.length === 0 && <li className="px-6 py-10 text-center text-sm text-muted">{t('dash.noMatch')}</li>}
            {list.map((q) => {
              const on = activeHere(q)
              const lockedByMin = on && blocksMinimum(q)
              const optIn = q.source === 'School' && q.authorRole !== 'admin'
              const where = enabledIn(q)
              return (
                <li key={q.id} className={cn('flex flex-wrap items-start gap-3 px-6 py-4', !on && 'bg-slate-50/60')}>
                  <input
                    type="checkbox"
                    className="mt-1.5"
                    checked={selected.includes(q.id)}
                    onChange={() => setSelected((p) => (p.includes(q.id) ? p.filter((x) => x !== q.id) : [...p, q.id]))}
                    aria-label={loc(q.q)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={q.topic === 'Safety' ? 'orange' : 'blue'}>{t(`quiz.topic.${q.topic}`)}</Badge>
                      {q.source === 'COMIM' ? (
                        <Tooltip content={t('bank.defaultTip')}>
                          <span tabIndex={0}>
                            <Badge tone="navy">{t('bank.default')}</Badge>
                          </span>
                        </Tooltip>
                      ) : (
                        <Badge tone="green">
                          {t('bank.school')}
                          {q.authorName ? ` · ${q.authorName}` : ''}
                        </Badge>
                      )}
                      {q.multi && <Badge tone="gray">{t('dash.multiAnswer')}</Badge>}
                      {q.media && <Badge tone="gray">{q.media.kind === 'part' ? '3D' : t('bank.image')}</Badge>}
                      {!on && <Badge tone="orange">{t('bank.disabledBadge')}</Badge>}
                    </div>
                    <p className={cn('font-medium', on ? 'text-ink' : 'text-slate-500')}>{loc(q.q)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {t('teacher.expectedAnswer')}: {q.correct.map((c) => loc(q.options[c])).join(' + ')}
                    </p>
                    {optIn && (
                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {t('bank.enabledIn')} {where.length ? where.map((c) => classCode(c.name)).join(', ') : t('bank.noClass')}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <RowBtn label={t('bank.studentPreview')} onClick={() => setPreview(q)}>
                      <Eye className="h-4 w-4" />
                    </RowBtn>
                    {mine(q) && (
                      <RowBtn label={t('common.edit')} onClick={() => setForm({ mode: 'edit', q })}>
                        <Pencil className="h-4 w-4" />
                      </RowBtn>
                    )}
                    <RowBtn label={q.source === 'COMIM' ? t('bank.duplicateAndEdit') : t('bank.duplicate')} onClick={() => setForm({ mode: 'duplicate', q })}>
                      <Copy className="h-4 w-4" />
                    </RowBtn>
                    <RowBtn
                      label={!scope ? t('bank.noClassScope') : on ? (lockedByMin ? t('bank.minimumTip', { min: MIN_ACTIVE }) : t('bank.disable')) : t('bank.enable')}
                      disabled={!scope || lockedByMin}
                      onClick={() => setActive([q.id], !on)}
                      className={on ? 'text-success-600' : 'text-slate-400'}
                    >
                      <Power className="h-4 w-4" />
                    </RowBtn>
                    {canDelete(q) && (
                      <RowBtn label={t('bank.delete')} onClick={() => setDeleting(q)} className="text-warning-600">
                        <Trash2 className="h-4 w-4" />
                      </RowBtn>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      {form && <QuestionModal form={form} onClose={() => setForm(null)} classIds={isAdmin ? [] : myClasses.map((c) => c.id)} />}
      {preview && <PreviewModal q={preview} onClose={() => setPreview(null)} />}
      {deleting && (
        <Modal
          open
          onClose={() => setDeleting(null)}
          size="sm"
          title={t('bank.deleteTitle')}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleting(null)}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" disabled={deleteBlockedBy(deleting).length > 0} onClick={() => remove(deleting)}>
                <Trash2 className="h-4 w-4" />
                {t('bank.delete')}
              </Button>
            </>
          }
        >
          <p className="text-sm font-medium text-ink">{loc(deleting.q)}</p>
          {deleteBlockedBy(deleting).length > 0 ? (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {t('bank.deleteBlocked', { classes: deleteBlockedBy(deleting).map((c) => classCode(c.name)).join(', '), min: MIN_ACTIVE })}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">{t('bank.deleteHint')}</p>
          )}
        </Modal>
      )}
    </AppShell>
  )
}

function RowBtn({ label, onClick, disabled, className, children }: { label: string; onClick: () => void; disabled?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <Tooltip content={label} align="right">
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        aria-disabled={disabled}
        aria-label={label}
        // aria-disabled (not disabled) keeps the explanatory tooltip reachable
        className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100', disabled && 'cursor-not-allowed opacity-35 hover:bg-transparent', className)}
      >
        {children}
      </button>
    </Tooltip>
  )
}

/** The question as the student sees it during the Final Quiz. */
function PreviewModal({ q, onClose }: { q: QuizQuestion; onClose: () => void }) {
  const { t } = useTranslation()
  const loc = useLoc()
  return (
    <Modal open onClose={onClose} size="lg" title={t('bank.studentPreview')} subtitle={t(`quiz.topic.${q.topic}`)}>
      <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h3 className="text-lg font-bold text-ink">{loc(q.q)}</h3>
          <p className="mt-1 text-sm text-muted">{q.multi ? t('student.oneOrMore') : t('student.selectOne')}</p>
          <ul className="mt-4 space-y-2.5">
            {q.options.map((o, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium">
                <span className={cn('h-5 w-5 shrink-0 border-2 border-slate-300', q.multi ? 'rounded-md' : 'rounded-full')} />
                {loc(o)}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted">
            <span className="font-semibold">{t('teacher.expectedAnswer')}:</span> {q.correct.map((c) => loc(q.options[c])).join(' + ')}
          </p>
        </div>
        <div className="grid-blueprint min-h-[220px] overflow-hidden rounded-2xl p-2">
          {q.media?.kind === 'part' ? (
            <MachineView highlight={[q.media.part]} focus={q.media.part} showLabels={false} dimOthers wheelZoom={false} />
          ) : q.media?.kind === 'image' ? (
            <img src={q.media.dataUrl} alt={q.media.name} className="h-full w-full bg-white object-contain" />
          ) : (
            <MachineView showLabels={false} wheelZoom={false} />
          )}
        </div>
      </div>
    </Modal>
  )
}

/** Add / edit (author only) / duplicate — the same form. */
function QuestionModal({ form, onClose, classIds }: { form: FormMode; onClose: () => void; classIds: string[] }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const { user } = useAuth()
  const bank = quizBankStore.use()
  const src = form.mode === 'add' ? null : form.q
  const [topic, setTopic] = useState<Topic>(src?.topic ?? 'Safety')
  const [text, setText] = useState(src ? loc(src.q) : '')
  const [options, setOptions] = useState<string[]>(() => {
    const o = src ? src.options.map((x) => loc(x)) : []
    return [...o, '', '', '', ''].slice(0, Math.max(4, o.length))
  })
  const [correct, setCorrect] = useState<number[]>(src?.correct ?? [0])
  const [multi, setMulti] = useState(src?.multi ?? false)
  const [mediaKind, setMediaKind] = useState<'none' | 'part' | 'image'>(src ? (src.media?.kind ?? 'none') : 'part')
  const [componentId, setComponentId] = useState(() => (src?.media?.kind === 'part' ? (catalogue.find((c) => c.part === (src.media as { part: string }).part)?.id ?? catalogue[0].id) : catalogue[0].id))
  const [image, setImage] = useState<{ dataUrl: string; name: string } | null>(src?.media?.kind === 'image' ? { dataUrl: src.media.dataUrl, name: src.media.name } : null)
  const [imageError, setImageError] = useState('')
  const [explanation, setExplanation] = useState(src ? loc(src.explanation) : '')

  const filled = options.filter((o) => o.trim()).length
  const valid = text.trim() && filled >= 2 && correct.length > 0 && correct.every((c) => options[c]?.trim()) && explanation.trim() && (mediaKind !== 'image' || image)
  const comp = catalogue.find((c) => c.id === componentId)!

  const onFile = (f?: File) => {
    setImageError('')
    if (!f) return
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(f.type)) return setImageError(t('settings.logoType'))
    if (f.size > MAX_IMAGE) return setImageError(t('settings.logoSize', { size: '1 MB' }))
    const r = new FileReader()
    r.onload = () => setImage({ dataUrl: String(r.result), name: f.name })
    r.readAsDataURL(f)
  }

  const save = () => {
    const both = (s: string) => ({ en: s.trim(), fr: s.trim() })
    const keep = options.map((o, i) => ({ o, i })).filter(({ o }) => o.trim())
    const isAdmin = user?.role === 'admin'
    const edit = form.mode === 'edit'
    const q: QuizQuestion = {
      id: edit ? form.q.id : uid('q'),
      topic,
      multi,
      q: both(text),
      options: keep.map(({ o }) => both(o)),
      correct: keep.map(({ i }, idx) => (correct.includes(i) ? idx : -1)).filter((x) => x >= 0),
      explanation: both(explanation),
      media: mediaKind === 'part' ? { kind: 'part', part: comp.part } : mediaKind === 'image' && image ? { kind: 'image', ...image } : undefined,
      source: 'School',
      authorId: user?.id,
      authorName: user?.name,
      authorRole: isAdmin ? 'admin' : 'teacher',
    }
    // Author edit = immediate effect wherever the question is active (past attempts keep their own copy)
    quizBankStore.set((p) => (edit ? p.map((x) => (x.id === q.id ? q : x)) : [...p, q]))
    // A teacher's new question is activated in their own classes only — other classes opt in
    if (!edit && !isAdmin) bankStateStore.set((s) => classIds.reduce((acc, c) => withActivation(acc, [...bank, q], [q.id], c, true), s))
    addSchoolAudit({
      author: user?.name ?? '',
      profile: isAdmin ? 'admin' : 'teacher',
      action: edit ? 'questionUpdated' : form.mode === 'duplicate' ? 'questionDuplicated' : 'questionCreated',
      target: q.id,
      ref: { kind: 'question', id: q.id, label: q.q, sub: { code: `topic${topic}` } },
      changes: edit && loc(form.q.q) !== text.trim() ? [{ field: 'question', before: form.q.q, after: q.q }] : undefined,
      screen: 'questionBank',
    })
    toast(t(edit ? 'bank.updatedToast' : 'bank.addedToast'))
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={form.mode === 'edit' ? t('bank.editQuestion') : form.mode === 'duplicate' ? t('bank.duplicateQuestion') : t('teacher.addQuestion')}
      subtitle={form.mode === 'duplicate' && form.q.source === 'COMIM' ? t('bank.duplicateDefaultHint') : t('bank.addHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!valid} onClick={save}>
            {form.mode === 'edit' ? t('common.saveChanges') : t('bank.addToBank')}
          </Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label={t('teacher.theme')}>
            <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)} className={fieldClass}>
              {TOPICS.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`quiz.topic.${tp}`)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('bank.question')}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={fieldClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={multi}
              onChange={(e) => {
                setMulti(e.target.checked)
                if (!e.target.checked) setCorrect(correct.slice(0, 1))
              }}
            />
            {t('bank.multiAnswer')}
          </label>
          <div className="space-y-2">
            <span className="block text-sm font-medium text-muted">{t('bank.answers')}</span>
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name="correct"
                  checked={correct.includes(i)}
                  onChange={() => setCorrect(multi ? (correct.includes(i) ? correct.filter((x) => x !== i) : [...correct, i]) : [i])}
                  aria-label={t('bank.markCorrect')}
                />
                <input
                  value={o}
                  onChange={(e) => setOptions((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={t('bank.answerN', { n: i + 1 })}
                  className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm"
                />
              </div>
            ))}
            <p className="text-xs text-muted">{t('bank.correctHint')}</p>
          </div>
        </div>
        <div className="space-y-4">
          <fieldset>
            <legend className="text-sm font-medium text-muted">{t('bank.media')}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['part', 'image', 'none'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <input type="radio" name="media" checked={mediaKind === k} onChange={() => setMediaKind(k)} />
                  {t(`bank.media_${k}`)}
                </label>
              ))}
            </div>
          </fieldset>
          {mediaKind === 'part' && (
            <>
              <Field label={t('bank.catalogueComponent')}>
                <select value={componentId} onChange={(e) => setComponentId(e.target.value)} className={fieldClass}>
                  {catalogue.map((c) => (
                    <option key={c.id} value={c.id}>
                      {loc(c.name)}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid-blueprint h-48 overflow-hidden rounded-xl p-2">
                <MachineView highlight={[comp.part]} focus={comp.part} showLabels={false} dimOthers wheelZoom={false} />
              </div>
            </>
          )}
          {mediaKind === 'image' && (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-sm text-muted hover:bg-slate-50">
                {image ? <img src={image.dataUrl} alt={image.name} className="max-h-32 object-contain" /> : <ImagePlus className="h-8 w-8" />}
                <span>{image ? image.name : t('bank.uploadImage')}</span>
                <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              </label>
              {imageError && <p className="mt-1 text-sm text-warning-600">{imageError}</p>}
            </div>
          )}
          <Field label={t('bank.explanation')}>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} className={fieldClass} placeholder={t('bank.explanationHint')} />
          </Field>
          {explanation.trim() && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <SpeakButton text={explanation} />
              {t('bank.audioPreview')}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
