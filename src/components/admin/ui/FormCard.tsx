/**
 * Contenedor de sección de formulario en el panel admin.
 * Proporciona la tarjeta blanca con borde y espaciado consistente.
 */
export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-6 space-y-5">
      {children}
    </div>
  );
}
