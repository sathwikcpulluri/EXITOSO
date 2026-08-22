import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Stepper } from '@/components/ui/Stepper'
import { useAuthStore } from '@/store/authStore'
import {
  UploadCloud,
  FileCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  User,
} from 'lucide-react'

export default function CandidateOnboardingPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [activeStep, setActiveStep] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  // Dynamic user input state
  const [candidateName, setCandidateName] = useState(user?.fullName || '')
  const [headline, setHeadline] = useState('Full-Stack Engineer | React, Node.js, TypeScript')
  const [experienceYears, setExperienceYears] = useState('5')
  const [location, setLocation] = useState('San Francisco, CA')
  const [targetTitle, setTargetTitle] = useState('Senior Frontend / Full-Stack Engineer')
  const [minSalary, setMinSalary] = useState('150000')
  const [workModel, setWorkModel] = useState('Remote / Hybrid')

  const steps = [
    { label: 'Upload Resume', description: 'AI parses skills & history' },
    { label: 'Verify Details', description: 'Review extracted info' },
    { label: 'Career Goals', description: 'Preferences & role targets' },
    { label: 'Ready!', description: 'Explore matched roles' },
  ]

  const handleSimulateUpload = () => {
    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setUploaded(true)
      if (!candidateName) {
        setCandidateName(user?.fullName || 'Alex Johnson')
      }
    }, 1200)
  }

  const handleFinishOnboarding = () => {
    if (user) {
      setUser({
        ...user,
        fullName: candidateName || user.fullName,
      })
    }
    setActiveStep(3)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-6">
      <PageHeader
        title="Candidate Onboarding"
        subtitle="Set up your AI profile in less than 2 minutes to start assessing job fit and interview readiness."
      />

      <Stepper steps={steps} currentStep={activeStep} />

      <Card className="p-8 space-y-6">
        {/* Step 1: Upload */}
        {activeStep === 0 && (
          <div className="space-y-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-surface-900">Upload Your Resume</h3>
              <p className="text-sm text-surface-500 mt-1">
                Our AI engine will automatically extract your technical skills, experience chronology, and key achievements.
              </p>
            </div>

            <div
              onClick={handleSimulateUpload}
              className="border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/20 hover:bg-primary-50/50 rounded-2xl p-10 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
                {uploaded ? <FileCheck className="h-8 w-8 text-emerald-600" /> : <UploadCloud className="h-8 w-8" />}
              </div>
              {isUploading ? (
                <p className="font-semibold text-primary-600 animate-pulse">Extracting profile data with AI...</p>
              ) : uploaded ? (
                <div>
                  <p className="font-semibold text-emerald-600">Resume PDF successfully uploaded & extracted!</p>
                  <p className="text-xs text-surface-400 mt-0.5">Click next to review extracted details.</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-surface-800">Click or drag & drop your resume (PDF/DOCX)</p>
                  <p className="text-xs text-surface-400 mt-0.5">Up to 10MB file size supported</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setActiveStep(1)} disabled={!uploaded} className="gap-2">
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify info */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-500" /> Verify Extracted Information
              </h3>
              <p className="text-sm text-surface-500 mt-1">
                We've parsed your resume with 92% confidence. Feel free to adjust any fields below.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter your name"
              />
              <Input
                label="Professional Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Years of Experience"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  type="number"
                />
                <Input
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-surface-100">
              <Button variant="ghost" onClick={() => setActiveStep(0)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setActiveStep(2)} className="gap-2">
                Next Step <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary-500" /> Target Roles & Career Preferences
              </h3>
              <p className="text-sm text-surface-500 mt-1">
                Define your preferences so our matching algorithm can recommend the best-fit opportunities.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Target Job Title"
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Expected Minimum Salary ($)"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  type="number"
                />
                <Input
                  label="Target Work Model"
                  value={workModel}
                  onChange={(e) => setWorkModel(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-surface-100">
              <Button variant="ghost" onClick={() => setActiveStep(1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button onClick={handleFinishOnboarding} className="gap-2">
                Complete Setup <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Completion */}
        {activeStep === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-surface-900">
                You're All Set, {candidateName || 'Candidate'}! 🎉
              </h3>
              <p className="text-sm text-surface-600 mt-2">
                Your profile has been synthesized into our AI assessment model. You can now analyze real job descriptions or start practicing interview questions.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate('/candidate/job-fit')}>
                Assess Job Fit
              </Button>
              <Button onClick={() => navigate('/candidate/dashboard')} className="gap-2">
                <Sparkles className="h-4 w-4" /> Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
