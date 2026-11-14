#!/bin/sh
# Applies the database migrations (structure + basic data) and then starts the API.
set -e
echo "A aplicar as migrations…"
npx prisma migrate deploy
exec "$@"
