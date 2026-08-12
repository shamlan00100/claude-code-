import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { RestTimer } from '@/components/pt/RestTimer'
import { SetRow } from '@/components/pt/SetRow'
import { CoachNote } from '@/components/pt/CoachNote'
import { OfflineBanner } from '@/components/pt/OfflineBanner'
import { activeExercise, nextExercises } from '@/mock'
import type { ExerciseSet } from '@/mock/types'

export function SetLogger() {
  const [sets, setSets] = useState<ExerciseSet[]>(activeExercise.sets)
  const [resting, setResting] = useState(true)
  const activeIndex = sets.findIndex((s) => s.status === 'active')

  const donesCount = sets.filter((s) => s.status === 'done').length

  const handleChangeActive = (patch: Partial<{ weightKg: number; reps: number; rpe: number }>) => {
    setSets((prev) =>
      prev.map((s, i) => (i === activeIndex ? { ...s, ...patch } : s))
    )
  }

  const handleLog = () => {
    setSets((prev) =>
      prev.map((s, i) => {
        if (i === activeIndex) {
          const isPr =
            s.lastSessionWeightKg != null &&
            s.weightKg != null &&
            s.reps != null &&
            s.lastSessionReps != null &&
            s.weightKg >= s.lastSessionWeightKg &&
            s.reps > (s.lastSessionReps ?? 0)
          return { ...s, status: 'done' as const, isPr }
        }
        if (i === activeIndex + 1) {
          return { ...s, status: 'active' as const, weightKg: s.weightKg ?? sets[activeIndex].weightKg }
        }
        return s
      })
    )
    setResting(true)
  }

  const allDone = activeIndex === -1

  const progressLabel = useMemo(() => `${donesCount} of ${sets.length} sets`, [donesCount, sets.length])

  return (
    <div className="flex min-h-full flex-col">
      <TopBar title={activeExercise.name} meta={`${todayMeta()} · Set ${Math.min(donesCount + 1, sets.length)} of ${sets.length}`} showHome />

      <div className="flex flex-col gap-4 px-5 pb-8 pt-4">
        <OfflineBanner pendingCount={donesCount} />

        {resting && !allDone && (
          <RestTimer initialSeconds={activeExercise.restSeconds} onSkip={() => setResting(false)} />
        )}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-eyebrow uppercase text-ink-soft">{activeExercise.muscleGroup}</p>
            <p className="text-body-sm font-semibold text-ink-soft">{progressLabel}</p>
          </div>

          <div className="flex flex-col gap-2.5">
            {sets.map((set) => (
              <SetRow
                key={set.id}
                set={set}
                onChangeActive={set.status === 'active' ? handleChangeActive : undefined}
                onLog={set.status === 'active' ? handleLog : undefined}
              />
            ))}
          </div>
        </div>

        {allDone && (
          <div className="rounded-md border-2 border-success bg-success-soft/60 px-4 py-3.5">
            <p className="text-heading-sm text-success">Barbell Back Squat complete</p>
            <p className="mt-0.5 text-body-md text-ink-soft">Nice work — on to Romanian deadlift next.</p>
          </div>
        )}

        {activeExercise.coachNote && <CoachNote from="Coach Fahad" note={activeExercise.coachNote} />}

        <div>
          <p className="mb-2 text-eyebrow uppercase text-ink-soft">Up next</p>
          <ul className="flex flex-col gap-2">
            {nextExercises.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-3 rounded-md border-2 border-border-subtle bg-surface/60 px-3.5 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-body-lg font-semibold text-ink-soft">{ex.name}</span>
                  <span className="text-body-sm text-ink-faint">
                    {ex.sets} sets × {ex.reps}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint rtl:rotate-180" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function todayMeta() {
  return 'Week 6 · Day 3 — Lower'
}
