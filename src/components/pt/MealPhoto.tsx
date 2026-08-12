import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Camera-viewfinder framed placeholder — stands in for a real photo without stock imagery. */
export function MealPhoto({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex w-full items-center justify-center overflow-hidden rounded-md border-2 border-ink bg-surface-sunken',
        className
      )}
      style={{ aspectRatio: '4 / 3' }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, hsl(var(--ink)) 0, hsl(var(--ink)) 1px, transparent 1px, transparent 10px)',
        }}
        aria-hidden
      />
      {['start-2 top-2 border-s-2 border-t-2', 'end-2 top-2 border-e-2 border-t-2', 'start-2 bottom-2 border-s-2 border-b-2', 'end-2 bottom-2 border-e-2 border-b-2'].map(
        (pos, i) => (
          <span key={i} className={cn('absolute h-4 w-4 border-ink/50', pos)} aria-hidden />
        )
      )}
      <div className="relative flex flex-col items-center gap-1.5 text-ink-soft">
        <Camera className="h-6 w-6" strokeWidth={1.75} />
        <span className="max-w-[80%] text-center text-body-sm font-medium">{label}</span>
      </div>
    </div>
  )
}
