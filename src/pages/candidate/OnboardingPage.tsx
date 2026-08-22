import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Stepper } from '@/components/ui/Stepper'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
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
        setCandidateName(user?.fullName || 'Candidate')
      }
    }, 1200)
  }

  const handleFinishOnboarding = async () => {
    if (user) {
      const updatedUser = {
        ...user,
        fullName: candidateName || user.fullName,
      }
      setUser(updatedUser)

      // Optionally sync to profiles table in Supabase
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

            <div
              onClick={handleSimulateUpload}
              className="border-2 border-dashed border-white/15 hover:border-rose-500/50 bg-white/[0.02] hover:bg-white/[0.05] rounded-3xl p-10 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                {uploaded ? <FileCheck className="h-8 w-8 text-emerald-400" /> : <UploadCloud className="h-8 w-8" />}
              </div>
              {isUploading ? (
                <p className="font-semibold text-rose-400 animate-pulse text-sm">Extracting profile data with AI...</p>
              ) : uploaded ? (
                <div>
                  <p className="font-bold text-emerald-400 text-sm">Resume PDF successfully uploaded & extracted!</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Click next to review extracted details.</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-white text-sm">Click or drag & drop your resume (PDF/DOCX)</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Up to 10MB file size supported</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={() => setActiveStep(1)} disabled={!uploaded} className="gap-2 shadow-[0_0_24px_rgba(255,0,94,0.4)]">
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
                We've parsed your resume with 92% confidence. Feel free to adjust any fields below.
              </p>
            </div>

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
                Your profile has been synthesized into our AI assessment model. You can now analyze real job descriptions against 262 roles or explore curated recommendations.
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
