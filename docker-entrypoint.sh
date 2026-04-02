#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
node_modules/.bin/prisma migrate deploy

echo "▶ Ejecutando seed inicial..."
npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node server.js
