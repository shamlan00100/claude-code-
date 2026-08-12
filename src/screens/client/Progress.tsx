import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { TrendChart } from '@/components/pt/TrendChart'
import { bodyweightTrend, liftTrend, measurements, progressPhotos } from '@/mock'

export function Progress() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Progress" meta="Yusuf Almannai" showHome />

      <div className="flex flex-col gap-5 px-5 pb-8 pt-4">
        <section className="rounded-md border-2 border-ink bg-surface p-4">
          <p className="mb-1 text-eyebrow uppercase text-ink-soft">Bodyweight</p>
          <TrendChart points={bodyweightTrend.map((p) => ({ date: p.date, value: p.kg }))} unit="kg" accent="primary" />
        </section>

        <section className="rounded-md border-2 border-ink bg-surface p-4">
          <p className="mb-1 text-eyebrow uppercase text-ink-soft">{liftTrend.exercise}</p>
          <TrendChart points={liftTrend.points.map((p) => ({ date: p.date, value: p.kg }))} unit="kg" accent="accent" />
        </section>

        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-ink-soft">Measurements</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {measurements.map((m) => (
              <div key={m.label} className="rounded-md border-2 border-ink bg-surface px-3.5 py-3">
                <p className="text-label uppercase text-ink-faint">{m.label}</p>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className="tabular text-heading-md font-extrabold">{m.value}</p>
                  <span
                    className={`flex items-center gap-0.5 text-body-sm font-semibold ${
                      m.direction === 'down' ? 'text-success' : 'text-ink-soft'
                    }`}
                  >
                    {m.direction === 'down' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                    {m.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-eyebrow uppercase text-ink-soft">Progress photos</h2>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {progressPhotos.map((p) => (
              <div
                key={p.id}
                className="flex aspect-[3/4] flex-col items-center justify-end gap-1 rounded-md border-2 border-ink bg-surface-sunken pb-2"
              >
                <span className="text-body-sm font-semibold text-ink-soft">{p.label}</span>
                <span className="text-label uppercase text-ink-faint">{p.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
