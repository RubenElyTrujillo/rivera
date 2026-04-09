import Link from "next/link";
import Image from "next/image";
import * as motion from "motion/react-client";
import { ArrowRight, Calendar } from "lucide-react";
import type { ISpaceProject, ISpaceCategory } from "@/domain/types";

interface FeaturedProjectsSectionProps {
  /** Hasta 4 proyectos destacados para mostrar en el home. */
  projects: ISpaceProject[];
  /** Categorías del sitio para resolver los slugs de los proyectos. */
  categories: ISpaceCategory[];
}

/**
 * Muestra hasta 4 proyectos recientes directamente en el home con un layout editorial:
 * el primer proyecto ocupa el ancho completo como imagen principal (hero),
 * y los restantes se distribuyen en una fila de hasta 3 columnas.
 */
const FeaturedProjectsSection = ({ projects, categories }: FeaturedProjectsSectionProps) => {
  if (!projects.length) return null;

  const featured = projects.slice(0, 4);
  const heroProject = featured[0];
  const supportingProjects = featured.slice(1);

  /** Resuelve el slug de la categoría de un proyecto para construir el enlace. */
  function getCategorySlug(categoryName: string): string {
    return (
      categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      )?.slug ?? ""
    );
  }

  const supportingCols =
    supportingProjects.length === 1
      ? "md:grid-cols-1"
      : supportingProjects.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-3";

  return (
    <section id="proyectos" className="py-24 md:py-36 px-8 md:px-20 bg-card">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16 md:mb-20"
      >
        <div>
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            NUESTRO TRABAJO
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Proyectos
            <br />
            recientes
          </h2>
        </div>
        <a
          href="#espacios"
          className="flex items-center gap-2 text-sm font-semibold tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos <ArrowRight size={14} />
        </a>
      </motion.div>

      {/* Proyecto hero — ancho completo */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="mb-px"
      >
        <ProjectCard
          project={heroProject}
          getCategorySlug={getCategorySlug}
          i={0}
          heroStyle
        />
      </motion.div>

      {/* Proyectos de soporte */}
      {supportingProjects.length > 0 && (
        <div className={`grid grid-cols-1 gap-px ${supportingCols}`}>
          {supportingProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i + 1) * 0.08 }}
            >
              <ProjectCard
                project={project}
                getCategorySlug={getCategorySlug}
                i={i + 1}
              />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

/** Tarjeta de proyecto con imagen, overlay y metadatos. */
function ProjectCard({
  project,
  getCategorySlug,
  i,
  heroStyle = false,
}: {
  project: ISpaceProject;
  getCategorySlug: (name: string) => string;
  i: number;
  heroStyle?: boolean;
}) {
  const slug = getCategorySlug(project.category);
  const href = slug ? `/espacios/${slug}` : "#espacios";
  const aspectClass = heroStyle ? "aspect-[16/7]" : "aspect-[4/3]";
  const titleClass = heroStyle ? "text-2xl md:text-4xl" : "text-xl";

  return (
    <Link
      href={href}
      className="group relative overflow-hidden block bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
    >
      <div className={`${aspectClass} overflow-hidden relative`}>
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={`${project.title} — Comercializadora Rivera`}
            fill
            sizes={
              heroStyle
                ? "100vw"
                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-foreground/20" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <span className="inline-block text-primary text-xs tracking-[0.2em] uppercase font-semibold mb-2 font-mono">
          {project.category}
        </span>
        <h3
          className={`text-white font-bold tracking-tight leading-tight ${titleClass}`}
        >
          {project.title}
        </h3>
        {project.completedAt && (
          <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(project.completedAt).getFullYear()}
          </p>
        )}
      </div>
    </Link>
  );
}

export default FeaturedProjectsSection;
