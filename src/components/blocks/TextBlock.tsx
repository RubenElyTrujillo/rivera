import type { TextConfig } from "@/domain/schemas/paginaBloque.schema";

export default function TextBlock({ config }: { config: TextConfig }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: config.html }} />
    </section>
  );
}
