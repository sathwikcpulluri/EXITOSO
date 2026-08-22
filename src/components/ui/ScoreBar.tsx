import { useEffect, useState } from 'react'
import { cn, getScoreStroke } from '@/lib/utils'

interface ScoreBarProps {
  label: string
  score: number
  maxScore?: number
  showScore?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function ScoreBar({ label, score, maxScore = 100, showScore = true, className, size = 'md' }: ScoreBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0)
  const percentage = (score / maxScore) * 100
  const color = getScoreStroke(score)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={cn('font-medium text-surface-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {label}
        </span>
        {showScore && (
          <span className={cn('font-semibold', size === 'sm' ? 'text-xs' : 'text-sm')} style={{ color }}>
            {score}/{maxScore}
          </span>
        )}
      </div>
      <div className={cn('w-full rounded-full bg-surface-100 overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
