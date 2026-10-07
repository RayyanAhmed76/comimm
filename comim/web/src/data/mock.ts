import type { L } from '@/lib/i18n'
import {
  identificationQuestions,
  repairProcedure,
  startupProcedure,
  comimQuestionBank,
  type ModuleId,
  type PartId,
} from '@/data/content'

export type Role = 'teacher' | 'admin' | 'platform' | 'student'

export interface User {
  id: string
  firstName: string
  lastName: string
  name: string
  email: string
  /** Demo credentials (POC) */
  login: string
  password: string
  role: Role
  initials: string
  classIds?: string[]
  studentId?: string
  /** Personal code typed (or scanned as QR) to sign in on a VR headset */
  vrCode?: string
}

const person = (first: string, last: string) => ({
  firstName: first,
  lastName: last,
  name: `${first} ${last}`,
  initials: `${first[0]}${last[0]}`.toUpperCase(),
})

export const demoUsers: User[] = [
  { id: 'u-mf', ...person('Mounia', 'Ferhat'), email: 'm.ferhat@imc-maritime.ma', login: 'teacher', password: 'teacher', role: 'teacher', classIds: ['2a', '2b', '3a', '1a-25', '2c-25'] },
  { id: 'u-so', ...person('Souhail', 'Ouabi'), email: 's.ouabi@imc-maritime.ma', login: 'admin', password: 'admin', role: 'admin' },
  { id: 'u-ra', ...person('Rania', 'Amrani'), email: 'r.amrani@comim.ma', login: 'comim', password: 'comim', role: 'platform' },
  { id: 'u-yb', ...person('Yassine', 'Bakkali'), email: 'y.bakkali@eleves.imc-maritime.ma', login: 'student', password: 'student', role: 'student', classIds: ['2a'], studentId: 's-yb', vrCode: '2468' },
]

/** Profiles offered on the login page (one per role). */
export const loginProfiles: { role: Role; userId: string }[] = [
  { role: 'student', userId: 'u-yb' },
  { role: 'teacher', userId: 'u-mf' },
  { role: 'admin', userId: 'u-so' },
  { role: 'platform', userId: 'u-ra' },
]

export const SCHOOL_YEARS = ['2026–2027', '2025–2026', '2024–2025']
export const CURRENT_YEAR = SCHOOL_YEARS[0]
export const TRACKS = ['Mechanics', 'Deck Officer', 'Electrotechnics', 'Boilermaking']
export const SCHOOL_NAME = 'Institut Maritime de Casablanca'

/** "Today" for the demo data */
export const DEMO_NOW = '2026-09-17T10:00:00'

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  name: string
  initials: string
  email: string
  classIds: string[]
  /** Deactivated accounts keep their history but can no longer sign in */
  active?: boolean
  lastLogin?: string
}

export const teachers: Teacher[] = [
  { id: 'u-mf', ...person('Mounia', 'Ferhat'), email: 'm.ferhat@imc-maritime.ma', classIds: ['2a', '2b', '3a', '1a-25', '2c-25'], lastLogin: '2026-09-17T08:05:00' },
  { id: 'u-ka', ...person('Karim', 'Alaoui'), email: 'k.alaoui@imc-maritime.ma', classIds: ['3a', '3b'], lastLogin: '2026-09-16T14:30:00' },
  { id: 'u-ls', ...person('Leila', 'Sbai'), email: 'l.sbai@imc-maritime.ma', classIds: [], lastLogin: '2026-09-03T09:00:00' },
]

export interface ClassRow {
  id: string
  name: string
  track: string
  schoolYear: string
  /** Archived / closed at the end of the school year */
  archived?: boolean
}

export const classesSeed: ClassRow[] = [
  { id: '2a', name: '2A — Marine Mechanics', track: 'Mechanics', schoolYear: CURRENT_YEAR },
  { id: '2b', name: '2B — Deck Officer', track: 'Deck Officer', schoolYear: CURRENT_YEAR },
  { id: '3a', name: '3A — Electrotechnics', track: 'Electrotechnics', schoolYear: CURRENT_YEAR },
  { id: '3b', name: '3B — Boilermaking', track: 'Boilermaking', schoolYear: CURRENT_YEAR },
  { id: '1a-25', name: '1A — Marine Mechanics', track: 'Mechanics', schoolYear: '2025–2026' },
  { id: '2c-25', name: '2C — Deck Officer', track: 'Deck Officer', schoolYear: '2025–2026' },
]

export interface Student {
  id: string
  firstName: string
  lastName: string
  name: string
  initials: string
  classId: string
  email: string
  finalQuiz: 'Locked' | 'Open' | 'Completed'
  lastActivity: string
  active?: boolean
}

const roster: Record<string, [string, string, string][]> = {
  '2a': [
    ['s-yb', 'Yassine', 'Bakkali'], ['s-si', 'Salma', 'Idrissi'], ['s-hm', 'Hamza', 'Moutaouakil'], ['s-na', 'Nada', 'Amrani'],
    ['s-kr', 'Karim', 'Raji'], ['s-il', 'Ikram', 'Lahlou'], ['s-ob', 'Omar', 'Benjelloun'], ['s-se', 'Sara', 'El Fassi'],
    ['s-mt', 'Mehdi', 'Tazi'], ['s-ic', 'Imane', 'Chraibi'],
  ],
  '2b': [
    ['s-an', 'Ayoub', 'Naciri'], ['s-hbe', 'Hiba', 'Berrada'], ['s-al', 'Anas', 'Lamrani'], ['s-ka', 'Kenza', 'Alami'],
    ['s-rs', 'Rayan', 'Sefrioui'], ['s-yk', 'Yasmine', 'Kettani'], ['s-io', 'Ilyas', 'Ouazzani'], ['s-mf', 'Meryem', 'Filali'],
  ],
  '3a': [
    ['s-hb', 'Hiba', 'Bensouda'], ['s-hi', 'Hamid', 'Idrissi'], ['s-zc', 'Zineb', 'Cherkaoui'], ['s-at', 'Adam', 'Tahiri'],
    ['s-lb', 'Lina', 'Benali'], ['s-wa', 'Walid', 'Amrani'], ['s-rsq', 'Rim', 'Sqalli'], ['s-bh', 'Badr', 'Haddad'],
  ],
  '3b': [
    ['s-sz', 'Soufiane', 'Zaki'], ['s-am', 'Aya', 'Marzouk'], ['s-nh', 'Nabil', 'Hajji'], ['s-cr', 'Chaimae', 'Rami'],
    ['s-obe', 'Othmane', 'Bennani'], ['s-ds', 'Dounia', 'Saidi'],
  ],
  '1a-25': [['s-yo', 'Youssef', 'Ouali'], ['s-fz', 'Fatima', 'Zahraoui'], ['s-ma', 'Mohamed', 'Alaoui'], ['s-lh', 'Loubna', 'Hilali']],
  '2c-25': [['s-tb', 'Taha', 'Berrada'], ['s-ne', 'Nour', 'El Amrani'], ['s-ib', 'Ilham', 'Bouzid']],
}

const quizState: Record<string, Student['finalQuiz']> = {
  's-yb': 'Open', 's-si': 'Completed', 's-na': 'Open', 's-il': 'Completed', 's-hb': 'Open', 's-hi': 'Completed', 's-zc': 'Completed',
}

let seed = 7
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}

export const studentsSeed: Student[] = Object.entries(roster).flatMap(([classId, list]) =>
  list.map(([id, first, last]) => ({
    id,
    ...person(first, last),
    classId,
    email: `${first[0].toLowerCase()}.${last.toLowerCase().replace(/\s+/g, '')}@eleves.imc-maritime.ma`,
    finalQuiz: quizState[id] ?? (classId.endsWith('-25') ? 'Completed' : 'Locked'),
    lastActivity: classId.endsWith('-25') ? '2026-06-12T10:00:00' : `2026-09-${String(8 + Math.floor(rand() * 10)).padStart(2, '0')}T${String(8 + Math.floor(rand() * 9)).padStart(2, '0')}:15:00`,
  })),
)

/* ----------------------------- Attempts ----------------------------- */

export interface AttemptItem {
  label: L
  given?: L
  expected?: L
  correct: boolean
  explanation?: L
  kind?: 'name' | 'function' | 'diagnosis'
  part?: PartId
  errors?: number
}

export interface Attempt {
  id: string
  studentId: string
  module: ModuleId
  date: string
  device: 'Web' | 'VR'
  durationSec: number
  correct: number
  total: number
  score: number
  status: 'completed' | 'abandoned'
  items: AttemptItem[]
  adjustedScore?: number
}

function idItems(pattern: boolean[]): AttemptItem[] {
  return identificationQuestions.map((iq, i) => {
    const ok = pattern[i] ?? true
    const wrongIndex = (iq.correct + 1) % iq.options.length
    return {
      label: iq.question,
      kind: iq.kind,
      part: iq.part,
      given: iq.options[ok ? iq.correct : wrongIndex],
      expected: iq.options[iq.correct],
      correct: ok,
      explanation: iq.explanation,
    }
  })
}

function procItems(module: 'startup' | 'repair', pattern: boolean[]): AttemptItem[] {
  const steps = module === 'startup' ? startupProcedure : repairProcedure
  return steps.map((s, i) => {
    const ok = pattern[i] ?? true
    return { label: s.label, part: s.target, correct: ok, errors: ok ? 0 : 2, explanation: ok ? s.why : s.wrong }
  })
}

function quizItems(pattern: boolean[]): AttemptItem[] {
  return comimQuestionBank.slice(0, pattern.length).map((qq, i) => {
    const ok = pattern[i]
    const wrong = qq.options.findIndex((_, idx) => !qq.correct.includes(idx))
    return {
      label: qq.q,
      given: ok ? join(qq.correct.map((c) => qq.options[c])) : qq.options[wrong],
      expected: join(qq.correct.map((c) => qq.options[c])),
      correct: ok,
      explanation: qq.explanation,
      part: qq.media?.kind === 'part' ? qq.media.part : undefined,
    }
  })
}

const join = (ls: L[]): L => ({ en: ls.map((l) => l.en).join(' + '), fr: ls.map((l) => l.fr).join(' + ') })

function makeAttempt(
  id: string,
  studentId: string,
  module: ModuleId,
  date: string,
  device: 'Web' | 'VR',
  durationSec: number,
  pattern: boolean[],
  status: 'completed' | 'abandoned' = 'completed',
): Attempt {
  const items =
    module === 'identification'
      ? idItems(pattern)
      : module === 'startup' || module === 'repair'
        ? procItems(module, pattern)
        : module === 'finalQuiz'
          ? quizItems(pattern)
          : []
  const full = items.length
  // An abandoned attempt only contains the steps actually done
  const done = status === 'abandoned' ? items.slice(0, pattern.length) : items
  const total = module === 'tour' ? 1 : full
  const correct = module === 'tour' ? 1 : done.filter((it) => it.correct).length
  return { id, studentId, module, date, device, durationSec, correct, total, score: Math.round((correct / total) * 100), status, items: done }
}

const P = (s: string) => s.split('').map((c) => c === '1')

const yassine: Attempt[] = [
  makeAttempt('a-yb-t1', 's-yb', 'tour', '2026-09-04T09:00:00', 'Web', 410, [true]),
  makeAttempt('a-yb-i1', 's-yb', 'identification', '2026-09-10T09:14:00', 'Web', 384, P('10110101')),
  makeAttempt('a-yb-i2', 's-yb', 'identification', '2026-09-10T09:41:00', 'VR', 352, P('11011101')),
  makeAttempt('a-yb-s1', 's-yb', 'startup', '2026-09-12T10:02:00', 'Web', 742, P('1101011011010')),
  makeAttempt('a-yb-s2', 's-yb', 'startup', '2026-09-14T11:20:00', 'VR', 655, P('1111101101110')),
  makeAttempt('a-yb-s3', 's-yb', 'startup', '2026-09-16T09:05:00', 'Web', 590, P('1111111111101')),
  makeAttempt('a-yb-r1', 's-yb', 'repair', '2026-09-15T14:12:00', 'Web', 812, P('1101110110')),
  makeAttempt('a-yb-r2', 's-yb', 'repair', '2026-09-16T15:30:00', 'Web', 205, P('1110'), 'abandoned'),
  makeAttempt('a-yb-q1', 's-yb', 'finalQuiz', '2026-09-15T16:00:00', 'Web', 1510, P('11011110111101111011')),
]

function generatedAttempts(): Attempt[] {
  const out: Attempt[] = []
  const mods: ModuleId[] = ['tour', 'identification', 'startup', 'repair']
  for (const s of studentsSeed) {
    if (s.id === 's-yb') continue
    const level = rand()
    const reached = Math.round(level * mods.length)
    mods.slice(0, Math.max(1, reached)).forEach((m, mi) => {
      const len = m === 'identification' ? 8 : m === 'startup' ? 13 : m === 'repair' ? 10 : 1
      const pattern = Array.from({ length: len }, () => rand() < 0.55 + level * 0.4)
      const day = s.classId.endsWith('-25') ? `2026-0${3 + mi}-1${mi}` : `2026-09-0${2 + mi * 2}`
      out.push(makeAttempt(`a-${s.id}-${m}`, s.id, m, `${day}T10:${String(10 + mi * 7).padStart(2, '0')}:00`, rand() > 0.6 ? 'VR' : 'Web', 300 + Math.floor(rand() * 600), pattern))
    })
    if (s.finalQuiz === 'Completed') {
      out.push(makeAttempt(`a-${s.id}-fq`, s.id, 'finalQuiz', '2026-09-15T15:00:00', 'Web', 1400, Array.from({ length: 20 }, () => rand() < 0.78)))
    }
  }
  return out
}

export const attemptsSeed: Attempt[] = [...yassine, ...generatedAttempts()]

/* ---------------------------- Assignments --------------------------- */

export interface Assignment {
  id: string
  classId: string
  module: Exclude<ModuleId, 'finalQuiz'>
  target: 'class' | 'students'
  studentIds: string[]
  dueDate: string
}

export const assignmentsSeed: Assignment[] = [
  { id: 'as1', classId: '2a', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-09-05' },
  { id: 'as2', classId: '2a', module: 'identification', target: 'class', studentIds: [], dueDate: '2026-09-08' },
  { id: 'as3', classId: '2a', module: 'startup', target: 'class', studentIds: [], dueDate: '2026-09-12' },
  { id: 'as4', classId: '2a', module: 'repair', target: 'students', studentIds: ['s-yb', 's-si', 's-hm', 's-kr'], dueDate: '2026-09-22' },
  { id: 'as5', classId: '2b', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-09-06' },
  { id: 'as6', classId: '2b', module: 'identification', target: 'class', studentIds: [], dueDate: '2026-09-10' },
  { id: 'as7', classId: '2b', module: 'startup', target: 'class', studentIds: [], dueDate: '2026-09-15' },
  { id: 'as8', classId: '3a', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-09-04' },
  { id: 'as9', classId: '3a', module: 'identification', target: 'class', studentIds: [], dueDate: '2026-09-07' },
  { id: 'as10', classId: '3a', module: 'startup', target: 'class', studentIds: [], dueDate: '2026-09-11' },
  { id: 'as11', classId: '3a', module: 'repair', target: 'class', studentIds: [], dueDate: '2026-09-18' },
  { id: 'as12', classId: '3b', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-09-09' },
  { id: 'as13', classId: '3b', module: 'identification', target: 'class', studentIds: [], dueDate: '2026-09-19' },
  { id: 'as14', classId: '1a-25', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-03-05' },
  { id: 'as15', classId: '1a-25', module: 'identification', target: 'class', studentIds: [], dueDate: '2026-03-20' },
  { id: 'as16', classId: '2c-25', module: 'tour', target: 'class', studentIds: [], dueDate: '2026-03-05' },
]

/* ----------------------------- Headsets ----------------------------- */

export interface Headset {
  id: string
  classIds: string[]
  online: boolean
  lastSeen: string
  location: string
  signInCode: string
  paired: boolean
  currentStudent?: string
  history: { date: string; event: L }[]
}

export const headsetsSeed: Headset[] = [
  { id: '#A-01', classIds: ['2a'], online: true, lastSeen: '2026-09-17T09:12:00', location: 'VR Room · Station 1', signInCode: '4821', paired: true, history: [{ date: '2026-09-01T08:00:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-02', classIds: ['2a', '2b'], online: true, lastSeen: '2026-09-17T08:47:00', location: 'VR Room · Station 2', signInCode: '7315', paired: true, history: [{ date: '2026-09-01T08:05:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-03', classIds: ['2b'], online: false, lastSeen: '2026-09-16T17:30:00', location: 'VR Room · Station 3', signInCode: '2290', paired: true, history: [{ date: '2026-09-01T08:10:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-04', classIds: ['2a'], online: true, lastSeen: '2026-09-17T09:05:00', location: 'VR Room · Station 4', signInCode: '6604', paired: true, currentStudent: 'Karim Raji', history: [{ date: '2026-09-01T08:15:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-05', classIds: [], online: false, lastSeen: '2026-09-12T11:00:00', location: 'Storage', signInCode: '1187', paired: true, history: [{ date: '2026-09-01T08:20:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-06', classIds: ['3a', '3b'], online: true, lastSeen: '2026-09-17T09:20:00', location: 'Workshop B', signInCode: '9052', paired: true, currentStudent: 'Hiba Bensouda', history: [{ date: '2026-09-02T09:00:00', event: { en: 'Paired', fr: 'Appairé' } }] },
  { id: '#A-07', classIds: ['3b'], online: false, lastSeen: '2026-09-15T16:42:00', location: 'Workshop B', signInCode: '3478', paired: true, history: [{ date: '2026-09-02T09:05:00', event: { en: 'Paired', fr: 'Appairé' } }] },
]

/* ----------------------------- Live view ---------------------------- */

export interface LiveSession {
  id: string
  studentId: string
  studentName: string
  initials: string
  className: string
  exercise: ModuleId
  mode: 'Headset' | 'Web'
  minutes: number
  classId: string
  headsetId?: string
  /** Live metrics */
  step: number
  totalSteps: number
  errors: number
  hints: number
}

export const liveSessions: LiveSession[] = [
  { id: 'ls1', studentId: 's-kr', studentName: 'Karim Raji', initials: 'KR', className: '2A — Marine Mechanics', classId: '2a', exercise: 'startup', mode: 'Headset', headsetId: '#A-04', minutes: 14, step: 7, totalSteps: 13, errors: 3, hints: 1 },
  { id: 'ls2', studentId: 's-na', studentName: 'Nada Amrani', initials: 'NA', className: '2A — Marine Mechanics', classId: '2a', exercise: 'tour', mode: 'Web', minutes: 6, step: 4, totalSteps: 9, errors: 0, hints: 0 },
  { id: 'ls3', studentId: 's-hb', studentName: 'Hiba Bensouda', initials: 'HB', className: '3A — Electrotechnics', classId: '3a', exercise: 'repair', mode: 'Headset', headsetId: '#A-06', minutes: 2, step: 2, totalSteps: 10, errors: 1, hints: 0 },
]

/* ------------------------------- Audit ------------------------------ */

export type AuditAction =
  | 'scoreAdjustment'
  | 'finalQuizOpened'
  | 'quizRetryAllowed'
  | 'userCreation'
  | 'userUpdate'
  | 'userDeactivated'
  | 'userReactivated'
  | 'classCreation'
  | 'classUpdate'
  | 'classChange'
  | 'classArchived'
  | 'classTransferred'
  | 'sessionViewing'
  | 'assignmentCreated'
  | 'assignmentUpdated'
  | 'headsetUpdate'
  | 'headsetUnpaired'
  | 'headsetCodeRegenerated'
  | 'settingsUpdate'
  | 'trackAdded'
  | 'trackRemoved'
  | 'delegationToggled'
  | 'questionCreated'
  | 'questionUpdated'
  | 'questionDuplicated'
  | 'questionDisabled'
  | 'questionEnabled'
  | 'questionDeleted'
  | 'establishmentCreation'
  | 'establishmentSuspension'
  | 'establishmentReactivation'
  | 'licenseChange'
  | 'featureActivation'
  | 'featureDeactivation'
  | 'reportRun'

export type AuditProfile = 'teacher' | 'admin' | 'platform' | 'student'
export type AuditScreen =
  | 'studentProfile'
  | 'classDetail'
  | 'users'
  | 'classes'
  | 'liveView'
  | 'headsets'
  | 'settings'
  | 'questionBank'
  | 'establishments'
  | 'licenses'
  | 'usage'

/**
 * A stored audit value: plain data (a name, a number), a bilingual label, a date, or a
 * CODE translated at display time (`audit.values.<code>`) — never a sentence in one language.
 */
export type AuditVal = string | L | { code: string; n?: number } | { date: string }
/** `field` is a code (`audit.fields.<field>`). */
export interface AuditChange {
  field: string
  before?: AuditVal
  after?: AuditVal
}
export type AuditRefKind = 'student' | 'teacher' | 'class' | 'headset' | 'question' | 'setting' | 'establishment' | 'report'
/** The entity the action applies to — rendered as a link to its page. */
export interface AuditRef {
  kind: AuditRefKind
  id?: string
  label: AuditVal
  sub?: AuditVal
}

export interface AuditEntry {
  id: string
  date: string
  author: string
  profile: AuditProfile
  action: AuditAction
  /** Plain-text target (search, CSV, entries without a structured target) */
  target: string
  ref?: AuditRef
  changes?: AuditChange[]
  screen: AuditScreen
  establishmentId: string
  origin: 'COMIM' | 'School'
  justification?: string
}

const none: AuditVal = { code: 'none' }
const school = { establishmentId: 'imc', origin: 'School' as const }

export const schoolAuditSeed: AuditEntry[] = [
  { id: 'au1', date: '2026-09-17T09:12:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'scoreAdjustment', target: 'Y. Bakkali · Final Quiz: 75% → 80%', ref: { kind: 'student', id: 's-yb', label: 'Yassine Bakkali', sub: { en: 'Final Quiz', fr: 'Quiz final' } }, changes: [{ field: 'score', before: '75 %', after: '80 %' }], screen: 'studentProfile', ...school, justification: 'Question 7 ambiguë en FR — les deux réponses acceptées après revue avec la classe.' },
  { id: 'au2', date: '2026-09-16T16:40:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'finalQuizOpened', target: 'Class 2A · N. Amrani', ref: { kind: 'student', id: 's-na', label: 'Nada Amrani', sub: '2A' }, changes: [{ field: 'quizStatus', before: { code: 'quizNotOpen' }, after: { code: 'quizOpen' } }], screen: 'classDetail', ...school },
  { id: 'au13', date: '2026-09-15T11:05:00', author: 'Souhail Ouabi', profile: 'admin', action: 'userUpdate', target: 'Student · K. Alami (2B)', ref: { kind: 'student', id: 's-ka', label: 'Kenza Alami', sub: { code: 'student' } }, changes: [{ field: 'class', before: '2A', after: '2B' }, { field: 'track', before: { code: 'track.Mechanics' }, after: { code: 'track.Deck Officer' } }], screen: 'users', ...school },
  { id: 'au3', date: '2026-09-15T11:03:00', author: 'Souhail Ouabi', profile: 'admin', action: 'userCreation', target: 'Student · I. Lahlou (2A)', ref: { kind: 'student', id: 's-il', label: 'Ikram Lahlou', sub: { code: 'student' } }, changes: [{ field: 'class', before: none, after: '2A' }], screen: 'users', ...school },
  { id: 'au4', date: '2026-09-14T10:22:00', author: 'Karim Alaoui', profile: 'teacher', action: 'sessionViewing', target: 'Live session · H. Idrissi (3A)', ref: { kind: 'student', id: 's-hi', label: 'Hamid Idrissi', sub: '3A' }, screen: 'liveView', ...school },
  { id: 'au14', date: '2026-09-12T14:30:00', author: 'Souhail Ouabi', profile: 'admin', action: 'headsetUpdate', target: '#A-05 → —', ref: { kind: 'headset', id: '#A-05', label: '#A-05', sub: 'Storage' }, changes: [{ field: 'assignedClasses', before: '2A', after: none }, { field: 'location', before: 'VR Room · Station 5', after: 'Storage' }], screen: 'headsets', ...school },
  { id: 'au5', date: '2026-09-12T08:30:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'assignmentCreated', target: '2A · Repair · 4 students', ref: { kind: 'class', id: '2a', label: '2A', sub: { en: 'Repair', fr: 'Réparation' } }, changes: [{ field: 'target', before: none, after: { code: 'nStudents', n: 4 } }, { field: 'dueDate', before: none, after: { date: '2026-09-22' } }], screen: 'classDetail', ...school },
  { id: 'au15', date: '2026-09-10T10:12:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'questionDisabled', target: 'fq18 · 2A', ref: { kind: 'question', id: 'fq18', label: { en: 'What is the last step of the startup?', fr: 'Quelle est la dernière étape du démarrage ?' }, sub: '2A' }, changes: [{ field: 'status', before: { code: 'active' }, after: { code: 'disabled' } }], screen: 'questionBank', ...school },
  { id: 'au6', date: '2026-09-10T15:00:00', author: 'Souhail Ouabi', profile: 'admin', action: 'headsetUpdate', target: '#A-02 → 2A, 2B', ref: { kind: 'headset', id: '#A-02', label: '#A-02', sub: 'VR Room · Station 2' }, changes: [{ field: 'assignedClasses', before: '2A', after: '2A, 2B' }], screen: 'headsets', ...school },
  { id: 'au7', date: '2026-09-05T10:12:00', author: 'Souhail Ouabi', profile: 'admin', action: 'userCreation', target: 'Student · Y. Bakkali (2A)', ref: { kind: 'student', id: 's-yb', label: 'Yassine Bakkali', sub: { code: 'student' } }, changes: [{ field: 'class', before: none, after: '2A' }], screen: 'users', ...school },
  { id: 'au8', date: '2026-09-03T16:40:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'scoreAdjustment', target: 'N. Amrani · Startup Procedure: 70% → 74%', ref: { kind: 'student', id: 's-na', label: 'Nada Amrani', sub: { en: 'Startup Procedure', fr: 'Procédure de démarrage' } }, changes: [{ field: 'score', before: '70 %', after: '74 %' }], screen: 'studentProfile', ...school, justification: 'Étape 6 validée à l’oral pendant la séance pratique.' },
  { id: 'au16', date: '2026-09-02T09:44:00', author: 'Souhail Ouabi', profile: 'admin', action: 'delegationToggled', target: 'Delegation', ref: { kind: 'setting', label: { code: 'delegation' }, sub: { code: 'settings' } }, changes: [{ field: 'delegation', before: { code: 'disabled' }, after: { code: 'enabled' } }], screen: 'settings', ...school },
  { id: 'au9', date: '2026-09-02T08:55:00', author: 'Souhail Ouabi', profile: 'admin', action: 'classCreation', target: '3B — Boilermaking, 2026–2027', ref: { kind: 'class', id: '3b', label: '3B', sub: '2026–2027' }, changes: [{ field: 'track', before: none, after: { code: 'track.Boilermaking' } }], screen: 'classes', ...school },
  { id: 'au10', date: '2026-09-01T09:30:00', author: 'Souhail Ouabi', profile: 'admin', action: 'trackAdded', target: 'Tracks: + Boilermaking', ref: { kind: 'setting', label: { code: 'tracks' }, sub: { code: 'settings' } }, changes: [{ field: 'track', before: none, after: { code: 'track.Boilermaking' } }], screen: 'settings', ...school },
  { id: 'au11', date: '2026-08-29T14:10:00', author: 'Souhail Ouabi', profile: 'admin', action: 'userCreation', target: 'Teacher · L. Sbai', ref: { kind: 'teacher', id: 'u-ls', label: 'Leila Sbai', sub: { code: 'teacher' } }, screen: 'users', ...school },
  { id: 'au12', date: '2026-06-12T11:00:00', author: 'Mounia Ferhat', profile: 'teacher', action: 'finalQuizOpened', target: 'Class 1A · whole class', ref: { kind: 'class', id: '1a-25', label: '1A', sub: { code: 'wholeClass' } }, changes: [{ field: 'quizStatus', before: { code: 'quizNotOpen' }, after: { code: 'quizOpen' } }], screen: 'classDetail', ...school },
]

const est = (id: string, label: string, sub?: AuditVal): AuditRef => ({ kind: 'establishment', id, label, sub })

export const platformAuditSeed: AuditEntry[] = [
  { id: 'pa1', date: '2026-09-17T08:30:00', author: 'Rania Amrani', profile: 'platform', action: 'establishmentSuspension', target: 'CFA Maritime de Safi', ref: est('cfa', 'CFA Maritime de Safi', 'Safi'), changes: [{ field: 'status', before: { code: 'active' }, after: { code: 'suspended' } }], screen: 'establishments', establishmentId: 'cfa', origin: 'COMIM' },
  { id: 'pa2', date: '2026-09-12T16:45:00', author: 'Rania Amrani', profile: 'platform', action: 'licenseChange', target: "Lycée Maritime d'Agadir — Discovery → Establishment", ref: est('lma', "Lycée Maritime d'Agadir", { code: 'licence' }), changes: [{ field: 'plan', before: 'Discovery', after: 'Establishment' }], screen: 'licenses', establishmentId: 'lma', origin: 'COMIM' },
  { id: 'pa3', date: '2026-09-12T11:20:00', author: 'Fatima Zahra Idrissi', profile: 'admin', action: 'userCreation', target: 'Teacher · K. Tazi', ref: { kind: 'teacher', label: 'Khalid Tazi', sub: { code: 'teacher' } }, screen: 'users', establishmentId: 'lma', origin: 'School' },
  { id: 'pa4', date: '2026-09-10T15:02:00', author: 'Rania Amrani', profile: 'platform', action: 'licenseChange', target: 'Institut Maritime de Casablanca — seats 150 → 180', ref: est('imc', SCHOOL_NAME, { code: 'licence' }), changes: [{ field: 'seats', before: '150', after: '180' }, { field: 'expiry', before: { date: '2026-08-31' }, after: { date: '2027-08-31' } }], screen: 'licenses', establishmentId: 'imc', origin: 'COMIM' },
  { id: 'pa5', date: '2026-09-02T09:44:00', author: 'Youssef Kabbaj', profile: 'platform', action: 'establishmentCreation', target: 'Institut Maritime de Casablanca', ref: est('imc', SCHOOL_NAME, 'Casablanca'), screen: 'establishments', establishmentId: 'imc', origin: 'COMIM' },
  { id: 'pa6', date: '2026-08-28T11:10:00', author: 'Rania Amrani', profile: 'platform', action: 'featureActivation', target: 'Institut Maritime de Casablanca — Exploded View', ref: est('imc', SCHOOL_NAME, { code: 'licence' }), changes: [{ field: 'feature.exploded', before: { code: 'disabled' }, after: { code: 'enabled' } }], screen: 'licenses', establishmentId: 'imc', origin: 'COMIM' },
  { id: 'pa7', date: '2026-08-20T10:00:00', author: 'Rania Amrani', profile: 'platform', action: 'establishmentCreation', target: 'Institut Maritime de Tanger', ref: est('imt', 'Institut Maritime de Tanger', 'Tanger'), screen: 'establishments', establishmentId: 'imt', origin: 'COMIM' },
]

/* --------------------------- Establishments ------------------------- */

export type FeatureId = 'vr' | 'web' | 'exploded' | 'quiz' | 'csv' | 'live'
export const FEATURES: FeatureId[] = ['web', 'vr', 'live', 'exploded', 'quiz', 'csv']

export interface Establishment {
  id: string
  name: string
  city: string
  plan: 'Discovery' | 'Establishment' | 'Custom'
  seats: number
  usedSeats: number
  admin: string
  expiry: string
  status: 'Active' | 'Suspended'
  features: Record<FeatureId, boolean>
}

const allOn: Record<FeatureId, boolean> = { web: true, vr: true, live: true, exploded: true, quiz: true, csv: false }

export const establishmentsSeed: Establishment[] = [
  { id: 'imc', name: SCHOOL_NAME, city: 'Casablanca', plan: 'Establishment', seats: 180, usedSeats: 164, admin: 'Souhail Ouabi', expiry: '2027-08-31', status: 'Active', features: { ...allOn } },
  { id: 'lma', name: "Lycée Maritime d'Agadir", city: 'Agadir', plan: 'Establishment', seats: 120, usedSeats: 98, admin: 'Fatima Zahra Idrissi', expiry: '2027-06-15', status: 'Active', features: { ...allOn } },
  { id: 'imt', name: 'Institut Maritime de Tanger', city: 'Tanger', plan: 'Discovery', seats: 40, usedSeats: 37, admin: 'Anas Bennis', expiry: '2026-10-10', status: 'Active', features: { web: true, vr: false, live: false, exploded: false, quiz: false, csv: false } },
  { id: 'cfa', name: 'CFA Maritime de Safi', city: 'Safi', plan: 'Establishment', seats: 90, usedSeats: 58, admin: 'Nabil Chraibi', expiry: '2027-01-01', status: 'Suspended', features: { ...allOn } },
]

export type Period = 'thisMonth' | 'lastMonth' | 'last90' | 'thisYear'

/**
 * Usage per establishment and period. Safi was suspended on Sep 17: activity
 * stops on that date, so "this month" only shows the first half of September.
 */
export const usageSeed: Record<Period, Record<string, { users: number; sessions: number; exercises: number; passRate: number }>> = {
  thisMonth: {
    imc: { users: 148, sessions: 612, exercises: 1940, passRate: 79 },
    lma: { users: 96, sessions: 410, exercises: 1205, passRate: 74 },
    imt: { users: 34, sessions: 150, exercises: 402, passRate: 71 },
    cfa: { users: 21, sessions: 64, exercises: 188, passRate: 66 },
  },
  lastMonth: {
    imc: { users: 140, sessions: 540, exercises: 1680, passRate: 77 },
    lma: { users: 88, sessions: 320, exercises: 980, passRate: 72 },
    imt: { users: 30, sessions: 120, exercises: 230, passRate: 70 },
    cfa: { users: 40, sessions: 156, exercises: 470, passRate: 68 },
  },
  last90: {
    imc: { users: 162, sessions: 1680, exercises: 5200, passRate: 78 },
    lma: { users: 110, sessions: 1120, exercises: 3100, passRate: 73 },
    imt: { users: 48, sessions: 420, exercises: 990, passRate: 70 },
    cfa: { users: 52, sessions: 380, exercises: 1120, passRate: 67 },
  },
  thisYear: {
    imc: { users: 180, sessions: 3200, exercises: 9800, passRate: 78 },
    lma: { users: 120, sessions: 2100, exercises: 6400, passRate: 74 },
    imt: { users: 55, sessions: 980, exercises: 2900, passRate: 71 },
    cfa: { users: 90, sessions: 660, exercises: 2350, passRate: 66 },
  },
}

/* --------------------------- Rubric defaults ------------------------ */

export function defaultWeights(n: number) {
  const base = Math.floor(100 / n)
  const w = Array.from({ length: n }, () => base)
  for (let i = 0; i < 100 - base * n; i++) w[i] += 1
  return w
}
