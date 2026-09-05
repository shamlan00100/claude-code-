import type { Exercise } from './types'

// Yusuf Almannai — Week 6, Day 3 (Lower), live session in progress.
export const activeExercise: Exercise = {
  id: 'ex-back-squat',
  name: 'Barbell Back Squat',
  muscleGroup: 'Legs',
  restSeconds: 150,
  coachNote: "Chest up through the sticking point — don't rush the drive out of the hole.",
  sets: [
    {
      id: 's1',
      setNumber: 1,
      targetReps: '5',
      weightKg: 100,
      reps: 5,
      rpe: 7,
      lastSessionWeightKg: 97.5,
      lastSessionReps: 5,
      isPr: false,
      status: 'done',
    },
    {
      id: 's2',
      setNumber: 2,
      targetReps: '5',
      weightKg: 100,
      reps: 5,
      rpe: 8,
      lastSessionWeightKg: 97.5,
      lastSessionReps: 5,
      isPr: true,
      status: 'done',
    },
    {
      id: 's3',
      setNumber: 3,
      targetReps: '5',
      weightKg: 100,
      reps: 5,
      rpe: 8,
      lastSessionWeightKg: 97.5,
      lastSessionReps: 5,
      isPr: false,
      status: 'active',
    },
    {
      id: 's4',
      setNumber: 4,
      targetReps: '5',
      weightKg: null,
      reps: null,
      rpe: null,
      lastSessionWeightKg: 97.5,
      lastSessionReps: 4,
      isPr: false,
      status: 'pending',
    },
  ],
}

export const nextExercises = [
  { id: 'ex-rdl', name: 'Romanian Deadlift', sets: 3, reps: '8', done: false },
  { id: 'ex-legpress', name: 'Leg Press', sets: 3, reps: '10-12', done: false },
  { id: 'ex-calf', name: 'Standing Calf Raise', sets: 4, reps: '15', done: false },
]

export const todaySession = {
  dayLabel: 'Week 6 · Day 3 — Lower body',
  gym: 'Warehouse Gym, Adliya',
  startTime: '6:00 PM',
  exerciseCount: 4,
  estMinutes: 55,
}
