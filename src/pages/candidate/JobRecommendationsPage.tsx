import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { mockJobs, mockFitAssessments } from '@/lib/mockData'
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  Target,
  Sparkles,
  Filter,
} from 'lucide-react'

export default function JobRecommendationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'remote' | 'hybrid'>('all')

  const jobsWithFit = mockJobs.map((job) => {
    const assessment = mockFitAssessments.find((a) => a.jobId === job.id)
    return {
      ...job,
      fitScore: assessment ? assessment.overallScore : 84,
      recommendation: assessment ? assessment.recommendation : 'good',
    }
  })

  const filteredJobs = jobsWithFit.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'remote' && job.workType === 'remote') ||
      (selectedFilter === 'hybrid' && job.workType === 'hybrid')

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white">
      <PageHeader
        title="AI Role Recommendations & Catalog"
        subtitle="Opportunities classified from the 262-role benchmark catalog matching your extracted skill vector."
      />

      {/* Search and Filters */}
      <Card className="p-4 border-white/10">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, company, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="h-4 w-4 text-neutral-500 shrink-0" />
            <Button
              variant={selectedFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All Roles (262)
            </Button>
            <Button
              variant={selectedFilter === 'remote' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('remote')}
            >
              Remote Only
            </Button>
            <Button
              variant={selectedFilter === 'hybrid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('hybrid')}
            >
              Hybrid
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="p-6 border-white/10 hover:border-white/20 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
                  <Badge variant="info">{job.seniority || 'Mid-Senior'}</Badge>
                  <Badge variant={job.recommendation === 'strong' ? 'success' : 'warning'}>
                    <Sparkles className="h-3 w-3 mr-1 inline" /> {job.fitScore}% Match Index
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-neutral-400 flex-wrap">
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-200">
                    <Building className="h-3.5 w-3.5 text-orange-400" /> {job.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-400" /> {job.location} ({job.workType})
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span>{job.department || 'Engineering'}</span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                <div className="text-center">
                  <ScoreRing score={job.fitScore} size="md" />
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">Match Index</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/candidate/job-fit">
                    <Button size="sm" className="w-full gap-1 text-xs shadow-[0_0_20px_rgba(255,0,94,0.3)]">
                      <Target className="h-3.5 w-3.5" /> Predict Fit Score
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center text-neutral-500 border-white/10">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-40 text-orange-400" />
            <p className="text-sm font-semibold">No job recommendations found matching your current filter.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
