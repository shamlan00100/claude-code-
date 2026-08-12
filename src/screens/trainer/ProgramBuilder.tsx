import { useState } from 'react'
import { Check, ChevronDown, Link2, Plus, User, Users } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { programs as initialPrograms, exerciseLibrary, clients, clientById } from '@/mock'
import { cn } from '@/lib/utils'
import type { Program, ProgramWeek } from '@/mock/types'

let nextId = 100

export function ProgramBuilder() {
  const [programList, setProgramList] = useState<Program[]>(initialPrograms)
  const [selectedId, setSelectedId] = useState(programList[0].id)
  const [openWeek, setOpenWeek] = useState<string | undefined>(programList[0]?.weeks[0]?.id)
  const [openDay, setOpenDay] = useState<string | undefined>(programList[0]?.weeks[0]?.days[0]?.id)
  const [assignOpen, setAssignOpen] = useState(false)

  const program = programList.find((p) => p.id === selectedId) ?? programList[0]

  const updateProgram = (id: string, updater: (p: Program) => Program) =>
    setProgramList((list) => list.map((p) => (p.id === id ? updater(p) : p)))

  const selectProgram = (id: string) => {
    setSelectedId(id)
    const p = programList.find((x) => x.id === id)
    setOpenWeek(p?.weeks[0]?.id)
    setOpenDay(p?.weeks[0]?.days[0]?.id)
  }

  const handleNewProgram = () => {
    const id = `prog-${nextId++}`
    const fresh: Program = { id, name: 'New program', clientId: null, weeks: [] }
    setProgramList((list) => [...list, fresh])
    selectProgram(id)
  }

  const handleAssign = (clientId: string) => {
    updateProgram(program.id, (p) => ({ ...p, clientId }))
    setAssignOpen(false)
  }

  const handleAddWeek = () => {
    const weekNum = program.weeks.length + 1
    const week: ProgramWeek = { id: `w-${nextId++}`, label: `Week ${weekNum}`, days: [] }
    updateProgram(program.id, (p) => ({ ...p, weeks: [...p.weeks, week] }))
    setOpenWeek(week.id)
  }

  const handleAddDay = (weekId: string) => {
    updateProgram(program.id, (p) => ({
      ...p,
      weeks: p.weeks.map((w) =>
        w.id === weekId
          ? { ...w, days: [...w.days, { id: `d-${nextId++}`, name: `Day ${w.days.length + 1}`, exercises: [] }] }
          : w
      ),
    }))
  }

  const handleAddExercise = (weekId: string, dayId: string) => {
    updateProgram(program.id, (p) => ({
      ...p,
      weeks: p.weeks.map((w) =>
        w.id !== weekId
          ? w
          : {
              ...w,
              days: w.days.map((d) => {
                if (d.id !== dayId) return d
                const name = exerciseLibrary[d.exercises.length % exerciseLibrary.length]
                return {
                  ...d,
                  exercises: [...d.exercises, { id: `ex-${nextId++}`, name, sets: 3, reps: '10', rpe: '7', restSeconds: 90 }],
                }
              }),
            }
      ),
    }))
  }

  const assignedClient = program.clientId ? clientById(program.clientId) : undefined

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title="Programs" meta={`${programList.length} programs`} showHome />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        {/* Program switcher */}
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {programList.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectProgram(p.id)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-2 text-body-sm font-semibold transition-colors duration-fast',
                p.id === program.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border-subtle text-ink-soft hover:border-primary/40'
              )}
            >
              {p.name}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNewProgram}
            className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-faint px-3.5 py-2 text-body-sm font-semibold text-ink-soft transition-colors duration-fast hover:border-primary hover:text-primary"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
        </div>

        <p className="font-display text-heading-md text-ink">{program.name}</p>

        {/* Assignment */}
        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-md border px-3.5 py-3 shadow-card',
            assignedClient ? 'border-border-subtle bg-surface' : 'border-warning/50 bg-warning-soft/30'
          )}
        >
          <div className="flex items-center gap-2.5">
            {assignedClient ? (
              <Avatar>
                <AvatarFallback>{assignedClient.avatarInitials}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-warning/40 bg-warning-soft">
                <User className="h-4.5 w-4.5 text-warning" />
              </div>
            )}
            <div>
              <p className="text-body-sm text-ink-soft">{assignedClient ? 'Assigned to' : 'Not assigned yet'}</p>
              <p className="text-body-lg font-semibold text-ink">{assignedClient ? assignedClient.name : 'Pick a client to assign'}</p>
            </div>
          </div>
          <Button
            variant={assignedClient ? 'outline' : 'primary'}
            size="sm"
            className="h-9 shrink-0 px-3"
            onClick={() => setAssignOpen(true)}
          >
            {assignedClient ? 'Reassign' : 'Assign'}
          </Button>
        </div>

        {/* Weeks */}
        {program.weeks.length === 0 ? (
          <div className="flex flex-col items-start gap-2.5 rounded-md border border-dashed border-border-subtle p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle bg-surface-sunken">
              <Plus className="h-4.5 w-4.5 text-ink-soft" />
            </div>
            <p className="text-heading-sm">No weeks yet</p>
            <p className="text-body-sm text-ink-soft">Add the first training week to start building this program.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {program.weeks.map((week) => {
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
                                {day.exercises.length === 0 && (
                                  <p className="px-1 py-1 text-body-sm text-ink-faint">No exercises yet.</p>
                                )}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 justify-start text-primary"
                                  onClick={() => handleAddExercise(week.id, day.id)}
                                >
                                  <Plus className="h-4 w-4" /> Add exercise
                                </Button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      <Button variant="outline" size="sm" className="justify-center" onClick={() => handleAddDay(week.id)}>
                        <Plus className="h-4 w-4" /> Add day
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <Button variant="primary" size="lg" className="w-full" onClick={handleAddWeek}>
          <Plus className="h-5 w-5" /> Add week
        </Button>
      </div>

      {/* Assign-to-client sheet */}
      <Sheet open={assignOpen} onOpenChange={setAssignOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Assign program</SheetTitle>
            <SheetDescription>Choose who "{program.name}" belongs to.</SheetDescription>
          </SheetHeader>
          <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {clients.map((c) => {
              const selected = c.id === program.clientId
              const takenBy = programList.find((p) => p.id !== program.id && p.clientId === c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleAssign(c.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-md border px-3.5 py-3 text-start transition-colors duration-fast',
                    selected ? 'border-primary bg-primary-soft/40' : 'border-border-subtle hover:border-primary/40'
                  )}
                >
                  <Avatar>
                    <AvatarFallback>{c.avatarInitials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-lg font-semibold text-ink">{c.name}</p>
                    <p className="truncate text-body-sm text-ink-soft">
                      {takenBy ? `Currently on ${takenBy.name}` : c.goal}
                    </p>
                  </div>
                  {selected && <Check className="h-5 w-5 shrink-0 text-primary" strokeWidth={3} />}
                </button>
              )
            })}
          </div>
          {clients.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-6 text-center">
              <Users className="h-6 w-6 text-ink-faint" />
              <p className="text-body-sm text-ink-soft">No clients to assign yet.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
