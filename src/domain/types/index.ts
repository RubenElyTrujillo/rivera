/**
 * Barrel de tipos de dominio.
 * Importa desde aquí para acceder a cualquier interfaz sin conocer su ubicación exacta.
 *
 * @example
 *   import type { IHeroContent, IService } from "@/domain/types";
 */
export type { IHeroContent } from "./hero";
export type { IHeroSlide, HeroPageConfig } from "./heroSlide";
export type { IService } from "./service";
// New catalog types
export type { ICategoria, ISubcategoria, IProducto, IProductoImagen } from "./catalog-new";
export type { INavItem } from "./navItem";
export type { IPageSection } from "./pageSection";
export type { ISpaceProject, ISpaceProjectImage } from "./space";
export type { ISpaceCategory } from "./spaceCategory";
export type { ICatalogContent } from "./catalog";
export type { IContactInfo } from "./contact";
export type { IFooterContent } from "./footer";
export type { ISeoSettings } from "./seo";
export type { IMedia } from "./media";
export type { JwtPayload } from "./auth";
export type { IPageData } from "./page";
