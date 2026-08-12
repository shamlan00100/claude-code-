export type Confidence = 'high' | 'medium' | 'low'

export interface Trainer {
  id: string
  name: string
  gym: string
  area: string
  avatarInitials: string
}

export interface Client {
  id: string
  name: string
  avatarInitials: string
  gym: string
  area: string
  goal: string
  sessionCreditsLeft: number
  renewsOn: string
  status: 'on-track' | 'slipping' | 'at-risk'
  lastActive: string
  streakDays: number
}

export interface ExerciseSet {
  id: string
  setNumber: number
  targetReps: string
  weightKg: number | null
  reps: number | null
  rpe: number | null
  lastSessionWeightKg: number | null
  lastSessionReps: number | null
  isPr: boolean
  status: 'done' | 'active' | 'pending'
}

export interface Exercise {
  id: string
  name: string
  nameAr?: string
  muscleGroup: string
  sets: ExerciseSet[]
  restSeconds: number
  coachNote?: string
}

export interface ProgramDay {
  id: string
  name: string
  exercises: { id: string; name: string; sets: number; reps: string; rpe: string; restSeconds: number; superset?: boolean }[]
}

export interface ProgramWeek {
  id: string
  label: string
  days: ProgramDay[]
}

export interface Program {
  id: string
  name: string
  clientId: string | null
  weeks: ProgramWeek[]
}

export interface FoodItem {
  id: string
  name: string
  nameAr?: string
  portion: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  confidence: Confidence
}

export interface MealLog {
  id: string
  clientName: string
  clientInitials: string
  photoLabel: string
  loggedAt: string
  items: FoodItem[]
  status: 'awaiting-coach' | 'confirmed' | 'corrected'
}

export interface FormCheckVideo {
  id: string
  clientName: string
  clientInitials: string
  exercise: string
  submittedAt: string
  durationSeconds: number
  status: 'awaiting-review' | 'reviewed'
}
