import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { mockPracticeSessions } from '@/lib/mockData'
import {
  History,
  MessageSquare,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

export default function PracticeHistoryPage() {
  const sessions = mockPracticeSessions

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Mock Interview History"
        subtitle="Review your past AI interview sessions, question scores, and trajectory over time."
        actions={
          <Link to="/candidate/practice">
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" /> Start New Session
            </Button>
          </Link>
        }
      />

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-surface-900">{session.jobTitle}</h3>
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Completed
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{session.questionsAnswered} of {session.totalQuestions} Questions Evaluated</span>
                </div>
                <p className="text-xs text-surface-600">
                  Evaluated on System Design, State Management (Redux/Context), Mentorship behavioral scenarios, and Web Performance.
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-surface-100">
                <div className="text-center">
                  <ScoreRing score={session.overallScore || 0} size="md" />
                  <span className="text-[10px] text-surface-400 uppercase font-semibold block mt-1">Average Score</span>
                </div>
                <Link to="/candidate/practice">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    Review Responses <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {sessions.length === 0 && (
          <Card className="p-12 text-center text-surface-400">
            <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No practice sessions recorded yet. Start your first AI mock interview!</p>
          </Card>
        )}
      </div>
    </div>
  )
}
