import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { type ApplicationRecord } from '@/lib/api'
import { ApplicationAssistantModal, type JobTarget } from '@/components/candidate/ApplicationAssistantModal'
import {
  Briefcase,
  Search,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle2,
  Trash2,
  Sparkles,
  RefreshCw,
  PieChart,
} from 'lucide-react'

const STATUS_OPTIONS = [
  'Saved',
  'Applied',
  'Recruiter Review',
  'Interview',
  'Technical Round',
  'Final Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
]

export default function ApplicationsPage() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')

  // Selected job for assistant modal
  const [selectedJob, setSelectedJob] = useState<JobTarget | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // 1. Fetch real application records from Supabase
  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !authUser) {
        setIsLoading(false)
        return
      }

      // Query Supabase table
      const { data: dbApps } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      // Fallback query from user_metadata
      const metaApps: ApplicationRecord[] = Array.isArray(authUser.user_metadata?.applications)
        ? authUser.user_metadata.applications
        : []

      const combined = [...(Array.isArray(dbApps) ? dbApps : [])]
      for (const metaApp of metaApps) {
        if (!combined.some((c) => c.job_id === metaApp.job_id || c.id === metaApp.id)) {
          combined.push(metaApp)
        }
      }

      combined.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      )

      setApplications(combined)
    } catch (err) {
      console.error('[ApplicationsPage Load Error]', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [user?.id])

  // Update Status
  const handleUpdateStatus = async (_appId: string, jobId: string, newStatus: string) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) return

      const now = new Date().toISOString()
      const isApplied = newStatus === 'Applied'

      await supabase
        .from('applications')
        .update({
          status: newStatus,
          applied_at: isApplied ? now : undefined,
          updated_at: now,
        })
        .eq('user_id', authUser.id)
        .eq('job_id', jobId)

      // Update state locally
      setApplications((prev) =>
        prev.map((a) =>
          a.job_id === jobId
            ? {
                ...a,
                status: newStatus,
                applied_at: isApplied ? now : a.applied_at,
                updated_at: now,
              }
            : a
        )
      )

      // Update user_metadata
      const existing = Array.isArray(authUser.user_metadata?.applications)
        ? authUser.user_metadata.applications
        : []
      const updatedList = existing.map((a: any) =>
        a.job_id === jobId ? { ...a, status: newStatus, updated_at: now } : a
      )
      await supabase.auth.updateUser({
        data: { applications: updatedList },
      })
    } catch (err) {
      console.error('[Update Status Error]', err)
    }
  }

  // Delete Application
  const handleDeleteApplication = async (jobId: string) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) return

      await supabase.from('applications').delete().eq('user_id', authUser.id).eq('job_id', jobId)

      setApplications((prev) => prev.filter((a) => a.job_id !== jobId))

      const existing = Array.isArray(authUser.user_metadata?.applications)
        ? authUser.user_metadata.applications
        : []
      const updatedList = existing.filter((a: any) => a.job_id !== jobId)
      await supabase.auth.updateUser({
        data: { applications: updatedList },
      })
    } catch (err) {
      console.error('[Delete Application Error]', err)
    }
  }

  // Open Assistant modal for existing application
  const handleOpenAnalysis = (app: ApplicationRecord) => {
    setSelectedJob({
      id: app.job_id,
      title: app.job_title,
      companyName: app.company_name,
      description: app.job_description || 'Role details saved with this application.',
      requiredSkills: Array.isArray(app.missing_skills) ? app.missing_skills : ['React', 'TypeScript', 'Node.js'],
      jobUrl: app.job_url,
      matchScore: app.match_score,
      hiringCompetitiveness: app.hiring_competitiveness,
    })
    setIsModalOpen(true)
  }

  // Filter and Search logic
  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      (app.job_title && app.job_title.toLowerCase().includes(term)) ||
      (app.company_name && app.company_name.toLowerCase().includes(term))

    if (selectedFilter === 'all') return matchesSearch
    return matchesSearch && app.status && app.status.toLowerCase() === selectedFilter.toLowerCase()
  })

  // Telemetry Metrics
  const totalCount = applications.length
  const thisMonthCount = applications.filter((a) => {
    const d = new Date(a.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const avgMatch =
    totalCount > 0 ? Math.round(applications.reduce((sum, a) => sum + (a.match_score || 0), 0) / totalCount) : 0
  const avgReadiness =
    totalCount > 0
      ? Math.round(applications.reduce((sum, a) => sum + (a.application_readiness || 0), 0) / totalCount)
      : 0

  const interviewCount = applications.filter((a) => (a.status || '').toLowerCase().includes('interview')).length
  const offerCount = applications.filter((a) => (a.status || '').toLowerCase().includes('offer')).length
  const rejectedCount = applications.filter((a) => (a.status || '').toLowerCase().includes('reject')).length
  const savedCount = applications.filter((a) => (a.status || '').toLowerCase().includes('save')).length

  const getStatusBadgeVariant = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('offer')) return 'success'
    if (s.includes('interview')) return 'info'
    if (s.includes('applied') || s.includes('review')) return 'warning'
    if (s.includes('reject') || s.includes('withdrawn')) return 'neutral'
    return 'neutral'
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 text-white max-w-6xl mx-auto">
      <PageHeader
        title="AI Application Tracker"
        subtitle="Manage your job applications, track stages, review readiness scores, and optimize tailored strategies."
        actions={
          <Link to="/candidate/recommendations">
            <Button className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer text-xs">
              <Briefcase className="h-4 w-4" /> Browse Recommended Jobs
            </Button>
          </Link>
        }
      />

      {/* Summary KPI Widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Total Applications
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">{totalCount}</span>
            <span className="text-xs text-neutral-400">({thisMonthCount} this month)</span>
          </div>
        </Card>

        <Card className="p-4 border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Avg Match Index
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-rose-400">{avgMatch}%</span>
            <span className="text-xs text-neutral-400">Readiness: {avgReadiness}%</span>
          </div>
        </Card>

        <Card className="p-4 border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Interviews & Offers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400">
              {interviewCount} <span className="text-xs text-neutral-400 font-normal">Int.</span> / {offerCount}{' '}
              <span className="text-xs text-neutral-400 font-normal">Off.</span>
            </span>
          </div>
        </Card>

        <Card className="p-4 border-white/10 space-y-1">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Saved vs Rejected
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-neutral-300">
              {savedCount} <span className="text-xs text-neutral-400 font-normal">Saved</span> / {rejectedCount}{' '}
              <span className="text-xs text-neutral-400 font-normal">Rej.</span>
            </span>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'saved', label: 'Saved' },
            { id: 'applied', label: 'Applied' },
            { id: 'interview', label: 'Interview' },
            { id: 'offer', label: 'Offer' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(255,0,94,0.4)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
          />
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
            <span className="text-sm">Loading your applications...</span>
          </div>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <Card
              key={app.id || app.job_id}
              className="p-6 border-white/10 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-white tracking-tight">{app.job_title}</h3>
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-200">
                      <Building className="h-3.5 w-3.5 text-orange-400" /> {app.company_name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-rose-400" /> Saved:{' '}
                      {new Date(app.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    {app.applied_at && (
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Applied:{' '}
                        {new Date(app.applied_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                  <div className="text-center">
                    <ScoreRing score={app.match_score || 85} size="sm" />
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">Match</span>
                  </div>
                  <div className="text-center">
                    <ScoreRing score={app.application_readiness || 80} size="sm" />
                    <span className="text-[10px] text-rose-400 uppercase font-bold block mt-1">Readiness</span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Update Stage</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, app.job_id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs outline-none focus:border-rose-500 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenAnalysis(app)}
                    className="gap-1.5 text-xs cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-orange-400" /> View Analysis & Strategy
                  </Button>

                  {app.job_url && app.job_url !== '#' && (
                    <a
                      href={app.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 text-xs font-semibold text-neutral-200 transition-all"
                    >
                      <span>View Job URL</span>
                      <ExternalLink className="h-3 w-3 text-neutral-400" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteApplication(app.job_id)}
                  title="Delete Application"
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-neutral-500 border-white/10 space-y-4">
            <Briefcase className="h-10 w-10 mx-auto opacity-40 text-orange-400" />
            <div className="space-y-1">
              <p className="text-base font-bold text-neutral-300">No applications recorded yet.</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Explore recommended jobs and click Apply to launch the Application Assistant and track your progress.
              </p>
            </div>
            <Link to="/candidate/recommendations">
              <Button size="sm" className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer mt-2 text-xs">
                <Briefcase className="h-4 w-4" /> Explore Jobs & Apply
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Application Insights Section */}
      <Card className="p-6 border-white/10 space-y-4 bg-gradient-to-br from-neutral-900 to-rose-950/20">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <PieChart className="h-4 w-4 text-orange-400" /> Application Insights & Analytics
          </CardTitle>
        </CardHeader>

        {applications.length < 2 ? (
          <p className="text-xs text-neutral-400 italic">
            Not enough application data yet. Save or apply to at least 2 jobs to unlock hiring conversion metrics.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Top Applied Categories</span>
              <p className="text-white font-semibold">Engineering & Full-Stack Development</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Interview Rate</span>
              <p className="text-emerald-400 font-semibold">
                {totalCount > 0 ? Math.round((interviewCount / totalCount) * 100) : 0}% of applications
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase block">Average Interview Score</span>
              <p className="text-white font-semibold">
                {interviewCount > 0 ? `${avgMatch}% Match Index` : 'N/A (Awaiting interviews)'}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Assistant Modal */}
      <ApplicationAssistantModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApplicationSaved={loadApplications}
      />
    </div>
  )
}
