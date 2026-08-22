import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import {
  validateGmail,
  validatePassword,
  normalizeEmail,
} from '@/lib/validators'
import { ArrowRight, Lock, Mail, Sparkles, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    const emailVal = validateGmail(email)
    const passVal = validatePassword(password)

    setEmailError(emailVal.isValid ? '' : emailVal.error || '')
    setPasswordError(passVal.isValid ? '' : passVal.error || '')

    if (!emailVal.isValid || !passVal.isValid) {
      return
    }

    const cleanEmail = normalizeEmail(email)

    if (!isSupabaseConfigured) {
      setGeneralError(
        'Supabase authentication is not configured. Please configure the environment variables.'
      )
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (error) {
        setIsLoading(false)
        console.error('[Supabase SignIn Error]', error.message)
        const msg = error.message.toLowerCase()
        if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setGeneralError('Invalid email or password. Please check your credentials and try again.')
        } else if (msg.includes('email not confirmed')) {
          setGeneralError('Please check your inbox and verify your email address before signing in.')
        } else if (msg.includes('network') || msg.includes('fetch')) {
          setGeneralError('Unable to connect. Please check your internet connection and try again.')
        } else {
          setGeneralError(error.message || 'Unable to sign in. Please try again.')
        }
        return
      }

      if (!data?.user) {
        setIsLoading(false)
        setGeneralError('Unable to sign in. Please try again.')
        return
      }

      const sbUser = data.user

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .single()

      setUser({
        id: sbUser.id,
        email: sbUser.email || cleanEmail,
        fullName: profile?.full_name || sbUser.user_metadata?.full_name || 'Candidate',
        role: profile?.role || sbUser.user_metadata?.role || 'candidate',
        avatarUrl: profile?.avatar_url,
        createdAt: profile?.created_at || sbUser.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
      })

      setIsLoading(false)
      navigate('/candidate/dashboard')
    } catch (err: any) {
      setIsLoading(false)
      console.error('[CareerAI SignIn Exception]', err)
      setGeneralError('Unable to connect. Please check your internet connection and try again.')
    }
  }

  const handleFillDemo = () => {
    setEmail('sarah.connor@gmail.com')
    setPassword('SecurePass123!')
    setEmailError('')
    setPasswordError('')
    setGeneralError('')
  }

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Sign in to your CareerAI candidate prediction workspace
        </p>
      </div>

      {generalError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
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
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError('')
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

        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="h-4 w-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              disabled={isLoading}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError('')
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

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 gap-2 mt-4 text-sm shadow-[0_0_24px_rgba(255,0,94,0.45)]"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="pt-6 border-t border-white/[0.08] text-center text-xs text-neutral-400 space-y-4">
        <p>
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-semibold text-orange-400 hover:text-orange-300 hover:underline">
            Create account
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
