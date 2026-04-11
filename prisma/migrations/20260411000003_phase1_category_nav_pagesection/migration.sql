-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 1: Category, NavItem, PageSection + extend Material / MaterialFinish
-- ─────────────────────────────────────────────────────────────────────────────

-- CreateTable Category
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateTable MaterialCollection
CREATE TABLE "MaterialCollection" (
    "id" SERIAL NOT NULL,
    "materialId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "desc" TEXT NOT NULL DEFAULT '',
    "coverImage" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MaterialCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCollection_materialId_slug_key" ON "MaterialCollection"("materialId", "slug");

-- AddForeignKey MaterialCollection -> Material
ALTER TABLE "MaterialCollection" ADD CONSTRAINT "MaterialCollection_materialId_fkey"
    FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable MaterialFinishImage
CREATE TABLE "MaterialFinishImage" (
    "id" SERIAL NOT NULL,
    "finishId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MaterialFinishImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey MaterialFinishImage -> MaterialFinish
ALTER TABLE "MaterialFinishImage" ADD CONSTRAINT "MaterialFinishImage_finishId_fkey"
    FOREIGN KEY ("finishId") REFERENCES "MaterialFinish"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable NavItem
CREATE TABLE "NavItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "parentId" INTEGER,
    CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey NavItem self-reference
ALTER TABLE "NavItem" ADD CONSTRAINT "NavItem_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "NavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable PageSection
CREATE TABLE "PageSection" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- ─── Extend Material ──────────────────────────────────────────────────────────

-- Add slug column (populate from id for existing rows, then enforce NOT NULL + UNIQUE)
ALTER TABLE "Material" ADD COLUMN "slug" TEXT;
UPDATE "Material" SET "slug" = CAST("id" AS TEXT) WHERE "slug" IS NULL;
ALTER TABLE "Material" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Material_slug_key" ON "Material"("slug");

-- Make subtitle / desc / spec nullable-safe with defaults (they were NOT NULL before)
ALTER TABLE "Material" ALTER COLUMN "subtitle" SET DEFAULT '';
ALTER TABLE "Material" ALTER COLUMN "desc" SET DEFAULT '';
ALTER TABLE "Material" ALTER COLUMN "spec" SET DEFAULT '';

-- Add categoryId (optional FK to Category)
ALTER TABLE "Material" ADD COLUMN "categoryId" INTEGER;

-- AddForeignKey Material -> Category
ALTER TABLE "Material" ADD CONSTRAINT "Material_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop legacy JSON-string collections column
ALTER TABLE "Material" DROP COLUMN "collections";

-- ─── Extend MaterialFinish ────────────────────────────────────────────────────

-- Add slug column
ALTER TABLE "MaterialFinish" ADD COLUMN "slug" TEXT;
UPDATE "MaterialFinish" SET "slug" = CAST("id" AS TEXT) WHERE "slug" IS NULL;
ALTER TABLE "MaterialFinish" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "MaterialFinish_slug_key" ON "MaterialFinish"("slug");

-- New spec / hover fields
ALTER TABLE "MaterialFinish" ADD COLUMN "hoverImage" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "desc"        TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "pdfUrl"      TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "thickness"   TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "useClass"    TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "waterRes"    BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MaterialFinish" ADD COLUMN "installType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "MaterialFinish" ADD COLUMN "warranty"    TEXT NOT NULL DEFAULT '';

-- Give previously NOT-NULL-without-default columns a default
ALTER TABLE "MaterialFinish" ALTER COLUMN "code"  SET DEFAULT '';
ALTER TABLE "MaterialFinish" ALTER COLUMN "image" SET DEFAULT '';

-- Add collectionId: create a default MaterialCollection for each material that has
-- finishes so existing rows are not orphaned, then enforce NOT NULL.
INSERT INTO "MaterialCollection" ("materialId", "name", "slug", "desc", "coverImage", "order")
SELECT DISTINCT m.id, 'Default', 'default', '', '', 0
FROM "Material" m
WHERE EXISTS (SELECT 1 FROM "MaterialFinish" mf WHERE mf."materialId" = m.id);

ALTER TABLE "MaterialFinish" ADD COLUMN "collectionId" INTEGER;

UPDATE "MaterialFinish" mf
SET "collectionId" = mc.id
FROM "MaterialCollection" mc
WHERE mc."materialId" = mf."materialId"
  AND mc."slug" = 'default';

-- Guard: remove any orphaned finishes that couldn't get a collectionId
-- (finishes whose materialId references a non-existent material)
DELETE FROM "MaterialFinish" WHERE "collectionId" IS NULL;

-- Make collectionId required
ALTER TABLE "MaterialFinish" ALTER COLUMN "collectionId" SET NOT NULL;

-- AddForeignKey MaterialFinish -> MaterialCollection
ALTER TABLE "MaterialFinish" ADD CONSTRAINT "MaterialFinish_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "MaterialCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop legacy text collection column
ALTER TABLE "MaterialFinish" DROP COLUMN "collection";

-- ─── FK Indexes (PostgreSQL does not auto-create these) ───────────────────────
CREATE INDEX "Material_categoryId_idx" ON "Material"("categoryId");
CREATE INDEX "MaterialFinish_materialId_idx" ON "MaterialFinish"("materialId");
CREATE INDEX "MaterialFinish_collectionId_idx" ON "MaterialFinish"("collectionId");
CREATE INDEX "MaterialFinishImage_finishId_idx" ON "MaterialFinishImage"("finishId");
CREATE INDEX "NavItem_parentId_idx" ON "NavItem"("parentId");
CREATE INDEX "SpaceProjectImage_spaceProjectId_idx" ON "SpaceProjectImage"("spaceProjectId");

