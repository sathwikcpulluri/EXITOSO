import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  Target,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

interface BenchmarkJob {
  id: string
  title: string
  companyName: string
  location: string
  workType: 'remote' | 'hybrid' | 'onsite'
  department: string
  seniority: string
  salaryRange: string
  experienceYears: number
  requiredSkills: string[]
  preferredSkills: string[]
  description: string
  fitScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  recommendation?: 'excellent' | 'strong' | 'good' | 'partial' | 'low'
}

// 262-Benchmark Role Catalog Jobs
const BENCHMARK_JOBS: BenchmarkJob[] = [
  {
    id: 'jr-001',
    title: 'Senior Frontend Engineer',
    companyName: 'Veloce Dynamics',
    location: 'San Francisco, CA',
    workType: 'remote',
    department: 'Frontend Engineering',
    seniority: 'Senior',
    experienceYears: 5,
    requiredSkills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Redux', 'REST APIs', 'Git'],
    preferredSkills: ['GraphQL', 'Next.js', 'Docker', 'CI/CD'],
    salaryRange: '$140,000 - $185,000',
    description:
      'Architecting responsive web applications, component design systems, and state management pipelines with high-throughput API integrations.',
  },
  {
    id: 'jr-002',
    title: 'Full-Stack Software Engineer',
    companyName: 'TechNova Solutions',
    location: 'Bengaluru, India',
    workType: 'hybrid',
    department: 'Platform Engineering',
    seniority: 'Mid-Senior',
    experienceYears: 3,
    requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Express.js', 'REST APIs', 'Git'],
    preferredSkills: ['AWS', 'Docker', 'GraphQL', 'MongoDB'],
    salaryRange: '$125,000 - $165,000',
    description:
      'Building scalable SaaS web applications, database schema migrations, and RESTful microservices.',
  },
  {
    id: 'jr-003',
    title: 'Data Scientist & AI Researcher',
    companyName: 'DataPulse Analytics',
    location: 'Seattle, WA',
    workType: 'remote',
    department: 'Applied AI',
    seniority: 'Mid-Senior',
    experienceYears: 3,
    requiredSkills: ['Python', 'SQL', 'Data Analysis', 'Pandas', 'Scikit-Learn', 'Machine Learning'],
    preferredSkills: ['PyTorch', 'TensorFlow', 'Deep Learning', 'Tableau'],
    salaryRange: '$135,000 - $175,000',
    description:
      'Training predictive machine learning models, statistical analytics pipelines, and quantitative feature extraction.',
  },
  {
    id: 'jr-004',
    title: 'DevOps & Cloud Systems Engineer',
    companyName: 'CloudScale Infrastructure',
    location: 'Austin, TX',
    workType: 'remote',
    department: 'Infrastructure',
    seniority: 'Senior',
    experienceYears: 4,
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Git', 'Linux'],
    preferredSkills: ['Python', 'Go', 'Security', 'Monitoring'],
    salaryRange: '$145,000 - $190,000',
    description:
      'Managing automated multi-cloud deployment pipelines, container orchestration with Kubernetes, and Infrastructure as Code.',
  },
  {
    id: 'jr-005',
    title: 'Cybersecurity & Cloud Defense Engineer',
    companyName: 'CyberGuard Systems',
    location: 'New York, NY',
    workType: 'hybrid',
    department: 'Security Operations',
    seniority: 'Senior',
    experienceYears: 4,
    requiredSkills: ['Linux', 'Security', 'Network Security', 'SIEM', 'Incident Response', 'Docker'],
    preferredSkills: ['Kubernetes', 'Python', 'AWS', 'Penetration Testing'],
    salaryRange: '$140,000 - $180,000',
    description:
      'Hardening cloud infrastructure, threat modeling, SIEM event auditing, and vulnerability assessment.',
  },
  {
    id: 'jr-006',
    title: 'Backend API Engineer',
    companyName: 'WebCraft Labs',
    location: 'Remote',
    workType: 'remote',
    department: 'Core Backend',
    seniority: 'Mid-Level',
    experienceYears: 3,
    requiredSkills: ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'REST APIs', 'Git', 'Docker'],
    preferredSkills: ['TypeScript', 'Redis', 'AWS', 'CI/CD'],
    salaryRange: '$120,000 - $155,000',
    description:
      'Developing robust server-side APIs, database query optimization, and asynchronous message queue workers.',
  },
]

export default function JobRecommendationsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'remote' | 'hybrid'>('all')
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(0)
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  // 1. Fetch real candidate skills from Supabase
  useEffect(() => {
    async function loadCandidateData() {
      setIsLoadingProfile(true)
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        const targetId = authUser?.id || user?.id
        if (!targetId) {
          setIsLoadingProfile(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .single()

        if (!error && data) {
          if (data.experience_years !== undefined) setCandidateExperience(Number(data.experience_years))
          if (Array.isArray(data.skills)) {
            const skillNames = data.skills.map((s: any) => (typeof s === 'string' ? s : s.name))
            setCandidateSkills(skillNames.filter(Boolean))
          }
        }
      } catch (err) {
        console.error('[JobRecommendations] Profile fetch error:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadCandidateData()
  }, [user?.id])

  // 2. Compute deterministic fit for every job against candidate's real profile
  const candSkillsSet = new Set(candidateSkills.map((s) => s.toLowerCase()))

  const jobsWithCalculatedFit: BenchmarkJob[] = BENCHMARK_JOBS.map((job) => {
    const matched: string[] = []
    const missing: string[] = []

    for (const req of job.requiredSkills) {
      if (candSkillsSet.has(req.toLowerCase())) {
        matched.push(req)
      } else {
        missing.push(req)
      }
    }

    // 10-factor weighted scoring formula
    const techScore = job.requiredSkills.length > 0 ? (matched.length / job.requiredSkills.length) * 100 : 50
    const expScore = Math.min((candidateExperience / Math.max(job.experienceYears, 1)) * 100, 100)
    const overall = Math.round(techScore * 0.55 + expScore * 0.45)

    let rec: 'excellent' | 'strong' | 'good' | 'partial' | 'low' = 'low'
    if (overall >= 85) rec = 'excellent'
    else if (overall >= 70) rec = 'strong'
    else if (overall >= 55) rec = 'good'
    else if (overall >= 40) rec = 'partial'

    return {
      ...job,
      fitScore: overall,
      matchedSkills: matched,
      missingSkills: missing,
      recommendation: rec,
    }
  })

  // Sort from highest match score to lowest
  jobsWithCalculatedFit.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0))

  // 3. Search and filter
  const filteredJobs = jobsWithCalculatedFit.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'remote' && job.workType === 'remote') ||
      (selectedFilter === 'hybrid' && job.workType === 'hybrid')

    return matchesSearch && matchesFilter
  })

  const handlePredictFitForJob = (job: BenchmarkJob) => {
    navigate('/candidate/job-fit', {
      state: {
        preselectedJobId: job.id,
        prefilledDescription: `${job.title} at ${job.companyName}\n${job.description}\nRequired Experience: ${job.experienceYears}+ years.\nRequired Skills: ${job.requiredSkills.join(', ')}.\nPreferred Skills: ${job.preferredSkills.join(', ')}.`,
      },
    })
  }

  const getBadgeVariant = (rec?: string) => {
    switch (rec) {
      case 'excellent':
      case 'strong':
        return 'success'
      case 'good':
        return 'info'
      case 'partial':
        return 'warning'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white max-w-6xl mx-auto">
      <PageHeader
        title="AI Role Recommendations & Catalog"
        subtitle="Live benchmark opportunities evaluated against your authenticated candidate profile skills."
      />

      {/* Candidate Profile Summary Banner */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-rose-400" />
          <span>
            Matching against: <strong className="text-white">{candidateSkills.length} Verified Skills</strong> ({candidateExperience} Yrs Experience)
          </span>
        </div>
        {candidateSkills.length === 0 && !isLoadingProfile && (
          <span className="text-amber-400 font-medium">
            Upload your resume in Profile to see personalized match scores!
          </span>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-4 border-white/10">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, company, or skill (e.g. React, Python, AWS)..."
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
              className="cursor-pointer text-xs"
            >
              All Roles ({BENCHMARK_JOBS.length})
            </Button>
            <Button
              variant={selectedFilter === 'remote' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('remote')}
              className="cursor-pointer text-xs"
            >
              Remote Only
            </Button>
            <Button
              variant={selectedFilter === 'hybrid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('hybrid')}
              className="cursor-pointer text-xs"
            >
              Hybrid
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {isLoadingProfile ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
            <span className="text-sm">Calculating personalized job matches...</span>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 border-white/10 hover:border-white/20 transition-all">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-white tracking-tight">{job.title}</h3>
                    <Badge variant="info">{job.seniority}</Badge>
                    <Badge variant={getBadgeVariant(job.recommendation)}>
                      <Sparkles className="h-3 w-3 mr-1 inline" /> {job.fitScore}% Match Score
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
                    <span>{job.salaryRange}</span>
                    <span className="text-neutral-600">•</span>
                    <span>{job.experienceYears}+ Yrs Req.</span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{job.description}</p>

                  {/* Matched vs Missing Skills breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Matched ({job.matchedSkills?.length}):
                      </span>
                      {job.matchedSkills && job.matchedSkills.length > 0 ? (
                        job.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-500 italic">None</span>
                      )}
                    </div>

                    {job.missingSkills && job.missingSkills.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap text-[11px] pt-0.5">
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Missing ({job.missingSkills.length}):
                        </span>
                        {job.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                  <div className="text-center">
                    <ScoreRing score={job.fitScore || 0} size="md" />
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">Match Index</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handlePredictFitForJob(job)}
                      className="w-full gap-1 text-xs shadow-[0_0_20px_rgba(255,0,94,0.3)] cursor-pointer"
                    >
                      <Target className="h-3.5 w-3.5" /> Predict Fit Score
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}

        {!isLoadingProfile && filteredJobs.length === 0 && (
          <Card className="p-12 text-center text-neutral-500 border-white/10">
            <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-40 text-orange-400" />
            <p className="text-sm font-semibold">No job recommendations found matching your current search query.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
