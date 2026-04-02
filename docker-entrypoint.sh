#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
npx prisma migrate deploy

echo "▶ Ejecutando seed inicial..."
dotenv -e .env -- npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node server.js
