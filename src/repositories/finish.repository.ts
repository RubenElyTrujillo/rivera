import { db } from "@/infrastructure/db/client";
import { toSlug } from "@/lib/toSlug";
import type { IMaterialFinish } from "@/domain/types/material";
import type { FinishInput } from "@/domain/schemas/finish.schema";

const WITH_IMAGES = {
  images: { orderBy: { order: "asc" as const } },
};

export const finishRepository = {
  async findAll(): Promise<IMaterialFinish[]> {
    const rows = await db.materialFinish.findMany({
      orderBy: [{ materialId: "asc" }, { order: "asc" }],
      include: WITH_IMAGES,
    });
    return rows as unknown as IMaterialFinish[];
  },

  async findByMaterial(materialId: number): Promise<IMaterialFinish[]> {
    const rows = await db.materialFinish.findMany({
      where: { materialId },
      orderBy: { order: "asc" },
      include: WITH_IMAGES,
    });
    return rows as unknown as IMaterialFinish[];
  },

  async findBySlug(slug: string): Promise<IMaterialFinish | null> {
    const row = await db.materialFinish.findUnique({
      where: { slug },
      include: WITH_IMAGES,
    });
    return row ? (row as unknown as IMaterialFinish) : null;
  },

  async findByCollection(collectionId: number): Promise<IMaterialFinish[]> {
    const rows = await db.materialFinish.findMany({
      where: { collectionId },
      orderBy: { order: "asc" },
      include: WITH_IMAGES,
    });
    return rows as unknown as IMaterialFinish[];
  },

  async create(input: FinishInput): Promise<IMaterialFinish> {
    const row = await db.materialFinish.create({
      data: {
        materialId:   input.materialId,
        collectionId: input.collectionId,
        name:         input.name,
        slug:         toSlug(input.name),
        code:         input.code,
        image:        input.image,
        hoverImage:   input.hoverImage,
        dims:         input.dims,
        desc:         input.desc,
        order:        input.order,
        pdfUrl:       input.pdfUrl,
        thickness:    input.thickness,
        useClass:     input.useClass,
        waterRes:     input.waterRes,
        installType:  input.installType,
        warranty:     input.warranty,
        specMd:       input.specMd,
      },
      include: WITH_IMAGES,
    });
    return row as unknown as IMaterialFinish;
  },

  async update(id: number, input: Partial<FinishInput>): Promise<IMaterialFinish> {
    const row = await db.materialFinish.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name, slug: toSlug(input.name) }),
        ...(input.collectionId !== undefined && { collectionId: input.collectionId }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.image !== undefined && { image: input.image }),
        ...(input.hoverImage !== undefined && { hoverImage: input.hoverImage }),
        ...(input.dims !== undefined && { dims: input.dims }),
        ...(input.desc !== undefined && { desc: input.desc }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.pdfUrl !== undefined && { pdfUrl: input.pdfUrl }),
        ...(input.thickness !== undefined && { thickness: input.thickness }),
        ...(input.useClass !== undefined && { useClass: input.useClass }),
        ...(input.waterRes !== undefined && { waterRes: input.waterRes }),
        ...(input.installType !== undefined && { installType: input.installType }),
        ...(input.warranty !== undefined && { warranty: input.warranty }),
        ...(input.specMd !== undefined && { specMd: input.specMd }),
      },
      include: WITH_IMAGES,
    });
    return row as unknown as IMaterialFinish;
  },

  async delete(id: number): Promise<void> {
    await db.materialFinish.delete({ where: { id } });
  },

  async addImage(finishId: number, url: string, caption = "", order = 0) {
    return db.materialFinishImage.create({
      data: { finishId, url, caption, order },
    });
  },

  async deleteImage(imageId: number): Promise<void> {
    await db.materialFinishImage.delete({ where: { id: imageId } });
  },
};
