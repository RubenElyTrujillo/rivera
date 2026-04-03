#!/bin/sh
set -e

echo "▶ Esperando a PostgreSQL..."
until prisma migrate deploy --datasource-url "$DATABASE_URL"; do
  echo "  Fallo al conectar, reintentando en 3s..."
  sleep 3
done

echo "▶ Ejecutando seed inicial..."
npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node server.js
