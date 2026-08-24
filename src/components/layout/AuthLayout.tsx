import { Outlet, Link } from 'react-router-dom'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-transparent text-white selection:bg-rose-500 selection:text-white">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black/40 backdrop-blur-xl border-r border-white/[0.08]">
        {/* Upper and lower ambient nebulae */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-600/15 blur-[120px] pointer-events-none" />

        {/* Diagonal glowing beam */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,0,94,0.15),rgba(255,255,255,0))] pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group w-fit">
            <span className="font-serif italic text-3xl font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
              Career<span className="text-orange-500 font-sans not-italic text-2xl font-black">AI</span>
            </span>
          </Link>

          {/* Hero Pitch */}
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/10 text-xs font-semibold text-neutral-300">
              <Sparkles className="h-3.5 w-3.5 text-orange-400" />
              <span>Kaggle Benchmark Dataset Trained</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
              Precision Career Matching
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300">
                Driven by Machine Learning.
              </span>
            </h1>

            <p className="text-sm text-neutral-400 leading-relaxed">
              Extract verified skills from raw resumes, match against 262 industry role taxonomies, and uncover
              multidimensional job fit probabilities.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-4 text-xs font-medium text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0" />
                <span>115 Skill Taxonomies</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-orange-500 shrink-0" />
                <span>262 Master Job Roles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span>Weighted Fit Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Real-Time Gap Analytics</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Quote */}
          <div className="text-xs text-neutral-500 border-t border-white/[0.08] pt-6 flex items-center justify-between">
            <span>© 2026 CareerAI Prediction Engine</span>
            <span>v2.4 Production</span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-rose-600/10 blur-[130px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif italic text-2xl font-bold tracking-tight text-white">
                Career<span className="text-orange-500 font-sans not-italic text-xl font-black">AI</span>
              </span>
            </Link>
            <Link to="/" className="text-xs text-neutral-400 hover:text-white">
              Back to Home →
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
