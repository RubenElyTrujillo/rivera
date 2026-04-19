import type { QuoteConfig } from "@/domain/schemas/paginaBloque.schema";

export default function QuoteBlock({ config }: { config: QuoteConfig }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-12 text-center">
      <blockquote className="text-2xl md:text-3xl italic text-[hsl(0,0%,20%)] mb-4">
        &ldquo;{config.text}&rdquo;
      </blockquote>
      {(config.author || config.role) && (
        <div className="text-sm text-[hsl(0,0%,45%)]">
          {config.author && <strong>{config.author}</strong>}
          {config.author && config.role && " — "}
          {config.role}
        </div>
      )}
    </section>
  );
}
