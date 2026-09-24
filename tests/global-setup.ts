import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Client } from 'pg'

const url =
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres@localhost:5432/focuspt_test'

/** Drops and recreates the test database, then applies every migration. */
export default async function setup() {
  const target = new URL(url)
  const name = target.pathname.slice(1)
  if (!name.endsWith('_test')) {
    throw new Error(
      `Refusing to reset ${name}: test databases must end in _test`,
    )
  }
  const admin = new URL(url)
  admin.pathname = '/postgres'
  const client = new Client({ connectionString: admin.toString() })
  await client.connect()
  await client.query(`drop database if exists "${name}" with (force)`)
  await client.query(`create database "${name}"`)
  await client.end()

  const db = drizzle(url)
  await migrate(db, { migrationsFolder: 'drizzle' })
  await db.$client.end()
}
