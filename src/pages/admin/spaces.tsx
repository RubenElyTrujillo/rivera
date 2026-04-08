import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { Trash2, Plus, Upload } from "lucide-react";
import type { ISpaceProject } from "@/domain/types";

const CATEGORIES = ["Residencial", "Comercial", "Exterior"];

const DEFAULT_SPACES: ISpaceProject[] = [
  { id: 1, title: "Pisos de Ingeniería", category: "Residencial", imageUrl: "/images/7219abb30_generated_c7c0b4a0.png", order: 0 },
  { id: 2, title: "Deck Exterior", category: "Exterior", imageUrl: "/images/fc7bd1af6_generated_345964df.png", order: 1 },
  { id: 3, title: "Restauración", category: "Comercial", imageUrl: "/images/6a78b550c_generated_281d3b94.png", order: 2 },
  { id: 4, title: "Persianas y Cortinas", category: "Residencial", imageUrl: "/images/0ebc9e79a_generated_56d5f617.png", order: 3 },
];

export default function AdminSpacesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [spaces, setSpaces] = useState<ISpaceProject[]>(DEFAULT_SPACES);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    fetch("/api/content/spaces")
      .then((r) => r.json())
      .then((d: ISpaceProject[] | null) => {
        if (d && d.length > 0) setSpaces(d);
      });
  }, []);

  const update = (idx: number, key: keyof ISpaceProject, value: string) =>
    setSpaces((prev) => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));

  const remove = (idx: number) => setSpaces((prev) => prev.filter((_, i) => i !== idx));

  const add = () =>
    setSpaces((prev) => [...prev, { id: Date.now(), title: "", category: "Residencial", imageUrl: "", order: prev.length }]);

  async function handleUpload(idx: number, file: File) {
    setUploading(idx);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/media/upload", { method: "POST", body: form });
    const data = await res.json() as { url?: string };
    if (data.url) update(idx, "imageUrl", data.url);
    setUploading(null);
  }

  async function save() {
    setSaving(true);
    const payload = spaces.map((s, i) => ({ ...s, order: i }));
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                  Proyecto {idx + 1}
                </span>
                <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Título">
                  <AdminInput value={space.title} onChange={(v) => update(idx, "title", v)} />
                </Field>
                <Field label="Categoría">
                  <select
                    value={space.category}
                    onChange={(e) => update(idx, "category", e.target.value)}
                    className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Imagen">
                <div className="flex gap-2">
                  <AdminInput
                    value={space.imageUrl}
                    onChange={(v) => update(idx, "imageUrl", v)}
                    placeholder="/uploads/imagen.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[idx]?.click()}
                    className="shrink-0 border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-xs font-semibold hover:border-[hsl(20,60%,45%)] transition-colors flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    {uploading === idx ? "Subiendo..." : "Subir"}
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileRefs.current[idx] = el; }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(idx, f);
                    }}
                  />
                </div>
                {space.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={space.imageUrl} alt="" className="mt-2 h-24 w-full object-cover rounded border border-[hsl(0,0%,88%)]" />
                )}
              </Field>
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
