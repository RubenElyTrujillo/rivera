import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAdminAuth, useToast, SaveButton } from "@/components/admin/adminUtils";
import type { IPagina } from "@/domain/types/pagina";

export default function PaginasListPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const router = useRouter();
  const [pages, setPages] = useState<IPagina[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (checking) return;
    fetch("/api/content/paginas")
      .then((r) => r.json())
      .then(setPages)
      .catch(() => show("Error al cargar páginas"))
      .finally(() => setLoading(false));
  }, [checking, show]);

  function slugify(s: string): string {
    return s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
  }

  async function createPage() {
    if (!newTitle.trim() || !newSlug.trim()) return show("Título y slug son obligatorios");
    setSaving(true);
    const res = await fetch("/api/content/paginas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: newSlug, published: false }),
    });
    setSaving(false);
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Error" }));
      return show(error ?? "Error al crear");
    }
    const created = await res.json();
    router.push(`/admin/paginas/${created.id}`);
  }

  async function remove(id: number) {
    if (!confirm("¿Eliminar esta página? Esta acción no se puede deshacer.")) return;
    const res = await fetch(`/api/content/paginas/${id}`, { method: "DELETE" });
    if (!res.ok) return show("Error al eliminar");
    setPages(pages.filter((p) => p.id !== id));
    show("Página eliminada");
  }

  if (checking || loading) return <p className="p-6">Cargando…</p>;

  return (
    <>
      {ToastComponent}
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Páginas</h1>
        </header>

        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Nueva página</h2>
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="px-4 py-2 bg-[hsl(20,60%,45%)] text-white rounded hover:bg-[hsl(20,60%,40%)]"
            >
              + Nueva página
            </button>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
              <label className="text-sm">
                <span className="block mb-1">Título</span>
                <input
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  className="w-full px-3 py-2 border rounded"
                />
              </label>
              <label className="text-sm">
                <span className="block mb-1">Slug (URL)</span>
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 border rounded font-mono text-xs"
                  placeholder="nosotros"
                />
                <span className="text-xs text-gray-500 block mt-1">/p/{newSlug || "…"}</span>
              </label>
              <SaveButton saving={saving} onClick={createPage} label="Crear" />
            </div>
          )}
        </div>

        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg divide-y">
          {pages.length === 0 && (
            <p className="p-6 text-center text-gray-500">No hay páginas aún. Crea la primera arriba.</p>
          )}
          {pages.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.published ? "Publicada" : "Borrador"}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-mono">/p/{p.slug}</div>
              </div>
              <div className="flex gap-2 text-sm">
                {p.published && (
                  <a href={`/p/${p.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1 border rounded hover:bg-gray-50">
                    Ver
                  </a>
                )}
                <Link href={`/admin/paginas/${p.id}`} className="px-3 py-1 bg-[hsl(20,60%,45%)] text-white rounded hover:bg-[hsl(20,60%,40%)]">
                  Editar
                </Link>
                <button onClick={() => remove(p.id)} className="px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
