import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

import { LocaleProvider, dirFor } from '#/i18n'
import { getPrefs } from '#/lib/prefs'

import appCss from '../styles.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => ({ prefs: await getPrefs() }),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Focus PT' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { prefs } = Route.useRouteContext()
  const themeClass = prefs.theme === 'system' ? undefined : prefs.theme
  return (
    <html lang={prefs.locale} dir={dirFor(prefs.locale)} className={themeClass}>
      <head>
        <HeadContent />
      </head>
      <body>
        <LocaleProvider value={prefs.locale}>{children}</LocaleProvider>
        <Scripts />
      </body>
    </html>
  )
}
