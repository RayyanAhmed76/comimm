import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, Headphones, LogIn, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/Logo'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { Button } from '@/components/ui/Button'
import { homeFor, useAuth } from '@/context/AuthContext'
import { demoUsers, loginProfiles, type Role } from '@/data/mock'
import { resetAllStores } from '@/lib/store'
import { cn } from '@/lib/cn'

const input =
  'mt-1.5 w-full rounded-xl border border-white/15 bg-navy-950/80 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

/** Single sign-in page for every profile (Student, Teacher, Client Admin, COMIM Admin). */
export default function Home() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [role, setRole] = useState<Role>('student')
  const demo = (r: Role) => demoUsers.find((u) => u.id === loginProfiles.find((p) => p.role === r)?.userId)
  const [username, setUsername] = useState(demo('student')?.login ?? '')
  const [password, setPassword] = useState(demo('student')?.password ?? '')
  const [error, setError] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  const pickRole = (r: Role) => {
    setRole(r)
    // Selecting a profile pre-fills its demo credentials
    setUsername(demo(r)?.login ?? '')
    setPassword(demo(r)?.password ?? '')
    setError(false)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (login(role, username, password)) navigate(homeFor(role))
    else setError(true)
  }

  return (
    <div className="grid-blueprint-glow flex min-h-screen flex-col text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
        <Logo />
        <LanguageSwitch variant="dark" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">COMIM Training</div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{t('auth.title')}</h1>
          </div>

          <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-navy-900/70 p-6 shadow-xl backdrop-blur" noValidate>
            {error && (
              <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl bg-orange-500/15 px-3 py-2.5 text-sm text-orange-100 ring-1 ring-orange-400/30">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {t('auth.wrongCredentials')}
              </div>
            )}

            <label className="block text-sm font-medium text-slate-300">
              {t('auth.profile')}
              <select value={role} onChange={(e) => pickRole(e.target.value as Role)} className={cn(input, 'appearance-none')}>
                {loginProfiles.map((p) => (
                  <option key={p.role} value={p.role}>
                    {t(`auth.profiles.${p.role}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-300">
              {t('auth.login')}
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError(false)
                }}
                autoComplete="username"
                className={input}
                required
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-300">
              {t('student.password')}
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                autoComplete="current-password"
                className={input}
                required
              />
            </label>

            <Button type="submit" className="mt-6 w-full">
              <LogIn className="h-4 w-4" />
              {t('student.signIn')}
            </Button>

          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link to="/vr" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 font-semibold shadow-lg hover:bg-brand-700">
              <Headphones className="h-4 w-4" />
              {t('home.vrDemo')}
            </Link>
            <button
              type="button"
              onClick={() => {
                resetAllStores()
                setResetDone(true)
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {resetDone ? t('auth.resetDone') : t('auth.resetDemo')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
