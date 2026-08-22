import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { api, type WorkExperienceItem, type EducationItem } from '@/lib/api'
import { extractTextFromPdf } from '@/lib/pdfExtractor'
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
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Upload,
} from 'lucide-react'

interface SkillItem {
  name: string
  category?: string
  proficiency?: string
}

export default function CandidateProfilePage() {
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Real profile data states (Loaded strictly from Supabase)
  const [candidateName, setCandidateName] = useState(user?.fullName || '')
  const [headline, setHeadline] = useState('')
  const [location, setLocation] = useState('')
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [skills, setSkills] = useState<SkillItem[]>([])
  const [experience, setExperience] = useState<WorkExperienceItem[]>([])
  const [education, setEducation] = useState<EducationItem[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [resumeFilename, setResumeFilename] = useState<string | null>(null)
  const [parsingConfidence, setParsingConfidence] = useState<number>(0)

  // Job Preferences
  const [workTypes, setWorkTypes] = useState<string[]>(['Remote', 'Hybrid'])
  const [targetIndustries, setTargetIndustries] = useState('Technology, SaaS')
  const [salaryMin, setSalaryMin] = useState('120000')
  const [salaryMax, setSalaryMax] = useState('160000')

  // UI state
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [newSkill, setNewSkill] = useState('')

  const displayName = candidateName || user?.fullName || 'Candidate'

  // Fetch authenticated user's profile from Supabase on mount
  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.id) {
        setIsLoadingProfile(false)
        return
      }

      setIsLoadingProfile(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.warn('[Supabase Profile Load Warning]', error.message)
        } else if (data) {
          if (data.full_name) setCandidateName(data.full_name)
          setHeadline(data.headline || '')
          setLocation(data.location || '')
          setExperienceYears(Number(data.experience_years) || 0)
          setResumeFilename(data.resume_filename || null)
          setParsingConfidence(Number(data.parsing_confidence) || 0)

          if (Array.isArray(data.skills)) {
            setSkills(
              typeof data.skills[0] === 'string'
                ? data.skills.map((s: string) => ({ name: s, category: 'technical' }))
                : data.skills
            )
          }

          if (Array.isArray(data.experience)) {
            setExperience(data.experience)
          }

          if (Array.isArray(data.education)) {
            setEducation(data.education)
          }

          if (Array.isArray(data.certifications)) {
            setCertifications(data.certifications)
          }

          if (data.preferences) {
            if (Array.isArray(data.preferences.workType)) {
              setWorkTypes(data.preferences.workType)
            }
            if (Array.isArray(data.preferences.industries)) {
              setTargetIndustries(data.preferences.industries.join(', '))
            }
            if (data.preferences.salaryMin) {
              setSalaryMin(String(data.preferences.salaryMin))
            }
            if (data.preferences.salaryMax) {
              setSalaryMax(String(data.preferences.salaryMax))
            }
          }
        }
      } catch (err) {
        console.error('[CareerAI Load Profile Exception]', err)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [user?.id])

  // Calculate profile completeness score
  const calculateCompleteness = () => {
    let score = 20
    if (headline) score += 20
    if (location) score += 15
    if (skills.length > 0) score += 25
    if (experienceYears > 0 || experience.length > 0) score += 20
    return Math.min(score, 100)
  }

  // Save changes to Supabase
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user?.id) return

    setIsSaving(true)
    setSaveSuccess('')
    setErrorMessage('')

    try {
      const payload = {
        full_name: candidateName || user.fullName,
        headline,
        location,
        experience_years: experienceYears,
        skills,
        experience,
        education,
        certifications,
        preferences: {
          workType: workTypes,
          industries: targetIndustries.split(',').map((s) => s.trim()).filter(Boolean),
          salaryMin: Number(salaryMin) || 0,
          salaryMax: Number(salaryMax) || 0,
        },
        resume_filename: resumeFilename,
        parsing_confidence: parsingConfidence,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id)

      if (error) {
        console.error('[Supabase Save Profile Error]', error)
        setErrorMessage(`Failed to save changes: ${error.message}`)
      } else {
        if (candidateName && candidateName !== user.fullName) {
          setUser({ ...user, fullName: candidateName })
        }
        setSaveSuccess('Profile changes saved successfully!')
        setTimeout(() => setSaveSuccess(''), 4000)
      }
    } catch (err: any) {
      console.error('[CareerAI Save Exception]', err)
      setErrorMessage('Unable to connect. Please check your internet connection.')
    } finally {
      setIsSaving(false)
    }
  }

  // Triggers native OS file picker
  const handleTriggerResumePicker = () => {
    if (isParsingResume) return
    fileInputRef.current?.click()
  }

  // Real resume upload and parsing handler
  const handleResumeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''

    if (!file || !user?.id) return

    setErrorMessage('')
    setSaveSuccess('')

    // 1. Validate file
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setErrorMessage('Please upload a valid PDF document (.pdf).')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File exceeds the 10MB size limit. Please upload a smaller PDF.')
      return
    }

    setIsParsingResume(true)

    try {
      // 2. Upload to Supabase Storage (if configured)
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${user.id}/${Date.now()}_${sanitizedName}`

      try {
        await supabase.storage
          .from('resumes')
          .upload(storagePath, file, { upsert: true })
      } catch (storageErr) {
        console.warn('[Supabase Storage]', storageErr)
      }

      // 3. Extract text from uploaded PDF
      const pdfText = await extractTextFromPdf(file)

      if (!pdfText || pdfText.trim().length < 15) {
        setIsParsingResume(false)
        setErrorMessage('Could not extract enough information from this resume. Please upload another PDF.')
        return
      }

      // 4. Send text to parsing engine
      const parseResult = await api.parseResume(pdfText)

      // 5. Update state with real extracted values
      const parsedSkillItems: SkillItem[] = parseResult.extracted_skills.map((s) => ({
        name: s.name,
        category: s.category || 'technical',
      }))

      if (parseResult.full_name) {
        setCandidateName(parseResult.full_name)
        setUser({ ...user, fullName: parseResult.full_name })
      }

      if (parseResult.headline) {
        setHeadline(parseResult.headline)
      } else if (parsedSkillItems.length > 0) {
        setHeadline(`${parsedSkillItems.slice(0, 3).map((s) => s.name).join(', ')} Professional`)
      }

      if (parseResult.location) {
        setLocation(parseResult.location)
      }

      if (parseResult.years_experience !== undefined) {
        setExperienceYears(parseResult.years_experience)
      }

      setSkills(parsedSkillItems)
      setExperience(parseResult.work_experience || [])
      setEducation(parseResult.education || [])
      setCertifications(parseResult.certifications || [])
      setResumeFilename(file.name)
      setParsingConfidence(parseResult.confidence || 0)

      // 6. Persist extracted profile directly to Supabase
      const updatePayload = {
        full_name: parseResult.full_name || candidateName || user.fullName,
        headline: parseResult.headline || (parsedSkillItems.length > 0 ? `${parsedSkillItems.slice(0, 3).map((s) => s.name).join(', ')} Professional` : null),
        location: parseResult.location || location || null,
        experience_years: parseResult.years_experience ?? experienceYears,
        skills: parsedSkillItems,
        experience: parseResult.work_experience || [],
        education: parseResult.education || [],
        certifications: parseResult.certifications || [],
        resume_filename: file.name,
        parsing_confidence: parseResult.confidence || 0,
        updated_at: new Date().toISOString(),
      }

      await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

      setSaveSuccess('Resume analyzed successfully.')
    } catch (err: any) {
      console.error('[CareerAI Resume Parse Exception]', err)
      const msg = err?.message || ''
      if (msg.includes('enough') || msg.includes('readable')) {
        setErrorMessage('Could not extract enough information from this resume.')
      } else {
        setErrorMessage('Resume analysis failed. Please try again.')
      }
    } finally {
      setIsParsingResume(false)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) return
    const skillName = newSkill.trim()
    if (!skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSkills((prev) => [...prev, { name: skillName, category: 'technical' }])
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName))
  }

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-neutral-400">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
        <p className="text-sm">Loading your profile from database...</p>
      </div>
    )
  }

  const profileCompleteness = calculateCompleteness()

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-5xl mx-auto text-white">
      {/* Hidden File Input for Real Resume Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,application/pdf"
        onChange={handleResumeFileSelected}
        className="hidden"
      />

      <PageHeader
        title="Candidate Profile & Extracted Skills"
        subtitle="Manage your parsed resume data, verified technical skills taxonomy, work history, and target career preferences."
        actions={
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        }
      />

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Top Profile Summary Header */}
      <Card className="p-6 border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={displayName} size="lg" />
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-extrabold text-white tracking-tight">{displayName}</h2>
              <Badge variant="info">
                {experienceYears >= 5 ? 'Senior' : experienceYears >= 2 ? 'Mid' : 'Junior'} Level
              </Badge>
              <Badge variant="success">Active Candidate</Badge>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              {headline || 'No professional headline provided yet. Upload your resume or add one below.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-400" />
                {location || 'Location not specified'}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-orange-400" />
                {experienceYears} Years Experience
              </span>
            </div>
          </div>
          <div className="w-full sm:w-52 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex justify-between text-xs font-bold text-neutral-300 mb-1.5">
              <span>Profile Strength</span>
              <span className="text-orange-400">{profileCompleteness}%</span>
            </div>
            <ProgressBar value={profileCompleteness} color="primary" size="sm" />
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
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer | React, TypeScript, Cloud"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. New York, NY / Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Math.max(0, Number(e.target.value)))}
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
                <Sparkles className="h-4 w-4 text-rose-400" /> Extracted & Verified Skills ({skills.length})
              </CardTitle>
              <span className="text-xs text-neutral-500">{skills.length} skills listed</span>
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
                <Button variant="secondary" onClick={handleAddSkill} className="gap-1 text-xs cursor-pointer">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>

              {skills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  No skills listed yet. Upload your resume or type skills above.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="inline-flex items-center gap-1.5 py-1 px-3 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-semibold text-neutral-200"
                    >
                      <span>{skill.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-neutral-500 hover:text-rose-400 ml-1 transition-colors cursor-pointer"
                        title="Remove skill"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
              {experience.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">
                  No previous work experience entries logged. Upload a resume PDF to parse your career history.
                </p>
              ) : (
                experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{exp.job_title}</h4>
                        <p className="text-xs text-neutral-400 font-medium">{exp.company}</p>
                      </div>
                      <Badge variant={exp.isCurrent ? 'success' : 'neutral'} size="sm">
                        {exp.isCurrent ? 'Current' : 'Past'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      {exp.start_date} — {exp.end_date || 'Present'}
                    </p>
                    <p className="text-xs text-neutral-300 pt-1 leading-relaxed">{exp.description}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Resume & Education & Preferences */}
        <div className="space-y-6">
          {/* Resume Snapshot & Upload Button */}
          <Card className="p-6 space-y-3 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileCheck className="h-4 w-4 text-emerald-400" /> Parsed Resume Data
              </CardTitle>
            </CardHeader>

            {resumeFilename ? (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 space-y-1">
                {parsingConfidence > 0 && (
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> AI Parsing Confidence: {parsingConfidence}%
                  </p>
                )}
                <p className="text-neutral-400">
                  {skills.length} skills extracted from <span className="text-white font-medium">{resumeFilename}</span>.
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs text-neutral-400 space-y-1">
                <p className="font-medium text-neutral-300">No Resume Uploaded</p>
                <p className="text-[11px]">Upload a PDF to parse your skills & experience.</p>
              </div>
            )}

            <Button
              variant="outline"
              type="button"
              disabled={isParsingResume}
              onClick={handleTriggerResumePicker}
              className="w-full text-xs gap-2 cursor-pointer"
            >
              {isParsingResume ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-400" />
                  Analyzing your resume...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5 text-orange-400" />
                  Upload New Resume PDF
                </>
              )}
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
              {education.length === 0 && certifications.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No education or certification records added yet.</p>
              ) : (
                <>
                  {education.map((edu, idx) => (
                    <div key={edu.id || idx} className="text-xs border-b border-white/[0.08] pb-3 space-y-0.5">
                      <p className="font-bold text-white">{edu.degree}</p>
                      <p className="text-neutral-500">{edu.institution} • {edu.graduation_year}</p>
                    </div>
                  ))}
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2 pt-1">
                      <Award className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-white">{cert}</p>
                        <p className="text-neutral-500">Verified Credential</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
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
                  {workTypes.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-semibold text-neutral-300 capitalize"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-neutral-500">Target Industries:</span>
                <input
                  type="text"
                  value={targetIndustries}
                  onChange={(e) => setTargetIndustries(e.target.value)}
                  placeholder="e.g. Technology, SaaS, Fintech"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-neutral-500">Min Salary ($):</span>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                  />
                </div>
                <div>
                  <span className="text-neutral-500">Max Salary ($):</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
