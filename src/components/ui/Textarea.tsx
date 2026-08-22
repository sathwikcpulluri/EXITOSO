import { forwardRef, type TextareaHTMLAttributes, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  autoResize?: boolean
  showCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, autoResize, showCount, maxLength, id, value, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || innerRef
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const charCount = typeof value === 'string' ? value.length : 0

    useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value, autoResize, textareaRef])

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-surface-900 placeholder:text-surface-400',
            'transition-all duration-200 resize-none min-h-[120px]',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
              : 'border-surface-200 hover:border-surface-300',
            className
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && <p className="text-xs text-rose-500">{error}</p>}
            {helperText && !error && <p className="text-xs text-surface-400">{helperText}</p>}
          </div>
          {showCount && maxLength && (
            <p className={cn('text-xs', charCount > maxLength * 0.9 ? 'text-amber-500' : 'text-surface-400')}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
