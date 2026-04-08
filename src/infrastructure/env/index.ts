/**
 * Valida las variables de entorno requeridas en tiempo de carga del módulo.
 * Si alguna falta, el proceso arroja un error claro en lugar de un fallo
 * críptico dentro de una llamada a la base de datos.
 *
 * @param key - Nombre de la variable de entorno.
 * @returns El valor de la variable.
 * @throws Error si la variable no está definida.
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

/**
 * Variables de entorno validadas y tipadas.
 * Importa desde aquí en lugar de usar `process.env` directamente.
 *
 * @example
 *   import { env } from "@/infrastructure/env";
 *   const url = env.databaseUrl;
 */
export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret:   requireEnv("NEXTAUTH_SECRET"),
  adminEmail:  process.env.ADMIN_EMAIL ?? "admin@comercializadorarivera.com",
  nodeEnv:     process.env.NODE_ENV ?? "development",
} as const;
