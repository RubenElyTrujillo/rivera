import { useState, useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Hook que verifica si el usuario tiene una sesión de administrador activa.
 * Hace un fetch a `/api/auth/me` al montar el componente.
 *
 * - Si la verificación falla (401 o error de red), redirige a `/admin/login`.
 * - Mientras verifica, `checking` es `true`; el componente debe renderizar un skeleton.
 *
 * @returns `{ checking }` — `true` mientras la verificación está en curso.
 *
 * @example
 *   const { checking } = useAdminAuth();
 *   if (checking) return <AdminPageSkeleton />;
 */
export function useAdminAuth(): { checking: boolean } {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          void router.replace("/admin/login");
        } else {
          setChecking(false);
        }
      })
      .catch(() => void router.replace("/admin/login"));
  }, [router]);

  return { checking };
}
