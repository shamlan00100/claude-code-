import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlateGlyph } from './PlateGlyph'
import { PRBadge } from './PRBadge'
import { NumberStepper } from './NumberStepper'
import { Button } from '@/components/ui/button'
import type { ExerciseSet } from '@/mock/types'

function ReferenceLine({ set }: { set: ExerciseSet }) {
  if (set.lastSessionWeightKg == null) return <span className="text-body-sm text-ink-faint">No previous data</span>
  return (
    <span className="text-body-sm text-ink-faint">
      Last time {set.lastSessionWeightKg}kg × {set.lastSessionReps}
    </span>
  )
}

export function SetRow({
  set,
  onChangeActive,
  onLog,
}: {
  set: ExerciseSet
  onChangeActive?: (patch: Partial<{ weightKg: number; reps: number; rpe: number }>) => void
  onLog?: () => void
}) {
  if (set.status === 'active') {
    return (
      <div className="relative rounded-md border border-primary/50 bg-surface-raised p-4 shadow-glow">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-heading-md font-bold text-primary">Set {set.setNumber}</span>
          <ReferenceLine set={set} />
        </div>

        <div className="mb-4">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-label uppercase tracking-[0.06em] text-ink-faint">Weight (kg)</p>
            <p className="text-body-sm text-ink-faint">Tap the number to type it</p>
          </div>
          <NumberStepper
            value={set.weightKg ?? 0}
            step={2.5}
            size="lg"
            label="weight in kilograms"
            onChange={(v) => onChangeActive?.({ weightKg: v })}
          />
          <div className="relative mt-3 flex h-[60px] items-center justify-end overflow-hidden rounded-sm bg-surface-sunken/60 px-4">
            <div className="absolute inset-y-1/2 start-0 end-16 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent to-ink-faint/60" aria-hidden />
            <PlateGlyph weightKg={set.weightKg} size="lg" className="relative" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1.5 text-label uppercase tracking-[0.06em] text-ink-faint">Reps</p>
            <NumberStepper
              value={set.reps ?? 0}
              step={1}
              min={0}
              label="reps"
              onChange={(v) => onChangeActive?.({ reps: v })}
            />
          </div>
          <div>
            <p className="mb-1.5 text-label uppercase tracking-[0.06em] text-ink-faint">RPE</p>
            <NumberStepper
              value={set.rpe ?? 0}
              step={0.5}
              min={0}
              display={(set.rpe ?? 0).toString()}
              label="RPE"
              onChange={(v) => onChangeActive?.({ rpe: v })}
            />
          </div>
        </div>

        <Button variant="primary" size="lg" className="mt-4 w-full" onClick={onLog}>
          <Check className="h-5 w-5" strokeWidth={3} />
          Log set {set.setNumber}
        </Button>
      </div>
    )
  }

  const isPending = set.status === 'pending'

  return (
    <div
      className={cn(
        'grid grid-cols-[28px_1fr_1fr_1fr] items-center gap-2.5 rounded-md border bg-surface px-3.5 py-3 shadow-card',
        isPending ? 'border-dashed border-border-subtle' : 'border-border-subtle'
      )}
    >
      <span className={cn('font-mono text-heading-sm font-bold', isPending ? 'text-ink-faint' : 'text-ink-soft')}>
        {String(set.setNumber).padStart(2, '0')}
      </span>

      <div>
        <p className="text-label uppercase tracking-[0.06em] text-ink-faint">Weight</p>
        <div className="flex items-baseline gap-1.5">
          <span className={cn('tabular font-mono text-display-sm font-bold', isPending && 'text-ink-faint')}>
            {set.weightKg ?? '—'}
          </span>
          {!isPending && <PlateGlyph weightKg={set.weightKg} className="hidden sm:flex" />}
        </div>
      </div>

      <div>
        <p className="text-label uppercase tracking-[0.06em] text-ink-faint">Reps</p>
        <p className={cn('tabular font-mono text-display-sm font-bold', isPending && 'text-ink-faint')}>{set.reps ?? '—'}</p>
        <p className="truncate text-body-sm text-ink-faint">
          {set.lastSessionWeightKg != null ? `Last ${set.lastSessionWeightKg}×${set.lastSessionReps}` : '—'}
        </p>
      </div>

      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="text-label uppercase tracking-[0.06em] text-ink-faint">RPE</p>
          <p className={cn('tabular font-mono text-display-sm font-bold', isPending && 'text-ink-faint')}>{set.rpe ?? '—'}</p>
        </div>
        {set.isPr && <PRBadge className="mt-0.5" />}
      </div>
    </div>
  )
}
