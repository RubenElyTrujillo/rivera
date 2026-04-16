import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { MapPin, Layers } from "lucide-react"
import { proyectoRepository } from "@/repositories/proyecto.repository"
import type { IProyecto } from "@/domain/types/catalog-new"
import { useState } from "react"

interface Props { proyectos: IProyecto[] }

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const proyectos = await proyectoRepository.findAll()
  const visible = proyectos.filter(p => p.visible)
  return { props: { proyectos: JSON.parse(JSON.stringify(visible)) as IProyecto[] } }
}

export default function ProyectosPage({ proyectos }: Props) {
  const allAmbientes = Array.from(new Set(proyectos.flatMap(p => p.ambientes))).sort()
  const [filter, setFilter] = useState<string | null>(null)
  const filtered = filter ? proyectos.filter(p => p.ambientes.includes(filter)) : proyectos

  return (
    <>
      <Head><title>Proyectos Recientes · Comercializadora Rivera</title></Head>
      <main className="min-h-screen bg-[hsl(0,0%,97%)]">
        <div className="bg-[hsl(20,60%,45%)] text-white py-16 px-6 text-center">
          <p className="text-sm font-bold tracking-[.2em] uppercase text-[hsl(20,60%,85%)] mb-3">Portafolio</p>
          <h1 className="text-4xl md:text-5xl font-extrabold">Proyectos Recientes</h1>
          <p className="mt-4 text-[hsl(20,60%,88%)] max-w-lg mx-auto">Instalaciones realizadas con materiales de nuestro catálogo</p>
          <div className="mt-3 text-sm text-[hsl(20,60%,82%)] font-semibold">{proyectos.length} proyectos · CDMX y Edo. Méx.</div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {allAmbientes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              <button onClick={() => setFilter(null)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${filter === null ? "bg-[hsl(20,60%,45%)] text-white border-[hsl(20,60%,45%)]" : "bg-white text-[hsl(0,0%,40%)] border-[hsl(0,0%,82%)] hover:border-[hsl(20,60%,45%)]"}`}>Todos</button>
              {allAmbientes.map(a => (
                <button key={a} onClick={() => setFilter(filter === a ? null : a)} className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${filter === a ? "bg-[hsl(20,60%,45%)] text-white border-[hsl(20,60%,45%)]" : "bg-white text-[hsl(0,0%,40%)] border-[hsl(0,0%,82%)] hover:border-[hsl(20,60%,45%)]"}`}>{a}</button>
              ))}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-[hsl(0,0%,55%)]"><div className="text-4xl mb-3">��</div><p>Sin proyectos con ese filtro</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => (
                <Link key={p.id} href={`/proyectos/${p.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[hsl(0,0%,90%)]">
                  <div className="aspect-video overflow-hidden bg-[hsl(0,0%,93%)]">
                    {p.coverImage
                      ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> /* eslint-disable-line @next/next/no-img-element */
                      : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
                  </div>
                  <div className="p-5">
                    <h2 className="font-bold text-[hsl(0,0%,12%)]">{p.title}</h2>
                    {(p.city || p.colonia) && (
                      <p className="text-xs text-[hsl(0,0%,55%)] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />{[p.city, p.colonia].filter(Boolean).join(" · ")}{p.area ? ` · ${p.area} m²` : ""}
                      </p>
                    )}
                    {p.ambientes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.ambientes.map(a => <span key={a} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[hsl(20,60%,95%)] text-[hsl(20,60%,40%)]">{a}</span>)}
                      </div>
                    )}
                    {(p.subcategoria || p.materialLabel) && (
                      <p className="text-xs text-[hsl(20,60%,45%)] flex items-center gap-1 mt-3 font-semibold">
                        <Layers className="w-3 h-3" />{p.subcategoria?.name ?? p.materialLabel}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
