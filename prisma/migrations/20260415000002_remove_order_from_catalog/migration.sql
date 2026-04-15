-- Remove redundant `order` column from Categoria, Subcategoria, and Producto.
-- Navigation order is managed via NavItem tree instead.

ALTER TABLE "Categoria"    DROP COLUMN "order";
ALTER TABLE "Subcategoria" DROP COLUMN "order";
ALTER TABLE "Producto"     DROP COLUMN "order";
