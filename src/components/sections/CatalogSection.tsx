import Image from 'next/image';
import * as motion from 'motion/react-client';
import { Download } from 'lucide-react';

const CATALOG_URL = '/CR%20CATALOGO.pdf';

const CatalogSection = ({ textureImage }: { textureImage: string }) => {
    return (
        <section id="catalogo" className="relative py-24 md:py-36 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src={textureImage}
                    alt="Textura de madera de ingeniería en detalle macro mostrando la calidad del material"
                    fill
                    sizes="100vw"
                    className="object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-foreground/90" />
            </div>

            <div className="relative z-10 px-8 md:px-20 text-center max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-3">
                        FICHA TÉCNICA
                    </p>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-background leading-tight mb-6">
                        Catálogo completo
                    </h2>
                    <p className="text-background/60 text-base md:text-lg leading-relaxed mb-12 max-w-lg mx-auto">
                        Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.
                    </p>

                    <a
                        href={CATALOG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary/90 transition-colors"
                    >
                        <Download size={18} />
                        DESCARGAR CATÁLOGO PDF
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

export default CatalogSection;