import type { SpacerConfig } from "@/domain/schemas/paginaBloque.schema";

const SIZES = { sm: "h-8", md: "h-16", lg: "h-32" } as const;

export default function SpacerBlock({ config }: { config: SpacerConfig }) {
  return <div className={SIZES[config.size]} />;
}
