import Head from "next/head";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import MaterialLabSection from "@/components/sections/MaterialLabSection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";

const IMAGES = {
  hero: '/images/5ab8b3a15_generated_f21e3e55.png',
  texture: '/images/806a852e2_generated_7961075f.png',
  wallCladding: '/images/7219abb30_generated_c7c0b4a0.png',
  deck: '/images/fc7bd1af6_generated_345964df.png',
  restoration: '/images/6a78b550c_generated_281d3b94.png',
  blinds: '/images/0ebc9e79a_generated_56d5f617.png',
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

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const pageUrl = siteUrl ? `${siteUrl}/` : undefined;
  const ogImage = siteUrl ? `${siteUrl}${IMAGES.hero}` : IMAGES.hero;

  const seoGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": pageUrl ? `${pageUrl}#localbusiness` : "#localbusiness",
        name: "Comercializadora Rivera",
        description: SEO_DESCRIPTION,
        image: ogImage,
        url: pageUrl,
        telephone: ["+525629671869", "+525579167844"],
        email: "jorgeri_1990@hotmail.com",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ciudad de Mexico",
          addressCountry: "MX",
        },
        areaServed: ["Ciudad de Mexico", "Estado de Mexico"],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
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
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Pisos y recubrimientos" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Mantenimiento y restauracion" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Persianas y cortinas" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Molduras y acabados" } },
          ],
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
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Comercializadora Rivera" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:image" content={ogImage} />
        {pageUrl ? <meta property="og:url" content={pageUrl} /> : null}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <meta name="twitter:image" content={ogImage} />

        {pageUrl ? <link rel="canonical" href={pageUrl} /> : null}
        <link rel="preload" as="image" href={IMAGES.hero} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoGraph) }}
        />
      </Head>

      <HeroSection heroImage={IMAGES.hero} />
      <ServicesSection />
      <MaterialLabSection textureImage={IMAGES.texture} />
      <SpacesSection images={IMAGES} />
      <CatalogSection textureImage={IMAGES.texture} />
      <ContactSection />
      <FooterSection />
    </>
  );
}
