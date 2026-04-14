import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import {
  useAdminAuth, PageHeader, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ICategoria, ISubcategoria, IProducto } from "@/domain/types"

export default function AdminProductosPage() {
  const { checking } = useAdminAuth()
  const { show, ToastComponent } = useToast()
  const router = useRouter()
  const [categorias, setCategorias] = useState<ICategoria[]>([])
  const [subcategorias, setSubcategorias] = useState<ISubcategoria[]>([])
  const [productos, setProductos] = useState<IProducto[]>([])
  const [filterCat, setFilterCat] = useState<number | "">("")
  const [filterSub, setFilterSub] = useState<number | "">("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/catalog/categorias").then(r => r.json()),
      fetch("/api/catalog/productos").then(r => r.json()),
    ]).then(([cats, prods]) => {
      if (Array.isArray(cats)) setCategorias(cats)
      if (Array.isArray(prods)) setProductos(prods)
    }).catch(() => null)
  }, [])

  useEffect(() => {
    if (!filterCat) { setSubcategorias([]); setFilterSub(""); return }
    fetch(`/api/catalog/subcategorias?categoriaId=${filterCat}`)
      .then(r => r.json())
      .then((d: ISubcategoria[]) => { if (Array.isArray(d)) setSubcategorias(d) })
      .catch(() => null)
    setFilterSub("")
  }, [filterCat])

  const filtered = productos.filter(p => {
    const matchCat = !filterCat || p.subcategoria?.categoria?.id === filterCat
    const matchSub = !filterSub || p.subcategoriaId === filterSub
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSub && matchSearch
  })

  async function remove(p: IProducto) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return
    await fetch(`/api/catalog/productos?id=${p.id}`, { method: "DELETE" })
    setProductos(prev => prev.filter(x => x.id !== p.id))
    show("Eliminado")
  }

  if (checking) return <AdminPageSkeleton />

  return (
    <>
      <Head><title>Productos — Admin Rivera</title></Head>
      <PageHeader title="Productos" subtitle="Nivel 3 del catálogo. URL: /producto/[slug]" />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value === "" ? "" : Number(e.target.value))}
          className="border border-input rounded px-3 py-2 text-sm bg-background"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={filterSub}
          onChange={e => setFilterSub(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={!filterCat}
          className="border border-input rounded px-3 py-2 text-sm bg-background disabled:opacity-50"
        >
          <option value="">Todas las subcategorías</option>
          {subcategorias.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-input rounded px-3 py-2 text-sm bg-background w-48"
        />
        <span className="text-sm text-muted-foreground">{filtered.length} producto{filtered.length !== 1 ? "s" : ""}</span>
        <Link href="/admin/productos/new" className="ml-auto flex items-center gap-2 text-sm font-semibold bg-[hsl(20,60%,45%)] text-white px-4 py-2 rounded hover:bg-[hsl(20,60%,35%)] transition-colors">
          <Plus size={14} /> Nuevo producto
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(0,0%,96%)] border-b border-[hsl(0,0%,88%)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)]">Producto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)] hidden md:table-cell">Categoría › Subcategoría</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[hsl(0,0%,45%)]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(0,0%,92%)]">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-[hsl(0,0%,98%)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.coverImage
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.coverImage} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      : <div className="w-10 h-10 bg-muted rounded" />
                    }
                    <div>
                      <p className="font-medium text-[hsl(0,0%,13%)]">{p.name}</p>
                      {p.shortDesc && <p className="text-xs text-[hsl(0,0%,55%)] truncate max-w-[200px]">{p.shortDesc}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[hsl(0,0%,55%)] hidden md:table-cell">
                  {p.subcategoria?.categoria?.name ?? "—"} › {p.subcategoria?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => router.push(`/admin/productos/${p.id}`)} className="flex items-center gap-1 text-xs text-[hsl(20,60%,45%)] hover:underline">
                      <Pencil size={12} /> Editar
                    </button>
                    <button onClick={() => remove(p)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                      <Trash2 size={12} /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay productos que coincidan.
          </div>
        )}
      </div>
      {ToastComponent}
    </>
  )
}
