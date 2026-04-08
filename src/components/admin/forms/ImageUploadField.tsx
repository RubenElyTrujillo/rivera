import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface ImageUploadFieldProps {
  /** Etiqueta visible sobre el campo. */
  label?: string;
  /** URL actual de la imagen. */
  value: string;
  /** Callback que recibe la nueva URL cuando se sube una imagen. */
  onChange: (url: string) => void;
  /** Texto placeholder del input de URL manual. */
  placeholder?: string;
  /** Relación de aspecto para el preview: "square" | "landscape" | "portrait". @default "landscape" */
  aspect?: "square" | "landscape" | "portrait";
}

const ASPECT_CLASS: Record<NonNullable<ImageUploadFieldProps["aspect"]>, string> = {
  square:    "aspect-square",
  landscape: "aspect-video",
  portrait:  "aspect-[3/4]",
};

/**
 * Campo de imagen reutilizable para el panel admin.
 *
 * Combina un input de URL manual con un botón de subida.
 * Al seleccionar un archivo, lo envía a `/api/media/upload` (que lo convierte a WebP)
 * y actualiza la URL automáticamente.
 *
 * @param props - Ver {@link ImageUploadFieldProps}.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  placeholder = "https://...",
  aspect = "landscape",
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  /** Sube el archivo seleccionado y actualiza el campo con la URL resultante. */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/media/upload", { method: "POST", body: form });
    if (!res.ok) {
      alert("Error al subir la imagen. Intenta de nuevo.");
      return;
    }
    const data = await res.json() as { url: string };
    onChange(data.url);

    // Reset input so the same file can be re-seleccionado si es necesario.
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {/* URL manual + botón upload */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          <Upload size={14} />
          Subir
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Quitar imagen"
          >
            <X size={14} />
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Preview */}
      {value && (
        <div className={`relative w-full max-w-xs overflow-hidden rounded border border-gray-200 bg-gray-50 ${ASPECT_CLASS[aspect]}`}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized={value.startsWith("http")}
          />
        </div>
      )}
    </div>
  );
}
