import { useState } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Hover/focus tooltip. Works with mouse, keyboard and touch (tap toggles). */
export function Tooltip({
  content,
  children,
  className,
  align = 'center',
  side = 'bottom',
}: {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  align?: 'center' | 'left' | 'right'
  side?: 'top' | 'bottom'
}) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 w-max max-w-[260px] rounded-lg bg-navy-950 px-3 py-2 text-left text-xs font-medium normal-case leading-snug tracking-normal text-white shadow-xl',
            side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
            side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'left' && 'left-0',
            align === 'right' && 'right-0',
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}

/** (i) icon explaining a KPI, a column or a status. */
export function InfoTip({ text, className, align }: { text: React.ReactNode; className?: string; align?: 'center' | 'left' | 'right' }) {
  return (
    <Tooltip content={text} align={align}>
      <button
        type="button"
        aria-label={typeof text === 'string' ? text : 'Info'}
        onClick={(e) => e.stopPropagation()}
        className={cn('inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:text-brand-600 focus:text-brand-600 focus:outline-none', className)}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
    </Tooltip>
  )
}
