-- CreateTable SpaceCategory
CREATE TABLE "SpaceCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SpaceCategory_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SpaceCategory_slug_key" ON "SpaceCategory"("slug");

-- Add completedAt to SpaceProject
ALTER TABLE "SpaceProject" ADD COLUMN "completedAt" TIMESTAMP(3);
