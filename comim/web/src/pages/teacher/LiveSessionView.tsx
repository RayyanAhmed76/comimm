import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Check, Clock, Eye, Lightbulb, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLoc } from '@/lib/i18n'
import { moduleNames, repairProcedure, startupProcedure, tourSegments } from '@/data/content'
import { AppShell } from '@/components/layout/AppShell'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { MachineView } from '@/components/training/MachineView'
import { liveSessions, studentsSeed as students } from '@/data/mock'
import { useAuth } from '@/context/AuthContext'

export function LiveSessionView() {
  const { studentId } = useParams<{ studentId: string }>()
  const { t } = useTranslation()
  const loc = useLoc()
  // The Client Admin opens the live view from a headset page
  const admin = useAuth().user?.role === 'admin'
  const back = admin ? '/admin/headsets' : '/teacher/live'
  const session = liveSessions.find((s) => s.studentId === studentId) ?? liveSessions[0]
  const student = students.find((s) => s.id === session.studentId)
  const initials = student?.initials ?? session.initials
  const headset = session.mode === 'Headset' ? `${t('live.vrHeadset')} ${session.headsetId ?? ''}` : 'Web'

  // What the student is doing right now, and what is already behind them
  const steps = session.exercise === 'startup' ? startupProcedure : session.exercise === 'repair' ? repairProcedure : []
  const labels = steps.length ? steps.map((s) => loc(s.label)) : session.exercise === 'tour' ? tourSegments.map((s) => loc(s.title)) : []
  const current = steps[session.step - 1]
  const focus = current?.target ?? (session.exercise === 'tour' ? tourSegments[session.step - 1]?.focus[0] : undefined)
  const hintShown = session.hints > 0 && current

  const metric = (Icon: React.ComponentType<{ className?: string }>, label: string, value: React.ReactNode, tone = 'text-ink') => (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-1 text-2xl font-bold tracking-tight ${tone}`}>{value}</div>
    </div>
  )

  return (
    <AppShell breadcrumb={[{ label: admin ? t('admin.headsetsTitle') : t('teacher.liveTitle'), to: back }, { label: session.studentName }]}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-navy-900">{initials}</div>
            <div>
              <h1 className="text-lg font-bold text-ink">
                {t('teacher.liveSession')} — {session.studentName}
              </h1>
              <p className="text-sm text-muted">
                {loc(moduleNames[session.exercise])} · {headset}
              </p>
            </div>
          </div>
          <Link to={back} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            {t('teacher.closeView')}
          </Link>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            {/* Dedicated bar: what the student sees and the hint on screen — nothing covers the scene */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-navy-950 px-4 py-2.5 text-xs font-semibold text-slate-200">
              <span className="inline-flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" />
                {t('teacher.mirrorView')}
              </span>
              {hintShown && (
                <span className="inline-flex min-w-0 items-center gap-2 rounded-full bg-orange-500/15 px-3 py-1 text-orange-200 ring-1 ring-orange-400/30">
                  <Lightbulb className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {t('live.hintOnScreen', { step: session.step })} « {loc(current.hint1)} »
                  </span>
                </span>
              )}
            </div>
            <div className="grid-blueprint h-[420px] p-3 sm:h-[520px]">
              <MachineView highlight={focus ? [focus] : []} showLabels wheelZoom={false} />
            </div>
          </div>

          {/* Live metrics */}
          <aside className="border-t border-slate-200 p-5 lg:border-t-0 lg:border-l">
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-muted">{t('live.metrics')}</h2>
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">{t('live.stepOf', { current: session.step, total: session.totalSteps })}</span>
                <span className="text-xs text-muted">{Math.round(((session.step - 1) / session.totalSteps) * 100)} %</span>
              </div>
              <ProgressBar value={((session.step - 1) / session.totalSteps) * 100} className="mt-2" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {metric(AlertCircle, t('live.errors'), session.errors, session.errors > 2 ? 'text-warning-600' : 'text-ink')}
              {metric(Lightbulb, t('live.hintsUsed'), session.hints)}
              {metric(Clock, t('live.elapsed'), t('teacher.minutesShort', { count: session.minutes }))}
              {metric(ListChecks, t('live.stepsDone'), `${session.step - 1} / ${session.totalSteps}`)}
            </div>

            {labels.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-muted">{t('live.stepsDone')}</h3>
                <ol className="mt-2 max-h-[280px] space-y-1 overflow-y-auto pr-1 text-sm">
                  {labels.slice(0, session.step).map((label, i) => {
                    const done = i < session.step - 1
                    return (
                      <li key={i} className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 ${done ? 'text-slate-600' : 'bg-sky-50 font-semibold text-ink'}`}>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${done ? 'bg-success-600' : 'bg-brand-600'}`}>
                          {done ? <Check className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className="leading-snug">
                          {label}
                          {!done && <span className="ml-1.5 text-xs font-medium text-brand-600">· {t('live.inProgress')}</span>}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
