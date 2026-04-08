import * as motion from "motion/react-client";
import { Layers, Wrench, Palette, Columns3, Zap, Hammer, Star, Home, Package, Shield } from 'lucide-react';
import type { IService } from "@/domain/types";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
    Layers, Wrench, Palette, Columns3, Zap, Hammer, Star, Home, Package, Shield,
};

const DEFAULT_SERVICES: IService[] = [
    { id: 1, icon: "Layers", title: "PISOS Y RECUBRIMIENTOS", subtitle: "Venta e instalación profesional", desc: "Madera sólida, ingeniería, laminados, vinílicos SPC y deck sintético para interiores y exteriores.", order: 0 },
    { id: 2, icon: "Wrench", title: "RESTAURACIÓN", subtitle: "Madera, granito, mármol y decks", desc: "Recuperamos la vida de sus superficies existentes. Pulido, lijado, barnizado y mantenimiento profesional.", order: 1 },
    { id: 3, icon: "Palette", title: "DECORACIÓN", subtitle: "Persianas, follaje y tapices", desc: "Soluciones decorativas que aportan confort, privacidad y naturaleza a sus espacios.", order: 2 },
    { id: 4, icon: "Columns3", title: "MOLDURAS Y ACABADOS", subtitle: "MDF y madera sólida", desc: "Fabricamos la moldura exacta que tu proyecto necesita. Personalización total en medidas y colores.", order: 3 },
    { id: 5, icon: "Zap", title: "TECNOLOGÍA Y CONFORT", subtitle: "Repisas y puertos ocultos", desc: "Integramos tecnología en tu mobiliario: multicontactos empotrados, consolas traseras y más.", order: 4 },
];

const ServicesSection = ({ services }: { services?: IService[] | null }) => {
    const list = services && services.length > 0 ? services : DEFAULT_SERVICES;

    return (
        <section id="servicios" className="py-24 md:py-36 px-8 md:px-20 bg-card">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-24"
            >
                <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                    NUESTROS SERVICIOS
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
                    Especialistas en
                    <br />
                    pisos y acabados
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
                {list.map((service, i) => {
                    const Icon = ICON_MAP[service.icon] ?? Layers;
                    return (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            className="bg-card p-8 md:p-12 group hover:bg-foreground transition-colors duration-500"
                        >
                            <Icon
                                size={28}
                                className="text-primary mb-6 group-hover:text-primary transition-colors"
                                strokeWidth={1.5}
                            />
                            <h3 className="text-xs tracking-[0.2em] font-bold text-foreground group-hover:text-background transition-colors mb-1">
                                {service.title}
                            </h3>
                            <p className="text-primary text-xs tracking-wider mb-4 font-medium">
                                {service.subtitle}
                            </p>
                            <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-background/60 transition-colors">
                                {service.desc}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default ServicesSection;