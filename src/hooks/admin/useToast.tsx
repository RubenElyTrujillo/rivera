import { useState, useCallback } from "react";

/** Estado y controles devueltos por `useToast`. */
export interface UseToastReturn {
  /** Muestra un mensaje de toast por 3 segundos. */
  show: (message: string) => void;
  /** Componente React del toast. `null` cuando no hay mensaje activo. */
  ToastComponent: React.ReactNode;
}

/**
 * Hook para mostrar notificaciones toast en el panel admin.
 * El toast aparece en la esquina inferior derecha y desaparece tras 3 segundos.
 *
 * @returns Objeto con `show` para activar el toast y `ToastComponent` para renderizar.
 *
 * @example
 *   const { show, ToastComponent } = useToast();
 *   // En el handler de guardado:
 *   show("¡Guardado!");
 *   // En el JSX:
 *   return <>{content}{ToastComponent}</>;
 */
export function useToast(): UseToastReturn {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const ToastComponent = message ? (
    <div className="fixed bottom-6 right-6 bg-[hsl(0,0%,13%)] text-white px-5 py-3 rounded shadow-lg text-sm font-medium z-50">
      {message}
    </div>
  ) : null;

  return { show, ToastComponent };
}
