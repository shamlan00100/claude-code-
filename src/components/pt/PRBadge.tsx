import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PRBadge({ label = 'PR', className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex animate-pr-pop items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-label uppercase text-accent-foreground shadow-card',
        className
      )}
    >
      <Trophy className="h-3 w-3" strokeWidth={2.5} />
      {label}
    </span>
  )
}
