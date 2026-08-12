export const bodyweightTrend = [
  { date: 'Jun 15', kg: 84.2 },
  { date: 'Jun 22', kg: 83.8 },
  { date: 'Jun 29', kg: 83.5 },
  { date: 'Jul 6', kg: 83.1 },
  { date: 'Jul 13', kg: 82.9 },
  { date: 'Jul 20', kg: 82.4 },
  { date: 'Jul 27', kg: 82.6 },
  { date: 'Aug 3', kg: 82.0 },
  { date: 'Aug 10', kg: 81.7 },
]

export const liftTrend = {
  exercise: 'Barbell Back Squat',
  points: [
    { date: 'Jun 15', kg: 90 },
    { date: 'Jun 29', kg: 92.5 },
    { date: 'Jul 13', kg: 95 },
    { date: 'Jul 27', kg: 97.5 },
    { date: 'Aug 10', kg: 100 },
  ],
}

// Weekly averages, rolled up from AI-estimated portions on every meal photo
// logged that week — not manually entered.
export const nutritionTrend = {
  protein: [
    { date: 'Jun 15', g: 98 },
    { date: 'Jun 22', g: 105 },
    { date: 'Jun 29', g: 112 },
    { date: 'Jul 6', g: 118 },
    { date: 'Jul 13', g: 122 },
    { date: 'Jul 20', g: 128 },
    { date: 'Jul 27', g: 131 },
    { date: 'Aug 3', g: 135 },
    { date: 'Aug 10', g: 138 },
  ],
  carbs: [
    { date: 'Jun 15', g: 245 },
    { date: 'Jun 22', g: 238 },
    { date: 'Jun 29', g: 250 },
    { date: 'Jul 6', g: 242 },
    { date: 'Jul 13', g: 230 },
    { date: 'Jul 20', g: 235 },
    { date: 'Jul 27', g: 228 },
    { date: 'Aug 3', g: 233 },
    { date: 'Aug 10', g: 229 },
  ],
  target: { proteinG: 160, carbsG: 260 },
}

export const measurements = [
  { label: 'Waist', value: '84 cm', delta: '-2 cm', direction: 'down' as const },
  { label: 'Chest', value: '102 cm', delta: '+1 cm', direction: 'up' as const },
  { label: 'Hips', value: '96 cm', delta: '-1 cm', direction: 'down' as const },
  { label: 'Left arm', value: '35 cm', delta: '+0.5 cm', direction: 'up' as const },
]

export const progressPhotos = [
  { id: 'p1', date: 'Jun 1', label: 'Week 1' },
  { id: 'p2', date: 'Jul 1', label: 'Week 5' },
  { id: 'p3', date: 'Aug 1', label: 'Week 9' },
]
