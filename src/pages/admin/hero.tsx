import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useAdminAuth,
  PageHeader,
  FormCard,
  Field,
  AdminInput,
  AdminTextarea,
  SaveButton,
  useToast,
} from "@/components/admin/adminUtils";
import type { IHeroContent } from "@/interfaces";

const DEFAULTS: IHeroContent = {
  subtitle: "Soluciones integrales en acabados",
  titleLine1: "SUPERFICIES",
  titleLine2: "SIN LÍMITE",
  description:
    "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.",
  imageUrl: "/images/5ab8b3a15_generated_f21e3e55.png",
};

export default function AdminHeroPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<IHeroContent>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/hero")
      .then((r) => r.json())
      .then((d: IHeroContent | null) => {
        if (d) setData(d);
      });
  }, []);

  const set = (key: keyof IHeroContent) => (v: string) =>
    setData((prev) => ({ ...prev, [key]: v }));

  async function save() {
    setSaving(true);
    await fetch("/api/content/hero", {
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
      <Head><title>Hero — Admin Rivera</title></Head>
      <AdminLayout>
        <PageHeader title="Sección Hero" subtitle="La primera sección visible en el sitio" />
        <FormCard>
          <Field label="Subtítulo (texto pequeño sobre el título)">
            <AdminInput value={data.subtitle} onChange={set("subtitle")} />
          </Field>
          <Field label="Título — Línea 1">
            <AdminInput value={data.titleLine1} onChange={set("titleLine1")} />
          </Field>
          <Field label="Título — Línea 2 (texto en color cobre)">
            <AdminInput value={data.titleLine2} onChange={set("titleLine2")} />
          </Field>
          <Field label="Descripción">
            <AdminTextarea value={data.description} onChange={set("description")} />
          </Field>
          <Field label="URL de la imagen de fondo" hint="Ej: /uploads/mi-imagen.jpg — sube la imagen en la sección Medios primero">
            <AdminInput value={data.imageUrl} onChange={set("imageUrl")} />
          </Field>
          <SaveButton saving={saving} onClick={save} />
        </FormCard>
      </AdminLayout>
      {ToastComponent}
    </>
  );
}
