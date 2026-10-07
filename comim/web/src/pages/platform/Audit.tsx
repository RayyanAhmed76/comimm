import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { AuditTable } from '@/components/AuditTable'
import { platformAuditStore, schoolAuditStore } from '@/data/stores'

/** Unified log: COMIM actions + actions inside each school. */
export default function PlatformAudit() {
  const { t } = useTranslation()
  const comim = platformAuditStore.use()
  const school = schoolAuditStore.use()

  return (
    <AppShell breadcrumb={[{ label: t('platform.auditTitle') }]}>
      <AuditTable rows={[...comim, ...school]} platform filename="audit-log-comim.csv" title={t('platform.auditTitle')} subtitle={t('platform.auditSubtitleFull')} />
    </AppShell>
  )
}
