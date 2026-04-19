import type { VideoConfig } from "@/domain/schemas/paginaBloque.schema";

function toEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export default function VideoBlock({ config }: { config: VideoConfig }) {
  const src = toEmbedUrl(config.url);
  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={src}
          title={config.caption ?? "Video"}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {config.caption && <p className="text-center text-sm text-[hsl(0,0%,45%)] mt-3">{config.caption}</p>}
    </section>
  );
}
