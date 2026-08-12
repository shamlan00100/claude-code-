import { cn } from '@/lib/utils'

const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25] as const

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

function plateDiameter(kg: number) {
  // 25kg -> largest disc, 1.25kg -> smallest, mapped across a legible small range.
  const min = 13,
    max = 26
  const t = (kg - 1.25) / (25 - 1.25)
  return Math.round(min + t * (max - min))
}

function plateTone(kg: number) {
  if (kg >= 20) return 'bg-ink'
  if (kg >= 5) return 'bg-primary'
  return 'bg-accent'
}

/**
 * The signature element: weight reads as a loaded barbell end, not a bare number —
 * biggest plate against the collar, each smaller plate peeking out from behind it.
 */
export function PlateGlyph({ weightKg, size = 'md', className }: { weightKg: number | null; size?: 'sm' | 'md'; className?: string }) {
  const box = size === 'sm' ? 26 : 30
  if (weightKg === null || weightKg <= 20) {
    return (
      <div className={cn('flex items-center', className)} style={{ height: box }} aria-hidden>
        <div className="h-full w-1 rounded-[1px] bg-ink-faint" />
      </div>
    )
  }
  const plates = decomposeOneSide(weightKg)
  return (
    <div
      className={cn('flex items-center', className)}
      style={{ height: box }}
      role="img"
      aria-label={`${weightKg} kilograms loaded`}
    >
      <div className="h-full w-1 shrink-0 rounded-[1px] bg-ink-faint" aria-hidden />
      <div className="flex items-center">
        {plates.map((kg, i) => {
          const d = plateDiameter(kg)
          return (
            <div
              key={i}
              className={cn('shrink-0 rounded-full border-2 border-surface', plateTone(kg), i > 0 && '-ms-2')}
              style={{ width: d, height: d, zIndex: plates.length - i }}
            />
          )
        })}
      </div>
    </div>
  )
}
