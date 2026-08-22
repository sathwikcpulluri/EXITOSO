import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import type { StepperStep } from '@/types'

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isActive = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all duration-300',
                    isComplete && 'bg-primary-600 text-white shadow-glow',
                    isActive && 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-glow',
                    !isComplete && !isActive && 'bg-surface-100 text-surface-400 border-2 border-surface-200'
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block',
                    isActive ? 'text-primary-600' : isComplete ? 'text-surface-700' : 'text-surface-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 mt-[-20px] sm:mt-0">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isComplete ? 'bg-primary-600' : 'bg-surface-200'
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
