#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
# Crear config temporal en /tmp para que Prisma no detecte el de /app
cat > /tmp/prisma.config.mjs << EOF
import { defineConfig } from 'prisma/config';
export default defineConfig({
  schema: '/app/prisma/schema.prisma',
  migrations: { path: '/app/prisma/migrations' },
  datasource: { url: '${DATABASE_URL}' },
});
EOF

prisma migrate deploy --config /tmp/prisma.config.mjs

echo "▶ Ejecutando seed inicial..."
cd /app && npx tsx --tsconfig tsconfig.json prisma/seed.ts

echo "▶ Iniciando Next.js..."
exec node /app/server.js
