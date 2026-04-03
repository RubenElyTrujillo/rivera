#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
# Ejecutar desde /tmp para que Prisma no detecte prisma.config.ts en /app
cd /tmp && prisma migrate deploy \
  --datasource-url "$DATABASE_URL" \
  --schema /app/prisma/schema.prisma

echo "▶ Ejecutando seed inicial..."
cd /app && npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node /app/server.js
