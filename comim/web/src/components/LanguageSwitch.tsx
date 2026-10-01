import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export function LanguageSwitch({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'dark'
  className?: string
}) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language?.startsWith('fr') ? 'fr' : 'en'

  const setLang = (next: 'en' | 'fr') => {
    void i18n.changeLanguage(next)
  }

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={cn(
        'inline-flex items-center rounded-full p-0.5 text-xs font-bold',
        variant === 'light'
          ? 'border border-slate-200 bg-slate-100 text-slate-500'
          : 'border border-white/15 bg-white/10 text-slate-300',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          lang === 'en'
            ? variant === 'light'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'bg-white text-navy-900 shadow-sm'
            : 'hover:text-inherit',
        )}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('fr')}
        className={cn(
          'rounded-full px-2.5 py-1 transition',
          lang === 'fr'
            ? variant === 'light'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'bg-white text-navy-900 shadow-sm'
            : 'hover:text-inherit',
        )}
        aria-pressed={lang === 'fr'}
      >
        FR
      </button>
    </div>
  )
}
