import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
    <div className="space-y-8 animate-fade-in pb-12 text-white">
      <PageHeader
        title="AI Job Fit Scoring & Predictor"
        subtitle="Compare your profile against any job description to evaluate your match probability, skill alignment, and gap mitigation."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Input & Presets */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-400" /> Paste Job Description
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <textarea
                placeholder="Paste requirements, responsibilities, or entire job description here..."
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none resize-none leading-relaxed"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]"
              >
                <Sparkles className="h-4 w-4" />
                {isAnalyzing ? 'Analyzing Alignment...' : 'Evaluate Fit Score'}
              </Button>
            </div>
          </Card>

          {/* Quick Select Demo Jobs */}
          <Card className="p-6 space-y-3">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Or Select from Active Roles
              </CardTitle>
            </CardHeader>
            <div className="space-y-2 mt-2">
              {mockJobs.slice(0, 4).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => handleSelectJob(job.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    selectedAssessment.jobId === job.id
                      ? 'border-rose-500/50 bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,0,94,0.2)]'
                      : 'border-white/[0.06] hover:bg-white/[0.04] text-neutral-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold truncate">{job.title}</p>
                    <p className="text-neutral-500 mt-0.5">{job.companyName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-bold text-neutral-300 shrink-0">
                    {job.seniority}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle/Right Column: Detailed AI Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Score Overview Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-orange-950/30 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedAssessment.recommendation === 'strong' ? 'success' : 'warning'}>
                    {selectedAssessment.recommendation.toUpperCase()} MATCH
                  </Badge>
                  <span className="text-xs text-neutral-400">AI Confidence: {selectedAssessment.confidence}%</span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">{selectedAssessment.jobTitle}</h2>
                <p className="text-xs text-neutral-400">{selectedAssessment.companyName}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Overall Match</p>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                    <TrendingUp className="h-3.5 w-3.5" /> High Alignment
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
          </div>

          {/* AI Explanation & Factors */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-orange-400" /> AI Fit Synthesis
              </CardTitle>
            </CardHeader>
            <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] text-neutral-300 leading-relaxed">
                {selectedAssessment.explanation}
              </p>

              {/* Factors list */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Evaluation Factors</h4>
                {selectedAssessment.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      factor.direction === 'positive'
                        ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200'
                        : 'border-amber-500/30 bg-amber-950/30 text-amber-200'
                    }`}
                  >
                    {factor.direction === 'positive' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
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
                <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Strong Matches ({selectedAssessment.matchingSkills.length})
                </CardTitle>
              </CardHeader>
              <div className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {selectedAssessment.matchingSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Identified Skill Gaps ({selectedAssessment.skillGaps.length})
                </CardTitle>
              </CardHeader>
              <div className="space-y-2.5 mt-2">
                {selectedAssessment.skillGaps.map((gap, i) => (
                  <div key={i} className="text-xs p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>{gap.skill}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase">
                        {gap.importance} priority
                      </span>
                    </div>
                    {gap.suggestion && <p className="text-neutral-400 mt-1 leading-relaxed">{gap.suggestion}</p>}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Next Action Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/30 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base">Explore Predicted Opportunities</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Browse open positions curated from the 262-role catalog matching this fit profile.
              </p>
            </div>
            <Link to="/candidate/recommendations">
              <Button className="gap-2 shrink-0 shadow-[0_0_20px_rgba(255,0,94,0.35)]">
                View Matched Jobs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
