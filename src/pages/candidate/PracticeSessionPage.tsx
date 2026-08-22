import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import {
  mockInterviewQuestions,
  mockPracticeResponse,
} from '@/lib/mockData'
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  RefreshCw,
  Send,
  Lightbulb,
} from 'lucide-react'

export default function PracticeSessionPage() {
  const questions = mockInterviewQuestions.slice(0, 5)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackResponse, setFeedbackResponse] = useState<typeof mockPracticeResponse | null>(null)

  const currentQ = questions[currentIndex]

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setFeedbackResponse({
        ...mockPracticeResponse,
        questionId: currentQ.id,
        questionText: currentQ.questionText,
        responseText: userAnswer,
      })
    }, 1200)
  }

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setFeedbackResponse(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="AI Interview Practice Room"
        subtitle={`Session in progress • Question ${currentIndex + 1} of ${questions.length}`}
        actions={
          <Link to="/candidate/practice-history">
            <Button variant="outline" size="sm">
              Session History
            </Button>
          </Link>
        }
      />

      {/* Progress Bar */}
      <div className="w-full bg-surface-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">Question {currentIndex + 1}</Badge>
            <Badge variant="neutral" className="capitalize">{currentQ.category}</Badge>
            <Badge variant={currentQ.difficulty === 'hard' ? 'danger' : 'neutral'} className="capitalize">
              {currentQ.difficulty}
            </Badge>
          </div>
          <span className="text-xs text-surface-400">Target Role: Senior Frontend</span>
        </div>

        <h2 className="text-xl font-bold text-surface-900 leading-snug">
          {currentQ.questionText}
        </h2>

        <div className="mt-4 p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-600">
          <span className="font-semibold text-surface-800">Guidance: </span>
          {currentQ.whatToLookFor}
        </div>
      </Card>

      {/* User Response Area */}
      {!feedbackResponse ? (
        <Card className="p-6 space-y-4">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary-500" /> Your Response
          </CardTitle>
          <Textarea
            placeholder="Type your answer here. Mention key architectural principles, trade-offs, and examples from your experience..."
            rows={7}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-surface-400">{userAnswer.length} characters</span>
            <Button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !userAnswer.trim()}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Evaluating with AI...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit & Get AI Feedback
                </>
              )}
            </Button>
          </div>
        </Card>
      ) : (
        /* Instant Feedback View */
        <div className="space-y-6 animate-fade-in">
          <Card className="p-6 bg-gradient-to-r from-surface-50 via-white to-emerald-50/20 border-emerald-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-surface-200">
              <div>
                <Badge variant="success" className="mb-1">AI EVALUATION COMPLETE</Badge>
                <h3 className="text-xl font-bold text-surface-900">Score & Feedback Breakdown</h3>
                <p className="text-xs text-surface-500 mt-0.5">Comprehensive multi-dimensional scoring</p>
              </div>
              <div className="flex items-center gap-3">
                <ScoreRing score={feedbackResponse.overallScore} size="lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <ScoreBar label="Relevance to Question" score={feedbackResponse.relevanceScore} />
              <ScoreBar label="Technical Accuracy" score={feedbackResponse.technicalAccuracyScore} />
              <ScoreBar label="Clarity & Articulation" score={feedbackResponse.clarityScore} />
              <ScoreBar label="Completeness" score={feedbackResponse.completenessScore} />
            </div>
          </Card>

          {/* AI Coaching Critiques */}
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2 text-primary-900">
              <Sparkles className="h-4 w-4 text-primary-500" /> AI Coach Feedback
            </CardTitle>
            <p className="text-sm text-surface-700 bg-surface-50 p-4 rounded-xl leading-relaxed border border-surface-200">
              {feedbackResponse.feedback}
            </p>

            {/* Model suggested answer */}
            <div className="p-4 bg-primary-50/60 rounded-xl border border-primary-100 text-xs text-primary-950 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5 text-primary-800">
                <Lightbulb className="h-4 w-4 text-amber-500" /> Exemplary Model Answer:
              </span>
              <p className="leading-relaxed">{feedbackResponse.suggestedAnswer}</p>
            </div>
          </Card>

          {/* Navigation to next */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() => setFeedbackResponse(null)}
              className="gap-1 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Re-try This Question
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button onClick={handleNextQuestion} className="gap-2">
                Next Question <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/candidate/practice-history">
                <Button className="gap-2">
                  <CheckCircle className="h-4 w-4" /> Finish Session
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
