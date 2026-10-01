import { useState } from 'react'
import { AlertTriangle, ImagePlus, Plus, Search, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { inputSm } from '@/components/ui/Table'
import { MachineView } from '@/components/training/MachineView'
import { SpeakButton } from '@/components/training/Audio'
import { useAuth } from '@/context/AuthContext'
import { useLoc } from '@/lib/i18n'
import { uid } from '@/lib/store'
import { catalogue, MIN_SAFETY, QUIZ_LENGTH, type QuizQuestion, type Topic } from '@/data/content'
import { quizBankStore } from '@/data/stores'

const TOPICS: Topic[] = ['Safety', 'Procedure', 'Components']
const MAX_IMAGE = 1024 * 1024

export function QuestionBank() {
  const { t } = useTranslation()
  const loc = useLoc()
  const { user } = useAuth()
  const bank = quizBankStore.use()
  const [topic, setTopic] = useState<'all' | Topic>('all')
  const [source, setSource] = useState<'all' | 'COMIM' | 'School'>('all')
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)

  const counts = TOPICS.map((tp) => ({ tp, n: bank.filter((q) => q.topic === tp).length }))
  const list = bank.filter(
    (q) =>
      (topic === 'all' || q.topic === topic) &&
      (source === 'all' || q.source === source) &&
      (!query.trim() || loc(q.q).toLowerCase().includes(query.trim().toLowerCase())),
  )

  return (
    <AppShell breadcrumb={user?.role === 'admin' ? [{ label: t('nav.settings'), to: '/admin/settings' }, { label: t('teacher.questionBank') }] : [{ label: t('teacher.questionBank') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('teacher.questionBank')}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted">{t('bank.subtitle', { count: QUIZ_LENGTH, min: MIN_SAFETY })}</p>
            </div>
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" />
              {t('teacher.addQuestion')}
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone="navy">{t('bank.total', { count: bank.length })}</Badge>
            {counts.map(({ tp, n }) => (
              <Badge key={tp} tone={tp === 'Safety' ? 'orange' : 'blue'}>
                {t(`quiz.topic.${tp}`)}: {n}
              </Badge>
            ))}
            <Badge tone="gray">COMIM: {bank.filter((q) => q.source === 'COMIM').length}</Badge>
            <Badge tone="gray">{t('bank.school')}: {bank.filter((q) => q.source === 'School').length}</Badge>
          </div>
          {counts[0].n < MIN_SAFETY && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4" />
              {t('dash.safetyWarning', { min: MIN_SAFETY })}
            </p>
          )}
          {(bank.length < 30 || bank.length > 40) && <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-800">{t('dash.randomBankSize')}</p>}
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-6 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
            </div>
            <select value={topic} onChange={(e) => setTopic(e.target.value as 'all' | Topic)} className={inputSm} aria-label={t('teacher.theme')}>
              <option value="all">{t('bank.allTopics')}</option>
              {TOPICS.map((tp) => (
                <option key={tp} value={tp}>
                  {t(`quiz.topic.${tp}`)}
                </option>
              ))}
            </select>
            <select value={source} onChange={(e) => setSource(e.target.value as 'all' | 'COMIM' | 'School')} className={inputSm} aria-label={t('bank.source')}>
              <option value="all">{t('bank.allSources')}</option>
              <option value="COMIM">{t('bank.comimCommon')}</option>
              <option value="School">{t('bank.school')}</option>
            </select>
          </div>
          <ul className="divide-y divide-slate-100">
            {list.map((q) => (
              <li key={q.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={q.topic === 'Safety' ? 'orange' : 'blue'}>{t(`quiz.topic.${q.topic}`)}</Badge>
                    <Badge tone={q.source === 'COMIM' ? 'navy' : 'green'}>{q.source === 'COMIM' ? 'COMIM' : t('bank.school')}</Badge>
                    {q.multi && <Badge tone="gray">{t('dash.multiAnswer')}</Badge>}
                    {q.media && <Badge tone="gray">{q.media.kind === 'part' ? '3D' : t('bank.image')}</Badge>}
                  </div>
                  <p className="font-medium text-ink">{loc(q.q)}</p>
                  <p className="mt-1 text-xs text-muted">
                    {t('teacher.expectedAnswer')}: {q.correct.map((c) => loc(q.options[c])).join(' + ')}
                  </p>
                </div>
                {q.source === 'School' && (
                  <Button variant="ghost" className="text-warning-600" onClick={() => quizBankStore.set((p) => p.filter((x) => x.id !== q.id))} aria-label={t('bank.delete')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
      {adding && <AddQuestionModal onClose={() => setAdding(false)} />}
    </AppShell>
  )
}

function AddQuestionModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const [topic, setTopic] = useState<Topic>('Safety')
  const [text, setText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correct, setCorrect] = useState<number[]>([0])
  const [multi, setMulti] = useState(false)
  const [mediaKind, setMediaKind] = useState<'none' | 'part' | 'image'>('part')
  const [componentId, setComponentId] = useState(catalogue[0].id)
  const [image, setImage] = useState<{ dataUrl: string; name: string } | null>(null)
  const [imageError, setImageError] = useState('')
  const [explanation, setExplanation] = useState('')

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
    const q: QuizQuestion = {
      id: uid('q'),
      topic,
      multi,
      q: both(text),
      options: keep.map(({ o }) => both(o)),
      correct: keep.map(({ i }, idx) => (correct.includes(i) ? idx : -1)).filter((x) => x >= 0),
      explanation: both(explanation),
      media: mediaKind === 'part' ? { kind: 'part', part: comp.part } : mediaKind === 'image' && image ? { kind: 'image', ...image } : undefined,
      source: 'School',
    }
    quizBankStore.set((p) => [...p, q])
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={t('teacher.addQuestion')}
      subtitle={t('bank.addHint')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!valid} onClick={save}>
            {t('bank.addToBank')}
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
              <div className="grid-blueprint h-44 overflow-hidden rounded-xl">
                <MachineView key={comp.part} highlight={[comp.part]} showLabels={false} dimOthers />
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
