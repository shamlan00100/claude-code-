import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import {
  ClientsIcon,
  HistoryIcon,
  ProfileIcon,
  ProgramsIcon,
  TodayIcon,
  TrainIcon,
} from '#/components/icons'
import { useT } from '#/i18n'
import type { Messages } from '#/i18n/en'
import type { Role } from '#/lib/auth'
import { getSessionUser } from '#/lib/session'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    const user = await getSessionUser()
    if (!user) throw redirect({ to: '/sign-in' })
    return { user }
  },
  component: AppShell,
})

type NavTo =
  '/today' | '/clients' | '/programs' | '/profile' | '/train' | '/history'

interface NavItem {
  to: NavTo
  label: (t: Messages) => string
  icon: ReactNode
}

// Navigation by moment, never by entity. Four items maximum.
const NAV: Record<Role, NavItem[]> = {
  trainer: [
    { to: '/today', label: (t) => t.nav.today, icon: <TodayIcon /> },
    { to: '/clients', label: (t) => t.nav.clients, icon: <ClientsIcon /> },
    { to: '/programs', label: (t) => t.nav.programs, icon: <ProgramsIcon /> },
    { to: '/profile', label: (t) => t.nav.profile, icon: <ProfileIcon /> },
  ],
  client: [
    { to: '/today', label: (t) => t.nav.today, icon: <TodayIcon /> },
    { to: '/train', label: (t) => t.nav.train, icon: <TrainIcon /> },
    { to: '/history', label: (t) => t.nav.history, icon: <HistoryIcon /> },
    { to: '/profile', label: (t) => t.nav.profile, icon: <ProfileIcon /> },
  ],
  admin: [
    { to: '/today', label: (t) => t.nav.today, icon: <TodayIcon /> },
    { to: '/profile', label: (t) => t.nav.profile, icon: <ProfileIcon /> },
  ],
}

function AppShell() {
  const t = useT()
  const { user } = Route.useRouteContext()
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-10 pb-28">
        <Outlet />
      </main>
      <nav
        aria-label={t.app.name}
        className="fixed inset-x-0 bottom-0 border-t border-hairline bg-raised pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-2xl">
          {NAV[user.role].map((item) => (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className="flex h-16 flex-col items-center justify-center gap-1 text-[0.75rem] leading-4"
                activeProps={{ className: 'text-iron font-semibold' }}
                inactiveProps={{ className: 'text-rock font-normal' }}
              >
                {item.icon}
                <span>{item.label(t)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

/** Redirects to Today when the signed-in user's role may not see a screen. */
export function requireRole(user: { role: Role }, allowed: Role[]) {
  if (!allowed.includes(user.role)) throw redirect({ to: '/today' })
}
