import type { CtaConfig } from "@/domain/schemas/paginaBloque.schema";

export default function CtaBlock({ config }: { config: CtaConfig }) {
  const isExternal = config.linkType === "external";
  const className = config.style === "primary"
    ? "bg-[hsl(20,60%,45%)] text-white hover:bg-[hsl(20,60%,40%)]"
    : "bg-white text-[hsl(20,60%,45%)] border border-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,96%)]";

  return (
    <section className="max-w-3xl mx-auto px-6 py-14 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">{config.title}</h2>
      <a
        href={config.linkHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`inline-block px-8 py-3 rounded-md font-semibold transition-colors ${className}`}
      >
        {config.buttonText}
      </a>
    </section>
  );
}
