import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/ui/Stepper'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { extractTextFromPdf } from '@/lib/pdfExtractor'
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  User,
  AlertCircle,
  FileText,
  RefreshCw,
} from 'lucide-react'

export default function CandidateOnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeStep, setActiveStep] = useState(0)

  // Real file & upload states (initial: null/false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])

  // Dynamic user input state (populated after real extraction)
  const [candidateName, setCandidateName] = useState(user?.fullName || '')
  const [headline, setHeadline] = useState('')
  const [experienceYears, setExperienceYears] = useState('3')
  const [location, setLocation] = useState('San Francisco, CA')
  const [targetTitle, setTargetTitle] = useState('Senior Software Engineer')
  const [minSalary, setMinSalary] = useState('140000')
  const [workModel, setWorkModel] = useState('Remote / Hybrid')

  const steps = [
    { label: 'Upload Resume', description: 'AI parses skills & history' },
    { label: 'Verify Details', description: 'Review extracted info' },
    { label: 'Career Goals', description: 'Preferences & role targets' },
    { label: 'Ready!', description: 'Explore matched roles' },
  ]

  // Triggers native OS file picker
  const handleTriggerPicker = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  // Handle actual file selection & real backend extraction
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset file input value so same file can be re-selected if desired
    e.target.value = ''

    if (!file) return

    setUploadError('')
    setUploaded(false)

    // 1. File Validation
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      setUploadError('Please select a valid PDF document (.pdf).')
      setSelectedFile(null)
      return
    }

    const maxSizeInBytes = 10 * 1024 * 1024 // 10 MB
    if (file.size > maxSizeInBytes) {
      setUploadError('File size exceeds 10MB limit. Please upload a smaller PDF.')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setIsUploading(true)

    try {
      // 2. Real Supabase Storage Upload (if configured)
      if (user?.id) {
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const storagePath = `${user.id}/${Date.now()}_${sanitizedName}`

        try {
          const { error: storageError } = await supabase.storage
            .from('resumes')
            .upload(storagePath, file, { upsert: true })

          if (storageError) {
            console.warn('[Supabase Storage]', storageError.message)
          }
        } catch (storageErr) {
          console.warn('[Supabase Storage Ex]', storageErr)
        }
      }

      // 3. Extract text from real uploaded PDF
      const pdfText = await extractTextFromPdf(file)

      // 4. Send real extracted text to AI parsing backend
      const parseResult = await api.parseResume(pdfText)

      // 5. Populate extracted details into form
      const skills = parseResult.extracted_skills.map((s) => s.name)
      setExtractedSkills(skills)

      if (skills.length > 0) {
        setHeadline(`${skills.slice(0, 3).join(', ')} Specialist`)
      } else {
        setHeadline('Software Engineer')
      }

      if (parseResult.estimated_experience_years) {
        setExperienceYears(String(parseResult.estimated_experience_years))
      }

      if (!candidateName) {
        setCandidateName(user?.fullName || 'Candidate')
      }

      // Mark extraction as successful
      setUploaded(true)
      setIsUploading(false)
    } catch (err: any) {
      console.error('[Resume Extraction Error]', err)
      setIsUploading(false)
      setUploaded(false)
      setUploadError('Resume upload failed. Please try again.')
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      fileInputRef.current.files = dataTransfer.files
      const event = {
        target: fileInputRef.current,
      } as React.ChangeEvent<HTMLInputElement>
      handleFileChange(event)
    }
  }

  const handleFinishOnboarding = async () => {
    if (user) {
      const updatedUser = {
        ...user,
        fullName: candidateName || user.fullName,
      }
      setUser(updatedUser)

      // Sync to profiles table in Supabase
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: candidateName || user.fullName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
      } catch (err) {
        console.error('[CareerAI Onboarding Profile Sync Error]', err)
      }
    }
    setActiveStep(3)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-6 text-white">
      <PageHeader
        title="Candidate Onboarding"
        subtitle="Set up your AI profile in less than 2 minutes to start assessing 262-role job fit and alignment."
      />

      <Stepper steps={steps} currentStep={activeStep} />

      <Card className="p-8 space-y-6 border-white/10">
        {/* Step 1: Upload */}
        {activeStep === 0 && (
          <div className="space-y-6 text-center">
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Upload Your Resume</h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Our AI engine will automatically extract your technical skills, experience chronology, and role alignment.
              </p>
            </div>

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Error Banner */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 text-left animate-fade-in">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{uploadError}</span>
              </div>
            )}

            {/* Interactive Upload Dropzone */}
            <div
              onClick={handleTriggerPicker}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-10 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                uploaded
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : isUploading
                  ? 'border-orange-500/50 bg-orange-950/10 animate-pulse'
                  : 'border-white/15 hover:border-rose-500/50 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
                  uploaded
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isUploading
                    ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}
              >
                {uploaded ? (
                  <FileCheck className="h-8 w-8 text-emerald-400" />
                ) : isUploading ? (
                  <RefreshCw className="h-8 w-8 animate-spin text-orange-400" />
                ) : (
                  <UploadCloud className="h-8 w-8" />
                )}
              </div>

              {isUploading ? (
                <div className="space-y-1">
                  <p className="font-semibold text-orange-400 text-sm">
                    Parsing & extracting skills from {selectedFile?.name}...
                  </p>
                  <p className="text-xs text-neutral-400">Analyzing skills against 262 role profiles</p>
                </div>
              ) : uploaded ? (
                <div className="space-y-1">
                  <p className="font-bold text-emerald-400 text-sm">Resume PDF successfully uploaded & extracted!</p>
                  <p className="text-xs text-neutral-300 font-mono flex items-center justify-center gap-1.5 mt-1">
                    <FileText className="h-3.5 w-3.5 text-emerald-400" />
                    {selectedFile?.name} ({selectedFile ? formatFileSize(selectedFile.size) : ''})
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {extractedSkills.length} skills detected. Click "Next Step" to review extracted details.
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-neutral-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-white text-sm">Click to browse or drag & drop your resume PDF</p>
                  <p className="text-xs text-neutral-500">Supports PDF files up to 10MB</p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.08]">
              {uploaded ? (
                <button
                  type="button"
                  onClick={handleTriggerPicker}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Choose a different PDF
                </button>
              ) : <div />}

              <Button
                onClick={() => setActiveStep(1)}
                disabled={!uploaded || isUploading}
                className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify info */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5 text-orange-400" /> Verify Extracted Information
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Extracted from <span className="text-white font-semibold">{selectedFile?.name || 'Resume'}</span>. Review or adjust any fields below.
              </p>
            </div>

            {/* Extracted Skills Badges */}
            {extractedSkills.length > 0 && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Extracted Skills ({extractedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer | React, TypeScript"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/[0.08]">
              <Button variant="ghost" onClick={() => setActiveStep(0)} className="gap-1 text-neutral-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setActiveStep(2)} className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-400" /> Target Roles & Career Preferences
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                Define your preferences so our 262-role matching algorithm can recommend the best-fit opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Target Job Title
                </label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Expected Min Salary ($)
                  </label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                    Target Work Model
                  </label>
                  <input
                    type="text"
                    value={workModel}
                    onChange={(e) => setWorkModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/[0.08]">
              <Button variant="ghost" onClick={() => setActiveStep(1)} className="gap-1 text-neutral-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleFinishOnboarding} className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
                Complete Setup <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {activeStep === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                You're All Set, {candidateName || 'Candidate'}! 🎉
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Your profile has been synthesized into our AI assessment model from your uploaded resume ({selectedFile?.name || 'PDF'}). You can now analyze real job descriptions against 262 roles or explore curated recommendations.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate('/candidate/job-fit')}>
                Assess Job Fit
              </Button>
              <Button onClick={() => navigate('/candidate/dashboard')} className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
                <Sparkles className="h-4 w-4" /> Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
