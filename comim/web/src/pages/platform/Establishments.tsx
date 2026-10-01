import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { establishmentsStore } from '@/data/stores'
import { fmtDate, useLang } from '@/lib/i18n'
import { cn } from '@/lib/cn'

function establishmentStatusLabel(status: string, t: (k: string) => string) {
  if (status === 'Active') return t('common.active')
  if (status === 'Suspended') return t('common.suspended')
  return status
}

const selectClass =
  'h-10 appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20'

export default function Establishments() {
  const { t } = useTranslation()
  const lang = useLang()
  const establishments = establishmentsStore.use()
  const location = useLocation()
  const [toast, setToast] = useState<string | null>(
    (location.state as { toast?: string } | null)?.toast ?? null,
  )
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [plan, setPlan] = useState('all')

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return establishments.filter((e) => {
      if (status !== 'all' && e.status !== status) return false
      if (plan !== 'all' && e.plan !== plan) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.admin.toLowerCase().includes(q) ||
        e.plan.toLowerCase().includes(q)
      )
    })
  }, [query, status, plan, establishments])

  return (
    <AppShell breadcrumb={[{ label: t('platform.establishments') }]}>
      {toast && (
        <div className="mb-4 rounded-xl border border-success-600/30 bg-success-50 px-4 py-3 text-sm font-medium text-success-600">
          {toast}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <p className="text-sm text-muted">{t('platform.manageEstablishmentsDesc')}</p>
        <Link to="/platform/establishments/new">
          <Button>
            <Plus className="h-4 w-4" />
            {t('platform.newEstablishment')}
          </Button>
        </Link>
      </div>

      {/* PDF filter bar: Search · Status · Plan */}
      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative w-full min-w-0 flex-1 sm:min-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('platform.searchEstablishments')}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm text-ink shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={cn(selectClass, 'w-full min-w-0 pl-9 sm:min-w-[160px]')}
              aria-label={t('common.status')}
            >
              <option value="all">{t('platform.allStatuses')}</option>
              <option value="Active">{t('common.active')}</option>
              <option value="Suspended">{t('common.suspended')}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative w-full sm:w-auto">
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className={cn(selectClass, 'w-full min-w-0 sm:min-w-[170px]')}
              aria-label={t('platform.plan')}
            >
              <option value="all">{t('platform.allPlans')}</option>
              <option value="Discovery">{t('platform.discovery')}</option>
              <option value="Establishment">{t('platform.establishmentPlan')}</option>
              <option value="Custom">{t('platform.custom')}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-5 py-3">{t('admin.name')}</th>
              <th className="px-5 py-3">{t('platform.plan')}</th>
              <th className="px-5 py-3">{t('platform.seats')}</th>
              <th className="px-5 py-3">{t('admin.administrator')}</th>
              <th className="px-5 py-3">{t('platform.licenseExpiry')}</th>
              <th className="px-5 py-3">{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                  {t('platform.noEstablishmentsMatch')}
                </td>
              </tr>
            ) : (
              filtered.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
                  <td className="px-5 py-4">
                    <Link
                      to={`/platform/establishments/${e.id}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{e.plan}</td>
                  <td className="px-5 py-4">{e.seats}</td>
                  <td className="px-5 py-4">{e.admin}</td>
                  <td className="px-5 py-4">{fmtDate(e.expiry, lang)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={e.status === 'Active' ? 'green' : 'orange'} dot>
                      {establishmentStatusLabel(e.status, t)}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-xs text-muted">
          {t('platform.showingEstablishments', {
            shown: filtered.length,
            total: establishments.length,
          })}
        </div>
      </Card>
    </AppShell>
  )
}
