import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus } from "lucide-react";
import type { ISpaceCategory } from "@/domain/types";

export default function AdminSpaceCategoriesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [categories, setCategories] = useState<ISpaceCategory[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/space-categories")
      .then((r) => r.json())
      .then((d: ISpaceCategory[] | null) => { if (d?.length) setCategories(d); });
  }, []);

  const update = (idx: number, key: keyof ISpaceCategory, value: string) =>
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));

  const remove = (idx: number) => setCategories((prev) => prev.filter((_, i) => i !== idx));

  const add = () =>
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), name: "", slug: "", coverImage: "", order: prev.length },
    ]);

  async function save() {
    setSaving(true);
    const payload = categories.map((c, i) => ({
      name:       c.name,
      coverImage: c.coverImage,
      order:      i,
    }));
    await fetch("/api/content/space-categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    // Recargar para obtener slugs generados
    const updated: ISpaceCategory[] = await fetch("/api/content/space-categories").then((r) => r.json());
    if (updated?.length) setCategories(updated);
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Categorías de Espacios — Admin Rivera</title></Head>
      <PageHeader
        title="Categorías de Espacios"
        subtitle='Las categorías se muestran en la sección "Nuestro trabajo" del home. Cada una enlaza a una galería de proyectos.'
      />
      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <FormCard key={cat.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                Categoría {idx + 1}
              </span>
              <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            <Field label="Nombre de la categoría">
              <AdminInput
                value={cat.name}
                onChange={(v) => update(idx, "name", v)}
                placeholder="Residencial"
              />
            </Field>

            {cat.slug && (
              <p className="text-xs text-[hsl(0,0%,50%)] -mt-2 mb-2">
                URL: <span className="font-mono">/espacios/{cat.slug}</span>
              </p>
            )}

            <Field label="Imagen de portada">
              <ImageUploadField
                value={cat.coverImage}
                onChange={(v) => update(idx, "coverImage", v)}
                aspect="landscape"
                placeholder="/uploads/categoria.webp"
              />
            </Field>
          </FormCard>
        ))}

        <button
          onClick={add}
          className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)]"
        >
          <Plus size={16} /> Agregar categoría
        </button>

        <SaveButton saving={saving} onClick={save} />
      </div>
      {ToastComponent}
    </>
  );
}
