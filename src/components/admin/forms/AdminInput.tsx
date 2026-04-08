/**
 * Input de texto estilizado para formularios del panel admin.
 * Recibe un string y llama `onChange` con el nuevo valor (no el evento),
 * simplificando el manejo de estado en los formularios.
 *
 * @param value       - Valor controlado del input.
 * @param onChange    - Callback que recibe el nuevo valor como string.
 * @param placeholder - Placeholder del input.
 * @param type        - Tipo HTML del input. Por defecto: "text".
 */
export function AdminInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] focus:border-transparent"
    />
  );
}
