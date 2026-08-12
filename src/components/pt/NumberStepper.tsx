import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NumberStepper({
  value,
  display,
  onChange,
  step = 1,
  min = 0,
  size = 'md',
  className,
}: {
  value: number
  display?: string
  onChange: (next: number) => void
  step?: number
  min?: number
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        aria-label="Decrease"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-ink-soft transition-colors duration-fast hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-px"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
      <span
        className={cn(
          'tabular min-w-[2.25ch] text-center font-mono font-bold leading-none text-ink',
          size === 'lg' ? 'text-display-sm' : 'text-heading-lg'
        )}
      >
        {display ?? value}
      </span>
      <button
        type="button"
        onClick={() => onChange(+(value + step).toFixed(2))}
        aria-label="Increase"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-ink-soft transition-colors duration-fast hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-px"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  )
}
