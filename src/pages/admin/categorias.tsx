import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, Field, AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus, FolderOpen, Image as ImageIcon, Link2 } from "lucide-react"
import type { ICategoria } from "@/domain/types"
import { toSlug } from "@/lib/toSlug"

// ─── Visual grid column picker ────────────────────────────────────────────────

const GRID_OPTIONS = [
  {
    cols: 2,
    label: "2 columnas",
    hint: "Imágenes grandes, muy visual",
    preview: (
      <div className="grid grid-cols-2 gap-1 w-full">
        {[0,1,2,3].map(i => <div key={i} className="aspect-[4/3] rounded bg-current opacity-25" />)}
      </div>
    ),
  },
  {
    cols: 3,
    label: "3 columnas",
    hint: "Balance ideal",
    preview: (
      <div className="grid grid-cols-3 gap-1 w-full">
        {[0,1,2,3,4,5].map(i => <div key={i} className="aspect-[4/3] rounded bg-current opacity-25" />)}
      </div>
    ),
  },
  {
    cols: 4,
    label: "4 columnas",
    hint: "Muchas subcategorías",
    preview: (
      <div className="grid grid-cols-4 gap-1 w-full">
        {[0,1,2,3,4,5,6,7].map(i => <div key={i} className="aspect-[4/3] rounded bg-current opacity-25" />)}
      </div>
    ),
  },
] as const

function GridColsPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {GRID_OPTIONS.map(opt => {
        const active = value === opt.cols
        return (
          <button
            key={opt.cols}
            type="button"
            onClick={() => onChange(opt.cols)}
            className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all text-[hsl(0,0%,30%)] ${
              active
                ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)] text-[hsl(20,60%,40%)]"
                : "border-[hsl(0,0%,85%)] bg-white hover:border-[hsl(20,60%,60%)]"
            }`}
          >
            <div className="w-full">{opt.preview}</div>
            <span className={`text-xs font-semibold ${active ? "text-[hsl(20,60%,40%)]" : "text-[hsl(0,0%,35%)]"}`}>
              {opt.label}
            </span>
            <span className="text-[10px] text-[hsl(0,0%,55%)] text-center leading-tight">{opt.hint}</span>
          </button>
        )
      })}
    </div>
  )
}

const EMPTY = (): Partial<ICategoria> => ({ name: "", coverImage: null, description: null, gridCols: 3, cardAspect: "cuadrada" })

// ─── Visual card aspect picker ────────────────────────────────────────────────

const ASPECT_OPTIONS = [
  {
    value: "cuadrada",
    label: "Cuadrada",
    hint: "1:1 · Pisos y azulejos",
    cls: "aspect-square",
  },
  {
    value: "paisaje",
    label: "Paisaje",
    hint: "4:3 · Ambientes y espacios",
    cls: "aspect-[4/3]",
  },
  {
    value: "retrato",
    label: "Retrato",
    hint: "3:4 · Productos verticales",
    cls: "aspect-[3/4]",
  },
] as const

function CardAspectPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ASPECT_OPTIONS.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
              active
                ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)]"
                : "border-[hsl(0,0%,85%)] bg-white hover:border-[hsl(20,60%,60%)]"
            }`}
          >
            {/* Proporción visual */}
            <div className="w-full flex justify-center">
              <div className={`w-10 ${opt.cls} rounded bg-[hsl(0,0%,80%)] ${active ? "bg-[hsl(20,60%,70%)]" : ""}`} />
            </div>
            <span className={`text-xs font-semibold ${active ? "text-[hsl(20,60%,40%)]" : "text-[hsl(0,0%,35%)]"}`}>
              {opt.label}
            </span>
            <span className="text-[10px] text-[hsl(0,0%,55%)] text-center leading-tight">{opt.hint}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function AdminCategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [items, setItems] = useState<ICategoria[]>([])
  const [selected, setSelected] = useState<ICategoria | "__new__" | null>(null)
  const [form, setForm] = useState<Partial<ICategoria>>(EMPTY())
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)

  useEffect(() => {
    fetch("/api/catalog/categorias").then(r => r.json()).then((d: ICategoria[]) => {
      if (Array.isArray(d)) setItems(d)
    }).catch(() => null)
  }, [])

  function selectItem(cat: ICategoria) {
    setSelected(cat)
    setForm({ name: cat.name, coverImage: cat.coverImage, description: cat.description, gridCols: cat.gridCols ?? 3, cardAspect: cat.cardAspect ?? "cuadrada" })
  }

  function selectNew() {
    setSelected("__new__")
    setForm(EMPTY())
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    try {
      if (selected === "__new__") {
        const res = await fetch("/api/catalog/categorias", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
        const created: ICategoria = await res.json()
        const updated: ICategoria[] = await fetch("/api/catalog/categorias").then(r => r.json())
        if (Array.isArray(updated)) setItems(updated)
        setSelected(updated.find(c => c.id === created.id) ?? null)
        show("Categoría creada ✓")
      } else if (selected) {
        const res = await fetch(`/api/catalog/categorias?id=${(selected as ICategoria).id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
        if (!res.ok) { show("Error al guardar"); return }
        const updated: ICategoria[] = await fetch("/api/catalog/categorias").then(r => r.json())
        if (Array.isArray(updated)) {
          setItems(updated)
          const refreshed = updated.find(c => c.id === (selected as ICategoria).id)
          if (refreshed) setSelected(refreshed)
        }
        show("Guardado ✓")
      }
    } finally { setSaving(false) }
  }

  async function remove(cat: ICategoria, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${cat.name}"?\nSe eliminarán también sus subcategorías y productos.`)) return
    await fetch(`/api/catalog/categorias?id=${cat.id}`, { method: "DELETE" })
    const updated = items.filter(c => c.id !== cat.id)
    setItems(updated)
    if (selected !== "__new__" && (selected as ICategoria)?.id === cat.id) setSelected(null)
    show("Eliminada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Categorías — Admin Rivera</title></Head>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold text-[hsl(0,0%,10%)]">Categorías</h1>
        <p className="text-sm text-[hsl(0,0%,55%)]">Nivel 1 · URL pública: /<span className="font-mono">slug</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-[500px]">
        {/* Left: list */}
        <div className="flex flex-col gap-2">
          <button
            onClick={selectNew}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
              selected === "__new__"
                ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)] text-[hsl(20,60%,40%)]"
                : "border-[hsl(0,0%,80%)] text-[hsl(0,0%,45%)] hover:border-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,45%)]"
            }`}
          >
            <Plus size={16} /> Nueva categoría
          </button>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[hsl(0,0%,70%)] text-sm">
              <FolderOpen size={32} className="mb-2" />
              Sin categorías aún
            </div>
          )}

          {items.map(cat => {
            const isActive = selected !== "__new__" && (selected as ICategoria)?.id === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => selectItem(cat)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)] shadow-sm"
                    : "border-[hsl(0,0%,88%)] bg-white hover:border-[hsl(20,60%,60%)] hover:bg-[hsl(20,60%,99%)]"
                }`}
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(0,0%,92%)] flex items-center justify-center">
                  {cat.coverImage
                    ? <img src={cat.coverImage} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={18} className="text-[hsl(0,0%,70%)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(0,0%,10%)] truncate">{cat.name}</p>
                  <p className="text-xs text-[hsl(0,0%,55%)] font-mono truncate">/{cat.slug}</p>
                  <p className="text-xs text-[hsl(20,60%,45%)] font-medium mt-0.5">
                    {cat._count?.subcategorias ?? 0} subcategorías
                  </p>
                </div>
                <button
                  onClick={e => remove(cat, e)}
                  className="p-1.5 rounded text-[hsl(0,0%,60%)] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </button>
            )
          })}
        </div>

        {/* Right: form */}
        <div>
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-2xl border-2 border-dashed border-[hsl(0,0%,85%)] text-[hsl(0,0%,65%)] text-sm">
              <FolderOpen size={40} className="mb-3 opacity-50" />
              <p>Selecciona una categoría o crea una nueva</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[hsl(0,0%,88%)] shadow-sm p-6">
              <h2 className="text-base font-bold text-[hsl(0,0%,15%)] mb-5">
                {selected === "__new__" ? "Nueva categoría" : `Editar — ${(selected as ICategoria).name}`}
              </h2>
              <div className="mb-4">
                <Field label="Nombre *">
                  <AdminInput value={form.name ?? ""} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Pisos Laminados" />
                </Field>
                {/* Slug preview */}
                {form.name && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,96%)] rounded-lg border border-[hsl(0,0%,88%)]">
                    <Link2 size={13} className="text-[hsl(0,0%,50%)] flex-shrink-0" />
                    <span className="text-xs text-[hsl(0,0%,45%)]">URL pública:</span>
                    <span className="text-xs font-mono text-[hsl(20,60%,42%)] font-semibold">/{toSlug(form.name)}</span>
                  </div>
                )}
              </div>
              <Field label="Descripción (opcional)">
                <AdminTextarea
                  value={form.description ?? ""}
                  onChange={v => setForm(p => ({ ...p, description: v || null }))}
                  placeholder="Breve descripción de esta categoría…"
                />
              </Field>
              <Field label="Cuadrícula de subcategorías">
                <GridColsPicker
                  value={form.gridCols ?? 3}
                  onChange={v => setForm(p => ({ ...p, gridCols: v }))}
                />
                <p className="text-xs text-[hsl(0,0%,55%)] mt-2">
                  Controla cuántas columnas se muestran al listar subcategorías en la página pública.
                </p>
              </Field>
              <Field label="Forma de las tarjetas">
                <CardAspectPicker
                  value={form.cardAspect ?? "cuadrada"}
                  onChange={v => setForm(p => ({ ...p, cardAspect: v }))}
                />
                <p className="text-xs text-[hsl(0,0%,55%)] mt-2">
                  Proporción de las imágenes en las tarjetas de subcategorías.
                </p>
              </Field>
              <Field label="Imagen de portada">
                <ImageUploadField
                  value={form.coverImage ?? ""}
                  onChange={v => setForm(p => ({ ...p, coverImage: v || null }))}
                  onUploadingChange={setImgUploading}
                  aspect="landscape"
                />
              </Field>
              <div className="mt-5 flex justify-end">
                {imgUploading && (
                  <span className="text-xs text-[hsl(20,60%,45%)] mr-3 self-center font-medium">Esperando imagen…</span>
                )}
                <SaveButton saving={saving || imgUploading} onClick={save} />
              </div>
            </div>
          )}
        </div>
      </div>
      {ToastComponent}
    </>
  )
}
