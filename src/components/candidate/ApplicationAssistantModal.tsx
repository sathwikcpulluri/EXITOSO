import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { api, type ApplicationStrategyResponse } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Sparkles,
  Building,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ExternalLink,
  Bookmark,
  X,
  RefreshCw,
  Award,
  ArrowRight,
  HelpCircle,
} from 'lucide-react'

export interface JobTarget {
  id: string
  title: string
  companyName: string
  description: string
  requiredSkills: string[]
  preferredSkills?: string[]
  experienceYears?: number
  location?: string
  workType?: string
  jobUrl?: string
  salaryRange?: string
  matchScore?: number
  hiringCompetitiveness?: number
}

interface ApplicationAssistantModalProps {
  job: JobTarget | null
  isOpen: boolean
  onClose: () => void
  onApplicationSaved?: () => void
}

export function ApplicationAssistantModal({
  job,
  isOpen,
  onClose,
  onApplicationSaved,
}: ApplicationAssistantModalProps) {
  const { user } = useAuthStore()

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [prepareSubTab, setPrepareSubTab] = useState<'resume' | 'coverLetter' | 'questions' | 'improve'>('resume')

  // Candidate profile
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(0)
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateName, setCandidateName] = useState<string>(user?.fullName || '')

  // State
  const [strategy, setStrategy] = useState<ApplicationStrategyResponse | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaved, setIsSaved] = useState<boolean>(false)
  const [savedStatus, setSavedStatus] = useState<string>('Saved')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [coverLetterContent, setCoverLetterContent] = useState<string>('')
  const [actionMessage, setActionMessage] = useState<string>('')

  // 1. Fetch authenticated candidate profile
  useEffect(() => {
    async function loadProfile() {
      if (!isOpen || !job) return
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) return

        const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        const meta = authUser.user_metadata || {}

        const finalName = data?.full_name || meta.full_name || meta.name || user?.fullName || 'Candidate'
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

        // Check if application already exists in database
        const { data: existingApp } = await supabase
          .from('applications')
          .select('id, status')
          .eq('user_id', authUser.id)
          .eq('job_id', job.id)
          .maybeSingle()

        if (existingApp) {
          setIsSaved(true)
          setSavedStatus(existingApp.status || 'Saved')
        } else {
          setIsSaved(false)
          setSavedStatus('Saved')
        }
      } catch (err) {
        console.error('[AppAssistant Profile Load]', err)
      }
    }

    loadProfile()
  }, [isOpen, job?.id, user?.id])

  // 2. Fetch AI Application Strategy & Readiness
  useEffect(() => {
    async function loadStrategy() {
      if (!isOpen || !job) return
      setIsLoading(true)
      setActionMessage('')
      try {
        const res = await api.getApplicationStrategy({
          job_title: job.title,
          company_name: job.companyName,
          job_description: job.description,
          required_skills: job.requiredSkills,
          preferred_skills: job.preferredSkills,
          min_years_experience: job.experienceYears || 3,
          candidate_name: candidateName,
          candidate_skills: candidateSkills,
          candidate_experience_years: candidateExperience,
          candidate_headline: candidateHeadline,
        })
        setStrategy(res)
        setCoverLetterContent(res.cover_letter_draft)
      } catch (err) {
        console.error('[AppAssistant Strategy Error]', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (candidateSkills.length > 0) {
      loadStrategy()
    }
  }, [isOpen, job?.id, candidateSkills.length])

  if (!isOpen || !job) return null

  // Save or Apply Action
  const handleSaveApplication = async (newStatus: 'Saved' | 'Applied' = 'Saved') => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        setActionMessage('Please sign in to save your application.')
        return
      }

      const matchScore = job.matchScore || strategy?.application_readiness_score || 85
      const competitiveness = job.hiringCompetitiveness || matchScore
      const readiness = strategy?.application_readiness_score || matchScore

      const payload = {
        user_id: authUser.id,
        job_id: job.id,
        company_name: job.companyName,
        job_title: job.title,
        job_url: job.jobUrl || null,
        job_description: job.description,
        match_score: matchScore,
        hiring_competitiveness: competitiveness,
        application_readiness: readiness,
        missing_skills: strategy?.missing_requirements || [],
        strengths: strategy?.strong_areas || [],
        resume_version: 'Primary Tailored Profile',
        status: newStatus,
        cover_letter: coverLetterContent,
        applied_at: newStatus === 'Applied' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }

      // Upsert into Supabase applications table
      await supabase.from('applications').upsert([payload], { onConflict: 'user_id,job_id' })

      // Dual-layer metadata sync
      const existingApps = Array.isArray(authUser.user_metadata?.applications)
        ? authUser.user_metadata.applications
        : []
      const filtered = existingApps.filter((a: any) => a.job_id !== job.id)
      await supabase.auth.updateUser({
        data: {
          applications: [{ id: `app-${Date.now()}`, ...payload }, ...filtered],
        },
      })

      setIsSaved(true)
      setSavedStatus(newStatus)
      setActionMessage(
        newStatus === 'Applied'
          ? 'Application status updated to Applied!'
          : 'Application successfully saved to your tracker!'
      )
      if (onApplicationSaved) onApplicationSaved()
    } catch (err) {
      console.error('[Save Application Error]', err)
      setActionMessage('Unable to save application right now.')
    }
  }

  // Open Company URL
  const handleOpenCompanyApplication = () => {
    if (job.jobUrl && job.jobUrl !== '#') {
      window.open(job.jobUrl, '_blank', 'noopener,noreferrer')
      handleSaveApplication('Applied')
    } else {
      handleSaveApplication('Saved')
      setActionMessage('Application saved. No external application link is available.')
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-neutral-900 border border-white/15 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between shrink-0 bg-neutral-900/90">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-orange-400" /> AI Application Assistant
              </span>
              {isSaved && (
                <Badge variant="success">
                  <Check className="h-3 w-3 mr-1 inline" /> {savedStatus.toUpperCase()}
                </Badge>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">{job.title}</h2>
            <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
              <span className="text-neutral-200 font-semibold flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-orange-400" /> {job.companyName}
              </span>
              <span>•</span>
              <span>{job.location || 'Remote'}</span>
              <span>•</span>
              <span className="capitalize">{job.workType || 'Remote'}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Navigation Bar */}
        <div className="px-6 py-2.5 border-b border-white/[0.08] bg-black/40 flex items-center justify-between overflow-x-auto gap-2 text-xs shrink-0">
          {[
            { step: 1, label: '1. Role Overview' },
            { step: 2, label: '2. Readiness' },
            { step: 3, label: '3. AI Strategy' },
            { step: 4, label: '4. Prepare' },
            { step: 5, label: '5. Apply' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveStep(item.step as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeStep === item.step
                  ? 'bg-white/10 text-white border border-white/15 text-rose-400'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action / Success Banner */}
        {actionMessage && (
          <div className="px-6 py-2.5 bg-emerald-950/60 border-b border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-neutral-400 space-y-3">
              <RefreshCw className="h-6 w-6 animate-spin text-rose-500 mx-auto" />
              <p className="text-xs">Analyzing candidate profile and crafting tailored application strategy...</p>
            </div>
          ) : (
            <>
              {/* STEP 1: JOB OVERVIEW */}
              {activeStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Role Description</h3>
                    <p className="text-xs text-neutral-300 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Required Technologies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {job.requiredSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-xs text-neutral-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                      <h4 className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> Preferred & Bonus
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {job.preferredSkills && job.preferredSkills.length > 0 ? (
                          job.preferredSkills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-xs text-neutral-200"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral-500 italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={() => setActiveStep(2)} className="gap-1 text-xs cursor-pointer">
                      Next: Application Readiness <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: APPLICATION READINESS */}
              {activeStep === 2 && strategy && (
                <div className="space-y-6 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-neutral-900 to-orange-950/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider">
                        Application Readiness Index
                      </span>
                      <h3 className="text-xl font-bold text-white">
                        {strategy.application_readiness_score >= 80
                          ? 'Excellent Application Position'
                          : strategy.application_readiness_score >= 60
                          ? 'Competitive Application Position'
                          : 'Developing Application Readiness'}
                      </h3>
                      <p className="text-xs text-neutral-400">
                        Weighted: Skills (30%), Experience (20%), Resume Evidence (20%), Role Align (15%), Preferred (10%), Education (5%)
                      </p>
                    </div>
                    <ScoreRing score={strategy.application_readiness_score} size="md" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ScoreBar label="Skills Match (30%)" score={strategy.readiness_breakdown.skills_match} />
                    <ScoreBar label="Experience Match (20%)" score={strategy.readiness_breakdown.experience_match} />
                    <ScoreBar label="Resume Evidence Quality (20%)" score={strategy.readiness_breakdown.resume_evidence} />
                    <ScoreBar label="Role Alignment (15%)" score={strategy.readiness_breakdown.role_alignment} />
                  </div>

                  {/* Strong Areas & Potential Issues */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Strong Areas
                      </h4>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {strategy.strong_areas.map((sa, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{sa}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" /> Potential Issues
                      </h4>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        {strategy.potential_issues.map((pi, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">⚠️</span>
                            <span>{pi}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveStep(1)} className="text-xs cursor-pointer">
                      Back
                    </Button>
                    <Button size="sm" onClick={() => setActiveStep(3)} className="gap-1 text-xs cursor-pointer">
                      Next: AI Strategy <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: AI APPLICATION STRATEGY */}
              {activeStep === 3 && strategy && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        Recommended Application Approach
                      </h4>
                      <Badge variant="info">{strategy.recommended_action}</Badge>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">{strategy.suggested_application_approach}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs">
                      <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-orange-400" /> Strongest Evidence to Highlight
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {strategy.strongest_evidence.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 text-xs">
                      <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                        <Lightbulb className="h-4 w-4 text-rose-400" /> Actions Before Submitting
                      </h4>
                      <ul className="space-y-1 text-neutral-300">
                        {strategy.before_applying_actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">→</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveStep(2)} className="text-xs cursor-pointer">
                      Back
                    </Button>
                    <Button size="sm" onClick={() => setActiveStep(4)} className="gap-1 text-xs cursor-pointer">
                      Next: Prepare Application <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: PREPARE APPLICATION */}
              {activeStep === 4 && strategy && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2 text-xs">
                    {[
                      { id: 'resume', label: 'Resume Improvements' },
                      { id: 'coverLetter', label: 'Draft Cover Letter' },
                      { id: 'questions', label: 'Interview Answers' },
                      { id: 'improve', label: 'Improve Before Applying' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setPrepareSubTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                          prepareSubTab === tab.id
                            ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(255,0,94,0.4)]'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Sub-Tab 1: Resume Suggestions */}
                  {prepareSubTab === 'resume' && (
                    <div className="space-y-3">
                      {strategy.resume_suggestions.map((sug, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-orange-400 uppercase tracking-wider">{sug.section}</span>
                            <button
                              onClick={() => handleCopy(sug.proposed_improvement, `sug-${i}`)}
                              className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              {copiedText === `sug-${i}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                              {copiedText === `sug-${i}` ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          <p className="text-neutral-400">
                            <strong>Tip:</strong> {sug.current_tip}
                          </p>
                          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white leading-relaxed">
                            {sug.proposed_improvement}
                          </div>
                          <p className="text-[11px] text-neutral-500 italic">{sug.rationale}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Tab 2: Cover Letter */}
                  {prepareSubTab === 'coverLetter' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                          Tailored Cover Letter Draft
                        </span>
                        <button
                          onClick={() => handleCopy(coverLetterContent, 'coverLetter')}
                          className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === 'coverLetter' ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {copiedText === 'coverLetter' ? 'Copied to Clipboard' : 'Copy Cover Letter'}
                        </button>
                      </div>
                      <textarea
                        rows={10}
                        value={coverLetterContent}
                        onChange={(e) => setCoverLetterContent(e.target.value)}
                        className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs leading-relaxed outline-none focus:border-rose-500 resize-none font-mono"
                      />
                    </div>
                  )}

                  {/* Sub-Tab 3: Questions */}
                  {prepareSubTab === 'questions' && (
                    <div className="space-y-3">
                      {strategy.application_questions.map((q, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                          <h4 className="font-bold text-white flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-orange-400" /> {q.question}
                          </h4>
                          <div className="space-y-1.5 pl-4 border-l border-white/10 text-neutral-300">
                            {q.suggested_talking_points.map((tp, j) => (
                              <p key={j}>• {tp}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sub-Tab 4: Improve Before Applying */}
                  {prepareSubTab === 'improve' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-neutral-400">
                        <strong className="text-neutral-200">Simulation: </strong>
                        Review highest-impact improvements before submitting your profile.
                      </div>

                      {strategy.potential_improvements.map((imp, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-white">{imp.title}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold">
                              {imp.potential_impact} Impact (+{imp.potential_score - imp.current_score} pts)
                            </span>
                          </div>
                          <p className="text-neutral-400 leading-relaxed">{imp.rationale}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveStep(3)} className="text-xs cursor-pointer">
                      Back
                    </Button>
                    <Button size="sm" onClick={() => setActiveStep(5)} className="gap-1 text-xs cursor-pointer">
                      Next: Submit / Save Application <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 5: APPLY / SAVE */}
              {activeStep === 5 && (
                <div className="space-y-6 animate-fade-in text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8" />
                  </div>

                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-lg font-bold text-white">Submit or Save Application</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Save this tailored application record or launch the company application page directly.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveApplication('Saved')}
                      className="w-full sm:w-auto gap-2 text-xs cursor-pointer"
                    >
                      <Bookmark className="h-4 w-4" /> Save Application
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleOpenCompanyApplication}
                      className="w-full sm:w-auto gap-2 text-xs shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" /> Open Company Application
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-white/[0.08] text-[11px] text-neutral-500 max-w-sm mx-auto">
                    Note: Our system tracks your application status locally and across your account. If no external link is provided, the application is stored as Saved.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
