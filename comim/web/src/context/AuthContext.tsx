import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { demoUsers, type Role, type User } from '@/data/mock'
import { createStore } from '@/lib/store'

const authStore = createStore<string | null>('auth-user', () => null)

interface AuthState {
  user: User | null
  /** Checks the credentials for the selected profile. Returns false on a wrong login/password. */
  login: (role: Role, login: string, password: string) => boolean
  /** Headset sign-in with the student's personal code / QR */
  loginCode: (code: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const userId = authStore.use()
  const user = demoUsers.find((u) => u.id === userId) ?? null

  const value = useMemo<AuthState>(
    () => ({
      user,
      login: (role, login, password) => {
        const id = login.trim().toLowerCase()
        const found = demoUsers.find(
          (u) => u.role === role && (u.login === id || u.email.toLowerCase() === id) && u.password === password,
        )
        if (!found) return false
        authStore.set(found.id)
        return true
      },
      loginCode: (code) => {
        const found = demoUsers.find((u) => u.role === 'student' && u.vrCode === code.trim())
        if (!found) return false
        authStore.set(found.id)
        return true
      },
      logout: () => authStore.set(null),
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function homeFor(role?: Role) {
  if (role === 'teacher') return '/teacher'
  if (role === 'admin') return '/admin/users'
  if (role === 'platform') return '/platform'
  return '/student'
}

/** Route guard — only signed-in users with an allowed role can open the page. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to={location.pathname.startsWith('/vr') ? '/vr' : '/'} replace state={{ from: location.pathname }} />
  // Teachers may open student modules only in Lesson Preview mode
  const preview = new URLSearchParams(location.search).get('preview') === '1'
  const allowed = roles.includes(user.role) || (preview && user.role === 'teacher' && roles.includes('student'))
  if (!allowed) return <Navigate to={homeFor(user.role)} replace />
  return <>{children}</>
}
