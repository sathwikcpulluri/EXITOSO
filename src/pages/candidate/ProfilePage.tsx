import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
  const displayName = user?.fullName || 'Candidate'

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
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto text-white">
      <PageHeader
        title="Candidate Profile & Extracted Skills"
        subtitle="Manage your parsed resume data, verified technical skills taxonomy, work history, and target career preferences."
        actions={
          <Button onClick={handleSave} className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
            <Save className="h-4 w-4" />
            {isSaved ? 'Saved Successfully!' : 'Save Changes'}
          </Button>
        }
      />

      {/* Top Profile Summary Header */}
      <Card className="p-6 border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={displayName} size="lg" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{displayName}</h2>
              <Badge variant="info">{profile.targetSeniority || 'Senior'} Level</Badge>
              <Badge variant="success">Verified Candidate</Badge>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">{profile.headline}</p>
            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-400" /> {profile.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-orange-400" /> {profile.experienceYears} Years Experience
              </span>
            </div>
          </div>
          <div className="w-full sm:w-52 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
              <span>Profile Strength</span>
              <span className="text-orange-400">{profile.profileCompleteness}%</span>
            </div>
            <ProgressBar value={profile.profileCompleteness} color="primary" size="sm" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Info & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline & Bio */}
          <Card className="p-6 space-y-4 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-orange-400" /> Professional Headline & Bio
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  value={profile.headline || ''}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={profile.experienceYears || 0}
                    onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Skills Management */}
          <Card className="p-6 space-y-4 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-rose-400" /> Extracted & Verified Skills (115 Taxonomy)
              </CardTitle>
              <span className="text-xs text-neutral-500">{profile.skills.length} skills listed</span>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  placeholder="Add skill (e.g. Next.js, Docker, PyTorch, GraphQL)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
                <Button variant="secondary" onClick={handleAddSkill} className="gap-1 text-xs">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-neutral-200"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-neutral-500 hover:text-rose-400 ml-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Experience List */}
          <Card className="p-6 space-y-4 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-amber-400" /> Work Experience Chronology
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div key={exp.id} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{exp.title}</h4>
                      <p className="text-xs text-neutral-400 font-medium">{exp.company}</p>
                    </div>
                    <Badge variant={exp.isCurrent ? 'success' : 'neutral'} size="sm">
                      {exp.isCurrent ? 'Current' : 'Past'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {exp.startDate} — {exp.endDate || 'Present'}
                  </p>
                  <p className="text-xs text-neutral-300 pt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Resume & Education & Preferences */}
        <div className="space-y-6">
          {/* Resume Snapshot */}
          <Card className="p-6 space-y-3 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-4 w-4 text-emerald-400" /> Parsed Resume Data
              </CardTitle>
            </CardHeader>
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> AI Parsing Confidence: 92%
              </p>
              <p className="text-neutral-400">10 skills extracted, 3 roles verified from uploaded PDF.</p>
            </div>
            <Button variant="outline" className="w-full text-xs">
              Upload New Resume PDF
            </Button>
          </Card>

          {/* Education & Certs */}
          <Card className="p-6 space-y-4 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-rose-400" /> Education & Certifications
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {profile.education.map((edu) => (
                <div key={edu.id} className="text-xs border-b border-white/[0.08] pb-3 space-y-0.5">
                  <p className="font-bold text-white">{edu.degree}</p>
                  <p className="text-neutral-500">{edu.institution} • {edu.year}</p>
                </div>
              ))}
              {profile.certifications.map((cert) => (
                <div key={cert.id} className="text-xs flex items-start gap-2 pt-1">
                  <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">{cert.name}</p>
                    <p className="text-neutral-500">{cert.issuer} • {cert.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6 space-y-3 border-white/10">
            <CardHeader>
              <CardTitle className="text-base">Job Preferences</CardTitle>
            </CardHeader>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500">Work Type:</span>
                <div className="flex gap-1.5 mt-1">
                  {profile.preferences.workType?.map((w) => (
                    <span key={w} className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-semibold text-neutral-300 capitalize">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-neutral-500">Target Industries:</span>
                <p className="font-semibold text-neutral-300 mt-0.5">
                  {profile.preferences.industries?.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Salary Expectation:</span>
                <p className="font-bold text-orange-400 mt-0.5">
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
