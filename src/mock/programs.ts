import type { Program } from './types'

export const programs: Program[] = [
  {
  id: 'prog-1',
  name: 'Strength Base — 8 Week Block',
  clientId: 'c-yusuf',
  weeks: [
    {
      id: 'w1',
      label: 'Week 1',
      days: [
        {
          id: 'w1d1',
          name: 'Day 1 — Lower',
          exercises: [
            { id: 'e1', name: 'Barbell Back Squat', sets: 4, reps: '5', rpe: '7', restSeconds: 150 },
            { id: 'e2', name: 'Romanian Deadlift', sets: 3, reps: '8', rpe: '7', restSeconds: 120 },
            { id: 'e3', name: 'Leg Press', sets: 3, reps: '10-12', rpe: '8', restSeconds: 90 },
            { id: 'e4', name: 'Standing Calf Raise', sets: 4, reps: '15', rpe: '8', restSeconds: 60 },
          ],
        },
        {
          id: 'w1d2',
          name: 'Day 2 — Upper Push',
          exercises: [
            { id: 'e5', name: 'Barbell Bench Press', sets: 4, reps: '5', rpe: '7', restSeconds: 150 },
            { id: 'e6', name: 'Dumbbell Shoulder Press', sets: 3, reps: '8-10', rpe: '8', restSeconds: 90, superset: true },
            { id: 'e7', name: 'Lateral Raise', sets: 3, reps: '12-15', rpe: '8', restSeconds: 60, superset: true },
            { id: 'e8', name: 'Triceps Pushdown', sets: 3, reps: '12', rpe: '8', restSeconds: 60 },
          ],
        },
        {
          id: 'w1d3',
          name: 'Day 3 — Upper Pull',
          exercises: [
            { id: 'e9', name: 'Weighted Pull-up', sets: 4, reps: '5-6', rpe: '8', restSeconds: 150 },
            { id: 'e10', name: 'Cable Row', sets: 3, reps: '10', rpe: '7', restSeconds: 90 },
            { id: 'e11', name: 'Face Pull', sets: 3, reps: '15', rpe: '7', restSeconds: 60 },
          ],
        },
      ],
    },
    {
      id: 'w2',
      label: 'Week 2',
      days: [
        {
          id: 'w2d1',
          name: 'Day 1 — Lower',
          exercises: [
            { id: 'e12', name: 'Barbell Back Squat', sets: 4, reps: '5', rpe: '7.5', restSeconds: 150 },
            { id: 'e13', name: 'Romanian Deadlift', sets: 3, reps: '8', rpe: '7.5', restSeconds: 120 },
            { id: 'e14', name: 'Bulgarian Split Squat', sets: 3, reps: '10 / leg', rpe: '8', restSeconds: 90 },
          ],
        },
      ],
    },
  ],
  },
  {
    id: 'prog-2',
    name: 'Fat Loss Circuit — 6 Week Block',
    clientId: 'c-layla',
    weeks: [
      {
        id: 'p2w1',
        label: 'Week 1',
        days: [
          {
            id: 'p2w1d1',
            name: 'Day 1 — Full Body',
            exercises: [
              { id: 'p2e1', name: 'Barbell Back Squat', sets: 3, reps: '10', rpe: '7', restSeconds: 90 },
              { id: 'p2e2', name: 'Cable Row', sets: 3, reps: '12', rpe: '7', restSeconds: 75 },
              { id: 'p2e3', name: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rpe: '7', restSeconds: 75 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'prog-3',
    name: 'New program',
    clientId: null,
    weeks: [],
  },
]

export const exerciseLibrary = [
  'Barbell Back Squat',
  'Barbell Bench Press',
  'Barbell Deadlift',
  'Romanian Deadlift',
  'Overhead Press',
  'Weighted Pull-up',
  'Lat Pulldown',
  'Cable Row',
  'Leg Press',
  'Bulgarian Split Squat',
  'Hip Thrust',
  'Standing Calf Raise',
  'Dumbbell Shoulder Press',
  'Lateral Raise',
  'Face Pull',
  'Triceps Pushdown',
]
