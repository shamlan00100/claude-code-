import { MessageCircle } from 'lucide-react'

export function CoachNote({ from, note }: { from: string; note: string }) {
  return (
    <div className="flex gap-3 rounded-md border-l-[5px] border-accent bg-accent-soft/50 py-3 ps-3.5 pe-4">
      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
      <div className="min-w-0">
        <p className="text-label text-accent">{from}</p>
        <p className="mt-0.5 text-body-md text-ink">{note}</p>
      </div>
    </div>
  )
}
