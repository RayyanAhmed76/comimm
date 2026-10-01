import { cn } from '@/lib/cn'
import { InfoTip } from '@/components/ui/InfoTip'

export function Card({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200/80 bg-panel shadow-sm', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick()
            }
          : undefined
      }
    >
      {children}
    </div>
  )
}

/** KPI tile — optional (i) explanation; clickable tiles filter the list below. */
export function StatCard({
  label,
  value,
  valueClassName,
  info,
  onClick,
  active,
}: {
  label: string
  value: string | number
  valueClassName?: string
  info?: string
  onClick?: () => void
  active?: boolean
}) {
  const inner = (
    <>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
        <span>{label}</span>
        {info && <InfoTip text={info} align="left" />}
      </div>
      <div className={cn('mt-2 text-3xl font-bold tracking-tight text-ink', valueClassName)}>{value}</div>
    </>
  )
  if (!onClick) return <Card className="px-5 py-4">{inner}</Card>
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={cn(
        'cursor-pointer rounded-2xl border bg-panel px-5 py-4 text-left shadow-sm transition hover:border-sky-300 hover:shadow-md',
        active ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200/80',
      )}
    >
      {inner}
    </div>
  )
}
