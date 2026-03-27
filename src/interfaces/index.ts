// ─── Tipos que usan los componentes del sitio público ────────────────────────

export interface IHeroContent {
  subtitle: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  imageUrl: string;
}

export interface IService {
  id: number;
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  order: number;
}

export interface IMaterialFinish {
  id: number;
  materialId: number;
  name: string;
  code: string;
  collection: string;
  image: string;
  dims: string;
  order: number;
}

export interface IMaterial {
  id: number;
  name: string;
  subtitle: string;
  desc: string;
  spec: string;
  coverImage: string;
  collections: string[]; // parseado de JSON
  order: number;
  finishes: IMaterialFinish[];
}

export interface ISpaceProject {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  order: number;
}

export interface ICatalogContent {
  title: string;
  description: string;
  pdfUrl: string;
  buttonText: string;
}

export interface IContactInfo {
  whatsappPhone: string;
  phone1: string;
  phone2: string;
  email: string;
  hoursText: string;
  surfaceOptions: string[]; // parseado de JSON
}

export interface IFooterContent {
  tagline: string;
  services: string[]; // parseado de JSON
}

export interface ISeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogImageUrl: string;
}

// ─── Tipo para los props de la página index ───────────────────────────────────

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

// ─── Media ────────────────────────────────────────────────────────────────────

export interface IMedia {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}
