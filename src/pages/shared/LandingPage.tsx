import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import {
  Target,
  BrainCircuit,
  TrendingUp,
  ArrowRight,
  FileCheck,
  Play,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Cosmic Arc & Atmospheric Horizon Light Effect */}
      <div className="absolute top-0 right-0 w-full h-[850px] pointer-events-none overflow-hidden z-0">
        {/* Soft upper ambient red nebula glow */}
        <div className="absolute top-[-150px] right-[-100px] w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-rose-600/30 via-orange-600/15 to-transparent blur-[120px]" />
        
        {/* Intense right horizon glow */}
        <div className="absolute top-[250px] right-[-50px] w-[500px] h-[600px] bg-gradient-to-l from-orange-500/40 via-rose-600/20 to-transparent blur-[100px]" />

        {/* The Sharp Incandescent Glowing Arc */}
        <svg
          className="absolute top-0 right-0 w-[1400px] h-[850px] opacity-90 transition-opacity duration-1000"
          viewBox="0 0 1400 850"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cosmicArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff1b00" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#ff3b00" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#ff8c00" stopOpacity="1" />
              <stop offset="85%" stopColor="#ffc400" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff5500" stopOpacity="0.8" />
            </linearGradient>

            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="25" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Broad warm halo */}
          <path
            d="M -100 80 Q 450 100 950 480 T 1450 900"
            stroke="url(#cosmicArcGrad)"
            strokeWidth="38"
            strokeOpacity="0.18"
            fill="none"
            filter="url(#arcGlow)"
          />

          {/* Medium luminous arc */}
          <path
            d="M -100 80 Q 450 100 950 480 T 1450 900"
            stroke="url(#cosmicArcGrad)"
            strokeWidth="10"
            strokeOpacity="0.6"
            fill="none"
            filter="url(#arcGlow)"
          />

          {/* Razor-sharp core beam */}
          <path
            d="M -100 80 Q 450 100 950 480 T 1450 900"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.9"
            fill="none"
          />
        </svg>
      </div>

      {/* Top Floating Glass Navigation */}
      <header className="relative z-50 pt-6 px-6 max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-serif italic text-3xl font-bold tracking-tight text-white group-hover:text-rose-400 transition-colors">
            Career<span className="text-orange-500 font-sans not-italic text-2xl font-black">AI</span>
          </span>
        </Link>

        {/* Floating Capsule Menu */}
        <nav className="hidden md:flex items-center gap-7 bg-white/[0.04] backdrop-blur-xl border border-white/10 px-7 py-2.5 rounded-full text-xs font-semibold tracking-wide text-neutral-300 shadow-2xl">
          <Link to="/" className="text-white hover:text-orange-400 transition-colors">
            Home
          </Link>
          <a href="#prediction-engine" className="hover:text-white transition-colors">
            Prediction Engine
          </a>
          <a href="#dataset" className="hover:text-white transition-colors">
            262 Job Roles
          </a>
          <a href="#accuracy" className="hover:text-white transition-colors">
            Accuracy & Metrics
          </a>
          <Link to="/auth/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
        </nav>

        {/* Top Right Action Button */}
        <div className="flex items-center gap-3">
          <Link to="/auth/register">
            <button className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-lg hover:shadow-white/20 flex items-center gap-1.5 cursor-pointer">
              Predict Fit <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-28 px-6 max-w-5xl mx-auto text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-xs font-medium text-neutral-300 mb-8 shadow-inner">
          <span className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-extrabold uppercase tracking-wider">
            New
          </span>
          <span>First Autonomous AI Job Role Prediction Machine 2026</span>
        </div>

        {/* Massive Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-8">
          Journey Beyond Resumes
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            Into Precision AI Fit
          </span>
        </h1>

        {/* Subtitle Copy */}
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-12">
          Experience career intelligence like never before. Our advanced ML models benchmark your skills across 262
          standardized role taxonomies to calculate verified fit scores, probability curves, and skill gaps.
        </p>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link to="/auth/register">
            <Button size="lg" className="px-8 py-4 gap-2 text-sm shadow-[0_0_30px_rgba(255,0,94,0.4)]">
              Start Free Prediction <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link to="/candidate/job-fit">
            <button className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-neutral-200 transition-all cursor-pointer">
              <Play className="h-4 w-4 fill-white text-white" /> Explore Live Simulator
            </button>
          </Link>
        </div>
      </section>

      {/* Trust & Dataset Partner Logos Bar */}
      <section className="relative z-10 py-12 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-8">
            Trained on 10,000+ synthetic resume profiles across 262 industry role benchmarks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20 opacity-80">
            <span className="font-serif italic text-2xl font-bold tracking-wider text-white">Nova</span>
            <span className="font-mono text-xl font-extrabold tracking-tighter uppercase text-white">Forge</span>
            <span className="font-sans text-2xl font-black lowercase tracking-widest text-white">flux</span>
            <span className="font-serif italic text-2xl font-normal text-white">Beam</span>
            <span className="font-mono text-2xl font-bold lowercase tracking-tight text-white">echo</span>
          </div>
        </div>
      </section>

      {/* Interactive AI Prediction Metrics Preview */}
      <section id="prediction-engine" className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Four Core Machine Learning Modules
          </h2>
          <p className="text-neutral-400 text-sm">
            High-precision probability scoring engineered with natural language processing and cosine vector matching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FileCheck,
              title: 'Resume NER Parser',
              desc: 'Extracts skills across 115 standardized taxonomies, experience years, and degree classifications.',
              badge: '98.4% Precision',
              color: 'from-orange-500/20 to-rose-500/5',
              border: 'border-orange-500/20',
            },
            {
              icon: BrainCircuit,
              title: 'Job Role Classifier',
              desc: 'Predicts and ranks your top 3 matching career titles from 262 master job profiles in real time.',
              badge: '262 Roles',
              color: 'from-rose-500/20 to-purple-500/5',
              border: 'border-rose-500/20',
            },
            {
              icon: Target,
              title: 'Multi-Factor Fit Engine',
              desc: 'Calculates weighted probability across technical depth, experience ratios, and seniority level.',
              badge: 'Multi-Factor',
              color: 'from-amber-500/20 to-orange-500/5',
              border: 'border-amber-500/20',
            },
            {
              icon: TrendingUp,
              title: 'Skill Gap Analytics',
              desc: 'Identifies missing required competencies with targeted actionable upskilling recommendations.',
              badge: 'Data-Driven',
              color: 'from-purple-500/20 to-blue-500/5',
              border: 'border-purple-500/20',
            },
          ].map((card) => (
            <div
              key={card.title}
              className={`p-6 rounded-2xl bg-gradient-to-b ${card.color} backdrop-blur-xl border ${card.border} hover:border-white/30 transition-all group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/[0.08] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <card.icon className="h-6 w-6 text-orange-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/[0.07] text-neutral-300 border border-white/10">
                  {card.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dataset Specifications & Stats */}
      <section id="dataset" className="relative z-10 py-20 border-y border-white/[0.06] bg-black/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300">
                10,000+
              </p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Trained Resumes</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-300">
                262
              </p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Job Role Profiles</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-300">
                115
              </p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Standard Skills</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300">
                92.4%
              </p>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Prediction Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Cosmic CTA */}
      <section className="relative z-10 py-28 px-6 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Ready to Discover Your Optimal AI Job Role?
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Upload your resume or paste a job description to calculate instant match scores and skill alignments.
          </p>
          <div className="pt-4">
            <Link to="/auth/register">
              <Button size="lg" className="px-10 py-4 gap-2 text-sm shadow-[0_0_35px_rgba(255,0,94,0.5)]">
                Launch Prediction <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/[0.08] text-neutral-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-lg text-white font-bold">CareerAI</span>
            <span>• © 2026 Autonomous Prediction Machine</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#prediction-engine" className="hover:text-white transition-colors">Engine</a>
            <a href="#dataset" className="hover:text-white transition-colors">Taxonomy</a>
            <Link to="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
