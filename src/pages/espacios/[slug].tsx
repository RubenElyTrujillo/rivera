import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import * as motion from 'motion/react-client';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { spaceCategoryRepository } from '@/repositories/spaceCategory.repository';
import { spaceRepository } from '@/repositories/space.repository';
import { ProjectModal } from '@/components/ui/ProjectModal';
import type { ISpaceCategory, ISpaceProject } from '@/domain/types';

interface Props {
  category: ISpaceCategory;
  projects: ISpaceProject[];
  siteUrl: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;

  const category = await spaceCategoryRepository.findBySlug(slug);
  if (!category) return { notFound: true };

  const projects = await spaceRepository.findByCategory(category.name);

  return {
    props: {
      category,
      projects,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    },
  };
};

/** Formatea una fecha ISO a texto legible en español. */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long' }).format(new Date(iso));
}

export default function SpaceCategoryPage({ category, projects, siteUrl }: Props) {
  const [selectedProject, setSelectedProject] = useState<ISpaceProject | null>(null);

  const pageUrl = siteUrl ? `${siteUrl}/espacios/${category.slug}` : undefined;
  const seoTitle = `Proyectos ${category.name} — Espacios | Comercializadora Rivera`;
  const seoDescription = `Explora nuestros proyectos de ${category.name.toLowerCase()} en pisos y acabados. ${projects.length} trabajos realizados en CDMX.`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {category.coverImage && <meta property="og:image" content={siteUrl + category.coverImage} />}
        {pageUrl && <meta property="og:url" content={pageUrl} />}
        {pageUrl && <link rel="canonical" href={pageUrl} />}
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
          <div className="px-6 md:px-16 py-5 flex items-center justify-between">
            <Link
              href="/#espacios"
              className="flex items-center gap-2 text-sm font-semibold tracking-wider text-foreground/50 hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              VOLVER
            </Link>
            <div className="text-center">
              <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold">GALERÍA</p>
              <h1 className="text-sm md:text-base font-bold tracking-tight">{category.name}</h1>
            </div>
            <div className="w-16" />
          </div>
        </div>

        {/* Hero */}
        <div className="relative h-48 md:h-72 overflow-hidden bg-foreground">
          {category.coverImage && (
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <p className="text-background/50 text-xs tracking-[0.3em] uppercase mb-2">
              {projects.length} {projects.length === 1 ? 'proyecto' : 'proyectos'}
            </p>
            <h2 className="text-background text-3xl md:text-5xl font-bold tracking-tight">
              {category.name}
            </h2>
          </div>
        </div>

        {/* Grid de proyectos */}
        <div className="px-6 md:px-16 py-12">
          {projects.length === 0 ? (
            <p className="text-foreground/40 text-sm text-center py-20">
              Aún no hay proyectos en esta categoría.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="group w-full text-left bg-card border border-foreground/8 hover:border-foreground/20 transition-colors overflow-hidden cursor-pointer"
                  >
                    {/* Imagen */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                      {project.imageUrl ? (
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-foreground/10" />
                      )}
                      {/* Overlay hint */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold tracking-widest uppercase bg-black/50 px-3 py-1.5">
                          VER GALERÍA
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-foreground/55 text-sm leading-relaxed line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      )}
                      {project.completedAt && (
                        <span className="flex items-center gap-1.5 text-xs text-foreground/40 font-mono">
                          <CalendarDays size={11} />
                          {formatDate(project.completedAt)}
                        </span>
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de proyecto */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
