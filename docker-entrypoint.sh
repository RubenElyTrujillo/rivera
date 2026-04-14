#!/bin/sh
set -e

echo "▶ Aplicando migraciones..."
# Crear config temporal en /tmp para que Prisma no detecte el de /app
cat > /tmp/prisma.config.mjs << EOF
import { defineConfig } from '/usr/local/lib/node_modules/prisma/config.js';
export default defineConfig({
  schema: '/app/prisma/schema.prisma',
  migrations: { path: '/app/prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
EOF

prisma migrate deploy --config /tmp/prisma.config.mjs

# Seed runs on every start but is idempotent:
# - Admin user: only creates if not exists (password is never overwritten)
# - All other content: only seeds if tables are empty
echo "▶ Ejecutando seed (idempotente)..."
cd /app && npx tsx --tsconfig tsconfig.json prisma/seed.ts || echo "⚠ Seed tuvo advertencias, continuando..."

echo "▶ Iniciando Next.js..."
exec node /app/server.js
