import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import type { ISeoSettings } from "@/domain/types";

const DEFAULTS: ISeoSettings = {
  title: "Comercializadora Rivera | Pisos, Recubrimientos y Restauracion en CDMX",
  description: "Especialistas en pisos y acabados en CDMX: madera solida, madera de ingenieria, laminados, vinilicos SPC, deck sintetico, persianas, muros forrados, mantenimiento y restauracion profesional.",
  keywords: "pisos y recubrimientos, pisos de madera, madera de ingenieria, pisos laminados, pisos vinilicos spc, deck sintetico, lambrines, muros forrados, persianas y cortinas, mantenimiento de pisos, restauracion de pisos, pulido de madera, pulido de marmol y granito, molduras y acabados, instalacion de pisos en cdmx",
  ogImageUrl: "",
};

export default function AdminSeoPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<ISeoSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/seo")
      .then((r) => r.json())
      .then((d: ISeoSettings | null) => {
        if (d) setData(d);
      });
  }, []);

  const set = (key: keyof ISeoSettings) => (v: string) =>
    setData((prev) => ({ ...prev, [key]: v }));

  async function save() {
    setSaving(true);
    await fetch("/api/content/seo", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>SEO — Admin Rivera</title></Head>
        <PageHeader title="SEO" subtitle="Metadatos para buscadores y redes sociales" />
        <FormCard>
          <Field label="Título de la página" hint="Aparece en la pestaña del navegador y resultados de Google. Máx. 60 caracteres.">
            <AdminInput value={data.title} onChange={set("title")} />
            <p className="text-xs text-[hsl(0,0%,55%)] text-right">{data.title.length}/60</p>
          </Field>
          <Field label="Meta descripción" hint="Texto que aparece bajo el título en Google. Máx. 160 caracteres.">
            <AdminTextarea value={data.description} onChange={set("description")} rows={3} />
            <p className="text-xs text-[hsl(0,0%,55%)] text-right">{data.description.length}/160</p>
          </Field>
          <Field label="Palabras clave" hint="Separadas por comas">
            <AdminTextarea value={data.keywords} onChange={set("keywords")} rows={3} />
          </Field>
          <Field label="Imagen OG (Open Graph)" hint="URL de la imagen para compartir en redes sociales. Ej: /uploads/og-image.jpg">
            <AdminInput value={data.ogImageUrl} onChange={set("ogImageUrl")} />
          </Field>
          <SaveButton saving={saving} onClick={save} />
        </FormCard>
      {ToastComponent}
    </>
  );
}
