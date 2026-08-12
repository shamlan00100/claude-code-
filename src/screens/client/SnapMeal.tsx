import { Camera, Clock } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { MealPhoto } from '@/components/pt/MealPhoto'
import { ConfidenceTag } from '@/components/pt/ConfidenceTag'
import { activeMeal } from '@/mock'

export function SnapMeal() {
  const totals = activeMeal.items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      proteinG: acc.proteinG + i.proteinG,
      carbsG: acc.carbsG + i.carbsG,
      fatG: acc.fatG + i.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  )

  const lowCount = activeMeal.items.filter((i) => i.confidence === 'low').length

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Snap a meal" meta="Log what you ate" showHome />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        <MealPhoto label={activeMeal.photoLabel} />

        <Button variant="outline" size="default" className="w-full">
          <Camera className="h-4.5 w-4.5" /> Retake photo
        </Button>

        <div className="flex items-center gap-2 rounded-sm bg-warning-soft px-3 py-2 text-body-sm font-medium text-warning">
          <Clock className="h-4 w-4 shrink-0" />
          Awaiting Coach Fahad to confirm portions · logged {activeMeal.loggedAt}
        </div>

        {lowCount > 0 && (
          <p className="text-body-sm text-ink-soft">
            {lowCount} item{lowCount === 1 ? '' : 's'} we're unsure about — totals below may shift once your coach checks them.
          </p>
        )}

        {/* Totals */}
        <section className="rounded-md border-2 border-ink bg-ink p-4 text-background">
          <p className="text-label uppercase text-accent">Estimated totals</p>
          <p className="mt-1 font-display text-display-md tabular">
            {totals.calories} <span className="text-heading-md font-semibold text-border-subtle">kcal</span>
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/15 pt-3">
            <div>
              <p className="tabular text-heading-md font-extrabold">{totals.proteinG}g</p>
              <p className="text-label uppercase text-border-subtle">Protein</p>
            </div>
            <div>
              <p className="tabular text-heading-md font-extrabold">{totals.carbsG}g</p>
              <p className="text-label uppercase text-border-subtle">Carbs</p>
            </div>
            <div>
              <p className="tabular text-heading-md font-extrabold">{totals.fatG}g</p>
              <p className="text-label uppercase text-border-subtle">Fat</p>
            </div>
          </div>
        </section>

        {/* Items */}
        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-ink-soft">What we found</h2>
          <ul className="flex flex-col gap-2.5">
            {activeMeal.items.map((item) => (
              <li key={item.id} className="rounded-md border-2 border-ink bg-surface px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body-lg font-semibold leading-snug text-ink">{item.name}</p>
                    <p className="text-body-sm text-ink-soft">{item.portion}</p>
                  </div>
                  <p className="shrink-0 tabular text-body-lg font-semibold text-ink">{item.calories} kcal</p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <ConfidenceTag level={item.confidence} />
                  <p className="tabular text-body-sm text-ink-faint">
                    P {item.proteinG}g · C {item.carbsG}g · F {item.fatG}g
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
