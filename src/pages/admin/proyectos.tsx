import { useState, useEffect, useRef } from "react"
import Head from "next/head"
import { useAdminAuth, Field, AdminInput, AdminTextarea, AdminPageSkeleton } from "@/components/admin/adminUtils"
import { useToast } from "@/hooks/admin/useToast"
import { SaveButton } from "@/components/admin/ui/SaveButton"
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField"
import { Trash2, Plus, Star, Eye, EyeOff, Upload, X, MapPin, Layers } from "lucide-react"
import type { IProyecto, ISubcategoria } from "@/domain/types/catalog-new"

// ─── Ambient tag chips ────────────────────────────────────────────────────────

const AMBIENT_SUGGESTIONS = ["Sala", "Comedor", "Recámara", "Cocina", "Baño", "Terraza", "Oficina", "Lobby", "Estudio", "Pasillo"]

function AmbientePicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState("")
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter(t => t !== tag) : [...value, tag])
  const addCustom = () => {
    const t = custom.trim()
    if (t && !value.includes(t)) onChange([...value, t])
    setCustom("")
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {AMBIENT_SUGGESTIONS.map(tag => (
          <button key={tag} type="button" onClick={() => toggle(tag)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${value.includes(tag) ? "bg-[hsl(20,60%,45%)] text-white border-[hsl(20,60%,45%)]" : "bg-white text-[hsl(0,0%,40%)] border-[hsl(0,0%,82%)] hover:border-[hsl(20,60%,45%)]"}`}>
            {tag}
          </button>
        ))}
      </div>
      {value.filter(t => !AMBIENT_SUGGESTIONS.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.filter(t => !AMBIENT_SUGGESTIONS.includes(t)).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(20,60%,45%)] text-white">
              {tag}<button type="button" onClick={() => toggle(tag)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input value={custom} onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
          placeholder="Ambiente personalizado…"
          className="flex-1 border border-[hsl(0,0%,82%)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]" />
        <button type="button" onClick={addCustom}
          className="px-3 py-1.5 rounded-lg bg-[hsl(20,60%,45%)] text-white text-xs font-bold hover:bg-[hsl(20,60%,38%)]">
          + Agregar
        </button>
      </div>
    </div>
  )
}

// ─── Gallery multi-upload ─────────────────────────────────────────────────────

interface GalleryItem { url: string; caption: string; order: number }

function GalleryUploader({ items, onChange }: { items: GalleryItem[]; onChange: (items: GalleryItem[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    const uploaded: GalleryItem[] = []
    for (const file of files) {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json() as { url: string }
      uploaded.push({ url: data.url, caption: "", order: items.length + uploaded.length })
    }
    onChange([...items, ...uploaded])
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))
    if (files.length) void uploadFiles(files)
  }

  const removeItem = (idx: number) =>
    onChange(items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, order: i })))

  const updateCaption = (idx: number, caption: string) =>
    onChange(items.map((it, i) => i === idx ? { ...it, caption } : it))

  return (
    <div className="space-y-4">
      <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-[hsl(0,0%,80%)] rounded-xl p-6 text-center cursor-pointer hover:border-[hsl(20,60%,45%)] transition-colors bg-[hsl(0,0%,98%)]">
        {uploading ? (
          <div className="flex items-center justify-center gap-3 text-[hsl(20,60%,45%)]">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Subiendo imágenes…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[hsl(0,0%,55%)]">
            <Upload className="w-8 h-8" />
            <span className="text-sm font-medium">Arrastra imágenes aquí o haz clic para seleccionar</span>
            <span className="text-xs">Puedes subir varias a la vez</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => { const files = Array.from(e.target.files ?? []); if (files.length) void uploadFiles(files) }} />
      </div>
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden border border-[hsl(0,0%,88%)] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="w-full aspect-square object-cover" />
              <button type="button" onClick={() => removeItem(idx)}
                className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
              <div className="p-2">
                <input value={item.caption} onChange={e => updateCaption(idx, e.target.value)}
                  placeholder="Pie de foto…"
                  className="w-full text-xs border border-[hsl(0,0%,88%)] rounded-lg px-2 py-1 focus:outline-none focus:border-[hsl(20,60%,45%)]" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Default form state ───────────────────────────────────────────────────────

const DEFAULT = {
  title: "", city: "", colonia: "", description: "",
  coverImage: "", featured: false, order: 0, visible: true,
  ambientes: [] as string[], area: "",
  subcategoriaId: "", materialLabel: "",
  imagenes: [] as GalleryItem[],
}
type FormState = typeof DEFAULT

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProyectosAdmin() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()

  const [proyectos, setProyectos] = useState<IProyecto[]>([])
  const [subcategorias, setSubcategorias] = useState<ISubcategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>({ ...DEFAULT })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (checking) return
    void fetchAll()
  }, [checking])

  const fetchAll = async () => {
    setLoading(true)
    const [pr, sc] = await Promise.all([
      fetch("/api/admin/proyectos").then(r => r.json()),
      fetch("/api/catalog/subcategorias").then(r => r.json()),
    ])
    setProyectos((pr as IProyecto[]) ?? [])
    setSubcategorias((sc as ISubcategoria[]) ?? [])
    setLoading(false)
  }

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm(f => ({ ...f, [key]: val }))

  const openNew = () => {
    setEditId(null)
    setForm({ ...DEFAULT })
    setShowForm(true)
  }

  const openEdit = (p: IProyecto) => {
    setEditId(p.id)
    setForm({
      title: p.title, city: p.city, colonia: p.colonia, description: p.description,
      coverImage: p.coverImage ?? "", featured: p.featured, order: p.order,
      visible: p.visible, ambientes: p.ambientes, area: p.area?.toString() ?? "",
      subcategoriaId: p.subcategoriaId?.toString() ?? "", materialLabel: p.materialLabel ?? "",
      imagenes: (p.imagenes ?? []).map(i => ({ url: i.url, caption: i.caption ?? "", order: i.order })),
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { show("El título es obligatorio"); return }
    if (coverUploading) { show("Espera a que termine la subida de imagen"); return }
    setSaving(true)
    const body = {
      ...form,
      area: form.area !== "" ? Number(form.area) : null,
      subcategoriaId: form.subcategoriaId !== "" ? Number(form.subcategoriaId) : null,
    }
    const url = editId ? `/api/admin/proyectos/${editId}` : "/api/admin/proyectos"
    const method = editId ? "PUT" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setSaving(false)
    if (res.ok) {
      show(editId ? "Proyecto actualizado" : "Proyecto creado")
      setShowForm(false)
      void fetchAll()
    } else {
      show("Error al guardar")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return
    await fetch(`/api/admin/proyectos/${id}`, { method: "DELETE" })
    show("Proyecto eliminado")
    void fetchAll()
  }

  const toggleFeatured = async (p: IProyecto) => {
    await fetch(`/api/admin/proyectos/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: p.title, city: p.city, colonia: p.colonia, description: p.description,
        coverImage: p.coverImage, featured: !p.featured, order: p.order, visible: p.visible,
        ambientes: p.ambientes, area: p.area ?? null, subcategoriaId: p.subcategoriaId ?? null,
        materialLabel: p.materialLabel ?? "",
        imagenes: (p.imagenes ?? []).map(i => ({ url: i.url, caption: i.caption ?? "", order: i.order })),
      }),
    })
    void fetchAll()
  }

  const toggleVisible = async (p: IProyecto) => {
    await fetch(`/api/admin/proyectos/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: p.title, city: p.city, colonia: p.colonia, description: p.description,
        coverImage: p.coverImage, featured: p.featured, order: p.order, visible: !p.visible,
        ambientes: p.ambientes, area: p.area ?? null, subcategoriaId: p.subcategoriaId ?? null,
        materialLabel: p.materialLabel ?? "",
        imagenes: (p.imagenes ?? []).map(i => ({ url: i.url, caption: i.caption ?? "", order: i.order })),
      }),
    })
    void fetchAll()
  }

  if (checking || loading) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Proyectos · Admin Rivera</title></Head>
      {ToastComponent}

      <div className="min-h-screen bg-[hsl(0,0%,97%)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(0,0%,12%)]">Proyectos Recientes</h1>
            <p className="text-sm text-[hsl(0,0%,50%)] mt-0.5">{proyectos.length} proyectos · {proyectos.filter(p => p.featured).length} en portada</p>
          </div>
          <button onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(20,60%,45%)] text-white rounded-xl font-semibold text-sm hover:bg-[hsl(20,60%,38%)] transition-colors">
            <Plus className="w-4 h-4" /> Nuevo proyecto
          </button>
        </div>

        {/* List */}
        {proyectos.length === 0 ? (
          <div className="text-center py-24 text-[hsl(0,0%,55%)]">
            <div className="text-5xl mb-4">🏠</div>
            <p className="font-medium">Aún no hay proyectos</p>
            <p className="text-sm mt-1">Agrega el primero con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proyectos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-[hsl(0,0%,90%)] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-[hsl(0,0%,93%)] overflow-hidden">
                  {p.coverImage
                    ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */
                    : <div className="w-full h-full flex items-center justify-center text-[hsl(0,0%,70%)] text-3xl">🏠</div>
                  }
                  <div className="absolute top-2 left-2 flex gap-1.5">
                    {p.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold">
                        <Star className="w-3 h-3 fill-current" /> Portada
                      </span>
                    )}
                    {!p.visible && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[hsl(0,0%,30%)] text-white text-[10px] font-bold">
                        <EyeOff className="w-3 h-3" /> Oculto
                      </span>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded-full">#{p.order}</div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[hsl(0,0%,12%)] truncate">{p.title}</h3>
                  {(p.city || p.colonia) && (
                    <p className="text-xs text-[hsl(0,0%,55%)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{[p.city, p.colonia].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {p.ambientes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.ambientes.slice(0, 3).map(a => (
                        <span key={a} className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(20,60%,95%)] text-[hsl(20,60%,40%)]">{a}</span>
                      ))}
                      {p.ambientes.length > 3 && <span className="text-[10px] text-[hsl(0,0%,55%)]">+{p.ambientes.length - 3}</span>}
                    </div>
                  )}
                  {p.subcategoria && (
                    <p className="text-xs text-[hsl(20,60%,45%)] flex items-center gap-1 mt-2 font-medium">
                      <Layers className="w-3 h-3" />{p.subcategoria.name}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[hsl(0,0%,92%)]">
                    <button onClick={() => openEdit(p)}
                      className="flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[hsl(0,0%,95%)] hover:bg-[hsl(0,0%,90%)] transition-colors">
                      Editar
                    </button>
                    <button onClick={() => void toggleFeatured(p)} title={p.featured ? "Quitar de portada" : "Poner en portada"}
                      className={`p-1.5 rounded-lg transition-colors ${p.featured ? "bg-amber-100 text-amber-600 hover:bg-amber-200" : "bg-[hsl(0,0%,95%)] text-[hsl(0,0%,50%)] hover:bg-amber-100 hover:text-amber-600"}`}>
                      <Star className="w-4 h-4" />
                    </button>
                    <button onClick={() => void toggleVisible(p)} title={p.visible ? "Ocultar" : "Mostrar"}
                      className="p-1.5 rounded-lg bg-[hsl(0,0%,95%)] text-[hsl(0,0%,50%)] hover:bg-[hsl(0,0%,88%)] transition-colors">
                      {p.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => void handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-[hsl(0,0%,95%)] text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Slide-in form panel */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setShowForm(false)} />
            <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(0,0%,90%)] sticky top-0 bg-white z-10">
                <h2 className="font-bold text-lg text-[hsl(0,0%,12%)]">{editId ? "Editar proyecto" : "Nuevo proyecto"}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[hsl(0,0%,93%)]"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 p-6 space-y-6">
                <Field label="Título del proyecto *">
                  <AdminInput value={form.title} onChange={v => set("title", v)} placeholder="Depto. en Polanco" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ciudad">
                    <AdminInput value={form.city} onChange={v => set("city", v)} placeholder="Ciudad de México" />
                  </Field>
                  <Field label="Colonia / Zona">
                    <AdminInput value={form.colonia} onChange={v => set("colonia", v)} placeholder="Polanco" />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Área (m²)">
                    <AdminInput type="number" value={form.area} onChange={v => set("area", v)} placeholder="120" />
                  </Field>
                  <Field label="Orden en portada" hint="1 = tarjeta grande">
                    <AdminInput type="number" value={form.order.toString()} onChange={v => set("order", Number(v))} />
                  </Field>
                </div>

                <Field label="Descripción corta">
                  <AdminTextarea value={form.description} onChange={v => set("description", v)} rows={2} placeholder="Renovación completa de sala-comedor…" />
                </Field>

                {/* Toggles */}
                <div className="flex gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => set("featured", !form.featured)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.featured ? "bg-amber-400" : "bg-[hsl(0,0%,80%)]"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : ""}`} />
                    </button>
                    <span className="text-sm font-medium flex items-center gap-1.5 text-[hsl(0,0%,25%)]">
                      <Star className="w-4 h-4 text-amber-400" /> En portada
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button type="button" onClick={() => set("visible", !form.visible)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${form.visible ? "bg-[hsl(20,60%,45%)]" : "bg-[hsl(0,0%,80%)]"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.visible ? "translate-x-5" : ""}`} />
                    </button>
                    <span className="text-sm font-medium text-[hsl(0,0%,25%)]">Visible</span>
                  </label>
                </div>

                <Field label="Ambientes">
                  <AmbientePicker value={form.ambientes} onChange={v => set("ambientes", v)} />
                </Field>

                <Field label="Vincular a subcategoría" hint="Opcional — genera link 'Ver material'">
                  <select value={form.subcategoriaId} onChange={e => set("subcategoriaId", e.target.value)}
                    className="w-full border border-[hsl(0,0%,82%)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] bg-white">
                    <option value="">— Sin vincular —</option>
                    {subcategorias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </Field>

                <Field label="Etiqueta de material" hint="Texto libre si no vinculas subcategoría">
                  <AdminInput value={form.materialLabel} onChange={v => set("materialLabel", v)} placeholder="Piso SPC Vanguard" />
                </Field>

                <Field label="Imagen de portada" hint="Imagen principal de la tarjeta">
                  <ImageUploadField value={form.coverImage} onChange={url => set("coverImage", url ?? "")} onUploadingChange={setCoverUploading} />
                </Field>

                <Field label="Galería de fotos">
                  <GalleryUploader items={form.imagenes} onChange={items => set("imagenes", items)} />
                </Field>
              </div>

              <div className="px-6 py-4 border-t border-[hsl(0,0%,90%)] sticky bottom-0 bg-white">
                <SaveButton saving={saving} onClick={() => void handleSave()} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
