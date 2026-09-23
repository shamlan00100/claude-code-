import { createFileRoute } from '@tanstack/react-router'
import { sql } from 'drizzle-orm'

import { db } from '#/db'

// Used by Railway's health check: the app is up and the database answers.
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () => {
        await db.execute(sql`select 1`)
        return Response.json({ ok: true })
      },
    },
  },
})
