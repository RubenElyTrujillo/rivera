import type { IHeroContent } from "./hero";
import type { IService } from "./service";
import type { ICatalogContent } from "./catalog";
import type { IContactInfo } from "./contact";
import type { IFooterContent } from "./footer";
import type { ISeoSettings } from "./seo";

/**
 * Conjunto de datos que recibe la página principal (index.tsx) via getServerSideProps.
 * Las categorías de espacios se pasan como prop separada (`spaceCategories`).
 */
export interface IPageData {
  hero: IHeroContent;
  services: IService[];
  catalog: ICatalogContent;
  contact: IContactInfo;
  footer: IFooterContent;
  seo: ISeoSettings;
}
