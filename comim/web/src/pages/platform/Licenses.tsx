import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { SortTh, inputSm, thRow, useSort } from '@/components/ui/Table'
import { cn } from '@/lib/cn'
import { fmtDate, useLang } from '@/lib/i18n'
import { FEATURES, type Establishment, type FeatureId } from '@/data/mock'
import { addPlatformAudit, establishmentsStore } from '@/data/stores'

const PLAN_FEATURES: Record<Establishment['plan'], FeatureId[]> = {
  Discovery: ['web'],
  Establishment: ['web', 'vr', 'live', 'exploded', 'quiz'],
  Custom: ['web', 'vr', 'live', 'exploded', 'quiz', 'csv'],
}

/** Licences & Features — the single place where plans, seats, expiry and feature flags are edited. */
export default function Licenses() {
  const { t } = useTranslation()
  const lang = useLang()
  const [params] = useSearchParams()
  const establishments = establishmentsStore.use()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [editing, setEditing] = useState<Establishment | 'new' | null>(null)

  const rows = establishments.filter((e) => !query.trim() || `${e.name} ${e.plan}`.toLowerCase().includes(query.trim().toLowerCase()))
  const sort = useSort(rows, 'name' as 'name' | 'plan' | 'seats' | 'expiry', (r, k) => (k === 'seats' ? r.seats : String(r[k])))

  return (
    <AppShell breadcrumb={[{ label: t('platform.licensesTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{t('platform.licensesTitle')}</h1>
              <p className="mt-1 text-sm text-muted">{t('platform.licencesManageHint')}</p>
            </div>
            <Button onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" />
              {t('platform.addLicence')}
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-6 py-4">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('platform.searchEstablishments')} className={`${inputSm} w-64 pl-9`} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead>
                <tr className={thRow}>
                  <SortTh label={t('platform.establishmentCol')} k="name" sort={sort} className="px-6" />
                  <SortTh label={t('platform.plan')} k="plan" sort={sort} />
                  <SortTh label={t('platform.seats')} k="seats" sort={sort} />
                  <SortTh label={t('platform.licenseExpiry')} k="expiry" sort={sort} />
                  <th className="px-4 py-3">{t('platform.enabledFeatures')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {sort.sorted.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-6 py-3.5 font-semibold text-ink">{e.name}</td>
                    <td className="px-4 py-3.5">
                      <Badge tone="blue">{e.plan}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-muted">
                      {e.usedSeats} / {e.seats}
                    </td>
                    <td className="px-4 py-3.5 text-muted">{fmtDate(e.expiry, lang)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {FEATURES.filter((f) => e.features[f]).map((f) => (
                          <Badge key={f} tone="gray">
                            {t(`platform.features.${f}`)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Button variant="secondary" onClick={() => setEditing(e)}>
                        <Pencil className="h-4 w-4" />
                        {t('common.edit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-bold text-ink">{t('platform.comparePlans')}</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            {(Object.keys(PLAN_FEATURES) as Establishment['plan'][]).map((plan) => (
              <Card key={plan} className="flex flex-col p-6">
                <Badge tone="blue" className="w-fit">
                  {plan}
                </Badge>
                <p className="mt-3 text-sm text-muted">{t(`platform.planDesc.${plan}`)}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {FEATURES.map((f) => {
                    const inc = PLAN_FEATURES[plan].includes(f)
                    return (
                      <li key={f} className="flex items-center gap-2">
                        <span className={cn('flex h-5 w-5 items-center justify-center rounded text-xs font-bold', inc ? 'bg-success-50 text-success-600' : 'bg-slate-100 text-slate-400')}>{inc ? '✓' : '—'}</span>
                        <span className={!inc ? 'text-muted' : undefined}>{t(`platform.features.${f}`)}</span>
                      </li>
                    )
                  })}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {editing && <LicenceModal key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </AppShell>
  )
}

function LicenceModal({ initial, onClose }: { initial: Establishment | null; onClose: () => void }) {
  const { t } = useTranslation()
  const establishments = establishmentsStore.use()
  const [estId, setEstId] = useState(initial?.id ?? establishments[0].id)
  const base = establishments.find((e) => e.id === estId)!
  const [plan, setPlan] = useState<Establishment['plan']>(initial?.plan ?? base.plan)
  const [seats, setSeats] = useState(String(initial?.seats ?? base.seats))
  const [expiry, setExpiry] = useState(initial?.expiry ?? '')
  const [features, setFeatures] = useState<Record<FeatureId, boolean>>(initial?.features ?? base.features)

  const save = () => {
    establishmentsStore.set((p) => p.map((e) => (e.id === estId ? { ...e, plan, seats: Number(seats), expiry, features } : e)))
    const before = establishments.find((e) => e.id === estId)!
    const changes = [
      before.plan !== plan && `${before.plan} → ${plan}`,
      before.seats !== Number(seats) && `seats ${before.seats} → ${seats}`,
      before.expiry !== expiry && `expiry → ${expiry}`,
    ].filter(Boolean)
    if (changes.length || !initial) addPlatformAudit({ author: 'Rania Amrani', action: 'licenseChange', target: `${before.name} — ${changes.join(', ') || 'new licence'}`, establishmentId: estId, screen: 'licenses' })
    FEATURES.forEach((f) => {
      if (before.features[f] !== features[f])
        addPlatformAudit({ author: 'Rania Amrani', action: features[f] ? 'featureActivation' : 'featureDeactivation', target: `${before.name} — ${t(`platform.features.${f}`)}`, establishmentId: estId, screen: 'licenses' })
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? t('platform.editLicence') : t('platform.addLicence')}
      subtitle={initial?.name}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button disabled={!expiry || Number(seats) < 1} onClick={save}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!initial && (
          <Field label={t('platform.establishmentCol')}>
            <select
              value={estId}
              onChange={(e) => {
                const next = establishments.find((x) => x.id === e.target.value)!
                setEstId(next.id)
                setPlan(next.plan)
                setSeats(String(next.seats))
                setFeatures(next.features)
              }}
              className={fieldClass}
            >
              {establishments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t('platform.plan')}>
            <select
              value={plan}
              onChange={(e) => {
                const p = e.target.value as Establishment['plan']
                setPlan(p)
                setFeatures(Object.fromEntries(FEATURES.map((f) => [f, PLAN_FEATURES[p].includes(f)])) as Record<FeatureId, boolean>)
              }}
              className={fieldClass}
            >
              {(Object.keys(PLAN_FEATURES) as Establishment['plan'][]).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label={t('platform.numberOfSeats')}>
            <input type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} className={fieldClass} />
          </Field>
          <Field label={t('platform.licenseExpiry')}>
            <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={fieldClass} />
          </Field>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-muted">{t('platform.enabledFeatures')}</legend>
          <ul className="mt-2 space-y-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium text-ink">{t(`platform.features.${f}`)}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={features[f]}
                  aria-label={t(`platform.features.${f}`)}
                  onClick={() => setFeatures((p) => ({ ...p, [f]: !p[f] }))}
                  className={cn('relative h-6 w-11 shrink-0 rounded-full transition', features[f] ? 'bg-brand-600' : 'bg-slate-300')}
                >
                  <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition', features[f] ? 'left-[22px]' : 'left-0.5')} />
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      </div>
    </Modal>
  )
}
