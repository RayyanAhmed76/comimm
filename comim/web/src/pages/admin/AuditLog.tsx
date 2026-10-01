import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { AuditTable } from '@/components/AuditTable'
import { schoolAuditStore, settingsStore } from '@/data/stores'

export function AuditLog() {
  const { t } = useTranslation()
  const rows = schoolAuditStore.use()
  const settings = settingsStore.use()

  return (
    <AppShell breadcrumb={[{ label: t('admin.auditTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('admin.auditTitle')}</h1>
          <p className="mt-1 text-sm text-muted">
            {settings.name} · {t('admin.auditSubtitle')}
          </p>
        </Card>
        <AuditTable rows={rows} filename="audit-log-establishment.csv" />
      </div>
    </AppShell>
  )
}
