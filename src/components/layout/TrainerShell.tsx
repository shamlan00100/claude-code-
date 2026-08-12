import { Outlet } from 'react-router-dom'
import { ListChecks, Users, CalendarRange } from 'lucide-react'
import { BottomNav } from './BottomNav'

const items = [
  { to: '/coach/queue', label: 'Queue', icon: ListChecks },
  { to: '/coach/roster', label: 'Roster', icon: Users },
  { to: '/coach/programs', label: 'Programs', icon: CalendarRange },
]

export function TrainerShell() {
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <Outlet />
        <div className="pointer-events-none sticky bottom-0 -mt-8 h-8 bg-gradient-to-t from-background to-transparent" aria-hidden />
      </div>
      <BottomNav items={items} />
    </div>
  )
}
