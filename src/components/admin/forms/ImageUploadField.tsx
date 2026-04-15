import React, { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Called when upload starts (true) or finishes (false) */
  onUploadingChange?: (uploading: boolean) => void;
  placeholder?: string;
  aspect?: "square" | "landscape" | "portrait";
}

const ASPECT_CLASS: Record<NonNullable<ImageUploadFieldProps["aspect"]>, string> = {
  square:    "aspect-square",
  landscape: "aspect-video",
  portrait:  "aspect-[3/4]",
};

export function ImageUploadField({
  label,
  value,
  onChange,
  onUploadingChange,
  placeholder = "https://...",
  aspect = "landscape",
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function setUploadState(v: boolean) {
    setUploading(v);
    onUploadingChange?.(v);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: form });
      if (!res.ok) {
        alert("Error al subir la imagen. Intenta de nuevo.");
        return;
      }
      const data = await res.json() as { url: string };
      onChange(data.url);
    } finally {
      setUploadState(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={uploading}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-700 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Subiendo…" : "Subir"}
        </button>
        {value && !uploading && (
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

      {/* Preview with loading overlay */}
      {(value || uploading) && (
        <div className={`relative w-full max-w-xs overflow-hidden rounded border border-gray-200 bg-gray-50 ${ASPECT_CLASS[aspect]}`}>
          {value && (
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized={value.startsWith("http")}
            />
          )}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80">
              <Loader2 size={24} className="animate-spin text-[hsl(20,60%,45%)]" />
              <span className="text-xs font-medium text-[hsl(0,0%,35%)]">Subiendo imagen…</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
