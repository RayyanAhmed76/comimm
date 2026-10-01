import { createStore, uid } from '@/lib/store'
import {
  assignmentsSeed,
  attemptsSeed,
  classesSeed,
  defaultWeights,
  establishmentsSeed,
  headsetsSeed,
  platformAuditSeed,
  schoolAuditSeed,
  SCHOOL_NAME,
  studentsSeed,
  teachers as teachersSeed,
  TRACKS,
  type Assignment,
  type Attempt,
  type AuditEntry,
  type ClassRow,
  type Establishment,
  type Headset,
  type Student,
  type Teacher,
} from '@/data/mock'
import {
  comimQuestionBank,
  MIN_SAFETY,
  QUIZ_LENGTH,
  repairProcedure,
  startupProcedure,
  type ModuleId,
  type QuizQuestion,
} from '@/data/content'

export type ClassWithTeachers = ClassRow & { teacherIds: string[] }

export const classesStore = createStore<ClassWithTeachers[]>('classes', () =>
  classesSeed.map((c) => ({ ...c, teacherIds: teachersSeed.filter((t) => t.classIds.includes(c.id)).map((t) => t.id) })),
)
export const teachersStore = createStore<Teacher[]>('teachers', () => teachersSeed)
export const studentsStore = createStore<Student[]>('students', () => studentsSeed)
export const attemptsStore = createStore<Attempt[]>('attempts', () => attemptsSeed)
export const assignmentsStore = createStore<Assignment[]>('assignments', () => assignmentsSeed)
export const headsetsStore = createStore<Headset[]>('headsets', () => headsetsSeed)
export const schoolAuditStore = createStore<AuditEntry[]>('audit-school', () => schoolAuditSeed)
export const platformAuditStore = createStore<AuditEntry[]>('audit-platform', () => platformAuditSeed)
export const establishmentsStore = createStore<Establishment[]>('establishments', () => establishmentsSeed)

export const rubricStore = createStore('rubric', () => ({
  startup: defaultWeights(startupProcedure.length),
  repair: defaultWeights(repairProcedure.length),
}))

export const quizBankStore = createStore<QuizQuestion[]>('quiz-bank', () => comimQuestionBank)

export type QuizSettings = {
  mode: 'random' | 'fixed'
  fixedIds: string[]
  scope: 'class' | 'students' | 'retry'
  studentIds: string[]
  timeLimit: number
  allowSkip: boolean
}
export const defaultQuizSettings = (): QuizSettings => ({
  mode: 'random',
  fixedIds: comimQuestionBank.slice(0, QUIZ_LENGTH).map((q) => q.id),
  scope: 'class',
  studentIds: [],
  timeLimit: 45,
  allowSkip: false,
})
export const quizSettingsStore = createStore<Record<string, QuizSettings>>('quiz-settings', () => ({}))

export const settingsStore = createStore('settings', () => ({
  name: SCHOOL_NAME,
  contact: 'contact@imc-maritime.ma',
  address: 'Port de Casablanca, Morocco',
  logo: null as string | null,
  delegation: true,
  tracks: TRACKS,
}))

export const notificationsReadStore = createStore<string[]>('notifications-read', () => [])
export const vrOnboardedStore = createStore<string[]>('vr-onboarded', () => [])
export const tourCompletedStore = createStore<string[]>('tour-completed', () => ['s-yb'])

/** Exercise saved with "Exit and save" — one per student & module. */
export type SavedProgress = {
  module: ModuleId
  savedAt: string
  elapsedSec: number
  device: 'Web' | 'VR'
  state: Record<string, unknown>
}
export const progressStore = createStore<Record<string, SavedProgress>>('saved-progress', () => ({}))
export const progressKey = (studentId: string, module: ModuleId) => `${studentId}:${module}`

/* ------------------------------ Helpers ----------------------------- */

export function addSchoolAudit(entry: Omit<AuditEntry, 'id' | 'date' | 'establishmentId' | 'origin'>) {
  schoolAuditStore.set((prev) => [
    { ...entry, id: uid('au'), date: new Date().toISOString(), establishmentId: 'imc', origin: 'School' },
    ...prev,
  ])
}

export function addPlatformAudit(entry: Omit<AuditEntry, 'id' | 'date' | 'origin' | 'profile' | 'screen'> & { screen?: AuditEntry['screen'] }) {
  platformAuditStore.set((prev) => [
    { screen: 'establishments', ...entry, profile: 'platform', id: uid('pa'), date: new Date().toISOString(), origin: 'COMIM' },
    ...prev,
  ])
}

export function recordAttempt(a: Omit<Attempt, 'id'>) {
  const attempt = { ...a, id: uid('a') }
  attemptsStore.set((prev) => [...prev, attempt])
  return attempt
}

export function attemptsFor(all: Attempt[], studentId: string, module?: ModuleId) {
  return all
    .filter((a) => a.studentId === studentId && (!module || a.module === module))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Attempt number within the student's attempts for that module. */
export function attemptNumber(all: Attempt[], attempt: Attempt) {
  return attemptsFor(all, attempt.studentId, attempt.module).findIndex((a) => a.id === attempt.id) + 1
}

export function effectiveScore(a: Attempt) {
  return a.adjustedScore ?? a.score
}

/** Modules assigned to a student (Final Quiz is opened separately by the teacher). */
export function assignedModules(assignments: Assignment[], student: Student) {
  const mods = assignments
    .filter((a) => a.classId === student.classId && (a.target === 'class' || a.studentIds.includes(student.id)))
    .map((a) => a.module)
  return Array.from(new Set(mods))
}

/**
 * Progress rule (shown in the (i) tooltips):
 * assigned modules with ≥ 1 completed attempt ÷ assigned modules.
 * Retries and "Abandoned" attempts do not count.
 */
export function studentProgress(student: Student, assignments: Assignment[], attempts: Attempt[]) {
  const mods = assignedModules(assignments, student)
  if (mods.length === 0) return 0
  const done = mods.filter((m) => attempts.some((a) => a.studentId === student.id && a.module === m && a.status === 'completed'))
  return Math.round((done.length / mods.length) * 100)
}

export function classProgress(classId: string, students: Student[], assignments: Assignment[], attempts: Attempt[]) {
  const list = students.filter((s) => s.classId === classId)
  if (list.length === 0) return 0
  return Math.round(list.reduce((sum, s) => sum + studentProgress(s, assignments, attempts), 0) / list.length)
}

export type ClassStatus = 'Starting' | 'In Progress' | 'Advanced'
/** Status rule: Starting < 30 % ≤ In progress < 80 % ≤ Advanced */
export function classStatus(progress: number): ClassStatus {
  if (progress >= 80) return 'Advanced'
  if (progress >= 30) return 'In Progress'
  return 'Starting'
}

export function quizSettingsFor(all: Record<string, QuizSettings>, classId: string) {
  return all[classId] ?? defaultQuizSettings()
}

/** Draws the 20 questions of a quiz from the question bank, guaranteeing ≥ 5 Safety questions. */
export function drawQuiz(bank: QuizQuestion[], settings: QuizSettings): QuizQuestion[] {
  if (settings.mode === 'fixed') {
    const picked = settings.fixedIds.map((id) => bank.find((q) => q.id === id)).filter(Boolean) as QuizQuestion[]
    if (picked.length >= QUIZ_LENGTH) return picked.slice(0, QUIZ_LENGTH)
  }
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)
  const safety = shuffle(bank.filter((q) => q.topic === 'Safety'))
  const others = shuffle(bank.filter((q) => q.topic !== 'Safety'))
  const firstSafety = safety.slice(0, MIN_SAFETY)
  const rest = shuffle([...safety.slice(MIN_SAFETY), ...others]).slice(0, QUIZ_LENGTH - firstSafety.length)
  return shuffle([...firstSafety, ...rest])
}
