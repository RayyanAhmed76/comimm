import { cn } from '@/lib/cn'

/**
 * Official COMIM wordmark from /public/comim-logo.png (white artwork, transparent bg).
 * `light` = for dark surfaces (default). Set `light={false}` to invert for light surfaces.
 */
export function Logo({
  compact = false,
  light = true,
  className,
}: {
  compact?: boolean
  light?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/comim-logo.png"
        alt="COMIM — Les Compétences Industrielles & Maritimes"
        className={cn(
          'w-auto object-contain object-left',
          compact ? 'h-9 max-w-[42px]' : 'h-11 max-w-[220px]',
          !light && 'brightness-0',
        )}
      />
    </div>
  )
}
