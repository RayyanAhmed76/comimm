import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { AuditTable } from '@/components/AuditTable'
import { schoolAuditStore, settingsStore } from '@/data/stores'

export function AuditLog() {
  const { t } = useTranslation()
  const rows = schoolAuditStore.use()
  const settings = settingsStore.use()

  return (
    <AppShell breadcrumb={[{ label: t('admin.auditTitle') }]}>
      <AuditTable rows={rows} filename="audit-log-establishment.csv" title={t('admin.auditTitle')} subtitle={`${settings.name} · ${t('admin.auditSubtitle')}`} />
    </AppShell>
  )
}
