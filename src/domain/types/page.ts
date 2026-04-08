import type { IHeroContent } from "./hero";
import type { IService } from "./service";
import type { IMaterial } from "./material";
import type { ISpaceProject } from "./space";
import type { ICatalogContent } from "./catalog";
import type { IContactInfo } from "./contact";
import type { IFooterContent } from "./footer";
import type { ISeoSettings } from "./seo";

/**
 * Conjunto de datos que recibe la página principal (index.tsx) via getServerSideProps.
 * Agrupa todo el contenido necesario para renderizar el sitio en una sola carga.
 */
export interface IPageData {
  hero: IHeroContent;
  services: IService[];
  materials: IMaterial[];
  spaces: ISpaceProject[];
  catalog: ICatalogContent;
  contact: IContactInfo;
  footer: IFooterContent;
  seo: ISeoSettings;
}
