import type { HeroConfig } from "@/domain/schemas/paginaBloque.schema";

const HEIGHTS = { sm: "h-[320px]", md: "h-[480px]", lg: "h-[640px]" } as const;

export default function HeroBlock({ config }: { config: HeroConfig }) {
  return (
    <section
      className={`relative w-full ${HEIGHTS[config.height]} flex items-center justify-center text-white bg-cover bg-center`}
      style={{ backgroundImage: `url(${config.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative text-center px-6 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{config.title}</h1>
        {config.subtitle && <p className="text-lg md:text-xl opacity-90">{config.subtitle}</p>}
      </div>
    </section>
  );
}
