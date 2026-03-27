import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { MATERIALS_DATA } from '@/lib/materialsData';
import type { IMaterialsData } from '@/interfaces/materialsData';

type Finish = IMaterialsData['finishes'][number];

interface Props {
    material: IMaterialsData;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const slug = params?.id as string;
    const material = MATERIALS_DATA.find((m) => m.id === slug);
    if (!material) return { notFound: true };
    return { props: { material } };
};

export default function MaterialGallery({ material }: Props) {
    const [selectedFinish, setSelectedFinish] = useState<Finish | null>(null);
    const [activeCollection, setActiveCollection] = useState('Todos');

    const collections = ['Todos', ...Array.from(new Set(material.finishes.map((f) => f.collection).filter(Boolean)))];
    const filtered = activeCollection === 'Todos'
        ? material.finishes
        : material.finishes.filter((f) => f.collection === activeCollection);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
                <div className="px-6 md:px-16 py-5 flex items-center justify-between">
                    <Link
                        href="/#materiales"
                        className="flex items-center gap-2 text-sm font-semibold tracking-wider text-foreground/50 hover:text-foreground transition-colors"
                    >
                        <ArrowLeft size={16} />
                        VOLVER
                    </Link>
                    <div className="text-center">
                        <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold">GALERÍA</p>
                        <h1 className="text-sm md:text-base font-bold tracking-tight">{material.name}</h1>
                    </div>
                    <div className="w-16" />
                </div>
            </div>

            {/* Hero strip */}
            <div className="relative h-40 md:h-56 overflow-hidden bg-foreground">
                {material.coverImage && (
                    <Image
                        src={material.coverImage}
                        alt={`Textura de ${material.name} — Comercializadora Rivera`}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-foreground/60" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <p className="text-background/50 text-xs tracking-[0.3em] uppercase mb-2">
                        {material.finishes.length} acabados disponibles
                    </p>
                    <h2 className="text-background text-2xl md:text-4xl font-bold tracking-tight">{material.name}</h2>
                    <p className="text-background/60 text-xs tracking-widest mt-2 font-mono">{material.spec}</p>
                </div>
            </div>

            {/* Collection filter */}
            {collections.length > 1 && (
                <div className="px-6 md:px-16 py-8 border-b border-foreground/10 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6">
                        {collections.map((col) => (
                            <button
                                key={col}
                                onClick={() => setActiveCollection(col)}
                                className={`text-xs tracking-[0.2em] uppercase font-semibold pb-2 border-b-2 transition-all whitespace-nowrap ${activeCollection === col
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-foreground/40 hover:text-foreground'
                                    }`}
                            >
                                {col}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="px-6 md:px-16 py-12">
                {filtered.length === 0 ? (
                    <p className="text-foreground/40 text-sm text-center py-20">
                        Aún no hay acabados registrados para este material.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((finish, i) => (
                                <motion.button
                                    key={finish.code}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.35, delay: i * 0.04 }}
                                    onClick={() => setSelectedFinish(finish)}
                                    className="group text-left"
                                >
                                    <div className="aspect-square overflow-hidden bg-foreground/5 mb-3 relative">
                                        {finish.image && (
                                            <Image
                                                src={finish.image}
                                                alt={`Acabado ${finish.name} — ${finish.code}`}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs font-bold tracking-tight leading-tight group-hover:text-primary transition-colors">
                                        {finish.name}
                                    </p>
                                    <p className="text-xs text-foreground/40 tracking-wider mt-0.5 font-mono">
                                        {finish.code}
                                    </p>
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedFinish && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-6"
                        onClick={() => setSelectedFinish(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-background max-w-lg w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                                {selectedFinish.image && (
                                    <Image
                                        src={selectedFinish.image}
                                        alt={selectedFinish.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <button
                                    onClick={() => setSelectedFinish(null)}
                                    className="absolute top-4 right-4 bg-foreground/80 text-background p-2 hover:bg-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-8">
                                {selectedFinish.collection && (
                                    <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold mb-1">
                                        {selectedFinish.collection}
                                    </p>
                                )}
                                <h3 className="text-xl font-bold tracking-tight mb-4">{selectedFinish.name}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-xs text-foreground/40 tracking-widest uppercase mb-1">Código</p>
                                        <p className="text-sm font-mono font-semibold">{selectedFinish.code}</p>
                                    </div>
                                    {selectedFinish.dims && (
                                        <div>
                                            <p className="text-xs text-foreground/40 tracking-widest uppercase mb-1">Dimensiones</p>
                                            <p className="text-sm font-mono font-semibold">{selectedFinish.dims}</p>
                                        </div>
                                    )}
                                </div>
                                <a
                                    href="https://wa.me/525629671869"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center bg-foreground text-background py-4 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors"
                                >
                                    COTIZAR ESTE ACABADO
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}