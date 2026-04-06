/**
 * Validates required environment variables at module load time.
 * If a required variable is missing, the app crashes with a clear message
 * instead of a cryptic error deep in a DB call.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[env] Variable de entorno requerida faltante: ${key}\n` +
        `Asegúrate de que esté definida en tu .env o en los secrets del servidor.`
    );
  }
  return value;
}

export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("NEXTAUTH_SECRET"),
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@comercializadorarivera.com",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
