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
import { api, type HiringProbabilityResult } from '@/lib/api'
import { SkillGapLearningHub } from '@/components/candidate/SkillGapLearningHub'
import {
  Sparkles,
  Building,
  Target,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  Award,
  Layers,
  ShieldCheck,
  Columns3,
} from 'lucide-react'

interface CompareJobItem {
  id: string
  company: string
  title: string
  matchIndex: number
  hiringProbability: number
  topStrength: string
  biggestGap: string
}

export default function HiringProbabilityPage() {
  const { user } = useAuthStore()

  // Form inputs
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('')
  const [preferredSkillsInput, setPreferredSkillsInput] = useState('')
  const [minExperience, setMinExperience] = useState<number>(3)
  const [locationMode, setLocationMode] = useState('Remote')
  const [educationReq, setEducationReq] = useState("Bachelor's Degree")

  // Real candidate profile loaded from Supabase
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(0)
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateName, setCandidateName] = useState<string>(user?.fullName || '')
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  // Execution state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [predictionResult, setPredictionResult] = useState<HiringProbabilityResult | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [savedSuccessMsg, setSavedSuccessMsg] = useState('')

  // Multi-job comparison list
  const [compareList, setCompareList] = useState<CompareJobItem[]>([])
  const [activeTab, setActiveTab] = useState<'predict' | 'compare'>('predict')

  // 1. Fetch authenticated user profile from Supabase on mount
  useEffect(() => {
    async function loadCandidateProfile() {
      setIsLoadingProfile(true)
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          setIsLoadingProfile(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.warn('[HiringPredictor] Profile fetch warning:', error.message)
        }

        const meta = authUser.user_metadata || {}

        const finalName = data?.full_name || meta.full_name || meta.name || user?.fullName || ''
        const finalHeadline = data?.headline || meta.headline || ''
        const finalYears = data?.experience_years !== undefined ? Number(data.experience_years) : (meta.experience_years ?? 0)

        const rawSkills = data?.skills || meta.skills
        const cleanSkills: string[] = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          : []

        setCandidateName(finalName)
        setCandidateHeadline(finalHeadline)
        setCandidateExperience(finalYears)
        setCandidateSkills(cleanSkills)
      } catch (err) {
        console.error('[HiringPredictor] Profile load error:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadCandidateProfile()
  }, [user?.id])

  // "Use My Current Profile" quick action
  const handleUseCurrentProfile = () => {
    if (!jobTitle && candidateHeadline) {
      setJobTitle(candidateHeadline.split('|')[0]?.trim() || candidateHeadline)
    }
  }

  // 2. Perform AI Hiring Probability Prediction
  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMessage('')
    setSavedSuccessMsg('')

    if (!companyName.trim()) {
      setErrorMessage('Please enter the hiring company name.')
      return
    }

    if (!jobTitle.trim()) {
      setErrorMessage('Please enter the target job title.')
      return
    }

    if (!jobDescription.trim()) {
      setErrorMessage('Please enter the job description or role requirements.')
      return
    }

    if (candidateSkills.length === 0) {
      setErrorMessage('Please upload a resume or add at least 3 verified skills in your Profile first.')
      return
    }

    setIsAnalyzing(true)

    try {
      const parsedReqSkills = requiredSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const parsedPrefSkills = preferredSkillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const result = await api.predictHiringProbability({
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_description: jobDescription.trim(),
        required_skills: parsedReqSkills.length > 0 ? parsedReqSkills : undefined,
        preferred_skills: parsedPrefSkills.length > 0 ? parsedPrefSkills : undefined,
        min_years_experience: minExperience,
        location: locationMode,
        education_requirement: educationReq,
        candidate_name: candidateName,
        candidate_skills: candidateSkills,
        candidate_experience_years: candidateExperience,
        candidate_headline: candidateHeadline,
      })

      setPredictionResult(result)

      // Add to comparison list
      const newCompareItem: CompareJobItem = {
        id: `comp-${Date.now()}`,
        company: result.company_name,
        title: result.job_title,
        matchIndex: result.match_index,
        hiringProbability: result.hiring_probability,
        topStrength: result.strengths[0] || 'Strong skill overlap with core requirements',
        biggestGap: result.missing_required_skills[0]?.skill || 'None identified',
      }
      setCompareList((prev) => [newCompareItem, ...prev.filter((p) => p.company !== result.company_name)])

      // 3. Persist prediction to Supabase
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser?.id) {
          const record = {
            user_id: authUser.id,
            job_id: `hiring-${Date.now()}`,
            job_title: result.job_title,
            company: result.company_name,
            match_score: result.match_index,
            prediction_label: result.candidate_strength,
            confidence: result.ai_confidence,
            skill_score: result.scores.technical_skill_match,
            experience_score: result.scores.relevant_experience,
            role_score: result.scores.role_alignment,
            responsibility_score: result.scores.experience_level_match,
            education_score: result.scores.education_certification_match,
            certification_score: 85,
            matched_skills: result.matched_skills,
            missing_skills: result.missing_required_skills.map((m) => m.skill),
            skill_gaps: result.missing_required_skills.map((m) => ({
              skill: m.skill,
              importance: m.importance,
              suggestion: m.recommendation,
            })),
            recommendations: result.recommendations,
            summary: result.ai_explanation,
            created_at: new Date().toISOString(),
          }

          // Save to prediction_history table
          await supabase.from('prediction_history').insert([record])

          // Also save in user_metadata for resilient sync
          const existing = Array.isArray(authUser.user_metadata?.prediction_history)
            ? authUser.user_metadata.prediction_history
            : []
          await supabase.auth.updateUser({
            data: {
              prediction_history: [
                { id: `pred-${Date.now()}`, ...record },
                ...existing.slice(0, 49),
              ],
            },
          })

          setSavedSuccessMsg('Prediction calculated and saved to your history.')
        }
      } catch (saveErr) {
        console.warn('[HiringPredictor Supabase Save]', saveErr)
      }
    } catch (err: any) {
      console.error('[HiringPredictor Error]', err)
      setErrorMessage('AI analysis temporarily unavailable. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStrengthBadgeVariant = (strength: string) => {
    const s = strength.toLowerCase()
    if (s.includes('very strong') || s.includes('strong candidate')) return 'success'
    if (s.includes('competitive')) return 'info'
    if (s.includes('possible')) return 'warning'
    return 'neutral'
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-white max-w-6xl mx-auto">
      <PageHeader
        title="AI Hiring Probability Predictor"
        subtitle="Estimate your true hiring probability and competency alignment for target companies and job applications."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'predict' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('predict')}
              className="cursor-pointer text-xs"
            >
              <Target className="h-4 w-4 mr-1.5" /> Predictor
            </Button>
            <Button
              variant={activeTab === 'compare' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('compare')}
              className="cursor-pointer text-xs"
            >
              <Columns3 className="h-4 w-4 mr-1.5" /> Compare Opportunities ({compareList.length})
            </Button>
          </div>
        }
      />

      {/* Candidate Profile Context Banner */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {isLoadingProfile ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <RefreshCw className="h-4 w-4 animate-spin text-rose-500" />
            <span>Loading authenticated candidate profile...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-400" />
              <span>
                Evaluating Profile: <strong className="text-white">{candidateName || 'Candidate'}</strong>
                {candidateHeadline && <span className="text-neutral-400"> ({candidateHeadline})</span>}
              </span>
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <span className="font-medium text-neutral-300">{candidateExperience} Yrs Experience</span>
              <span className="font-medium text-emerald-400">{candidateSkills.length} Verified Skills</span>
              <Link to="/candidate/profile" className="text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer">
                Edit Profile
              </Link>
            </div>
          </>
        )}
      </div>

      {savedSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2.5 animate-fade-in">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {activeTab === 'predict' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Job & Company Form */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-orange-400" /> Target Opportunity
                </CardTitle>
                <button
                  type="button"
                  onClick={handleUseCurrentProfile}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                >
                  Use My Current Profile
                </button>
              </CardHeader>

              <form onSubmit={handlePredict} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Google, InnovateTech"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Job Description & Requirements *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste the full job description or key responsibilities and required qualifications..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Required Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. React, TypeScript, GraphQL, Node.js"
                    value={requiredSkillsInput}
                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Preferred Skills (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS, Docker, Kubernetes, CI/CD"
                    value={preferredSkillsInput}
                    onChange={(e) => setPreferredSkillsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Min Exp (Yrs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={minExperience}
                      onChange={(e) => setMinExperience(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                      Work Mode
                    </label>
                    <select
                      value={locationMode}
                      onChange={(e) => setLocationMode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Education Requirement
                  </label>
                  <select
                    value={educationReq}
                    onChange={(e) => setEducationReq(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                    <option value="Any / Equivalent Experience">Any / Equivalent Experience</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] cursor-pointer text-xs py-3 mt-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing candidate profile against job requirements...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      Predict Hiring Probability
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Company hiring transparency disclaimer */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-[11px] text-neutral-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-neutral-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> AI Estimation Disclaimer
              </div>
              <p className="leading-relaxed">
                Company-specific internal hiring quotas are proprietary. This prediction is an AI estimate calculated from measurable competency factors and verified profile alignment.
              </p>
            </div>
          </div>

          {/* Middle/Right Column: Full Hiring Probability Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {predictionResult ? (
              <>
                {/* Top Prediction Overview Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-orange-950/30 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStrengthBadgeVariant(predictionResult.candidate_strength)}>
                          {predictionResult.candidate_strength}
                        </Badge>
                        <span className="text-xs text-neutral-400">
                          AI Confidence: <strong>{predictionResult.ai_confidence}%</strong>
                        </span>
                      </div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight">{predictionResult.job_title}</h2>
                      <p className="text-xs text-neutral-300 flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-orange-400" /> {predictionResult.company_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <ScoreRing score={predictionResult.match_index} size="md" />
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">Match Index</span>
                      </div>
                      <div className="text-center">
                        <ScoreRing score={predictionResult.hiring_probability} size="lg" />
                        <span className="text-[10px] text-rose-400 uppercase font-bold block mt-1">Hiring Probability</span>
                      </div>
                    </div>
                  </div>

                  {/* 10-Factor Match Breakdown Bars */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      10-Factor Competency Match Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ScoreBar label="Technical Skills Match (25%)" score={predictionResult.scores.technical_skill_match} />
                      <ScoreBar label="Required Skills Coverage (20%)" score={predictionResult.scores.required_skill_coverage} />
                      <ScoreBar label="Relevant Experience (15%)" score={predictionResult.scores.relevant_experience} />
                      <ScoreBar label="Role Alignment (10%)" score={predictionResult.scores.role_alignment} />
                      <ScoreBar label="Experience Level Match (10%)" score={predictionResult.scores.experience_level_match} />
                      <ScoreBar label="Preferred Skills Match (5%)" score={predictionResult.scores.preferred_skill_match} />
                      <ScoreBar label="Industry / Domain Match (5%)" score={predictionResult.scores.industry_match} />
                      <ScoreBar label="Education & Certification (3%)" score={predictionResult.scores.education_certification_match} />
                      <ScoreBar label="Career Progression (4%)" score={predictionResult.scores.career_progression} />
                      <ScoreBar label="Resume Evidence Quality (3%)" score={predictionResult.scores.resume_evidence_quality} />
                    </div>
                  </div>
                </div>

                {/* Skills Analysis Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Matched Skills */}
                  <Card className="p-6 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Matched Skills ({predictionResult.matched_skills.length})
                      </CardTitle>
                    </CardHeader>
                    <div className="space-y-3 mt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {predictionResult.matched_skills.length > 0 ? (
                          predictionResult.matched_skills.map((s) => (
                            <span
                              key={s}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500 italic">No direct required skill matches found.</span>
                        )}
                      </div>

                      {predictionResult.preferred_skills_matched.length > 0 && (
                        <div className="pt-2 border-t border-white/[0.08]">
                          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                            Bonus Preferred Skills
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {predictionResult.preferred_skills_matched.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[11px] font-medium text-neutral-200"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Missing Required Skills with Recommended Action */}
                  <Card className="p-6 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Missing Required Skills ({predictionResult.missing_required_skills.length})
                      </CardTitle>
                    </CardHeader>
                    <div className="space-y-2 mt-2">
                      {predictionResult.missing_required_skills.length === 0 ? (
                        <p className="text-xs text-emerald-400 font-medium">100% competency match! No required skill gaps.</p>
                      ) : (
                        predictionResult.missing_required_skills.map((m, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
                            <div className="flex items-center justify-between font-bold text-white">
                              <span>{m.skill}</span>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase">
                                {m.importance}
                              </span>
                            </div>
                            <p className="text-neutral-400 mt-1 leading-relaxed">{m.recommendation}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                {/* AI Explanation & Candidate Strengths */}
                <Card className="p-6 space-y-4 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <Award className="h-4 w-4 text-orange-400" /> Why this candidate is a good match
                    </CardTitle>
                  </CardHeader>
                  <div className="space-y-2 text-xs text-neutral-300">
                    {predictionResult.strengths.map((str, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{str}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Potential Concerns & Recommended Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="p-6 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Potential Hiring Concerns
                      </CardTitle>
                    </CardHeader>
                    <div className="space-y-2 mt-2 text-xs text-neutral-300">
                      {predictionResult.concerns.map((con, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/20 leading-relaxed">
                          ⚠️ {con}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold text-rose-400 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" /> Recommended Improvements
                      </CardTitle>
                    </CardHeader>
                    <div className="space-y-2 mt-2 text-xs text-neutral-300">
                      {predictionResult.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* AI Skill Gap Learning Hub */}
                <SkillGapLearningHub
                  missingSkills={predictionResult.missing_required_skills.map((m) => m.skill)}
                  jobTitle={predictionResult.job_title}
                  companyName={predictionResult.company_name}
                  onReevaluate={handlePredict}
                />
              </>
            ) : (
              <Card className="p-12 text-center border-white/10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                  <Target className="h-8 w-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-bold text-white">No Hiring Prediction Calculated Yet</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Enter the company name, target job title, and job description on the left, then click{' '}
                    <strong className="text-neutral-200">Predict Hiring Probability</strong> to evaluate your hiring chances.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Compare Multiple Opportunities Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Columns3 className="h-4 w-4 text-orange-400" /> Evaluated Opportunities Comparison
            </h3>
            <span className="text-xs text-neutral-400 font-semibold">{compareList.length} Opportunities Ranked</span>
          </div>

          {compareList.length === 0 ? (
            <Card className="p-12 text-center border-white/10 space-y-3">
              <Layers className="h-10 w-10 mx-auto opacity-40 text-orange-400" />
              <p className="text-sm font-bold text-neutral-300">No opportunities compared yet.</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Evaluate different companies or job postings in the Predictor tab to automatically rank them side-by-side here.
              </p>
              <Button size="sm" onClick={() => setActiveTab('predict')} className="mt-2 text-xs cursor-pointer">
                Evaluate an Opportunity
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {compareList.map((item, idx) => (
                <Card key={item.id} className="p-6 border-white/10 hover:border-white/20 transition-all space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Rank #{idx + 1}</span>
                      <h4 className="text-base font-extrabold text-white mt-0.5">{item.title}</h4>
                      <p className="text-xs text-neutral-400">{item.company}</p>
                    </div>
                    <ScoreRing score={item.hiringProbability} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs">
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Match Index</span>
                      <span className="font-extrabold text-white">{item.matchIndex}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase font-bold block">Hiring Chance</span>
                      <span className="font-extrabold text-emerald-400">{item.hiringProbability}%</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                        Top Strength:
                      </span>
                      <p className="text-neutral-300 text-[11px] line-clamp-2 leading-relaxed">{item.topStrength}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                        Biggest Gap:
                      </span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">
                        {item.biggestGap === 'None identified' ? 'None (Full match)' : item.biggestGap}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
