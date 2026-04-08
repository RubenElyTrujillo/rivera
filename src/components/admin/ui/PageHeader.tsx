/**
 * Encabezado estándar de página del panel admin.
 * Muestra el título principal y un subtítulo descriptivo opcional.
 *
 * @param title    - Título principal de la página.
 * @param subtitle - Descripción breve opcional mostrada debajo del título.
 */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-[hsl(0,0%,13%)]">{title}</h1>
      {subtitle && <p className="text-sm text-[hsl(0,0%,50%)] mt-1">{subtitle}</p>}
    </div>
  );
}
