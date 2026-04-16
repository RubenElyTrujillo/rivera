-- CreateTable
CREATE TABLE "Proyecto" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "colonia" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "htmlContent" TEXT,
    "coverImage" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "ambientes" TEXT NOT NULL DEFAULT '[]',
    "area" INTEGER,
    "subcategoriaId" INTEGER,
    "materialLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proyecto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProyectoImagen" (
    "id" SERIAL NOT NULL,
    "proyectoId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProyectoImagen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proyecto_slug_key" ON "Proyecto"("slug");
CREATE INDEX "Proyecto_featured_order_idx" ON "Proyecto"("featured", "order");
CREATE INDEX "Proyecto_subcategoriaId_idx" ON "Proyecto"("subcategoriaId");
CREATE INDEX "ProyectoImagen_proyectoId_idx" ON "ProyectoImagen"("proyectoId");

-- AddForeignKey
ALTER TABLE "Proyecto" ADD CONSTRAINT "Proyecto_subcategoriaId_fkey" FOREIGN KEY ("subcategoriaId") REFERENCES "Subcategoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProyectoImagen" ADD CONSTRAINT "ProyectoImagen_proyectoId_fkey" FOREIGN KEY ("proyectoId") REFERENCES "Proyecto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
