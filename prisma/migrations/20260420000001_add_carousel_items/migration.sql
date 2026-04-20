-- CreateTable
CREATE TABLE "CarouselItem" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarouselItem_pkey" PRIMARY KEY ("id")
);
