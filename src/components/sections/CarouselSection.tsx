"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as motion from "motion/react-client";
import type { ICarouselItem } from "@/domain/types";

interface CarouselSectionProps {
  items: ICarouselItem[];
}

function CarouselCard({ item }: { item: ICarouselItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex-shrink-0 w-52 md:w-60 lg:w-64 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-sm aspect-[3/4] bg-muted">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 208px, 256px"
        />

        {/* Hover overlay */}
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 12 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-foreground/80 flex flex-col justify-end p-4"
        >
          <p className="text-background text-sm font-bold tracking-wide leading-snug mb-1">
            {item.title}
          </p>
          {item.description && (
            <p className="text-background/75 text-xs leading-relaxed line-clamp-4">
              {item.description}
            </p>
          )}
        </motion.div>
      </div>

      <p className="mt-2 text-xs font-semibold tracking-wider uppercase text-foreground/60 truncate">
        {item.title}
      </p>
    </div>
  );
}

export default function CarouselSection({ items }: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section id="materiales" className="py-16 md:py-20 bg-background overflow-hidden">
      <div className="px-6 md:px-12 mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-foreground/40 mb-2">
            Nuestros Materiales
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            Explora nuestra colección
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60 hover:border-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60 hover:border-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-6 md:px-12 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <CarouselCard key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile arrows */}
      <div className="md:hidden flex items-center justify-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => scroll("left")}
          aria-label="Anterior"
          className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          aria-label="Siguiente"
          className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
