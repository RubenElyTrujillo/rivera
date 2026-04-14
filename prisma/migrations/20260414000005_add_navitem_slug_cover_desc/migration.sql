-- AlterTable: add slug, coverImage, description to NavItem
ALTER TABLE "NavItem" ADD COLUMN "slug" TEXT;
ALTER TABLE "NavItem" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "NavItem" ADD COLUMN "description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "NavItem_slug_key" ON "NavItem"("slug");
CREATE INDEX "NavItem_slug_idx" ON "NavItem"("slug");
