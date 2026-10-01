import { Link } from 'react-router-dom'
import { BookOpen, Box, Boxes, ClipboardCheck, Eye, PlaySquare, Search, Wrench } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { useLoc } from '@/lib/i18n'
import { moduleNames } from '@/data/content'

export function LessonPreview() {
  const { t } = useTranslation()
  const loc = useLoc()

  const lessons = [
    { title: loc(moduleNames.tour), description: t('student.guidedTourDesc'), icon: BookOpen, to: '/student/guided-tour?preview=1' },
    { title: t('student.explodedView'), description: t('exploded.desc'), icon: Box, to: '/teacher/preview/exploded' },
    { title: loc(moduleNames.identification), description: t('student.identificationDesc'), icon: Search, to: '/student/identification?preview=1' },
    { title: loc(moduleNames.startup), description: t('student.startupDesc'), icon: PlaySquare, to: '/student/startup?preview=1' },
    { title: loc(moduleNames.repair), description: t('student.repairDesc'), icon: Wrench, to: '/student/repair?preview=1' },
    { title: loc(moduleNames.finalQuiz), description: t('student.finalQuizDesc'), icon: ClipboardCheck, to: '/student/final-quiz?preview=1' },
    { title: t('student.catalog'), description: t('student.catalogDesc'), icon: Boxes, to: '/student/catalog' },
  ]

  return (
    <AppShell breadcrumb={[{ label: t('teacher.lessonPreviewTitle') }]}>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-ink">{t('teacher.lessonPreviewTitle')}</h1>
          <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted">
            <Eye className="h-4 w-4" />
            {t('teacher.lessonPreviewNoScores')}
          </p>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => {
            const Icon = lesson.icon
            return (
              <Link key={lesson.to} to={lesson.to}>
                <Card className="h-full p-5 transition hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-brand-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-bold text-ink">{lesson.title}</h2>
                  <p className="mt-2 text-sm text-muted">{lesson.description}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-brand-600">{t('teacher.openPreview')}</span>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
