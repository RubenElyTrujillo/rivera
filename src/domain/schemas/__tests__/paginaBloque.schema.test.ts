import { describe, it, expect } from "@jest/globals";
import {
  HeroConfigSchema,
  TextConfigSchema,
  TextImageConfigSchema,
  GalleryConfigSchema,
  QuoteConfigSchema,
  CtaConfigSchema,
  SpacerConfigSchema,
  VideoConfigSchema,
  parseBlockConfig,
} from "@/domain/schemas/paginaBloque.schema";

describe("block config schemas", () => {
  it("HERO requires imageUrl and title", () => {
    expect(HeroConfigSchema.safeParse({}).success).toBe(false);
    expect(HeroConfigSchema.safeParse({ imageUrl: "/x.jpg", title: "T", height: "md" }).success).toBe(true);
  });

  it("TEXT requires html string", () => {
    expect(TextConfigSchema.safeParse({ html: "<p>hi</p>" }).success).toBe(true);
    expect(TextConfigSchema.safeParse({}).success).toBe(false);
  });

  it("TEXT_IMAGE requires imageSide left|right", () => {
    const ok = TextImageConfigSchema.safeParse({ imageUrl: "/x.jpg", imageSide: "left", html: "<p>x</p>" });
    expect(ok.success).toBe(true);
    const bad = TextImageConfigSchema.safeParse({ imageUrl: "/x.jpg", imageSide: "center", html: "<p>x</p>" });
    expect(bad.success).toBe(false);
  });

  it("GALLERY columns limited to 2|3|4", () => {
    expect(GalleryConfigSchema.safeParse({ images: ["/a.jpg"], columns: 3 }).success).toBe(true);
    expect(GalleryConfigSchema.safeParse({ images: ["/a.jpg"], columns: 5 }).success).toBe(false);
  });

  it("QUOTE requires text only", () => {
    expect(QuoteConfigSchema.safeParse({ text: "Hi" }).success).toBe(true);
    expect(QuoteConfigSchema.safeParse({}).success).toBe(false);
  });

  it("CTA requires linkType + linkHref + buttonText", () => {
    const ok = CtaConfigSchema.safeParse({
      title: "X", buttonText: "Ver", linkType: "internal", linkHref: "/p/nosotros", style: "primary",
    });
    expect(ok.success).toBe(true);
  });

  it("SPACER size is sm|md|lg", () => {
    expect(SpacerConfigSchema.safeParse({ size: "md" }).success).toBe(true);
    expect(SpacerConfigSchema.safeParse({ size: "xl" }).success).toBe(false);
  });

  it("VIDEO requires url", () => {
    expect(VideoConfigSchema.safeParse({ url: "https://youtube.com/watch?v=x" }).success).toBe(true);
    expect(VideoConfigSchema.safeParse({}).success).toBe(false);
  });

  it("parseBlockConfig dispatches by type and returns parsed config", () => {
    const parsed = parseBlockConfig("HERO", { imageUrl: "/x.jpg", title: "T", height: "md" });
    expect(parsed.success).toBe(true);
  });

  it("parseBlockConfig fails for unknown type", () => {
    const parsed = parseBlockConfig("UNKNOWN", {});
    expect(parsed.success).toBe(false);
  });
});
