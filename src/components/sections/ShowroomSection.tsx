import { useRouter } from "next/router";
import * as motion from "motion/react-client";
import { ArrowRight } from 'lucide-react';
import type { IMaterial } from "@/domain/types";

interface ShowroomSectionProps {
  materials?: IMaterial[] | null;
}

const ShowroomSection = ({ materials }: ShowroomSectionProps) => {
    const router = useRouter();
    const list = materials && materials.length > 0 ? materials : [];

    if (list.length === 0) return null;

    return (
        <section id="showroom" className="py-24 md:py-36 px-8 md:px-20 bg-foreground">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-20"
            >
                <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                    SHOWROOM DIGITAL
                </p>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-background leading-tight">
                        Explora los
                        <br />
                        materiales
                    </h2>
                    <p className="text-background/40 text-sm max-w-xs leading-relaxed">
                        Selecciona un material para ver todos los acabados, colores y fichas técnicas disponibles.
                    </p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((material, i) => (
                    <motion.button
                        key={material.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        onClick={() => router.push(`/materiales/${material.id}`)}
                        className="group relative overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden">
                            <img
                                src={material.coverImage}
                                alt={`${material.name} — catálogo de acabados Comercializadora Rivera`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-white/40 text-xs tracking-widest uppercase mb-1 font-mono">
                                        {material.finishes.length} acabados
                                    </p>
                                    <h3 className="text-white text-lg md:text-xl font-bold tracking-tight leading-tight">
                                        {material.name}
                                    </h3>
                                    <p className="text-white/50 text-xs mt-2 leading-relaxed max-w-[200px] hidden md:block">
                                        {material.desc}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0 ml-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <ArrowRight size={16} className="text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </section>
    )
}

export default ShowroomSection;