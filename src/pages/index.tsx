import type { GetServerSideProps } from "next";
import Head from "next/head";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import MaterialLabSection from "@/components/sections/MaterialLabSection";
import ShowroomSection from "@/components/sections/ShowroomSection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";
import type { IPageData, ISpaceCategory } from "@/domain/types";
import { db } from "@/lib/db";
import { siteConfigRepository, type ISiteConfig } from "@/repositories/siteConfig.repository";
import { spaceCategoryRepository } from "@/repositories/spaceCategory.repository";

const IMAGES = {
  hero: '/images/5ab8b3a15_generated_f21e3e55.png',
  texture: '/images/806a852e2_generated_7961075f.png',
  wallCladding: '/images/7219abb30_generated_c7c0b4a0.png',
  deck: '/images/fc7bd1af6_generated_345964df.png',
  restoration: '/images/6a78b550c_generated_281d3b94.png',
  blinds: '/images/0ebc9e79a_generated_56d5f617.png',
};

export const getServerSideProps: GetServerSideProps<{ pageData: IPageData; siteConfig: ISiteConfig; spaceCategories: ISpaceCategory[] }> = async () => {
  const [hero, services, materials, catalog, contact, footer, seo, siteConfig, spaceCategories] = await Promise.all([
    db.heroContent.findFirst(),
    db.service.findMany({ orderBy: { order: "asc" } }),
    db.material.findMany({ orderBy: { order: "asc" }, include: { finishes: { orderBy: { order: "asc" } } } }),
    db.catalogContent.findFirst(),
    db.contactInfo.findFirst(),
    db.footerContent.findFirst(),
    db.seoSettings.findFirst(),
    siteConfigRepository.get(),
    spaceCategoryRepository.findAll(),
  ]);

  const pageData: IPageData = {
    hero: hero ?? {
      subtitle: "Soluciones integrales en acabados",
      titleLine1: "SUPERFICIES",
      titleLine2: "SIN LÍMITE",
      description: "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.",
      imageUrl: IMAGES.hero,
    },
    services: services ?? [],
    materials: materials
      ? materials.map((m) => ({
          ...m,
          collections: (() => { try { return JSON.parse(m.collections) as string[]; } catch { return []; } })(),
        }))
      : [],
    catalog: catalog ?? {
      title: "Catálogo completo",
      description: "Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.",
      pdfUrl: "/CR%20CATALOGO.pdf",
      buttonText: "DESCARGAR CATÁLOGO PDF",
    },
    contact: contact
      ? { ...contact, surfaceOptions: (() => { try { return JSON.parse(contact.surfaceOptions) as string[]; } catch { return []; } })() }
      : {
          whatsappPhone: "525629671869",
          phone1: "+52 56 29 67 18 69",
          phone2: "+52 55 79 16 78 44",
          email: "jorgeri_1990@hotmail.com",
          hoursText: "Lunes a Viernes\n9:00 AM — 10:00 PM",
          surfaceOptions: [],
        },
    footer: footer
      ? { ...footer, services: (() => { try { return JSON.parse(footer.services) as string[]; } catch { return []; } })() }
      : {
          tagline: "Soluciones integrales en acabados y decoración de interiores.",
          services: [],
        },
    seo: seo ?? {
      title: "Comercializadora Rivera | Pisos, Recubrimientos y Restauracion en CDMX",
      description: "Especialistas en pisos y acabados en CDMX: madera solida, madera de ingenieria, laminados, vinilicos SPC, deck sintetico, persianas, muros forrados, mantenimiento y restauracion profesional.",
      keywords: "pisos y recubrimientos, pisos de madera",
      ogImageUrl: "",
    },
  };

  return { props: { pageData, siteConfig, spaceCategories } };
};

const SEO_TITLE =
  "Comercializadora Rivera | Pisos, Recubrimientos y Restauracion en CDMX";

const SEO_DESCRIPTION =
  "Especialistas en pisos y acabados en CDMX: madera solida, madera de ingenieria, laminados, vinilicos SPC, deck sintetico, persianas, muros forrados, mantenimiento y restauracion profesional.";

const SEO_KEYWORDS = [
  "pisos y recubrimientos",
  "pisos de madera",
  "madera de ingenieria",
  "pisos laminados",
  "pisos vinilicos spc",
  "deck sintetico",
  "lambrines",
  "muros forrados",
  "persianas y cortinas",
  "mantenimiento de pisos",
  "restauracion de pisos",
  "pulido de madera",
  "pulido de marmol y granito",
  "molduras y acabados",
  "instalacion de pisos en cdmx",
].join(", ");

export default function Home({ pageData, siteConfig, spaceCategories }: { pageData: IPageData; siteConfig: ISiteConfig; spaceCategories: ISpaceCategory[] }) {
  const { hero, services, materials, catalog, contact, footer, seo } = pageData;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const pageUrl = siteUrl ? `${siteUrl}/` : undefined;
  const ogImageSrc = seo.ogImageUrl || IMAGES.hero;
  const ogImage = siteUrl && ogImageSrc.startsWith("/") ? `${siteUrl}${ogImageSrc}` : ogImageSrc;

  const seoTitle = seo.title || SEO_TITLE;
  const seoDescription = seo.description || SEO_DESCRIPTION;
  const seoKeywords = seo.keywords || SEO_KEYWORDS;
  const heroImageUrl = hero.imageUrl || IMAGES.hero;

  const seoGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": pageUrl ? `${pageUrl}#localbusiness` : "#localbusiness",
        name: "Comercializadora Rivera",
        description: seoDescription,
        image: ogImage,
        url: pageUrl,
        telephone: [contact.whatsappPhone ? `+${contact.whatsappPhone}` : "+525629671869"],
        email: contact.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ciudad de Mexico",
          addressCountry: "MX",
        },
        areaServed: ["Ciudad de Mexico", "Estado de Mexico"],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "22:00",
          },
        ],
        knowsAbout: [
          "Pisos y recubrimientos",
          "Madera solida",
          "Madera de ingenieria",
          "Laminados",
          "Vinilicos SPC",
          "Deck sintetico",
          "Persianas y cortinas",
          "Mantenimiento y restauracion",
        ],
      },
      {
        "@type": "Service",
        serviceType: "Instalacion y restauracion de pisos y acabados",
        provider: {
          "@id": pageUrl ? `${pageUrl}#localbusiness` : "#localbusiness",
        },
        areaServed: ["Ciudad de Mexico", "Estado de Mexico"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Servicios",
          itemListElement: services.map((s) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: s.title },
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Que tipos de pisos instalan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Instalamos madera solida, madera de ingenieria, laminados, vinilicos SPC y deck sintetico para interior y exterior.",
            },
          },
          {
            "@type": "Question",
            name: "Tambien ofrecen restauracion de superficies?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Si, realizamos restauracion y mantenimiento de madera, marmol, granito y decks con procesos de pulido, lijado y proteccion.",
            },
          },
          {
            "@type": "Question",
            name: "Trabajan en Ciudad de Mexico?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Atendemos proyectos en Ciudad de Mexico y zonas cercanas del Estado de Mexico.",
            },
          },
          {
            "@type": "Question",
            name: "Puedo solicitar cotizacion por WhatsApp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Si, puedes cotizar por WhatsApp y recibir asesoria personalizada para elegir materiales y acabados.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Comercializadora Rivera" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:image" content={ogImage} />
        {pageUrl ? <meta property="og:url" content={pageUrl} /> : null}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />

        {pageUrl ? <link rel="canonical" href={pageUrl} /> : null}
        <link rel="preload" as="image" href={heroImageUrl} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
        />
      </Head>

      <HeroSection heroImage={heroImageUrl} content={hero} />
      <ServicesSection services={services} />
      {siteConfig.showMaterials && <MaterialLabSection textureImage={IMAGES.texture} materials={materials} />}
      {siteConfig.showShowroom && <ShowroomSection />}
      <SpacesSection categories={spaceCategories} />
      <CatalogSection textureImage={IMAGES.texture} content={catalog} />
      <ContactSection contact={contact} />
      <FooterSection contact={contact} footer={footer} />
    </>
  );
}

