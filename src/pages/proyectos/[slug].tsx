import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { useState } from "react"
import { MapPin, Layers, ArrowLeft, X } from "lucide-react"
import { proyectoRepository } from "@/repositories/proyecto.repository"
import type { IProyecto } from "@/domain/types/catalog-new"

interface Props { proyecto: IProyecto }

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = params?.slug as string
  const proyecto = await proyectoRepository.findBySlug(slug)
  if (!proyecto || !proyecto.visible) return { notFound: true }
  return { props: { proyecto: JSON.parse(JSON.stringify(proyecto)) as IProyecto } }
}

export default function ProyectoDetailPage({ proyecto }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const allImages = [
    ...(proyecto.coverImage ? [{ url: proyecto.coverImage, caption: proyecto.title }] : []),
    ...(proyecto.imagenes ?? []),
  ]

  return (
    <>
      <Head><title>{proyecto.title} · Proyectos Rivera</title></Head>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={allImages[lightbox]?.url} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          {allImages.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {allImages.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === lightbox ? "bg-white scale-125" : "bg-white/40"}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <main className="min-h-screen bg-[hsl(0,0%,97%)]">
        {/* Hero */}
        <div className="relative h-72 md:h-[440px] bg-[hsl(0,0%,20%)] overflow-hidden">
          {proyecto.coverImage && (
            <img src={proyecto.coverImage} alt={proyecto.title} className="w-full h-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <Link href="/proyectos" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Todos los proyectos
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">{proyecto.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {(proyecto.city || proyecto.colonia) && (
                <span className="flex items-center gap-1.5 text-white/80 text-sm">
                  <MapPin className="w-4 h-4" />{[proyecto.city, proyecto.colonia].filter(Boolean).join(" · ")}
                </span>
              )}
              {proyecto.area && <span className="text-white/80 text-sm">{proyecto.area} m²</span>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Left: gallery + description */}
          <div className="md:col-span-2 space-y-8">
            {proyecto.description && (
              <p className="text-[hsl(0,0%,35%)] text-base leading-relaxed">{proyecto.description}</p>
            )}

            {/* Gallery grid */}
            {allImages.length > 0 && (
              <div>
                <h2 className="text-sm font-bold tracking-[.12em] uppercase text-[hsl(0,0%,50%)] mb-4">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setLightbox(i)}
                      className="aspect-square rounded-xl overflow-hidden group relative bg-[hsl(0,0%,90%)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {proyecto.htmlContent && (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: proyecto.htmlContent }} />
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">
            {proyecto.ambientes.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(0,0%,90%)]">
                <h3 className="text-xs font-bold tracking-[.12em] uppercase text-[hsl(0,0%,50%)] mb-3">Ambientes</h3>
                <div className="flex flex-wrap gap-2">
                  {proyecto.ambientes.map(a => (
                    <span key={a} className="px-3 py-1 rounded-full text-xs font-bold bg-[hsl(20,60%,95%)] text-[hsl(20,60%,40%)]">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {(proyecto.subcategoria || proyecto.materialLabel) && (
              <div className="bg-white rounded-2xl p-5 border border-[hsl(0,0%,90%)]">
                <h3 className="text-xs font-bold tracking-[.12em] uppercase text-[hsl(0,0%,50%)] mb-3">Material usado</h3>
                <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)]">
                  <Layers className="w-4 h-4" />
                  {proyecto.subcategoria?.name ?? proyecto.materialLabel}
                </div>
                {proyecto.subcategoria && (
                  <Link href={`/${proyecto.subcategoria.slug}`}
                    className="mt-3 block text-center text-xs font-bold px-4 py-2 bg-[hsl(20,60%,45%)] text-white rounded-xl hover:bg-[hsl(20,60%,38%)] transition-colors">
                    Ver en el catálogo →
                  </Link>
                )}
              </div>
            )}

            <div className="bg-[hsl(20,60%,45%)] rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">¿Te interesa este tipo de proyecto?</p>
              <p className="text-[hsl(20,60%,88%)] text-xs mb-4">Cuéntanos tu idea y te damos presupuesto</p>
              <a href={`https://wa.me/525629671869?text=${encodeURIComponent(`Hola, vi el proyecto "${proyecto.title}" y me interesa algo similar.`)}`}
                target="_blank" rel="noopener noreferrer"
                className="block text-center text-sm font-bold bg-white text-[hsl(20,60%,45%)] rounded-xl py-2 hover:bg-[hsl(20,60%,95%)] transition-colors">
                📱 Escribir por WhatsApp
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
