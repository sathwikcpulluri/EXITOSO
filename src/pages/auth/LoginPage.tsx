import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setIsLoading(true)
    setTimeout(() => {
      const namePart = email.split('@')[0].replace(/[._]/g, ' ')
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)

      setUser({
        id: `user-${Date.now()}`,
        email: email.trim(),
        fullName: formattedName || 'Candidate',
        role: 'candidate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setIsLoading(false)
      navigate('/candidate/dashboard')
    }, 500)
  }

  const handleFillDemo = () => {
    setEmail('sarah.connor@example.com')
    setPassword('SecurePass123!')
  }

  return (
    <div className="p-8 sm:p-10 rounded-3xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-neutral-400">
          Sign in to your CareerAI candidate prediction workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="h-4 w-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
              required
            />
          </div>
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-neutral-500 text-sm focus:border-rose-500 focus:bg-white/[0.07] transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
            <input
              type="checkbox"
              defaultChecked
              className="rounded border-white/20 bg-neutral-800 text-rose-500 focus:ring-rose-500"
            />
            Remember me
          </label>
          <a href="#" className="text-orange-400 hover:underline font-medium">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
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
