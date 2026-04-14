import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus } from "lucide-react"
import type { ICategoria, ISubcategoria } from "@/domain/types"

const EMPTY: Partial<ISubcategoria> = { categoriaId: 0, name: "", coverImage: null, description: null, order: 0 }

export default function AdminSubcategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [items, setItems] = useState<ISubcategoria[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [savingId, setSavingId] = useState<number | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [newItem, setNewItem] = useState({ ...EMPTY })

  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setCategorias(d)
    }).catch(() => null)
  }, [])

  useEffect(() => {
    const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
    fetch(url).then(r => r.json()).then((d: ISubcategoria[]) => {
      if (Array.isArray(d)) setItems(d)
    }).catch(() => null)
  }, [filterCat])

  function update(idx: number, key: keyof ISubcategoria, value: unknown) {
    setItems(prev => prev.map((s, i) => i === idx ? { ...s, [key]: value } : s))
  }

  async function saveOne(sub: ISubcategoria) {
    setSavingId(sub.id)
    const res = await fetch(`/api/catalog/subcategorias?id=${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoriaId: sub.categoriaId, name: sub.name, coverImage: sub.coverImage, description: sub.description, order: sub.order }),
    })
    if (!res.ok) { show("Error al guardar"); setSavingId(null); return }
    const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
    const updated: ISubcategoria[] = await fetch(url).then(r => r.json())
    if (Array.isArray(updated)) setItems(updated)
    setSavingId(null)
    show("¡Guardado!")
  }

  async function remove(sub: ISubcategoria) {
    if (!confirm(`¿Eliminar "${sub.name}"?\n\nSe eliminarán también sus productos.`)) return
    await fetch(`/api/catalog/subcategorias?id=${sub.id}`, { method: "DELETE" })
    setItems(prev => prev.filter(s => s.id !== sub.id))
    show("Eliminada")
  }

  async function addItem() {
    if (!newItem.name || !newItem.categoriaId) return
    setAddSaving(true)
    const res = await fetch("/api/catalog/subcategorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    const created: ISubcategoria = await res.json()
    if (!filterCat || created.categoriaId === filterCat) {
      setItems(prev => [...prev, created])
    }
    setNewItem({ ...EMPTY, categoriaId: newItem.categoriaId, order: items.length + 1 })
    setAddSaving(false)
    show("Subcategoría creada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Subcategorías — Admin Rivera</title></Head>
      <PageHeader title="Subcategorías" subtitle="Nivel 2 del catálogo (Splash!, Clásico…). URL: /[categoría]/[slug]" />

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-input rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((sub, idx) => (
          <FormCard key={sub.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)]">
                {sub.categoria?.slug ?? "?"}/{sub.slug} · {(sub._count?.productos ?? 0)} productos
              </span>
              <button onClick={() => remove(sub)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            <Field label="Categoría padre *">
              <select
                value={sub.categoriaId}
                onChange={e => update(idx, "categoriaId", Number(e.target.value))}
                className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
              >
                {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre *">
                <AdminInput value={sub.name} onChange={v => update(idx, "name", v)} placeholder="Splash!" />
              </Field>
              <Field label="Orden">
                <AdminInput value={String(sub.order)} onChange={v => update(idx, "order", Number(v))} placeholder="0" />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <AdminTextarea value={sub.description ?? ""} onChange={v => update(idx, "description", v || null)} />
            </Field>
            <Field label="Imagen de portada">
              <ImageUploadField value={sub.coverImage ?? ""} onChange={v => update(idx, "coverImage", v || null)} aspect="landscape" />
            </Field>
            <SaveButton saving={savingId === sub.id} onClick={() => saveOne(sub)} />
          </FormCard>
        ))}

        <FormCard>
          <p className="text-sm font-bold text-[hsl(20,60%,45%)] mb-4">+ Nueva subcategoría</p>
          <Field label="Categoría padre *">
            <select
              value={newItem.categoriaId ?? ""}
              onChange={e => setNewItem(p => ({ ...p, categoriaId: Number(e.target.value) }))}
              className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
            >
              <option value="">— Selecciona una categoría —</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput value={newItem.name ?? ""} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Splash!" />
            </Field>
            <Field label="Orden">
              <AdminInput value={String(newItem.order ?? 0)} onChange={v => setNewItem(p => ({ ...p, order: Number(v) }))} placeholder="0" />
            </Field>
          </div>
          <Field label="Descripción (opcional)">
            <AdminTextarea value={newItem.description ?? ""} onChange={v => setNewItem(p => ({ ...p, description: v || null }))} />
          </Field>
          <Field label="Imagen de portada">
            <ImageUploadField value={newItem.coverImage ?? ""} onChange={v => setNewItem(p => ({ ...p, coverImage: v || null }))} aspect="landscape" />
          </Field>
          <button onClick={addItem} disabled={addSaving || !newItem.name || !newItem.categoriaId} className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50">
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear subcategoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  )
}
