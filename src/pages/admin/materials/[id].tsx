import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useAdminAuth, PageHeader, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import type { IMaterial, IMaterialFinish } from "@/domain/types";

const EMPTY_FINISH = {
  name: "", code: "", collection: "", image: "", dims: "",
  desc: "", hoverImage: "", pdfUrl: "", thickness: "", useClass: "",
  waterRes: false, installType: "", warranty: "", specMd: "",
};

type FinishEditState = Omit<IMaterialFinish, "id" | "materialId" | "order">;

export default function AdminMaterialDetailPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const router = useRouter();
  const id = Number(router.query.id);

  const [material, setMaterial] = useState<IMaterial | null>(null);
  const [saving, setSaving] = useState(false);
  const [newFinish, setNewFinish] = useState({ ...EMPTY_FINISH });
  const [finishSaving, setFinishSaving] = useState(false);
  const [editingFinish, setEditingFinish] = useState<(FinishEditState & { id: number }) | null>(null);
  const [editFinishSaving, setEditFinishSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("/api/content/materials")
      .then((r) => r.json())
      .then((list: IMaterial[]) => {
        const found = list.find((m) => m.id === id) ?? null;
        setMaterial(found);
      });
  }, [id]);

  function update<K extends keyof IMaterial>(key: K, value: IMaterial[K]) {
    setMaterial((prev) => prev ? { ...prev, [key]: value } : prev);
  }

  async function save() {
    if (!material) return;
    setSaving(true);
    const all: IMaterial[] = await fetch("/api/content/materials").then((r) => r.json());
    const payload = all.map((m) => (m.id === material.id ? material : m));
    await fetch("/api/content/materials", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  async function addFinish() {
    if (!material || !newFinish.name) return;
    setFinishSaving(true);
    await fetch("/api/content/finishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId: material.id, ...newFinish, order: material.finishes?.length ?? 0 }),
    });
    const finishes: IMaterialFinish[] = await fetch(`/api/content/finishes?materialId=${material.id}`).then((r) => r.json());
    setMaterial((prev) => prev ? { ...prev, finishes } : prev);
    setNewFinish({ ...EMPTY_FINISH });
    setFinishSaving(false);
    show("Acabado agregado");
  }

  async function deleteFinish(finishId: number) {
    if (!material || !confirm("¿Eliminar este acabado?")) return;
    await fetch(`/api/content/finishes?id=${finishId}`, { method: "DELETE" });
    setMaterial((prev) =>
      prev ? { ...prev, finishes: prev.finishes.filter((f) => f.id !== finishId) } : prev
    );
    show("Acabado eliminado");
  }

  function startEdit(finish: IMaterialFinish) {
    setEditingFinish({
      id: finish.id,
      name: finish.name,
      slug: finish.slug,
      code: finish.code,
      collection: finish.collection ?? "",
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
      specMd: finish.specMd,
      collectionId: finish.collectionId,
    });
  }

  async function saveEdit(finish: IMaterialFinish) {
    if (!material || !editingFinish) return;
    setEditFinishSaving(true);
    const { id: _id, ...edits } = editingFinish;
    await fetch(`/api/content/finishes?id=${finish.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...edits, order: finish.order, materialId: material.id }),
    });
    const finishes: IMaterialFinish[] = await fetch(`/api/content/finishes?materialId=${material.id}`).then((r) => r.json());
    setMaterial((prev) => prev ? { ...prev, finishes } : prev);
    setEditingFinish(null);
    setEditFinishSaving(false);
    show("Acabado actualizado");
  }

  if (checking || (!material && id)) return <AdminPageSkeleton />;
  if (!material) return (
    <>
      <Head><title>Material no encontrado — Admin Rivera</title></Head>
      <PageHeader title="Material no encontrado" subtitle="" />
      <Link href="/admin/materials" className="text-sm text-[hsl(20,60%,45%)] hover:underline">← Volver a materiales</Link>
    </>
  );

  return (
    <>
      <Head><title>{material.name || "Material"} — Admin Rivera</title></Head>
      <PageHeader title={material.name || "Material"} subtitle="Edita los datos y acabados de este material." />
      <Link href="/admin/materials" className="inline-block text-sm text-[hsl(20,60%,45%)] hover:underline mb-4">← Volver a materiales</Link>
      <div className="space-y-6">
        {/* ── Material fields ── */}
        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre">
              <AdminInput value={material.name} onChange={(v) => update("name", v)} />
            </Field>
            <Field label="Subtítulo">
              <AdminInput value={material.subtitle} onChange={(v) => update("subtitle", v)} />
            </Field>
          </div>
          <Field label="Descripción">
            <AdminTextarea value={material.desc} onChange={(v) => update("desc", v)} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Especificación">
              <AdminInput value={material.spec} onChange={(v) => update("spec", v)} placeholder="ABRASIÓN: AC3–AC4" />
            </Field>
            <Field label="Imagen de portada" hint="Para la galería">
              <ImageUploadField
                value={material.coverImage ?? ""}
                onChange={(v) => update("coverImage", v)}
                aspect="landscape"
              />
            </Field>
          </div>
          <Field label="Colecciones (una por línea)" hint="Opcional">
            <textarea
              value={material.collections.join("\n")}
              onChange={(e) => update("collections", e.target.value.split("\n").filter(Boolean))}
              rows={3}
              className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] resize-none"
            />
          </Field>
          <div className="mt-4">
            <SaveButton saving={saving} onClick={save} />
          </div>
        </div>

        {/* ── Finishes ── */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(0,0%,45%)] mb-3">
            Acabados ({material.finishes?.length ?? 0})
          </h2>
          <div className="space-y-2">
            {material.finishes?.map((f) => {
              const isEditing = editingFinish?.id === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded border ${isEditing ? "border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-4" : "border-[hsl(0,0%,90%)] bg-[hsl(0,0%,97%)] px-4 py-3"}`}
                >
                  {!isEditing ? (
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
                          onClick={() => deleteFinish(f.id)}
                          title="Eliminar"
                          className="p-1.5 rounded text-[hsl(0,0%,50%)] hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)] mb-3">
                        Editando: {f.name}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Nombre *">
                          <AdminInput
                            value={editingFinish?.name ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, name: v } : p)}
                          />
                        </Field>
                        <Field label="Código">
                          <AdminInput
                            value={editingFinish?.code ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, code: v } : p)}
                          />
                        </Field>
                        <Field label="Colección">
                          <AdminInput
                            value={editingFinish?.collection ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, collection: v } : p)}
                          />
                        </Field>
                        <Field label="Dimensiones">
                          <AdminInput
                            value={editingFinish?.dims ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, dims: v } : p)}
                          />
                        </Field>
                      </div>
                      <Field label="Descripción">
                        <AdminTextarea
                          value={editingFinish?.desc ?? ""}
                          onChange={(v) => setEditingFinish((p) => p ? { ...p, desc: v } : p)}
                          rows={3}
                        />
                      </Field>
                      <Field label="Ficha técnica (Markdown)">
                        <AdminTextarea
                          value={editingFinish?.specMd ?? ""}
                          onChange={(v) => setEditingFinish((p) => p ? { ...p, specMd: v } : p)}
                          rows={8}
                          placeholder={"## Especificaciones\n\n| Característica | Valor |\n|---|---|\n| Grosor | 8mm |"}
                        />
                      </Field>
                      <Field label="Imagen del acabado">
                        <ImageUploadField
                          value={editingFinish?.image ?? ""}
                          onChange={(v) => setEditingFinish((p) => p ? { ...p, image: v } : p)}
                          aspect="square"
                        />
                      </Field>
                      <Field label="Imagen hover (cómo se ve instalado)">
                        <ImageUploadField
                          value={editingFinish?.hoverImage ?? ""}
                          onChange={(v) => setEditingFinish((p) => p ? { ...p, hoverImage: v } : p)}
                          aspect="landscape"
                        />
                      </Field>
                      <Field label="PDF Ficha técnica (URL)">
                        <AdminInput
                          value={editingFinish?.pdfUrl ?? ""}
                          onChange={(v) => setEditingFinish((p) => p ? { ...p, pdfUrl: v } : p)}
                          placeholder="/uploads/ficha-tecnica.pdf"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <Field label="Grosor">
                          <AdminInput
                            value={editingFinish?.thickness ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, thickness: v } : p)}
                            placeholder="8mm"
                          />
                        </Field>
                        <Field label="Clase de uso">
                          <AdminInput
                            value={editingFinish?.useClass ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, useClass: v } : p)}
                            placeholder="AC3"
                          />
                        </Field>
                        <Field label="Tipo de instalación">
                          <AdminInput
                            value={editingFinish?.installType ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, installType: v } : p)}
                            placeholder="Flotante / Click"
                          />
                        </Field>
                        <Field label="Garantía">
                          <AdminInput
                            value={editingFinish?.warranty ?? ""}
                            onChange={(v) => setEditingFinish((p) => p ? { ...p, warranty: v } : p)}
                            placeholder="25 años"
                          />
                        </Field>
                      </div>
                      <Field label="Resistencia al agua">
                        <label className="flex items-center gap-2 mt-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingFinish?.waterRes ?? false}
                            onChange={(e) => setEditingFinish((p) => p ? { ...p, waterRes: e.target.checked } : p)}
                            className="w-4 h-4 accent-[hsl(20,60%,45%)]"
                          />
                          <span className="text-sm text-[hsl(0,0%,40%)]">
                            {editingFinish?.waterRes ? "Sí — resistente al agua" : "No"}
                          </span>
                        </label>
                      </Field>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => saveEdit(f)}
                          disabled={editFinishSaving}
                          className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
                        >
                          <Check size={13} />
                          {editFinishSaving ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                          onClick={() => setEditingFinish(null)}
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
                  <AdminInput value={newFinish.name} onChange={(v) => setNewFinish((p) => ({ ...p, name: v }))} placeholder="Roble Natural" />
                </Field>
                <Field label="Código">
                  <AdminInput value={newFinish.code} onChange={(v) => setNewFinish((p) => ({ ...p, code: v }))} placeholder="MAD-001" />
                </Field>
                <Field label="Colección">
                  <AdminInput value={newFinish.collection} onChange={(v) => setNewFinish((p) => ({ ...p, collection: v }))} placeholder="Loft Life" />
                </Field>
                <Field label="Dimensiones">
                  <AdminInput value={newFinish.dims} onChange={(v) => setNewFinish((p) => ({ ...p, dims: v }))} placeholder="120×20cm" />
                </Field>
              </div>
              <Field label="Descripción">
                <AdminTextarea
                  value={newFinish.desc}
                  onChange={(v) => setNewFinish((p) => ({ ...p, desc: v }))}
                  rows={3}
                />
              </Field>
              <Field label="Ficha técnica (Markdown)">
                <AdminTextarea
                  value={newFinish.specMd}
                  onChange={(v) => setNewFinish((p) => ({ ...p, specMd: v }))}
                  rows={8}
                  placeholder={"## Especificaciones\n\n| Característica | Valor |\n|---|---|\n| Grosor | 8mm |"}
                />
              </Field>
              <Field label="Imagen del acabado">
                <ImageUploadField
                  value={newFinish.image}
                  onChange={(v) => setNewFinish((p) => ({ ...p, image: v }))}
                  aspect="square"
                />
              </Field>
              <Field label="Imagen hover (cómo se ve instalado)">
                <ImageUploadField
                  value={newFinish.hoverImage}
                  onChange={(v) => setNewFinish((p) => ({ ...p, hoverImage: v }))}
                  aspect="landscape"
                />
              </Field>
              <Field label="PDF Ficha técnica (URL)">
                <AdminInput
                  value={newFinish.pdfUrl}
                  onChange={(v) => setNewFinish((p) => ({ ...p, pdfUrl: v }))}
                  placeholder="/uploads/ficha-tecnica.pdf"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Grosor">
                  <AdminInput value={newFinish.thickness} onChange={(v) => setNewFinish((p) => ({ ...p, thickness: v }))} placeholder="8mm" />
                </Field>
                <Field label="Clase de uso">
                  <AdminInput value={newFinish.useClass} onChange={(v) => setNewFinish((p) => ({ ...p, useClass: v }))} placeholder="AC3" />
                </Field>
                <Field label="Tipo de instalación">
                  <AdminInput value={newFinish.installType} onChange={(v) => setNewFinish((p) => ({ ...p, installType: v }))} placeholder="Flotante / Click" />
                </Field>
                <Field label="Garantía">
                  <AdminInput value={newFinish.warranty} onChange={(v) => setNewFinish((p) => ({ ...p, warranty: v }))} placeholder="25 años" />
                </Field>
              </div>
              <Field label="Resistencia al agua">
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFinish.waterRes}
                    onChange={(e) => setNewFinish((p) => ({ ...p, waterRes: e.target.checked }))}
                    className="w-4 h-4 accent-[hsl(20,60%,45%)]"
                  />
                  <span className="text-sm text-[hsl(0,0%,40%)]">
                    {newFinish.waterRes ? "Sí — resistente al agua" : "No"}
                  </span>
                </label>
              </Field>
              <button
                onClick={addFinish}
                disabled={finishSaving}
                className="mt-3 flex items-center gap-2 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
              >
                <Plus size={14} /> {finishSaving ? "Guardando..." : "Agregar acabado"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {ToastComponent}
    </>
  );
}
