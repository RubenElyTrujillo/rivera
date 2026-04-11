import { useRef } from 'react';
import Link from 'next/link';
import * as motion from 'motion/react-client';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import type { IMaterial } from "@/domain/types";

const DEFAULT_MATERIALS: IMaterial[] = [
    { id: 0, slug: '', name: 'MADERA DE INGENIERÍA', subtitle: '7 colecciones únicas', desc: 'Piso natural pre-acabado con vetas y tonos irrepetibles. Colecciones: Loft Life, Bamboo, Les Terres, Vitare, Loft Mate, True Toro y Utopia.', spec: 'APLICACIÓN: RESIDENCIAL', coverImage: '', collections: [], finishes: [], order: 0, categoryId: null },
    { id: 0, slug: '', name: 'LAMINADOS', subtitle: '4 colecciones', desc: 'Fibras de madera con resinas de alta resistencia. Ambiente cálido y moderno. Colecciones: Splash, Clásico, Select y Vintage.', spec: 'ABRASIÓN: AC3–AC4', coverImage: '', collections: [], finishes: [], order: 1, categoryId: null },
    { id: 0, slug: '', name: 'VINÍLICOS SPC', subtitle: 'WPC · LVT · SPC', desc: 'Recubrimiento de PVC de última generación. Bajo costo, alta resistencia a impactos y abrasión. Fácil instalación con sistema clic.', spec: 'RESISTENCIA: AGUA', coverImage: '', collections: [], finishes: [], order: 2, categoryId: null },
    { id: 0, slug: '', name: 'DECK SINTÉTICO', subtitle: 'Residencial y comercial', desc: 'Compuesto de madera y plástico (WPC) para exteriores. Alta durabilidad, poco mantenimiento, diseño tipo tablón natural.', spec: 'USO: EXTERIOR', coverImage: '', collections: [], finishes: [], order: 3, categoryId: null },
    { id: 0, slug: '', name: 'LAMBRINES', subtitle: 'PVC y madera natural', desc: 'Textura, volumen y confort acústico para el plano vertical. Madera auténtica o PVC de cero mantenimiento.', spec: 'TIPO: VERTICAL', coverImage: '', collections: [], finishes: [], order: 4, categoryId: null },
    { id: 0, slug: '', name: 'MUROS FORRADOS', subtitle: 'Continuidad visual', desc: 'El mismo material del piso sube al muro. Integración total para espacios más amplios y cohesivos.', spec: 'EFECTO: MONOLÍTICO', coverImage: '', collections: [], finishes: [], order: 5, categoryId: null },
];

const MaterialLabSection = ({ textureImage, materials }: { textureImage: string; materials?: IMaterial[] | null }) => {
    const list = materials && materials.length > 0 ? materials : DEFAULT_MATERIALS;
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: string) => {
        if (!scrollRef.current) return;
        const amount = direction === 'left' ? -400 : 400;
        scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    return (
        <section id="materiales" className="py-24 md:py-36 bg-background">
            {/* Header */}
            <div className="px-8 md:px-20 mb-12 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
                >
                    <div>
                        <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                            LABORATORIO DE MATERIALES
                        </p>
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                            Pisos y acabados
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => scroll('left')}
                            className="w-12 h-12 border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-12 h-12 border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Horizontal scroll */}
            <div
                ref={scrollRef}
                className="flex gap-px overflow-x-auto hide-scrollbar pl-8 md:pl-20"
            >
                {list.map((mat, i) => (
                    <motion.div
                        key={mat.id || `placeholder-${i}`}
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        className="flex-shrink-0 w-80 md:w-96 bg-foreground text-background p-8 md:p-10 flex flex-col justify-between min-h-[24rem]"
                    >
                        <div>
                            <p className="text-xs tracking-[0.2em] text-primary font-bold mb-1">
                                {String(i + 1).padStart(2, '0')}
                            </p>
                            <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2 leading-tight">
                                {mat.name}
                            </h3>
                            <p className="text-background/50 text-xs tracking-wider uppercase mb-6">
                                {mat.subtitle}
                            </p>
                            <p className="text-background/70 text-sm leading-relaxed">
                                {mat.desc}
                            </p>
                        </div>
                        <div className="mt-8 pt-6 border-t border-background/10 flex items-center justify-between">
                            <p className="text-xs tracking-[0.2em] text-background/40 font-mono">
                                {mat.spec}
                            </p>
                            {mat.id > 0 && (
                                <Link
                                    href={`/materiales/${mat.id}`}
                                    className="text-xs font-semibold tracking-[0.15em] uppercase text-primary hover:text-background transition-colors flex items-center gap-1"
                                >
                                    Ver acabados <ArrowRight size={12} />
                                </Link>
                            )}
                        </div>
                    </motion.div>
                ))}
                {/* Spacer */}
                <div className="flex-shrink-0 w-8 md:w-20" />
            </div>
        </section>
    );
}

export default MaterialLabSection;
