import { defineConfig } from 'vitest/config'

// Database tests run against a separate database (focuspt_test by default),
// rebuilt from the migrations before each run.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/global-setup.ts'],
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgresql://postgres@localhost:5432/focuspt_test',
      BETTER_AUTH_SECRET: 'test-secret-not-for-production-0123456789',
    },
    // Tests share one database, so run files one at a time.
    fileParallelism: false,
  },
})
