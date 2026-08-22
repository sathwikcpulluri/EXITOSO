import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { ScoreBar } from '@/components/ui/ScoreBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import {
  History,
  Search,
  ArrowRight,
  Target,
  Calendar,
  Building,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  BookOpen,
} from 'lucide-react'

export interface SavedPrediction {
  id: string
  user_id: string
  job_id?: string
  job_title: string
  company: string
  match_score: number
  prediction_label: string
  confidence: number
  skill_score: number
  experience_score: number
  role_score: number
  responsibility_score?: number
  education_score?: number
  certification_score?: number
  matched_skills?: string[]
  missing_skills?: string[]
  skill_gaps?: Array<{ skill: string; importance: string; suggestion?: string }>
  factors?: Array<{ name: string; direction: 'positive' | 'negative'; description: string }>
  recommendations?: string[]
  summary?: string
  created_at: string
}

export default function FitHistoryPage() {
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [predictions, setPredictions] = useState<SavedPrediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrediction, setSelectedPrediction] = useState<SavedPrediction | null>(null)

  // 1. Fetch real prediction history from Supabase
  useEffect(() => {
    async function loadHistory() {
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

        // 1. Query public.prediction_history table
        const { data: dbData } = await supabase
          .from('prediction_history')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })

        // 2. Query auth user_metadata fallback
        const metaList: SavedPrediction[] = Array.isArray(authUser.user_metadata?.prediction_history)
          ? authUser.user_metadata.prediction_history
          : []

        // 3. Merge unique records by ID or timestamp
        const combined = [...(Array.isArray(dbData) ? dbData : [])]
        for (const metaItem of metaList) {
          if (!combined.some((c) => c.id === metaItem.id || (c.created_at === metaItem.created_at && c.job_title === metaItem.job_title))) {
            combined.push(metaItem)
          }
        }

        // Sort newest first
        combined.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        setPredictions(combined)
      } catch (err) {
        console.error('[FitHistory] Load exception:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [user?.id])

  // 2. Filter by search term
  const filteredPredictions = predictions.filter((p) => {
    const term = searchTerm.toLowerCase()
    return (
      (p.job_title && p.job_title.toLowerCase().includes(term)) ||
      (p.company && p.company.toLowerCase().includes(term)) ||
      (p.prediction_label && p.prediction_label.toLowerCase().includes(term))
    )
  })

  const getBadgeVariant = (label?: string) => {
    const l = (label || '').toLowerCase()
    if (l.includes('excellent') || l.includes('strong')) return 'success'
    if (l.includes('good')) return 'info'
    if (l.includes('moderate') || l.includes('partial')) return 'warning'
    return 'neutral'
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white max-w-6xl mx-auto">
      <PageHeader
        title="Prediction & Assessment History"
        subtitle="Review past job alignment evaluations and track your readiness improvements over time."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer">
              <Target className="h-4 w-4" /> New Prediction
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
          />
        </div>
        <div className="text-xs text-neutral-400 font-semibold">
          Showing {filteredPredictions.length} saved prediction{filteredPredictions.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Assessments Grid / List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-neutral-400 gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
            <span className="text-sm">Loading your prediction history...</span>
          </div>
        ) : filteredPredictions.length > 0 ? (
          filteredPredictions.map((prediction) => (
            <Card
              key={prediction.id || prediction.created_at}
              className="p-6 border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {prediction.job_title}
                    </h3>
                    <Badge variant={getBadgeVariant(prediction.prediction_label)}>
                      <Sparkles className="h-3 w-3 mr-1 inline" />
                      {(prediction.prediction_label || 'Calculated').toUpperCase()} MATCH
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-400 flex-wrap">
                    <span className="flex items-center gap-1.5 font-semibold text-neutral-200">
                      <Building className="h-3.5 w-3.5 text-orange-400" /> {prediction.company}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-rose-400" />{' '}
                      {new Date(prediction.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-neutral-600">•</span>
                    <span>AI Confidence: {prediction.confidence || 90}%</span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 pt-1 max-w-2xl leading-relaxed">
                    {prediction.summary || 'Detailed candidate-to-role semantic evaluation recorded.'}
                  </p>
                </div>

                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                  <div className="text-center">
                    <ScoreRing score={prediction.match_score} size="md" />
                    <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">
                      Match Score
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPrediction(prediction)}
                    className="gap-1 text-xs cursor-pointer"
                  >
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center text-neutral-500 border-white/10 space-y-4">
            <History className="h-10 w-10 mx-auto opacity-40 text-orange-400" />
            <div className="space-y-1">
              <p className="text-base font-bold text-neutral-300">No predictions yet.</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Evaluate a job description in the AI Role Predictor to generate and save your first personalized fit score!
              </p>
            </div>
            <Link to="/candidate/job-fit">
              <Button size="sm" className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)] cursor-pointer mt-2">
                <Target className="h-4 w-4" /> Create New Prediction
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Interactive Full Details Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-extrabold text-white">{selectedPrediction.job_title}</h3>
                  <Badge variant={getBadgeVariant(selectedPrediction.prediction_label)}>
                    {(selectedPrediction.prediction_label || 'Calculated').toUpperCase()} MATCH
                  </Badge>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  {selectedPrediction.company} • Evaluated on{' '}
                  {new Date(selectedPrediction.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedPrediction(null)}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score Overview */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Overall Match Index</p>
                <p className="text-xs text-emerald-400 mt-0.5">AI Confidence: {selectedPrediction.confidence || 90}%</p>
              </div>
              <ScoreRing score={selectedPrediction.match_score} size="md" />
            </div>

            {/* Component Score Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ScoreBar label="Technical Skill Match" score={selectedPrediction.skill_score} />
              <ScoreBar label="Experience Depth" score={selectedPrediction.experience_score} />
              <ScoreBar label="Role Alignment" score={selectedPrediction.role_score} />
              <ScoreBar
                label="Education & Domain Match"
                score={selectedPrediction.education_score || 85}
              />
            </div>

            {/* AI Summary */}
            {selectedPrediction.summary && (
              <div className="space-y-1.5 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-orange-400" /> AI Evaluation Summary
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                  {selectedPrediction.summary}
                </p>
              </div>
            )}

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Matched Skills (
                  {selectedPrediction.matched_skills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPrediction.matched_skills && selectedPrediction.matched_skills.length > 0 ? (
                    selectedPrediction.matched_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-500 italic">None logged</span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Missing Competencies (
                  {selectedPrediction.missing_skills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPrediction.missing_skills && selectedPrediction.missing_skills.length > 0 ? (
                    selectedPrediction.missing_skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[11px] font-semibold text-amber-300"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-medium">No major gaps identified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations if present */}
            {selectedPrediction.recommendations && selectedPrediction.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" /> Actionable Next Steps
                </h4>
                <div className="space-y-1.5">
                  {selectedPrediction.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-neutral-300 flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPrediction(null)}
                className="cursor-pointer"
              >
                Close Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
