import * as motion from "motion/react-client";
import { Layers, Wrench, Palette, Columns3, Zap, Hammer, Star, Home, Package, Shield } from "lucide-react";
import type { IService } from "@/domain/types";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
  Layers, Wrench, Palette, Columns3, Zap, Hammer, Star, Home, Package, Shield,
};

const DEFAULT_SERVICES: IService[] = [
  { id: 1, icon: "Layers", title: "PISOS Y RECUBRIMIENTOS", subtitle: "Venta e instalación profesional", desc: "Madera sólida, ingeniería, laminados, vinílicos SPC y deck sintético para interiores y exteriores.", order: 0 },
  { id: 2, icon: "Wrench", title: "RESTAURACIÓN", subtitle: "Madera, granito, mármol y decks", desc: "Recuperamos la vida de sus superficies existentes. Pulido, lijado, barnizado y mantenimiento profesional.", order: 1 },
  { id: 3, icon: "Palette", title: "DECORACIÓN", subtitle: "Persianas, follaje y tapices", desc: "Soluciones decorativas que aportan confort, privacidad y naturaleza a sus espacios.", order: 2 },
  { id: 4, icon: "Columns3", title: "MOLDURAS Y ACABADOS", subtitle: "MDF y madera sólida", desc: "Fabricamos la moldura exacta que tu proyecto necesita. Personalización total en medidas y colores.", order: 3 },
  { id: 5, icon: "Zap", title: "TECNOLOGÍA Y CONFORT", subtitle: "Repisas y puertos ocultos", desc: "Integramos tecnología en tu mobiliario: multicontactos empotrados, consolas traseras y más.", order: 4 },
];

/**
 * Franja compacta de diferenciadores de servicio.
 * Muestra icono + título + subtítulo en una grilla horizontal.
 * Al hover, la tarjeta invierte colores (fondo oscuro, texto claro).
 */
const ServicesSection = ({ services }: { services?: IService[] | null }) => {
  const list = services && services.length > 0 ? services : DEFAULT_SERVICES;

  return (
    <section id="ventas" className="bg-background border-y border-border">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
        {list.map((service, i) => {
          const Icon = ICON_MAP[service.icon] ?? Layers;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-background px-6 py-8 md:px-8 md:py-10 group hover:bg-foreground transition-colors duration-500"
            >
              <Icon
                size={22}
                className="text-primary mb-4 group-hover:text-primary transition-colors"
                strokeWidth={1.5}
              />
              <h3 className="text-xs tracking-[0.18em] font-bold text-foreground group-hover:text-background transition-colors leading-snug mb-1">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-xs group-hover:text-background/50 transition-colors">
                {service.subtitle}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesSection;