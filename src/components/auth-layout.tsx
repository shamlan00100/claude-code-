import type { ReactNode } from 'react'

import { useT } from '#/i18n'

export function AuthLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const t = useT()
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <p className="type-detail font-medium text-rock">{t.app.name}</p>
        <h1 className="type-title text-iron">{title}</h1>
      </div>
      {children}
    </main>
  )
}
