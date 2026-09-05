import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export function BottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      className="glass grid border-t border-border-subtle pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      aria-label="Primary"
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-1 py-1.5 text-label text-ink-faint transition-colors duration-fast',
              isActive && 'text-primary'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.75} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
