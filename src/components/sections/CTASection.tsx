import * as motion from "motion/react-client";
import { ArrowRight, MessageCircle } from "lucide-react";

interface CTASectionProps {
  /** Número de WhatsApp sin el símbolo + (ej. "525629671869"). */
  whatsappPhone?: string;
}

/**
 * Sección de llamado a la acción entre proyectos y catálogo.
 * Invita al visitante a cotizar por WhatsApp o explorar el portafolio de Rivera.
 */
const CTASection = ({ whatsappPhone = "525629671869" }: CTASectionProps) => {
  const waLink = `https://wa.me/${whatsappPhone}?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20proyecto`;

  return (
    <section className="py-24 md:py-36 px-8 md:px-20 bg-foreground">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl"
      >
        <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-6">
          HABLEMOS DE TU PROYECTO
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-background leading-tight mb-8">
          ¿Tienes un
          <br />
          proyecto en mente?
        </h2>
        <p className="text-background/50 text-lg leading-relaxed max-w-xl mb-12">
          Nuestro equipo te asesora sin costo. Desde la selección del material
          hasta la instalación final, estamos contigo en cada paso.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={16} />
            Cotizar por WhatsApp
          </a>
          <a
            href="#espacios"
            className="inline-flex items-center gap-3 border border-background/20 text-background/70 px-8 py-4 text-sm font-semibold tracking-[0.15em] uppercase hover:border-background hover:text-background transition-colors"
          >
            Ver nuestro trabajo
            <ArrowRight size={14} />
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
