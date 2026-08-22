import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import {
  User,
  Bell,
  Lock,
  Sparkles,
  Shield,
  Save,
  CheckCircle,
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const [name, setName] = useState(user?.fullName || 'Alex Johnson')
  const [email, setEmail] = useState(user?.email || 'alex.johnson@email.com')
  const [aiCreativity, setAiCreativity] = useState('Balanced')
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [matchAlerts, setMatchAlerts] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage your profile information, AI scoring sensitivity, and notification preferences."
        actions={
          <Button onClick={handleSave} className="gap-2">
            {isSaved ? <CheckCircle className="h-4 w-4 text-white" /> : <Save className="h-4 w-4" />}
            {isSaved ? 'Saved!' : 'Save Preferences'}
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Account Details */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary-500" /> Personal & Account Information
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 pt-1 text-xs text-surface-500">
            <Badge variant="info">Role: {user?.role || 'candidate'}</Badge>
            <span>User ID: {user?.id || 'mock-user-001'}</span>
          </div>
        </Card>

        {/* AI & Scoring Calibration */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary-500" /> AI Scoring & Feedback Tuning
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                AI Feedback Style & Depth
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Direct & Concise', 'Balanced', 'Deep & Comprehensive'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAiCreativity(level)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      aiCreativity === level
                        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm'
                        : 'border-surface-200 hover:bg-surface-50 text-surface-600'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-surface-400 mt-1.5">
                Controls the granularity of critique provided during mock interview sessions and JD gap evaluations.
              </p>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary-500" /> Notifications & Alerts
            </CardTitle>
          </CardHeader>
          <div className="space-y-3 divide-y divide-surface-100">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold text-surface-900">Job Fit Alerts</p>
                <p className="text-xs text-surface-500">Receive notifications when a new 80%+ match is posted.</p>
              </div>
              <input
                type="checkbox"
                checked={matchAlerts}
                onChange={(e) => setMatchAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-surface-900">Practice Reminders</p>
                <p className="text-xs text-surface-500">Weekly prompt to practice mock interview questions.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4 text-primary-500" /> Privacy & Data Security
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Resume Privacy Protected:</span> Your uploaded resumes and mock interview responses are sanitized and used solely for your personalized scoring session.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
