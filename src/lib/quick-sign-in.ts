import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'
import { DEV_ACCOUNTS, DEV_PASSWORD } from '#/lib/dev-accounts'
import type { DevAccount } from '#/lib/dev-accounts'

// Gated on a server-side flag, never on anything the browser sends. Set
// ENABLE_QUICK_SIGNIN=true only in local and PR preview environments.
function enabled(): boolean {
  return process.env.ENABLE_QUICK_SIGNIN === 'true'
}

export const quickSignInEnabled = createServerFn({ method: 'GET' }).handler(
  () => enabled(),
)

export const quickSignIn = createServerFn({ method: 'POST' })
  .validator((as: DevAccount) => {
    if (!(as in DEV_ACCOUNTS)) throw new Error('Unknown account')
    return as
  })
  .handler(async ({ data }) => {
    if (!enabled()) throw new Error('Quick sign-in is disabled')
    await auth.api.signInEmail({
      body: { email: DEV_ACCOUNTS[data].email, password: DEV_PASSWORD },
      headers: getRequestHeaders(),
    })
  })
