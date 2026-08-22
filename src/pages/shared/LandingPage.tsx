import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Sparkles, Target, MessageSquare, TrendingUp, ShieldCheck, ArrowRight, BarChart3, Users } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-brand">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CareerAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Intelligence
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-surface-900 leading-tight mb-6">
              Make Smarter
              <span className="gradient-text"> Career Decisions</span>
              <br />with AI Intelligence
            </h1>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-10">
              Get instant job fit analysis, personalized interview preparation, and data-driven
              career recommendations powered by advanced AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Start Free
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                View Demo
              </Button>
            </div>
          </div>
        </div>
        {/* Background decorations */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-100/40 blur-3xl" />
      </section>

      {/* Features */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">Four Powerful AI Modules</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Comprehensive career intelligence for job seekers and employers alike.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, title: 'Job Fit Score', desc: 'Instant AI analysis of how well your profile matches any job description.', color: 'bg-primary-50 text-primary-600' },
              { icon: MessageSquare, title: 'Interview Prep', desc: 'Personalized questions, practice sessions, and AI feedback to ace your interview.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: TrendingUp, title: 'Success Prediction', desc: 'Data-driven predictions of candidate success probability for hiring managers.', color: 'bg-violet-50 text-violet-600' },
              { icon: ShieldCheck, title: 'Retention Risk', desc: 'Proactive employee churn risk assessment with actionable recommendations.', color: 'bg-amber-50 text-amber-600' },
            ].map((feature) => (
              <div key={feature.title} className="card-hover p-6 text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900 mb-4">How It Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: Users, title: 'Create Profile', desc: 'Upload your resume and set your career preferences.' },
              { step: '2', icon: Target, title: 'Get Scored', desc: 'Paste any job description and get an instant fit analysis.' },
              { step: '3', icon: MessageSquare, title: 'Practice', desc: 'Prepare with AI-generated questions tailored to each role.' },
              { step: '4', icon: BarChart3, title: 'Improve', desc: 'Track your progress and close skill gaps with recommendations.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-brand text-white text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">{item.title}</h3>
                <p className="text-sm text-surface-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-dark">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to supercharge your career?
          </h2>
          <p className="text-white/70 mb-10">
            Join thousands of professionals making smarter career decisions with AI.
          </p>
          <Link to="/auth/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-surface-100">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-surface-400">
          <span>© 2024 CareerAI. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-surface-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-surface-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-surface-600 transition-colors">About</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
