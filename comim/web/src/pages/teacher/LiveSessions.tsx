import { useNavigate } from 'react-router-dom'
import { Headphones, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoc } from '@/lib/i18n'
import { moduleNames } from '@/data/content'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { liveSessions } from '@/data/mock'

export function LiveSessions() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const loc = useLoc()

  return (
    <AppShell breadcrumb={[{ label: t('teacher.liveTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('teacher.liveTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('teacher.liveSubtitle')}</p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {liveSessions.map((session) => (
            <Card
              key={session.id}
              className="cursor-pointer p-5 transition hover:shadow-md"
              onClick={() => navigate(`/teacher/live/${session.studentId}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                    {session.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{session.studentName}</div>
                    <div className="text-xs text-muted">{session.className}</div>
                  </div>
                </div>
                <Badge tone="green" dot>
                  {t('teacher.liveBadge')}
                </Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('teacher.exercise')}</span>
                  <span className="font-medium text-ink">{loc(moduleNames[session.exercise])}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('teacher.mode')}</span>
                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                    {session.mode === 'Headset' ? (
                      <Headphones className="h-3.5 w-3.5" />
                    ) : (
                      <Monitor className="h-3.5 w-3.5" />
                    )}
                    {session.mode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">{t('teacher.duration')}</span>
                  <span className="font-medium text-ink">
                    {t('teacher.minutesShort', { count: session.minutes })}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
