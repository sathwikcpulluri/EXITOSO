import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold">CareerAI</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your AI-Powered<br />Career Intelligence<br />Platform
          </h1>
          <p className="text-lg text-white/70 max-w-md">
            Get instant job fit analysis, personalized interview preparation, and AI-driven career recommendations.
          </p>

          {/* Feature bullets */}
          <div className="mt-10 space-y-4">
            {[
              'AI-powered job fit scoring',
              'Personalized interview preparation',
              'Smart career recommendations',
              'Data-driven hiring insights',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-brand">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">CareerAI</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
