import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Headphones, Monitor } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLang, useLoc } from '@/lib/i18n'
import { classLabel } from '@/lib/labels'
import { moduleNames } from '@/data/content'
import { AppShell } from '@/components/layout/AppShell'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { inputSm } from '@/components/ui/Table'
import { liveSessions } from '@/data/mock'

export function LiveSessions() {
  const { t } = useTranslation()
  const loc = useLoc()
  const lang = useLang()
  const [classId, setClassId] = useState('all')
  const [mode, setMode] = useState<'all' | 'Headset' | 'Web'>('all')

  const classes = Array.from(new Map(liveSessions.map((s) => [s.classId, s.className])).entries())
  const list = liveSessions.filter((s) => (classId === 'all' || s.classId === classId) && (mode === 'all' || s.mode === mode))

  return (
    <AppShell breadcrumb={[{ label: t('teacher.liveTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('teacher.liveTitle')}</h1>
          <p className="mt-1 text-sm text-muted">{t('teacher.liveSubtitle')}</p>
        </Card>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t('admin.classCol')}
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputSm}>
              <option value="all">{t('live.allClasses')}</option>
              {classes.map(([id, name]) => (
                <option key={id} value={id}>
                  {classLabel(name, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            {t('teacher.mode')}
            <select value={mode} onChange={(e) => setMode(e.target.value as 'all' | 'Headset' | 'Web')} className={inputSm}>
              <option value="all">{t('live.allModes')}</option>
              <option value="Headset">{t('live.vr')}</option>
              <option value="Web">Web</option>
            </select>
          </label>
          <span className="ml-auto rounded-full bg-success-50 px-3 py-1.5 text-sm font-semibold text-success-600" role="status">
            {t('live.count', { count: list.length, total: liveSessions.length })}
          </span>
        </div>

        {list.length === 0 && <p className="py-10 text-center text-sm text-muted">{t('live.none')}</p>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((session) => (
            <Card key={session.id} className="flex flex-col p-5 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{session.initials}</div>
                  <div>
                    {/* A real link: reachable with the keyboard */}
                    <Link to={`/teacher/live/${session.studentId}`} className="font-semibold text-ink hover:text-brand-600 hover:underline">
                      {session.studentName}
                    </Link>
                    <div className="text-xs text-muted">{classLabel(session.className, lang)}</div>
                  </div>
                </div>
                <Badge tone="green" dot>
                  {t('teacher.liveBadge')}
                </Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted">{t('teacher.exercise')}</dt>
                  <dd className="font-medium text-ink">{loc(moduleNames[session.exercise])}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">{t('teacher.mode')}</dt>
                  <dd className="inline-flex items-center gap-1 font-medium text-ink">
                    {session.mode === 'Headset' ? <Headphones className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                    {session.mode === 'Headset' ? `${t('live.vr')}${session.headsetId ? ` ${session.headsetId}` : ''}` : 'Web'}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">{t('live.step')}</dt>
                  <dd className="font-medium text-ink">
                    {session.step} / {session.totalSteps}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted">{t('teacher.duration')}</dt>
                  <dd className="font-medium text-ink">{t('teacher.minutesShort', { count: session.minutes })}</dd>
                </div>
              </dl>
              <Link
                to={`/teacher/live/${session.studentId}`}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                aria-label={`${t('live.watch')} — ${session.studentName}`}
              >
                <Eye className="h-4 w-4" />
                {t('live.watch')}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
