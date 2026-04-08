import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, Images } from "lucide-react";
import type { ISpaceProject, ISpaceProjectImage, ISpaceCategory } from "@/domain/types";

export default function AdminSpacesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [spaces, setSpaces] = useState<ISpaceProject[]>([]);
  const [categories, setCategories] = useState<ISpaceCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/content/spaces").then((r) => r.json()),
      fetch("/api/content/space-categories").then((r) => r.json()),
    ]).then(([spacesData, catsData]: [ISpaceProject[], ISpaceCategory[]]) => {
      if (spacesData?.length) setSpaces(spacesData);
      if (catsData?.length) setCategories(catsData);
    });
  }, []);

  /** Lista de nombres de categorías disponibles. */
  const categoryNames = categories.length > 0
    ? categories.map((c) => c.name)
    : ["Residencial", "Comercial", "Exterior"];

  /** Actualiza un campo escalar de un proyecto. */
  const updateField = (idx: number, key: keyof ISpaceProject, value: string) =>
    setSpaces((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));

  /** Elimina un proyecto de la lista. */
  const remove = (idx: number) => setSpaces((prev) => prev.filter((_, i) => i !== idx));

  /** Añade un proyecto vacío. */
  const add = () =>
    setSpaces((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        category: categoryNames[0] ?? "Residencial",
        imageUrl: "",
        description: "",
        completedAt: null,
        order: prev.length,
        images: [],
      },
    ]);

  /** Actualiza una imagen adicional de un proyecto. */
  const updateImage = (projectIdx: number, imgIdx: number, key: keyof ISpaceProjectImage, value: string) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== projectIdx) return s;
        const images = (s.images ?? []).map((img, j) =>
          j === imgIdx ? { ...img, [key]: value } : img
        );
        return { ...s, images };
      })
    );

  /** Añade una imagen adicional a un proyecto. */
  const addImage = (projectIdx: number) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== projectIdx) return s;
        const images = [...(s.images ?? []), { id: Date.now(), spaceProjectId: s.id, url: "", caption: "", order: (s.images?.length ?? 0) }];
        return { ...s, images };
      })
    );

  /** Elimina una imagen adicional de un proyecto. */
  const removeImage = (projectIdx: number, imgIdx: number) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== projectIdx) return s;
        return { ...s, images: (s.images ?? []).filter((_, j) => j !== imgIdx) };
      })
    );

  /** Guarda todos los proyectos via API. */
  async function save() {
    setSaving(true);
    const payload = spaces.map((s, i) => ({
      title:       s.title,
      category:    s.category,
      imageUrl:    s.imageUrl,
      description: s.description ?? "",
      completedAt: s.completedAt ?? null,
      order: i,
      images: (s.images ?? []).map((img, j) => ({
        url: img.url,
        caption: img.caption ?? "",
        order: j,
      })),
    }));
    await fetch("/api/content/spaces", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Espacios — Admin Rivera</title></Head>
      <PageHeader
        title="Proyectos de Espacios"
        subtitle="Cada proyecto pertenece a una categoría. Las categorías se gestionan en la sección Categorías."
      />
      {categories.length === 0 && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          No hay categorías creadas aún.{" "}
          <a href="/admin/space-categories" className="font-semibold underline">
            Crea categorías primero
          </a>{" "}
          para poder asignarlas a los proyectos.
        </div>
      )}
      <div className="space-y-4">
        {spaces.map((space, idx) => (
          <FormCard key={space.id}>
            {/* Encabezado del card */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                Proyecto {idx + 1}
              </span>
              <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Título + Categoría + Fecha */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Título del trabajo">
                <AdminInput value={space.title} onChange={(v) => updateField(idx, "title", v)} placeholder="Piso de madera en sala" />
              </Field>
              <Field label="Categoría">
                <select
                  value={space.category}
                  onChange={(e) => updateField(idx, "category", e.target.value)}
                  className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                >
                  {categoryNames.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Fecha de realización" hint="Opcional">
                <input
                  type="date"
                  value={space.completedAt ? space.completedAt.slice(0, 10) : ""}
                  onChange={(e) => updateField(idx, "completedAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                  className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                />
              </Field>
            </div>

            {/* Imagen de portada */}
            <Field label="Imagen de portada">
              <ImageUploadField
                value={space.imageUrl}
                onChange={(url) => updateField(idx, "imageUrl", url)}
                placeholder="/uploads/portada.webp"
                aspect="landscape"
              />
            </Field>

            {/* Descripción */}
            <Field label="Descripción del proyecto">
              <AdminTextarea
                value={space.description ?? ""}
                onChange={(v) => updateField(idx, "description", v)}
                placeholder="Breve descripción sobre el trabajo realizado, materiales usados, etc."
                rows={3}
              />
            </Field>

            {/* Imágenes adicionales */}
            <div className="mt-4 border-t border-[hsl(0,0%,90%)] pt-4">
              <button
                type="button"
                onClick={() => setExpandedImages((prev) => {
                  const next = new Set(prev);
                  next.has(idx) ? next.delete(idx) : next.add(idx);
                  return next;
                })}
                className="flex items-center gap-2 text-xs font-semibold text-[hsl(0,0%,40%)] hover:text-[hsl(20,60%,45%)] transition-colors"
              >
                <Images size={14} />
                Imágenes adicionales ({space.images?.length ?? 0})
                <span className="text-xs text-[hsl(0,0%,60%)]">{expandedImages.has(idx) ? "▲" : "▼"}</span>
              </button>

              {expandedImages.has(idx) && (
                <div className="mt-4 space-y-4">
                  {(space.images ?? []).map((img, imgIdx) => (
                    <div key={img.id} className="flex gap-3 p-3 bg-[hsl(0,0%,97%)] rounded">
                      <div className="flex-1 space-y-2">
                        <ImageUploadField
                          label={`Imagen ${imgIdx + 1}`}
                          value={img.url}
                          onChange={(url) => updateImage(idx, imgIdx, "url", url)}
                          aspect="square"
                        />
                        <AdminInput
                          value={img.caption}
                          onChange={(v) => updateImage(idx, imgIdx, "caption", v)}
                          placeholder="Descripción de la imagen (opcional)"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(idx, imgIdx)}
                        className="text-red-400 hover:text-red-600 mt-6"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addImage(idx)}
                    className="flex items-center gap-1 text-xs text-[hsl(20,60%,45%)] font-semibold hover:underline"
                  >
                    <Plus size={12} /> Agregar imagen
                  </button>
                </div>
              )}
            </div>
          </FormCard>
        ))}

        <button onClick={add} className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)]">
          <Plus size={16} /> Agregar proyecto
        </button>
        <SaveButton saving={saving} onClick={save} />
      </div>
      {ToastComponent}
    </>
  );
}

