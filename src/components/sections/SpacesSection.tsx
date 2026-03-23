import { useState } from 'react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

const filters = ['Todos', 'Residencial', 'Comercial', 'Exterior'];

const SpacesSection = ({ images }: { images: any }) => {
    const [activeFilter, setActiveFilter] = useState('Todos');

    const spaces = [
        { title: 'Pisos de Ingeniería', category: 'Residencial', image: images.wallCladding },
        { title: 'Deck Exterior', category: 'Exterior', image: images.deck },
        { title: 'Restauración', category: 'Comercial', image: images.restoration },
        { title: 'Persianas y Cortinas', category: 'Residencial', image: images.blinds },
    ];

    const filtered = activeFilter === 'Todos'
        ? spaces
        : spaces.filter((s) => s.category === activeFilter);

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
                {filters.map((filter) => (
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
                            key={space.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="group relative aspect-[4/3] overflow-hidden bg-muted"
                        >
                            <img
                                src={space.image}
                                alt={`${space.title} — proyecto de acabados interiores por Comercializadora Rivera`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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