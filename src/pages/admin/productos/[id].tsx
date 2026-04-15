import { useState, useEffect, useCallback } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import {
  useAdminAuth, PageHeader, Field, FormCard,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { GalleryDropzone } from "@/components/admin/forms/GalleryDropzone"
import { Trash2 } from "lucide-react"
import type { ICategoria, ISubcategoria, IProducto, IProductoImagen } from "@/domain/types"

// Load WYSIWYG only client-side
const WysiwygEditor = dynamic(() => import("@/components/admin/WysiwygEditor"), { ssr: false })

const EMPTY_PRODUCTO = {
  subcategoriaId: 0, name: "", coverImage: null as string | null,
  hoverImage: null as string | null, shortDesc: null as string | null,
  htmlContent: null as string | null,
}

export default function AdminProductoDetailPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const router = useRouter()
  const { id } = router.query
  const isNew = id === "new"
  const numId = isNew ? null : Number(id)

  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [subcategorias, setSubcategorias] = useState<ISubcategoria[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [form, setForm] = useState({ ...EMPTY_PRODUCTO })
  const [imagenes, setImagenes] = useState<IProductoImagen[]>([])
  const [saving, setSaving] = useState(false)

  const addImagen = useCallback(async (url: string) => {
    if (!numId) return
    const res = await fetch("/api/catalog/imagenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productoId: numId, url, order: 0 }),
    })
    const img: IProductoImagen = await res.json()
    setImagenes(prev => [...prev, img])
  }, [numId])

  // Load categorias
  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setCategorias(d)
    }).catch(() => null)
  }, [])

  // Load subcategorias when filterCat changes
  useEffect(() => {
    if (!filterCat) return
    fetch(`/api/catalog/subcategorias?categoriaId=${filterCat}`)
      .then(r => r.json())
      .then((d: ISubcategoria[]) => { if (Array.isArray(d)) setSubcategorias(d) })
      .catch(() => null)
  }, [filterCat])

  // Load existing product if editing
  useEffect(() => {
    if (!numId) return
    fetch(`/api/catalog/productos`).then(r => r.json()).then((list: IProducto[]) => {
      const p = list.find(x => x.id === numId)
      if (!p) return
      const catId = p.subcategoria?.categoria?.id
      if (catId) setFilterCat(catId)
      setForm({
        subcategoriaId: p.subcategoriaId,
        name: p.name,
        coverImage: p.coverImage,
        hoverImage: p.hoverImage,
        shortDesc: p.shortDesc,
        htmlContent: p.htmlContent,
      })
      setImagenes(p.imagenes ?? [])
    }).catch(() => null)
  }, [numId])

  async function save() {
    if (!form.name || !form.subcategoriaId) { show("Nombre y subcategoría son requeridos"); return }
    setSaving(true)
    if (isNew) {
      const res = await fetch("/api/catalog/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { show("Error al crear"); setSaving(false); return }
      const created: IProducto = await res.json()
      show("¡Producto creado!")
      router.push(`/admin/productos/${created.id}`)
    } else {
      const res = await fetch(`/api/catalog/productos?id=${numId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) { show("Error al guardar"); setSaving(false); return }
      show("¡Guardado!")
    }
    setSaving(false)
  }

  async function deleteImagen(imgId: number) {
    await fetch(`/api/catalog/imagenes?id=${imgId}`, { method: "DELETE" })
    setImagenes(prev => prev.filter(i => i.id !== imgId))
    show("Imagen eliminada")
  }

  if (checking || (!isNew && !numId)) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>{isNew ? "Nuevo Producto" : (form.name || "Producto")} — Admin Rivera</title></Head>
      <PageHeader
        title={isNew ? "Nuevo Producto" : (form.name || "Editar Producto")}
        subtitle="Nivel 3 del catálogo"
      />
      <Link href="/admin/productos" className="inline-block text-sm text-[hsl(20,60%,45%)] hover:underline mb-4">← Volver a productos</Link>

      <div className="space-y-6">
        {/* Main form */}
        <FormCard>
          {/* Categoría → Subcategoría selector */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                value={filterCat}
                onChange={e => { setFilterCat(Number(e.target.value)); setForm(p => ({ ...p, subcategoriaId: 0 })) }}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              >
                <option value="">— Selecciona categoría —</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Subcategoría *">
              <select
                value={form.subcategoriaId || ""}
                onChange={e => setForm(p => ({ ...p, subcategoriaId: Number(e.target.value) }))}
                disabled={!filterCat}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] disabled:opacity-50"
              >
                <option value="">— Selecciona subcategoría —</option>
                {subcategorias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Nombre *">
              <AdminInput value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Arctic Oak Splash" />
            </Field>

          <Field label="Descripción corta">
            <AdminTextarea value={form.shortDesc ?? ""} onChange={v => setForm(p => ({ ...p, shortDesc: v || null }))} rows={2} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Imagen de portada">
              <ImageUploadField value={form.coverImage ?? ""} onChange={v => setForm(p => ({ ...p, coverImage: v || null }))} aspect="square" />
            </Field>
            <Field label="Imagen hover (opcional)">
              <ImageUploadField value={form.hoverImage ?? ""} onChange={v => setForm(p => ({ ...p, hoverImage: v || null }))} aspect="square" />
            </Field>
          </div>

          <Field label="Contenido del producto (WYSIWYG)">
            <WysiwygEditor
              value={form.htmlContent ?? ""}
              onChange={v => setForm(p => ({ ...p, htmlContent: v || null }))}
            />
          </Field>

          <div className="mt-4">
            <SaveButton saving={saving} onClick={save} />
          </div>
        </FormCard>

        {/* Gallery — only show when editing existing product */}
        {!isNew && (
          <FormCard>
            <p className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)] mb-4">
              Galería de imágenes {imagenes.length > 0 && <span className="normal-case font-normal">({imagenes.length})</span>}
            </p>

            {imagenes.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                {imagenes.map(img => (
                  <div key={img.id} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.caption ?? ""} className="w-full aspect-square object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => deleteImagen(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <GalleryDropzone onUploaded={addImagen} />
          </FormCard>
        )}
      </div>
      {ToastComponent}
    </>
  )
}
