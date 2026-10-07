import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { RequireRole } from '@/context/AuthContext'
import type { Role } from '@/data/mock'
import { assignmentsStore } from '@/data/stores'

import Home from '@/pages/Home'

import { MyClasses } from '@/pages/teacher/MyClasses'
import { ClassDetail } from '@/pages/teacher/ClassDetail'
import { StudentProfile } from '@/pages/teacher/StudentProfile'
import { AttemptDetail as TeacherAttemptDetail } from '@/pages/teacher/AttemptDetail'
import { LiveSessions } from '@/pages/teacher/LiveSessions'
import { LiveSessionView } from '@/pages/teacher/LiveSessionView'
import { LessonPreview } from '@/pages/teacher/LessonPreview'
import { QuestionBank } from '@/pages/teacher/QuestionBank'

import { Users } from '@/pages/admin/Users'
import { Classes } from '@/pages/admin/Classes'
import { AuditLog } from '@/pages/admin/AuditLog'
import { Headsets } from '@/pages/admin/Headsets'
import { Settings } from '@/pages/admin/Settings'
import { AdminClassDetail, HeadsetDetail, UserDetail } from '@/pages/admin/Details'

import CourseMenu from '@/pages/student/CourseMenu'
import MyResults from '@/pages/student/MyResults'
import AttemptDetail from '@/pages/student/AttemptDetail'
import Catalog, { ComponentView } from '@/pages/student/Catalog'
import ExplodedView from '@/pages/student/ExplodedView'

import GuidedTourModule from '@/pages/modules/GuidedTourModule'
import IdentificationModule from '@/pages/modules/IdentificationModule'
import ProcedureModule from '@/pages/modules/ProcedureModule'
import FinalQuizModule from '@/pages/modules/FinalQuizModule'

import PlatformOverview from '@/pages/platform/Overview'
import Establishments from '@/pages/platform/Establishments'
import NewEstablishment from '@/pages/platform/NewEstablishment'
import EstablishmentDetail from '@/pages/platform/EstablishmentDetail'
import Licenses from '@/pages/platform/Licenses'
import Usage from '@/pages/platform/Usage'
import PlatformAudit from '@/pages/platform/Audit'

import VrOnboarding from '@/pages/vr/Onboarding'
import VrMenu from '@/pages/vr/Menu'

const g = (roles: Role[], el: React.ReactNode) => <RequireRole roles={roles}>{el}</RequireRole>

function LegacyAssignmentEdit() {
  // Assignments are edited in a pop-up on the class Assignments tab
  const { id } = useParams()
  const a = assignmentsStore.get().find((x) => x.id === id)
  return <Navigate to={a ? `/teacher/classes/${a.classId}?tab=assignments` : '/teacher'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student/sign-in" element={<Navigate to="/" replace />} />

        {/* Teacher */}
        <Route path="/teacher" element={g(['teacher'], <MyClasses />)} />
        <Route path="/teacher/classes/:id" element={g(['teacher'], <ClassDetail />)} />
        <Route path="/teacher/students/:studentId" element={g(['teacher'], <StudentProfile />)} />
        <Route path="/teacher/attempts/:attemptId" element={g(['teacher'], <TeacherAttemptDetail />)} />
        <Route path="/teacher/live" element={g(['teacher'], <LiveSessions />)} />
        <Route path="/teacher/live/:studentId" element={g(['teacher'], <LiveSessionView />)} />
        <Route path="/teacher/preview" element={g(['teacher'], <LessonPreview />)} />
        <Route path="/teacher/preview/exploded" element={g(['teacher'], <ExplodedView />)} />
        <Route path="/teacher/assignments/:id/edit" element={g(['teacher'], <LegacyAssignmentEdit />)} />
        <Route path="/teacher/question-bank" element={g(['teacher'], <QuestionBank />)} />

        {/* Client admin */}
        <Route path="/admin/users" element={g(['admin'], <Users />)} />
        <Route path="/admin/users/:id" element={g(['admin'], <UserDetail />)} />
        <Route path="/admin/users/:id/edit" element={<Navigate to="/admin/users" replace />} />
        <Route path="/admin/classes" element={g(['admin'], <Classes />)} />
        <Route path="/admin/classes/:id" element={g(['admin'], <AdminClassDetail />)} />
        <Route path="/admin/classes/:id/edit" element={<Navigate to="/admin/classes" replace />} />
        <Route path="/admin/questions" element={g(['admin'], <QuestionBank />)} />
        <Route path="/admin/audit" element={g(['admin'], <AuditLog />)} />
        <Route path="/admin/headsets" element={g(['admin'], <Headsets />)} />
        <Route path="/admin/headsets/:id" element={g(['admin'], <HeadsetDetail />)} />
        <Route path="/admin/live/:studentId" element={g(['admin'], <LiveSessionView />)} />
        <Route path="/admin/settings" element={g(['admin'], <Settings />)} />

        {/* Student web — teachers reach these through Lesson Preview (?preview=1) */}
        <Route path="/student" element={g(['student'], <CourseMenu />)} />
        <Route path="/student/guided-tour" element={g(['student'], <GuidedTourModule />)} />
        <Route path="/student/identification" element={g(['student'], <IdentificationModule />)} />
        <Route path="/student/startup" element={g(['student'], <ProcedureModule key="startup" kind="startup" />)} />
        <Route path="/student/repair" element={g(['student'], <ProcedureModule key="repair" kind="repair" />)} />
        <Route path="/student/final-quiz" element={g(['student'], <FinalQuizModule />)} />
        <Route path="/student/results" element={g(['student'], <MyResults />)} />
        <Route path="/student/results/final-quiz" element={<Navigate to="/student/results" replace />} />
        <Route path="/student/attempt/:id" element={g(['student'], <AttemptDetail />)} />
        <Route path="/student/catalog" element={g(['student', 'teacher'], <Catalog />)} />
        <Route path="/student/catalog/:id" element={g(['student', 'teacher'], <ComponentView />)} />
        <Route path="/student/exploded" element={g(['student'], <ExplodedView />)} />

        {/* Platform */}
        <Route path="/platform" element={g(['platform'], <PlatformOverview />)} />
        <Route path="/platform/establishments" element={g(['platform'], <Establishments />)} />
        <Route path="/platform/establishments/new" element={g(['platform'], <NewEstablishment />)} />
        <Route path="/platform/establishments/:id" element={g(['platform'], <EstablishmentDetail />)} />
        <Route path="/platform/licenses" element={g(['platform'], <Licenses />)} />
        <Route path="/platform/usage" element={g(['platform'], <Usage />)} />
        <Route path="/platform/audit" element={g(['platform'], <PlatformAudit />)} />

        {/* VR — sign-in on the headset happens on /vr */}
        <Route path="/vr" element={<VrOnboarding />} />
        <Route path="/vr/menu" element={g(['student'], <VrMenu />)} />
        <Route path="/vr/guided-tour" element={g(['student'], <GuidedTourModule />)} />
        <Route path="/vr/identification" element={g(['student'], <IdentificationModule />)} />
        <Route path="/vr/startup" element={g(['student'], <ProcedureModule key="vr-startup" kind="startup" />)} />
        <Route path="/vr/repair" element={g(['student'], <ProcedureModule key="vr-repair" kind="repair" />)} />
        <Route path="/vr/final-quiz" element={g(['student'], <FinalQuizModule />)} />
        <Route path="/vr/exploded" element={g(['student'], <ExplodedView />)} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
