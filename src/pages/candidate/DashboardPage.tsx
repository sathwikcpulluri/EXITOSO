import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import {
  mockCandidateProfile,
  mockFitAssessments,
  mockJobs,
} from '@/lib/mockData'
import {
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
  BrainCircuit,
  Zap,
} from 'lucide-react'

export default function CandidateDashboard() {
  const { user } = useAuthStore()
  const profile = mockCandidateProfile
  const recentAssessments = mockFitAssessments
  const topRecommendations = mockJobs.slice(0, 3)
  const displayName = user?.fullName || 'Candidate'

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader
        title={`Welcome back, ${displayName}! 👋`}
        subtitle="AI Role Prediction & Career Alignment Engine based on your verified skills and experience."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
              <Target className="h-4 w-4" />
              New Fit Prediction
            </Button>
          </Link>
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
                Profile Completeness: <span className="text-orange-400">{profile.profileCompleteness}%</span>
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
                AI extraction parsed 10 verified skills. Add target preferences to refine classification accuracy across 262 roles.
              </p>
              <div className="w-48 sm:w-64 mt-2">
                <ProgressBar value={profile.profileCompleteness} color="primary" size="sm" />
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
            <p className="text-3xl font-extrabold text-white mt-1">91%</p>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> High Alignment
            </span>
          </div>
          <ScoreRing score={91} size="sm" />
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-orange-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Evaluated Roles</p>
            <p className="text-3xl font-extrabold text-white mt-1">{recentAssessments.length}</p>
            <span className="text-xs text-neutral-400 mt-1">Across 262 Catalogs</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-purple-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Extracted Skills</p>
            <p className="text-3xl font-extrabold text-white mt-1">{profile.skills.length}</p>
            <span className="text-xs text-rose-400 font-semibold mt-1">92% AI Confidence</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between border-white/10 hover:border-amber-500/30 transition-colors">
          <div>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Recommended Jobs</p>
            <p className="text-3xl font-extrabold text-white mt-1">{mockJobs.length}</p>
            <span className="text-xs text-neutral-400 mt-1">Curated for your stack</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Fit Assessments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <CardTitle className="text-lg">Recent AI Fit Predictions</CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">Multi-factor probability breakdown vs target job profiles</p>
              </div>
              <Link to="/candidate/fit-history">
                <button className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </CardHeader>
            <div className="space-y-4 mt-4">
              {recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-5 rounded-2xl border border-white/[0.08] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-white text-base">{assessment.jobTitle}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{assessment.companyName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreRing score={assessment.overallScore} size="sm" />
                      <Badge variant={assessment.recommendation === 'strong' ? 'success' : 'warning'}>
                        {assessment.recommendation}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.06] text-xs">
                    <div>
                      <span className="text-neutral-500">Technical:</span>{' '}
                      <span className="font-bold text-neutral-200">{assessment.technicalScore}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Experience:</span>{' '}
                      <span className="font-bold text-neutral-200">{assessment.experienceScore}%</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Alignment:</span>{' '}
                      <span className="font-bold text-neutral-200">{assessment.roleAlignmentScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {assessment.matchingSkills.length} matched
                      </span>
                      <span className="text-neutral-600">•</span>
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <AlertCircle className="h-3.5 w-3.5" /> {assessment.skillGaps.length} gaps
                      </span>
                    </div>
                    <Link to="/candidate/job-fit">
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                        Prediction Details <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Jobs */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <CardTitle className="text-lg">AI Predicted Opportunities</CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">High-fit positions classified from the 262-role catalog</p>
              </div>
              <Link to="/candidate/recommendations">
                <button className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer">
                  See More <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </CardHeader>
            <div className="space-y-3 mt-4">
              {topRecommendations.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/[0.08] hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-bold text-white truncate text-sm">{job.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {job.companyName} • {job.location} ({job.workType})
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.requiredSkills.slice(0, 3).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-semibold text-neutral-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to="/candidate/job-fit" className="shrink-0 ml-4">
                    <Button size="sm" variant="outline">
                      Predict Fit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Prediction Summary & Quick Actions */}
        <div className="space-y-6">
          <Card padding="lg" className="border-white/10">
            <div className="text-center pb-5 border-b border-white/[0.08]">
              <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-3">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">AI Role Classifier</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Evaluate match probability against custom JDs or the 262 master role profiles.
              </p>
              <Link to="/candidate/job-fit" className="block mt-5">
                <Button className="w-full gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
                  <Target className="h-4 w-4" /> Run Prediction
                </Button>
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Top Prediction Insights</h4>
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Zap className="h-4 w-4" /> Full-Stack Match: 91%
                </p>
                <p className="text-neutral-300">All core technologies (React, Node.js, PostgreSQL) verified in profile.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="h-4 w-4" /> Key Skill Gap: Redux
                </p>
                <p className="text-neutral-300">Closing this gap elevates frontend alignment score to 95%+.</p>
              </div>
            </div>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            </CardHeader>
            <div className="space-y-2 mt-2">
              <Link
                to="/candidate/profile"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-orange-400" />
                  <span>Update Resume & Skills</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
              <Link
                to="/candidate/fit-history"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-rose-400" />
                  <span>Prediction Score History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
              <Link
                to="/candidate/recommendations"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] text-xs font-semibold text-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-amber-400" />
                  <span>Explore 262 Job Roles</span>
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
