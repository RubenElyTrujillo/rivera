import { useState, useEffect } from "react";
import Image from "next/image";
import * as motion from "motion/react-client";

const TopBar = () => {
    const [scrolled, setScrolled] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 100);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500 ${scrolled ? 'bg-background/90 backdrop-blur-md shadow-sm' : ''
                }`}
        >
            <div className="flex items-center gap-3 inset-0">
                <Image
                    src="/logos/CR.png"
                    alt="Comercializadora Rivera Logo"
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover"
                />
            </div>

            <button
                type="button"
                onClick={() => {
                    document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-semibold tracking-widest uppercase px-6 py-3 bg-foreground text-background hover:bg-primary transition-colors duration-300"
            >
                COTIZAR
            </button>
        </motion.header>
    );
};

export default TopBar;