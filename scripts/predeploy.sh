#!/bin/sh
# Runs on Railway before each deploy: apply migrations, then seed the
# development accounts only where ALLOW_SEED=true (never in production).
set -e
npm run db:migrate
if [ "$ALLOW_SEED" = "true" ]; then
  npm run db:seed
fi
