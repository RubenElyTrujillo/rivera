import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { spaceRepository } from '@/repositories/space.repository';
import type { ISpaceProject, ISpaceProjectImage } from '@/domain/types';

interface Props {
  project: ISpaceProject;
  siteUrl: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const id = parseInt(params?.id as string, 10);
  if (isNaN(id)) return { notFound: true };

  const project = await spaceRepository.findById(id);
  if (!project) return { notFound: true };

  return {
    props: {
      project,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '',
    },
  };
};

/** Cabecera sticky con botón de retroceso. */
function ProjectHeader({ title, category }: { title: string; category: string }) {
  return (
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
          <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold">{category}</p>
          <h1 className="text-sm md:text-base font-bold tracking-tight">{title}</h1>
        </div>
        <div className="w-16" />
      </div>
    </div>
  );
}

/** Lightbox para ver la imagen a pantalla completa con navegación. */
function Lightbox({
  images,
  index,
  onClose,
}: {
  images: ISpaceProjectImage[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={images[current].url}
            alt={images[current].caption || `Imagen ${current + 1}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Controles */}
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute top-4 right-4 bg-foreground/80 text-background p-2 hover:bg-foreground transition-colors"
        >
          <X size={16} />
        </button>
        {images.length > 1 && (
          <>
            <button
              aria-label="Anterior"
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-foreground/80 text-background p-2 hover:bg-foreground transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Siguiente"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-foreground/80 text-background p-2 hover:bg-foreground transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {images[current].caption && (
          <p className="text-center text-background/70 text-sm mt-4 px-8">
            {images[current].caption}
          </p>
        )}
        <p className="text-center text-background/40 text-xs mt-2">
          {current + 1} / {images.length}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function SpaceProjectDetail({ project, siteUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages: ISpaceProjectImage[] = [
    { id: 0, spaceProjectId: project.id, url: project.imageUrl, caption: project.title, order: -1 },
    ...(project.images ?? []),
  ].filter((img) => img.url);

  const pageUrl = siteUrl ? `${siteUrl}/espacios/proyecto/${project.id}` : undefined;
  const seoTitle = `${project.title} — ${project.category} | Comercializadora Rivera`;
  const seoDescription = project.description
    ? `${project.description.slice(0, 155)}…`
    : `Proyecto de ${project.category.toLowerCase()}: ${project.title}. Instalación profesional de pisos y acabados en CDMX.`;

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {allImages[0] && <meta property="og:image" content={siteUrl + allImages[0].url} />}
        {pageUrl && <meta property="og:url" content={pageUrl} />}
        {pageUrl && <link rel="canonical" href={pageUrl} />}
      </Head>

      <div className="min-h-screen bg-background">
        <ProjectHeader title={project.title} category={project.category} />

        {/* Hero */}
        <div className="relative h-56 md:h-80 overflow-hidden bg-foreground">
          {project.imageUrl && (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <p className="text-background/50 text-xs tracking-[0.3em] uppercase mb-2">
              {project.category}
            </p>
            <h2 className="text-background text-3xl md:text-5xl font-bold tracking-tight">
              {project.title}
            </h2>
          </div>
        </div>

        <div className="px-6 md:px-16 py-12 max-w-6xl mx-auto">
          {/* Descripción */}
          {project.description && (
            <div className="mb-12 max-w-2xl">
              <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold mb-4">
                SOBRE ESTE PROYECTO
              </p>
              <p className="text-foreground/70 leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          {/* Galería */}
          {allImages.length > 1 && (
            <>
              <p className="text-xs text-foreground/40 tracking-[0.2em] uppercase font-semibold mb-6">
                GALERÍA — {allImages.length} FOTOS
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allImages.map((img, i) => (
                  <motion.button
                    key={img.id !== undefined ? img.id : `img-${i}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative aspect-square overflow-hidden bg-foreground/5"
                  >
                    <Image
                      src={img.url}
                      alt={img.caption || `Imagen ${i + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.button>
                ))}
              </div>
            </>
          )}

          {/* CTA */}
          <div className="mt-16 pt-12 border-t border-foreground/10 text-center">
            <p className="text-foreground/50 text-sm mb-6">
              ¿Te gustó este proyecto? Agenda una consulta sin costo.
            </p>
            <a
              href="https://wa.me/525629671869"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-foreground text-background px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors"
            >
              COTIZAR MI PROYECTO
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={allImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
