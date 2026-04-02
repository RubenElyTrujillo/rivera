#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
prisma migrate deploy --datasource-url "$DATABASE_URL"

echo "▶ Ejecutando seed inicial..."
npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node server.js
