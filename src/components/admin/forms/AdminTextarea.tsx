/**
 * Textarea estilizado para formularios del panel admin.
 * Recibe un string y llama `onChange` con el nuevo valor (no el evento).
 *
 * @param value       - Valor controlado del textarea.
 * @param onChange    - Callback que recibe el nuevo valor como string.
 * @param placeholder - Placeholder del textarea.
 * @param rows        - Número de filas visibles. Por defecto: 3.
 */
export function AdminTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] focus:border-transparent resize-y"
    />
  );
}
