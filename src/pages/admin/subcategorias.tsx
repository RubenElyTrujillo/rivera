import { useState, useEffect } from "react"
import Head from "next/head"
import {
  useAdminAuth, Field, AdminInput, AdminTextarea, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus, Layers, Image as ImageIcon, ChevronDown, Link2 } from "lucide-react"
import type { ICategoria, ISubcategoria } from "@/domain/types"
import { toSlug } from "@/lib/toSlug"

// ─── Visual grid column picker ────────────────────────────────────────────────

const GRID_OPTIONS = [
  {
    cols: 2,
    label: "2 columnas",
    hint: "Imágenes grandes, muy visual",
    preview: (
      <div className="grid grid-cols-2 gap-1 w-full">
        {[0,1,2,3].map(i => <div key={i} className="aspect-square rounded bg-current opacity-25" />)}
      </div>
    ),
  },
  {
    cols: 3,
    label: "3 columnas",
    hint: "Balance ideal",
    preview: (
      <div className="grid grid-cols-3 gap-1 w-full">
        {[0,1,2,3,4,5].map(i => <div key={i} className="aspect-square rounded bg-current opacity-25" />)}
      </div>
    ),
  },
  {
    cols: 4,
    label: "4 columnas",
    hint: "Muchos productos",
    preview: (
      <div className="grid grid-cols-4 gap-1 w-full">
        {[0,1,2,3,4,5,6,7].map(i => <div key={i} className="aspect-square rounded bg-current opacity-25" />)}
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

const EMPTY = (): Partial<ISubcategoria> => ({ categoriaId: 0, name: "", coverImage: null, description: null, gridCols: 3 })

export default function AdminSubcategoriasPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [items, setItems] = useState<ISubcategoria[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [selected, setSelected] = useState<ISubcategoria | "__new__" | null>(null)
  const [form, setForm] = useState<Partial<ISubcategoria>>(EMPTY())
  const [saving, setSaving] = useState(false)
  const [imgUploading, setImgUploading] = useState(false)
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

  function selectItem(sub: ISubcategoria) {
    setSelected(sub)
    setForm({ categoriaId: sub.categoriaId, name: sub.name, coverImage: sub.coverImage, description: sub.description, gridCols: sub.gridCols ?? 3 })
  }

  function selectNew() {
    setSelected("__new__")
    setForm({ ...EMPTY(), categoriaId: filterCat || 0 })
  }

  async function save() {
    if (!form.name || !form.categoriaId) return
    setSaving(true)
    try {
      if (selected === "__new__") {
        const res = await fetch("/api/catalog/subcategorias", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
        const created: ISubcategoria = await res.json()
        const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
        const updated: ISubcategoria[] = await fetch(url).then(r => r.json())
        if (Array.isArray(updated)) setItems(updated)
        setSelected(updated.find(s => s.id === created.id) ?? null)
        show("Subcategoría creada ✓")
      } else if (selected) {
        const res = await fetch(`/api/catalog/subcategorias?id=${(selected as ISubcategoria).id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
        if (!res.ok) { show("Error al guardar"); return }
        const url = filterCat ? `/api/catalog/subcategorias?categoriaId=${filterCat}` : "/api/catalog/subcategorias"
        const updated: ISubcategoria[] = await fetch(url).then(r => r.json())
        if (Array.isArray(updated)) {
          setItems(updated)
          const refreshed = updated.find(s => s.id === (selected as ISubcategoria).id)
          if (refreshed) setSelected(refreshed)
        }
        show("Guardado ✓")
      }
    } finally { setSaving(false) }
  }

  async function remove(sub: ISubcategoria, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar "${sub.name}"?\nSe eliminarán también sus productos.`)) return
    await fetch(`/api/catalog/subcategorias?id=${sub.id}`, { method: "DELETE" })
    const updated = items.filter(s => s.id !== sub.id)
    setItems(updated)
    if (selected !== "__new__" && (selected as ISubcategoria)?.id === sub.id) setSelected(null)
    show("Eliminada")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Subcategorías — Admin Rivera</title></Head>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-bold text-[hsl(0,0%,10%)]">Subcategorías</h1>
        <p className="text-sm text-[hsl(0,0%,55%)]">Nivel 2 · URL pública: /<span className="font-mono">categoria</span>/<span className="font-mono">slug</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-[500px]">
        {/* Left: list */}
        <div className="flex flex-col gap-2">
          {/* Category filter */}
          <div className="relative">
            <select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value === "" ? "" : Number(e.target.value)); setSelected(null) }}
              className="w-full appearance-none border border-[hsl(0,0%,80%)] rounded-xl px-4 py-2.5 text-sm bg-white pr-9 focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0,0%,50%)] pointer-events-none" />
          </div>

          <button
            onClick={selectNew}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold transition-all ${
              selected === "__new__"
                ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)] text-[hsl(20,60%,40%)]"
                : "border-[hsl(0,0%,80%)] text-[hsl(0,0%,45%)] hover:border-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,45%)]"
            }`}
          >
            <Plus size={16} /> Nueva subcategoría
          </button>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[hsl(0,0%,70%)] text-sm">
              <Layers size={32} className="mb-2" />
              {filterCat ? "Sin subcategorías en esta categoría" : "Sin subcategorías aún"}
            </div>
          )}

          {items.map(sub => {
            const isActive = selected !== "__new__" && (selected as ISubcategoria)?.id === sub.id
            const catName = categorias.find(c => c.id === sub.categoriaId)?.name ?? ""
            return (
              <button
                key={sub.id}
                onClick={() => selectItem(sub)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,97%)] shadow-sm"
                    : "border-[hsl(0,0%,88%)] bg-white hover:border-[hsl(20,60%,60%)] hover:bg-[hsl(20,60%,99%)]"
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[hsl(0,0%,92%)] flex items-center justify-center">
                  {sub.coverImage
                    ? <img src={sub.coverImage} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon size={18} className="text-[hsl(0,0%,70%)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[hsl(0,0%,10%)] truncate">{sub.name}</p>
                  {!filterCat && catName && (
                    <p className="text-xs text-[hsl(20,60%,45%)] font-medium truncate">{catName}</p>
                  )}
                  <p className="text-xs text-[hsl(0,0%,55%)] font-mono truncate">/{sub.slug}</p>
                  <p className="text-xs text-[hsl(0,0%,55%)] mt-0.5">{sub._count?.productos ?? 0} productos</p>
                </div>
                <button
                  onClick={e => remove(sub, e)}
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
              <Layers size={40} className="mb-3 opacity-50" />
              <p>Selecciona una subcategoría o crea una nueva</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[hsl(0,0%,88%)] shadow-sm p-6">
              <h2 className="text-base font-bold text-[hsl(0,0%,15%)] mb-5">
                {selected === "__new__" ? "Nueva subcategoría" : `Editar — ${(selected as ISubcategoria).name}`}
              </h2>
              <Field label="Categoría padre *">
                <div className="relative">
                  <select
                    value={form.categoriaId ?? ""}
                    onChange={e => setForm(p => ({ ...p, categoriaId: Number(e.target.value) }))}
                    className="w-full appearance-none border border-[hsl(0,0%,80%)] rounded-lg px-3 py-2 text-sm bg-white pr-9 focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                  >
                    <option value="">— Selecciona una categoría —</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(0,0%,50%)] pointer-events-none" />
                </div>
              </Field>
              <div className="mb-4">
                <Field label="Nombre *">
                  <AdminInput value={form.name ?? ""} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Splash!" />
                </Field>
                {/* Slug preview */}
                {form.name && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-[hsl(0,0%,96%)] rounded-lg border border-[hsl(0,0%,88%)]">
                    <Link2 size={13} className="text-[hsl(0,0%,50%)] flex-shrink-0" />
                    <span className="text-xs text-[hsl(0,0%,45%)]">URL pública:</span>
                    <span className="text-xs font-mono text-[hsl(20,60%,42%)] font-semibold">
                      /{categorias.find(c => c.id === form.categoriaId)
                        ? toSlug(categorias.find(c => c.id === form.categoriaId)!.name)
                        : "categoria"}/{toSlug(form.name)}
                    </span>
                  </div>
                )}
              </div>
              <Field label="Descripción (opcional)">
                <AdminTextarea
                  value={form.description ?? ""}
                  onChange={v => setForm(p => ({ ...p, description: v || null }))}
                  placeholder="Breve descripción de esta subcategoría…"
                />
              </Field>
              <Field label="Cuadrícula de productos">
                <GridColsPicker
                  value={form.gridCols ?? 3}
                  onChange={v => setForm(p => ({ ...p, gridCols: v }))}
                />
                <p className="text-xs text-[hsl(0,0%,55%)] mt-2">
                  Controla cuántas columnas se muestran en la página pública de esta subcategoría.
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
