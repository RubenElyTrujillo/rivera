import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAdminAuth, useToast, SaveButton } from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import BlockEditor, { type EditorBlock } from "@/components/admin/BlockEditor";
import type { IPagina } from "@/domain/types/pagina";

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-");
}

export default function AdminPaginaEditorPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const router = useRouter();
  const { id } = router.query;
  const numId = Number(id);

  const [pagina, setPagina] = useState<IPagina | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingBlocks, setSavingBlocks] = useState(false);

  const loadPage = useCallback(async () => {
    if (!numId || isNaN(numId)) return;
    const res = await fetch(`/api/content/paginas/${numId}`);
    if (!res.ok) return show("Error al cargar la página");
    const data: IPagina = await res.json();
    setPagina(data);
    setTitle(data.title);
    setSlug(data.slug);
    setPublished(data.published);
    setSeoTitle(data.seoTitle ?? "");
    setSeoDescription(data.seoDescription ?? "");
    setOgImage(data.ogImage ?? "");
    setBlocks(
      (data.bloques ?? []).map((b) => ({
        id: b.id,
        order: b.order,
        type: b.type as EditorBlock["type"],
        config: typeof b.config === "string" ? JSON.parse(b.config) : (b.config as Record<string, unknown>),
        visible: b.visible,
      }))
    );
  }, [numId, show]);

  useEffect(() => { if (!checking) loadPage(); }, [checking, loadPage]);

  async function saveMetadata() {
    setSaving(true);
    const res = await fetch(`/api/content/paginas/${numId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        published,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        ogImage: ogImage || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return show(data.error ?? "Error al guardar");
    }
    show("Metadata guardada");
    loadPage();
  }

  async function saveBlocks() {
    setSavingBlocks(true);
    const bloques = blocks.map((b, i) => ({
      order: i,
      type: b.type,
      config: JSON.stringify(b.config),
      visible: b.visible,
    }));
    const res = await fetch(`/api/content/paginas/${numId}/bloques`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bloques }),
    });
    setSavingBlocks(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return show(data.error ?? "Error al guardar bloques");
    }
    show("Bloques guardados");
    loadPage();
  }

  if (checking || !pagina) return <p className="p-6">Cargando…</p>;

  return (
    <>
      {ToastComponent}
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <header className="flex items-center gap-4">
          <Link href="/admin/paginas" className="text-sm text-gray-500 hover:text-gray-700">← Páginas</Link>
          <h1 className="text-2xl font-bold flex-1">Editar: {pagina.title}</h1>
          {pagina.published && (
            <a href={`/p/${pagina.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(20,60%,45%)] hover:underline">
              Ver página ↗
            </a>
          )}
        </header>

        {/* Metadata section */}
        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-lg">Información general</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium">
              Título
              <input className="w-full mt-1 px-3 py-2 border rounded" value={title} onChange={(e) => { setTitle(e.target.value); if (slug === slugify(pagina.title)) setSlug(slugify(e.target.value)); }} />
            </label>
            <label className="block text-sm font-medium">
              Slug (URL)
              <input className="w-full mt-1 px-3 py-2 border rounded font-mono text-xs" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
              <span className="text-xs text-gray-500 block mt-1">/p/{slug || "…"}</span>
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="rounded" />
            <span className="font-medium">Publicada</span>
            <span className="text-gray-500">— visible en /p/{slug}</span>
          </label>
          <SaveButton saving={saving} onClick={saveMetadata} label="Guardar metadata" />
        </div>

        {/* SEO section */}
        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 space-y-4">
          <h2 className="font-semibold text-lg">SEO</h2>
          <label className="block text-sm font-medium">
            Título SEO
            <input className="w-full mt-1 px-3 py-2 border rounded" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={title} />
          </label>
          <label className="block text-sm font-medium">
            Descripción SEO
            <textarea className="w-full mt-1 px-3 py-2 border rounded" rows={2} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </label>
          <ImageUploadField label="Imagen OG" value={ogImage} onChange={setOgImage} aspect="landscape" />
        </div>

        {/* Blocks section */}
        <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Contenido (Bloques)</h2>
            <span className="text-xs text-gray-500">{blocks.length} bloque{blocks.length !== 1 ? "s" : ""}</span>
          </div>
          <BlockEditor blocks={blocks} onChange={setBlocks} />
          <SaveButton saving={savingBlocks} onClick={saveBlocks} label="Guardar bloques" />
        </div>
      </div>
    </>
  );
}
