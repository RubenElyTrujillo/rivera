import Image from "next/image";
import * as motion from "motion/react-client";
import type { IHeroContent } from "@/domain/types";

interface HeroSectionProps {
    heroImage: string;
    content?: IHeroContent | null;
}

const HeroSection = ({ heroImage, content }: HeroSectionProps) => {
    const subtitle = content?.subtitle ?? "Soluciones integrales en acabados";
    const titleLine1 = content?.titleLine1 ?? "SUPERFICIES";
    const titleLine2 = content?.titleLine2 ?? "SIN LÍMITE";
    const description = content?.description ?? "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.";
    const image = content?.imageUrl ?? heroImage;

    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden p-2.5">
            <div className="absolute inset-0">
                <Image
                    src={image}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/60" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
                        {subtitle}
                    </p>
                    <h1 className="text-white text-5xl md:text-7xl lg:text-[6rem] font-bold leading-[0.9] tracking-tight max-w-4xl">
                        {titleLine1}
                        <br />
                        <span className="text-amber-700">{titleLine2}</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg mt-6 max-w-lg font-light leading-relaxed">
                        {description}
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;