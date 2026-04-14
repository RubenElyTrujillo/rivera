import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, ChevronDown, ChevronUp, Pencil, Check, X } from "lucide-react";
import type { IMaterial, IMaterialFinish } from "@/domain/types";

const EMPTY_MAT: IMaterial = { id: 0, slug: '', name: "", subtitle: "", desc: "", spec: "", coverImage: "", collections: [], order: 0, finishes: [], categoryId: null };
const EMPTY_FINISH = {
  name: "", code: "", collection: "", image: "", dims: "",
  hoverImage: "", pdfUrl: "", thickness: "", useClass: "",
  waterRes: false, installType: "", warranty: "",
};

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetch("/api/content/materials")
      .then((r) => r.json())
      .then((d: IMaterial[]) => { if (d?.length) setMaterials(d); })
      .catch(() => null);
  }, []);

  const update = (idx: number, key: keyof IMaterial, value: string | string[]) =>
    setMaterials((prev) => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));

  const remove = (idx: number) => setMaterials((prev) => prev.filter((_, i) => i !== idx));

  const add = () => setMaterials((prev) => [...prev, { ...EMPTY_MAT, id: Date.now(), order: prev.length }]);

  async function save() {
    try {
      setSaving(true);
      const payload = materials.map((m, i) => ({ ...m, order: i }));
      const res = await fetch("/api/content/materials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { show("Error al guardar materiales"); return; }
      const updRes = await fetch("/api/content/materials");
      if (!updRes.ok) { show("Error al cargar materiales"); return; }
      const updated: IMaterial[] = await updRes.json();
      if (updated?.length) setMaterials(updated);
      show("¡Guardado!");
    } catch {
      show("Error de conexión");
    } finally {
      setSaving(false);
    }
  }



  async function addFinish(matId: number) {
    try {
      const f = newFinish[matId];
      if (!f?.name) return;
      setFinishSaving((prev) => ({ ...prev, [matId]: true }));
      const mat = materials.find((m) => m.id === matId);
      const res = await fetch("/api/content/finishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: matId, ...f, order: mat?.finishes?.length ?? 0 }),
      });
      if (!res.ok) { show("Error al agregar acabado"); return; }
      const finishRes = await fetch(`/api/content/finishes?materialId=${matId}`);
      if (!finishRes.ok) { show("Error al cargar acabados"); return; }
      const finishes: IMaterialFinish[] = await finishRes.json();
      setMaterials((prev) => prev.map((m) => m.id === matId ? { ...m, finishes } : m));
      setNewFinish((prev) => ({ ...prev, [matId]: { ...EMPTY_FINISH } }));
      show("Acabado agregado");
    } catch {
      show("Error de conexión");
    } finally {
      setFinishSaving((prev) => ({ ...prev, [matId]: false }));
    }
  }

  async function deleteFinish(matId: number, finishId: number) {
    if (!confirm("¿Eliminar este acabado?")) return;
    try {
      const res = await fetch(`/api/content/finishes?id=${finishId}`, { method: "DELETE" });
      if (!res.ok) { show("Error al eliminar acabado"); return; }
      setMaterials((prev) => prev.map((m) =>
        m.id === matId ? { ...m, finishes: m.finishes.filter((f) => f.id !== finishId) } : m
      ));
      show("Acabado eliminado");
    } catch {
      show("Error de conexión");
    }
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
        specMd: finish.specMd,
        collectionId: finish.collectionId,
      },
    }));
  }

  /** Cancela el modo edición sin guardar. */
  function cancelEdit(finishId: number) {
    setEditingFinish((prev) => ({ ...prev, [finishId]: null }));
  }

  /** Actualiza un campo del acabado en modo edición. */
  function updateEdit(finishId: number, key: keyof FinishEditState, value: string | boolean) {
    setEditingFinish((prev) => ({
      ...prev,
      [finishId]: prev[finishId] ? { ...prev[finishId]!, [key]: value } : null,
    }));
  }

  /** Guarda los cambios del acabado en edición vía PUT a la API. */
  async function saveEdit(matId: number, finish: IMaterialFinish) {
    try {
      const edits = editingFinish[finish.id];
      if (!edits) return;
      setFinishSaving((prev) => ({ ...prev, [finish.id]: true }));
      const res = await fetch(`/api/content/finishes?id=${finish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...edits, order: finish.order, materialId: matId }),
      });
      if (!res.ok) { show("Error al actualizar acabado"); return; }
      const finishRes = await fetch(`/api/content/finishes?materialId=${matId}`);
      if (!finishRes.ok) { show("Error al cargar acabados"); return; }
      const finishes: IMaterialFinish[] = await finishRes.json();
      setMaterials((prev) => prev.map((m) => m.id === matId ? { ...m, finishes } : m));
      setEditingFinish((prev) => ({ ...prev, [finish.id]: null }));
      show("Acabado actualizado");
    } catch {
      show("Error de conexión");
    } finally {
      setFinishSaving((prev) => ({ ...prev, [finish.id]: false }));
    }
  }

  function handleDelete(id: number) {
    if (!confirm("¿Eliminar este material?")) return;
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Líneas — Admin Rivera</title></Head>
      <PageHeader title="Líneas" subtitle="Líneas de producto (Pisos Laminados, Pisos de Madera, etc.). Cada línea contiene sus productos." />
      <div className="space-y-4">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar material..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full md:w-80 border border-input rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(0,0%,96%)] border-b border-[hsl(0,0%,88%)]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(0,0%,45%)]">Imagen</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(0,0%,45%)]">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(0,0%,45%)] hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(0,0%,45%)] hidden md:table-cell">Orden</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide text-[hsl(0,0%,45%)]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(0,0%,92%)]">
              {paginated.map((m) => (
                <tr key={m.id} className="hover:bg-[hsl(0,0%,98%)] transition-colors">
                  <td className="px-4 py-3">
                    {m.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.coverImage} alt={m.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[hsl(0,0%,13%)]">{m.name}</td>
                  <td className="px-4 py-3 text-[hsl(0,0%,55%)] hidden md:table-cell">{m.categoryId ?? "—"}</td>
                  <td className="px-4 py-3 text-[hsl(0,0%,55%)] hidden md:table-cell">{m.order}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/materials/${m.id}`}
                        className="text-xs font-semibold text-[hsl(20,60%,45%)] hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs font-semibold text-destructive hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-[hsl(0,0%,55%)]">
              {filtered.length} materiales · página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs border border-input rounded hover:bg-muted disabled:opacity-40"
              >
                ← Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs border border-input rounded hover:bg-muted disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}

        <button onClick={add} className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)]">
          <Plus size={16} /> Agregar material
        </button>
        <SaveButton saving={saving} onClick={save} />
      </div>
      {ToastComponent}
    </>
  );
}
