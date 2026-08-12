import { useState } from 'react'
import { ChevronDown, Link2, Plus, User } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { activeProgram } from '@/mock'
import { cn } from '@/lib/utils'

export function ProgramBuilder() {
  const [openWeek, setOpenWeek] = useState<string | undefined>(activeProgram.weeks[0]?.id)
  const [openDay, setOpenDay] = useState<string | undefined>(activeProgram.weeks[0]?.days[0]?.id)

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Programs" meta={activeProgram.name} showHome />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        <div className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-3.5 py-3 shadow-card">
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-ink-soft" />
            <div>
              <p className="text-body-sm text-ink-soft">Assigned to</p>
              <p className="text-body-lg font-semibold text-ink">{activeProgram.client}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-9 px-3">
            Reassign
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {activeProgram.weeks.map((week) => {
            const weekOpen = openWeek === week.id
            return (
              <div key={week.id} className="rounded-md border border-border-subtle bg-surface shadow-card">
                <button
                  type="button"
                  onClick={() => setOpenWeek(weekOpen ? undefined : week.id)}
                  className="flex w-full items-center justify-between px-3.5 py-3"
                >
                  <span className="font-display text-heading-md">{week.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-body-sm text-ink-faint">{week.days.length} days</span>
                    <ChevronDown className={cn('h-4 w-4 text-ink-faint transition-transform duration-fast', weekOpen && 'rotate-180')} />
                  </div>
                </button>

                {weekOpen && (
                  <div className="flex flex-col gap-2 border-t border-border-subtle p-2.5">
                    {week.days.map((day) => {
                      const dayOpen = openDay === day.id
                      return (
                        <div key={day.id} className="rounded-sm border border-border-subtle">
                          <button
                            type="button"
                            onClick={() => setOpenDay(dayOpen ? undefined : day.id)}
                            className="flex w-full items-center justify-between px-3 py-2.5"
                          >
                            <span className="text-heading-sm">{day.name}</span>
                            <ChevronDown className={cn('h-3.5 w-3.5 text-ink-faint transition-transform duration-fast', dayOpen && 'rotate-180')} />
                          </button>

                          {dayOpen && (
                            <div className="flex flex-col gap-1.5 border-t border-border-subtle p-2.5 pt-2">
                              {day.exercises.map((ex, i) => (
                                <div
                                  key={ex.id}
                                  className={cn(
                                    'flex items-center gap-2.5 rounded-sm bg-surface-sunken px-2.5 py-2',
                                    ex.superset && 'border-s-4 border-accent'
                                  )}
                                >
                                  <span className="w-4 shrink-0 text-center text-body-sm font-bold text-ink-faint">{i + 1}</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-body-md font-semibold text-ink">{ex.name}</p>
                                    <p className="tabular text-body-sm text-ink-soft">
                                      {ex.sets} × {ex.reps} · RPE {ex.rpe} · rest {ex.restSeconds}s
                                    </p>
                                  </div>
                                  {ex.superset && (
                                    <Badge variant="accent" className="shrink-0 gap-1">
                                      <Link2 className="h-2.5 w-2.5" /> Superset
                                    </Badge>
                                  )}
                                </div>
                              ))}
                              <Button variant="ghost" size="sm" className="mt-1 justify-start text-primary">
                                <Plus className="h-4 w-4" /> Add exercise
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    <Button variant="outline" size="sm" className="justify-center">
                      <Plus className="h-4 w-4" /> Add day
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <Button variant="primary" size="lg" className="w-full">
          <Plus className="h-5 w-5" /> Add week
        </Button>
      </div>
    </div>
  )
}
