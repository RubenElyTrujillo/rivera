-- AddColumn description to SpaceProject
ALTER TABLE "SpaceProject" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';

-- CreateTable SpaceProjectImage
CREATE TABLE "SpaceProjectImage" (
    "id" SERIAL NOT NULL,
    "spaceProjectId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SpaceProjectImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SpaceProjectImage" ADD CONSTRAINT "SpaceProjectImage_spaceProjectId_fkey"
    FOREIGN KEY ("spaceProjectId") REFERENCES "SpaceProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable SiteConfig
CREATE TABLE "SiteConfig" (
    "id" SERIAL NOT NULL,
    "showMaterials" BOOLEAN NOT NULL DEFAULT true,
    "showShowroom"  BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "SiteConfig_pkey" PRIMARY KEY ("id")
);
