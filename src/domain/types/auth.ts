/**
 * Payload decodificado del JWT de administrador.
 * Se incluye en cada request autenticado después de verificar la cookie.
 */
export interface JwtPayload {
  userId: number;
  email: string;
}
