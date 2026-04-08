/**
 * Skeleton de carga para páginas de formulario del admin.
 * Imita la estructura de PageHeader + FormCard con campos y botón.
 * Se muestra mientras se verifica la autenticación del usuario.
 */
export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-56 bg-[hsl(0,0%,88%)] rounded mb-2" />
        <div className="h-4 w-80 bg-[hsl(0,0%,92%)] rounded" />
      </div>
      <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-6 space-y-5">
        {[80, 64, 96, 72].map((w, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 rounded bg-[hsl(0,0%,88%)]" style={{ width: `${w}px` }} />
            <div className="h-9 rounded bg-[hsl(0,0%,93%)] w-full" />
          </div>
        ))}
        <div className="h-10 w-36 rounded bg-[hsl(0,0%,88%)]" />
      </div>
    </div>
  );
}

/**
 * Skeleton de carga para la página Dashboard del admin.
 * Imita el grid de tarjetas de secciones.
 * Se muestra mientras se verifica la autenticación del usuario.
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-64 bg-[hsl(0,0%,88%)] rounded mb-2" />
        <div className="h-4 w-96 bg-[hsl(0,0%,92%)] rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 space-y-2">
            <div className="h-5 w-5 rounded bg-[hsl(0,0%,88%)]" />
            <div className="h-4 w-28 rounded bg-[hsl(0,0%,88%)]" />
            <div className="h-3 w-40 rounded bg-[hsl(0,0%,92%)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
