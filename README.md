# Focus PT

Mobile-first app for personal trainers and their clients. See `CLAUDE.md` for what the
product is and the rules it's built by, and `DESIGN.md` for the design reference.

## Run locally

Requires Node 22+ and a Postgres database.

```bash
cp .env.example .env.local   # then fill in DATABASE_URL and BETTER_AUTH_SECRET
npm install
npm run db:migrate
npm run db:seed              # creates the dev trainer and client accounts
npm run dev                  # http://localhost:3000
```

Before pushing: `npm run check` (typecheck, lint, production build).

## Deploy (Railway)

The repo is configured by `railway.json`:

- **Build**: `npm run build`
- **Pre-deploy**: `scripts/predeploy.sh` applies migrations, and seeds the dev accounts
  only when `ALLOW_SEED=true`
- **Start**: `npm run start`
- **Health check**: `/api/health`

Service variables:

| Variable              | Production                     | Dev / PR environments          |
| --------------------- | ------------------------------ | ------------------------------ |
| `DATABASE_URL`        | `${{Postgres.DATABASE_URL}}`   | `${{Postgres.DATABASE_URL}}`   |
| `BETTER_AUTH_SECRET`  | long random string             | a different long random string |
| `BETTER_AUTH_URL`     | your production URL (optional) | leave unset                    |
| `ENABLE_QUICK_SIGNIN` | **unset**                      | `true`                         |
| `ALLOW_SEED`          | **unset**                      | `true`                         |
