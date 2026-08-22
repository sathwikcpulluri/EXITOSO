import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
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
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="AI Job Recommendations"
        subtitle="Opportunities curated specifically for your profile, skills, and target seniority."
      />

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
            <Input
              placeholder="Search by title, company, or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="h-4 w-4 text-surface-400 shrink-0" />
            <Button
              variant={selectedFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All Roles
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
          <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-surface-900">{job.title}</h3>
                  <Badge variant="info">{job.seniority || 'Mid-Senior'}</Badge>
                  <Badge variant={job.recommendation === 'strong' ? 'success' : 'warning'}>
                    <Sparkles className="h-3 w-3 mr-1 inline" /> {job.fitScore}% Fit Match
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-surface-500 flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-surface-700">
                    <Building className="h-3.5 w-3.5" /> {job.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location} ({job.workType})
                  </span>
                  <span>•</span>
                  <span>{job.department || 'Engineering'}</span>
                </div>

                <p className="text-xs text-surface-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills.map((skill) => (
                    <Badge key={skill} variant="neutral" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-surface-100">
                <div className="text-center">
                  <ScoreRing score={job.fitScore} size="md" />
                  <span className="text-[10px] text-surface-400 uppercase font-semibold block mt-1">Match Index</span>
                </div>
                <div className="flex flex-col gap-2">
                  <Link to="/candidate/job-fit">
                    <Button size="sm" className="w-full gap-1 text-xs">
                      <Target className="h-3.5 w-3.5" /> Assess Fit
                    </Button>
                  </Link>
                  <Link to="/candidate/interview-prep">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Interview Prep
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center text-surface-400">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No job recommendations found matching your current filter.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
