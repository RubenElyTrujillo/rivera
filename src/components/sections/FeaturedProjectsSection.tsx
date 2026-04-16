import Link from "next/link"
import * as motion from "motion/react-client"
import { ArrowRight, MapPin, Layers } from "lucide-react"
import type { IProyecto } from "@/domain/types/catalog-new"

interface Props { proyectos: IProyecto[] }

const FeaturedProjectsSection = ({ proyectos }: Props) => {
  if (!proyectos.length) return null
  const hero = proyectos[0]
  const rest = proyectos.slice(1, 3)

  return (
    <section id="proyectos" className="py-20 md:py-28 bg-[hsl(0,0%,97%)]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-xs font-bold tracking-[.2em] uppercase text-[hsl(20,60%,45%)] mb-2">Nuestro trabajo</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[hsl(0,0%,10%)] leading-tight">
              Proyectos<br />recientes
            </h2>
          </div>
          <Link href="/proyectos"
            className="inline-flex items-center gap-1.5 text-sm font-bold tracking-[.1em] uppercase text-[hsl(0,0%,45%)] hover:text-[hsl(20,60%,45%)] transition-colors">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Layout: hero card + 2 smaller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Hero card — spans 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="md:col-span-2"
          >
            <ProjectCard proyecto={hero} hero />
          </motion.div>

          {/* Side cards */}
          <div className="flex flex-col gap-5">
            {rest.map((p, i) => (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: (i + 1) * 0.1 }}
                className="flex-1"
              >
                <ProjectCard proyecto={p} />
              </motion.div>
            ))}
          </div>

        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center justify-between mt-8 pt-6 border-t border-[hsl(0,0%,90%)]"
        >
          <Link href="/proyectos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(20,60%,45%)] text-white rounded-xl text-sm font-bold hover:bg-[hsl(20,60%,38%)] transition-colors">
            Ver todos los proyectos →
          </Link>
          <span className="text-sm text-[hsl(0,0%,55%)]">
            ¿Quieres un proyecto así?{" "}
            <a href="https://wa.me/525629671869" target="_blank" rel="noopener noreferrer"
              className="text-[hsl(20,60%,45%)] font-bold hover:underline">Contáctanos</a>
          </span>
        </motion.div>
      </div>
    </section>
  )
}

function ProjectCard({ proyecto, hero = false }: { proyecto: IProyecto; hero?: boolean }) {
  return (
    <Link href={`/proyectos/${proyecto.slug}`}
      className="group relative block overflow-hidden rounded-2xl bg-[hsl(0,0%,90%)] shadow-sm hover:shadow-xl transition-shadow h-full">

      {/* Image */}
      <div className={`overflow-hidden ${hero ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        {proyecto.coverImage
          ? <img src={proyecto.coverImage} alt={proyecto.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> /* eslint-disable-line @next/next/no-img-element */
          : <div className="w-full h-full flex items-center justify-center text-5xl bg-[hsl(0,0%,88%)]">🏠</div>
        }
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Photo count badge */}
      {(proyecto.imagenes?.length ?? 0) > 0 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
          📷 {(proyecto.imagenes?.length ?? 0) + (proyecto.coverImage ? 1 : 0)} fotos
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {(proyecto.city || proyecto.colonia) && (
          <p className="flex items-center gap-1 text-white/70 text-[11px] font-semibold mb-1">
            <MapPin className="w-3 h-3" />{[proyecto.city, proyecto.colonia].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 className={`font-extrabold text-white leading-tight ${hero ? "text-xl md:text-2xl" : "text-base"}`}>
          {proyecto.title}
        </h3>
        {proyecto.ambientes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {proyecto.ambientes.slice(0, hero ? 4 : 2).map(a => (
              <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/20 backdrop-blur-sm">{a}</span>
            ))}
          </div>
        )}
        {(proyecto.subcategoria || proyecto.materialLabel) && (
          <p className="flex items-center gap-1 text-[hsl(20,70%,80%)] text-[11px] font-bold mt-2">
            <Layers className="w-3 h-3" />{proyecto.subcategoria?.name ?? proyecto.materialLabel}
          </p>
        )}
      </div>
    </Link>
  )
}

export default FeaturedProjectsSection
