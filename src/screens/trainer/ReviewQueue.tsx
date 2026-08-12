import { useState } from 'react'
import { Play, ChevronDown } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfidenceTag } from '@/components/pt/ConfidenceTag'
import { PortionAdjuster } from '@/components/pt/PortionAdjuster'
import { reviewQueueMeals, formCheckQueue } from '@/mock'
import { cn } from '@/lib/utils'

interface ItemState {
  multiplier: number
  confirmed: boolean
}

export function ReviewQueue() {
  const [itemState, setItemState] = useState<Record<string, ItemState>>({})
  const [openMeal, setOpenMeal] = useState<string | null>(reviewQueueMeals[0]?.id ?? null)
  const [clearedMeals, setClearedMeals] = useState<Record<string, boolean>>({})
  const [clearedVideos, setClearedVideos] = useState<Record<string, boolean>>({})

  const get = (id: string) => itemState[id] ?? { multiplier: 1, confirmed: false }
  const setItem = (id: string, patch: Partial<ItemState>) =>
    setItemState((s) => ({ ...s, [id]: { ...get(id), ...patch } }))

  const pendingMeals = reviewQueueMeals.filter((m) => !clearedMeals[m.id])
  const pendingVideos = formCheckQueue.filter((v) => !clearedVideos[v.id])

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Review queue" meta={`${pendingMeals.length + pendingVideos.length} to clear`} showHome />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        <Tabs defaultValue="meals">
          <TabsList className="w-full">
            <TabsTrigger value="meals">Meals · {pendingMeals.length}</TabsTrigger>
            <TabsTrigger value="videos">Form checks · {pendingVideos.length}</TabsTrigger>
          </TabsList>

          <TabsContent value="meals" className="flex flex-col gap-3">
            {pendingMeals.length === 0 ? (
              <EmptyQueue label="Meal queue clear" hint="Nothing waiting on you. New logs land here as clients eat." />
            ) : (
              pendingMeals.map((meal) => {
                const allConfirmed = meal.items.every((i) => get(i.id).confirmed)
                const isOpen = openMeal === meal.id
                return (
                  <div key={meal.id} className="rounded-md border border-border-subtle bg-surface shadow-card">
                    <button
                      type="button"
                      onClick={() => setOpenMeal(isOpen ? null : meal.id)}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-start"
                    >
                      <Avatar>
                        <AvatarFallback>{meal.clientInitials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-lg font-semibold text-ink">{meal.clientName}</p>
                        <p className="truncate text-body-sm text-ink-soft">{meal.photoLabel}</p>
                      </div>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 text-ink-faint transition-transform duration-fast', isOpen && 'rotate-180')} />
                    </button>

                    {isOpen && (
                      <div className="flex flex-col gap-2.5 border-t border-border-subtle px-3.5 py-3">
                        {meal.items.map((item) => {
                          const state = get(item.id)
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                'rounded-sm border px-3 py-2.5 transition-colors duration-fast',
                                state.confirmed ? 'border-success bg-success-soft/40' : 'border-border-subtle'
                              )}
                            >
                              <div className="mb-2.5">
                                <p className="text-body-md font-semibold leading-snug text-ink">{item.name}</p>
                                <div className="mt-1 flex items-center justify-between gap-2">
                                  <p className="text-body-sm text-ink-faint">{item.portion}</p>
                                  <ConfidenceTag level={item.confidence} className="shrink-0" />
                                </div>
                              </div>
                              <PortionAdjuster
                                multiplier={state.multiplier}
                                confirmed={state.confirmed}
                                onChange={(v) => setItem(item.id, { multiplier: v, confirmed: false })}
                                onConfirm={() => setItem(item.id, { confirmed: !state.confirmed })}
                              />
                            </div>
                          )
                        })}

                        <Button
                          variant={allConfirmed ? 'ink' : 'primary'}
                          className="mt-1 w-full"
                          onClick={() => setClearedMeals((s) => ({ ...s, [meal.id]: true }))}
                        >
                          {allConfirmed ? 'Send confirmed log' : `Confirm all as estimated`}
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="videos" className="flex flex-col gap-3">
            {pendingVideos.length === 0 ? (
              <EmptyQueue label="Form check queue clear" hint="New submissions from clients will show up here." />
            ) : (
              pendingVideos.map((v) => (
                <div key={v.id} className="flex gap-3 rounded-md border border-border-subtle bg-surface p-3 shadow-card">
                  <div className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-sm border border-border-subtle bg-surface-sunken">
                    <Play className="h-5 w-5 text-ink" fill="currentColor" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg font-semibold text-ink">{v.clientName}</p>
                    <p className="truncate text-body-sm text-ink-soft">
                      {v.exercise} · {v.durationSeconds}s · {v.submittedAt}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="primary" className="h-8 px-3" onClick={() => setClearedVideos((s) => ({ ...s, [v.id]: true }))}>
                        Looks good
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 px-3">
                        Leave note
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function EmptyQueue({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-border-subtle px-6 py-10 text-center">
      <p className="text-heading-sm text-ink">{label}</p>
      <p className="text-body-sm text-ink-soft">{hint}</p>
    </div>
  )
}
