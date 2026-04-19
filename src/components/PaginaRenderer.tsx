import type { IPaginaBloque } from "@/domain/types/pagina";
import { parseBlockConfig } from "@/domain/schemas/paginaBloque.schema";
import HeroBlock from "@/components/blocks/HeroBlock";
import TextBlock from "@/components/blocks/TextBlock";
import TextImageBlock from "@/components/blocks/TextImageBlock";
import GalleryBlock from "@/components/blocks/GalleryBlock";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import CtaBlock from "@/components/blocks/CtaBlock";
import SpacerBlock from "@/components/blocks/SpacerBlock";
import VideoBlock from "@/components/blocks/VideoBlock";

export default function PaginaRenderer({ blocks }: { blocks: IPaginaBloque[] }) {
  return (
    <>
      {blocks.map((b) => {
        if (!b.visible) return null;
        const raw = safeJSON(b.config);
        const parsed = parseBlockConfig(b.type, raw);
        if (!parsed.success) {
          return null;
        }
        const cfg = parsed.data as never;
        switch (b.type) {
          case "HERO":       return <HeroBlock key={b.id} config={cfg} />;
          case "TEXT":       return <TextBlock key={b.id} config={cfg} />;
          case "TEXT_IMAGE": return <TextImageBlock key={b.id} config={cfg} />;
          case "GALLERY":    return <GalleryBlock key={b.id} config={cfg} />;
          case "QUOTE":      return <QuoteBlock key={b.id} config={cfg} />;
          case "CTA":        return <CtaBlock key={b.id} config={cfg} />;
          case "SPACER":     return <SpacerBlock key={b.id} config={cfg} />;
          case "VIDEO":      return <VideoBlock key={b.id} config={cfg} />;
          default:           return null;
        }
      })}
    </>
  );
}

function safeJSON(s: string): unknown {
  try { return JSON.parse(s); } catch { return null; }
}
