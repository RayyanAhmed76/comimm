import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoc } from '@/lib/i18n'
import { moduleNames } from '@/data/content'
import { AppShell } from '@/components/layout/AppShell'
import { MachineView } from '@/components/training/MachineView'
import { liveSessions, studentsSeed as students } from '@/data/mock'

export function LiveSessionView() {
  const { studentId } = useParams<{ studentId: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  const session = liveSessions.find((s) => s.studentId === studentId) ?? liveSessions[0]
  const student = students.find((s) => s.id === session.studentId)
  const initials = student?.initials ?? session.initials
  const headset = session.mode === 'Headset' ? 'VR headset #A-04' : 'Web'

  return (
    <AppShell breadcrumb={[{ label: t('teacher.liveTitle'), to: '/teacher/live' }, { label: session.studentName }]}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-navy-900">
              {initials}
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">
                {t('teacher.liveSession')} — {session.studentName}
              </h1>
              <p className="text-sm text-muted">
                {loc(moduleNames[session.exercise])} · {headset}
              </p>
            </div>
          </div>
          <Link
            to="/teacher/live"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('teacher.closeView')}
          </Link>
        </div>

        <div className="relative grid-blueprint min-h-[560px]">
          <div className="h-[560px] p-4">
            <MachineView highlight={['jacketInlet']} showLabels />
          </div>
          <div className="pointer-events-none absolute bottom-16 right-4 z-30">
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-950/75 px-4 py-2 text-xs font-semibold text-slate-200 ring-1 ring-white/10 backdrop-blur">
              <Eye className="h-3.5 w-3.5" />
              {t('teacher.mirrorView')}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-16 left-1/2 z-30 max-w-md -translate-x-1/2 rounded-2xl bg-navy-950/75 px-4 py-3 text-center text-white shadow-lg ring-1 ring-white/10 backdrop-blur">
            <p className="text-sm font-medium">« {t('teacher.defaultLiveHint')} »</p>
            <p className="mt-1 text-xs text-slate-400">{t('teacher.hintShownAtStep', { step: 6 })}</p>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
