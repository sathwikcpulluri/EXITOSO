import { Suspense, type ReactNode } from 'react'
import { Spinner } from '@/components/ui/Spinner'

interface LazyWrapperProps {
  children: ReactNode
}

export function LazyWrapper({ children }: LazyWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
