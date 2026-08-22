import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
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
  ArrowRight,
  TrendingUp,
  Briefcase,
  FileText,
  BrainCircuit,
  Send,
  PieChart,
} from 'lucide-react'

export default function CandidateDashboard() {
  const { user } = useAuthStore()

  // Real candidate profile state
  const [candidateName, setCandidateName] = useState<string>(user?.fullName || 'Candidate')
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExp, setCandidateExp] = useState<number>(0)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])

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

        // 1. Fetch Profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        const meta = authUser.user_metadata || {}

        const finalName = profile?.full_name || meta.full_name || meta.name || user?.fullName || 'Candidate'
        const finalHeadline = profile?.headline || meta.headline || ''
        const finalYears = profile?.experience_years !== undefined ? Number(profile.experience_years) : (meta.experience_years ?? 0)

        const rawSkills = profile?.skills || meta.skills
        const cleanSkills: string[] = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          : []

        setCandidateName(finalName)
        setCandidateHeadline(finalHeadline)
        setCandidateExp(finalYears)
        setCandidateSkills(cleanSkills)

        // 2. Fetch Applications
        const { data: dbApps } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        const metaApps: ApplicationRecord[] = Array.isArray(meta.applications) ? meta.applications : []
        const combined = [...(Array.isArray(dbApps) ? dbApps : [])]
        for (const metaApp of metaApps) {
          if (!combined.some((c) => c.job_id === metaApp.job_id || c.id === metaApp.id)) {
            combined.push(metaApp)
          }
        }
        setApplications(combined)
      } catch (err) {
        console.error('[Dashboard Load Error]', err)
      }
    }

    loadDashboardData()
  }, [user?.id])

  // Application Insights Calculation
  const totalApps = applications.length
  const interviewApps = applications.filter((a) => (a.status || '').toLowerCase().includes('interview')).length
  const offerApps = applications.filter((a) => (a.status || '').toLowerCase().includes('offer')).length
  const avgMatchScore =
    totalApps > 0 ? Math.round(applications.reduce((s, a) => s + (a.match_score || 0), 0) / totalApps) : 85
  const avgReadiness =
    totalApps > 0
      ? Math.round(applications.reduce((s, a) => s + (a.application_readiness || 0), 0) / totalApps)
      : 80

  const completenessScore = Math.min(
    Math.round(
      (candidateSkills.length > 0 ? 35 : 0) +
        (candidateHeadline ? 25 : 0) +
        (candidateExp > 0 ? 20 : 0) +
        (totalApps > 0 ? 20 : 0)
    ),
    100
  )

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white">
      <PageHeader
        title={`Welcome back, ${candidateName}! 👋`}
        subtitle="AI Role Prediction & Career Alignment Engine based on your verified skills and applications."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/candidate/applications">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
                <Send className="h-4 w-4" /> Application Tracker ({totalApps})
              </Button>
            </Link>
            <Link to="/candidate/job-fit">
              <Button size="sm" className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] text-xs cursor-pointer">
                <Target className="h-4 w-4" /> New Fit Prediction
              </Button>
            </Link>
          </div>
        }
      />

      {/* Profile Completeness Alert / Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-neutral-900/90 to-orange-950/30 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base sm:text-lg">
                Profile Completeness: <span className="text-orange-400">{completenessScore}%</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
                {candidateSkills.length} verified technical skills loaded. {candidateExp} years experience recorded.
              </p>
              <div className="w-48 sm:w-64 mt-2">
                <ProgressBar value={completenessScore} color="primary" size="sm" />
              </div>
            </div>
          </div>
          <Link to="/candidate/profile">
            <button className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-neutral-200 transition-all cursor-pointer whitespace-nowrap">
              Edit Skills & Profile
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-rose-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Top Match Index</p>
            <p className="text-3xl font-extrabold text-white mt-1">{avgMatchScore}%</p>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> High Alignment
            </span>
          </div>
          <ScoreRing score={avgMatchScore} size="sm" />
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-orange-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Saved Applications</p>
            <p className="text-3xl font-extrabold text-white mt-1">{totalApps}</p>
            <span className="text-xs text-neutral-400 mt-1">
              {interviewApps} Interview{interviewApps === 1 ? '' : 's'} • {offerApps} Offer{offerApps === 1 ? '' : 's'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Send className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-purple-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Verified Skills</p>
            <p className="text-3xl font-extrabold text-white mt-1">{candidateSkills.length}</p>
            <span className="text-xs text-rose-400 font-semibold mt-1">Direct from Supabase</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-amber-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Domain Experience</p>
            <p className="text-3xl font-extrabold text-white mt-1">{candidateExp} Yrs</p>
            <span className="text-xs text-neutral-400 mt-1">{candidateHeadline || 'Engineer'}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Real Applications Tracker Quick List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5 text-rose-400" /> Tracked Applications
                </CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">Real-time status across your target companies</p>
              </div>
              <Link to="/candidate/applications">
                <button className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                  View All Tracker <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </CardHeader>

            <div className="space-y-3 mt-4">
              {applications.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 space-y-2">
                  <Briefcase className="h-8 w-8 mx-auto opacity-30 text-orange-400" />
                  <p className="text-xs">No active applications tracked yet.</p>
                  <Link to="/candidate/recommendations">
                    <Button size="sm" variant="outline" className="mt-2 text-xs cursor-pointer">
                      Browse Recommended Jobs & Apply
                    </Button>
                  </Link>
                </div>
              ) : (
                applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id || app.job_id}
                    className="p-4 rounded-xl border border-white/[0.08] hover:border-white/20 bg-white/[0.02] flex items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{app.job_title}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{app.company_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreRing score={app.application_readiness || app.match_score || 85} size="sm" />
                      <Badge variant="info">{app.status || 'Saved'}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Application Insights Section */}
          <Card className="p-6 border-white/10 space-y-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <PieChart className="h-4 w-4 text-orange-400" /> Application Insights
              </CardTitle>
            </CardHeader>

            {applications.length < 2 ? (
              <p className="text-xs text-neutral-400 italic">
                Not enough application data yet. Apply to at least 2 opportunities to unlock comparative readiness metrics.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">Average Readiness</span>
                  <p className="text-sm font-bold text-rose-400">{avgReadiness}/100</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">Interview Conversion</span>
                  <p className="text-sm font-bold text-emerald-400">
                    {Math.round((interviewApps / Math.max(totalApps, 1)) * 100)}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase block">Active Target Stack</span>
                  <p className="text-sm font-bold text-white truncate">
                    {candidateSkills.slice(0, 2).join(', ') || 'Software Engineering'}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: AI Quick Actions */}
        <div className="space-y-6">
          <Card padding="lg" className="border-white/10">
            <div className="text-center pb-5 border-b border-white/[0.08]">
              <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">AI Application Assistant</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Generate tailored application strategies, draft cover letters, and simulate readiness before submitting.
              </p>
              <Link to="/candidate/recommendations" className="block mt-5">
                <Button className="w-full gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] text-xs cursor-pointer">
                  <Send className="h-4 w-4" /> Launch Assistant
                </Button>
              </Link>
            </div>

            <div className="mt-5 space-y-2">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Quick Navigation</h4>
              <Link
                to="/candidate/applications"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="h-4 w-4 text-orange-400" />
                  <span>Application Tracker</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
              <Link
                to="/candidate/hiring-probability"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  <span>Hiring Competitiveness</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
              <Link
                to="/candidate/profile"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Update Profile & Skills</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
