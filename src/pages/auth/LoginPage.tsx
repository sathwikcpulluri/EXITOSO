import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
      // Derive display name from email if needed
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
    <Card padding="lg" className="shadow-lg border-surface-200">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-surface-900">Welcome Back</h2>
        <p className="text-sm text-surface-500 mt-1">Sign in to your CareerAI candidate workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="h-4 w-4 text-surface-400" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="h-4 w-4 text-surface-400" />}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-surface-600">
            <input type="checkbox" defaultChecked className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
            Remember me
          </label>
          <a href="#" className="text-primary-600 hover:underline font-medium">Forgot password?</a>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim() || !password.trim()}
          className="w-full gap-2 mt-2"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-100 text-center text-xs text-surface-500 space-y-3">
        <p>
          Don't have an account?{' '}
          <Link to="/auth/register" className="font-semibold text-primary-600 hover:underline">
            Create account
          </Link>
        </p>
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full p-2.5 bg-primary-50/70 hover:bg-primary-50 rounded-xl border border-primary-100 text-primary-800 flex items-center justify-center gap-1.5 transition-colors font-medium text-xs cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5" /> Auto-fill Sample Candidate (Optional)
        </button>
      </div>
    </Card>
  )
}
