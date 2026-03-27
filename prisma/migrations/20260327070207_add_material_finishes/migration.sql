-- CreateTable
CREATE TABLE "MaterialFinish" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "materialId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "collection" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL,
    "dims" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MaterialFinish_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Material" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "spec" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL DEFAULT '',
    "collections" TEXT NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Material" ("collections", "desc", "id", "name", "order", "spec", "subtitle") SELECT "collections", "desc", "id", "name", "order", "spec", "subtitle" FROM "Material";
DROP TABLE "Material";
ALTER TABLE "new_Material" RENAME TO "Material";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
