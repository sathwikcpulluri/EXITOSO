import { cn } from '@/lib/utils'

interface SkeletonLoaderProps {
  variant?: 'card' | 'row' | 'circle' | 'text' | 'score-ring'
  count?: number
  className?: string
}

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function SkeletonLoader({ variant = 'text', count = 1, className }: SkeletonLoaderProps) {
  const items = Array.from({ length: count })

  if (variant === 'card') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-surface-100 p-6 space-y-4">
            <SkeletonPulse className="h-4 w-2/3" />
            <SkeletonPulse className="h-3 w-full" />
            <SkeletonPulse className="h-3 w-4/5" />
            <div className="flex gap-2 pt-2">
              <SkeletonPulse className="h-6 w-16 rounded-full" />
              <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'row') {
    return (
      <div className={cn('space-y-3', className)}>
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 px-4 bg-white rounded-xl">
            <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-3.5 w-1/3" />
              <SkeletonPulse className="h-3 w-1/2" />
            </div>
            <SkeletonPulse className="h-8 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'circle') {
    return (
      <div className={cn('flex gap-3', className)}>
        {items.map((_, i) => (
          <SkeletonPulse key={i} className="h-12 w-12 rounded-full" />
        ))}
      </div>
    )
  }

  if (variant === 'score-ring') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <SkeletonPulse className="h-24 w-24 rounded-full" />
      </div>
    )
  }

  // text variant
  return (
    <div className={cn('space-y-2.5', className)}>
      {items.map((_, i) => (
        <SkeletonPulse key={i} className={cn('h-3', i === items.length - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  )
}
