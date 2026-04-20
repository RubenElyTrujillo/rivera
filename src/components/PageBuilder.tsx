import type { IPageSection, IPageData, HeroPageConfig, ICarouselItem } from "@/domain/types";
import type { IProyecto } from "@/domain/types/catalog-new";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProductsSection from "@/components/sections/ShowroomSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import CTASection from "@/components/sections/CTASection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";
import CarouselSection from "@/components/sections/CarouselSection";

export interface PageBuilderData {
  pageData: IPageData;
  showShowroom: boolean;
  featuredProyectos?: IProyecto[];
  heroImageUrl: string;
  textureImageUrl: string;
  carouselItems?: ICarouselItem[];
}

interface PageBuilderProps {
  sections: IPageSection[];
  data: PageBuilderData;
}

/**
 * Maps each IPageSection record (from DB) to its corresponding
 * section component and renders them in order.
 * Unknown or unrecognised section types are silently skipped.
 */
export default function PageBuilder({ sections, data }: PageBuilderProps) {
  const { pageData, showShowroom, featuredProyectos = [], heroImageUrl, textureImageUrl, carouselItems = [] } = data;
  const { hero, services, catalog, contact } = pageData;

  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "HERO": {
            let heroConfig: HeroPageConfig | null = null;
            try {
              const parsed = JSON.parse(section.config ?? "{}") as HeroPageConfig;
              if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
                heroConfig = parsed;
              }
            } catch {
              // malformed config — fall back to static hero
            }
            return (
              <HeroSection
                key={section.id}
                heroImage={heroImageUrl}
                content={hero}
                slides={heroConfig?.slides}
                autoPlayMs={heroConfig?.autoPlayMs}
              />
            );
          }
          case "VENTAS":
            return <ServicesSection key={section.id} services={services} />;
          case "SHOWROOM":
            // Showroom visibility is also controlled by showShowroom from siteConfig,
            // independently of the section's `visible` flag in the DB.
            return showShowroom ? (
              <ProductsSection key={section.id} />
            ) : null;
          case "SPACES":
            // SpacesSection removed from home — legacy entries silently skipped
            return null;
          case "CATALOG":
            return (
              <CatalogSection
                key={section.id}
                textureImage={textureImageUrl}
                content={catalog}
              />
            );
          case "CONTACT":
            return <ContactSection key={section.id} contact={contact} />;
          case "CTA":
            return (
              <CTASection
                key={section.id}
                whatsappPhone={contact.whatsappPhone}
              />
            );
          case "FEATURED":
            return (
              <FeaturedProjectsSection
                key={section.id}
                proyectos={featuredProyectos}
              />
            );
          case "CAROUSEL":
            return <CarouselSection key={section.id} items={carouselItems} />;
          default:
            return null;
        }
      })}
    </>
  );
}
