import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

function formatTime(totalSeconds: number) {
  const m = Math.floor(Math.max(0, totalSeconds) / 60)
  const s = Math.max(0, totalSeconds) % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function RestTimer({ initialSeconds, onSkip }: { initialSeconds: number; onSkip?: () => void }) {
  const [remaining, setRemaining] = useState(initialSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(id)
  }, [remaining <= 0])

  const done = remaining <= 0
  const pct = Math.min(100, Math.round(((initialSeconds - remaining) / initialSeconds) * 100))

  return (
    <div className="relative overflow-hidden rounded-md border border-primary/25 bg-surface-raised shadow-card">
      <div
        className="absolute inset-y-0 start-0 bg-primary/10 transition-[width] duration-1000 ease-linear"
        style={{ width: `${pct}%` }}
        aria-hidden
      />
      <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <p className="text-label uppercase tracking-[0.06em] text-ink-faint">{done ? "Rest's up" : 'Resting'}</p>
          <p
            className={`font-mono text-display-sm font-bold tabular ${done ? 'text-accent animate-pulse-ring rounded-sm' : 'text-primary'}`}
            aria-live="polite"
          >
            {formatTime(remaining)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRemaining((r) => r + 15)}
            aria-label="Add 15 seconds"
            className="flex h-9 items-center gap-1 rounded-full border border-border-subtle px-2.5 text-label text-ink-soft transition-colors duration-fast hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> 15s
          </button>
          <Button variant="accent" size="sm" onClick={onSkip} className="h-9 px-3">
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
