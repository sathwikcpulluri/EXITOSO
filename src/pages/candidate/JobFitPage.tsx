import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Textarea } from '@/components/ui/Textarea'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { mockFitAssessments, mockJobs } from '@/lib/mockData'
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  BookOpen,
} from 'lucide-react'

export default function JobFitPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState(mockFitAssessments[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      setSelectedAssessment(mockFitAssessments[0])
    }, 1200)
  }

  const handleSelectJob = (jobId: string) => {
    const matched = mockFitAssessments.find((a) => a.jobId === jobId) || mockFitAssessments[0]
    setSelectedAssessment(matched)
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="AI Job Fit Scoring"
        subtitle="Compare your profile against any job description to evaluate your match probability, skill alignment, and gap mitigation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Input & Presets */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-primary-500" /> Paste Job Description
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste requirements, responsibilities, or entire job description here..."
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? 'Analyzing Alignment...' : 'Evaluate Fit Score'}
              </Button>
            </div>
          </Card>

          {/* Quick Select Demo Jobs */}
          <Card className="p-6 space-y-3">
            <CardHeader>
              <CardTitle className="text-sm text-surface-500 uppercase tracking-wider">
                Or Select from Active Roles
              </CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {mockJobs.slice(0, 4).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelectJob(job.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    selectedAssessment.jobId === job.id
                      ? 'border-primary-500 bg-primary-50/50 text-primary-900 shadow-sm'
                      : 'border-surface-200 hover:bg-surface-50 text-surface-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold truncate">{job.title}</p>
                    <p className="text-surface-400 mt-0.5">{job.companyName}</p>
                  </div>
                  <Badge variant={job.seniority === 'Lead' ? 'warning' : 'info'} size="sm">
                    {job.seniority}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle/Right Column: Detailed AI Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Score Overview Card */}
          <Card className="p-6 bg-gradient-to-r from-surface-50 via-white to-primary-50/20 border-surface-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-surface-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedAssessment.recommendation === 'strong' ? 'success' : 'warning'}>
                    {selectedAssessment.recommendation.toUpperCase()} MATCH
                  </Badge>
                  <span className="text-xs text-surface-400">AI Confidence: {selectedAssessment.confidence}%</span>
                </div>
                <h2 className="text-2xl font-bold text-surface-900">{selectedAssessment.jobTitle}</h2>
                <p className="text-sm text-surface-600">{selectedAssessment.companyName}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-surface-400 uppercase">Overall Match</p>
                  <p className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-end">
                    <TrendingUp className="h-4 w-4" /> Ready to apply
                  </p>
                </div>
                <ScoreRing score={selectedAssessment.overallScore} size="lg" />
              </div>
            </div>

            {/* Score Bars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              <ScoreBar label="Technical Skill Match" score={selectedAssessment.technicalScore} />
              <ScoreBar label="Experience Depth" score={selectedAssessment.experienceScore} />
              <ScoreBar label="Role Alignment" score={selectedAssessment.roleAlignmentScore} />
              <ScoreBar label="Cultural & Team Fit" score={selectedAssessment.culturalScore} />
            </div>
          </Card>

          {/* AI Explanation & Factors */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary-500" /> AI Fit Synthesis
              </CardTitle>
            </CardHeader>
            <div className="space-y-4 text-sm text-surface-700 leading-relaxed">
              <p className="p-4 bg-surface-50 rounded-xl border border-surface-200/80">
                {selectedAssessment.explanation}
              </p>

              {/* Factors list */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Evaluation Factors</h4>
                {selectedAssessment.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                      factor.direction === 'positive'
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                        : 'border-amber-200 bg-amber-50/50 text-amber-900'
                    }`}
                  >
                    {factor.direction === 'positive' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold">{factor.name}:</span> {factor.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Skill Gaps & Actionable Recommendations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-base text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Strong Matches ({selectedAssessment.matchingSkills.length})
                </CardTitle>
              </CardHeader>
              <div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAssessment.matchingSkills.map((s) => (
                    <Badge key={s} variant="success" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-base text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Identified Skill Gaps ({selectedAssessment.skillGaps.length})
                </CardTitle>
              </CardHeader>
              <div className="space-y-2.5">
                {selectedAssessment.skillGaps.map((gap, i) => (
                  <div key={i} className="text-xs p-2.5 rounded-lg bg-surface-50 border border-surface-200">
                    <div className="flex items-center justify-between font-semibold text-surface-900">
                      <span>{gap.skill}</span>
                      <Badge variant="warning" size="sm">
                        {gap.importance} priority
                      </Badge>
                    </div>
                    {gap.suggestion && <p className="text-surface-500 mt-1">{gap.suggestion}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Next Action Banner */}
          <Card className="bg-primary-50 border-primary-100 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-primary-950">Ready for Interview Prep?</h4>
                <p className="text-xs text-primary-700 mt-0.5">
                  Generate mock questions customized directly to this job description and your skill gaps.
                </p>
              </div>
              <Link to="/candidate/interview-prep">
                <Button className="gap-2 shrink-0">
                  <MessageSquare className="h-4 w-4" /> Prepare with AI <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
