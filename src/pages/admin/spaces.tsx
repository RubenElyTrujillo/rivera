import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import { Trash2, Plus, Images, FolderOpen, Search } from "lucide-react";
import type { ISpaceProject, ISpaceProjectImage, ISpaceCategory } from "@/domain/types";

export default function AdminSpacesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [spaces, setSpaces]       = useState<ISpaceProject[]>([]);
  const [categories, setCategories] = useState<ISpaceCategory[]>([]);
  const [saving, setSaving]       = useState(false);
  const [loading, setLoading]     = useState(true);
  const [activeCat, setActiveCat] = useState<string>("");
  const [search, setSearch]       = useState("");
  const [expandedImages, setExpandedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch("/api/content/spaces").then((r) => r.json()),
      fetch("/api/content/space-categories").then((r) => r.json()),
    ]).then(([spacesData, catsData]: [ISpaceProject[], ISpaceCategory[]]) => {
      if (spacesData?.length) setSpaces(spacesData);
      if (catsData?.length) {
        setCategories(catsData);
        setActiveCat(catsData[0]?.name ?? "");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────────────

  const categoryNames = categories.map((c) => c.name);

  /** Proyectos de la pestaña activa, filtrados por búsqueda. */
  const visibleSpaces = spaces.filter((s) => {
    const inCat = s.category === activeCat || activeCat === "__all__";
    const matchSearch = search.trim() === "" ||
      s.title.toLowerCase().includes(search.toLowerCase());
    return inCat && matchSearch;
  });

  /** Índice global de un proyecto visible. */
  const globalIdx = (visibleIdx: number) =>
    spaces.indexOf(visibleSpaces[visibleIdx]);

  /** Proyectos por categoría (para el badge). */
  const countFor = (catName: string) =>
    spaces.filter((s) => s.category === catName).length;

  // ─── Mutators ─────────────────────────────────────────────────────────────

  const updateField = (globalI: number, key: keyof ISpaceProject, value: string) =>
    setSpaces((prev) => prev.map((s, i) => (i === globalI ? { ...s, [key]: value } : s)));

  const remove = (globalI: number) =>
    setSpaces((prev) => prev.filter((_, i) => i !== globalI));

  /** Agrega un nuevo proyecto en la categoría activa. */
  const addToCategory = (catName: string) =>
    setSpaces((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        category: catName,
        imageUrl: "",
        description: "",
        completedAt: null,
        order: prev.length,
        images: [],
      },
    ]);

  const updateImage = (globalI: number, imgIdx: number, key: keyof ISpaceProjectImage, value: string) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== globalI) return s;
        const images = (s.images ?? []).map((img, j) =>
          j === imgIdx ? { ...img, [key]: value } : img
        );
        return { ...s, images };
      })
    );

  const addImage = (globalI: number) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== globalI) return s;
        const images = [
          ...(s.images ?? []),
          { id: Date.now(), spaceProjectId: s.id, url: "", caption: "", order: s.images?.length ?? 0 },
        ];
        return { ...s, images };
      })
    );

  const removeImage = (globalI: number, imgIdx: number) =>
    setSpaces((prev) =>
      prev.map((s, i) => {
        if (i !== globalI) return s;
        return { ...s, images: (s.images ?? []).filter((_, j) => j !== imgIdx) };
      })
    );

  // ─── Save ─────────────────────────────────────────────────────────────────

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
    const res = await fetch("/api/content/spaces", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    show(res.ok ? "¡Guardado!" : "Error al guardar");
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  if (checking || loading) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Espacios — Admin Rivera</title></Head>
      <PageHeader
        title="Proyectos de Espacios"
        subtitle="Organizados por categoría. Los cambios se guardan todos juntos al final."
      />

      {/* Sin categorías */}
      {categories.length === 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
          No hay categorías creadas aún.{" "}
          <a href="/admin/space-categories" className="font-semibold underline">
            Crea categorías primero
          </a>{" "}
          para poder agregar proyectos.
        </div>
      )}

      {categories.length > 0 && (
        <>
          {/* ── Tabs de categorías ── */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 mb-6 border-b border-[hsl(0,0%,88%)]">
            {categories.map((cat) => {
              const count = countFor(cat.name);
              const isActive = activeCat === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(cat.name); setSearch(""); }}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${
                    isActive
                      ? "border-[hsl(20,60%,45%)] text-[hsl(20,60%,45%)]"
                      : "border-transparent text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,20%)]"
                  }`}
                >
                  <FolderOpen size={14} />
                  {cat.name}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? "bg-[hsl(20,60%,45%)] text-white"
                      : "bg-[hsl(0,0%,92%)] text-[hsl(0,0%,40%)]"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Barra de búsqueda + Agregar ── */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(0,0%,55%)]" />
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[hsl(0,0%,82%)] rounded focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              />
            </div>
            <button
              onClick={() => addToCategory(activeCat)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,38%)] px-4 py-2 rounded transition-colors"
            >
              <Plus size={15} />
              Agregar a &quot;{activeCat}&quot;
            </button>
          </div>

          {/* ── Lista de proyectos de la categoría activa ── */}
          <div className="space-y-4">
            {visibleSpaces.length === 0 ? (
              <div className="text-center py-16 text-[hsl(0,0%,60%)] text-sm">
                {search ? "Sin resultados para esa búsqueda." : "Esta categoría no tiene proyectos todavía."}
              </div>
            ) : (
              visibleSpaces.map((space, vi) => {
                const gi = globalIdx(vi);
                const isExpandedImg = expandedImages.has(gi);

                return (
                  <FormCard key={space.id}>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)]">
                          Proyecto {vi + 1} de {visibleSpaces.length}
                        </span>
                        {space.category !== activeCat && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-mono">
                            {space.category}
                          </span>
                        )}
                      </div>
                      <button onClick={() => remove(gi)} className="text-red-400 hover:text-red-600" title="Eliminar proyecto">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Título + Fecha */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Field label="Título del trabajo">
                        <AdminInput
                          value={space.title}
                          onChange={(v) => updateField(gi, "title", v)}
                          placeholder="Piso de madera en sala"
                        />
                      </Field>
                      <Field label="Fecha de realización" hint="Opcional">
                        <input
                          type="date"
                          value={space.completedAt ? space.completedAt.slice(0, 10) : ""}
                          onChange={(e) => updateField(gi, "completedAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
                          className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                        />
                      </Field>
                    </div>

                    {/* Imagen de portada */}
                    <Field label="Imagen de portada">
                      <ImageUploadField
                        value={space.imageUrl}
                        onChange={(url) => updateField(gi, "imageUrl", url)}
                        placeholder="/uploads/portada.webp"
                        aspect="landscape"
                      />
                    </Field>

                    {/* Descripción */}
                    <Field label="Descripción del proyecto">
                      <AdminTextarea
                        value={space.description ?? ""}
                        onChange={(v) => updateField(gi, "description", v)}
                        placeholder="Materiales usados, detalles del trabajo, cliente, etc."
                        rows={3}
                      />
                    </Field>

                    {/* Imágenes adicionales */}
                    <div className="mt-4 border-t border-[hsl(0,0%,90%)] pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedImages((prev) => {
                            const next = new Set(prev);
                            next.has(gi) ? next.delete(gi) : next.add(gi);
                            return next;
                          })
                        }
                        className="flex items-center gap-2 text-xs font-semibold text-[hsl(0,0%,40%)] hover:text-[hsl(20,60%,45%)] transition-colors"
                      >
                        <Images size={14} />
                        Imágenes adicionales ({space.images?.length ?? 0})
                        <span className="text-[hsl(0,0%,60%)]">{isExpandedImg ? "▲" : "▼"}</span>
                      </button>

                      {isExpandedImg && (
                        <div className="mt-4 space-y-4">
                          {(space.images ?? []).map((img, imgIdx) => (
                            <div key={img.id} className="flex gap-3 p-3 bg-[hsl(0,0%,97%)] rounded">
                              <div className="flex-1 space-y-2">
                                <ImageUploadField
                                  label={`Imagen ${imgIdx + 1}`}
                                  value={img.url}
                                  onChange={(url) => updateImage(gi, imgIdx, "url", url)}
                                  aspect="square"
                                />
                                <AdminInput
                                  value={img.caption}
                                  onChange={(v) => updateImage(gi, imgIdx, "caption", v)}
                                  placeholder="Descripción de la imagen (opcional)"
                                />
                              </div>
                              <button
                                onClick={() => removeImage(gi, imgIdx)}
                                className="text-red-400 hover:text-red-600 mt-6"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addImage(gi)}
                            className="flex items-center gap-1 text-xs text-[hsl(20,60%,45%)] font-semibold hover:underline"
                          >
                            <Plus size={12} /> Agregar imagen
                          </button>
                        </div>
                      )}
                    </div>
                  </FormCard>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Guardar global */}
      <div className="mt-6">
        <SaveButton saving={saving} onClick={save} />
      </div>
      {ToastComponent}
    </>
  );
}
