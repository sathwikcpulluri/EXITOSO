import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value?: number
  max?: number
  label?: string
  showPercentage?: boolean
  indeterminate?: boolean
  size?: 'sm' | 'md'
  color?: 'primary' | 'emerald' | 'amber' | 'rose'
  className?: string
}

const colorStyles: Record<string, string> = {
  primary: 'bg-gradient-brand',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
}

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = false,
  indeterminate = false,
  size = 'md',
  color = 'primary',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-sm font-medium text-surface-700">{label}</span>}
          {showPercentage && <span className="text-sm font-semibold text-surface-600">{percentage}%</span>}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-surface-100 overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-3')}>
        {indeterminate ? (
          <div className={cn('h-full w-1/3 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]', colorStyles[color])} />
        ) : (
          <div
            className={cn('h-full rounded-full transition-all duration-700 ease-out', colorStyles[color])}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
