import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import type { IMaterial, IMaterialFinish } from "@/domain/types";

const EMPTY_MAT: IMaterial = { id: 0, slug: '', name: "", subtitle: "", desc: "", spec: "", coverImage: "", collections: [], order: 0, finishes: [], categoryId: null };
const EMPTY_FINISH = { name: "", code: "", collection: "", image: "", dims: "" };

/** Estado de un acabado siendo editado inline. */
type FinishEditState = Omit<IMaterialFinish, "id" | "materialId" | "order">;

export default function AdminMaterialsPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedFinishes, setExpandedFinishes] = useState<Record<number, boolean>>({});
  const [newFinish, setNewFinish] = useState<Record<number, typeof EMPTY_FINISH>>({});
  const [finishSaving, setFinishSaving] = useState<Record<number, boolean>>({});
  /** ID del acabado actualmente en modo edición. */
  const [editingFinish, setEditingFinish] = useState<Record<number, FinishEditState | null>>({});

  useEffect(() => {
    fetch("/api/content/materials")
      .then((r) => r.json())
      .then((d: IMaterial[]) => { if (d?.length) setMaterials(d); });
  }, []);

  const update = (idx: number, key: keyof IMaterial, value: string | string[]) =>
    setMaterials((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));

  const remove = (idx: number) => setMaterials((prev) => prev.filter((_, i) => i !== idx));

  const add = () => setMaterials((prev) => [...prev, { ...EMPTY_MAT, id: Date.now(), order: prev.length }]);

  async function save() {
    setSaving(true);
    const payload = materials.map((m, i) => ({ ...m, order: i }));
    await fetch("/api/content/materials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const updated: IMaterial[] = await fetch("/api/content/materials").then((r) => r.json());
    if (updated?.length) setMaterials(updated);
    setSaving(false);
    show("¡Guardado!");
  }

  function toggleFinishes(matId: number) {
    setExpandedFinishes((prev) => ({ ...prev, [matId]: !prev[matId] }));
    if (!newFinish[matId]) setNewFinish((prev) => ({ ...prev, [matId]: { ...EMPTY_FINISH } }));
  }

  function updateNewFinish(matId: number, key: keyof typeof EMPTY_FINISH, value: string) {
    setNewFinish((prev) => ({ ...prev, [matId]: { ...prev[matId], [key]: value } }));
  }

  async function addFinish(matId: number) {
    const f = newFinish[matId];
    if (!f?.name) return;
    setFinishSaving((prev) => ({ ...prev, [matId]: true }));
    const mat = materials.find((m) => m.id === matId);
    await fetch("/api/content/finishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId: matId, ...f, order: mat?.finishes?.length ?? 0 }),
    });
    const finishes: IMaterialFinish[] = await fetch(`/api/content/finishes?materialId=${matId}`).then((r) => r.json());
    setMaterials((prev) => prev.map((m) => m.id === matId ? { ...m, finishes } : m));
    setNewFinish((prev) => ({ ...prev, [matId]: { ...EMPTY_FINISH } }));
    setFinishSaving((prev) => ({ ...prev, [matId]: false }));
    show("Acabado agregado");
  }

  async function deleteFinish(matId: number, finishId: number) {
    if (!confirm("¿Eliminar este acabado?")) return;
    await fetch(`/api/content/finishes?id=${finishId}`, { method: "DELETE" });
    setMaterials((prev) => prev.map((m) =>
      m.id === matId ? { ...m, finishes: m.finishes.filter((f) => f.id !== finishId) } : m
    ));
    show("Acabado eliminado");
  }

  /** Abre el modo edición de un acabado cargando sus valores actuales. */
  function startEdit(finish: IMaterialFinish) {
    setEditingFinish((prev) => ({
      ...prev,
      [finish.id]: {
        name: finish.name,
        slug: finish.slug,
        code: finish.code,
        collection: finish.collection,
        image: finish.image,
        dims: finish.dims,
        desc: finish.desc,
        hoverImage: finish.hoverImage,
        pdfUrl: finish.pdfUrl,
        thickness: finish.thickness,
        useClass: finish.useClass,
        waterRes: finish.waterRes,
        installType: finish.installType,
        warranty: finish.warranty,
        collectionId: finish.collectionId,
      },
    }));
  }

  /** Cancela el modo edición sin guardar. */
  function cancelEdit(finishId: number) {
    setEditingFinish((prev) => ({ ...prev, [finishId]: null }));
  }

  /** Actualiza un campo del acabado en modo edición. */
  function updateEdit(finishId: number, key: keyof FinishEditState, value: string) {
    setEditingFinish((prev) => ({
      ...prev,
      [finishId]: prev[finishId] ? { ...prev[finishId]!, [key]: value } : null,
    }));
  }

  /** Guarda los cambios del acabado en edición vía PUT a la API. */
  async function saveEdit(matId: number, finish: IMaterialFinish) {
    const edits = editingFinish[finish.id];
    if (!edits) return;
    setFinishSaving((prev) => ({ ...prev, [finish.id]: true }));
    await fetch(`/api/content/finishes?id=${finish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...edits, order: finish.order, materialId: matId }),
    });
    const finishes: IMaterialFinish[] = await fetch(`/api/content/finishes?materialId=${matId}`).then((r) => r.json());
    setMaterials((prev) => prev.map((m) => m.id === matId ? { ...m, finishes } : m));
    setEditingFinish((prev) => ({ ...prev, [finish.id]: null }));
    setFinishSaving((prev) => ({ ...prev, [finish.id]: false }));
    show("Acabado actualizado");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Materiales — Admin Rivera</title></Head>
      <PageHeader title="Materiales" subtitle="Tipos de pisos y recubrimientos. Agrega y edita los acabados de cada material." />
      <div className="space-y-4">
        {materials.map((mat, idx) => (
          <FormCard key={mat.id}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                Material {idx + 1}
              </span>
              <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre">
                <AdminInput value={mat.name} onChange={(v) => update(idx, "name", v)} />
              </Field>
              <Field label="Subtítulo">
                <AdminInput value={mat.subtitle} onChange={(v) => update(idx, "subtitle", v)} />
              </Field>
            </div>
            <Field label="Descripción">
              <AdminTextarea value={mat.desc} onChange={(v) => update(idx, "desc", v)} rows={2} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Especificación (ej: ABRASIÓN: AC3–AC4)">
                <AdminInput value={mat.spec} onChange={(v) => update(idx, "spec", v)} />
              </Field>
              <Field label="Imagen de portada" hint="Para la galería">
                <ImageUploadField
                  value={mat.coverImage ?? ""}
                  onChange={(v) => update(idx, "coverImage", v)}
                  aspect="landscape"
                />
              </Field>
            </div>
            <Field label="Colecciones (una por línea)" hint="Opcional">
              <textarea
                value={mat.collections.join("\n")}
                onChange={(e) => update(idx, "collections", e.target.value.split("\n").filter(Boolean))}
                rows={3}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] resize-none"
              />
            </Field>

            {/* ── Acabados ── */}
            {mat.id > 1000000 ? (
              <p className="text-xs text-[hsl(0,0%,50%)] mt-2">Guarda primero para poder agregar acabados.</p>
            ) : (
              <div className="mt-4 border-t border-[hsl(0,0%,90%)] pt-4">
                <button
                  onClick={() => toggleFinishes(mat.id)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)] transition-colors"
                >
                  {expandedFinishes[mat.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Acabados ({mat.finishes?.length ?? 0})
                </button>

                {expandedFinishes[mat.id] && (
                  <div className="mt-3 space-y-2">
                    {mat.finishes?.map((f) => {
                      const isEditing = !!editingFinish[f.id];
                      const edits = editingFinish[f.id];
                      return (
                        <div key={f.id} className={`rounded border ${isEditing ? "border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-4" : "border-[hsl(0,0%,90%)] bg-[hsl(0,0%,97%)] px-4 py-3"}`}>
                          {!isEditing ? (
                            /* ── Vista compacta ── */
                            <div className="flex items-center gap-3">
                              {f.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={f.image} alt={f.name} className="w-10 h-10 object-cover rounded shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">{f.name}</p>
                                <p className="text-[hsl(0,0%,50%)] font-mono text-xs">
                                  {f.code}{f.collection ? ` · ${f.collection}` : ""}{f.dims ? ` · ${f.dims}` : ""}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => startEdit(f)}
                                  title="Editar"
                                  className="p-1.5 rounded text-[hsl(0,0%,50%)] hover:text-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,45%)]/10 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => deleteFinish(mat.id, f.id)}
                                  title="Eliminar"
                                  className="p-1.5 rounded text-[hsl(0,0%,50%)] hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* ── Formulario de edición ── */
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] mb-3">
                                Editando: {f.name}
                              </p>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <Field label="Nombre *">
                                  <AdminInput
                                    value={edits?.name ?? ""}
                                    onChange={(v) => updateEdit(f.id, "name", v)}
                                  />
                                </Field>
                                <Field label="Código">
                                  <AdminInput
                                    value={edits?.code ?? ""}
                                    onChange={(v) => updateEdit(f.id, "code", v)}
                                  />
                                </Field>
                                <Field label="Colección">
                                  <AdminInput
                                    value={edits?.collection ?? ""}
                                    onChange={(v) => updateEdit(f.id, "collection", v)}
                                  />
                                </Field>
                                <Field label="Dimensiones">
                                  <AdminInput
                                    value={edits?.dims ?? ""}
                                    onChange={(v) => updateEdit(f.id, "dims", v)}
                                  />
                                </Field>
                              </div>
                              <Field label="Imagen del acabado">
                                <ImageUploadField
                                  value={edits?.image ?? ""}
                                  onChange={(v) => updateEdit(f.id, "image", v)}
                                  aspect="square"
                                />
                              </Field>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => saveEdit(mat.id, f)}
                                  disabled={finishSaving[f.id]}
                                  className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
                                >
                                  <Check size={13} />
                                  {finishSaving[f.id] ? "Guardando..." : "Guardar cambios"}
                                </button>
                                <button
                                  onClick={() => cancelEdit(f.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold border border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] px-4 py-2 rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
                                >
                                  <X size={13} /> Cancelar
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* ── Nuevo acabado ── */}
                    <div className="bg-[hsl(20,60%,45%)]/5 border border-[hsl(20,60%,45%)]/20 rounded p-4 mt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] mb-3">Nuevo acabado</p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Nombre *">
                          <AdminInput value={newFinish[mat.id]?.name ?? ""} onChange={(v) => updateNewFinish(mat.id, "name", v)} placeholder="Roble Natural" />
                        </Field>
                        <Field label="Código">
                          <AdminInput value={newFinish[mat.id]?.code ?? ""} onChange={(v) => updateNewFinish(mat.id, "code", v)} placeholder="MAD-001" />
                        </Field>
                        <Field label="Colección">
                          <AdminInput value={newFinish[mat.id]?.collection ?? ""} onChange={(v) => updateNewFinish(mat.id, "collection", v)} placeholder="Loft Life" />
                        </Field>
                        <Field label="Dimensiones">
                          <AdminInput value={newFinish[mat.id]?.dims ?? ""} onChange={(v) => updateNewFinish(mat.id, "dims", v)} placeholder="120×20cm" />
                        </Field>
                      </div>
                      <Field label="Imagen del acabado">
                        <ImageUploadField
                          value={newFinish[mat.id]?.image ?? ""}
                          onChange={(v) => updateNewFinish(mat.id, "image", v)}
                          aspect="square"
                        />
                      </Field>
                      <button
                        onClick={() => addFinish(mat.id)}
                        disabled={finishSaving[mat.id]}
                        className="mt-3 flex items-center gap-2 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} /> {finishSaving[mat.id] ? "Guardando..." : "Agregar acabado"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </FormCard>
        ))}
        <button onClick={add} className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)]">
          <Plus size={16} /> Agregar material
        </button>
        <SaveButton saving={saving} onClick={save} />
      </div>
      {ToastComponent}
    </>
  );
}
