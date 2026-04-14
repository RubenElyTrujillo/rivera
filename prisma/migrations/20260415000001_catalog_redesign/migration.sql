-- Drop old tables (order: child first)
DROP TABLE IF EXISTS "MaterialFinishImage";
DROP TABLE IF EXISTS "MaterialFinish";
DROP TABLE IF EXISTS "MaterialCollection";
DROP TABLE IF EXISTS "Material";
DROP TABLE IF EXISTS "Category";

-- Create Categoria
CREATE TABLE "Categoria" (
  "id"          SERIAL PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "coverImage"  TEXT,
  "description" TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX "Categoria_slug_key" ON "Categoria"("slug");

-- Create Subcategoria
CREATE TABLE "Subcategoria" (
  "id"          SERIAL PRIMARY KEY,
  "categoriaId" INTEGER NOT NULL,
  "name"        TEXT NOT NULL,
  "slug"        TEXT NOT NULL,
  "coverImage"  TEXT,
  "description" TEXT,
  "order"       INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Subcategoria_categoriaId_fkey"
    FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Subcategoria_slug_key" ON "Subcategoria"("slug");
CREATE INDEX "Subcategoria_categoriaId_idx" ON "Subcategoria"("categoriaId");

-- Create Producto
CREATE TABLE "Producto" (
  "id"             SERIAL PRIMARY KEY,
  "subcategoriaId" INTEGER NOT NULL,
  "name"           TEXT NOT NULL,
  "slug"           TEXT NOT NULL,
  "coverImage"     TEXT,
  "hoverImage"     TEXT,
  "shortDesc"      TEXT,
  "htmlContent"    TEXT,
  "order"          INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Producto_subcategoriaId_fkey"
    FOREIGN KEY ("subcategoriaId") REFERENCES "Subcategoria"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Producto_slug_key" ON "Producto"("slug");
CREATE INDEX "Producto_subcategoriaId_idx" ON "Producto"("subcategoriaId");

-- Create ProductoImagen
CREATE TABLE "ProductoImagen" (
  "id"         SERIAL PRIMARY KEY,
  "productoId" INTEGER NOT NULL,
  "url"        TEXT NOT NULL,
  "caption"    TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductoImagen_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE CASCADE
);
CREATE INDEX "ProductoImagen_productoId_idx" ON "ProductoImagen"("productoId");
