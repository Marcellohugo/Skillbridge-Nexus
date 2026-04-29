#!/bin/sh
set -e

if [ "${MIGRATE_ON_STARTUP:-true}" = "true" ]; then
  echo "Running Prisma migrations (deploy)..."
  node node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma
else
  echo "Skipping Prisma migrations (MIGRATE_ON_STARTUP=false)."
fi

echo "Starting Next.js server..."
exec node server.js
