"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { IHeroSlide } from "@/domain/types";

interface HeroCarouselProps {
  slides: IHeroSlide[];
  autoPlayMs?: number;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction * 100 + "%",
  }),
  center: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction * -100 + "%",
  }),
};

const transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const HeroCarousel = ({ slides, autoPlayMs = 5000 }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const next = () => { setDirection(1); setActiveIndex((i) => (i + 1) % slides.length); };
  const prev = () => { setDirection(-1); setActiveIndex((i) => (i - 1 + slides.length) % slides.length); };

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = setInterval(next, autoPlayMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, paused, slides.length, autoPlayMs]);

  if (!slides.length) return null;

  const slide = slides[activeIndex];

  return (
    <section
      id="hero"
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
        >
          <Image
            src={slide.imageUrl}
            alt=""
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
        </motion.div>
      </AnimatePresence>

      {/* Text block */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-20">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-white/70 text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            {slide.subtitle}
          </p>
          <h1 className="text-white text-8xl md:text-[7rem] lg:text-[9rem] font-bold leading-[0.9] tracking-tight max-w-4xl">
            {slide.titleLine1}
            <br />
            <span className="text-amber-700">{slide.titleLine2}</span>
          </h1>
          <p className="text-white/90 text-base md:text-lg mt-6 max-w-lg font-light leading-relaxed">
            {slide.description}
          </p>
        </motion.div>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Diapositiva anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Siguiente diapositiva"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir a diapositiva ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === activeIndex ? "bg-white w-6" : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
