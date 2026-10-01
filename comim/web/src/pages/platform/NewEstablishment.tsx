import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { uid } from '@/lib/store'
import { addPlatformAudit, establishmentsStore } from '@/data/stores'

const fieldClass =
  'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn('block text-sm font-medium text-ink', className)}>
      {label}
      {children}
    </label>
  )
}

export default function NewEstablishment() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [type, setType] = useState('Maritime institute')
  const [plan, setPlan] = useState('Establishment')
  const [seats, setSeats] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [legalName, setLegalName] = useState('')
  const [legalRole, setLegalRole] = useState('')
  const [legalEmail, setLegalEmail] = useState('')
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const id = uid('est')
    const expiry = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10)
    establishmentsStore.set((p) => [
      ...p,
      {
        id,
        name: name.trim(),
        city: city.trim() || '—',
        plan: plan as 'Discovery' | 'Establishment' | 'Custom',
        seats: Number(seats) || 1,
        usedSeats: 0,
        admin: adminName.trim(),
        expiry,
        status: 'Active',
        features: { web: true, vr: plan !== 'Discovery', live: plan !== 'Discovery', exploded: plan !== 'Discovery', quiz: plan !== 'Discovery', csv: plan === 'Custom' },
      },
    ])
    addPlatformAudit({ author: 'Rania Amrani', action: 'establishmentCreation', target: name.trim(), establishmentId: id })
    navigate('/platform/establishments', {
      state: {
        toast: t('platform.establishmentCreatedToast', { name: name.trim() }),
      },
    })
  }

  return (
    <AppShell breadcrumb={[{ label: t('platform.establishments'), to: '/platform/establishments' }, { label: t('platform.newEstablishmentTitle') }]}>
      <div className="space-y-5">
        <div>
          <Link
            to="/platform/establishments"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            ← {t('platform.backToEstablishments')}
          </Link>
        </div>

        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('platform.newEstablishmentTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('platform.newEstablishmentHint')}</p>
        </Card>

        <Card className="p-6 md:p-8">
          <form onSubmit={submit} className="space-y-8">
            {/* General information */}
            <section>
              <h2 className="mb-4 text-base font-bold text-ink">{t('platform.generalInfo')}</h2>
              <div className="space-y-4">
                <Field label={t('platform.establishmentName')}>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={fieldClass}
                    placeholder={t('platform.establishmentNamePlaceholder')}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label={t('platform.establishmentType')}>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className={fieldClass}
                    >
                      <option value="Maritime institute">{t('platform.typeMaritimeInstitute')}</option>
                      <option value="Maritime high school">{t('platform.typeMaritimeHighSchool')}</option>
                      <option value="Training center">{t('platform.typeTrainingCenter')}</option>
                      <option value="Other">{t('platform.typeOther')}</option>
                    </select>
                  </Field>
                  <Field label={t('platform.plan')}>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className={fieldClass}
                    >
                      <option value="Discovery">{t('platform.discovery')}</option>
                      <option value="Establishment">{t('platform.establishmentPlan')}</option>
                      <option value="Custom">{t('platform.custom')}</option>
                    </select>
                  </Field>
                  <Field label={t('platform.numberOfSeats')}>
                    <input
                      type="number"
                      min={1}
                      required
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className={fieldClass}
                      placeholder="120"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Contact details */}
            <section>
              <h2 className="mb-4 text-base font-bold text-ink">{t('platform.contactDetails')}</h2>
              <div className="space-y-4">
                <Field label={t('platform.address')}>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label={t('platform.city')}>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={t('platform.phone')}>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label={t('platform.contactEmail')}>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Legal representative */}
            <section>
              <h2 className="mb-4 text-base font-bold text-ink">{t('platform.legalRep')}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t('platform.legalRepName')}>
                  <input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t('platform.legalRepRole')}>
                  <input
                    value={legalRole}
                    onChange={(e) => setLegalRole(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t('platform.legalRepEmail')}>
                  <input
                    type="email"
                    value={legalEmail}
                    onChange={(e) => setLegalEmail(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </section>

            {/* First Client Admin */}
            <section>
              <h2 className="mb-4 text-base font-bold text-ink">{t('platform.firstClientAdmin')}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t('platform.clientAdminName')}>
                  <input
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
                <Field label={t('platform.clientAdminEmail')}>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className={fieldClass}
                  />
                </Field>
              </div>
            </section>

            <div className="pt-2">
              <Button
                type="submit"
                className="rounded-full bg-[#0A1633] px-5 hover:bg-[#122249]"
              >
                <Plus className="h-4 w-4" />
                {t('platform.createEstablishment')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  )
}
