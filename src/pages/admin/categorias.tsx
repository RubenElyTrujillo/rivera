import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus } from "lucide-react"
import type { ICategoria } from "@/domain/types"

const EMPTY: Partial<ICategoria> = { name: "", coverImage: null, description: null, order: 0 }

export default function AdminCategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [items, setItems] = useState<ICategoria[]>([])
  const [savingId, setSavingId] = useState<number | null>(null)
  const [addSaving, setAddSaving] = useState(false)
  const [newItem, setNewItem] = useState({ ...EMPTY })

  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setItems(d)
    }).catch(() => null)
  }, [])

  function update(idx: number, key: keyof ICategoria, value: unknown) {
    setItems(prev => prev.map((c, i) => i === idx ? { ...c, [key]: value } : c))
  }

  async function saveOne(cat: ICategoria) {
    setSavingId(cat.id)
    const res = await fetch(`/api/catalog/categorias?id=${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cat.name, coverImage: cat.coverImage, description: cat.description, order: cat.order }),
    })
    if (!res.ok) { show("Error al guardar"); setSavingId(null); return }
    const updated: ICategoria[] = await fetch("/api/catalog/categorias").then(r => r.json())
    if (Array.isArray(updated)) setItems(updated)
    setSavingId(null)
    show("¡Guardado!")
  }

  async function remove(cat: ICategoria) {
    if (!confirm(`¿Eliminar "${cat.name}"?\n\nSe eliminarán también sus subcategorías y productos.`)) return
    await fetch(`/api/catalog/categorias?id=${cat.id}`, { method: "DELETE" })
    setItems(prev => prev.filter(c => c.id !== cat.id))
    show("Eliminada")
  }

  async function addItem() {
    if (!newItem.name) return
    setAddSaving(true)
    const res = await fetch("/api/catalog/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    })
    const created: ICategoria = await res.json()
    setItems(prev => [...prev, created])
    setNewItem({ ...EMPTY, order: items.length + 1 })
    setAddSaving(false)
    show("Categoría creada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Categorías — Admin Rivera</title></Head>
      <PageHeader title="Categorías" subtitle="Nivel 1 del catálogo (Pisos Laminados, Pisos de Madera…). URL: /[slug]" />
      <div className="space-y-4">
        {items.map((cat, idx) => (
          <FormCard key={cat.id}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(20,60%,45%)]">
                /{cat.slug} · {(cat._count?.subcategorias ?? 0)} subcategorías
              </span>
              <button onClick={() => remove(cat)} className="text-red-400 hover:text-red-600 transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre *">
                <AdminInput value={cat.name} onChange={v => update(idx, "name", v)} placeholder="Pisos Laminados" />
              </Field>
              <Field label="Orden">
                <AdminInput value={String(cat.order)} onChange={v => update(idx, "order", Number(v))} placeholder="0" />
              </Field>
            </div>
            <Field label="Descripción (opcional)">
              <AdminTextarea value={cat.description ?? ""} onChange={v => update(idx, "description", v || null)} />
            </Field>
            <Field label="Imagen de portada">
              <ImageUploadField value={cat.coverImage ?? ""} onChange={v => update(idx, "coverImage", v || null)} aspect="landscape" />
            </Field>
            <SaveButton saving={savingId === cat.id} onClick={() => saveOne(cat)} />
          </FormCard>
        ))}

        <FormCard>
          <p className="text-sm font-bold text-[hsl(20,60%,45%)] mb-4">+ Nueva categoría</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre *">
              <AdminInput value={newItem.name ?? ""} onChange={v => setNewItem(p => ({ ...p, name: v }))} placeholder="Pisos Laminados" />
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
          <button onClick={addItem} disabled={addSaving || !newItem.name} className="mt-3 flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50">
            <Plus size={14} />
            {addSaving ? "Creando..." : "Crear categoría"}
          </button>
        </FormCard>
      </div>
      {ToastComponent}
    </>
  )
}
