import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Check, ChevronRight, ImagePlus, Mail, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Modal, fieldClass } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { fmtDate, useLang } from '@/lib/i18n'
import { addSchoolAudit, establishmentsStore, settingsStore } from '@/data/stores'
import { sendContactRequest } from '@/data/notifications'

const MAX_LOGO = 500 * 1024
const TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

export function Settings() {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const settings = settingsStore.use()
  const est = establishmentsStore.use().find((e) => e.id === 'imc')
  const [name, setName] = useState(settings.name)
  const [contact, setContact] = useState(settings.contact)
  const [address, setAddress] = useState(settings.address)
  const [logo, setLogo] = useState<string | null>(settings.logo)
  const [logoError, setLogoError] = useState('')
  const [saved, setSaved] = useState(false)
  const [newTrack, setNewTrack] = useState('')
  const [contactOpen, setContactOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const dirty = name !== settings.name || contact !== settings.contact || address !== settings.address || logo !== settings.logo

  const onFile = (f?: File) => {
    setLogoError('')
    if (!f) return
    if (!TYPES.includes(f.type)) return setLogoError(t('settings.logoType'))
    if (f.size > MAX_LOGO) return setLogoError(t('settings.logoSize', { size: '500 KB' }))
    const r = new FileReader()
    r.onload = () => setLogo(String(r.result))
    r.readAsDataURL(f)
  }

  const save = () => {
    settingsStore.set((s) => ({ ...s, name, contact, address, logo }))
    addSchoolAudit({ author: user?.name ?? '', profile: 'admin', action: 'settingsUpdate', target: logo !== settings.logo ? 'Logo' : 'Establishment information', screen: 'settings' })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  const setTracks = (tracks: string[]) => settingsStore.set((s) => ({ ...s, tracks }))

  return (
    <AppShell breadcrumb={[{ label: t('admin.settingsTitle') }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('admin.settingsTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-ink">{t('admin.establishment')}</h2>
            <p className="mt-0.5 text-sm text-muted">{t('admin.establishmentCardHint')}</p>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {logo ? <img src={logo} alt={t('settings.logoPreview')} className="h-full w-full object-contain p-1" /> : <span className="text-sm font-bold text-muted">IMC</span>}
              </div>
              <div className="space-y-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
                  <ImagePlus className="h-4 w-4" />
                  {t('settings.uploadLogo')}
                  <input type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
                {logo && (
                  <button type="button" onClick={() => setLogo(null)} className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-warning-600">
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('settings.removeLogo')}
                  </button>
                )}
                <p className="text-xs text-muted">{t('settings.logoRules', { size: '500 KB' })}</p>
                {logoError && <p className="text-xs font-semibold text-warning-600">{logoError}</p>}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Field label={t('admin.establishmentName')}>
                <input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
              </Field>
              <Field label={t('admin.contact')}>
                <input value={contact} onChange={(e) => setContact(e.target.value)} className={fieldClass} />
              </Field>
              <Field label={t('admin.address')}>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
              </Field>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Button disabled={!dirty} onClick={save}>
                {t('common.save')}
              </Button>
              {saved && <span className="text-sm font-semibold text-success-600">{t('settings.savedLogoHeader')}</span>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-ink">{t('admin.license')}</h2>
            <p className="mt-0.5 text-sm text-muted">{t('admin.licenseHint')}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                [t('admin.plan'), est?.plan],
                [t('admin.seats'), `${est?.usedSeats} / ${est?.seats}`],
                [t('admin.licenseExpiry'), est ? fmtDate(est.expiry, lang) : ''],
                [t('common.status'), est?.status === 'Active' ? t('common.active') : t('common.suspended')],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-200 px-4 py-3">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted">{k}</div>
                  <div className="mt-1 text-lg font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">{t('admin.licenseChangeNote')}</p>
            <Button variant="secondary" className="mt-5" onClick={() => setContactOpen(true)}>
              <Mail className="h-4 w-4" />
              {t('admin.contactComim')}
            </Button>
            {sent && <p className="mt-2 text-sm font-semibold text-success-600">{t('settings.requestSent')}</p>}
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">{t('admin.accountsAccess')}</h2>
          <p className="mt-0.5 text-sm text-muted">{t('admin.accountsAccessHint')}</p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-4">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-ink">{t('settings.delegation')}</div>
              <p className="mt-1 text-sm text-muted">{t('settings.delegationHint')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.delegation}
              onClick={() => settingsStore.set((s) => ({ ...s, delegation: !s.delegation }))}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold',
                settings.delegation ? 'bg-success-50 text-success-600 ring-1 ring-green-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
              )}
            >
              {settings.delegation && <Check className="h-4 w-4" />}
              {settings.delegation ? t('admin.enabled') : t('admin.disabled')}
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">{t('admin.tracks')}</h2>
          <p className="mt-0.5 text-sm text-muted">{t('admin.tracksHint')}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.tracks.map((track) => (
              <span key={track} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-ink">
                {track}
                <button type="button" onClick={() => setTracks(settings.tracks.filter((x) => x !== track))} className="rounded-full p-0.5 text-muted hover:bg-slate-200 hover:text-ink" aria-label={`${t('common.remove')} ${track}`}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const v = newTrack.trim()
              if (!v || settings.tracks.includes(v)) return
              setTracks([...settings.tracks, v])
              setNewTrack('')
            }}
            className="mt-4 flex flex-wrap gap-2"
          >
            <input value={newTrack} onChange={(e) => setNewTrack(e.target.value)} placeholder={t('admin.newTrackPlaceholder')} className="min-w-[200px] flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
            <Button type="submit">+ {t('common.add')}</Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-ink">{t('admin.learningContent')}</h2>
          <p className="mt-0.5 text-sm text-muted">{t('admin.learningContentHint')}</p>
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-brand-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-ink">{t('teacher.questionBank')}</div>
                <p className="text-sm text-muted">{t('admin.questionBankManage')}</p>
              </div>
            </div>
            <Link to="/teacher/question-bank">
              <Button variant="secondary">
                {t('admin.openQuestionBank')}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={t('admin.contactComim')}
        subtitle={t('settings.contactHint')}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setContactOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!message.trim()}
              onClick={() => {
                sendContactRequest(settings.name, message.trim())
                setContactOpen(false)
                setMessage('')
                setSent(true)
              }}
            >
              {t('settings.send')}
            </Button>
          </>
        }
      >
        <Field label={t('settings.message')}>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={fieldClass} placeholder={t('settings.messagePlaceholder')} />
        </Field>
      </Modal>
    </AppShell>
  )
}
