import type { GalleryConfig } from "@/domain/schemas/paginaBloque.schema";

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export default function GalleryBlock({ config }: { config: GalleryConfig }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <div className={`grid grid-cols-1 ${COLS[config.columns]} gap-4`}>
        {config.images.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={i} src={src} alt="" className="w-full h-64 object-cover rounded-lg" />
        ))}
      </div>
    </section>
  );
}
