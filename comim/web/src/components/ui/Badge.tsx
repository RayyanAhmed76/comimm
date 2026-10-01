import { cn } from '@/lib/cn'

const tones = {
  blue: 'bg-sky-100 text-sky-700',
  green: 'bg-success-50 text-success-600',
  gray: 'bg-slate-100 text-slate-600',
  orange: 'bg-warning-50 text-warning-600',
  navy: 'bg-navy-800 text-white',
}

export function Badge({
  children,
  tone = 'blue',
  className,
  dot,
}: {
  children: React.ReactNode
  tone?: keyof typeof tones
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
