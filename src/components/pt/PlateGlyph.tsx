import { cn } from '@/lib/utils'

const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25] as const

const SIZES = {
  sm: { box: 26, min: 13, max: 26, overlap: '-ms-2', collar: 'w-1', rim: 'border-surface' },
  md: { box: 30, min: 13, max: 26, overlap: '-ms-2', collar: 'w-1', rim: 'border-surface' },
  lg: { box: 60, min: 26, max: 56, overlap: '-ms-4', collar: 'w-1.5', rim: 'border-surface-raised' },
} as const

/** Greedy-decompose one side of the bar into standard plate sizes, for display only. */
function decomposeOneSide(totalKg: number, barKg = 20) {
  let perSide = Math.max(0, (totalKg - barKg) / 2)
  const plates: number[] = []
  for (const size of PLATE_SIZES) {
    while (perSide + 0.001 >= size && plates.length < 5) {
      plates.push(size)
      perSide -= size
    }
  }
  return plates
}

function plateDiameter(kg: number, min: number, max: number) {
  // 25kg -> largest disc, 1.25kg -> smallest, mapped across a legible range.
  const t = (kg - 1.25) / (25 - 1.25)
  return Math.round(min + t * (max - min))
}

function plateTone(kg: number) {
  if (kg >= 20) return 'bg-primary'
  if (kg >= 5) return 'bg-ink'
  return 'bg-accent'
}

/**
 * The signature element: weight reads as a loaded barbell end, not a bare number —
 * biggest plate against the collar, each smaller plate peeking out from behind it.
 */
export function PlateGlyph({
  weightKg,
  size = 'md',
  className,
}: {
  weightKg: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const cfg = SIZES[size]
  if (weightKg === null || weightKg <= 20) {
    return (
      <div className={cn('flex items-center', className)} style={{ height: cfg.box }} aria-hidden>
        <div className={cn('h-full rounded-[1px] bg-ink-faint', cfg.collar)} />
      </div>
    )
  }
  const plates = decomposeOneSide(weightKg)
  return (
    <div
      className={cn('flex items-center', className)}
      style={{ height: cfg.box }}
      role="img"
      aria-label={`${weightKg} kilograms loaded`}
    >
      <div className={cn('h-full shrink-0 rounded-[1px] bg-ink-faint', cfg.collar)} aria-hidden />
      <div className="flex items-center">
        {plates.map((kg, i) => {
          const d = plateDiameter(kg, cfg.min, cfg.max)
          return (
            <div
              key={i}
              className={cn('shrink-0 rounded-full border-2', cfg.rim, plateTone(kg), i > 0 && cfg.overlap)}
              style={{ width: d, height: d, zIndex: plates.length - i }}
            />
          )
        })}
      </div>
    </div>
  )
}
