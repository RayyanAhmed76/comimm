import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'orange' | 'dark'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-ink border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-muted hover:bg-slate-100',
  danger: 'bg-warning-50 text-warning-600 border border-orange-200 hover:bg-orange-100',
  orange: 'bg-white text-orange-500 border border-orange-400 hover:bg-orange-50',
  dark: 'bg-navy-800 text-white border border-white/10 hover:bg-navy-700',
}

export function Button({
  children,
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
