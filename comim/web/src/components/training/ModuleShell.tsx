import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Save, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { useLoc } from '@/lib/i18n'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TrainingShell } from '@/components/training/TrainingShell'
import { VrShell, type VrMenuItem } from '@/pages/vr/VrChrome'
import { moduleNames, type ModuleId } from '@/data/content'
import { progressKey, progressStore, recordAttempt, type SavedProgress } from '@/data/stores'
import type { Attempt } from '@/data/mock'

/** Where am I playing this module: Web or VR, student or teacher preview. */
export function useModuleEnv(module: ModuleId) {
  const location = useLocation()
  const { user } = useAuth()
  const device: 'Web' | 'VR' = location.pathname.startsWith('/vr') ? 'VR' : 'Web'
  const preview = new URLSearchParams(location.search).get('preview') === '1' || user?.role === 'teacher'
  const studentId = user?.role === 'student' ? user.studentId : undefined
  const menuPath = device === 'VR' ? '/vr/menu' : preview ? '/teacher/preview' : '/student'
  const all = progressStore.use()
  const saved: SavedProgress | undefined = studentId ? all[progressKey(studentId, module)] : undefined
  const startedAt = useRef(Date.now())
  const elapsed = () => Math.round((Date.now() - startedAt.current) / 1000) + (saved?.elapsedSec ?? 0)
  const retryPath = location.pathname + (preview ? '?preview=1' : '')

  const save = (state: Record<string, unknown>) => {
    if (!studentId || preview) return
    progressStore.set((p) => ({ ...p, [progressKey(studentId, module)]: { module, savedAt: new Date().toISOString(), elapsedSec: elapsed(), device, state } }))
  }
  const clearSaved = () => {
    if (!studentId) return
    progressStore.set((p) => {
      const next = { ...p }
      delete next[progressKey(studentId, module)]
      return next
    })
  }
  /** Records the attempt (never in preview). */
  const record = (a: Omit<Attempt, 'id' | 'studentId' | 'module' | 'date' | 'device' | 'durationSec'>) => {
    clearSaved()
    if (!studentId || preview) return null
    return recordAttempt({ ...a, studentId, module, date: new Date().toISOString(), device, durationSec: elapsed() })
  }

  return { module, device, preview, studentId, menuPath, retryPath, saved, save, clearSaved, record, elapsed }
}

export type ModuleEnv = ReturnType<typeof useModuleEnv>

/**
 * Exit choice: "Exit and save" / "Exit without saving" (attempt recorded either way),
 * or the irreversible Final Quiz warning.
 */
export function ExitDialog({
  open,
  onClose,
  kind,
  onSave,
  onDiscard,
  dark,
}: {
  open: boolean
  onClose: () => void
  kind: 'exercise' | 'tour' | 'quiz' | 'preview'
  onSave?: () => void
  onDiscard: () => void
  dark?: boolean
}) {
  const { t } = useTranslation()
  if (kind === 'quiz') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        dark={dark}
        size="sm"
        title={t('ex.quitQuizTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('ex.continueQuiz')}
            </Button>
            <Button variant="danger" onClick={onDiscard}>
              <LogOut className="h-4 w-4" />
              {t('ex.quitQuiz')}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed">{t('ex.quitQuizWarning')}</p>
      </Modal>
    )
  }
  if (kind === 'preview') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        dark={dark}
        size="sm"
        title={t('ex.exitPreviewTitle')}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button onClick={onDiscard}>{t('preview.back')}</Button>
          </>
        }
      >
        <p className="text-sm">{t('preview.banner')}</p>
      </Modal>
    )
  }
  return (
    <Modal open={open} onClose={onClose} dark={dark} size="sm" title={t('ex.exitTitle')} subtitle={t(kind === 'tour' ? 'ex.exitTourSubtitle' : 'ex.exitSubtitle')}>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onSave}
          className="flex w-full items-start gap-3 rounded-2xl border border-brand-500/40 bg-sky-50 px-4 py-3 text-left text-ink hover:bg-sky-100"
        >
          <Save className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <span>
            <span className="block font-semibold">{t('ex.exitSave')}</span>
            <span className="block text-sm text-muted">{t(kind === 'tour' ? 'ex.exitSaveTourHint' : 'ex.exitSaveHint')}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="flex w-full items-start gap-3 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 text-left text-ink hover:bg-orange-100"
        >
          <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-warning-600" />
          <span>
            <span className="block font-semibold">{t('ex.exitNoSave')}</span>
            <span className="block text-sm text-muted">{t(kind === 'tour' ? 'ex.exitNoSaveTourHint' : 'ex.exitNoSaveHint')}</span>
          </span>
        </button>
        <button type="button" onClick={onClose} className="w-full rounded-xl px-4 py-2 text-sm font-semibold text-muted hover:bg-slate-100">
          {t('ex.keepGoing')}
        </button>
      </div>
    </Modal>
  )
}

/**
 * Chrome for a module (Web or VR). When `exit` is set the Exit button is shown and the
 * logo click triggers the same Exit choice.
 */
export function ModuleShell({
  env,
  children,
  exit,
  vrHints,
  vrMenuItems,
  dark = true,
}: {
  env: ModuleEnv
  children: React.ReactNode
  exit?: { kind: 'exercise' | 'tour' | 'quiz'; onSave?: () => void; onDiscard: () => void } | null
  vrHints?: string[]
  vrMenuItems?: VrMenuItem[]
  dark?: boolean
}) {
  const { t } = useTranslation()
  const loc = useLoc()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const title = loc(moduleNames[env.module])
  const kind = env.preview ? 'preview' : exit?.kind ?? 'exercise'
  const guard = exit ? () => setOpen(true) : undefined

  const dialog = exit && (
    <ExitDialog
      open={open}
      onClose={() => setOpen(false)}
      kind={kind}
      dark={env.device === 'VR'}
      onSave={() => {
        setOpen(false)
        exit.onSave?.()
        navigate(env.menuPath)
      }}
      onDiscard={() => {
        setOpen(false)
        if (!env.preview) exit.onDiscard()
        navigate(env.menuPath)
      }}
    />
  )

  if (env.device === 'VR') {
    return (
      <VrShell badge={title} hints={vrHints} menuItems={vrMenuItems} onLogoClick={guard} onExit={guard}>
        {children}
        {dialog}
      </VrShell>
    )
  }

  const menuLabel = env.preview ? t('nav.lessonPreview') : t('student.courseMenu')
  return (
    <TrainingShell
      dark={dark}
      preview={env.preview}
      onLogoClick={guard}
      crumbs={[{ label: menuLabel, to: env.menuPath, onClick: guard }, { label: title }]}
      actions={
        exit ? (
          <Button variant="dark" className="rounded-full px-3 py-1.5 text-xs" onClick={() => setOpen(true)}>
            <LogOut className="h-3.5 w-3.5" />
            {t('ex.exit')}
          </Button>
        ) : null
      }
    >
      {children}
      {dialog}
    </TrainingShell>
  )
}
