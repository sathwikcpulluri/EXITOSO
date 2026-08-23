import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { type ApplicationRecord } from '@/lib/api'
import {
  Target,
  Sparkles,
  Briefcase,
  BrainCircuit,
  Send,
  Upload,
  History,
  ShieldAlert,
  Info,
  Award,
  Compass,
  UserCheck,
  Building,
  Calendar,
} from 'lucide-react'

interface PredictionItem {
  id: string
  job_title: string
  company: string
  match_score: number
  prediction_label: string
  created_at: string
}

export default function CandidateDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Real candidate profile state from Supabase
  const [candidateName, setCandidateName] = useState<string>(user?.fullName || 'Candidate')
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExp, setCandidateExp] = useState<number>(0)
  const [candidateEducation, setCandidateEducation] = useState<string>('')
  const [candidateLocation, setCandidateLocation] = useState<string>('')

  // Real activity data from Supabase
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [recentPredictions, setRecentPredictions] = useState<PredictionItem[]>([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          return
        }

        const meta = authUser.user_metadata || {}

        // 1. Fetch Profile from Supabase
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()

        const finalName = profile?.full_name || meta.full_name || meta.name || user?.fullName || 'Candidate'
        const finalHeadline = profile?.headline || meta.headline || ''
        const finalYears = profile?.experience_years !== undefined ? Number(profile.experience_years) : (meta.experience_years ?? 0)
        const finalEdu = profile?.education || meta.education || ''
        const finalLoc = profile?.location || meta.location || ''

        const rawSkills = profile?.skills || meta.skills
        const cleanSkills: string[] = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          : []

        setCandidateName(finalName)
        setCandidateHeadline(finalHeadline)
        setCandidateExp(finalYears)
        setCandidateEducation(finalEdu)
        setCandidateLocation(finalLoc)
        setCandidateSkills(cleanSkills)

        // 2. Fetch Real Applications from Supabase
        const { data: dbApps } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        const metaApps: ApplicationRecord[] = Array.isArray(meta.applications) ? meta.applications : []
        const combinedApps = [...(Array.isArray(dbApps) ? dbApps : [])]
        for (const metaApp of metaApps) {
          if (!combinedApps.some((c) => c.job_id === metaApp.job_id || c.id === metaApp.id)) {
            combinedApps.push(metaApp)
          }
        }
        setApplications(combinedApps)

        // 3. Fetch Real Prediction History from Supabase
        const { data: dbHistory } = await supabase
          .from('prediction_history')
          .select('id, job_title, company, match_score, prediction_label, created_at')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(4)

        const metaHistory: PredictionItem[] = Array.isArray(meta.prediction_history) ? meta.prediction_history : []
        const combinedHistory = [...(Array.isArray(dbHistory) ? dbHistory : [])]
        for (const m of metaHistory) {
          if (!combinedHistory.some((c) => c.id === m.id)) {
            combinedHistory.push(m)
          }
        }
        combinedHistory.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        setRecentPredictions(combinedHistory.slice(0, 4))
      } catch (err) {
        console.error('[Dashboard Load Error]', err)
      }
    }

    loadDashboardData()
  }, [user?.id])

  // Profile strength score based purely on verified criteria
  const profileStrength = Math.min(
    Math.round(
      (candidateSkills.length >= 5 ? 40 : candidateSkills.length * 8) +
        (candidateHeadline ? 20 : 0) +
        (candidateExp > 0 ? 20 : 0) +
        (candidateEducation ? 10 : 0) +
        (candidateLocation ? 10 : 0)
    ),
    100
  )

  const hasResume = candidateSkills.length > 0
  const hasPredictions = recentPredictions.length > 0
  const hasApps = applications.length > 0
  const latestPrediction = recentPredictions[0]

  const scrollToHowItWorks = () => {
    document.getElementById('how-careerai-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-10 animate-fade-in pb-16 text-white max-w-6xl mx-auto">
      {/* 1. HERO / WELCOME SECTION */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-orange-950/30 border border-white/10 shadow-[0_20px_45px_rgba(0,0,0,0.6)] space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" /> CareerAI Intelligence Platform
              </span>
              <span className="text-xs text-neutral-400">Welcome, {candidateName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your AI Career Intelligence Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Analyze your profile, understand your job fit, prepare for interviews, improve your career readiness, and monitor future career risks.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              size="md"
              onClick={() => navigate('/candidate/job-fit')}
              className="w-full sm:w-auto gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] text-xs cursor-pointer font-bold"
            >
              <Target className="h-4 w-4 text-orange-400" /> Start Career Analysis
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={scrollToHowItWorks}
              className="w-full sm:w-auto gap-2 text-xs cursor-pointer text-neutral-300 hover:text-white"
            >
              <Info className="h-4 w-4 text-rose-400" /> How CareerAI Works
            </Button>
          </div>
        </div>

        {/* Dynamic Personalization Prompt Banner */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4 text-orange-400 shrink-0" />
            <span>
              {!hasResume ? (
                <strong className="text-rose-300">Start by uploading your resume in your Profile to unlock personalized predictions.</strong>
              ) : hasApps ? (
                <strong className="text-emerald-300">You have {applications.length} active application{applications.length === 1 ? '' : 's'} tracked in your dashboard.</strong>
              ) : hasPredictions ? (
                <strong className="text-orange-300">Your latest job-fit analysis scored {latestPrediction.match_score}/100 for {latestPrediction.job_title}.</strong>
              ) : (
                <strong className="text-emerald-300">Your profile is ready with {candidateSkills.length} verified skills! Analyze a job to get your first match score.</strong>
              )}
            </span>
          </div>
          <Link
            to={!hasResume ? '/candidate/profile' : '/candidate/job-fit'}
            className="text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer shrink-0"
          >
            {!hasResume ? 'Upload Resume →' : 'Launch Predictor →'}
          </Link>
        </div>
      </div>

      {/* 2. QUICK ACTIONS BAR */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link to="/candidate/profile" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-rose-500/40 hover:bg-white/[0.04] transition-all group">
              <Upload className="h-5 w-5 mx-auto text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Upload Resume</span>
            </Card>
          </Link>

          <Link to="/candidate/job-fit" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-orange-500/40 hover:bg-white/[0.04] transition-all group">
              <Target className="h-5 w-5 mx-auto text-orange-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Analyze Job Fit</span>
            </Card>
          </Link>

          <Link to="/candidate/hiring-probability" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all group">
              <Sparkles className="h-5 w-5 mx-auto text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Hiring Competitiveness</span>
            </Card>
          </Link>

          <Link to="/candidate/recommendations" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all group">
              <Briefcase className="h-5 w-5 mx-auto text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Matched Jobs</span>
            </Card>
          </Link>

          <Link to="/candidate/applications" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-rose-500/40 hover:bg-white/[0.04] transition-all group">
              <Send className="h-5 w-5 mx-auto text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Application Tracker</span>
            </Card>
          </Link>

          <Link to="/candidate/fit-history" className="block">
            <Card className="p-3.5 text-center border-white/10 hover:border-amber-500/40 hover:bg-white/[0.04] transition-all group">
              <History className="h-5 w-5 mx-auto text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Prediction History</span>
            </Card>
          </Link>
        </div>
      </div>

      {/* 3. FOUR CORE AI MODULES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">Four Core AI Intelligence Modules</h3>
            <p className="text-xs text-neutral-400">Integrated decision-support tools built for career advancement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Job Fit */}
          <Card className="p-5 border-white/10 hover:border-rose-500/30 flex flex-col justify-between transition-all space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">1. Job Fit</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Compare your skills, experience and profile with a specific job and receive an explainable match score.
              </p>
            </div>
            <Link to="/candidate/job-fit">
              <Button size="sm" className="w-full text-xs cursor-pointer">
                Analyze Job Fit
              </Button>
            </Link>
          </Card>

          {/* Card 2: Interview Success */}
          <Card className="p-5 border-white/10 hover:border-orange-500/30 flex flex-col justify-between transition-all space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">2. Interview Success</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Assess interview readiness, practice role-specific questions and receive AI feedback on key architectural talking points.
              </p>
            </div>
            <Link to="/candidate/practice">
              <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                Practice Interview
              </Button>
            </Link>
          </Card>

          {/* Card 3: Job Success / Competitiveness */}
          <Card className="p-5 border-white/10 hover:border-purple-500/30 flex flex-col justify-between transition-all space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">3. Job Success</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Estimate role readiness and long-term fit using available candidate and job information across 3 pillars.
              </p>
            </div>
            <Link to="/candidate/hiring-probability">
              <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                View Job Success
              </Button>
            </Link>
          </Card>

          {/* Card 4: Career / Attrition Risk (Role Aware) */}
          <Card className="p-5 border-white/10 hover:border-emerald-500/30 flex flex-col justify-between transition-all space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-white">4. Career Risk Signals</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Identify career trajectory risks, market demand shifts, and skill obsolescence signals relevant to your engineering domain.
              </p>
            </div>
            <Link to="/candidate/profile">
              <Button variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                View Risk Insights
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* 4. HOW CAREERAI WORKS (4-STEP LIFECYCLE) */}
      <div id="how-careerai-works" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">How CareerAI Works</h3>
            <p className="text-xs text-neutral-400">The complete end-to-end intelligence cycle</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 relative">
            <span className="text-2xl font-black text-rose-500 font-mono block">01</span>
            <h4 className="text-sm font-bold text-white">Build Your Profile</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Upload your resume and let AI extract your verified skills, experience depth, education and technical achievements.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 relative">
            <span className="text-2xl font-black text-orange-500 font-mono block">02</span>
            <h4 className="text-sm font-bold text-white">Analyze Job Fit</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Paste a custom job description or select a curated opening to evaluate multi-factor alignment against role criteria.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 relative">
            <span className="text-2xl font-black text-purple-500 font-mono block">03</span>
            <h4 className="text-sm font-bold text-white">Improve Your Chances</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Discover your strong areas, missing skill gaps, interview talking points, and tailored learning roadmap modules.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 relative">
            <span className="text-2xl font-black text-emerald-500 font-mono block">04</span>
            <h4 className="text-sm font-bold text-white">Track Your Career</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Review historical predictions, manage applications in your Application Tracker, and monitor career trajectory signals.
            </p>
          </div>
        </div>
      </div>

      {/* 5. CURRENT PROFILE SUMMARY & REAL RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Authenticated Profile Summary */}
        <Card className="p-6 border-white/10 space-y-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-orange-400" /> Your Active Profile
            </CardTitle>
            <Link to="/candidate/profile" className="text-xs text-rose-400 hover:underline font-semibold">
              Edit
            </Link>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-neutral-400">Full Name</span>
              <strong className="text-white">{candidateName}</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-neutral-400">Headline</span>
              <strong className="text-white truncate max-w-[160px]">{candidateHeadline || 'Engineer'}</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-neutral-400">Experience Depth</span>
              <strong className="text-white">{candidateExp} Years</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <span className="text-neutral-400">Verified Skills</span>
              <strong className="text-emerald-400 font-bold">{candidateSkills.length} Verified</strong>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-[11px] font-bold mb-1.5">
                <span className="text-neutral-400">Profile Strength Index</span>
                <span className="text-rose-400">{profileStrength}%</span>
              </div>
              <ProgressBar value={profileStrength} color="primary" size="sm" />
            </div>

            {candidateSkills.length > 0 && (
              <div className="pt-2 border-t border-white/[0.08]">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1.5">Key Extracted Stack</span>
                <div className="flex flex-wrap gap-1">
                  {candidateSkills.slice(0, 6).map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[10px] text-neutral-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Real Recent Activity (Predictions & Applications) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-white/10 space-y-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-rose-400" /> Recent Prediction History
              </CardTitle>
              <Link to="/candidate/fit-history" className="text-xs text-orange-400 hover:underline font-semibold">
                View All History →
              </Link>
            </CardHeader>

            <div className="space-y-2.5">
              {recentPredictions.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 space-y-2">
                  <Target className="h-8 w-8 mx-auto opacity-30 text-rose-400" />
                  <p className="text-xs">No prediction activity recorded yet.</p>
                  <Link to="/candidate/job-fit">
                    <Button size="sm" variant="outline" className="mt-1 text-xs cursor-pointer">
                      Run Your First Fit Evaluation
                    </Button>
                  </Link>
                </div>
              ) : (
                recentPredictions.map((pred) => (
                  <div
                    key={pred.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{pred.job_title}</h5>
                      <p className="text-neutral-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <Building className="h-3 w-3 text-orange-400" /> {pred.company}
                        <span>•</span>
                        <Calendar className="h-3 w-3 text-neutral-500" />
                        {new Date(pred.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreRing score={pred.match_score} size="sm" />
                      <Badge variant={pred.match_score >= 70 ? 'success' : 'warning'}>
                        {pred.prediction_label || `${pred.match_score}% Match`}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Applications Preview */}
          <Card className="p-6 border-white/10 space-y-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-400" /> Tracked Applications ({applications.length})
              </CardTitle>
              <Link to="/candidate/applications" className="text-xs text-emerald-400 hover:underline font-semibold">
                Open Tracker →
              </Link>
            </CardHeader>

            <div className="space-y-2.5">
              {applications.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 space-y-2">
                  <Briefcase className="h-8 w-8 mx-auto opacity-30 text-emerald-400" />
                  <p className="text-xs">No active applications tracked yet.</p>
                  <Link to="/candidate/recommendations">
                    <Button size="sm" variant="outline" className="mt-1 text-xs cursor-pointer">
                      Explore Jobs & Apply
                    </Button>
                  </Link>
                </div>
              ) : (
                applications.slice(0, 3).map((app) => (
                  <div
                    key={app.id || app.job_id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-white text-sm">{app.job_title}</h5>
                      <p className="text-neutral-400 text-[11px]">{app.company_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="info">{app.status || 'Saved'}</Badge>
                      <ScoreRing score={app.application_readiness || app.match_score || 80} size="sm" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 6. EXPLANATION OF AI SCORES */}
      <Card className="p-6 border-white/10 space-y-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-400" /> What Do CareerAI Scores Mean?
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="font-bold text-white block">Profile Strength</span>
            <p className="text-neutral-400 leading-relaxed">
              Measures how complete and evidence-supported your verified profile is.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="font-bold text-rose-400 block">Job Fit Score</span>
            <p className="text-neutral-400 leading-relaxed">
              Calculates how closely your current skills and experience overlap with target role requirements.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="font-bold text-orange-400 block">Application Readiness</span>
            <p className="text-neutral-400 leading-relaxed">
              Evaluates how thoroughly prepared your resume and evidence are before submitting.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="font-bold text-purple-400 block">Hiring Competitiveness</span>
            <p className="text-neutral-400 leading-relaxed">
              3-pillar estimate evaluating Job Fit (60%), Market Opportunity (25%), and Evidence (15%).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
            <span className="font-bold text-emerald-400 block">Interview Readiness</span>
            <p className="text-neutral-400 leading-relaxed">
              Estimates preparedness for technical screening and architectural discussion questions.
            </p>
          </div>
        </div>
      </Card>

      {/* 7. RESPONSIBLE AI NOTICE */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center gap-3 text-xs text-neutral-400">
        <Info className="h-4 w-4 text-orange-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Responsible AI Notice: </strong>
          CareerAI provides decision-support insights, not guaranteed outcomes. AI predictions should not replace human judgment in employment decisions.
        </p>
      </div>
    </div>
  )
}
