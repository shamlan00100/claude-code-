import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TopBar({
  title,
  meta,
  onBack,
  showHome = false,
  right,
  align = 'start',
  className,
}: {
  title: string
  meta?: string
  onBack?: () => void
  showHome?: boolean
  right?: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}) {
  const navigate = useNavigate()
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b-[3px] border-ink bg-background px-5 pb-3.5 pt-[max(env(safe-area-inset-top),0.875rem)]',
        className
      )}
    >
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 border-ink transition-colors duration-fast hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4.5 w-4.5 rtl:rotate-180" />
        </button>
      ) : showHome ? (
        <button
          onClick={() => navigate('/')}
          aria-label="All screens"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 border-ink transition-colors duration-fast hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      ) : (
        <div className="w-9 shrink-0" />
      )}

      <div className={cn('flex min-w-0 flex-1 flex-col', align === 'end' ? 'items-end text-end' : 'items-start text-start')}>
        <h1 className="truncate font-display text-[22px] font-black uppercase leading-none tracking-[0.01em]">{title}</h1>
        {meta && <p className="mt-1 truncate text-label uppercase text-ink-soft">{meta}</p>}
      </div>

      {right ? <div className="shrink-0">{right}</div> : <div className="w-9 shrink-0" />}
    </header>
  )
}
