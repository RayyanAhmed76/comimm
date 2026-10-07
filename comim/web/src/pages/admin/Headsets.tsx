import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Info, Link2Off, Pencil, QrCode, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { Pagination, SortTh, inputSm, thRow, usePaged, useSort } from '@/components/ui/Table'
import { useAuth } from '@/context/AuthContext'
import { fmtDateTime, useLang, useLoc } from '@/lib/i18n'
import { CURRENT_YEAR, type Headset } from '@/data/mock'
import { addSchoolAudit, classesStore, headsetsStore } from '@/data/stores'

type SortKey = 'id' | 'status' | 'classes' | 'lastSeen' | 'location'

export function Headsets() {
  const { t } = useTranslation()
  const lang = useLang()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const headsets = headsetsStore.use()
  const classes = classesStore.use()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState<'all' | 'online' | 'offline' | 'unpaired'>('all')
  const [editing, setEditing] = useState<Headset | null>(null)

  const short = (id: string) => classes.find((c) => c.id === id)?.name.split(' ')[0] ?? id
  const rows = headsets
    .map((h) => ({ ...h, statusKey: !h.paired ? 'unpaired' : h.online ? 'online' : 'offline', classLabel: h.classIds.map(short).join(', ') }))
    .filter((h) => status === 'all' || h.statusKey === status)
    .filter((h) => !query.trim() || `${h.id} ${h.location} ${h.classLabel} ${h.currentStudent ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  const sort = useSort(rows, 'id' as SortKey, (r, k) => (k === 'status' ? r.statusKey : k === 'classes' ? r.classLabel : String(r[k])))
  const paged = usePaged(sort.sorted, 8)

  const paired = headsets.filter((h) => h.paired)
  return (
    <AppShell breadcrumb={[{ label: t('admin.headsetsTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('admin.headsetsTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('admin.headsetsSubtitle')}</p>
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            {t('headsets.signInExplain')}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label={t('common.connected')} value={paired.filter((h) => h.online).length} valueClassName="text-success-600" info={t('kpi.connected')} onClick={() => setStatus('online')} active={status === 'online'} />
          <StatCard label={t('common.offline')} value={paired.filter((h) => !h.online).length} valueClassName="text-muted" info={t('kpi.offline')} onClick={() => setStatus('offline')} active={status === 'offline'} />
          <StatCard label={t('admin.total')} value={paired.length} info={t('kpi.totalHeadsets')} onClick={() => setStatus('all')} active={status === 'all'} />
        </div>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-6 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('common.search')} className={`${inputSm} pl-9`} />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputSm} aria-label={t('common.status')}>
              <option value="all">{t('dash.allStatuses')}</option>
              <option value="online">{t('common.connected')}</option>
              <option value="offline">{t('common.offline')}</option>
              <option value="unpaired">{t('headsets.unpaired')}</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('admin.headsetId')} k="id" sort={sort} className="px-6" />
                  <SortTh label={t('common.status')} k="status" sort={sort} info={t('headsets.statusComputed')} />
                  <SortTh label={t('headsets.classes')} k="classes" sort={sort} />
                  <SortTh label={t('admin.lastConnected')} k="lastSeen" sort={sort} />
                  <SortTh label={t('admin.location')} k="location" sort={sort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {paged.slice.map((h) => (
                  <tr key={h.id} className="cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={() => navigate(`/admin/headsets/${encodeURIComponent(h.id)}`)}>
                    <td className="px-6 py-3.5">
                      <Link to={`/admin/headsets/${encodeURIComponent(h.id)}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-ink hover:text-brand-600">
                        {h.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge tone={h.statusKey === 'online' ? 'green' : 'gray'} dot>
                        {h.statusKey === 'online' ? t('common.connected') : h.statusKey === 'offline' ? t('common.offline') : t('headsets.unpaired')}
                      </Badge>
                      {h.currentStudent && h.online && <div className="mt-1 text-xs text-muted">{t('headsets.inUseBy', { name: h.currentStudent })}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-muted">{h.classLabel || t('headsets.noClass')}</td>
                    <td className="px-4 py-3.5 text-muted">{fmtDateTime(h.lastSeen, lang)}</td>
                    <td className="px-4 py-3.5 text-muted">{h.location}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" onClick={() => setEditing(h)} aria-label={`${t('common.edit')} ${h.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination paged={paged} />
        </Card>
      </div>
      {editing && <HeadsetModal key={editing.id} headset={editing} onClose={() => setEditing(null)} />}
    </AppShell>
  )
}

export function HeadsetModal({ headset, onClose }: { headset: Headset; onClose: () => void }) {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const { user } = useAuth()
  const classes = classesStore.use().filter((c) => c.schoolYear === CURRENT_YEAR)
  const [classIds, setClassIds] = useState(headset.classIds)
  const [location, setLocation] = useState(headset.location)
  const [confirmUnpair, setConfirmUnpair] = useState(false)

  const save = () => {
    headsetsStore.set((p) => p.map((h) => (h.id === headset.id ? { ...h, classIds, location } : h)))
    const codes = (ids: string[]) => ids.map((id) => classes.find((c) => c.id === id)?.name.split(' ')[0] ?? id.toUpperCase()).join(', ') || { code: 'none' }
    addSchoolAudit({
      author: user?.name ?? '',
      profile: 'admin',
      action: 'headsetUpdate',
      target: `${headset.id} → ${classIds.map((id) => id.toUpperCase()).join(', ') || '—'}`,
      ref: { kind: 'headset', id: headset.id, label: headset.id, sub: location },
      changes: [
        ...(codes(headset.classIds) !== codes(classIds) ? [{ field: 'assignedClasses', before: codes(headset.classIds), after: codes(classIds) }] : []),
        ...(headset.location !== location ? [{ field: 'location', before: headset.location, after: location }] : []),
      ],
      screen: 'headsets',
    })
    onClose()
  }
  const unpair = () => {
    headsetsStore.set((p) =>
      p.map((h) => (h.id === headset.id ? { ...h, paired: false, online: false, classIds: [], history: [...h.history, { date: new Date().toISOString(), event: { en: 'Unpaired', fr: 'Désappairé' } }] } : h)),
    )
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'headsetUnpaired', target: headset.id, ref: { kind: 'headset', id: headset.id, label: headset.id, sub: headset.location }, changes: [{ field: 'pairing', before: { code: 'paired' }, after: { code: 'unpaired' } }], screen: 'headsets' })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('admin.editHeadset')}
      subtitle={headset.id}
      size="lg"
      footer={
        <>
          {headset.paired &&
            (confirmUnpair ? (
              <Button variant="danger" className="mr-auto" onClick={unpair}>
                {t('headsets.confirmUnpair')}
              </Button>
            ) : (
              <Button variant="ghost" className="mr-auto text-warning-600" onClick={() => setConfirmUnpair(true)}>
                <Link2Off className="h-4 w-4" />
                {t('headsets.unpair')}
              </Button>
            ))}
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save}>{t('common.saveChanges')}</Button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium text-muted">{t('common.status')}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge tone={headset.online ? 'green' : 'gray'} dot>
                {!headset.paired ? t('headsets.unpaired') : headset.online ? t('common.connected') : t('common.offline')}
              </Badge>
              <span className="text-xs text-muted">{t('headsets.statusComputed')}</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {t('admin.lastConnected')}: {fmtDateTime(headset.lastSeen, lang)}
            </div>
          </div>
          <Field label={t('admin.location')}>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={fieldClass} />
          </Field>
          <fieldset>
            <legend className="text-sm font-medium text-muted">{t('headsets.classes')}</legend>
            <div className="mt-2 grid gap-2">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <input type="checkbox" checked={classIds.includes(c.id)} onChange={() => setClassIds((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} />
                  {c.name}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted">{t('headsets.classesHint')}</p>
          </fieldset>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 p-4 text-center">
            <QrCode className="mx-auto h-20 w-20 text-ink" />
            <div className="mt-2 text-sm font-semibold">{t('headsets.signInTitle')}</div>
            <p className="mt-1 text-xs text-muted">{t('headsets.signInHint')}</p>
          </div>
          <div>
            <div className="text-sm font-medium text-muted">{t('headsets.history')}</div>
            <ul className="mt-2 space-y-1 text-sm">
              {headset.history.map((h, i) => (
                <li key={i} className="flex justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                  <span>{loc(h.event)}</span>
                  <span className="text-xs text-muted">{fmtDateTime(h.date, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  )
}
