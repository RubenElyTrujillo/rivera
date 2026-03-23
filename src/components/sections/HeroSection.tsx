import * as motion from "motion/react-client";

const HeroSection = ({ heroImage }: { heroImage: string }) => {
    return (
        <section id="hero" className="relative h-screen w-full overflow-hidden p-2.5">
            <div className="absolute inset-0">
                <img
                    src={heroImage}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-20">
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
                        Soluciones integrales en acabados
                    </p>
                    <h1 className="text-white text-5xl md:text-7xl lg:text-[6rem] font-bold leading-[0.9] tracking-tight max-w-4xl">
                        SUPERFICIES
                        <br />
                        <span className="text-amber-700">SIN LÍMITE</span>
                    </h1>
                    <p className="text-white/60 text-base md:text-lg mt-6 max-w-lg font-light leading-relaxed">
                        Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;