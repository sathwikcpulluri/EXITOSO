import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
  disabled?: boolean
}

export function Select({ options, value, onValueChange, placeholder = 'Select...', label, error, className, disabled }: SelectProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      )}
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          className={cn(
            'inline-flex items-center justify-between w-full rounded-xl border bg-white px-4 py-2.5 text-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'data-[placeholder]:text-surface-400',
            error
              ? 'border-rose-300'
              : 'border-surface-200 hover:border-surface-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="h-4 w-4 text-surface-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="overflow-hidden bg-white rounded-xl border border-surface-200 shadow-modal z-50 animate-scale-in"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'relative flex items-center px-3 py-2 text-sm rounded-lg cursor-pointer',
                    'text-surface-700 hover:bg-surface-50 focus:bg-surface-50 outline-none',
                    'data-[state=checked]:text-primary-600 data-[state=checked]:font-medium'
                  )}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2">
                    <Check className="h-4 w-4 text-primary-600" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
