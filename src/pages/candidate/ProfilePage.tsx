import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { mockCandidateProfile } from '@/lib/mockData'
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  MapPin,
  Save,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react'

import { useAuthStore } from '@/store/authStore'

export default function CandidateProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(mockCandidateProfile)
  const [isSaved, setIsSaved] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const displayName = user?.fullName || 'Alex Johnson'

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: newSkill.trim(), category: 'technical', proficiency: 'intermediate' }],
    }))
    setNewSkill('')
  }

  const handleRemoveSkill = (skillName: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.name !== skillName),
    }))
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl mx-auto">
      <PageHeader
        title="Candidate Profile"
        subtitle="Manage your resume data, key technical skills, work experiences, and career preferences."
        actions={
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaved ? 'Saved Successfully!' : 'Save Changes'}
          </Button>
        }
      />

      {/* Top Profile Summary Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={profile.headline || 'Candidate'} size="lg" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-surface-900">{displayName}</h2>
              <Badge variant="info">{profile.targetSeniority || 'Senior'} Level</Badge>
              <Badge variant="success">Verified Candidate</Badge>
            </div>
            <p className="text-sm text-surface-600">{profile.headline}</p>
            <div className="flex items-center gap-4 text-xs text-surface-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> {profile.experienceYears} Years Experience
              </span>
            </div>
          </div>
          <div className="w-full sm:w-48 bg-surface-50 p-3 rounded-xl border border-surface-200">
            <div className="flex justify-between text-xs font-semibold text-surface-700 mb-1">
              <span>Profile Strength</span>
              <span>{profile.profileCompleteness}%</span>
            </div>
            <ProgressBar value={profile.profileCompleteness} color="primary" size="sm" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Info & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline & Bio */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary-500" /> Professional Headline & Bio
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <Input
                label="Headline"
                value={profile.headline || ''}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={profile.experienceYears || 0}
                  onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })}
                />
              </div>
            </div>
          </Card>

          {/* Skills Management */}
          <Card className="p-6 space-y-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary-500" /> Extracted & Verified Skills
              </CardTitle>
              <span className="text-xs text-surface-500">{profile.skills.length} skills listed</span>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill (e.g. Next.js, Docker, GraphQL)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1"
                />
                <Button variant="secondary" onClick={handleAddSkill} className="gap-1">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {profile.skills.map((skill) => (
                  <Badge
                    key={skill.name}
                    variant={skill.category === 'technical' ? 'info' : 'neutral'}
                    size="md"
                    className="flex items-center gap-1.5 py-1 px-2.5"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-surface-400 hover:text-rose-500 ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Experience List */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-primary-500" /> Work Experience
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-surface-200 bg-surface-50/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-surface-900">{exp.title}</h4>
                      <p className="text-sm text-surface-600 font-medium">{exp.company}</p>
                    </div>
                    <Badge variant={exp.isCurrent ? 'success' : 'neutral'} size="sm">
                      {exp.isCurrent ? 'Current' : 'Past'}
                    </Badge>
                  </div>
                  <p className="text-xs text-surface-500">
                    {exp.startDate} — {exp.endDate || 'Present'}
                  </p>
                  <p className="text-sm text-surface-700 pt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Resume & Education & Preferences */}
        <div className="space-y-6">
          {/* Resume Snapshot */}
          <Card className="p-6 space-y-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-4 w-4 text-emerald-500" /> Parsed Resume Data
              </CardTitle>
            </CardHeader>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI Parsing Confidence: 92%
              </p>
              <p>10 skills extracted, 3 roles verified from uploaded PDF.</p>
            </div>
            <Button variant="outline" className="w-full text-xs">
              Upload New Resume PDF
            </Button>
          </Card>

          {/* Education & Certs */}
          <Card className="p-6 space-y-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary-500" /> Education & Certifications
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="text-sm border-b border-surface-100 pb-3">
                  <p className="font-semibold text-surface-900">{edu.degree}</p>
                  <p className="text-xs text-surface-500">{edu.institution} • {edu.year}</p>
                </div>
              ))}
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="text-sm flex items-start gap-2 pt-1">
                  <Award className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-surface-900 text-xs">{cert.name}</p>
                    <p className="text-xs text-surface-400">{cert.issuer} • {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6 space-y-3">
            <CardHeader>
              <CardTitle className="text-base">Job Preferences</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-surface-400">Work Type:</span>
                <div className="flex gap-1.5 mt-1">
                  {profile.preferences.workType?.map((w) => (
                    <Badge key={w} variant="neutral" size="sm" className="capitalize">
                      {w}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-surface-400">Target Industries:</span>
                <p className="font-medium text-surface-700 mt-0.5">
                  {profile.preferences.industries?.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-surface-400">Salary Expectation:</span>
                <p className="font-semibold text-surface-900 mt-0.5">
                  ${profile.preferences.salaryMin?.toLocaleString()} - ${profile.preferences.salaryMax?.toLocaleString()} / yr
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
