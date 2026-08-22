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
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title={`Welcome back, ${displayName}! 👋`}
        subtitle="AI Role Prediction & Career Alignment Engine based on your verified skills and experience."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              New Fit Prediction
            </Button>
          </Link>
        }
      />

      {/* Profile Completeness Alert / Card */}
      <Card className="bg-gradient-to-r from-primary-50 via-white to-primary-50/30 border-primary-100 p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-600 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Profile Completeness: {profile.profileCompleteness}%</h3>
              <p className="text-sm text-surface-600 mt-0.5">
                AI extraction parsed 10 verified skills. Add target preferences to refine classification accuracy.
              </p>
              <div className="w-48 sm:w-64 mt-2">
                <ProgressBar value={profile.profileCompleteness} color="primary" size="sm" />
              </div>
            </div>
          </div>
          <Link to="/candidate/profile">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Edit Skills & Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Top Match Index</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">91%</p>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> High Alignment
            </span>
          </div>
          <ScoreRing score={91} size="sm" />
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Evaluated Roles</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{recentAssessments.length}</p>
            <span className="text-xs text-surface-500 mt-1">Across 262 Job Catalogs</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Extracted Skills</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{profile.skills.length}</p>
            <span className="text-xs text-emerald-600 font-medium mt-1">92% AI Confidence</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BrainCircuit className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Recommended Positions</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{mockJobs.length}</p>
            <span className="text-xs text-surface-500 mt-1">Curated for your stack</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Briefcase className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Fit Assessments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">Recent AI Fit Predictions</CardTitle>
                <p className="text-xs text-surface-500 mt-0.5">Multi-factor probability breakdown vs target job profiles</p>
              </div>
              <Link to="/candidate/fit-history">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-xl border border-surface-200 hover:border-primary-300 hover:shadow-sm transition-all bg-surface-50/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-surface-900">{assessment.jobTitle}</h4>
                      <p className="text-sm text-surface-500">{assessment.companyName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ScoreRing score={assessment.overallScore} size="sm" />
                      <Badge variant={assessment.recommendation === 'strong' ? 'success' : 'warning'}>
                        {assessment.recommendation}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-surface-200/60 text-xs">
                    <div>
                      <span className="text-surface-400">Technical:</span>{' '}
                      <span className="font-semibold text-surface-700">{assessment.technicalScore}%</span>
                    </div>
                    <div>
                      <span className="text-surface-400">Experience:</span>{' '}
                      <span className="font-semibold text-surface-700">{assessment.experienceScore}%</span>
                    </div>
                    <div>
                      <span className="text-surface-400">Alignment:</span>{' '}
                      <span className="font-semibold text-surface-700">{assessment.roleAlignmentScore}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {assessment.matchingSkills.length} matched
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5" /> {assessment.skillGaps.length} gaps
                      </span>
                    </div>
                    <Link to="/candidate/job-fit">
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        View Prediction Details <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Jobs */}
          <Card className="p-6">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg">AI Predicted Opportunities</CardTitle>
                <p className="text-xs text-surface-500 mt-0.5">High-fit positions classified from the 262-role catalog</p>
              </div>
              <Link to="/candidate/recommendations">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  See More <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <div className="space-y-3">
              {topRecommendations.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors"
                >
                  <div className="min-w-0">
                    <h4 className="font-medium text-surface-900 truncate">{job.title}</h4>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {job.companyName} • {job.location} ({job.workType})
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills.slice(0, 3).map((s) => (
                        <Badge key={s} variant="neutral" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Link to="/candidate/job-fit" className="shrink-0 ml-4">
                    <Button size="sm" variant="outline">
                      Analyze Fit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: AI Prediction Summary & Quick Actions */}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="text-center pb-4 border-b border-surface-100">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-50 text-primary-600 mb-3">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-surface-900 text-lg">AI Role Prediction</h3>
              <p className="text-xs text-surface-500 mt-1">
                Evaluate match probability against custom JDs or industry benchmarks.
              </p>
              <Link to="/candidate/job-fit" className="block mt-4">
                <Button className="w-full gap-2">
                  <Target className="h-4 w-4" /> Run Fit Prediction
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">Top Prediction Insights</h4>
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" /> Full-Stack Match: 91%
                </p>
                <p>All core technologies (React, Node.js, PostgreSQL) verified in profile.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Key Skill Gap: Redux
                </p>
                <p>Closing this gap elevates frontend alignment score to 95%+.</p>
              </div>
            </div>
          </Card>

          {/* Quick Links Card */}
          <Card className="p-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Shortcuts</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              <Link
                to="/candidate/profile"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 text-sm text-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-surface-400" />
                  <span>Update Resume & Skills</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-400" />
              </Link>
              <Link
                to="/candidate/fit-history"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 text-sm text-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-surface-400" />
                  <span>Prediction Score History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-400" />
              </Link>
              <Link
                to="/candidate/onboarding"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 text-sm text-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-surface-400" />
                  <span>Resume Parser Setup</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
