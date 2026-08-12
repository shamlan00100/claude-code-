import { Minus, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/** One thumb, two seconds: nudge a portion up or down and confirm — no keyboard, no forms. */
export function PortionAdjuster({
  multiplier,
  confirmed,
  onChange,
  onConfirm,
}: {
  multiplier: number
  confirmed: boolean
  onChange: (next: number) => void
  onConfirm: () => void
}) {
  const idx = STEPS.indexOf(multiplier)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border-2 border-ink bg-surface p-0.5">
        <button
          type="button"
          onClick={() => onChange(STEPS[Math.max(0, idx - 1)])}
          disabled={idx <= 0}
          aria-label="Smaller portion"
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors duration-fast hover:bg-ink hover:text-background disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
        <span className="min-w-[2.5rem] text-center tabular text-body-sm font-bold">{multiplier}×</span>
        <button
          type="button"
          onClick={() => onChange(STEPS[Math.min(STEPS.length - 1, idx + 1)])}
          disabled={idx >= STEPS.length - 1}
          aria-label="Larger portion"
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors duration-fast hover:bg-ink hover:text-background disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        </button>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className={cn(
          'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-label uppercase transition-colors duration-fast',
          confirmed ? 'bg-success text-success-foreground' : 'bg-ink text-background hover:bg-ink/85'
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        {confirmed ? 'Confirmed' : 'Confirm'}
      </button>
    </div>
  )
}
