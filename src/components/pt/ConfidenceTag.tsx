import { Check, CircleAlert, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Confidence } from '@/mock/types'

const config: Record<Confidence, { label: string; icon: typeof Check; classes: string }> = {
  high: { label: 'Matched', icon: Check, classes: 'bg-success-soft text-success' },
  medium: { label: 'Check portion', icon: CircleAlert, classes: 'bg-warning-soft text-warning' },
  low: { label: 'Unsure', icon: HelpCircle, classes: 'border-2 border-dashed border-ink-faint text-ink-soft' },
}

export function ConfidenceTag({ level, className }: { level: Confidence; className?: string }) {
  const c = config[level]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-label uppercase', c.classes, className)}>
      <c.icon className="h-3 w-3" strokeWidth={2.5} />
      {c.label}
    </span>
  )
}
