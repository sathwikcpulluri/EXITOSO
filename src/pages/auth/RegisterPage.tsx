import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  validateFullName,
  validateGmail,
  validatePassword,
  normalizeEmail,
} from '@/lib/validators'
import {
  ArrowRight,
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Field inline errors
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Form level states
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Single-submission lock to prevent double-clicks
  const isSubmittingRef = useRef(false)

  const handleNameChange = (val: string) => {
    setFullName(val)
    if (generalError) setGeneralError('')
    if (nameError) {
      const res = validateFullName(val)
      setNameError(res.isValid ? '' : res.error || '')
    }
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    if (generalError) setGeneralError('')
    if (emailError) {
      const res = validateGmail(val)
      setEmailError(res.isValid ? '' : res.error || '')
    }
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (generalError) setGeneralError('')
    if (passwordError) {
      const res = validatePassword(val)
      setPasswordError(res.isValid ? '' : res.error || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission while request is in flight
    if (isSubmittingRef.current || isLoading) {
      return
    }

    setGeneralError('')
    setSuccessMessage('')

    // 1. FRONTEND VALIDATIONS
    const nameVal = validateFullName(fullName)
    const emailVal = validateGmail(email)
    const passVal = validatePassword(password)

    setNameError(nameVal.isValid ? '' : nameVal.error || '')
    setEmailError(emailVal.isValid ? '' : emailVal.error || '')
    setPasswordError(passVal.isValid ? '' : passVal.error || '')

    if (!nameVal.isValid || !emailVal.isValid || !passVal.isValid) {
      return
    }

    const cleanEmail = normalizeEmail(email)
    const cleanName = fullName.trim()

    // 2. CHECK SUPABASE CONFIGURATION
    if (!isSupabaseConfigured) {
      setGeneralError(
        'Supabase authentication is not configured. Please configure the environment variables.'
      )
      return
    }

    // 3. EXECUTE SUPABASE SIGNUP (Exact single request)
    isSubmittingRef.current = true
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            role: 'candidate',
          },
        },
      })

      // 4. HANDLE ERRORS ACCURATELY
      if (error) {
        setIsLoading(false)
        isSubmittingRef.current = false

        console.error('[Supabase Auth Error]', {
          message: error.message,
          status: error.status,
          code: (error as any).code,
          name: error.name,
        })

        const msg = (error.message || '').toLowerCase()

        if (error.status === 429) {
          setGeneralError('Too many signup attempts. Please wait a few minutes before trying again.')
        } else if (
          msg.includes('already registered') ||
          msg.includes('user already exists') ||
          msg.includes('identity already exists')
        ) {
          setGeneralError('An account with this email already exists. Please sign in.')
        } else if (msg.includes('password') && (msg.includes('weak') || msg.includes('least') || msg.includes('short'))) {
          setPasswordError('Password must be at least 8 characters.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setGeneralError('Unable to connect. Please check your internet connection and try again.')
        } else {
          // Display the real Supabase error message directly
          setGeneralError(error.message || 'Unable to create your account. Please try again.')
        }
        return
      }

      if (!data?.user) {
        setIsLoading(false)
        isSubmittingRef.current = false
        setGeneralError('Unable to create your account. Please try again.')
        return
      }

      const sbUser = data.user

      // 5. EMAIL VERIFICATION HANDLING (Session is null when confirmation is enabled)
      if (!data.session) {
        setIsLoading(false)
        isSubmittingRef.current = false
        setSuccessMessage('Account created. Please check your email to verify your account.')
        return
      }

      // 6. DATABASE PROFILE CREATION (When active session is returned)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: sbUser.id,
        email: sbUser.email || cleanEmail,
        full_name: cleanName,
        role: 'candidate',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

      if (profileError) {
        console.error('[Supabase Profile Upsert Error]', {
          code: profileError.code,
          message: profileError.message,
        })
        setIsLoading(false)
        isSubmittingRef.current = false

        if (profileError.code === '42501') {
          setGeneralError('Your account was created, but your profile could not be initialized. Please check RLS permissions or try again.')
        } else if (profileError.code === '42P01') {
          setGeneralError('Profile service is not configured correctly. Database table is missing.')
        } else {
          setGeneralError(`Account was created, but profile setup failed: ${profileError.message}`)
        }
        return
      }

      // 7. SUCCESSFUL SIGNUP & ACTIVE SESSION -> Onboard
      setUser({
        id: sbUser.id,
        email: sbUser.email || cleanEmail,
        fullName: cleanName,
        role: 'candidate',
        createdAt: sbUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      setIsLoading(false)
      isSubmittingRef.current = false
      navigate('/candidate/onboarding')
    } catch (err: any) {
      setIsLoading(false)
      isSubmittingRef.current = false
      console.error('[CareerAI Signup Exception]', {
        message: err?.message || 'Unknown error',
      })
      setGeneralError('Unable to connect. Please check your internet connection and try again.')
    }
  }

  const handleFillDemo = () => {
    setFullName('Sarah Connor')
    setEmail('sarah.connor@gmail.com')
    setPassword('SecurePass123!')
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
    setSuccessMessage('')
  }

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Your Account</h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Enter your details to initiate AI resume parsing & role prediction
        </p>
      </div>

      {/* General Error Banner */}
      {generalError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{generalError}</span>
        </div>
      )}

      {/* Email Verification Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white text-sm">Verification Email Sent</p>
            <p className="leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="h-4 w-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Sarah Connor"
              value={fullName}
              disabled={isLoading}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => {
                const res = validateFullName(fullName)
                setNameError(res.isValid ? '' : res.error || '')
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white placeholder-neutral-500 text-sm transition-all outline-none border ${
                nameError
                  ? 'border-rose-500 focus:border-rose-500 bg-rose-950/10'
                  : 'border-white/10 focus:border-rose-500 focus:bg-white/[0.07]'
              }`}
            />
          </div>
          {nameError && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {nameError}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="name@gmail.com"
              value={email}
              disabled={isLoading}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => {
                const res = validateGmail(email)
                setEmailError(res.isValid ? '' : res.error || '')
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white placeholder-neutral-500 text-sm transition-all outline-none border ${
                emailError
                  ? 'border-rose-500 focus:border-rose-500 bg-rose-950/10'
                  : 'border-white/10 focus:border-rose-500 focus:bg-white/[0.07]'
              }`}
            />
          </div>
          {emailError && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {emailError}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="h-4 w-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              disabled={isLoading}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => {
                const res = validatePassword(password)
                setPasswordError(res.isValid ? '' : res.error || '')
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] text-white placeholder-neutral-500 text-sm transition-all outline-none border ${
                passwordError
                  ? 'border-rose-500 focus:border-rose-500 bg-rose-950/10'
                  : 'border-white/10 focus:border-rose-500 focus:bg-white/[0.07]'
              }`}
            />
          </div>
          {passwordError && (
            <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> {passwordError}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Your data is encrypted & processed for match scoring only.</span>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 gap-2 mt-4 text-sm shadow-[0_0_24px_rgba(255,0,94,0.45)] disabled:opacity-50"
        >
          {isLoading ? (
            'Creating Account...'
          ) : (
            <>
              Create Account & Onboard
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-6 border-t border-white/[0.08] text-center text-xs text-neutral-400 space-y-4">
        <p>
          Already have an account?{' '}
          <Link to="/auth/login" className="font-semibold text-orange-400 hover:text-orange-300 hover:underline">
            Sign In
          </Link>
        </p>

        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full p-2.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl border border-white/10 text-neutral-300 flex items-center justify-center gap-1.5 transition-colors font-medium text-xs cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-rose-400" /> Auto-fill Sample Candidate (Optional)
        </button>
      </div>
    </div>
  )
}
