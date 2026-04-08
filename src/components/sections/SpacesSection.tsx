import { useState } from 'react';
import Image from 'next/image';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import type { ISpaceProject } from "@/domain/types";

const FILTERS = ['Todos', 'Residencial', 'Comercial', 'Exterior'];

type SpacesImages = {
    wallCladding: string;
    deck: string;
    restoration: string;
    blinds: string;
};

interface SpacesSectionProps {
    images: SpacesImages;
    spaces?: ISpaceProject[] | null;
}

const SpacesSection = ({ images, spaces }: SpacesSectionProps) => {
    const [activeFilter, setActiveFilter] = useState('Todos');

    const defaultSpaces: ISpaceProject[] = [
        { id: 1, title: 'Pisos de Ingeniería', category: 'Residencial', imageUrl: images.wallCladding, order: 0 },
        { id: 2, title: 'Deck Exterior', category: 'Exterior', imageUrl: images.deck, order: 1 },
        { id: 3, title: 'Restauración', category: 'Comercial', imageUrl: images.restoration, order: 2 },
        { id: 4, title: 'Persianas y Cortinas', category: 'Residencial', imageUrl: images.blinds, order: 3 },
    ];

    const list = spaces && spaces.length > 0 ? spaces : defaultSpaces;
    const allCategories = ['Todos', ...Array.from(new Set(list.map((s) => s.category)))];

    const filtered = activeFilter === 'Todos'
        ? list
        : list.filter((s) => s.category === activeFilter);

    return (
        <section id="espacios" className="py-24 md:py-36 px-8 md:px-20 bg-card">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-12 md:mb-16"
            >
                <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                    GALERÍA DE ESPACIOS
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                    Nuestro trabajo
                </h2>
            </motion.div>

            {/* Filters */}
            <div className="flex gap-6 mb-12 overflow-x-auto hide-scrollbar">
                {allCategories.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`text-xs tracking-[0.2em] uppercase font-semibold pb-2 border-b-2 transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'border-primary text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <AnimatePresence mode="wait">
                    {filtered.map((space, i) => (
                        <motion.div
                            key={space.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative aspect-4/3 overflow-hidden bg-muted"
                        >
                            <Image
                                src={space.imageUrl}
                                alt={`${space.title} — proyecto de acabados interiores por Comercializadora Rivera`}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                                <p className="text-white/50 text-xs tracking-[0.2em] uppercase mb-1">
                                    {space.category}
                                </p>
                                <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight">
                                    {space.title}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}

export default SpacesSection;