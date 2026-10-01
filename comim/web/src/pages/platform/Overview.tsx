import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Card, StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { fmtDate, fmtDateTime, fmtNumber, useLang } from '@/lib/i18n'
import { DEMO_NOW, usageSeed } from '@/data/mock'
import { establishmentsStore, platformAuditStore } from '@/data/stores'

export default function PlatformOverview() {
  const { t } = useTranslation()
  const lang = useLang()
  const establishments = establishmentsStore.use()
  const audit = platformAuditStore.use()
  const days = (iso: string) => (new Date(iso).getTime() - new Date(DEMO_NOW).getTime()) / 86400000
  const expiring30 = establishments.filter((e) => days(e.expiry) >= 0 && days(e.expiry) <= 30)
  const expiring90 = establishments.filter((e) => days(e.expiry) >= 0 && days(e.expiry) <= 90).sort((a, b) => a.expiry.localeCompare(b.expiry))
  const students = establishments.reduce((s, e) => s + e.usedSeats, 0)
  const sessions = Object.values(usageSeed.thisMonth).reduce((s, u) => s + u.sessions, 0)

  return (
    <AppShell breadcrumb={[{ label: t('platform.platformOverview') }]}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('platform.establishments')} value={establishments.length} info={t('kpi.establishments', { active: establishments.filter((e) => e.status === 'Active').length })} />
        <StatCard label={t('platform.studentsStat')} value={fmtNumber(students, lang)} info={t('kpi.platformStudents')} />
        <StatCard label={t('platform.licensesExpiring')} value={expiring30.length} valueClassName="text-warning-600" info={t('kpi.licensesExpiring')} />
        <StatCard label={t('platform.sessionsMonth')} value={fmtNumber(sessions, lang)} info={t('kpi.sessionsMonth')} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold">{t('platform.licensesExpiringSoon')}</h2>
            <p className="text-sm text-muted">{t('platform.expiringLicenses90')}</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-2">{t('platform.establishmentCol')}</th>
                <th className="px-5 py-2">{t('platform.plan')}</th>
                <th className="px-5 py-2">{t('platform.licenseExpiry')}</th>
              </tr>
            </thead>
            <tbody>
              {expiring90.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-muted">
                    —
                  </td>
                </tr>
              )}
              {expiring90.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    <Link to={`/platform/licenses?q=${encodeURIComponent(e.name)}`} className="font-medium text-brand-600 hover:underline">
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">{e.plan}</td>
                  <td className="px-5 py-3">
                    <Badge tone="orange">{fmtDate(e.expiry, lang)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-bold">{t('platform.recentActivity')}</h2>
            <Link to="/platform/audit" className="text-sm font-semibold text-brand-600 hover:underline">
              {t('nav.auditLog')} →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {[...audit]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((a) => (
                <li key={a.id} className="px-5 py-3 text-sm">
                  <div className="font-medium">{t(`audit.actions.${a.action}`)}</div>
                  <div className="text-muted">{a.target}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {a.author} · {fmtDateTime(a.date, lang)}
                  </div>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  )
}
