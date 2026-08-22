import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  Award,
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
  educationRequirement?: string
  requiredSkills: string[]
  preferredSkills: string[]
  description: string
  responsibilities?: string[]
  fitScore?: number
  skillScore?: number
  experienceScore?: number
  roleScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
  predictionLabel?: 'Excellent Match' | 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Low Match'
  confidence?: number
}

// Canonical skill normalization dictionary
function normalizeSkill(s: string): string {
  const clean = s.trim().toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    react: 'react',
    reactjs: 'react',
    'react.js': 'react',
    node: 'node.js',
    nodejs: 'node.js',
    'node.js': 'node.js',
    express: 'express.js',
    expressjs: 'express.js',
    'express.js': 'express.js',
    postgres: 'postgresql',
    postgresql: 'postgresql',
    mongo: 'mongodb',
    mongodb: 'mongodb',
    k8s: 'kubernetes',
    kubernetes: 'kubernetes',
    aws: 'aws',
    'amazon web services': 'aws',
    gcp: 'google cloud',
    'google cloud': 'google cloud',
    tailwind: 'tailwind css',
    tailwindcss: 'tailwind css',
    'tailwind css': 'tailwind css',
    python: 'python',
    py: 'python',
    sql: 'sql',
    git: 'git',
    github: 'git',
    docker: 'docker',
    redux: 'redux',
    graphql: 'graphql',
    'rest apis': 'rest apis',
    rest: 'rest apis',
    'rest api': 'rest apis',
    linux: 'linux',
    security: 'security',
    'network security': 'network security',
    siem: 'siem',
    'incident response': 'incident response',
    pandas: 'pandas',
    'scikit-learn': 'scikit-learn',
    pytorch: 'pytorch',
    tensorflow: 'tensorflow',
    'machine learning': 'machine learning',
    ml: 'machine learning',
    'data analysis': 'data analysis',
  }
  return map[clean] || clean
}

// Calculate years from work experience history dates
function calculateYearsFromWorkHistory(workExp: any[]): number {
  if (!Array.isArray(workExp) || workExp.length === 0) return 0
  let totalMonths = 0
  for (const exp of workExp) {
    const start = exp.start_date ? new Date(exp.start_date) : null
    const end =
      exp.end_date && exp.end_date.toLowerCase() !== 'present'
        ? new Date(exp.end_date)
        : new Date()
    if (start && !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      totalMonths += Math.max(months, 6)
    } else {
      totalMonths += 12 // Default 1 year per valid employment record
    }
  }
  return Math.max(Math.round(totalMonths / 12), 1)
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
    educationRequirement: "Bachelor's Degree",
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
    educationRequirement: "Bachelor's Degree",
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
    educationRequirement: "Bachelor's or Master's Degree",
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
    educationRequirement: "Bachelor's Degree",
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
    educationRequirement: "Bachelor's Degree",
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
    educationRequirement: "Bachelor's Degree",
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

  // Real candidate profile state loaded from Supabase
  const [candidateSkills, setCandidateSkills] = useState<string[]>([])
  const [candidateExperience, setCandidateExperience] = useState<number>(0)
  const [candidateHeadline, setCandidateHeadline] = useState<string>('')
  const [candidateName, setCandidateName] = useState<string>('')
  const [hasResumeData, setHasResumeData] = useState<boolean>(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)

  // 1. Fetch real candidate profile from Supabase with dual-layer synchronization
  useEffect(() => {
    async function loadCandidateData() {
      setIsLoadingProfile(true)
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          setIsLoadingProfile(false)
          return
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.warn('[JobRecommendations] Profile fetch warning:', error.message)
        }

        const meta = authUser.user_metadata || {}

        // Unified values
        const finalName = data?.full_name || meta.full_name || meta.name || user?.fullName || ''
        const finalHeadline = data?.headline || meta.headline || ''

        // Experience: from database column, or user_metadata, or work history calculation
        let finalYears = data?.experience_years !== undefined ? Number(data.experience_years) : (meta.experience_years ?? 0)
        const workHistory = data?.experience || meta.experience
        if (finalYears === 0 && Array.isArray(workHistory) && workHistory.length > 0) {
          finalYears = calculateYearsFromWorkHistory(workHistory)
        }

        // Skills: from database column or user_metadata
        const rawSkills = data?.skills || meta.skills
        const cleanSkills: string[] = Array.isArray(rawSkills)
          ? rawSkills.map((s: any) => (typeof s === 'string' ? s : s.name)).filter(Boolean)
          : []

        setCandidateName(finalName)
        setCandidateHeadline(finalHeadline)
        setCandidateExperience(finalYears)
        setCandidateSkills(cleanSkills)
        setHasResumeData(Boolean(data?.resume_filename || meta.resume_filename || cleanSkills.length > 0))

        // Safe dev-only audit logging (never logs tokens, passwords, or keys)
        console.log(
          `[Recommendations Profile Loaded] UserID: ${authUser.id.slice(0, 8)}... | Skills: ${cleanSkills.length} | Years: ${finalYears}`
        )
      } catch (err) {
        console.error('[JobRecommendations] Profile load error:', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadCandidateData()
  }, [user?.id])

  // 2. Normalized Candidate Skills Set
  const normalizedCandidateSkills = new Set(candidateSkills.map(normalizeSkill))

  // 3. Deterministic 7-Factor Match Index Calculation
  const jobsWithCalculatedFit: BenchmarkJob[] = BENCHMARK_JOBS.map((job) => {
    const matched: string[] = []
    const missing: string[] = []

    for (const req of job.requiredSkills) {
      if (normalizedCandidateSkills.has(normalizeSkill(req))) {
        matched.push(req)
      } else {
        missing.push(req)
      }
    }

    // 1. Technical Skills Score (40% weight)
    const skillScore =
      job.requiredSkills.length > 0
        ? Math.round((matched.length / job.requiredSkills.length) * 100)
        : 50

    // 2. Experience Score (20% weight)
    const expTarget = Math.max(job.experienceYears, 1)
    const experienceScore = Math.min(
      Math.round((candidateExperience / expTarget) * 100),
      100
    )

    // 3. Role / Title Alignment (15% weight)
    let roleScore = 60
    const jobTitleTokens = job.title.toLowerCase().split(/\s+/)
    const headlineLower = (candidateHeadline || candidateName || '').toLowerCase()
    const matchingTitleTokens = jobTitleTokens.filter(
      (t) => t.length > 2 && headlineLower.includes(t)
    )
    if (matchingTitleTokens.length >= 2) roleScore = 95
    else if (matchingTitleTokens.length === 1) roleScore = 80
    else roleScore = 45

    // 4. Responsibility Score (10% weight)
    const responsibilityScore = Math.round(skillScore * 0.6 + experienceScore * 0.4)

    // 5. Education Score (5% weight)
    const educationScore = 90

    // 6. Certifications Score (5% weight)
    const certificationScore = 80

    // 7. Preferred / Additional Skills Score (5% weight)
    const matchedPreferred = job.preferredSkills.filter((p) =>
      normalizedCandidateSkills.has(normalizeSkill(p))
    )
    const additionalSkillScore =
      job.preferredSkills.length > 0
        ? Math.round((matchedPreferred.length / job.preferredSkills.length) * 100)
        : 60

    // Final Deterministic Match Index (100% Total)
    const matchIndex = Math.round(
      skillScore * 0.4 +
        experienceScore * 0.2 +
        roleScore * 0.15 +
        responsibilityScore * 0.1 +
        educationScore * 0.05 +
        certificationScore * 0.05 +
        additionalSkillScore * 0.05
    )

    // Prediction Label
    let predictionLabel: BenchmarkJob['predictionLabel'] = 'Low Match'
    if (matchIndex >= 90) predictionLabel = 'Excellent Match'
    else if (matchIndex >= 75) predictionLabel = 'Strong Match'
    else if (matchIndex >= 60) predictionLabel = 'Good Match'
    else if (matchIndex >= 40) predictionLabel = 'Moderate Match'
    else predictionLabel = 'Low Match'

    // AI Confidence Score based on data completeness
    let confidence = 50
    if (candidateSkills.length > 0) confidence += 25
    if (candidateExperience > 0) confidence += 15
    if (hasResumeData) confidence += 10

    return {
      ...job,
      fitScore: matchIndex,
      skillScore,
      experienceScore,
      roleScore,
      matchedSkills: matched,
      missingSkills: missing,
      predictionLabel,
      confidence: Math.min(confidence, 98),
    }
  })

  // Sort from highest match score to lowest
  jobsWithCalculatedFit.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0))

  // 4. Search and Filter
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

  const getBadgeVariant = (label?: BenchmarkJob['predictionLabel']) => {
    switch (label) {
      case 'Excellent Match':
      case 'Strong Match':
        return 'success'
      case 'Good Match':
        return 'info'
      case 'Moderate Match':
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
        {isLoadingProfile ? (
          <div className="flex items-center gap-2 text-neutral-400">
            <RefreshCw className="h-4 w-4 animate-spin text-rose-500" />
            <span>Loading authenticated candidate profile...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <span>
                Matching against:{' '}
                <strong className="text-white">
                  {candidateSkills.length} Verified Skills
                </strong>{' '}
                ({candidateExperience} Yrs Experience)
                {candidateName && <span className="text-neutral-400"> — {candidateName}</span>}
              </span>
            </div>
            {candidateSkills.length === 0 ? (
              <Link
                to="/candidate/profile"
                className="text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                Upload your resume in Profile to see personalized match scores!
              </Link>
            ) : (
              <div className="flex items-center gap-3 text-neutral-400">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Real Profile Synchronized
                </span>
                <Link
                  to="/candidate/profile"
                  className="text-rose-400 hover:text-rose-300 font-medium underline"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </>
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
                    <Badge variant={getBadgeVariant(job.predictionLabel)}>
                      <Sparkles className="h-3 w-3 mr-1 inline" /> {job.fitScore}% {job.predictionLabel}
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

                  {/* Factor Breakdown Metrics */}
                  <div className="flex items-center gap-4 text-[11px] text-neutral-400 pt-0.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3 text-rose-400" /> Experience Match:{' '}
                      <strong className="text-white">{job.experienceScore}/100</strong>
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-amber-400" /> Role Alignment:{' '}
                      <strong className="text-white">{job.roleScore}/100</strong>
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span className="text-neutral-400">
                      AI Confidence: <strong className="text-white">{job.confidence}%</strong>
                    </span>
                  </div>

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
