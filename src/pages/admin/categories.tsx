import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus } from "lucide-react";
import type { ICategory } from "@/domain/types";

const EMPTY_CAT = { name: "", coverImage: "", icon: "", order: 0 };

export default function AdminCategoriesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [newCat, setNewCat] = useState({ ...EMPTY_CAT });

  useEffect(() => {
    fetch("/api/content/categories")
      .then((r) => r.json())
      .then((d: ICategory[]) => { if (d?.length) setCategories(d); });
  }, []);

  function update(idx: number, key: keyof typeof EMPTY_CAT, value: string | number) {
    setCategories((prev) => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  }

  async function saveOne(cat: ICategory) {
    setSavingId(cat.id);
    await fetch(`/api/content/categories?id=${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cat.name, coverImage: cat.coverImage, icon: cat.icon, order: cat.order }),
    });
    // Reload to get fresh slug after name change
    const updated: ICategory[] = await fetch("/api/content/categories").then((r) => r.json());
    if (updated?.length) setCategories(updated);
    setSavingId(null);
    show("¡Guardado!");
  }

  async function remove(cat: ICategory) {
    if (!confirm(`¿Eliminar "${cat.name}"?\n\nAtención: los materiales asignados a esta categoría quedarán sin categoría.`)) return;
    await fetch(`/api/content/categories?id=${cat.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    show("Categoría eliminada");
  }

  async function addCat() {
    if (!newCat.name) return;
    setAddSaving(true);
    const created: ICategory = await fetch("/api/content/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    }).then((r) => r.json());
    setCategories((prev) => [...prev, created]);
    setNewCat({ ...EMPTY_CAT, order: categories.length + 1 });
    setAddSaving(false);
    show("Categoría creada");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Categorías — Admin Rivera</title></Head>
      <PageHeader
        title="Categorías"
        subtitle="Categorías de producto (Pisos, Paredes, Ventanas…). Cada categoría genera su propia página en /categorias/[slug]."
      />
      <div className="space-y-4">
        {categories.map((cat, idx) => (
          <FormCard key={cat.id}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                {cat.slug ? `/categorias/${cat.slug}` : `Categoría ${idx + 1}`}
              </span>
              <button
                onClick={() => remove(cat)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre">
                <AdminInput
                  value={cat.name}
                  onChange={(v) => update(idx, "name", v)}
                  placeholder="Pisos"
                />
              </Field>
              <Field label="Ícono (emoji o texto corto)">
                <AdminInput
                  value={cat.icon}
                  onChange={(v) => update(idx, "icon", v)}
                  placeholder="🪵"
                />
              </Field>
              <Field label="Orden (número)">
                <AdminInput
                  value={String(cat.order)}
                  onChange={(v) => update(idx, "order", Number(v))}
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Imagen de portada">
              <ImageUploadField
                value={cat.coverImage}
                onChange={(v) => update(idx, "coverImage", v)}
                aspect="landscape"
                placeholder="/uploads/categorias/pisos.webp"
              />
            </Field>

            <SaveButton saving={savingId === cat.id} onClick={() => saveOne(cat)} />
          </FormCard>
        ))}

        {/* ── Nueva categoría ── */}
        <FormCard>
          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] mb-3">
            Nueva categoría
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput
                value={newCat.name}
                onChange={(v) => setNewCat((p) => ({ ...p, name: v }))}
                placeholder="Pisos"
              />
            </Field>
            <Field label="Ícono">
              <AdminInput
                value={newCat.icon}
                onChange={(v) => setNewCat((p) => ({ ...p, icon: v }))}
                placeholder="🪵"
              />
            </Field>
            <Field label="Orden">
              <AdminInput
                value={String(newCat.order)}
                onChange={(v) => setNewCat((p) => ({ ...p, order: Number(v) }))}
                placeholder="0"
              />
            </Field>
          </div>

          <Field label="Imagen de portada">
            <ImageUploadField
              value={newCat.coverImage}
              onChange={(v) => setNewCat((p) => ({ ...p, coverImage: v }))}
              aspect="landscape"
              placeholder="/uploads/categorias/nueva.webp"
            />
          </Field>

          <button
            onClick={addCat}
            disabled={addSaving || !newCat.name}
            className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear categoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  );
}
