'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { X, ChevronLeft, ChevronRight, CalendarDays, Tag } from 'lucide-react';
import type { ISpaceProject, ISpaceProjectImage } from '@/domain/types';

interface ProjectModalProps {
  project: ISpaceProject | null;
  onClose: () => void;
}

/** Formatea una fecha ISO a texto legible en español. */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long' }).format(new Date(iso));
}

/**
 * Modal estilo visor de Facebook: galería de imágenes a la izquierda,
 * información del proyecto a la derecha.
 * Soporta navegación con teclado (← → Escape) y cierre al hacer clic en el fondo.
 */
export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [imageIndex, setImageIndex] = useState(0);

  const allImages: ISpaceProjectImage[] = project
    ? [
        { id: -1, spaceProjectId: project.id, url: project.imageUrl, caption: project.title, order: -1 },
        ...(project.images ?? []),
      ].filter((img) => Boolean(img.url))
    : [];

  const hasPrev = imageIndex > 0;
  const hasNext = imageIndex < allImages.length - 1;

  const prev = useCallback(() => {
    if (hasPrev) setImageIndex((i) => i - 1);
  }, [hasPrev]);

  const next = useCallback(() => {
    if (hasNext) setImageIndex((i) => i + 1);
  }, [hasNext]);

  // Reset image index when project changes
  useEffect(() => {
    setImageIndex(0);
  }, [project?.id]);

  // Keyboard navigation
  useEffect(() => {
    if (!project) return;

    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [project, onClose, prev, next]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [project]);

  const currentImage = allImages[imageIndex];

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 md:p-0"
          onClick={onClose}
        >
          {/* Panel */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-6xl max-h-[92vh] bg-background flex flex-col md:flex-row overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT: Image viewer ── */}
            <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center md:max-h-[92vh]">
              {/* Image */}
              <div className="relative w-full h-64 md:h-full md:min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage?.url ?? 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0"
                  >
                    {currentImage?.url ? (
                      <Image
                        src={currentImage.url}
                        alt={currentImage.caption ?? project.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 60vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-foreground/10" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev button */}
              {hasPrev && (
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white transition-colors"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Next button */}
              {hasNext && (
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/80 text-white transition-colors"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={22} />
                </button>
              )}

              {/* Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imageIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/70'}`}
                      aria-label={`Ir a imagen ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Caption */}
              {currentImage?.caption && currentImage.caption !== project.title && (
                <p className="absolute bottom-8 left-0 right-0 text-center text-white/60 text-xs px-6">
                  {currentImage.caption}
                </p>
              )}
            </div>

            {/* ── RIGHT: Info panel ── */}
            <div className="w-full md:w-80 lg:w-96 flex flex-col bg-background overflow-y-auto max-h-64 md:max-h-[92vh]">
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-foreground/10">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold mb-1.5">
                    {project.category}
                  </p>
                  <h2 className="text-foreground font-bold text-lg leading-tight">
                    {project.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-foreground/8 transition-colors flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X size={18} className="text-foreground/60" />
                </button>
              </div>

              {/* Meta */}
              <div className="px-6 py-4 flex flex-wrap gap-3 border-b border-foreground/10">
                <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                  <Tag size={11} />
                  {project.category}
                </span>
                {project.completedAt && (
                  <span className="flex items-center gap-1.5 text-xs text-foreground/50">
                    <CalendarDays size={11} />
                    {formatDate(project.completedAt)}
                  </span>
                )}
                {allImages.length > 1 && (
                  <span className="text-xs text-foreground/40 font-mono">
                    {imageIndex + 1} / {allImages.length}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="px-6 py-5 flex-1">
                {project.description ? (
                  <p className="text-foreground/65 text-sm leading-relaxed">
                    {project.description}
                  </p>
                ) : (
                  <p className="text-foreground/30 text-sm italic">
                    Sin descripción disponible.
                  </p>
                )}
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="px-6 pb-6">
                  <p className="text-xs text-foreground/30 tracking-widest uppercase mb-3">Fotos</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setImageIndex(i)}
                        className={`relative flex-shrink-0 w-14 h-14 overflow-hidden transition-all ${
                          i === imageIndex
                            ? 'ring-2 ring-primary ring-offset-1 ring-offset-background'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        {img.url && (
                          <Image
                            src={img.url}
                            alt={img.caption ?? `Foto ${i + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
