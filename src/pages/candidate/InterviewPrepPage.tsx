import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import {
  mockInterviewAssessment,
  mockInterviewQuestions,
} from '@/lib/mockData'
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  Lightbulb,
} from 'lucide-react'

export default function InterviewPrepPage() {
  const assessment = mockInterviewAssessment
  const questions = mockInterviewQuestions

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="AI Interview Preparation"
        subtitle="Role-tailored mock questions, strategic talking points, and competency readiness analysis."
        actions={
          <Link to="/candidate/practice">
            <Button className="gap-2">
              <MessageSquare className="h-4 w-4" /> Start AI Mock Interview
            </Button>
          </Link>
        }
      />

      {/* Top Overview Banner */}
      <Card className="p-6 bg-gradient-to-r from-surface-50 via-white to-primary-50/20 border-surface-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-surface-200">
          <div className="space-y-1">
            <Badge variant="info" className="mb-1">TARGET ROLE</Badge>
            <h2 className="text-2xl font-bold text-surface-900">{assessment.jobTitle}</h2>
            <p className="text-sm text-surface-500">
              AI Preparedness Strategy based on your fit score and identified technical strengths.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-surface-400 uppercase">Readiness Score</p>
              <p className="text-sm font-medium text-primary-600 flex items-center gap-1 justify-end">
                <Sparkles className="h-4 w-4" /> Good preparedness
              </p>
            </div>
            <ScoreRing score={assessment.readinessScore} size="lg" />
          </div>
        </div>

        {/* Readiness Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <ScoreBar label="Technical Domain" score={assessment.technicalScore} />
          <ScoreBar label="Role Understanding" score={assessment.roleUnderstandingScore} />
          <ScoreBar label="Communication & Delivery" score={assessment.communicationScore} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Targeted Questions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary-500" /> Generated Mock Questions ({questions.length})
            </h3>
            <span className="text-xs text-surface-400">Curated from JD & Skill Gaps</span>
          </div>

          {questions.map((q, idx) => (
            <Card key={q.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge variant={q.difficulty === 'hard' ? 'danger' : 'neutral'} size="sm" className="capitalize">
                    {q.difficulty}
                  </Badge>
                  <Badge variant="info" size="sm" className="capitalize">
                    {q.category}
                  </Badge>
                </div>
                <Link to="/candidate/practice">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary-600">
                    Practice This <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <h4 className="font-semibold text-surface-900 text-sm">{q.questionText}</h4>

              <div className="p-3 bg-surface-50 rounded-lg text-xs text-surface-600 space-y-1">
                <span className="font-semibold text-surface-800 flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> What interviewers look for:
                </span>
                <p>{q.whatToLookFor}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Column: AI Recommendations & Talking Points */}
        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-primary-500" /> Key Prep Directives
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {assessment.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-surface-200 bg-surface-50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.priority === 'high' ? 'warning' : 'neutral'} size="sm">
                      {rec.priority} priority
                    </Badge>
                    <span className="text-surface-400">{rec.category}</span>
                  </div>
                  <p className="font-medium text-surface-800 pt-1">{rec.text}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-brand text-white">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Live AI Simulation
            </h4>
            <p className="text-xs text-white/80 mt-2 leading-relaxed">
              Experience dynamic AI-driven follow up questions with automated scoring on clarity, relevance, and technical accuracy.
            </p>
            <Link to="/candidate/practice" className="block mt-4">
              <Button variant="secondary" className="w-full text-xs font-bold text-primary-900 bg-white hover:bg-white/90">
                Launch Practice Room
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
