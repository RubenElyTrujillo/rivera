import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, Images } from "lucide-react";
import type { ISpaceProject, ISpaceProjectImage } from "@/domain/types";

const CATEGORIES = ["Residencial", "Comercial", "Exterior"];

const DEFAULT_SPACES: ISpaceProject[] = [
  { id: 1, title: "Pisos de Ingeniería", category: "Residencial", imageUrl: "/images/7219abb30_generated_c7c0b4a0.png", description: "", order: 0 },
  { id: 2, title: "Deck Exterior", category: "Exterior", imageUrl: "/images/fc7bd1af6_generated_345964df.png", description: "", order: 1 },
  { id: 3, title: "Restauración", category: "Comercial", imageUrl: "/images/6a78b550c_generated_281d3b94.png", description: "", order: 2 },
  { id: 4, title: "Persianas y Cortinas", category: "Residencial", imageUrl: "/images/0ebc9e79a_generated_56d5f617.png", description: "", order: 3 },
];

export default function AdminSpacesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [spaces, setSpaces] = useState<ISpaceProject[]>(DEFAULT_SPACES);
  const [saving, setSaving] = useState(false);
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/content/spaces")
      .then((r) => r.json())
      .then((d: ISpaceProject[] | null) => {
        if (d && d.length > 0) setSpaces(d);
      });
  }, []);

  /** Actualiza un campo escalar de un proyecto. */
  const updateField = (idx: number, key: keyof ISpaceProject, value: string) =>
    setSpaces((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));

  /** Elimina un proyecto de la lista. */
  const remove = (idx: number) => setSpaces((prev) => prev.filter((_, i) => i !== idx));

  /** Añade un proyecto vacío. */
  const add = () =>
    setSpaces((prev) => [
      ...prev,
      { id: Date.now(), title: "", category: "Residencial", imageUrl: "", description: "", order: prev.length, images: [] },
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
      title: s.title,
      category: s.category,
      imageUrl: s.imageUrl,
      description: s.description ?? "",
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
      <PageHeader title="Galería de Espacios" subtitle="Proyectos mostrados en la sección de galería filtrable" />
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

            {/* Título + Categoría */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Título">
                <AdminInput value={space.title} onChange={(v) => updateField(idx, "title", v)} />
              </Field>
              <Field label="Categoría">
                <select
                  value={space.category}
                  onChange={(e) => updateField(idx, "category", e.target.value)}
                  className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
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

