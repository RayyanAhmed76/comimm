import { cn } from '@/lib/cn'

export function ProgressBar({
  value,
  className,
  fillClassName,
}: {
  value: number
  className?: string
  /** Override fill color (default: brand blue — visible on light and dark) */
  fillClassName?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-all', fillClassName ?? 'bg-brand-600')}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
