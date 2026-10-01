import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { AuditTable } from '@/components/AuditTable'
import { platformAuditStore, schoolAuditStore } from '@/data/stores'

/** Unified log: COMIM actions + actions inside each school. */
export default function PlatformAudit() {
  const { t } = useTranslation()
  const comim = platformAuditStore.use()
  const school = schoolAuditStore.use()

  return (
    <AppShell breadcrumb={[{ label: t('platform.auditTitle') }]}>
      <div className="space-y-5">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('platform.auditTitle')}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{t('platform.auditSubtitleFull')}</p>
        </Card>
        <AuditTable rows={[...comim, ...school]} platform filename="audit-log-comim.csv" />
      </div>
    </AppShell>
  )
}
