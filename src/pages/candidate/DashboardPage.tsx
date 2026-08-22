import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import {
  mockCandidateProfile,
  mockFitAssessments,
  mockJobs,
  mockPracticeSessions,
} from '@/lib/mockData'
import {
  Target,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'

export default function CandidateDashboard() {
  const { user } = useAuthStore()
  const profile = mockCandidateProfile
  const recentAssessments = mockFitAssessments
  const recentPractice = mockPracticeSessions
  const topRecommendations = mockJobs.slice(0, 3)
  const displayName = user?.fullName || 'Candidate'

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <PageHeader
        title={`Welcome back, ${displayName}! 👋`}
        subtitle="Track your job fit scores, AI interview preparations, and curated career opportunities."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2">
              <Target className="h-4 w-4" />
              New Fit Assessment
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
                Complete your target preferences and certifications to unlock more accurate AI recommendations.
              </p>
              <div className="w-48 sm:w-64 mt-2">
                <ProgressBar value={profile.profileCompleteness} color="primary" size="sm" />
              </div>
            </div>
          </div>
          <Link to="/candidate/profile">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Edit Profile
            </Button>
          </Link>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Top Match Score</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">91%</p>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> Strong match
            </span>
          </div>
          <ScoreRing score={91} size="sm" />
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Completed Assessments</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{recentAssessments.length}</p>
            <span className="text-xs text-surface-500 mt-1">Across 3 companies</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Target className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Practice Sessions</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{recentPractice.length}</p>
            <span className="text-xs text-primary-600 font-medium mt-1">Avg Score: 79%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="h-6 w-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wider">Matched Roles</p>
            <p className="text-2xl font-bold text-surface-900 mt-1">{mockJobs.length}</p>
            <span className="text-xs text-surface-500 mt-1">Curated for your skills</span>
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
                <CardTitle className="text-lg">Recent Fit Assessments</CardTitle>
                <p className="text-xs text-surface-500 mt-0.5">AI breakdown comparing your experience with target JDs</p>
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
                    <Link to="/candidate/interview-prep">
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Prep Interview
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
                <CardTitle className="text-lg">AI Matched Opportunities</CardTitle>
                <p className="text-xs text-surface-500 mt-0.5">High-fit positions based on your technical stack</p>
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

        {/* Right Column: AI Interview Readiness & Actions */}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="text-center pb-4 border-b border-surface-100">
              <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary-50 text-primary-600 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-surface-900 text-lg">AI Mock Interview</h3>
              <p className="text-xs text-surface-500 mt-1">
                Simulate targeted interview questions and receive instant AI feedback.
              </p>
              <Link to="/candidate/practice" className="block mt-4">
                <Button className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" /> Start AI Practice
                </Button>
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-semibold text-surface-700 uppercase tracking-wider">Top Priority Tips</h4>
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                Practice explaining state management architecture & Redux Toolkit tradeoffs.
              </div>
              <div className="p-3 rounded-lg bg-primary-50/60 border border-primary-200/60 text-xs text-primary-900">
                Structure behavioral answers using the STAR method for leadership questions.
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
                to="/candidate/practice-history"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 text-sm text-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="h-4 w-4 text-surface-400" />
                  <span>Interview Performance History</span>
                </div>
                <ArrowRight className="h-4 w-4 text-surface-400" />
              </Link>
              <Link
                to="/candidate/onboarding"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 text-sm text-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-4 w-4 text-surface-400" />
                  <span>Revisit Onboarding Guide</span>
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
