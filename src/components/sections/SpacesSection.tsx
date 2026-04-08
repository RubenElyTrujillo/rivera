import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { ArrowRight } from 'lucide-react';
import type { ISpaceCategory } from "@/domain/types";

interface SpacesSectionProps {
  categories?: ISpaceCategory[] | null;
}

const DEFAULT_CATEGORIES: ISpaceCategory[] = [
  { id: 1, name: 'Residencial', slug: 'residencial', coverImage: '', order: 0 },
  { id: 2, name: 'Comercial',   slug: 'comercial',   coverImage: '', order: 1 },
  { id: 3, name: 'Exterior',    slug: 'exterior',    coverImage: '', order: 2 },
];

const SpacesSection = ({ categories }: SpacesSectionProps) => {
  const list = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section id="espacios" className="py-24 md:py-36 bg-card">
      <div className="px-8 md:px-20 mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            GALERÍA DE ESPACIOS
          </p>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
            Nuestro trabajo
          </h2>
        </motion.div>
      </div>

      {/* Grid de categorías */}
      <div
        ref={scrollRef}
        className="px-8 md:px-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {list.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link
              href={`/espacios/${cat.slug}`}
              className="group relative aspect-[4/3] overflow-hidden bg-foreground/10 block"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {cat.coverImage ? (
                  <Image
                    src={cat.coverImage}
                    alt={`Proyectos ${cat.name} — Comercializadora Rivera`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-foreground/20" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <h3 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                    {cat.name}
                  </h3>
                  <span className="flex items-center gap-1 text-white/70 text-xs font-semibold tracking-widest uppercase group-hover:text-white transition-colors">
                    Ver <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SpacesSection;

