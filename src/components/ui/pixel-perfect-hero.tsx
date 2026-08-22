import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'

export interface PixelHeroProps {
  word1: string
  word2: string
  description: string
  primaryCta: string
  primaryCtaMobile?: string
  secondaryCta?: string
  secondaryCtaMobile?: string
  onPrimaryClick?: () => void
  onSecondaryClick?: () => void
  githubUrl?: string
}

export const PixelHero: React.FC<PixelHeroProps> = ({
  word1,
  word2,
  description,
  primaryCta,
  primaryCtaMobile,
  secondaryCta,
  secondaryCtaMobile,
  onPrimaryClick,
  onSecondaryClick,
  githubUrl = 'https://github.com',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }

    window.addEventListener('resize', handleResize)

    // Interactive Pixel Grid
    const pixelSize = 24
    const cols = Math.ceil(width / pixelSize)
    const rows = Math.ceil(height / pixelSize)

    const mouse = { x: -1000, y: -1000, radius: 160 }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = -1000
      mouse.y = -1000
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      // Background subtle gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      )
      bgGrad.addColorStop(0, '#0a0a0a')
      bgGrad.addColorStop(1, '#030303')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Draw Grid Particles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * pixelSize + pixelSize / 2
          const y = r * pixelSize + pixelSize / 2

          const dx = mouse.x - x
          const dy = mouse.y - y
          const dist = Math.sqrt(dx * dx + dy * dy)

          let alpha = 0.08
          let size = 1.5

          // Wave effect
          const wave = Math.sin(time + (c + r) * 0.2) * 0.04
          alpha += Math.max(0, wave)

          // Mouse proximity glow
          if (dist < mouse.radius) {
            const factor = 1 - dist / mouse.radius
            alpha += factor * 0.7
            size += factor * 2.5

            ctx.fillStyle = `rgba(255, 0, 94, ${alpha})`
            ctx.shadowColor = '#ff005e'
            ctx.shadowBlur = factor * 12
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.shadowColor = 'transparent'
            ctx.shadowBlur = 0
          }

          ctx.beginPath()
          ctx.rect(x - size / 2, y - size / 2, size, size)
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#030303] text-white select-none px-6 py-20">
      {/* Interactive Pixel Grid Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto z-0 opacity-90"
      />

      {/* Ambient Horizon Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-orange-500/15 via-rose-600/20 to-purple-600/15 blur-[120px] pointer-events-none z-0" />

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 pointer-events-auto">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/10 text-xs font-semibold text-neutral-300 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Autonomous AI Role Intelligence</span>
        </div>

        {/* Dynamic Dual Word Typography */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.05]">
          <span className="block text-white">{word1}</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300">
            {word2}
          </span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
          {description}
        </p>

        {/* Action Buttons with signature glowing gradient rim */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            onClick={onPrimaryClick}
            className="w-full sm:w-auto px-8 py-4 gap-2 text-sm shadow-[0_0_30px_rgba(255,0,94,0.4)]"
          >
            <span className="hidden sm:inline">{primaryCta}</span>
            <span className="sm:hidden">{primaryCtaMobile || primaryCta}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          {secondaryCta && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onSecondaryClick}
              className="w-full sm:w-auto"
            >
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-neutral-200 transition-all cursor-pointer">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span className="hidden sm:inline">{secondaryCta}</span>
                <span className="sm:hidden">{secondaryCtaMobile || secondaryCta}</span>
              </button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default PixelHero
