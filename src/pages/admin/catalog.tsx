import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import type { ICatalogContent } from "@/domain/types";

const DEFAULTS: ICatalogContent = {
  title:       "Catálogo completo",
  description: "Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.",
  pdfUrl:      "/CR%20CATALOGO.pdf",
  buttonText:  "DESCARGAR CATÁLOGO PDF",
};

export default function AdminCatalogPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<ICatalogContent>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/catalog")
      .then((r) => r.json())
      .then((d: ICatalogContent | null) => { if (d) setData(d); });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/content/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) { show("Error al guardar"); return; }
      show("¡Guardado!");
    } catch { show("Error de conexión"); }
    finally { setSaving(false); }
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Catálogo — Admin Rivera</title></Head>
      {ToastComponent}
      <PageHeader
        title="Catálogo PDF"
        subtitle="Texto descriptivo y enlace al archivo PDF descargable"
      />

      <FormCard>
        <Field label="Título de la sección">
          <AdminInput
            value={data.title}
            onChange={(v) => setData((p) => ({ ...p, title: v }))}
            placeholder="Catálogo completo"
          />
        </Field>

        <Field label="Descripción">
          <AdminTextarea
            value={data.description}
            onChange={(v) => setData((p) => ({ ...p, description: v }))}
            placeholder="Describe qué incluye el catálogo…"
            rows={4}
          />
        </Field>

        <Field label="URL del PDF" hint="Ruta relativa o URL completa al archivo PDF">
          <AdminInput
            value={data.pdfUrl}
            onChange={(v) => setData((p) => ({ ...p, pdfUrl: v }))}
            placeholder="/uploads/catalogo.pdf"
          />
        </Field>

        <Field label="Texto del botón de descarga">
          <AdminInput
            value={data.buttonText}
            onChange={(v) => setData((p) => ({ ...p, buttonText: v }))}
            placeholder="DESCARGAR CATÁLOGO PDF"
          />
        </Field>
      </FormCard>

      <div className="mt-6">
        <SaveButton onClick={save} saving={saving} />
      </div>
    </>
  );
}
