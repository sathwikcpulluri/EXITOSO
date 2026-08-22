import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { mockFitAssessments } from '@/lib/mockData'
import {
  History,
  Search,
  ArrowRight,
  Target,
  Calendar,
  Building,
} from 'lucide-react'

export default function FitHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const assessments = mockFitAssessments.filter(
    (a) =>
      a.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.companyName && a.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-8 animate-fade-in pb-12 text-white">
      <PageHeader
        title="Prediction & Assessment History"
        subtitle="Review past job alignment evaluations and track your readiness improvements over time."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2 shadow-[0_0_20px_rgba(255,0,94,0.35)]">
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
          Showing {assessments.length} past predictions
        </div>
      </div>

      {/* Assessments Grid / List */}
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="p-6 border-white/10 hover:border-white/20 transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-white tracking-tight">{assessment.jobTitle}</h3>
                  <Badge variant={assessment.recommendation === 'strong' ? 'success' : 'warning'}>
                    {assessment.recommendation} match
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-200">
                    <Building className="h-3.5 w-3.5 text-orange-400" /> {assessment.companyName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-rose-400" /> {new Date(assessment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 pt-1 max-w-2xl leading-relaxed">
                  {assessment.explanation}
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-white/[0.08]">
                <div className="text-center">
                  <ScoreRing score={assessment.overallScore} size="md" />
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block mt-1">Match Score</span>
                </div>
                <Link to="/candidate/job-fit">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    View Details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {assessments.length === 0 && (
          <Card className="p-12 text-center text-neutral-500 border-white/10">
            <History className="h-10 w-10 mx-auto mb-2 opacity-40 text-orange-400" />
            <p className="text-sm font-semibold">No prediction history found matching "{searchTerm}".</p>
          </Card>
        )}
      </div>
    </div>
  )
}
