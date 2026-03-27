#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
npx prisma migrate deploy

# Run seed only once (marker file in persistent volume)
if [ ! -f ./data/.seed_done ]; then
  echo "▶ Ejecutando seed inicial..."
  dotenv -e .env -- npx tsx --tsconfig tsconfig.json prisma/seed.ts
  touch ./data/.seed_done
  echo "▶ Seed completado."
fi

echo "▶ Iniciando Next.js..."
exec node server.js
