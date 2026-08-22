import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { api, type FitScoreResult } from '@/lib/api'
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Briefcase,
  RefreshCw,
  Lightbulb,
} from 'lucide-react'

// Curated active industry roles for quick testing
const ACTIVE_ROLES = [
  {
    id: 'role-fe',
    title: 'Senior Frontend Engineer',
    companyName: 'Veloce Dynamics',
    seniority: 'Senior',
    description: `We are looking for a Senior Frontend Engineer with 4+ years of experience in JavaScript, TypeScript, React, Next.js, and Tailwind CSS. Experience with REST APIs, Git, and state management is required. AWS and Docker experience is a plus.`,
  },
  {
    id: 'role-fs',
    title: 'Full Stack Software Engineer',
    companyName: 'TechNova Solutions',
    seniority: 'Mid-Senior',
    description: `Seeking a Full Stack Engineer with 3+ years of experience. Required skills: TypeScript, React, Node.js, Express.js, PostgreSQL, MongoDB, Docker, and Git. Experience with AWS cloud deployments and CI/CD pipelines preferred.`,
  },
  {
    id: 'role-ds',
    title: 'Data Scientist & ML Engineer',
    companyName: 'DataPulse Analytics',
    seniority: 'Mid',
    description: `Looking for a Data Scientist with 3+ years of experience in Python, Pandas, Scikit-learn, PyTorch, SQL, and Machine Learning algorithms. Knowledge of data pipelines, statistical modeling, and data visualization required.`,
  },
  {
    id: 'role-sec',
    title: 'Cybersecurity & Cloud Engineer',
    companyName: 'CyberGuard Systems',
    seniority: 'Mid-Senior',
    description: `Seeking a Cybersecurity Engineer with 4+ years of experience. Must have hands-on expertise in Linux, Security, Network Security, SIEM, Incident Response, Docker, and Kubernetes. AWS/GCP cloud security certifications preferred.`,
  },
]

export default function JobFitPage() {
  const { user } = useAuthStore()

  // Real candidate profile loaded from Supabase
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(0)
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateName, setCandidateName] = useState<string>(user?.fullName || '')
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  // Evaluation state
  const [jobDescription, setJobDescription] = useState('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [assessmentResult, setAssessmentResult] = useState<FitScoreResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Fetch authenticated user's profile on mount
  useEffect(() => {
    async function loadCandidateProfile() {
      setIsLoadingProfile(true)
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        const targetId = authUser?.id || user?.id
        if (!targetId) {
          setIsLoadingProfile(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single()

        if (error) {
          console.warn('[JobFit] Profile fetch warning:', error.message)
        } else if (data) {
          if (data.full_name) setCandidateName(data.full_name)
          if (data.headline) setCandidateHeadline(data.headline)
          if (data.experience_years !== undefined) setCandidateExperience(Number(data.experience_years))

          if (Array.isArray(data.skills)) {
            const skillNames = data.skills.map((s: any) => (typeof s === 'string' ? s : s.name))
            setCandidateSkills(skillNames.filter(Boolean))
          }
        }
      } catch (err) {
        console.error('[JobFit] Profile load exception:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadCandidateProfile()
  }, [user?.id])

  // 2. Perform Real AI Fit Evaluation
  const handleAnalyze = async () => {
    setErrorMessage('')

    if (!jobDescription.trim()) {
      setErrorMessage('Please enter a job description to evaluate.')
      return
    }

    if (candidateSkills.length === 0) {
      setErrorMessage('Please upload a resume or add skills in your Profile before evaluating job fit.')
      return
    }

    setIsAnalyzing(true)

    try {
      const result = await api.evaluateFit(
        candidateSkills,
        candidateExperience,
        selectedRoleId || undefined,
        jobDescription.trim(),
        candidateHeadline,
        candidateName
      )
      setAssessmentResult(result)
    } catch (err: any) {
      console.error('[JobFit Evaluation Error]', err)
      setErrorMessage('Unable to evaluate this job right now. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 3. Handle Active Role Selection
  const handleSelectActiveRole = (role: typeof ACTIVE_ROLES[0]) => {
    setSelectedRoleId(role.id)
    setJobDescription(role.description)
    setErrorMessage('')
  }

  const getMatchBadgeVariant = (rec: string) => {
    switch (rec) {
      case 'excellent':
      case 'strong':
        return 'success'
      case 'good':
        return 'info'
      case 'partial':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white max-w-6xl mx-auto">
      <PageHeader
        title="AI Job Fit Scoring & Predictor"
        subtitle="Compare your profile against any job description to evaluate your match probability, skill alignment, and gap mitigation."
      />

      {/* Profile Overview Bar */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-orange-400" />
          <span>
            Active Profile: <strong className="text-white">{candidateName || 'Candidate'}</strong>
            {candidateHeadline && <span className="text-neutral-400"> ({candidateHeadline})</span>}
          </span>
        </div>
        <div className="flex items-center gap-4 text-neutral-400">
          <span>{candidateExperience} Yrs Experience</span>
          <span>{candidateSkills.length} Verified Skills</span>
          <Link to="/candidate/profile" className="text-rose-400 hover:text-rose-300 underline font-semibold">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Input & Presets */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border-white/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-400" /> Paste Job Description
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <textarea
                placeholder="Paste requirements, responsibilities, or entire job description here..."
                rows={9}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none resize-none leading-relaxed"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isLoadingProfile}
                className="w-full gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Alignment...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Evaluate Fit Score
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Quick Select Roles */}
          <Card className="p-6 space-y-3 border-white/10">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Or Select from Active Roles
              </CardTitle>
            </CardHeader>
            <div className="space-y-2 mt-2">
              {ACTIVE_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectActiveRole(role)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between cursor-pointer ${
                    selectedRoleId === role.id
                      ? 'border-rose-500/50 bg-white/[0.08] text-white shadow-[0_0_20px_rgba(255,0,94,0.2)]'
                      : 'border-white/[0.06] hover:bg-white/[0.04] text-neutral-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold truncate">{role.title}</p>
                    <p className="text-neutral-500 mt-0.5">{role.companyName}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-bold text-neutral-300 shrink-0">
                    {role.seniority}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle/Right Column: Detailed AI Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {assessmentResult ? (
            <>
              {/* Main Score Overview Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-orange-950/30 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={getMatchBadgeVariant(assessmentResult.recommendation)}>
                        {assessmentResult.recommendation.toUpperCase()} MATCH
                      </Badge>
                      <span className="text-xs text-neutral-400">
                        Analysis confidence: Based on available profile data
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">{assessmentResult.job_title}</h2>
                    <p className="text-xs text-neutral-400">{assessmentResult.company_name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Overall Match</p>
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end mt-0.5">
                        <TrendingUp className="h-3.5 w-3.5" /> Calculated Score
                      </p>
                    </div>
                    <ScoreRing score={assessmentResult.overall_score} size="lg" />
                  </div>
                </div>

                {/* Score Bars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ScoreBar label="Technical Skill Match" score={assessmentResult.technical_score} />
                  <ScoreBar label="Experience Depth" score={assessmentResult.experience_score} />
                  <ScoreBar label="Role Alignment" score={assessmentResult.role_alignment_score} />
                  <ScoreBar label="Cultural & Team Fit" score={assessmentResult.cultural_score} />
                </div>
              </div>

              {/* AI Explanation & Factors */}
              <Card className="p-6 space-y-4 border-white/10">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-orange-400" /> AI Fit Synthesis
                  </CardTitle>
                </CardHeader>
                <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  <p className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] text-neutral-300 leading-relaxed">
                    {assessmentResult.explanation}
                  </p>

                  {/* Factors list */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Evaluation Factors</h4>
                    {assessmentResult.factors.map((factor, idx) => (
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
                <Card className="p-6 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Matched Skills ({assessmentResult.matching_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="mt-2">
                    {assessmentResult.matching_skills.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">No direct required skill matches detected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assessmentResult.matching_skills.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Identified Skill Gaps ({assessmentResult.missing_skills.length})
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2.5 mt-2">
                    {assessmentResult.skill_gaps.length === 0 ? (
                      <p className="text-xs text-emerald-400 font-medium">Full competency match! No major gaps detected.</p>
                    ) : (
                      assessmentResult.skill_gaps.map((gap, i) => (
                        <div key={i} className="text-xs p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                          <div className="flex items-center justify-between font-bold text-white">
                            <span>{gap.skill}</span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase">
                              {gap.importance} priority
                            </span>
                          </div>
                          {gap.suggestion && <p className="text-neutral-400 mt-1 leading-relaxed">{gap.suggestion}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              {/* Actionable Recommendations */}
              {assessmentResult.recommendations.length > 0 && (
                <Card className="p-6 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-rose-400">
                      <Lightbulb className="h-4 w-4" /> Next Steps & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2 mt-2">
                    {assessmentResult.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-neutral-300 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 text-[11px] font-bold">
                          {i + 1}
                        </span>
                        <p className="leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="p-12 text-center border-white/10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Target className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-lg font-bold text-white">Ready for Fit Evaluation</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Paste any job description on the left or choose from our active roles to evaluate your candidate profile fit with 10-factor weighted matching.
                </p>
              </div>
            </Card>
          )}

          {/* Next Action Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/30 border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base">Explore Predicted Opportunities</h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Browse open positions curated from the 262-role catalog matching your profile skills.
              </p>
            </div>
            <Link to="/candidate/recommendations">
              <Button className="gap-2 shrink-0 shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer">
                View Matched Jobs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
