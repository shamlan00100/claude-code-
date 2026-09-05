import { ArrowDown, ArrowUp, Plus } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { TrendChart } from '@/components/pt/TrendChart'
import { bodyweightTrend, liftTrend, nutritionTrend, measurements, progressPhotos } from '@/mock'

export function Progress() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Progress" meta="Yusuf Almannai" showHome />

      <div className="flex flex-col gap-5 px-5 pb-8 pt-4">
        <section className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <p className="mb-1 text-eyebrow uppercase text-ink-soft">Bodyweight</p>
          <TrendChart points={bodyweightTrend.map((p) => ({ date: p.date, value: p.kg }))} unit="kg" accent="primary" />
        </section>

        <section className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <p className="mb-1 text-eyebrow uppercase text-ink-soft">{liftTrend.exercise}</p>
          <TrendChart points={liftTrend.points.map((p) => ({ date: p.date, value: p.kg }))} unit="kg" accent="accent" />
        </section>

        <section className="rounded-md border border-border-subtle bg-surface p-4 shadow-card">
          <p className="text-eyebrow uppercase text-ink-soft">Nutrition</p>
          <p className="mb-2 text-body-sm text-ink-faint">Weekly average, from logged meal photos</p>
          <Tabs defaultValue="protein">
            <TabsList>
              <TabsTrigger value="protein">Protein</TabsTrigger>
              <TabsTrigger value="carbs">Carbs</TabsTrigger>
            </TabsList>
            <TabsContent value="protein">
              <TrendChart points={nutritionTrend.protein.map((p) => ({ date: p.date, value: p.g }))} unit="g" accent="accent" />
              <p className="mt-2 text-body-sm text-ink-faint">Target {nutritionTrend.target.proteinG}g/day</p>
            </TabsContent>
            <TabsContent value="carbs">
              <TrendChart points={nutritionTrend.carbs.map((p) => ({ date: p.date, value: p.g }))} unit="g" accent="primary" />
              <p className="mt-2 text-body-sm text-ink-faint">Target {nutritionTrend.target.carbsG}g/day</p>
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <h2 className="mb-2.5 text-eyebrow uppercase text-ink-soft">Measurements</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {measurements.map((m) => (
              <div key={m.label} className="rounded-md border border-border-subtle bg-surface px-3.5 py-3 shadow-card">
                <p className="text-label uppercase text-ink-faint">{m.label}</p>
                <div className="mt-1 flex items-baseline justify-between">
                  <p className="tabular font-mono text-heading-md font-bold text-ink">{m.value}</p>
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
                className="flex aspect-[3/4] flex-col items-center justify-end gap-1 rounded-md border border-border-subtle bg-surface-sunken pb-2"
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
