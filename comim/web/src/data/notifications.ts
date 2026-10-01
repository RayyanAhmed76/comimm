import { createStore, uid } from '@/lib/store'
import type { L } from '@/lib/i18n'
import type { Role } from '@/data/mock'
import { DEMO_NOW } from '@/data/mock'
import {
  assignmentsStore,
  attemptsStore,
  establishmentsStore,
  headsetsStore,
  platformAuditStore,
  schoolAuditStore,
  studentsStore,
  classesStore,
  assignedModules,
} from '@/data/stores'
import { moduleNames, PASS_THRESHOLD } from '@/data/content'

export type Notification = { id: string; title: L; body: L; date: string; to: string }

/** "Contact COMIM" requests sent from the Client Admin settings. */
export const contactRequestsStore = createStore<{ id: string; date: string; school: string; message: string }[]>(
  'contact-requests',
  () => [{ id: 'cr-seed', date: '2026-09-16T14:20:00', school: "Lycée Maritime d'Agadir", message: 'Add 20 seats' }],
)

export function sendContactRequest(school: string, message: string) {
  contactRequestsStore.set((prev) => [{ id: uid('cr'), date: new Date().toISOString(), school, message }, ...prev])
}

const daysBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 86400000

export function buildNotifications(role: Role, userId: string, studentId?: string): Notification[] {
  const out: Notification[] = []
  if (role === 'teacher') {
    const classes = classesStore.get().filter((c) => c.teacherIds.includes(userId))
    const classIds = classes.map((c) => c.id)
    const students = studentsStore.get().filter((s) => classIds.includes(s.classId))
    const attempts = attemptsStore.get()
    for (const a of attempts.filter((x) => x.module === 'finalQuiz')) {
      const s = students.find((st) => st.id === a.studentId)
      if (!s) continue
      const passed = (a.adjustedScore ?? a.score) >= PASS_THRESHOLD
      out.push({
        id: `fq-${a.id}`,
        date: a.date,
        to: `/teacher/students/${s.id}`,
        title: passed ? { en: 'Final Quiz passed', fr: 'Quiz final réussi' } : { en: 'Final Quiz failed', fr: 'Quiz final échoué' },
        body: { en: `${s.name} — ${a.adjustedScore ?? a.score}%`, fr: `${s.name} — ${a.adjustedScore ?? a.score} %` },
      })
    }
    const assignments = assignmentsStore.get()
    for (const as of assignments.filter((x) => classIds.includes(x.classId))) {
      if (daysBetween(as.dueDate, DEMO_NOW) < 0) continue
      const targeted = students.filter((s) => s.classId === as.classId && (as.target === 'class' || as.studentIds.includes(s.id)))
      const notDone = targeted.filter((s) => !attempts.some((a) => a.studentId === s.id && a.module === as.module && a.status === 'completed'))
      if (notDone.length === 0) continue
      const cls = classes.find((c) => c.id === as.classId)
      out.push({
        id: `due-${as.id}`,
        date: `${as.dueDate}T18:00:00`,
        to: `/teacher/classes/${as.classId}?tab=assignments`,
        title: { en: 'Assignment due — not done', fr: 'Devoir échu — non fait' },
        body: {
          en: `${cls?.name.split(' ')[0]} · ${moduleNames[as.module].en}: ${notDone.length} student(s)`,
          fr: `${cls?.name.split(' ')[0]} · ${moduleNames[as.module].fr} : ${notDone.length} élève(s)`,
        },
      })
    }
    for (const e of schoolAuditStore.get().filter((x) => x.action === 'userCreation' && x.target.startsWith('Student'))) {
      const match = /\(([^)]+)\)/.exec(e.target)?.[1]?.toLowerCase()
      if (match && !classIds.includes(match)) continue
      out.push({
        id: `ns-${e.id}`,
        date: e.date,
        to: match ? `/teacher/classes/${match}` : '/teacher',
        title: { en: 'New student added', fr: 'Nouvel élève ajouté' },
        body: { en: e.target.replace('Student · ', ''), fr: e.target.replace('Student · ', '') },
      })
    }
  }

  if (role === 'admin') {
    for (const h of headsetsStore.get().filter((x) => !x.online && x.paired)) {
      out.push({
        id: `hs-${h.id}-${h.lastSeen}`,
        date: h.lastSeen,
        to: `/admin/headsets?q=${encodeURIComponent(h.id)}`,
        title: { en: 'Headset offline', fr: 'Casque hors ligne' },
        body: { en: `${h.id} · ${h.location}`, fr: `${h.id} · ${h.location}` },
      })
    }
    const est = establishmentsStore.get().find((e) => e.id === 'imc')
    if (est && est.usedSeats / est.seats >= 0.9) {
      out.push({
        id: `seats-imc-${est.seats}`,
        date: DEMO_NOW,
        to: '/admin/settings',
        title: { en: 'Seat quota almost reached', fr: 'Quota de licences presque atteint' },
        body: { en: `${est.usedSeats} / ${est.seats} seats used`, fr: `${est.usedSeats} / ${est.seats} licences utilisées` },
      })
    }
  }

  if (role === 'platform') {
    for (const e of establishmentsStore.get()) {
      const days = daysBetween(DEMO_NOW, e.expiry)
      if (days >= 0 && days <= 30) {
        out.push({
          id: `exp-${e.id}-${e.expiry}`,
          date: DEMO_NOW,
          to: `/platform/licenses?q=${encodeURIComponent(e.name)}`,
          title: { en: 'Licence expiring within 30 days', fr: 'Licence expirant sous 30 jours' },
          body: { en: `${e.name} — ${e.expiry}`, fr: `${e.name} — ${e.expiry}` },
        })
      }
      if (e.usedSeats / e.seats >= 0.9) {
        out.push({
          id: `quota-${e.id}-${e.seats}`,
          date: DEMO_NOW,
          to: `/platform/licenses?q=${encodeURIComponent(e.name)}`,
          title: { en: 'Seat quota ~90 %', fr: 'Quota de licences ~90 %' },
          body: { en: `${e.name} — ${e.usedSeats}/${e.seats}`, fr: `${e.name} — ${e.usedSeats}/${e.seats}` },
        })
      }
    }
    for (const r of contactRequestsStore.get()) {
      out.push({
        id: r.id,
        date: r.date,
        to: '/platform/establishments',
        title: { en: '“Contact COMIM” request', fr: 'Demande « Contacter COMIM »' },
        body: { en: `${r.school} — ${r.message}`, fr: `${r.school} — ${r.message}` },
      })
    }
    for (const a of platformAuditStore.get()) {
      const map: Partial<Record<string, L>> = {
        establishmentSuspension: { en: 'School suspended', fr: 'École suspendue' },
        establishmentReactivation: { en: 'School reactivated', fr: 'École réactivée' },
        establishmentCreation: { en: 'New school created', fr: 'Nouvelle école créée' },
      }
      const title = map[a.action]
      if (!title) continue
      const est = establishmentsStore.get().find((e) => e.id === a.establishmentId)
      out.push({ id: `pa-${a.id}`, date: a.date, to: est ? `/platform/establishments/${est.id}` : '/platform/establishments', title, body: { en: a.target, fr: a.target } })
    }
  }

  if (role === 'student' && studentId) {
    const student = studentsStore.get().find((s) => s.id === studentId)
    if (student) {
      for (const m of assignedModules(assignmentsStore.get(), student)) {
        const as = assignmentsStore.get().find((a) => a.classId === student.classId && a.module === m)
        if (!as) continue
        out.push({
          id: `as-${as.id}`,
          date: `${as.dueDate}T08:00:00`,
          to: '/student',
          title: { en: 'Exercise assigned', fr: 'Exercice assigné' },
          body: { en: `${moduleNames[m].en} — due ${as.dueDate}`, fr: `${moduleNames[m].fr} — pour le ${as.dueDate}` },
        })
      }
      if (student.finalQuiz === 'Open') {
        out.push({ id: `fq-open-${student.id}`, date: DEMO_NOW, to: '/student', title: { en: 'Final Quiz opened', fr: 'Quiz final ouvert' }, body: { en: 'Your teacher opened the Final Quiz.', fr: 'Votre enseignant a ouvert le quiz final.' } })
      }
    }
  }

  return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 25)
}
