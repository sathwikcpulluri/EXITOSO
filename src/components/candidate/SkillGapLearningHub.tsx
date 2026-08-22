import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { api, type SkillGapPackage, type RoadmapStep, type LearningResourceItem } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Sparkles,
  BookOpen,
  Tv,
  GraduationCap,
  FileCode,
  Wrench,
  Bookmark,
  CheckCircle,
  Clock,
  RefreshCw,
  Award,
  Layers,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
} from 'lucide-react'

interface SkillGapLearningHubProps {
  missingSkills: string[]
  jobTitle: string
  companyName: string
  onReevaluate?: () => void
}

export function SkillGapLearningHub({
  missingSkills,
  jobTitle,
  companyName,
  onReevaluate,
}: SkillGapLearningHubProps) {
  const { user } = useAuthStore()
  const [packages, setPackages] = useState<SkillGapPackage[]>([])
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([])
  const [resumeTips, setResumeTips] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Filter & tab states
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  // Progress & saved state
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set())
  const [completedResourceIds, setCompletedResourceIds] = useState<Set<string>>(new Set())

  // Load resources from API
  useEffect(() => {
    async function loadResources() {
      if (!missingSkills || missingSkills.length === 0) {
        setIsLoading(false)
        setPackages([])
        setRoadmap([])
        return
      }

      setIsLoading(true)
      try {
        const response = await api.getLearningResources(missingSkills, jobTitle, companyName)
        setPackages(response.skill_packages || [])
        setRoadmap(response.roadmap || [])
        setResumeTips(response.resume_improvement_tips || [])
      } catch (err) {
        console.error('[LearningHub Error]', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadResources()
  }, [missingSkills.join(','), jobTitle, companyName])

  // Load saved and completed status from Supabase
  useEffect(() => {
    async function loadSavedState() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) return

        const { data } = await supabase
          .from('saved_learning_resources')
          .select('*')
          .eq('user_id', authUser.id)

        if (Array.isArray(data)) {
          const saved = new Set<string>()
          const completed = new Set<string>()
          for (const item of data) {
            saved.add(item.url)
            if (item.completed) completed.add(item.url)
          }
          setSavedResourceIds(saved)
          setCompletedResourceIds(completed)
        }
      } catch (err) {
        console.warn('[LearningHub Load Saved State]', err)
      }
    }

    loadSavedState()
  }, [user?.id])

  // Toggle Save resource to Supabase
  const handleToggleSave = async (res: LearningResourceItem) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) return

      const isSaved = savedResourceIds.has(res.url)
      if (isSaved) {
        // Remove
        await supabase
          .from('saved_learning_resources')
          .delete()
          .eq('user_id', authUser.id)
          .eq('url', res.url)

        setSavedResourceIds((prev) => {
          const next = new Set(prev)
          next.delete(res.url)
          return next
        })
      } else {
        // Add
        await supabase.from('saved_learning_resources').insert([
          {
            user_id: authUser.id,
            skill: res.skill,
            resource_type: res.resource_type,
            title: res.title,
            provider: res.provider,
            url: res.url,
            description: res.description,
            difficulty: res.difficulty || 'Beginner',
            estimated_hours: 4,
            completed: false,
          },
        ])

        setSavedResourceIds((prev) => new Set(prev).add(res.url))
      }
    } catch (err) {
      console.error('[Toggle Save Error]', err)
    }
  }

  // Toggle Complete resource
  const handleToggleComplete = async (res: LearningResourceItem) => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) return

      const isCompleted = completedResourceIds.has(res.url)
      const nextCompleted = !isCompleted

      // Upsert into Supabase
      await supabase.from('saved_learning_resources').upsert(
        [
          {
            user_id: authUser.id,
            skill: res.skill,
            resource_type: res.resource_type,
            title: res.title,
            provider: res.provider,
            url: res.url,
            completed: nextCompleted,
          },
        ],
        { onConflict: 'user_id,url' }
      )

      setCompletedResourceIds((prev) => {
        const next = new Set(prev)
        if (nextCompleted) next.add(res.url)
        else next.delete(res.url)
        return next
      })
      setSavedResourceIds((prev) => new Set(prev).add(res.url))
    } catch (err) {
      console.error('[Toggle Complete Error]', err)
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Tv className="h-4 w-4 text-rose-400" />
      case 'course':
        return <GraduationCap className="h-4 w-4 text-orange-400" />
      case 'documentation':
        return <FileCode className="h-4 w-4 text-blue-400" />
      case 'practice':
        return <Wrench className="h-4 w-4 text-emerald-400" />
      default:
        return <BookOpen className="h-4 w-4 text-purple-400" />
    }
  }

  const getResourceActionText = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return 'Watch Video →'
      case 'course':
        return 'View Course →'
      case 'documentation':
        return 'Open Documentation →'
      case 'practice':
        return 'Start Practicing →'
      default:
        return 'Explore Resource →'
    }
  }

  // Calculate learning progress
  const totalResources = packages.reduce((acc, p) => acc + p.resources.length, 0)
  const completedCount = completedResourceIds.size
  const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0

  if (isLoading) {
    return (
      <Card className="p-8 text-center border-white/10 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-rose-500 mx-auto" />
        <p className="text-xs text-neutral-400">Discovering verified learning resources for your missing skills...</p>
      </Card>
    )
  }

  if (!missingSkills || missingSkills.length === 0 || packages.length === 0) {
    return (
      <Card className="p-8 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-950 border border-emerald-500/30 text-white space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">🎉 No major skill gaps detected</h3>
            <p className="text-xs text-emerald-400/90 mt-0.5">
              Your profile satisfies all core requirements for the {jobTitle} position at {companyName}.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Optional Ways to Strengthen Your Profile
          </h4>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Prepare system design trade-off examples for interview rounds.
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Quantify production business metrics on your resume.
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Showcase technical leadership and cross-functional team achievements.
            </li>
          </ul>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in text-white pt-4">
      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Close Your Skill Gaps</h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Recommended resources based on the {missingSkills.length} skill{missingSkills.length === 1 ? '' : 's'} you are missing for this role.
          </p>
        </div>

        {/* Learning Progress Indicator */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">My Learning Progress</span>
            <span className="font-extrabold text-emerald-400">
              {completedCount} / {totalResources} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'video', label: 'Videos' },
            { id: 'course', label: 'Courses' },
            { id: 'documentation', label: 'Documentation' },
            { id: 'practice', label: 'Practice' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                activeTypeFilter === tab.id
                  ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(255,0,94,0.4)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 font-semibold">Difficulty:</span>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white text-xs outline-none"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {/* Skill Packages Grid */}
      <div className="space-y-6">
        {packages.map((pkg) => {
          // Filter resources
          const filteredResources = pkg.resources.filter((r) => {
            const matchesType = activeTypeFilter === 'all' || r.resource_type.toLowerCase() === activeTypeFilter
            const matchesDiff =
              selectedDifficulty === 'all' ||
              (r.difficulty && r.difficulty.toLowerCase().includes(selectedDifficulty))
            return matchesType && matchesDiff
          })

          return (
            <Card
              key={pkg.skill}
              className="p-6 border-white/10 hover:border-white/20 transition-all space-y-6 bg-gradient-to-b from-white/[0.02] to-transparent"
            >
              {/* Skill Package Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-extrabold text-white tracking-tight">{pkg.skill}</h3>
                    <Badge
                      variant={
                        pkg.priority === 'HIGH'
                          ? 'danger'
                          : pkg.priority === 'MEDIUM'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {pkg.priority} PRIORITY
                    </Badge>
                    <span className="text-xs text-neutral-400">
                      Level: <strong className="text-neutral-200">{pkg.difficulty}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <strong className="text-neutral-300">Why learn this: </strong>
                    {pkg.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
                  <Clock className="h-4 w-4 text-orange-400" />
                  <span>Est. ~{pkg.estimated_learning_hours} Hours</span>
                </div>
              </div>

              {/* Verified Learning Resources List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.length > 0 ? (
                  filteredResources.map((res) => {
                    const isSaved = savedResourceIds.has(res.url)
                    const isCompleted = completedResourceIds.has(res.url)

                    return (
                      <div
                        key={res.url}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isCompleted
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300">
                              {getResourceTypeIcon(res.resource_type)}
                              {res.resource_type}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleSave(res)}
                                title={isSaved ? 'Remove from saved' : 'Save resource'}
                                className={`p-1 rounded hover:bg-white/10 cursor-pointer ${
                                  isSaved ? 'text-rose-400' : 'text-neutral-500'
                                }`}
                              >
                                <Bookmark className="h-3.5 w-3.5 fill-current" />
                              </button>
                              <button
                                onClick={() => handleToggleComplete(res)}
                                title={isCompleted ? 'Mark incomplete' : 'Mark as complete'}
                                className={`p-1 rounded hover:bg-white/10 cursor-pointer ${
                                  isCompleted ? 'text-emerald-400' : 'text-neutral-500'
                                }`}
                              >
                                <CheckCircle className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                            {res.title}
                          </h4>
                          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                            {res.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                          <span className="text-[10px] text-neutral-400 font-semibold truncate">
                            {res.provider}
                          </span>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-rose-500 hover:text-white text-xs font-bold text-neutral-200 transition-all cursor-pointer shrink-0"
                          >
                            {getResourceActionText(res.resource_type)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full py-4 text-center text-xs text-neutral-500 italic">
                    No resources matched the selected filter criteria.
                  </div>
                )}
              </div>

              {/* Suggested Project & Resume Evidence */}
              <div className="p-3.5 rounded-xl bg-orange-950/20 border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <FolderGit2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>
                    <strong className="text-orange-300">Suggested Proof Project: </strong>
                    {pkg.suggested_resume_project}
                  </span>
                </div>
                <Link
                  to="/candidate/profile"
                  className="text-rose-400 hover:text-rose-300 underline font-semibold shrink-0 cursor-pointer"
                >
                  Add Project to Profile →
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recommended Learning Path / Roadmap */}
      {roadmap.length > 0 && (
        <Card className="p-6 border-white/10 space-y-4">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-rose-400" /> Recommended Learning Path
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {roadmap.map((step) => (
              <div
                key={step.step_number}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 relative space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold uppercase">
                    Step {step.step_number}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-semibold">
                    ~{step.estimated_hours} Hours
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white">{step.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">{step.action_item}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resume Improvement Advice & Re-evaluate Action */}
      <Card className="p-6 border-white/10 bg-gradient-to-r from-neutral-900 to-rose-950/30 space-y-4">
        <CardHeader>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-400" /> 💼 Improve Your Resume & Re-evaluate
          </CardTitle>
        </CardHeader>

        <div className="space-y-2 text-xs text-neutral-300">
          {resumeTips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">
            Once you have added new verified skills or projects to your profile, re-evaluate to see your updated hiring probability.
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/candidate/profile">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                Edit Profile
              </Button>
            </Link>
            {onReevaluate && (
              <Button
                size="sm"
                onClick={onReevaluate}
                className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)] text-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Re-evaluate My Profile
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
