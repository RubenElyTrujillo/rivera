/**
 * Contenedor de campo de formulario con label y hint opcional.
 * Aplica tipografía y espaciado consistente en todo el panel admin.
 *
 * @param label    - Texto del label mostrado sobre el campo.
 * @param children - El input, textarea o select del campo.
 * @param hint     - Texto de ayuda opcional mostrado debajo del campo.
 */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wider text-[hsl(0,0%,40%)] uppercase">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[hsl(0,0%,55%)]">{hint}</p>}
    </div>
  );
}
