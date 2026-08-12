import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Our fontSize scale in tailwind.config.ts uses semantic names (text-body-sm,
// text-heading-md, ...) instead of Tailwind's default t-shirt sizes. Without
// this, tailwind-merge doesn't recognise them as the "font-size" group and
// silently drops a sibling "text-{color}" class whenever both appear in the
// same className string (they look like the same group otherwise).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display-xl',
        'text-display-lg',
        'text-display-md',
        'text-display-sm',
        'text-heading-lg',
        'text-heading-md',
        'text-heading-sm',
        'text-body-lg',
        'text-body-md',
        'text-body-sm',
        'text-label',
        'text-eyebrow',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
