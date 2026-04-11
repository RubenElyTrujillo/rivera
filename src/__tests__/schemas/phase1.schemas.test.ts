import { CategorySchema } from "@/domain/schemas/category.schema";
import { NavItemSchema } from "@/domain/schemas/navItem.schema";
import { PageSectionSchema } from "@/domain/schemas/pageSection.schema";
import { FinishSchema } from "@/domain/schemas/finish.schema";
import { MaterialSchema } from "@/domain/schemas/material.schema";

// ── CategorySchema ────────────────────────────────────────────────────────────

describe("CategorySchema", () => {
  it("passes with valid input", () => {
    const result = CategorySchema.safeParse({ name: "Pisos", order: 1 });
    expect(result.success).toBe(true);
  });

  it("fails when name is missing", () => {
    const result = CategorySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("defaults coverImage to empty string", () => {
    const result = CategorySchema.safeParse({ name: "Pisos" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.coverImage).toBe("");
  });

  it("defaults icon to empty string", () => {
    const result = CategorySchema.safeParse({ name: "Pisos" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.icon).toBe("");
  });

  it("defaults order to 0", () => {
    const result = CategorySchema.safeParse({ name: "Pisos" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.order).toBe(0);
  });
});

// ── NavItemSchema ─────────────────────────────────────────────────────────────

describe("NavItemSchema", () => {
  it("passes with valid input", () => {
    const result = NavItemSchema.safeParse({ label: "Inicio", href: "/" });
    expect(result.success).toBe(true);
  });

  it("fails when label is missing", () => {
    const result = NavItemSchema.safeParse({ href: "/" });
    expect(result.success).toBe(false);
  });

  it("defaults parentId to null", () => {
    const result = NavItemSchema.safeParse({ label: "Inicio" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.parentId).toBeNull();
  });

  it("defaults visible to true", () => {
    const result = NavItemSchema.safeParse({ label: "Inicio" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.visible).toBe(true);
  });
});

// ── PageSectionSchema ─────────────────────────────────────────────────────────

describe("PageSectionSchema", () => {
  it("passes with valid input", () => {
    const result = PageSectionSchema.safeParse({ type: "HERO" });
    expect(result.success).toBe(true);
  });

  it("fails when type is missing", () => {
    const result = PageSectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("fails when type is not a valid enum value", () => {
    const result = PageSectionSchema.safeParse({ type: "invalid-section" });
    expect(result.success).toBe(false);
  });

  it("defaults config to '{}'", () => {
    const result = PageSectionSchema.safeParse({ type: "CONTACT" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.config).toBe("{}");
  });

  it("defaults visible to true", () => {
    const result = PageSectionSchema.safeParse({ type: "CATALOG" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.visible).toBe(true);
  });
});

// ── FinishSchema new fields ───────────────────────────────────────────────────

describe("FinishSchema — new fields", () => {
  const base = {
    materialId: 1,
    collectionId: 1,
    name: "Roble Natural",
  };

  it("passes with all new fields provided", () => {
    const result = FinishSchema.safeParse({
      ...base,
      hoverImage: "https://cdn.example.com/hover.jpg",
      pdfUrl: "https://cdn.example.com/spec.pdf",
      waterRes: true,
    });
    expect(result.success).toBe(true);
  });

  it("fails when collectionId is missing", () => {
    const result = FinishSchema.safeParse({ materialId: 1, name: "Roble" });
    expect(result.success).toBe(false);
  });

  it("defaults waterRes to false", () => {
    const result = FinishSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.waterRes).toBe(false);
  });

  it("defaults hoverImage to empty string", () => {
    const result = FinishSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.hoverImage).toBe("");
  });

  it("defaults pdfUrl to empty string", () => {
    const result = FinishSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pdfUrl).toBe("");
  });
});

// ── MaterialSchema updates ────────────────────────────────────────────────────

describe("MaterialSchema — updated fields", () => {
  const base = { name: "Vinílico", order: 0 };

  it("passes with valid input", () => {
    const result = MaterialSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it("defaults categoryId to null", () => {
    const result = MaterialSchema.safeParse(base);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBeNull();
  });

  it("accepts a spec string of 10000 characters", () => {
    const result = MaterialSchema.safeParse({ ...base, spec: "x".repeat(10000) });
    expect(result.success).toBe(true);
  });

  it("rejects a spec string exceeding 10000 characters", () => {
    const result = MaterialSchema.safeParse({ ...base, spec: "x".repeat(10001) });
    expect(result.success).toBe(false);
  });

  it("accepts a valid categoryId integer", () => {
    const result = MaterialSchema.safeParse({ ...base, categoryId: 5 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBe(5);
  });
});
