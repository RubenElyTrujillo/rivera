import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { IMaterial, IMaterialFinish, ICategory } from "@/domain/types";

export default function AdminProductosPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();

  const [finishes, setFinishes] = useState<IMaterialFinish[]>([]);
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [search, setSearch] = useState("");
  const [filterMaterial, setFilterMaterial] = useState<number | "">("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<Record<number, Partial<IMaterialFinish>>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/content/finishes").then((r) => r.json()),
      fetch("/api/content/materials").then((r) => r.json()),
      fetch("/api/content/categories").then((r) => r.json()),
    ]).then(([f, m, c]) => {
      if (Array.isArray(f)) setFinishes(f);
      if (Array.isArray(m)) setMaterials(m);
      if (Array.isArray(c)) setCategories(c);
    }).catch(() => null);
  }, []);

  function getMaterialName(materialId: number) {
    return materials.find((m) => m.id === materialId)?.name ?? `Línea #${materialId}`;
  }

  function getCategoryName(materialId: number) {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat?.categoryId) return null;
    return categories.find((c) => c.id === mat.categoryId)?.name ?? null;
  }

  function getEdit(id: number): Partial<IMaterialFinish> {
    return editState[id] ?? {};
  }

  function updateField(id: number, key: keyof IMaterialFinish, value: unknown) {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  }

  async function saveProduct(finish: IMaterialFinish) {
    const edits = editState[finish.id] ?? {};
    if (!Object.keys(edits).length) {
      show("Sin cambios");
      return;
    }
    setSavingId(finish.id);
    try {
      const res = await fetch(`/api/content/finishes?id=${finish.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finish, ...edits }),
      });
      if (!res.ok) { show("Error al guardar"); return; }
      const updated: IMaterialFinish = await res.json();
      setFinishes((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      setEditState((prev) => { const n = { ...prev }; delete n[finish.id]; return n; });
      show("¡Guardado!");
    } catch {
      show("Error de conexión");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteProduct(finish: IMaterialFinish) {
    if (!confirm(`¿Eliminar "${finish.name}"? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/content/finishes?id=${finish.id}`, { method: "DELETE" });
    setFinishes((prev) => prev.filter((f) => f.id !== finish.id));
    show("Producto eliminado");
  }

  const filtered = finishes.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.code.toLowerCase().includes(search.toLowerCase());
    const matchMat = filterMaterial === "" || f.materialId === filterMaterial;
    return matchSearch && matchMat;
  });

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Productos — Admin Rivera</title></Head>
      <PageHeader
        title="Productos"
        subtitle="Catálogo de todos los productos. Haz clic en un producto para editar sus detalles y ficha técnica."
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-input rounded px-3 py-2 text-sm bg-background w-64"
        />
        <select
          value={filterMaterial}
          onChange={(e) => setFilterMaterial(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-input rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Todas las líneas</option>
          {materials.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground self-center">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        {filtered.map((finish) => {
          const edits = getEdit(finish.id);
          const isOpen = expandedId === finish.id;
          const catName = getCategoryName(finish.materialId);
          return (
            <div key={finish.id} className="bg-white border border-[hsl(0,0%,88%)] rounded-lg overflow-hidden">
              {/* Header row */}
              <button
                type="button"
                onClick={() => setExpandedId(isOpen ? null : finish.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[hsl(0,0%,98%)] transition-colors text-left"
              >
                {finish.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={finish.image} alt={finish.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-muted rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[hsl(0,0%,13%)]">{edits.name ?? finish.name}</p>
                  <p className="text-xs text-[hsl(0,0%,55%)] truncate">
                    {catName && <span className="mr-1">{catName} /</span>}
                    {getMaterialName(finish.materialId)}
                    {finish.code && <span className="ml-2 font-mono opacity-60">{finish.code}</span>}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
              </button>

              {/* Expanded edit form */}
              {isOpen && (
                <div className="border-t border-[hsl(0,0%,92%)] px-4 py-4">
                  {/* Línea selector */}
                  <Field label="Línea de producto">
                    <select
                      value={edits.materialId ?? finish.materialId}
                      onChange={(e) => updateField(finish.id, "materialId", Number(e.target.value))}
                      className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nombre">
                      <AdminInput
                        value={edits.name ?? finish.name}
                        onChange={(v) => updateField(finish.id, "name", v)}
                        placeholder="Nombre del producto"
                      />
                    </Field>
                    <Field label="Código">
                      <AdminInput
                        value={edits.code ?? finish.code}
                        onChange={(v) => updateField(finish.id, "code", v)}
                        placeholder="REF-001"
                      />
                    </Field>
                  </div>

                  <Field label="Descripción">
                    <AdminTextarea
                      value={edits.desc ?? finish.desc}
                      onChange={(v) => updateField(finish.id, "desc", v)}
                      rows={2}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Imagen principal">
                      <ImageUploadField
                        value={edits.image ?? finish.image}
                        onChange={(v) => updateField(finish.id, "image", v)}
                        aspect="square"
                      />
                    </Field>
                    <Field label="Imagen hover">
                      <ImageUploadField
                        value={edits.hoverImage ?? finish.hoverImage}
                        onChange={(v) => updateField(finish.id, "hoverImage", v)}
                        aspect="square"
                      />
                    </Field>
                  </div>

                  {/* Ficha técnica */}
                  <p className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)] mt-4 mb-3">Ficha técnica</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Dimensiones">
                      <AdminInput
                        value={edits.dims ?? finish.dims}
                        onChange={(v) => updateField(finish.id, "dims", v)}
                        placeholder="1220 x 183 mm"
                      />
                    </Field>
                    <Field label="Grosor">
                      <AdminInput
                        value={edits.thickness ?? finish.thickness}
                        onChange={(v) => updateField(finish.id, "thickness", v)}
                        placeholder="8mm"
                      />
                    </Field>
                    <Field label="Clase de uso">
                      <AdminInput
                        value={edits.useClass ?? finish.useClass}
                        onChange={(v) => updateField(finish.id, "useClass", v)}
                        placeholder="Clase 31"
                      />
                    </Field>
                    <Field label="Tipo de instalación">
                      <AdminInput
                        value={edits.installType ?? finish.installType}
                        onChange={(v) => updateField(finish.id, "installType", v)}
                        placeholder="Click"
                      />
                    </Field>
                    <Field label="Garantía">
                      <AdminInput
                        value={edits.warranty ?? finish.warranty}
                        onChange={(v) => updateField(finish.id, "warranty", v)}
                        placeholder="25 años"
                      />
                    </Field>
                    <Field label="PDF ficha técnica">
                      <AdminInput
                        value={edits.pdfUrl ?? finish.pdfUrl}
                        onChange={(v) => updateField(finish.id, "pdfUrl", v)}
                        placeholder="/uploads/fichas/producto.pdf"
                      />
                    </Field>
                  </div>

                  <Field label="Resistente al agua">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={edits.waterRes ?? finish.waterRes}
                        onChange={(e) => updateField(finish.id, "waterRes", e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Sí, este producto es resistente al agua</span>
                    </label>
                  </Field>

                  <Field label="Especificaciones adicionales (Markdown)">
                    <AdminTextarea
                      value={edits.specMd ?? finish.specMd}
                      onChange={(v) => updateField(finish.id, "specMd", v)}
                      rows={3}
                    />
                  </Field>

                  <div className="flex items-center justify-between mt-4">
                    <SaveButton saving={savingId === finish.id} onClick={() => saveProduct(finish)} />
                    <button
                      type="button"
                      onClick={() => deleteProduct(finish)}
                      className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No hay productos que coincidan.</p>
            <p className="text-xs mt-1">Los productos se crean desde la página de cada <Link href="/admin/materials" className="underline hover:text-foreground">Línea</Link>.</p>
          </div>
        )}
      </div>
      {ToastComponent}
    </>
  );
}
