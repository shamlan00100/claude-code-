import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NumberStepper({
  value,
  display,
  onChange,
  step = 1,
  min = 0,
  size = 'md',
  label = 'Value',
  className,
}: {
  value: number
  display?: string
  onChange: (next: number) => void
  step?: number
  min?: number
  size?: 'md' | 'lg'
  label?: string
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(display ?? value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(String(display ?? value))
  }, [value, display, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const commit = () => {
    const parsed = parseFloat(draft.replace(',', '.'))
    if (!Number.isNaN(parsed)) {
      onChange(Math.max(min, +parsed.toFixed(2)))
    }
    setEditing(false)
  }

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
        aria-label={`Decrease ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-ink-soft transition-colors duration-fast hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-px"
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.currentTarget.blur() }
            if (e.key === 'Escape') { setDraft(String(display ?? value)); setEditing(false) }
          }}
          aria-label={label}
          className={cn(
            'tabular min-w-[2.25ch] max-w-[4.5ch] rounded-sm border border-primary bg-transparent text-center font-mono font-bold leading-none text-ink outline-none',
            size === 'lg' ? 'text-display-sm' : 'text-heading-lg'
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(String(display ?? value))
            setEditing(true)
          }}
          aria-label={`Edit ${label}, currently ${display ?? value}`}
          className={cn(
            'tabular min-w-[2.25ch] rounded-sm text-center font-mono font-bold leading-none text-ink transition-colors duration-fast hover:text-primary',
            size === 'lg' ? 'text-display-sm' : 'text-heading-lg'
          )}
        >
          {display ?? value}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange(+(value + step).toFixed(2))}
        aria-label={`Increase ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle text-ink-soft transition-colors duration-fast hover:border-primary hover:bg-primary/10 hover:text-primary active:translate-y-px"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
      </button>
    </div>
  )
}
