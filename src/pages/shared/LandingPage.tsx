import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import {
  Sparkles,
  Target,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Users,
  FileCheck,
} from 'lucide-react'

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
              <BrainCircuit className="h-4 w-4" />
              AI Resume Analyzer & Job Role Prediction Engine
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-surface-900 leading-tight mb-6">
              Predict Your
              <span className="gradient-text"> Best Job Match</span>
              <br />with Machine Learning
            </h1>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto mb-10">
              Benchmark your resume against 262 industry job profiles. Get instant multi-factor match scoring,
              automated skill extraction, and data-driven gap analytics.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth/register">
                <Button size="lg" className="gap-2">
                  Start Free Analysis <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/candidate/job-fit">
                <Button variant="outline" size="lg">
                  Try Fit Predictor
                </Button>
              </Link>
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
            <h2 className="text-3xl font-bold text-surface-900 mb-4">Four Core AI Prediction Modules</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Trained on 10,000+ synthetic resume samples and 262 benchmark job role profiles.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, title: 'Resume NER Parser', desc: 'Extracts skills across 115 standardized taxonomies, experience years, and degree levels.', color: 'bg-primary-50 text-primary-600' },
              { icon: BrainCircuit, title: 'Job Role Classifier', desc: 'Predicts and ranks your top 3 matching career titles from 262 master job profiles.', color: 'bg-indigo-50 text-indigo-600' },
              { icon: Target, title: 'Multi-Factor Fit Engine', desc: 'Calculates weighted probability across technical depth, experience ratios, and seniority.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: TrendingUp, title: 'Skill Gap Analytics', desc: 'Identifies missing required competencies with targeted actionable upskilling recommendations.', color: 'bg-amber-50 text-amber-600' },
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
            <h2 className="text-3xl font-bold text-surface-900 mb-4">How The Prediction Engine Works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', icon: Users, title: 'Upload Resume', desc: 'Parser extracts technical skills, years of experience, and career history.' },
              { step: '2', icon: BrainCircuit, title: 'AI Role Matching', desc: 'Classifier compares your profile against 262 distinct role benchmarks.' },
              { step: '3', icon: Target, title: 'Fit Probability', desc: 'Generates detailed multi-factor match score with positive & negative factors.' },
              { step: '4', icon: BarChart3, title: 'Close Gaps', desc: 'View missing skill requirements and recommended positions.' },
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
            Ready to discover your optimal career match?
          </h2>
          <p className="text-white/70 mb-10">
            Join thousands of candidates leveraging data-driven job role prediction and fit scoring.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="gap-2">
              Start Free Analysis <ArrowRight className="h-5 w-5" />
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
