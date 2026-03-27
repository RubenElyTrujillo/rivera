import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useAdminAuth, PageHeader, useToast,
} from "@/components/admin/adminUtils";
import { Trash2, Upload, FileText } from "lucide-react";
import type { IMedia } from "@/interfaces";

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function fetchMediaList(): Promise<IMedia[]> {
  const res = await fetch("/api/media");
  return res.json() as Promise<IMedia[]>;
}

export default function AdminMediaPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [media, setMedia] = useState<IMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMediaList().then(setMedia).catch(console.error);
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      await fetch("/api/media/upload", { method: "POST", body: form });
    }
    setMedia(await fetchMediaList());
    setUploading(false);
    show("Archivo(s) subido(s)");
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/media?id=${id}`, { method: "DELETE" });
    setMedia((prev) => prev.filter((m) => m.id !== id));
    show("Eliminado");
  }

  function copyUrl(id: number, url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (checking) return null;

  return (
    <>
      <Head><title>Medios — Admin Rivera</title></Head>
      <AdminLayout>
        <PageHeader
          title="Gestión de Medios"
          subtitle="Sube imágenes y PDFs para usar en las secciones del sitio"
        />

        {/* Upload zone */}
        <div
          className="border-2 border-dashed border-[hsl(0,0%,80%)] rounded-lg p-8 text-center cursor-pointer hover:border-[hsl(20,60%,45%)] transition-colors bg-white mb-6"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleUpload(e.dataTransfer.files);
          }}
        >
          <Upload size={24} className="mx-auto mb-2 text-[hsl(0,0%,55%)]" />
          <p className="text-sm font-medium text-[hsl(0,0%,40%)]">
            {uploading ? "Subiendo..." : "Haz clic o arrastra archivos aquí"}
          </p>
          <p className="text-xs text-[hsl(0,0%,60%)] mt-1">Imágenes y PDFs · Máx. 20 MB</p>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            ref={fileRef}
            onChange={(e) => void handleUpload(e.target.files)}
          />
        </div>

        {/* Grid de archivos */}
        {media.length === 0 ? (
          <p className="text-center text-sm text-[hsl(0,0%,55%)] py-12">No hay archivos subidos aún</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {media.map((item) => (
              <div key={item.id} className="bg-white border border-[hsl(0,0%,88%)] rounded-lg overflow-hidden group">
                {/* Preview */}
                <div className="aspect-square bg-[hsl(0,0%,95%)] flex items-center justify-center relative">
                  {item.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={32} className="text-[hsl(0,0%,60%)]" />
                  )}
                  <button
                    onClick={() => void handleDelete(item.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-[hsl(0,0%,30%)] truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="text-xs text-[hsl(0,0%,60%)]">{formatBytes(item.size)}</p>
                  <button
                    onClick={() => copyUrl(item.id, item.url)}
                    className="mt-1 text-xs text-[hsl(20,60%,45%)] hover:underline font-medium"
                  >
                    {copied === item.id ? "¡Copiado!" : "Copiar URL"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
      {ToastComponent}
    </>
  );
}
