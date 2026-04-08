import { db } from "@/infrastructure/db/client";

/** Datos de un usuario tal como se almacenan en la base de datos. */
export interface UserRecord {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

/**
 * Repositorio para los usuarios administradores.
 * Abstrae todas las operaciones de base de datos relacionadas con `User`.
 */
export const userRepository = {
  /**
   * Busca un usuario por email (sin distinción de mayúsculas/minúsculas en Postgres).
   *
   * @param email - Email del usuario.
   * @returns El usuario o `null` si no existe.
   */
  async findByEmail(email: string): Promise<UserRecord | null> {
    return db.user.findUnique({ where: { email } });
  },
};
