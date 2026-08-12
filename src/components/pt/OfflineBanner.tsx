import { CloudOff } from 'lucide-react'

export function OfflineBanner({ pendingCount = 0 }: { pendingCount?: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-dashed border-ink-faint px-3 py-2 text-label text-ink-soft">
      <CloudOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
      <span className="flex-1">Offline — saving here</span>
      {pendingCount > 0 && (
        <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-accent">
          {pendingCount} to sync
        </span>
      )}
    </div>
  )
}
