import type { L } from '@/lib/i18n'
import type { User } from '@/data/mock'
import { demoUsers } from '@/data/mock'
import { catalogue, moduleNames, type ModuleId } from '@/data/content'
import {
  assignmentsStore,
  attemptsStore,
  classesStore,
  establishmentsStore,
  headsetsStore,
  platformAuditStore,
  quizBankStore,
  schoolAuditStore,
  settingsStore,
  studentsStore,
  teachersStore,
} from '@/data/stores'

export type SearchGroup =
  | 'modules'
  | 'components'
  | 'results'
  | 'students'
  | 'classes'
  | 'assignments'
  | 'questions'
  | 'users'
  | 'tracks'
  | 'headsets'
  | 'audit'
  | 'schools'
  | 'admins'
  | 'licences'

export type SearchHit = { group: SearchGroup; label: string | L; sub?: string | L; to: string }

const modulePath: Record<ModuleId, string> = {
  tour: '/student/guided-tour',
  identification: '/student/identification',
  startup: '/student/startup',
  repair: '/student/repair',
  finalQuiz: '/student/final-quiz',
}

/** Index limited to what the signed-in user is allowed to see. */
export function buildSearchIndex(user: User): SearchHit[] {
  const hits: SearchHit[] = []
  const classes = classesStore.get()
  const students = studentsStore.get()

  const modules = () =>
    (Object.keys(moduleNames) as ModuleId[]).forEach((m) =>
      hits.push({ group: 'modules', label: moduleNames[m], to: user.role === 'teacher' ? '/teacher/preview' : modulePath[m] }),
    )
  const components = (base: string) =>
    catalogue.forEach((c) => hits.push({ group: 'components', label: c.name, sub: c.definition, to: `${base}/${c.id}` }))

  if (user.role === 'student') {
    modules()
    components('/student/catalog')
    attemptsStore
      .get()
      .filter((a) => a.studentId === user.studentId)
      .forEach((a) =>
        hits.push({ group: 'results', label: moduleNames[a.module], sub: `${a.score}% · ${a.date.slice(0, 10)}`, to: `/student/attempt/${a.id}` }),
      )
  }

  if (user.role === 'teacher') {
    const mine = classes.filter((c) => c.teacherIds.includes(user.id))
    const ids = mine.map((c) => c.id)
    mine.forEach((c) => hits.push({ group: 'classes', label: c.name, sub: `${c.track} · ${c.schoolYear}`, to: `/teacher/classes/${c.id}` }))
    students
      .filter((s) => ids.includes(s.classId))
      .forEach((s) => hits.push({ group: 'students', label: s.name, sub: classes.find((c) => c.id === s.classId)?.name, to: `/teacher/students/${s.id}` }))
    assignmentsStore
      .get()
      .filter((a) => ids.includes(a.classId))
      .forEach((a) =>
        hits.push({ group: 'assignments', label: moduleNames[a.module], sub: `${classes.find((c) => c.id === a.classId)?.name ?? ''} · ${a.dueDate}`, to: `/teacher/classes/${a.classId}?tab=assignments` }),
      )
    modules()
    components('/student/catalog')
    quizBankStore.get().forEach((q) => hits.push({ group: 'questions', label: q.q, sub: q.topic, to: '/teacher/question-bank' }))
  }

  if (user.role === 'admin') {
    teachersStore.get().forEach((t) => hits.push({ group: 'users', label: t.name, sub: t.email, to: `/admin/users?q=${encodeURIComponent(t.name)}` }))
    students.forEach((s) => hits.push({ group: 'users', label: s.name, sub: s.email, to: `/admin/users?q=${encodeURIComponent(s.name)}` }))
    classes.forEach((c) => hits.push({ group: 'classes', label: c.name, sub: c.schoolYear, to: `/admin/classes?q=${encodeURIComponent(c.name)}` }))
    settingsStore.get().tracks.forEach((tr) => hits.push({ group: 'tracks', label: tr, to: '/admin/settings' }))
    headsetsStore.get().forEach((h) => hits.push({ group: 'headsets', label: h.id, sub: h.location, to: `/admin/headsets?q=${encodeURIComponent(h.id)}` }))
    schoolAuditStore.get().forEach((e) => hits.push({ group: 'audit', label: e.target, sub: e.author, to: `/admin/audit?q=${encodeURIComponent(e.target)}` }))
  }

  if (user.role === 'platform') {
    const ests = establishmentsStore.get()
    ests.forEach((e) => {
      hits.push({ group: 'schools', label: e.name, sub: e.city, to: `/platform/establishments/${e.id}` })
      hits.push({ group: 'admins', label: e.admin, sub: e.name, to: `/platform/establishments/${e.id}` })
      hits.push({ group: 'licences', label: `${e.name} — ${e.plan}`, sub: `${e.seats} seats · ${e.expiry}`, to: `/platform/licenses?q=${encodeURIComponent(e.name)}` })
    })
    ;[...teachersStore.get(), ...students].forEach((u) => hits.push({ group: 'users', label: u.name, sub: ests[0].name, to: '/platform/establishments/imc' }))
    demoUsers.filter((u) => u.role === 'platform').forEach((u) => hits.push({ group: 'users', label: u.name, sub: 'COMIM', to: '/platform/audit' }))
    ;[...platformAuditStore.get(), ...schoolAuditStore.get()].forEach((e) =>
      hits.push({ group: 'audit', label: e.target, sub: e.author, to: `/platform/audit?q=${encodeURIComponent(e.target)}` }),
    )
  }

  return hits
}
