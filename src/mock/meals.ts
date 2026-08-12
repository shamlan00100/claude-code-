import type { MealLog } from './types'

export const activeMeal: MealLog = {
  id: 'meal-1',
  clientName: 'Yusuf Almannai',
  clientInitials: 'YA',
  photoLabel: 'Lunch, chicken machboos',
  loggedAt: 'Today, 1:24pm',
  status: 'awaiting-coach',
  items: [
    {
      id: 'f1',
      name: 'Chicken machboos',
      portion: '~1.5 cups, 320g',
      calories: 540,
      proteinG: 32,
      carbsG: 61,
      fatG: 16,
      confidence: 'high',
    },
    {
      id: 'f2',
      name: 'Laban',
      portion: '1 glass, 200ml',
      calories: 90,
      proteinG: 5,
      carbsG: 8,
      fatG: 4,
      confidence: 'high',
    },
    {
      id: 'f3',
      name: 'Dagoos (tomato chilli sauce)',
      portion: '~2 tbsp',
      calories: 35,
      proteinG: 1,
      carbsG: 5,
      fatG: 1,
      confidence: 'medium',
    },
    {
      id: 'f4',
      name: 'Side salad, unclear dressing',
      portion: 'small bowl',
      calories: 60,
      proteinG: 1,
      carbsG: 6,
      fatG: 3,
      confidence: 'low',
    },
  ],
}

export const reviewQueueMeals: MealLog[] = [
  activeMeal,
  {
    id: 'meal-2',
    clientName: 'Noor Khalifa',
    clientInitials: 'NK',
    photoLabel: 'Breakfast, balaleet',
    loggedAt: 'Today, 8:02am',
    status: 'awaiting-coach',
    items: [
      { id: 'f5', name: 'Balaleet', portion: '~1 cup, 220g', calories: 410, proteinG: 11, carbsG: 58, fatG: 15, confidence: 'medium' },
      { id: 'f6', name: 'Karak chai', portion: '1 cup, 150ml', calories: 95, proteinG: 2, carbsG: 14, fatG: 3, confidence: 'high' },
    ],
  },
  {
    id: 'meal-3',
    clientName: 'Ahmed Buali',
    clientInitials: 'AB',
    photoLabel: 'Dinner, harees + dates',
    loggedAt: 'Yesterday, 8:41pm',
    status: 'awaiting-coach',
    items: [
      { id: 'f7', name: 'Harees, lamb', portion: '~1.5 cups, 300g', calories: 480, proteinG: 24, carbsG: 55, fatG: 17, confidence: 'medium' },
      { id: 'f8', name: 'Dates', portion: '3 pieces', calories: 70, proteinG: 1, carbsG: 18, fatG: 0, confidence: 'high' },
      { id: 'f9', name: 'Unidentified fried item', portion: 'unclear', calories: 150, proteinG: 4, carbsG: 14, fatG: 9, confidence: 'low' },
    ],
  },
  {
    id: 'meal-4',
    clientName: 'Reem Alaali',
    clientInitials: 'RA',
    photoLabel: 'Lunch, chicken shawarma wrap',
    loggedAt: 'Yesterday, 1:10pm',
    status: 'awaiting-coach',
    items: [
      { id: 'f10', name: 'Chicken shawarma wrap', portion: '1 wrap, ~280g', calories: 520, proteinG: 28, carbsG: 48, fatG: 22, confidence: 'medium' },
      { id: 'f11', name: 'Garlic sauce', portion: '~2 tbsp', calories: 110, proteinG: 0, carbsG: 1, fatG: 12, confidence: 'low' },
    ],
  },
]
