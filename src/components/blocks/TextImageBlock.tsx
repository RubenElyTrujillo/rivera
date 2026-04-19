import type { TextImageConfig } from "@/domain/schemas/paginaBloque.schema";

export default function TextImageBlock({ config }: { config: TextImageConfig }) {
  const imageFirst = config.imageSide === "left";
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
      <div className={imageFirst ? "md:order-1" : "md:order-2"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.imageUrl} alt={config.title ?? ""} className="w-full h-auto rounded-lg object-cover" />
      </div>
      <div className={imageFirst ? "md:order-2" : "md:order-1"}>
        {config.title && <h2 className="text-3xl font-bold mb-4">{config.title}</h2>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: config.html }} />
      </div>
    </section>
  );
}
