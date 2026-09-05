import { Outlet } from 'react-router-dom'
import { Dumbbell, Camera, TrendingUp, Home } from 'lucide-react'
import { BottomNav } from './BottomNav'

const items = [
  { to: '/app/today', label: 'Today', icon: Home },
  { to: '/app/log', label: 'Train', icon: Dumbbell },
  { to: '/app/meals', label: 'Meals', icon: Camera },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
]

export function ClientShell() {
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
