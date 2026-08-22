import { useEffect, useState } from 'react'
import { cn, getScoreStroke } from '@/lib/utils'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  className?: string
  showLabel?: boolean
  animated?: boolean
}

const sizeConfig = {
  sm: { width: 60, stroke: 4, fontSize: 'text-sm', labelSize: 'text-[10px]' },
  md: { width: 80, stroke: 5, fontSize: 'text-lg', labelSize: 'text-xs' },
  lg: { width: 120, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-sm' },
  xl: { width: 160, stroke: 8, fontSize: 'text-4xl', labelSize: 'text-base' },
}

export function ScoreRing({ score, size = 'md', label, className, showLabel = true, animated = true }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(animated ? 0 : score)
  const config = sizeConfig[size]
  const radius = (config.width - config.stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const strokeColor = getScoreStroke(score)

  useEffect(() => {
    if (!animated) return
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score, animated])

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-surface-100"
        />
        {/* Score circle */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={config.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold', config.fontSize)} style={{ color: strokeColor }}>
          {Math.round(animatedScore)}
        </span>
        {showLabel && label && (
          <span className={cn('text-surface-500 font-medium', config.labelSize)}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
