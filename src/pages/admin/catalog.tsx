import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
} from "@/components/admin/adminUtils";
import { Upload } from "lucide-react";
import type { ICatalogContent } from "@/interfaces";

const DEFAULTS: ICatalogContent = {
  title: "Catálogo completo",
  description: "Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.",
  pdfUrl: "/CR%20CATALOGO.pdf",
  buttonText: "DESCARGAR CATÁLOGO PDF",
};

export default function AdminCatalogPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<ICatalogContent>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/content/catalog")
      .then((r) => r.json())
      .then((d: ICatalogContent | null) => {
        if (d) setData(d);
      });
  }, []);

  const set = (key: keyof ICatalogContent) => (v: string) =>
    setData((prev) => ({ ...prev, [key]: v }));

  async function handleUpload(file: File) {
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: form });
    const d = await res.json() as { url?: string };
    if (d.url) setData((prev) => ({ ...prev, pdfUrl: d.url! }));
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/content/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return null;

  return (
    <>
      <Head><title>Catálogo — Admin Rivera</title></Head>
      <AdminLayout>
        <PageHeader title="Sección Catálogo" subtitle="Texto y PDF descargable" />
        <FormCard>
          <Field label="Título">
            <AdminInput value={data.title} onChange={set("title")} />
          </Field>
          <Field label="Descripción">
            <AdminTextarea value={data.description} onChange={set("description")} />
          </Field>
          <Field label="Texto del botón">
            <AdminInput value={data.buttonText} onChange={set("buttonText")} />
          </Field>
          <Field label="URL del PDF" hint="Sube el PDF con el botón o ingresa la URL manual">
            <div className="flex gap-2">
              <AdminInput value={data.pdfUrl} onChange={set("pdfUrl")} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="shrink-0 border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-xs font-semibold hover:border-[hsl(20,60%,45%)] transition-colors flex items-center gap-1.5"
              >
                <Upload size={14} />
                {uploading ? "Subiendo..." : "Subir PDF"}
              </button>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                }}
              />
            </div>
          </Field>
          <SaveButton saving={saving} onClick={save} />
        </FormCard>
      </AdminLayout>
      {ToastComponent}
    </>
  );
}
