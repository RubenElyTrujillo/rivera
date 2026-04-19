-- CreateTable
CREATE TABLE "Pagina" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaginaBloque" (
    "id" SERIAL NOT NULL,
    "paginaId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaginaBloque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pagina_slug_key" ON "Pagina"("slug");
CREATE INDEX "PaginaBloque_paginaId_order_idx" ON "PaginaBloque"("paginaId", "order");

-- AddForeignKey
ALTER TABLE "PaginaBloque"
  ADD CONSTRAINT "PaginaBloque_paginaId_fkey"
  FOREIGN KEY ("paginaId") REFERENCES "Pagina"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: Service link fields
ALTER TABLE "Service" ADD COLUMN "linkType" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "Service" ADD COLUMN "linkHref" TEXT;
