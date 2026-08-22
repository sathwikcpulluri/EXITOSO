import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
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
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Fit Assessment History"
        subtitle="Review past job alignment evaluations and track your readiness improvements over time."
        actions={
          <Link to="/candidate/job-fit">
            <Button className="gap-2">
              <Target className="h-4 w-4" /> New Assessment
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-surface-500 font-medium">
          Showing {assessments.length} assessments
        </div>
      </div>

      {/* Assessments Grid / List */}
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-surface-900">{assessment.jobTitle}</h3>
                  <Badge variant={assessment.recommendation === 'strong' ? 'success' : 'warning'}>
                    {assessment.recommendation} match
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-surface-500">
                  <span className="flex items-center gap-1 font-medium text-surface-700">
                    <Building className="h-3.5 w-3.5" /> {assessment.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(assessment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-surface-600 line-clamp-2 pt-1 max-w-2xl">
                  {assessment.explanation}
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-surface-100">
                <div className="text-center">
                  <ScoreRing score={assessment.overallScore} size="md" />
                  <span className="text-[10px] text-surface-400 uppercase font-semibold block mt-1">Match Score</span>
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
          <Card className="p-12 text-center text-surface-400">
            <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No assessment history found matching "{searchTerm}".</p>
          </Card>
        )}
      </div>
    </div>
  )
}
