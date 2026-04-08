/**
 * Botón de guardado para formularios del panel admin.
 * Muestra "Guardando..." y se deshabilita mientras `saving` es `true`.
 *
 * @param saving  - `true` mientras la operación de guardado está en curso.
 * @param onClick - Callback que se ejecuta al hacer clic.
 * @param label   - Texto del botón. Por defecto: "Guardar cambios".
 */
export function SaveButton({
  saving,
  onClick,
  label = "Guardar cambios",
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="bg-[hsl(20,60%,45%)] text-white px-6 py-2.5 text-sm font-bold tracking-wider rounded hover:bg-[hsl(20,60%,38%)] transition-colors disabled:opacity-50"
    >
      {saving ? "Guardando..." : label}
    </button>
  );
}
