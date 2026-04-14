import Head from "next/head";
import { useState, useEffect } from "react";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import type { IMaterial, IMaterialCollection } from "@/domain/types";

export default function AdminCollectionsPage() {
  const { checking } = useAdminAuth();
  const { show: toast, ToastComponent } = useToast();

  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [collections, setCollections] = useState<IMaterialCollection[]>([]);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [editing, setEditing] = useState<Record<number, Partial<IMaterialCollection>>>({});
  const [newCol, setNewCol] = useState({ name: "", desc: "", coverImage: "", order: 0 });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/content/materials")
      .then((r) => r.json())
      .then(setMaterials)
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (!selectedMaterialId) return;
    fetch(`/api/content/collections?materialId=${selectedMaterialId}`)
      .then((r) => r.json())
      .then(setCollections)
      .catch(() => null);
  }, [selectedMaterialId]);

  async function saveCollection(col: IMaterialCollection) {
    const patch = editing[col.id];
    if (!patch || !Object.keys(patch).length) return;
    setSaving((p) => ({ ...p, [col.id]: true }));
    try {
      const res = await fetch(`/api/content/collections?id=${col.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) { toast("Error al guardar colección"); return; }
      setCollections((prev) => prev.map((c) => c.id === col.id ? { ...c, ...patch } : c));
      setEditing((p) => { const n = { ...p }; delete n[col.id]; return n; });
      toast("Colección guardada");
    } catch { toast("Error de conexión"); }
    finally { setSaving((p) => ({ ...p, [col.id]: false })); }
  }

  async function deleteCollection(id: number) {
    if (!confirm("¿Eliminar esta colección? Se eliminarán también sus acabados.")) return;
    try {
      const res = await fetch(`/api/content/collections?id=${id}`, { method: "DELETE" });
      if (!res.ok) { toast("Error al eliminar colección"); return; }
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast("Colección eliminada");
    } catch { toast("Error de conexión"); }
  }

  async function addCollection() {
    if (!selectedMaterialId || !newCol.name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/content/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCol, materialId: selectedMaterialId }),
      });
      if (!res.ok) { toast("Error al crear colección"); return; }
      const created = await res.json();
      setCollections((prev) => [...prev, created]);
      setNewCol({ name: "", desc: "", coverImage: "", order: 0 });
      toast("Colección creada");
    } catch { toast("Error de conexión"); }
    finally { setAdding(false); }
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Colecciones — Admin Rivera</title></Head>
      <PageHeader title="Colecciones" subtitle="Subcategorías por material (Splash, Clásico, Select…)" />

      <FormCard>
        <h2 className="text-base font-semibold">Selecciona un material</h2>
        <Field label="Material">
          <select
            className="w-full border border-input rounded px-3 py-2 text-sm bg-background"
            value={selectedMaterialId ?? ""}
            onChange={(e) => setSelectedMaterialId(Number(e.target.value) || null)}
          >
            <option value="">— Elige un material —</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </Field>
      </FormCard>

      {selectedMaterialId && (
        <>
          {collections.length === 0 && (
            <p className="text-sm text-muted-foreground px-4 py-2">Sin colecciones para este material.</p>
          )}

          {collections.map((col) => (
            <FormCard key={col.id}>
              <h2 className="text-base font-semibold">{col.name}</h2>
              <Field label="Nombre">
                <AdminInput
                  value={editing[col.id]?.name ?? col.name}
                  onChange={(v: string) => setEditing((p) => ({ ...p, [col.id]: { ...p[col.id], name: v } }))}
                />
              </Field>
              <Field label="Descripción">
                <AdminTextarea
                  value={editing[col.id]?.desc ?? col.desc ?? ""}
                  onChange={(v: string) => setEditing((p) => ({ ...p, [col.id]: { ...p[col.id], desc: v } }))}
                />
              </Field>
              <Field label="Imagen de portada">
                <ImageUploadField
                  value={editing[col.id]?.coverImage ?? col.coverImage ?? ""}
                  onChange={(v: string) => setEditing((p) => ({ ...p, [col.id]: { ...p[col.id], coverImage: v } }))}
                />
              </Field>
              <Field label="Orden">
                <AdminInput
                  value={String(editing[col.id]?.order ?? col.order ?? 0)}
                  onChange={(v: string) => setEditing((p) => ({ ...p, [col.id]: { ...p[col.id], order: Number(v) } }))}
                />
              </Field>
              <div className="flex gap-3 mt-2">
                <SaveButton onClick={() => saveCollection(col)} saving={!!saving[col.id]} />
                <button
                  onClick={() => deleteCollection(col.id)}
                  className="px-4 py-2 text-sm text-destructive border border-destructive rounded hover:bg-destructive hover:text-white transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </FormCard>
          ))}

          <FormCard>
            <h2 className="text-base font-semibold">+ Agregar colección</h2>
            <Field label="Nombre *">
              <AdminInput value={newCol.name} onChange={(v) => setNewCol((p) => ({ ...p, name: v }))} />
            </Field>
            <Field label="Descripción">
              <AdminTextarea value={newCol.desc} onChange={(v) => setNewCol((p) => ({ ...p, desc: v }))} />
            </Field>
            <Field label="Imagen de portada">
              <ImageUploadField
                value={newCol.coverImage}
                onChange={(v) => setNewCol((p) => ({ ...p, coverImage: v }))}
              />
            </Field>
            <Field label="Orden">
              <AdminInput value={String(newCol.order)} onChange={(v) => setNewCol((p) => ({ ...p, order: Number(v) }))} />
            </Field>
            <SaveButton onClick={addCollection} saving={adding} label="Agregar colección" />
          </FormCard>
        </>
      )}
      {ToastComponent}
    </>
  );
}
