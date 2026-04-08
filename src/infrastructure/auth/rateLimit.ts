/** Entrada del mapa de intentos fallidos por IP. */
interface RateLimitEntry {
  count: number;
  /** Timestamp (ms) en que se resetea la ventana. */
  resetAt: number;
}

/** Mapa in-memory de intentos fallidos. Se resetea al reiniciar el servidor. */
const loginAttempts = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Verifica si una IP puede intentar hacer login.
 * Permite hasta `RATE_LIMIT_MAX` intentos en una ventana de 15 minutos.
 *
 * @param ip - Dirección IP del cliente.
 * @returns `true` si el intento está permitido, `false` si se excedió el límite.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || entry.resetAt < now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

/**
 * Elimina el registro de intentos fallidos para una IP (al hacer login exitoso).
 *
 * @param ip - Dirección IP del cliente.
 */
export function clearRateLimit(ip: string): void {
  loginAttempts.delete(ip);
}
